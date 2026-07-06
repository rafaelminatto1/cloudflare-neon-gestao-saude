import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Search, 
  Filter, 
  AlertCircle,
  HelpCircle,
  X,
  History,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Sparkles,
  Info
} from 'lucide-react';
import { useData, useToast } from '../App';
import { ContinuousMedication, formatScientificReferences, parseScientificReferences } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface DosageHistoryEntry {
  id: string;
  date: string;
  dosage: string;
  notes?: string;
  sideEffects?: string;
  doctorName?: string;
}

interface ParsedMedicationNotes {
  notes: string;
  sideEffects: string;
  history: DosageHistoryEntry[];
}

// Global Help function to extract structured data from medication notes field safely
export function parseMedicationNotes(rawNotes: string | undefined): ParsedMedicationNotes {
  if (!rawNotes) {
    return { notes: '', sideEffects: '', history: [] };
  }
  
  const value = rawNotes.trim();
  if (value.startsWith('{') && value.endsWith('}')) {
    try {
      const parsed = JSON.parse(value);
      return {
        notes: parsed.notes || '',
        sideEffects: parsed.sideEffects || '',
        history: parsed.history || []
      };
    } catch (e) {
      // ignore parse issues and fallback
    }
  }
  
  return { notes: rawNotes, sideEffects: '', history: [] };
}

export function encodeMedicationNotes(notes: string, sideEffects: string, history: DosageHistoryEntry[]): string {
  return JSON.stringify({
    notes,
    sideEffects,
    history
  });
}

const UNIFIED_PRESET_MEDICATIONS = [
  {
    name: 'Venvanse',
    dosage: '50mg',
    frequency: 'De manhã',
    startDate: '2026-01-01',
    isActive: true,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'Quetiapina',
    dosage: '25mg',
    frequency: 'À noite',
    startDate: '2025-01-01',
    isActive: true,
    notes: '',
    sideEffects: '',
    history: [
      {
        id: 'h1',
        date: '2025-01-01',
        dosage: '25mg',
        notes: '',
        sideEffects: ''
      },
      {
        id: 'h2',
        date: '2026-01-01',
        dosage: '25mg',
        notes: '',
        sideEffects: ''
      }
    ]
  },
  {
    name: 'Pregabalina',
    dosage: '300mg + 300mg',
    frequency: 'De manhã (300mg) e à noite (300mg)',
    startDate: '2025-01-01',
    isActive: true,
    notes: '',
    sideEffects: '',
    history: [
      {
        id: 'h3',
        date: '2025-01-01',
        dosage: '150mg + 150mg',
        notes: '',
        sideEffects: ''
      },
      {
        id: 'h4',
        date: '2026-01-01',
        dosage: '300mg + 300mg',
        notes: '',
        sideEffects: ''
      }
    ]
  },
  {
    name: 'Velija (Duloxetina)',
    dosage: '90mg',
    frequency: 'De manhã',
    startDate: '2025-01-01',
    isActive: true,
    notes: '',
    sideEffects: '',
    history: [
      {
        id: 'h5',
        date: '2025-01-01',
        dosage: '30mg',
        notes: '',
        sideEffects: ''
      },
      {
        id: 'h6',
        date: '2026-01-01',
        dosage: '90mg',
        notes: '',
        sideEffects: ''
      }
    ]
  },
  {
    name: 'Trezor (Rosuvastatina)',
    dosage: '10mg',
    frequency: 'À noite',
    startDate: '2026-01-01',
    isActive: true,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'Concerta',
    dosage: '54mg',
    frequency: 'De manhã',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'Escitalopram',
    dosage: '15mg',
    frequency: 'De manhã',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'Palex',
    dosage: '100mg + 100mg',
    frequency: 'De manhã (100mg) e à noite (100mg)',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'THC D8',
    dosage: '1 gota + 2 gotas (Sublingual)',
    frequency: 'Sublingual: 1 gota de manhã e 2 gotas antes de dormir',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
    notes: '',
    sideEffects: '',
    history: []
  },
  {
    name: 'Cloridrato de Amitriptilina',
    dosage: '25mg',
    frequency: 'À noite',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    isActive: false,
    notes: '',
    sideEffects: '',
    history: []
  }
];

