import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  Activity, 
  CheckCircle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { useData, useToast } from '../App';
import { UserPathology } from '../data';

// Predefined set of pathologies requested by the user
const PRESET_PATHOLOGIES = [
  {
    condition: 'Vitiligo (Autoimune)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Autoimune. Início aos 10 anos (hereditário).'
  },
  {
    condition: 'Tireoide de Hashimoto (Autoimune)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Autoimune.'
  },
  {
    condition: 'Nefropatia por IgA (Autoimune)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Autoimune.'
  },
  {
    condition: 'Esofagite',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Gastrointestinal. Enquadrado em quadro de refluxo.'
  },
  {
    condition: 'Hérnia de Hiato',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Gastrointestinal. Enquadrado em quadro de refluxo.'
  },
  {
    condition: 'Pangastrite',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Gastrointestinal. Enquadrado em quadro de refluxo.'
  },
  {
    condition: 'Bulboduenite',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Gastrointestinal. Enquadrado em quadro de refluxo.'
  },
  {
    condition: 'Hipertonia do Esfíncter Anal Interno',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Condição gastrointestinal e proctológica.'
  },
  {
    condition: 'Distimia (Emocional)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Emocional.'
  },
  {
    condition: 'Ansiedade (Emocional)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Patologia Emocional.'
  },
  {
    condition: 'TDAH',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Transtorno de Déficit de Atenção com Hiperatividade (TDH).'
  },
  {
    condition: 'TEA (Autismo)',
    dateDetected: '2025-12-01',
    isCongenital: false,
    status: 'Ativo',
    description: 'Transtorno do Espectro Autista. Diagnóstico em 12/2025.'
  },
  {
    condition: 'Desvio de Septo',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Otorrinolaringologia.'
  },
  {
    condition: 'Rinite Alérgica',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Otorrinolaringologia.'
  },
  {
    condition: 'Olho Seco',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Oftalmologia / Otorrino.'
  },
  {
    condition: 'Insônia Crônica',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Transtorno do sono de início na adolescência.'
  },
  {
    condition: 'Cisto no Rim (US)',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Cisto renal identificado por ultrassonografia.'
  },
  {
    condition: 'Fibromialgia',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Dor musculoesquelética: grandes dores no corpo de forma difusa.'
  },
  {
    condition: 'Dor Cervical',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Dor musculoesquelética difusa.'
  },
  {
    condition: 'Dor Lombar',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Dor musculoesquelética difusa.'
  },
  {
    condition: 'Dores nos Joelhos',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Dor musculoesquelética difusa.'
  },
  {
    condition: 'Dor no Masseter',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Dor musculoesquelética difusa / Disfunção temporomandibular.'
  },
  {
    condition: 'Calvície Dermatológica',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Calvície (hereditária).'
  },
  {
    condition: 'Excesso de Acnes',
    dateDetected: 'De Nascença',
    isCongenital: true,
    status: 'Ativo',
    description: 'Excesso de acnes / Dermatologista.'
  }
];

