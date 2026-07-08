import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { Doctor } from '../data';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { 
  Search, Plus, Stethoscope, Phone, Mail, Award, MapPin, 
  Trash2, Edit, Save, Compass, Loader2, MessageSquare, Check, X, ExternalLink
} from 'lucide-react';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface DoctorsViewProps {
  onNavigate?: (tab: string) => void;
}

export default function DoctorsView({ onNavigate }: DoctorsViewProps) {
  const { doctors, exams, appointments, saveDoctor, deleteDoctor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchingCRM, setIsSearchingCRM] = useState(false);
  const [whatsappTemplateOpen, setWhatsappTemplateOpen] = useState<string | null>(null);
  const [selectedTemplateText, setSelectedTemplateText] = useState('Olá Dr., gostaria de tirar uma dúvida sobre meus exames.');
  const [crmSearchError, setCrmSearchError] = useState('');

  // 1. Compile all unique doctors from exams and appointments to form the "Passed" list automatically
  const extractedDoctors = useMemo(() => {
    const list: Record<string, { name: string; specialty: string; examCount: number; apptCount: number }> = {};
    
    // Scrape from exams
    exams.forEach(exam => {
      const docName = (exam.medicoSolicitante || '').trim();
      if (docName && docName.toLowerCase() !== 'não informado' && docName.toLowerCase() !== '—') {
        const key = docName.toLowerCase();
        if (!list[key]) {
          list[key] = {
            name: docName,
            specialty: exam.especialidadeMedica || 'Clínica Médica',
            examCount: 0,
            apptCount: 0
          };
        }
        list[key].examCount += 1;
      }
    });

    // Scrape from appointments
    appointments.forEach(appt => {
      const docName = (appt.doctor || '').trim();
      if (docName) {
        const key = docName.toLowerCase();
        if (!list[key]) {
          list[key] = {
            name: docName,
            specialty: appt.specialty || 'Clínica Médica',
            examCount: 0,
            apptCount: 0
          };
        }
        list[key].apptCount += 1;
      }
    });

    return Object.values(list);
  }, [exams, appointments]);

  // 2. Merge extracted list with registered Doctors table
  const allDoctors = useMemo(() => {
    // Start with registered ones
    const mergedList: Record<string, Doctor & { examCount: number; apptCount: number; isManual: boolean }> = {};
    
    doctors.forEach(doc => {
      const key = doc.name.toLowerCase().trim();
      mergedList[key] = {
        ...doc,
        examCount: 0,
        apptCount: 0,
        isManual: true
      };
    });

    // Layer the extracted metrics and create records for un-registered ones
    extractedDoctors.forEach(ext => {
      const key = ext.name.toLowerCase().trim();
      if (mergedList[key]) {
        mergedList[key].examCount = ext.examCount;
        mergedList[key].apptCount = ext.apptCount;
        // Keep registered metadata, but inherit higher counts
      } else {
        mergedList[key] = {
          id: `ext_${key.replace(/[^a-z0-9]/g, '_')}`,
          name: ext.name,
          crm: '',
          uf: 'SP',
          specialty: ext.specialty,
          phone: '',
          email: '',
          notes: '',
          userId: '',
          examCount: ext.examCount,
          apptCount: ext.apptCount,
          isManual: false
        };
      }
    });

    return Object.values(mergedList).sort((a, b) => b.examCount - a.examCount);
  }, [doctors, extractedDoctors]);

  // Filter list by search term
  const filteredDoctors = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return allDoctors.filter(d => 
      d.name.toLowerCase().includes(s) || 
      (d.crm || '').includes(s) || 
      (d.specialty || '').toLowerCase().includes(s)
    );
  }, [allDoctors, searchTerm]);

  // Automatic online lookup of CRM via Gemini API Route on server
  const handleCrmAutosearch = async () => {
    const searchName = editingDoctor?.name || '';
    const searchCRM = editingDoctor?.crm || '';
    const searchUF = editingDoctor?.uf || 'SP';

    if (!searchCRM && !searchName) {
      setCrmSearchError('Por favor, informe ao menos o Nome ou o CRM para realizar a consulta.');
      return;
    }

    setIsSearchingCRM(true);
    setCrmSearchError('');

    try {
      const response = await fetchWithRetry('/api/lookup-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crm: searchCRM,
          uf: searchUF,
          doctorName: searchName
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Falha na resposta do servidor.');
      }

      const res = await response.json();
      const data = res.data || res;
      
      if (data) {
        setEditingDoctor(prev => ({
          ...prev,
          name: data.name || prev?.name || '',
          crm: data.crm || prev?.crm || '',
          uf: data.uf || prev?.uf || 'SP',
          specialty: data.specialty || prev?.specialty || ''
        }));
        if (!res.found && !data.found) {
          setCrmSearchError('Dados estimados e mapeados com base nos laudos e proximidade clínica.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setCrmSearchError('Erro na busca automática. Preencha as informações manualmente.');
    } finally {
      setIsSearchingCRM(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingDoctor({
      name: '',
      crm: '',
      uf: 'SP',
      specialty: '',
      phone: '',
      email: '',
      notes: ''
    });
    setCrmSearchError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    setEditingDoctor({ ...doc });
    setCrmSearchError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor?.name) return;

    try {
      await saveDoctor(editingDoctor);
      setIsModalOpen(false);
      setEditingDoctor(null);
    } catch (err: any) {
      alert('Erro ao salvar cadastro do médico: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza de que deseja remover os metadados de cadastro deste médico?')) {
      try {
        await deleteDoctor(id);
      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  const startWhatsAppChat = (phoneNumber: string, doctorName: string) => {
    // Normalize phone number (Only digits, prepend 55 if length is 10/11)
    let cleaned = phoneNumber.replace(/\D/g, '');
    if (!cleaned) return;
    if (cleaned.length === 11 || cleaned.length === 10) {
      cleaned = '55' + cleaned;
    }
    
    // Interpolate doctor name into selected template
    const text = selectedTemplateText.replace('{medico}', doctorName);
    const url = `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setWhatsappTemplateOpen(null);
  };

  return (
    <div id="doctors-tab" className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header and Action Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Stethoscope className="text-teal-500" />
            Agenda e Cadastro de Médicos
          </h2>
          <p className="text-slate-500 text-sm">
            Gerencie o CRM, especialidades e visualize todos os médicos que já solicitaram seus exames arquivados.
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="h-10 px-4 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:shadow-md transition-all self-start md:self-auto"
        >
          <Plus size={16} />
          Cadastrar Médico
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">{allDoctors.length}</div>
            <div className="text-xs text-slate-500">Médicos Catalogados</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Award size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">
              {new Set(allDoctors.map(d => d.specialty).filter(Boolean)).size}
            </div>
            <div className="text-xs text-slate-500">Diferentes Especialidades</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Phone size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800">
              {allDoctors.filter(d => d.phone).length}
            </div>
            <div className="text-xs text-slate-500">Contatos Rápidos (WhatsApp)</div>
          </div>
        </div>
      </div>

      {/* Search Filter section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por nome do médico, CRM ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border-0 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Doctor Cards */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Nenhum médico localizado</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Nenhum médico coincide com a sua busca. experimente adicionar um médico manualmente ou importar novos PDFs de laudos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(doc => {
            const hasExams = doc.examCount > 0;
            const hasAppts = doc.apptCount > 0;

            return (
              <div 
                key={doc.id} 
                className="bg-white border border-slate-100 hover:border-teal-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 space-y-4 flex flex-col justify-between relative group"
              >
                <div className="space-y-3">
                  {/* Category specialty and source badge */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold group-hover:bg-teal-100 transition-colors">
                      <Stethoscope size={12} />
                      {doc.specialty || 'Geral'}
                    </span>
                    
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      doc.isManual ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {doc.isManual ? 'Cadastrado' : 'Detectado de Laudo'}
                    </span>
                  </div>

                  {/* Doctor Primary Info */}
                  <div>
                    <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {doc.crm ? `CRM ${doc.crm} - ${doc.uf}` : 'CRM não cadastrado'}
                    </p>
                  </div>

                  {/* Statistics / Context metadata */}
                  {(hasExams || hasAppts) && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs text-slate-500">
                      {hasExams && (
                        <div>
                          Exames solicitados: <strong className="text-slate-800">{doc.examCount}</strong>
                        </div>
                      )}
                      {hasAppts && (
                        <div>
                          Agenda médica: <strong className="text-slate-800">{doc.apptCount} consultas</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {doc.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border-l-2 border-teal-500">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Card Contact Actions Block */}
                <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp Action */}
                    {doc.phone ? (
                      <button
                        onClick={() => {
                          setWhatsappTemplateOpen(doc.id);
                        }}
                        className="flex-1 h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare size={14} />
                        Enviar WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Prompt user to add details by editing
                          const targetDoc: Doctor = doc.isManual ? doc : {
                            id: '',
                            name: doc.name,
                            crm: doc.crm,
                            uf: doc.uf,
                            specialty: doc.specialty,
                            phone: '',
                            email: '',
                            notes: '',
                            userId: ''
                          };
                          handleOpenEditModal(targetDoc);
                        }}
                        className="flex-1 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus size={14} />
                        Adicionar Contato
                      </button>
                    )}

                    {/* Secondary detailed edit methods */}
                    {doc.isManual ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="w-9 h-9 border border-slate-100 hover:bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 transition"
                          title="Editar Cadastro"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="w-9 h-9 border border-slate-100 hover:border-red-50 hover:bg-red-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 transition"
                          title="Remover Cadastro"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const targetDoc: Doctor = {
                            id: '',
                            name: doc.name,
                            crm: doc.crm,
                            uf: doc.uf,
                            specialty: doc.specialty,
                            phone: '',
                            email: '',
                            notes: '',
                            userId: ''
                          };
                          handleOpenEditModal(targetDoc);
                        }}
                        className="w-9 h-9 border border-teal-100 text-teal-600 hover:bg-teal-50 rounded-lg flex items-center justify-center transition"
                        title="Vincular dados oficiais"
                      >
                        <Compass size={14} />
                      </button>
                    )}
                  </div>

                  {/* Mail fallback action */}
                  {doc.email && (
                    <a
                      href={`mailto:${doc.email}`}
                      className="text-[11px] text-slate-400 hover:text-teal-600 flex items-center gap-1 justify-center py-1 transition"
                    >
                      <Mail size={11} />
                      {doc.email}
                    </a>
                  )}
                </div>

                {/* WhatsApp Template Modal Drawer overlay for safe messaging */}
                {whatsappTemplateOpen === doc.id && (
                  <div className="absolute inset-x-0 bottom-0 bg-slate-900 text-white rounded-2xl p-4 space-y-3 z-10 shadow-lg animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-semibold text-teal-400">Mensagem para WhatsApp</span>
                      <button 
                        onClick={() => setWhatsappTemplateOpen(null)} 
                        className="text-slate-400 hover:text-white p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400">Escolha o modelo de texto facilitado:</p>
                      
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setSelectedTemplateText("Olá Dr(a). {medico}, tudo bem? Aqui é o seu paciente. Gostaria de agendar uma consulta de retorno para avaliar meus últimos exames.")}
                          className={`text-left text-xs p-1.5 rounded border ${
                            selectedTemplateText.includes('agendar') ? 'border-teal-500/55 bg-teal-500/10' : 'border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          🗓 Agendamento de Retorno
                        </button>
                        <button
                          onClick={() => setSelectedTemplateText("Olá Dr(a). {medico}! Concluí os novos exames solicitados. Posso enviar o arquivo PDF consolidado por aqui para adiantar nossa análise?")}
                          className={`text-left text-xs p-1.5 rounded border ${
                            selectedTemplateText.includes('exames solicitados') ? 'border-teal-500/55 bg-teal-500/10' : 'border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          📄 Enviar Laudos / PDF
                        </button>
                        <button
                          onClick={() => setSelectedTemplateText("Olá Dr(a). {medico}. Estou usando as medicações recomendadas, mas gostaria de tirar uma dúvida operacional curta sobre os horários or sintomas.")}
                          className={`text-left text-xs p-1.5 rounded border ${
                            selectedTemplateText.includes('medicações') ? 'border-teal-500/55 bg-teal-500/10' : 'border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          💊 Dúvida de Medicação
                        </button>
                      </div>

                      <div className="pt-2">
                        <textarea
                          value={selectedTemplateText}
                          onChange={(e) => setSelectedTemplateText(e.target.value)}
                          className="w-full text-xs bg-slate-850 border border-slate-800 rounded p-1.5 text-white h-16 resize-none focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <button
                        onClick={() => startWhatsAppChat(doc.phone || '', doc.name)}
                        className="w-full h-8 bg-teal-600 hover:bg-teal-500 rounded text-xs font-bold flex items-center justify-center gap-1 bg-green-600 hover:bg-green-500 transition"
                      >
                        <ExternalLink size={12} />
                        Iniciar Conversa no App
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Adding / Editing Modal form layout with CRM Specialty AI lookup */}
      {isModalOpen && editingDoctor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSave}
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-105 flex flex-col animate-scaleIn"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingDoctor.id ? 'Alterar Cadastro' : 'Cadastrar Novo Médico'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingDoctor(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Intelligent Specialty and CRM finder banner */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                  <span className="text-xs font-bold text-slate-700">Motor de Busca Automatizado de CFM</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Digite o CRM, UF ou o Nome do médico e clique no botão para que a inteligência artificial localize e preencha automaticamente a especialidade e dados de registro.
                </p>
                
                <button
                  type="button"
                  onClick={handleCrmAutosearch}
                  disabled={isSearchingCRM}
                  className="h-8.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-900 transition disabled:opacity-50"
                >
                  {isSearchingCRM ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-teal-400" />
                      <span>Buscando Cadastro...</span>
                    </>
                  ) : (
                    <>
                      <Compass size={13} />
                      <span>Buscar e Preencher Especialidade</span>
                    </>
                  )}
                </button>

                {crmSearchError && (
                  <p className="text-[11px] font-medium text-amber-600">
                    {crmSearchError}
                  </p>
                )}
              </div>

              {/* Form Input fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo do Médico *</label>
                  <input
                    type="text"
                    required
                    value={editingDoctor.name || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Dra. Sarah Abati"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número do CRM</label>
                    <input
                      type="text"
                      value={editingDoctor.crm || ''}
                      onChange={(e) => setEditingDoctor(prev => ({ ...prev, crm: e.target.value }))}
                      placeholder="Ex: 147814"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estado (UF)</label>
                    <select
                      value={editingDoctor.uf || 'SP'}
                      onChange={(e) => setEditingDoctor(prev => ({ ...prev, uf: e.target.value }))}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                    >
                      {BRAZILIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Especialidade Médica</label>
                  <input
                    type="text"
                    value={editingDoctor.specialty || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Ex: Reumatologia, Endocrinologia, Geral"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fone de Contato (WhatsApp)</label>
                  <input
                    type="text"
                    value={editingDoctor.phone || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ex: 11999998888"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Insira o telefone somente com números incluindo o DDD (11...)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editingDoctor.email || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ex: contato@consultorio.com.br"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Anotações / Notas de Consultório</label>
                  <textarea
                    value={editingDoctor.notes || ''}
                    onChange={(e) => setEditingDoctor(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Ex: Consultório de Segunda e Quinta. Solicita exames antecipadamente."
                    className="w-full min-h-[60px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none text-slate-800 resize-y"
                  />
                </div>
              </div>

            </div>

            {/* Footer triggers */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingDoctor(null);
                }}
                className="h-10 px-4 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-10 px-5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:shadow-sm transition"
              >
                <Save size={16} />
                {editingDoctor.id ? 'Salvar Alterações' : 'Salvar Cadastro'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