export function MedicationsView() {
  const { 
    medications = [], 
    saveMedication, 
    deleteMedication 
  } = useData();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Ativos' | 'Suspensos'>('Todos');
  const [isImportingPreset, setIsImportingPreset] = useState(false);
  const [hasCheckedAutoImport, setHasCheckedAutoImport] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Batch importer for pre-provided 2025/2026 medications unifed
  const importPresetMedications = async () => {
    setIsImportingPreset(true);
    let imported = 0;
    try {
      for (const item of UNIFIED_PRESET_MEDICATIONS) {
        // Prevent duplicates by name matching
        const alreadyExists = medications.some(m => 
          m.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );
        if (!alreadyExists) {
          const encoded = encodeMedicationNotes(item.notes, item.sideEffects, item.history);
          await saveMedication({
            name: item.name,
            dosage: item.dosage,
            frequency: item.frequency,
            startDate: item.startDate,
            endDate: item.endDate,
            isActive: item.isActive,
            notes: encoded
          });
          imported++;
        }
      }
      if (imported > 0) {
        addToast(`Prontuário de Farmacoterapia atualizado! Foram importados ${imported} tratamentos unificados com seus históricos de dose e efeitos colaterais.`, 'success');
      }
    } catch (err) {
      console.error(err);
      addToast('Erro ao importar receitas predefinidas.', 'error');
    } finally {
      setIsImportingPreset(false);
    }
  };

  React.useEffect(() => {
    if (medications.length === 0 && !hasCheckedAutoImport) {
      const timer = setTimeout(() => {
        if (medications.length === 0) {
          importPresetMedications();
        }
        setHasCheckedAutoImport(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (medications.length > 0) {
      setHasCheckedAutoImport(true);
    }
  }, [medications, hasCheckedAutoImport]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<ContinuousMedication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  
  // Custom metadata parsed fields inside form
  const [userNotes, setUserNotes] = useState('');
  const [sideEffects, setSideEffects] = useState('');
  const [scientificReferencesInput, setScientificReferencesInput] = useState('');
  const [dosageHistory, setDosageHistory] = useState<DosageHistoryEntry[]>([]);

  // Subform local fields for registering dosage adjustments
  const [newLogDate, setNewLogDate] = useState('');
  const [newLogDosage, setNewLogDosage] = useState('');
  const [newLogNotes, setNewLogNotes] = useState('');
  const [newLogSideEffects, setNewLogSideEffects] = useState('');
  const [newLogDoctor, setNewLogDoctor] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Open modal for editing
  const handleOpenEditModal = (med: ContinuousMedication) => {
    setEditingMedication(med);
    setName(med.name);
    setDosage(med.dosage);
    setFrequency(med.frequency);
    setStartDate(med.startDate || '');
    setEndDate(med.endDate || '');
    setIsActive(med.isActive);
    
    // Parse notes object
    const parsed = parseMedicationNotes(med.notes);
    setUserNotes(parsed.notes);
    setSideEffects(parsed.sideEffects);
    setScientificReferencesInput(formatScientificReferences(med.scientificReferences));
    setDosageHistory(parsed.history);

    // Reset sub-form fields
    setNewLogDate(new Date().toISOString().split('T')[0]);
    setNewLogDosage('');
    setNewLogNotes('');
    setNewLogSideEffects('');
    setNewLogDoctor('');
    setShowLogForm(false);
    setEditingLogId(null);
    setIsModalOpen(true);
  };

  // Open modal for writing a new one
  const handleOpenAddModal = () => {
    setEditingMedication(null);
    setName('');
    setDosage('');
    setFrequency('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsActive(true);
    setUserNotes('');
    setSideEffects('');
    setScientificReferencesInput('');
    setDosageHistory([]);

    setNewLogDate(new Date().toISOString().split('T')[0]);
    setNewLogDosage('');
    setNewLogNotes('');
    setNewLogSideEffects('');
    setNewLogDoctor('');
    setShowLogForm(false);
    setEditingLogId(null);
    setIsModalOpen(true);
  };

  // Add or update historical log to temporary state
  const handleSaveHistoricalLog = () => {
    if (!newLogDate || !newLogDosage) {
      addToast('A data e a dosagem são campos obrigatórios para o histórico.', 'info');
      return;
    }

    if (editingLogId) {
      // Update existing
      setDosageHistory(prev => prev.map(item => {
        if (item.id === editingLogId) {
          return {
            ...item,
            date: newLogDate,
            dosage: newLogDosage,
            notes: newLogNotes,
            sideEffects: newLogSideEffects,
            doctorName: newLogDoctor
          };
        }
        return item;
      }).sort((a,b) => b.date.localeCompare(a.date)));
      
      addToast(`Ajuste de dose histórico atualizado!`, 'success');
    } else {
      // Create new
      const newEntry: DosageHistoryEntry = {
        id: 'log_' + Date.now() + Math.random().toString(36).substr(2, 4),
        date: newLogDate,
        dosage: newLogDosage,
        notes: newLogNotes,
        sideEffects: newLogSideEffects,
        doctorName: newLogDoctor
      };

      setDosageHistory(prev => [newEntry, ...prev].sort((a,b) => b.date.localeCompare(a.date)));
      
      // Auto populate modal's current dose to this new dose, helping unification easy!
      setDosage(newLogDosage);
      if (newLogSideEffects && !sideEffects.includes(newLogSideEffects)) {
        setSideEffects(prev => prev ? `${prev}\n${newLogSideEffects}` : newLogSideEffects);
      }

      addToast(`Ajuste registrado! A dose atual foi unificada para ${newLogDosage}.`, 'success');
    }
    
    // Clear subform
    setNewLogDosage('');
    setNewLogNotes('');
    setNewLogSideEffects('');
    setNewLogDoctor('');
    setShowLogForm(false);
    setEditingLogId(null);
  };

  // Edit existing log
  const handleEditHistoricalLog = (log: DosageHistoryEntry) => {
    setNewLogDate(log.date);
    setNewLogDosage(log.dosage);
    setNewLogNotes(log.notes || '');
    setNewLogSideEffects(log.sideEffects || '');
    setNewLogDoctor(log.doctorName || '');
    setEditingLogId(log.id);
    setShowLogForm(true);
  };

  // Remove log from list
  const handleRemoveHistoricalLog = (id: string) => {
    setDosageHistory(prev => prev.filter(item => item.id !== id));
  };

  // Save changes
  const handleSaveMedicationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      addToast('Nome, dosagem atual e frequência de toma são campos obrigatórios.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const encodedNotes = encodeMedicationNotes(userNotes, sideEffects, dosageHistory);
      
      await saveMedication({
        id: editingMedication?.id,
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        startDate,
        endDate: endDate || undefined,
        isActive,
        scientificReferences: parseScientificReferences(scientificReferencesInput),
        notes: encodedNotes
      });

      addToast(
        editingMedication 
          ? `Medicamento "${name}" atualizado de forma unificada!` 
          : `Nova medicação "${name}" registrada com sucesso!`, 
        'success'
      );
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      addToast('Ocorreu um erro ao salvar o registro.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMedicationPress = async (id: string) => {
    if (window.confirm('Tem certeza absoluta que deseja remover este tratamento da base?')) {
      try {
        await deleteMedication(id);
        addToast('Tratamento excluído da lista permanente.', 'success');
      } catch (err) {
        addToast('Falha ao excluir medicação.', 'error');
      }
    }
  };

  const toggleExpandCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const activeMedications = useMemo(() => {
    return medications
      .filter(m => {
        if (!m.isActive) return false;
        const parsed = parseMedicationNotes(m.notes);
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (parsed.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (parsed.sideEffects || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.dosage || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = a.startDate || '';
        const dateB = b.startDate || '';
        return dateB.localeCompare(dateA); // Newest starts first (por data de início descendente)
      });
  }, [medications, searchTerm]);

  const suspendedMedications = useMemo(() => {
    return medications
      .filter(m => {
        if (m.isActive) return false;
        const parsed = parseMedicationNotes(m.notes);
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (parsed.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (parsed.sideEffects || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.dosage || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = a.startDate || '';
        const dateB = b.startDate || '';
        return dateB.localeCompare(dateA); // Newest starts first
      });
  }, [medications, searchTerm]);

  const renderMedicationGrid = (list: ContinuousMedication[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map(med => {
          const parsed = parseMedicationNotes(med.notes);
          const isExpanded = expandedCards[med.id] || false;
          
          return (
            <motion.div
              key={med.id}
              layout="position"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card-interactive flex flex-col justify-between overflow-hidden group ${
                med.isActive ? 'border-slate-200 hover:border-teal-100' : 'border-slate-200/50 hover:border-slate-300 opacity-80 hover:opacity-100'
              }`}
            >
              
              {/* Header of Medication Card */}
              <div className="p-5 space-y-3.5 flex-1 select-none font-sans">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-950 text-base flex items-center gap-1.5 leading-tight">
                      <Pill size={16} className={med.isActive ? "text-teal-600" : "text-slate-400"} />
                      {med.name}
                    </h4>
                    <p className="text-[11px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      {med.frequency}
                    </p>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border transition-colors ${
                    med.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {med.isActive ? 'Ativo' : 'Suspenso'}
                  </span>
                </div>

                {/* Highlight current dosage very prominently as unified */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Dose Atual</span>
                    <span className="text-sm font-black text-slate-800">{med.dosage}</span>
                  </div>

                  {/* Start Date & End date if any */}
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Vigência</span>
                    <span className="text-2xs font-bold text-slate-600 font-mono">
                      {med.startDate ? med.startDate.split('-').reverse().join('/') : 'Início s/d'}
                      {med.endDate && ` a ${med.endDate.split('-').reverse().join('/')}`}
                    </span>
                  </div>
                </div>

                {/* General observations text */}
                {parsed.notes && (
                  <div className="text-xs text-slate-550 leading-relaxed font-semibold italic bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                    "{parsed.notes}"
                  </div>
                )}

                {/* Efeitos colaterais atual (Warning block if present) */}
                {parsed.sideEffects && (
                  <div className="p-3 bg-amber-50/40 border border-amber-150 rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle size={11} className="text-amber-600 animate-bounce duration-2500" />
                      Efeito Colateral Presente
                    </span>
                    <p className="text-xs text-amber-805 font-medium leading-relaxed">
                      {parsed.sideEffects}
                    </p>
                  </div>
                )}

                {/* Historical logs Accordion trigger */}
                {parsed.history && parsed.history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpandCard(med.id)}
                    className="w-full py-1.5 px-3 border border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/50 text-slate-700 hover:text-slate-900 font-extrabold text-[10px] rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1 uppercase tracking-wider font-mono">
                      <History size={11} className="text-teal-600" />
                      Histórico ({parsed.history.length})
                    </span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}

                {/* Expansion dosage adjustments timeline */}
                <AnimatePresence>
                  {isExpanded && parsed.history && parsed.history.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-2 border-t border-slate-100"
                    >
                      <div className="space-y-4 pl-1">
                        {parsed.history.map((log, index) => (
                          <div key={log.id || index} className="relative pl-4 border-l border-teal-200/50 pt-0.5 space-y-1 pb-1">
                            
                            {/* Circle node connector with nice check icon or dot */}
                            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-xs" />
                            
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="font-mono bg-teal-50 text-teal-800 border border-teal-150 rounded-sm px-1.5 py-0.5">
                                {log.date ? log.date.split('-').reverse().join('/') : 'Data s/d'}
                              </span>
                              <span className="text-slate-800 font-black">
                                Dose: {log.dosage}
                              </span>
                            </div>

                            {log.notes && (
                              <p className="text-2xs text-slate-500 font-semibold leading-relaxed">
                                {log.notes}
                              </p>
                            )}

                            {log.doctorName && (
                              <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                Médico: {log.doctorName}
                              </p>
                            )}

                            {log.sideEffects && (
                              <p className="text-2xs text-rose-600 font-semibold bg-rose-50/55 border border-rose-100 rounded-lg p-2 leading-relaxed mt-0.5">
                                <strong className="text-rose-700 uppercase tracking-wider text-[8px] block mb-0.5">Efeito colateral:</strong>
                                {log.sideEffects}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Bottom interactive card row control buttons */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center gap-2">
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  ID: {med.id.slice(0, 5)}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(med)}
                    className="p-1 px-2.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 text-3xs font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer select-none"
                  >
                    <Edit3 size={11} />
                    Editar / Ajustar
                  </button>
                  
                  <button
                    onClick={() => handleDeleteMedicationPress(med.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-750 hover:bg-rose-50 transition-all rounded-lg cursor-pointer"
                    title="Excluir medicação"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Pill className="text-white" size={18} />
            </div>
            Farmacoterapia Continuada
          </h2>
          <p className="text-slate-500 mt-1 max-w-xl text-sm leading-relaxed">
            Monitore e unifique medicamentos de uso contínuo, configure dose atualizada e controle efeitos colaterais com timeline histórica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {medications.length === 0 && (
            <button
              onClick={importPresetMedications}
              disabled={isImportingPreset}
              className="btn-secondary px-4 py-2 text-xs gap-1.5"
            >
              {isImportingPreset ? (
                <>Importando...</>
              ) : (
                <>
                  <Sparkles size={14} className="text-teal-600" />
                  Carregar Prescrição Histórica (2025/2026)
                </>
              )}
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="btn-secondary px-4 py-2.5 text-xs gap-1.5"
          >
            <Plus size={15} />
            Adicionar Medicamento
          </button>
        </div>
      </header>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Tratamentos Ativos</span>
            <span className="text-2xl font-black block text-slate-900">
              {medications.filter(m => m.isActive).length} Substâncias
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider">Tratamentos Suspensos</span>
            <span className="text-2xl font-black block text-slate-900">
              {medications.filter(m => !m.isActive).length} Registros
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center font-bold">
            <X size={20} />
          </div>
        </div>

        <div className="bg-teal-50/30 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-teal-850 tracking-wider">Ajustes Registrados</span>
            <span className="text-2xl font-black block text-slate-900">
              {medications.reduce((acc, current) => {
                const parsed = parseMedicationNotes(current.notes);
                return acc + (parsed.history?.length || 0);
              }, 0)} Alterações
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100/50 text-teal-705 flex items-center justify-center font-bold">
            <History size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Layout */}
      <div className="flex flex-col sm:flex-row shadow-xs bg-white rounded-2xl p-3 border border-slate-200/80 gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar por substância, notas ou efeitos colaterais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-xs font-semibold text-slate-700 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto self-stretch sm:self-auto overflow-x-auto shrink-0">
          {(['Todos', 'Ativos', 'Suspensos'] as const).map(op => (
            <button
              key={op}
              onClick={() => setFilterType(op)}
              className={`flex-1 px-4 py-1.5 rounded-lg text-xs font-extrabold transition-all truncate whitespace-nowrap cursor-pointer ${
                filterType === op 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
        {/* Grid listing */}
      {filterType === 'Todos' ? (
        activeMedications.length > 0 || suspendedMedications.length > 0 ? (
          <div className="space-y-10">
            {/* Active medications */}
            {activeMedications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                    Medicamentos Ativos ({activeMedications.length}) — Classificados por Início
                  </h3>
                </div>
                {renderMedicationGrid(activeMedications)}
              </div>
            )}

            {/* Suspended medications separated nicely */}
            {suspendedMedications.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-slate-200/70">
                <div className="flex items-center gap-2 pb-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <h3 className="text-xs font-black text-rose-800/80 uppercase tracking-widest flex items-center gap-2">
                    <span>Medicamentos Suspensos / Descontinuados ({suspendedMedications.length})</span>
                    <span className="text-[10px] font-bold text-slate-400 normal-case">(Histórico Passado)</span>
                  </h3>
                </div>
                {renderMedicationGrid(suspendedMedications)}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-150 block space-y-4">
            <Pill className="text-slate-300 mx-auto" size={40} />
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-bold text-slate-850 text-sm">Nenhum medicamento correspondente</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tente redefinir seus filtros ou pesquisar termos diferentes. Você também pode importar suas prescrições padrão do sistema.
              </p>
            </div>
          </div>
        )
      ) : filterType === 'Ativos' ? (
        activeMedications.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Medicamentos Ativos ({activeMedications.length})
              </h3>
            </div>
            {renderMedicationGrid(activeMedications)}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-150 block space-y-4">
            <Pill className="text-slate-300 mx-auto" size={40} />
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-bold text-slate-800 text-sm">Nenhum medicamento ativo correspondente</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Não há medicamentos ativos com estes termos de busca.
              </p>
            </div>
          </div>
        )
      ) : (
        suspendedMedications.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Medicamentos Suspensos ({suspendedMedications.length})
              </h3>
            </div>
            {renderMedicationGrid(suspendedMedications)}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-150 block space-y-4">
            <Pill className="text-slate-300 mx-auto" size={40} />
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="font-bold text-slate-850 text-sm">Nenhum medicamento suspenso correspondente</h4>
              <p className="text-xs text-slate-550 leading-relaxed">
                Não há registros suspensos com estes termos de busca.
              </p>
            </div>
          </div>
        )
      )}

      {/* Primary creation and adjustment modal layout */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90dvh] flex flex-col overflow-hidden"
            >
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
                    <Pill className="text-teal-600" size={18} />
                    {editingMedication ? `Ajustar Tratamento: ${name}` : 'Cadastrar Novo Medicamento'}
                  </h3>
                  <p className="text-2xs text-slate-550 mt-1">Concentre toda história de dosagens sob a mesma substância unificada.</p>
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 text-slate-450 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form container body */}
              <form onSubmit={handleSaveMedicationForm} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Basic inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Nome do Medicamento / Princípio Ativo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Pregabalina, Venvanse, Rosuvastatina..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Dosagem Atual / Alvo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: 300mg + 300mg, 50mg, 10mg..."
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Frequência de Toma</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: De manhã, À noite, 12 em 12 horas..."
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Estado do Tratamento</label>
                    <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setIsActive(true)}
                        className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-emerald-500 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-750'
                        }`}
                      >
                        Ativo
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsActive(false)}
                        className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                          !isActive 
                            ? 'bg-rose-500 text-white shadow-xs' 
                            : 'text-slate-500 hover:text-slate-750'
                        }`}
                      >
                        Suspenso
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Data de Início do Tratamento</label>
                    <input 
                      type="date" 
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Data de Término / Encerramento (opcional)</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all font-mono" 
                    />
                  </div>
                </div>

                {/* Notes and generic side effects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Indicação Clínica / Notas Gerais</label>
                    <textarea 
                      rows={3}
                      placeholder="Ex: Tratamento preventivo de dores hiperalgesia..."
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all placeholder:text-slate-400 resize-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-450 uppercase tracking-widest mb-1.5">Efeitos Colaterais Atuais / Observações Ativas</label>
                    <textarea 
                      rows={3}
                      placeholder="Descreva sintomas reativos ou observações ativas com o uso desse remédio..."
                      value={sideEffects}
                      onChange={(e) => setSideEffects(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 transition-all placeholder:text-slate-400 resize-none" 
                    />
                  </div>
                </div>

                {/* Timeline and unified doses adjustments builder */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        <History size={15} className="text-teal-600" />
                        Histórico Clínico de Doses & Alterações
                      </h4>
                      <p className="text-[10px] text-slate-450">Anexe as diferentes alterações de dosagem e reações do paciente ao longo do tempo.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLogForm(!showLogForm)}
                      className="btn-secondary px-3 py-1.5 text-3xs gap-1 uppercase tracking-wider"
                    >
                      {showLogForm ? 'Fechar Cadastro' : 'Registrar Alteração'}
                    </button>
                  </div>

                  {/* Subform to register a dosage logs */}
                  <AnimatePresence>
                    {showLogForm && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 overflow-hidden"
                      >
                        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1 border-b border-slate-200/60 pb-1.5">
                          <Plus size={12} className="text-teal-600" />
                          {editingLogId ? 'Editar Alteração Histórica' : 'Nova Alteração de Dose Histórica'}
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Médico Responsável (Opcional)</label>
                            <input 
                              type="text"
                              placeholder="Ex: Dr. Silva (Reumatologista)"
                              value={newLogDoctor}
                              onChange={(e) => setNewLogDoctor(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Data da Alteração</label>
                            <input 
                              type="date"
                              required
                              value={newLogDate}
                              onChange={(e) => setNewLogDate(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nova Dosagem na Data</label>
                            <input 
                              type="text"
                              required
                              placeholder="Ex: 30mg, 150mg + 150mg, 90mg..."
                              value={newLogDosage}
                              onChange={(e) => setNewLogDosage(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Observações da Ajuste de Dose</label>
                            <textarea 
                              rows={2}
                              placeholder="Ex: Dose recalibrada devido a dor refratária de fibromialgia..."
                              value={newLogNotes}
                              onChange={(e) => setNewLogNotes(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all resize-none text-[11px] font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Efeitos Colaterais no Período (Opcional)</label>
                            <textarea 
                              rows={2}
                              placeholder="Ex: Sudorese noturna intensa e boca seca moderada..."
                              value={newLogSideEffects}
                              onChange={(e) => setNewLogSideEffects(e.target.value)}
                              className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all resize-none text-[11px] font-semibold"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-1 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowLogForm(false);
                              setEditingLogId(null);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-3xs font-black uppercase tracking-wider transition-colors cursor-pointer select-none"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveHistoricalLog}
                            className="btn-primary px-4 py-2 text-3xs tracking-wider uppercase gap-1"
                          >
                            <CheckCircle2 size={12} />
                            {editingLogId ? 'Atualizar Ajuste' : 'Adicionar ao Histórico'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Historical Dose Logs list */}
                  <div className="space-y-2.5">
                    {dosageHistory.length > 0 ? (
                      dosageHistory.map((item, index) => (
                        <div 
                          key={item.id || index}
                          className="p-3 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-semibold"
                        >
                          <div className="space-y-1 select-none">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                                {item.date ? item.date.split('-').reverse().join('/') : 's/d'}
                              </span>
                              <span className="text-xs font-extrabold text-slate-800">
                                Dose: {item.dosage}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-2xs text-slate-500 font-bold max-w-md mt-1">
                                <span className="font-extrabold text-[8px] uppercase tracking-wider block text-slate-400">Motivo / Alteração:</span>
                                {item.notes}
                              </p>
                            )}
                            {item.doctorName && (
                              <p className="text-2xs text-slate-500 font-bold max-w-md">
                                <span className="font-extrabold text-[8px] uppercase tracking-wider block text-slate-400">Médico Responsável:</span>
                                {item.doctorName}
                              </p>
                            )}
                            {item.sideEffects && (
                              <p className="text-2xs text-rose-600 bg-rose-50/50 border border-rose-100 px-2 py-1 rounded-md max-w-md">
                                <span className="font-extrabold text-[8px] uppercase tracking-wider block">Obs colateral:</span>
                                {item.sideEffects}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditHistoricalLog(item)}
                              className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-400 hover:text-teal-600 transition-colors shrink-0 outline-none cursor-pointer"
                              title="Editar ajuste do histórico"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveHistoricalLog(item.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0 outline-none cursor-pointer"
                              title="Remover ajuste do histórico"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl block select-none">
                        <History size={18} className="text-slate-305 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-400 font-semibold">Sem alterações de dose atreladas ao histórico deste tratamento.</p>
                      </div>
                    )}
                  </div>

                </div>

              </form>

              {/* Footer controls */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-250 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleSaveMedicationForm}
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 text-xs gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{isSubmitting ? 'Salvando...' : 'Salvar Registro'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