export function PathologiesView({ initialFilter }: { initialFilter?: any }) {
  const { 
    userPathologies = [], 
    savePathology, 
    deletePathology, 
    pathologiesData = [] // auto-derived check markers from exams
  } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState(initialFilter?.condition || '');
  const [statusFilter, setStatusFilter] = useState(initialFilter?.status || 'Todos');
  React.useEffect(() => {
    if (initialFilter) {
      if (initialFilter.condition !== undefined) setSearchTerm(initialFilter.condition);
      if (initialFilter.status !== undefined) setStatusFilter(initialFilter.status);
    }
  }, [initialFilter]);

  const [showExamMarkers, setShowExamMarkers] = useState(false);
  const [isImportingPreset, setIsImportingPreset] = useState(false);
  const [hasCheckedAutoImport, setHasCheckedAutoImport] = useState(false);

  // Batch importer for pre-provided 24 pathologies
  const importPresetPathologies = async () => {
    setIsImportingPreset(true);
    let imported = 0;
    try {
      for (const item of PRESET_PATHOLOGIES) {
        // Prevent simple duplicates by matching conditions
        const alreadyExists = userPathologies.some(p => 
          p.condition.toLowerCase().replace(/[^a-z0-9]/g, '') === 
          item.condition.toLowerCase().replace(/[^a-z0-9]/g, '')
        );
        if (!alreadyExists) {
          await savePathology({
            condition: item.condition,
            dateDetected: item.dateDetected,
            isCongenital: item.isCongenital,
            status: item.status,
            description: item.description
          });
          imported++;
        }
      }
      if (imported > 0) {
        addToast(`Perfil atualizado com sucesso! Seu prontuário foi preenchido com as ${imported} condições e sintomas históricos de sua solicitação.`, 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImportingPreset(false);
    }
  };

  React.useEffect(() => {
    if (userPathologies.length === 0 && !hasCheckedAutoImport) {
      const timer = setTimeout(() => {
        if (userPathologies.length === 0) {
          importPresetPathologies();
        }
        setHasCheckedAutoImport(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (userPathologies.length > 0) {
      setHasCheckedAutoImport(true);
    }
  }, [userPathologies, hasCheckedAutoImport]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPathology, setEditingPathology] = useState<UserPathology | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [conditionName, setConditionName] = useState('');
  const [dateDetected, setDateDetected] = useState('');
  const [isCongenital, setIsCongenital] = useState(false);
  const [status, setStatus] = useState('Ativo');
  const [description, setDescription] = useState('');

  const filteredUserPathologies = useMemo(() => {
    return userPathologies.filter(p => {
      const matchesSearch = p.condition.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [userPathologies, searchTerm, statusFilter]);

  const openAddModal = () => {
    setEditingPathology(null);
    setConditionName('');
    // Prefill date with today's date in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setDateDetected(today);
    setIsCongenital(false);
    setStatus('Ativo');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: UserPathology) => {
    setEditingPathology(p);
    setConditionName(p.condition);
    setDateDetected(p.isCongenital ? '' : p.dateDetected);
    setIsCongenital(!!p.isCongenital);
    setStatus(p.status);
    setDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionName.trim()) {
      addToast('Por favor, preencha o nome da condição.', 'error');
      return;
    }
    if (!isCongenital && !dateDetected.trim()) {
      addToast('Por favor, indique a data de diagnóstico.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await savePathology({
        ...(editingPathology ? { id: editingPathology.id } : {}),
        condition: conditionName.trim(),
        dateDetected: isCongenital ? 'De Nascença' : dateDetected,
        status,
        description: description.trim() || undefined,
        isCongenital
      });

      addToast(
        editingPathology 
          ? 'Condição atualizada com sucesso!' 
          : 'Nova patologia registrada com sucesso!', 
        'success'
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Erro ao salvar os dados da condição.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o registro de "${name}"?`)) {
      try {
        await deletePathology(id);
        addToast(`Registro de "${name}" removido com sucesso.`, 'success');
      } catch (err) {
        addToast('Erro ao excluir patologia.', 'error');
      }
    }
  };

  const getStatusStyle = (s: string) => {
    switch(s) {
      case 'Ativo':
        return 'bg-rose-50 border-rose-100 text-rose-700 font-bold';
      case 'Em Tratamento':
        return 'bg-amber-50 border-amber-100 text-amber-700 font-bold';
      case 'Controlado':
        return 'bg-teal-50 border-teal-100 text-teal-700 font-bold';
      case 'Inativo':
      case 'Resolvido':
        return 'bg-slate-50 border-slate-150 text-slate-600 font-bold';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (s: string) => {
    switch(s) {
      case 'Ativo':
        return <AlertCircle size={15} />;
      case 'Em Tratamento':
        return <Activity size={15} />;
      case 'Controlado':
        return <CheckCircle size={15} />;
      default:
        return <HelpCircle size={15} />;
    }
  };

  // Helper to format date list
  const formatDisplayDate = (d: string, isCongenital?: boolean) => {
    if (isCongenital || d === 'De Nascença') return 'De Nascença';
    if (!d) return '';
    if (d.includes('-')) {
      const parts = d.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return d;
  };

  // Divide active conditions
  const activeCount = userPathologies.filter(p => p.status === 'Ativo' || p.status === 'Em Tratamento').length;
  const controlledCount = userPathologies.filter(p => p.status === 'Controlado').length;
  const inactiveCount = userPathologies.filter(p => p.status === 'Resolvido' || p.status === 'Inativo').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Stethoscope className="text-white" size={20} />
            </div>
            Patologias e Condições de Saúde
          </h2>
          <p className="text-slate-500 mt-1.5 max-w-2xl text-sm leading-relaxed">
            Registo persistente de patologias específicas e diagnósticos crónicos confirmados, diferenciando condições clínicas gerais de meros marcadores alterados temporariamente em exames.
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="print-hidden shrink-0 bg-slate-900 text-white hover:bg-slate-800 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer text-sm"
        >
          <Plus size={16} className="stroke-[2.5]" />
          Adicionar Patologia
        </button>
      </header>

      {/* Dynamic Preset Import Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200/50 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top duration-300">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Stethoscope className="text-teal-600" size={17} /> 
            Importar Histórico Clínico Predefinido
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Detectamos as 24 condições e sintomas listados em sua solicitação (incluindo Vitiligo, Hashimoto, IgA, Esofagite, TEA de 12/2025, TDAH, Fibromialgia, etc.). Clique no botão ao lado para preencher e organizar o prontuário automaticamente.
          </p>
        </div>
        <button
          type="button"
          disabled={isImportingPreset}
          onClick={importPresetPathologies}
          className="print-hidden shrink-0 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-40"
        >
          {isImportingPreset ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Salvando Condições...</span>
            </>
          ) : (
            <>
              <span>Cadastrar 24 Patologias</span>
            </>
          )}
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-200/60 flex items-center gap-4 hover:shadow-2xs transition-all">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ativas / Em Tratamento</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 animate-countUp">{activeCount}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-200/60 flex items-center gap-4 hover:shadow-2xs transition-all">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100 shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Controladas clinicamente</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 animate-countUp">{controlledCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-3xs border border-slate-200/60 flex items-center gap-4 hover:shadow-2xs transition-all">
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico / Inativas</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5 animate-countUp">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Filtros de condições */}
      <div className="bg-white border border-slate-250/60 p-4 rounded-xl shadow-3xs flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Pesquisar por patologia ou nota..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:border-transparent transition-colors text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:bg-white text-slate-700 font-medium"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="Todos">Filtro: Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Em Tratamento">Em Tratamento</option>
          <option value="Controlado">Controlado</option>
          <option value="Resolvido">Resolvido / Inativo</option>
        </select>
      </div>

      {/* Grid de Patologias */}
      {filteredUserPathologies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUserPathologies.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-teal-100 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group ${
                p.status === 'Ativo' ? 'status-border-active' :
                p.status === 'Em Tratamento' ? 'status-border-treatment' :
                p.status === 'Controlado' ? 'status-border-controlled' :
                'status-border-inactive'
              }`}>
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-snug group-hover:text-teal-700 transition-colors">{p.condition}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full border shrink-0 ${getStatusStyle(p.status)}`}>
                    {getStatusIcon(p.status)}
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Diagnóstico: {formatDisplayDate(p.dateDetected, p.isCongenital)}</span>
                </div>

                {p.description && (
                  <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {p.description}
                  </p>
                )}
              </div>

              {/* Ações rodapé */}
              <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-end gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1 px-2.5 bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 hover:border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  title="Editar dados"
                >
                  <Edit3 size={11} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.condition)}
                  className="p-1 px-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 hover:border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  title="Remover"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200/80 p-8">
          <Stethoscope className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="font-bold text-slate-700 text-base">Nenhuma patologia registada manualmente</h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm mx-auto leading-relaxed">
            Você ainda não registou diagnósticos de longo prazo (como Vitiligo ou Autismo). Adicione-as usando o botão acima.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <Plus size={14} className="stroke-[2.5]" />
            Adicionar Primeiro Diagnóstico
          </button>
        </div>
      )}

      {/* Accordion de marcadores auto-extraídos de exames */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-3xs overflow-hidden">
        <button
          onClick={() => setShowExamMarkers(!showExamMarkers)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">Marcadores Alterados Extraídos dos Exames ({pathologiesData.length})</h4>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Apenas informativo — auto-extraído dos seus laudos</p>
            </div>
          </div>
          {showExamMarkers ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
        </button>

        {showExamMarkers && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/20 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed max-w-4xl mt-2 mb-4">
              A lista abaixo é gerada analisando as flutuações e alterações identificadas em seus PDFs médicos importados. Nota: exames alterados pontualmente (ex: Colesterol alto ou glicose limítrofe) não equivalem necessariamente a patologias crônicas.
            </p>

            {pathologiesData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pathologiesData.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-250/50 p-4 flex flex-col md:flex-row gap-4 items-start shadow-3xs">
                    <div className="md:w-1/3 shrink-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-slate-800 text-sm leading-snug">{item.condition}</h5>
                        <span className={`px-2 py-0.5 text-[8px] font-black rounded border shrink-0 uppercase tracking-wider ${
                          item.status === 'Requer Reavaliação' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                          item.status === 'Monitorização' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-teal-50 border-teal-100 text-teal-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-1.5">
                        Detetado em: {item.dateDetected}
                      </p>
                      <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                        Último Exame: {item.lastExam}
                      </p>
                    </div>
                    <div className="md:w-2/3 flex flex-col justify-between h-full">
                      <p className="text-slate-600 text-xs leading-relaxed mb-3 font-medium whitespace-pre-wrap">{item.description}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold shrink-0">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200/50 text-[9px]">{item.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic">Nenhuma anomalia identificada em seus exames auto-importados.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal Adicionar / Editar */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="p-6 bg-slate-50 border-b border-slate-200/60 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {editingPathology ? 'Editar Condição' : 'Registrar Patologia Crônica'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">Informe os detalhes clínicos do diagnóstico.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Nome da Condição / Patologia</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Vitiligo, Autismo Nível 1, TDAH, Hipotireoidismo"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400"
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Condição de Nascença?</span>
                  <span className="text-xs text-slate-500">Marque se esta condição é congênita (de nascença)</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4.5 h-4.5 accent-teal-600 rounded cursor-pointer"
                  checked={isCongenital}
                  onChange={(e) => {
                    setIsCongenital(e.target.checked);
                    if (e.target.checked) setDateDetected('');
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    {isCongenital ? 'Diagnóstico (Nascença)' : 'Data de Diagnóstico'}
                  </label>
                  <input 
                    type="date" 
                    required={!isCongenital}
                    disabled={isCongenital}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 transition-all disabled:opacity-45"
                    value={dateDetected}
                    onChange={(e) => setDateDetected(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status Atual</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Ativo">Ativo (Atenção / Sintomas)</option>
                    <option value="Em Tratamento">Em Tratamento / Terapia</option>
                    <option value="Controlado">Controlado / Assintomático</option>
                    <option value="Resolvido">Resolvido / Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Notas Clínicas ou Descrição (Opcional)</label>
                <textarea 
                  rows={4}
                  placeholder="Ex: Acompanhamento semestral com terapeuta. Medicamento prescrito ou comportamento das lesões."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Informações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
