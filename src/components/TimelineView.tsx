import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Pill, 
  Stethoscope, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ArrowRight,
  TrendingDown,
  FileText,
  User,
  HeartPulse,
  Trash2
} from 'lucide-react';
import { useData, useToast } from '../App';
import { ContinuousMedication, UserPathology, MedicalRecord } from '../data';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';

// Helper to parse JSON notes
function getMedicationHistory(med: ContinuousMedication) {
  if (med.notes && med.notes.trim().startsWith('{') && med.notes.trim().endsWith('}')) {
    try {
      const parsed = JSON.parse(med.notes.trim());
      return parsed.history || [];
    } catch (e) {
      // fallback
    }
  }
  return med.dosageHistory || [];
}

export function TimelineView() {
  const { 
    medications, 
    userPathologies, 
    exams, 
    customEvents, 
    saveCustomEvent, 
    deleteCustomEvent, 
    user 
  } = useData();
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState<'6M' | '1Y' | 'ALL'>('6M');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreset, setActivePreset] = useState<'ALL' | 'CARDIO_RENAL' | 'NEURO_PSYCH' | 'GASTRO'>('ALL');
  
  const [activeFilters, setActiveFilters] = useState({
    pathologies: true,
    medications: true,
    doseChanges: true,
    exams: true,
    custom: true
  });

  // Modal form states for adding custom events
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCategory, setNewCategory] = useState<'MEDICINE' | 'SURGERY' | 'DIAGNOSIS' | 'SYMPTOM' | 'EXAM' | 'OTHER'>('OTHER');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedCorrelationMed, setSelectedCorrelationMed] = useState<string>('Trezor (Rosuvastatina)');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const getCustomEventPresentation = (category: 'MEDICINE' | 'SURGERY' | 'DIAGNOSIS' | 'SYMPTOM' | 'EXAM' | 'OTHER') => {
    switch (category) {
      case 'MEDICINE':
        return {
          type: 'CUSTOM_MEDICINE',
          label: 'Anotação Terapêutica',
          icon: <Pill className="text-teal-400" size={16} />,
          badgeBg: 'bg-teal-950/40 text-teal-300 border-teal-900/50'
        };
      case 'SURGERY':
        return {
          type: 'CUSTOM_SURGERY',
          label: 'Procedimento',
          icon: <Activity className="text-amber-400" size={16} />,
          badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-900/50'
        };
      case 'DIAGNOSIS':
        return {
          type: 'CUSTOM_DIAGNOSIS',
          label: 'Diagnóstico Manual',
          icon: <Stethoscope className="text-rose-400" size={16} />,
          badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-900/50'
        };
      case 'SYMPTOM':
        return {
          type: 'CUSTOM_SYMPTOM',
          label: 'Sintoma/Relato',
          icon: <HeartPulse className="text-fuchsia-400" size={16} />,
          badgeBg: 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-900/50'
        };
      case 'EXAM':
        return {
          type: 'CUSTOM_EXAM',
          label: 'Observação de Exame',
          icon: <FileText className="text-violet-400" size={16} />,
          badgeBg: 'bg-violet-950/40 text-violet-300 border-violet-900/50'
        };
      default:
        return {
          type: 'CUSTOM_OTHER',
          label: 'Anotação Livre',
          icon: <Sparkles className="text-indigo-400" size={16} />,
          badgeBg: 'bg-indigo-950/40 text-indigo-300 border-indigo-900/50'
        };
    }
  };

  const getEventTypeLabel = (evt: any) => {
    switch (evt.type) {
      case 'PATHOLOGY':
        return 'Patologia';
      case 'MED_START':
        return 'Início de Fármaco';
      case 'MED_END':
        return 'Tratamento Suspenso';
      case 'DOSE_CHANGE':
        return 'Alteração de Dose';
      case 'EXAM':
        return 'Resultado Exame';
      default:
        return evt.typeLabel || 'Evento';
    }
  };

  const formatEventDate = (evt: any) => {
    if (evt.isCongenital) return 'Desde a Infância';
    if (!evt.date) return 'Sem data';
    return evt.date.split('-').reverse().join('/');
  };

  const handleSaveCustomEvent = async () => {
    if (!newTitle.trim() || !newDate) {
      addToast('Preencha pelo menos o título e a data do evento.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveCustomEvent({
        title: newTitle.trim(),
        date: newDate,
        category: newCategory,
        description: newDescription.trim()
      });
      setNewTitle('');
      setNewDate('');
      setNewCategory('OTHER');
      setNewDescription('');
      setIsAddModalOpen(false);
      addToast('Evento adicionado à linha do tempo.', 'success');
    } catch {
      addToast('Erro ao salvar o evento manual.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomEvent = async (eventId: string) => {
    try {
      await deleteCustomEvent(eventId);
      addToast('Evento manual removido.', 'success');
    } catch {
      addToast('Erro ao remover o evento manual.', 'error');
    }
  };

  // Dynamic filter lists based on active preset (brainstorming insight: reduce visual noise/alarm fatigue)
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const name = med.name.toLowerCase();
      if (activePreset === 'CARDIO_RENAL') {
        return name.includes('trezor') || name.includes('rosuvastatina') || name.includes('pregabalina');
      }
      if (activePreset === 'NEURO_PSYCH') {
        return name.includes('venvanse') || name.includes('velija') || name.includes('duloxetina') || name.includes('pregabalina') || name.includes('quetiapina');
      }
      if (activePreset === 'GASTRO') {
        return name.includes('omeprazol') || name.includes('pantoprazol');
      }
      return true; // ALL
    });
  }, [medications, activePreset]);

  const filteredPathologies = useMemo(() => {
    return userPathologies.filter(path => {
      const cond = path.condition.toLowerCase();
      if (activePreset === 'CARDIO_RENAL') {
        return cond.includes('iga') || cond.includes('nefropatia') || cond.includes('renal') || cond.includes('pressão') || cond.includes('hipertensão');
      }
      if (activePreset === 'NEURO_PSYCH') {
        return cond.includes('tdah') || cond.includes('ansiedade') || cond.includes('depressão') || cond.includes('fibromialgia') || cond.includes('dor') || cond.includes('insônia');
      }
      if (activePreset === 'GASTRO') {
        return cond.includes('esofagite') || cond.includes('gastrite') || cond.includes('estômago') || cond.includes('hiato') || cond.includes('duodenite');
      }
      return true;
    });
  }, [userPathologies, activePreset]);

  const filteredExamsList = useMemo(() => {
    return exams.filter(exam => {
      const name = exam.nomeExame.toLowerCase();
      if (activePreset === 'CARDIO_RENAL') {
        return ['colesterol', 'ldl', 'hdl', 'vldl', 'triglicerides', 'triglicerídeos', 'creatinina', 'tfg', 'filtração', 'ureia', 'uréia'].some(t => name.includes(t));
      }
      if (activePreset === 'NEURO_PSYCH') {
        return ['pcr', 'proteína c reativa', 'vhs', 'hemossedimentação', 'vitamina d', 'b12'].some(t => name.includes(t));
      }
      if (activePreset === 'GASTRO') {
        return ['hemograma', 'plaquetas', 'ferro', 'ferritina', 'h. pylori'].some(t => name.includes(t));
      }
      return true;
    });
  }, [exams, activePreset]);

  // Helper to determine dose strength intensity styling (LifeLines concept: height & color density encoding)
  const getDoseIntensityStyle = (medName: string, dose: string) => {
    const name = medName.toLowerCase();
    const numericVal = parseFloat(dose.replace(/[^0-9.]/g, ''));
    if (isNaN(numericVal)) {
      return {
        height: 'h-6',
        bgClass: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/20 text-[10px]',
        label: dose
      };
    }

    let intensity: 'low' | 'medium' | 'high' = 'medium';
    if (name.includes('pregabalina')) {
      if (numericVal <= 75) intensity = 'low';
      else if (numericVal >= 300) intensity = 'high';
    } else if (name.includes('velija') || name.includes('duloxetina')) {
      if (numericVal <= 30) intensity = 'low';
      else if (numericVal >= 90) intensity = 'high';
    } else if (name.includes('trezor') || name.includes('rosuvastatina')) {
      if (numericVal <= 10) intensity = 'low';
      else if (numericVal >= 20) intensity = 'high';
    } else if (name.includes('metformina')) {
      if (numericVal <= 500) intensity = 'low';
      else if (numericVal >= 1500) intensity = 'high';
    } else {
      if (numericVal < 20) intensity = 'low';
      else if (numericVal >= 100) intensity = 'high';
    }

    if (intensity === 'low') {
      return {
        height: 'h-5 py-0.5',
        bgClass: 'bg-indigo-950/20 text-indigo-400/90 border-indigo-900/30 text-[9px] font-medium',
        label: dose
      };
    } else if (intensity === 'high') {
      return {
        height: 'h-8 py-1.5',
        bgClass: 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/10 text-[11px] font-extrabold',
        label: `${dose} 🔥`
      };
    } else {
      return {
        height: 'h-6 py-1',
        bgClass: 'bg-indigo-600/40 text-indigo-200 border-indigo-500/20 text-[10px] font-semibold',
        label: dose
      };
    }
  };

  // Generate date list for the timeline columns (months)
  const timelineMonths = useMemo(() => {
    const months: string[] = [];
    const today = new Date();
    let numMonths = 6;
    if (selectedPeriod === '1Y') numMonths = 12;
    else if (selectedPeriod === 'ALL') numMonths = 24; // Limit to 2 years for grid layout sanity

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }
    return months;
  }, [selectedPeriod]);

  // Format month name for display (e.g. "Jan/26")
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const idx = parseInt(month, 10) - 1;
    return `${monthNames[idx]}/${year.substring(2)}`;
  };

  // Get active dose of a medication in a specific month
  const getDoseForMonth = (med: ContinuousMedication, monthStr: string) => {
    const startMonth = med.startDate ? med.startDate.substring(0, 7) : '';
    const endMonth = med.endDate ? med.endDate.substring(0, 7) : '';
    
    if (startMonth && monthStr < startMonth) return null;
    if (endMonth && monthStr > endMonth) return null;
    
    const history = getMedicationHistory(med);
    const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
    
    let activeDose = null;
    
    // Check history entries
    for (let i = 0; i < sortedHistory.length; i++) {
      const entry = sortedHistory[i];
      const entryMonth = entry.date.substring(0, 7);
      if (entryMonth <= monthStr) {
        activeDose = entry.dosage;
      }
    }
    
    // Fallback if no history entry fits but medication is started
    if (!activeDose && startMonth && monthStr >= startMonth) {
      if (sortedHistory.length > 0) {
        // Initial dose before first recorded change was probably the first history entry
        activeDose = sortedHistory[0].dosage;
      } else {
        activeDose = med.dosage;
      }
    }
    
    return activeDose;
  };

  // Compile all clinical events for list and chart reference (using filtered lists to match active preset)
  const allEvents = useMemo(() => {
    const events: any[] = [];

    // 1. Pathologies
    if (activeFilters.pathologies) {
      filteredPathologies.forEach(path => {
        // Handle "De Nascença" or congenital by placing it far in the past or displaying in a special way
        const isCongenital = path.isCongenital || path.dateDetected === 'De Nascença';
        const date = isCongenital ? '1990-01-01' : path.dateDetected;
        events.push({
          id: `pathology-${path.id}`,
          type: 'PATHOLOGY',
          title: path.condition,
          date: date,
          isCongenital,
          status: path.status,
          description: path.description || 'Nenhuma descrição detalhada informada.',
          icon: <Stethoscope className="text-rose-400" size={16} />,
          badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-900/50',
          raw: path
        });
      });
    }

    // 2. Medications & Dose Changes
    filteredMedications.forEach(med => {
      // Medication Start
      if (activeFilters.medications && med.startDate) {
        events.push({
          id: `med-start-${med.id}`,
          type: 'MED_START',
          title: `Início de ${med.name}`,
          date: med.startDate,
          dosage: med.dosage,
          frequency: med.frequency,
          description: `Prescrição inicial de ${med.name} (${med.dosage}) - Frequência: ${med.frequency}.`,
          icon: <Pill className="text-teal-400" size={16} />,
          badgeBg: 'bg-teal-950/40 text-teal-300 border-teal-900/50',
          raw: med
        });
      }

      // Medication End
      if (activeFilters.medications && med.endDate) {
        events.push({
          id: `med-end-${med.id}`,
          type: 'MED_END',
          title: `Suspensão de ${med.name}`,
          date: med.endDate,
          dosage: med.dosage,
          description: `Uso contínuo de ${med.name} finalizado ou suspenso pelo médico.`,
          icon: <Clock className="text-slate-400" size={16} />,
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          raw: med
        });
      }

      // Dose Alterations
      if (activeFilters.doseChanges) {
        const history = getMedicationHistory(med);
        // Exclude the initial entry if it equals the start date to avoid duplication
        const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
        
        sortedHistory.forEach((h, index) => {
          const prevDose = index > 0 ? sortedHistory[index - 1].dosage : null;
          
          events.push({
            id: `med-change-${med.id}-${h.id || index}`,
            type: 'DOSE_CHANGE',
            title: `Ajuste de Dose: ${med.name}`,
            date: h.date,
            dosage: h.dosage,
            previousDosage: prevDose,
            notes: h.notes,
            sideEffects: h.sideEffects,
            doctorName: h.doctorName || 'Médico Assistente',
            description: `Dose ajustada para ${h.dosage}.${prevDose ? ` (Dose anterior: ${prevDose})` : ''} ${h.notes ? ` Notas: ${h.notes}` : ''}`,
            icon: <TrendingUp className="text-sky-400" size={16} />,
            badgeBg: 'bg-sky-950/40 text-sky-300 border-sky-900/50',
            raw: h
          });
        });
      }
    });

    // 3. Exams / Biomarkers
    if (activeFilters.exams) {
      filteredExamsList.forEach(exam => {
        // Only include major lab results of category SANGUE or other relevant markers
        if (exam.categoria === 'SANGUE') {
          events.push({
            id: `exam-${exam.id}`,
            type: 'EXAM',
            title: `${exam.nomeExame}: ${exam.resultado} ${exam.unidade}`,
            date: exam.dataExame,
            value: exam.resultado,
            unit: exam.unidade,
            reference: exam.valorReferencia,
            interpretation: exam.interpretacao,
            description: `Exame de sangue analisado. Resultado: ${exam.resultado} ${exam.unidade} (Referência: ${exam.valorReferencia}). Solicitante: ${exam.medicoSolicitante || 'Não informado'}.`,
            icon: <FileText className="text-violet-400" size={16} />,
            badgeBg: exam.interpretacao === 'Alterado' ? 'bg-amber-950/40 text-amber-300 border-amber-900/50' : 'bg-violet-950/40 text-violet-300 border-violet-900/50',
            raw: exam
          });
        }
      });
    }

    if (activeFilters.custom) {
      customEvents.forEach(event => {
        const presentation = getCustomEventPresentation(event.category);
        events.push({
          id: `custom-${event.id}`,
          sourceId: event.id,
          type: presentation.type,
          typeLabel: presentation.label,
          title: event.title,
          date: event.date,
          category: event.category,
          description: event.description || 'Evento manual sem detalhes adicionais.',
          icon: presentation.icon,
          badgeBg: presentation.badgeBg,
          isCustom: true,
          raw: event
        });
      });
    }

    // Sort events descending by date
    return events.sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredMedications, filteredPathologies, filteredExamsList, activeFilters, customEvents]);

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return allEvents;
    const query = searchQuery.toLowerCase();
    return allEvents.filter(e => 
      e.title.toLowerCase().includes(query) || 
      e.description.toLowerCase().includes(query) ||
      (e.dosage && e.dosage.toLowerCase().includes(query)) ||
      (e.typeLabel && e.typeLabel.toLowerCase().includes(query))
    );
  }, [allEvents, searchQuery]);

  // Compute Drug-Drug Interaction Safety Alerts (Drug Guard)
  const drugInteractionAlerts = useMemo(() => {
    const alerts: { type: 'DANGER' | 'WARNING'; message: string; title: string }[] = [];
    const activeMeds = medications.filter(m => m.isActive).map(m => m.name.toLowerCase());
    const activePathologies = userPathologies.filter(p => p.status === 'Ativo').map(p => p.condition.toLowerCase());

    // 1. Venvanse + Velija (Duloxetina)
    if (activeMeds.some(m => m.includes('venvanse')) && activeMeds.some(m => m.includes('velija') || m.includes('duloxetina'))) {
      alerts.push({
        type: 'WARNING',
        title: 'Venvanse + Velija (Duloxetina)',
        message: 'Risco moderado de aumento da pressão arterial, frequência cardíaca ou, em casos raros, síndrome serotoninérgica. Recomenda-se monitorar sintomas autonômicos e cardíacos.'
      });
    }

    // 2. Duloxetina + Pregabalina
    if (activeMeds.some(m => m.includes('velija') || m.includes('duloxetina')) && activeMeds.some(m => m.includes('pregabalina'))) {
      alerts.push({
        type: 'WARNING',
        title: 'Velija + Pregabalina',
        message: 'A associação de antidepressivos com gabapentinoides pode potencializar o efeito sedativo no Sistema Nervoso Central, elevando a sonolência, tontura e lentidão cognitiva no início ou em mudanças de dose.'
      });
    }

    // 3. Gastrite/Esofagite + AINEs (Ibuprofeno/Cetoprofeno)
    const hasGastricPathology = activePathologies.some(p => 
      p.includes('esofagite') || p.includes('pangastrite') || p.includes('duodenite') || p.includes('hiato')
    );
    if (hasGastricPathology) {
      alerts.push({
        type: 'DANGER',
        title: 'Histórico Gástrico + Risco de AINEs',
        message: 'Paciente possui esofagite, pangastrite e hérnia de hiato ativa. Evitar o uso frequente ou desprotegido de Anti-inflamatórios Não Esteroidais (como Ibuprofeno, Nimesulida, Diclofenaco) pelo risco crítico de lesões e hemorragia digestiva.'
      });
    }

    // 4. Nefropatia por IgA + monitoramento renal
    if (activePathologies.some(p => p.includes('iga') || p.includes('nefropatia'))) {
      alerts.push({
        type: 'WARNING',
        title: 'Nefropatia por IgA & Pregabalina',
        message: 'A Pregabalina é de eliminação renal. Como há diagnóstico de Nefropatia por IgA, a taxa de filtração renal (creatinina/clearance) deve ser monitorada regularmente para ajustar a dosagem se necessário.'
      });
    }

    return alerts;
  }, [medications, userPathologies]);

  // Compile biomarker correlation data for the selected medication
  const correlationData = useMemo(() => {
    // 1. Identify which biomarker we want to correlate
    // Trezor (Rosuvastatina) -> LDL / Colesterol Total
    // Metformina (if exists) -> HbA1c / Glicose
    // Velija (Duloxetina) / Pregabalina -> PCR (Inflammatory marker)
    let targetExams: string[] = [];
    if (selectedCorrelationMed.includes('Trezor') || selectedCorrelationMed.includes('Rosuvastatina')) {
      targetExams = ['colesterol ldl', 'ldl', 'colesterol total', 'triglicerides', 'triglicerídeos'];
    } else if (selectedCorrelationMed.includes('Metformina')) {
      targetExams = ['hba1c', 'hemoglobina glicada', 'glicada', 'glicose'];
    } else if (selectedCorrelationMed.includes('Velija') || selectedCorrelationMed.includes('Pregabalina')) {
      targetExams = ['pcr', 'proteina c reativa', 'vhs', 'velocidade de hemossedimentacao'];
    }

    // Filter relevant exams
    const filteredExams = exams.filter(e => 
      e.categoria === 'SANGUE' && 
      targetExams.some(t => e.nomeExame.toLowerCase().includes(t))
    );

    // Extract values and dates
    const dataPoints = filteredExams.map(e => {
      // Clean up result numeric value
      const numericVal = parseFloat(e.resultado.replace(',', '.'));
      return {
        date: e.dataExame,
        displayDate: e.dataExame.split('-').reverse().slice(0, 2).join('/'), // DD/MM
        value: isNaN(numericVal) ? null : numericVal,
        examName: e.nomeExame
      };
    }).filter(d => d.value !== null);

    // Sort ascending by date for charts
    return dataPoints.sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, selectedCorrelationMed]);

  // Identify medication changes of selected correlation drug to overlay on the chart
  const correlationChanges = useMemo(() => {
    const med = medications.find(m => m.name.toLowerCase().includes(selectedCorrelationMed.split(' ')[0].toLowerCase()));
    if (!med) return [];

    const changes: { date: string; dosage: string }[] = [];
    
    // Add start date
    if (med.startDate) {
      changes.push({ date: med.startDate, dosage: `Início: ${med.dosage}` });
    }

    // Add history changes
    const history = getMedicationHistory(med);
    history.forEach((h: any) => {
      changes.push({ date: h.date, dosage: `Ajuste: ${h.dosage}` });
    });

    return changes;
  }, [medications, selectedCorrelationMed]);

  return (
    <div className="space-y-6 text-slate-100 animate-fadeIn">
      {/* Header Panel */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/60 overflow-hidden shadow-xl shadow-slate-950/20">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <History size={160} />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <History className="text-white" size={18} />
              </span>
              <h1 className="text-2xl font-extrabold font-sans tracking-tight text-white">Linha do Tempo Clínica Integrada</h1>
            </div>
            <p className="text-slate-450 mt-2 text-[13px] max-w-3xl leading-relaxed">
              Uma visualização cronológica e analítica cruzando diagnósticos de patologias, 
              medicamentos de uso contínuo, histórico de dosagens e exames de sangue correlacionados.
            </p>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shrink-0 self-start md:self-center">
            <button 
              onClick={() => setSelectedPeriod('6M')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedPeriod === '6M' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              6 Meses
            </button>
            <button 
              onClick={() => setSelectedPeriod('1Y')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedPeriod === '1Y' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1 Ano
            </button>
            <button 
              onClick={() => setSelectedPeriod('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedPeriod === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tudo
            </button>
          </div>
        </div>

        {/* Patient Profile Sub-bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400">
              <User size={18} />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Paciente</div>
              <div className="text-sm font-semibold">{user?.displayName || 'Rafael Minatto'}</div>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Patologias Ativas</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
              {userPathologies.filter(p => p.status === 'Ativo').length} Ativas
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Medicamentos Contínuos</div>
            <div className="text-sm font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
              {medications.filter(m => m.isActive).length} Ativos
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Alergias Conhecidas</div>
            <div className="text-sm font-semibold text-rose-450 mt-0.5">
              Penicilina (Reação de hipersensibilidade)
            </div>
          </div>
        </div>
      </div>

      {/* Specialty-Specific Presets (Clinical Views) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 shadow-lg shadow-slate-950/10">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Presets de Especialidade:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setActivePreset('ALL');
              setSelectedCorrelationMed('Trezor (Rosuvastatina)');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activePreset === 'ALL' ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'}`}
          >
            <Activity size={12} />
            Todas as Especialidades
          </button>
          <button
            onClick={() => {
              setActivePreset('CARDIO_RENAL');
              setSelectedCorrelationMed('Trezor (Rosuvastatina)');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activePreset === 'CARDIO_RENAL' ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'}`}
          >
            <HeartPulse size={12} />
            Cardio-Renal
          </button>
          <button
            onClick={() => {
              setActivePreset('NEURO_PSYCH');
              setSelectedCorrelationMed('Velija (Duloxetina)');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activePreset === 'NEURO_PSYCH' ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'}`}
          >
            <Stethoscope size={12} />
            Neuro-Psiquiátrico
          </button>
          <button
            onClick={() => {
              setActivePreset('GASTRO');
              setSelectedCorrelationMed('Metformina');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${activePreset === 'GASTRO' ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'}`}
          >
            <Pill size={12} />
            Gastrointestinal
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3 Content: Timelines & Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Swimlanes Visual Timeline Container */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-950/15">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold font-sans flex items-center gap-2 text-white">
                <Activity size={18} className="text-indigo-400" />
                Matriz de Correlação de Tratamento (Gantt)
              </h2>
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tempo / Raias Clínicas</span>
            </div>

            {/* Swimlanes Grid */}
            <div className="overflow-x-auto hide-scrollbar">
              <div className="min-w-[650px] space-y-4">
                {/* Months Header Row */}
                <div className="grid grid-cols-12 gap-1 text-center border-b border-slate-800/60 pb-3 mb-2">
                  <div className="col-span-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Raias Clínicas
                  </div>
                  <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2">
                    {timelineMonths.map(m => (
                      <div key={m} className="text-xs font-semibold text-slate-400">
                        {formatMonthName(m)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications Swimlanes */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mt-4 mb-2">Medicamentos</div>
                  {filteredMedications.length === 0 ? (
                    <div className="text-center py-4 text-sm text-slate-500 italic">Nenhum medicamento registrado.</div>
                  ) : (
                    filteredMedications.map(med => {
                      const history = getMedicationHistory(med);
                      const hasDoseChanges = history.length > 1;

                      return (
                        <div key={med.id} className="grid grid-cols-12 gap-1 items-center py-1">
                          {/* Med Label */}
                          <div className="col-span-3 flex items-center gap-2 pr-2 truncate">
                            <span className={`p-1.5 rounded-sm ${med.isActive ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-slate-800 text-slate-500'}`}>
                              <Pill size={13} />
                            </span>
                            <div className="truncate">
                              <div className={`text-xs font-bold truncate ${med.isActive ? 'text-slate-200' : 'text-slate-500 line-through'}`}>
                                {med.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">{med.frequency}</div>
                            </div>
                          </div>

                          {/* Med Timeline Blocks */}
                          <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2 h-9 items-center">
                            {timelineMonths.map(month => {
                              const dose = getDoseForMonth(med, month);
                              const isStartMonth = med.startDate && med.startDate.startsWith(month);
                              const isEndMonth = med.endDate && med.endDate.startsWith(month);

                              if (!dose) {
                                return <div key={month} className="bg-slate-950/20 rounded border border-dashed border-slate-900/50 h-6"></div>;
                              }

                              const intensityStyle = getDoseIntensityStyle(med.name, dose);

                              return (
                                <div 
                                  key={month} 
                                  className={`rounded relative flex items-center justify-center border transition-all ${intensityStyle.height} ${intensityStyle.bgClass}`}
                                  title={`${med.name} - Dose: ${intensityStyle.label}`}
                                >
                                  {intensityStyle.label}
                                  {isStartMonth && (
                                    <span className="absolute -left-1 -top-1 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                                    </span>
                                  )}
                                  {isEndMonth && (
                                    <span className="absolute -right-1 -bottom-1 flex h-2 w-2 rounded-full bg-rose-500"></span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pathologies Swimlane */}
                <div className="space-y-3 pt-3 border-t border-slate-800/40">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Patologias (Detecção)</div>
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="p-1.5 rounded-sm bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Stethoscope size={13} />
                      </span>
                      <span className="text-xs font-bold text-slate-300">Novos Diagnósticos</span>
                    </div>

                    <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2 h-6">
                      {timelineMonths.map(month => {
                        const pathologyDetectedInMonth = filteredPathologies.filter(p => 
                          p.dateDetected && p.dateDetected.startsWith(month)
                        );

                        if (pathologyDetectedInMonth.length === 0) {
                          return <div key={month} className="bg-slate-950/20 rounded border border-dashed border-slate-900/50"></div>;
                        }

                        return (
                          <div 
                            key={month} 
                            className="bg-rose-950/40 border border-rose-900/50 rounded flex items-center justify-center gap-1 cursor-help group relative h-full"
                          >
                            <Stethoscope size={12} className="text-rose-400 animate-pulse" />
                            <span className="text-[9px] font-bold text-rose-300">{pathologyDetectedInMonth.length}</span>
                            
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-950 border border-slate-800 p-2 rounded shadow-xl text-left hidden group-hover:block z-20 pointer-events-none">
                              <div className="text-[10px] font-bold text-rose-400 uppercase mb-1">Nova Patologia</div>
                              {pathologyDetectedInMonth.map((p, idx) => (
                                <div key={idx} className="text-[10px] text-slate-300 font-semibold mb-0.5">
                                  • {p.condition}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Blood Exams Swimlane */}
                <div className="space-y-3 pt-3 border-t border-slate-800/40">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">Exames Laboratoriais</div>
                  <div className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="p-1.5 rounded-sm bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <FileText size={13} />
                      </span>
                      <span className="text-xs font-bold text-slate-300">Marcadores Sanguíneos</span>
                    </div>

                    <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-2 h-6">
                      {timelineMonths.map(month => {
                        const examsInMonth = filteredExamsList.filter(e => 
                          e.categoria === 'SANGUE' && e.dataExame && e.dataExame.startsWith(month)
                        );

                        if (examsInMonth.length === 0) {
                          return <div key={month} className="bg-slate-950/20 rounded border border-dashed border-slate-900/50"></div>;
                        }

                        const hasAlteration = examsInMonth.some(e => e.interpretacao === 'Alterado');

                        return (
                          <div 
                            key={month} 
                            className={`border rounded flex items-center justify-center gap-1 cursor-help group relative h-full ${hasAlteration ? 'bg-amber-950/40 border-amber-900/50' : 'bg-violet-950/40 border-violet-900/50'}`}
                          >
                            <FileText size={12} className={hasAlteration ? 'text-amber-400' : 'text-violet-400'} />
                            <span className={`text-[9px] font-bold ${hasAlteration ? 'text-amber-300' : 'text-violet-300'}`}>{examsInMonth.length}</span>
                            
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-950 border border-slate-800 p-2.5 rounded shadow-xl text-left hidden group-hover:block z-20 pointer-events-none">
                              <div className="text-[10px] font-bold text-violet-400 uppercase mb-1.5">Exames no Mês</div>
                              <div className="space-y-1">
                                {examsInMonth.slice(0, 4).map((e, idx) => (
                                  <div key={idx} className="text-[10px] flex justify-between text-slate-300">
                                    <span className="truncate max-w-[120px]">{e.nomeExame}:</span>
                                    <span className={`font-mono font-bold ${e.interpretacao === 'Alterado' ? 'text-amber-400' : 'text-slate-400'}`}>
                                      {e.resultado} {e.unidade}
                                    </span>
                                  </div>
                                ))}
                                {examsInMonth.length > 4 && (
                                  <div className="text-[9px] text-slate-500 text-center pt-1 border-t border-slate-900 mt-1">
                                    + {examsInMonth.length - 4} outros exames
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Search, Category Filters and Chronological Feed */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-6 shadow-md">
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold font-sans flex items-center gap-2">
                    <History size={18} className="text-indigo-400" />
                    Histórico Clínico Detalhado
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Feed cronológico com datas em destaque, cards alternados e espaço para anotações manuais.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-950/40 transition-colors"
                >
                  <Plus size={15} />
                  Adicionar Evento
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">Eventos Visíveis</div>
                  <div className="text-2xl font-bold text-slate-100 mt-1">{filteredEvents.length}</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">Eventos Manuais</div>
                  <div className="text-2xl font-bold text-indigo-300 mt-1">{customEvents.length}</div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-bold">Último Registro</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    {filteredEvents[0] ? formatEventDate(filteredEvents[0]) : 'Sem registros'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Filtrar eventos por nome, fármaco, sintoma ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-md focus:border-indigo-500 focus:outline-none text-slate-200 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, pathologies: !prev.pathologies }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                    activeFilters.pathologies
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:text-slate-400'
                  }`}
                >
                  <Stethoscope size={12} />
                  Patologias
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, medications: !prev.medications }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                    activeFilters.medications
                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:text-slate-400'
                  }`}
                >
                  <Pill size={12} />
                  Medicamentos
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, doseChanges: !prev.doseChanges }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                    activeFilters.doseChanges
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:text-slate-400'
                  }`}
                >
                  <TrendingUp size={12} />
                  Ajustes de Dose
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, exams: !prev.exams }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                    activeFilters.exams
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:text-slate-400'
                  }`}
                >
                  <FileText size={12} />
                  Exames
                </button>

                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, custom: !prev.custom }))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 ${
                    activeFilters.custom
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      : 'bg-slate-950/40 text-slate-500 border-slate-850 hover:text-slate-400'
                  }`}
                >
                  <Sparkles size={12} />
                  Manuais
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 -translate-x-1/2"></div>
              <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-slate-800"></div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500 italic">
                  Nenhum evento corresponde aos filtros selecionados.
                </div>
              ) : (
                filteredEvents.map((evt, index) => {
                  const isExpanded = expandedEventId === evt.id;
                  const dateDisplay = formatEventDate(evt);
                  const isLeft = index % 2 === 0;

                  return (
                    <div key={evt.id} className={`relative mb-6 md:mb-8 flex ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
                      <span className="absolute left-4 md:left-1/2 top-8 md:top-10 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700 -translate-x-1/2 z-10">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                      </span>

                      <div className={`absolute top-5 left-10 ${isLeft ? 'md:left-1/2 md:ml-6' : 'md:left-auto md:right-1/2 md:mr-6'} z-10`}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300 shadow-lg shadow-slate-950/30">
                          <Calendar size={11} className="text-indigo-400" />
                          {dateDisplay}
                        </div>
                      </div>

                      <div className={`w-full pl-10 md:pl-0 md:w-[calc(50%-2rem)] ${isLeft ? 'md:pr-10' : 'md:pl-10'}`}>
                        <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all backdrop-blur-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span className="p-1.5 rounded-md bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                                {evt.icon}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${evt.badgeBg}`}>
                                    {getEventTypeLabel(evt)}
                                  </span>
                                  {evt.isCustom && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border border-indigo-900/50 text-indigo-300 bg-indigo-950/30">
                                      Manual
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-bold text-slate-100 leading-snug">{evt.title}</h3>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {evt.isCustom && (
                                <button
                                  onClick={() => handleDeleteCustomEvent(evt.raw.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                                  title="Excluir evento manual"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                                className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
                                title={isExpanded ? 'Recolher' : 'Expandir'}
                              >
                                {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                            {evt.description}
                          </p>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mt-3 pt-3 border-t border-slate-900 text-xs text-slate-400 space-y-2"
                              >
                                {evt.type === 'DOSE_CHANGE' && (
                                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded">
                                    {evt.previousDosage && (
                                      <div>
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Dose Anterior</span>
                                        <span className="font-semibold text-slate-300">{evt.previousDosage}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Nova Dose</span>
                                      <span className="font-semibold text-sky-400">{evt.dosage}</span>
                                    </div>
                                    {evt.notes && (
                                      <div className="col-span-2 border-t border-slate-900/60 pt-1.5 mt-1.5">
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Razão Clínica</span>
                                        <span className="text-slate-300 italic">"{evt.notes}"</span>
                                      </div>
                                    )}
                                    {evt.sideEffects && (
                                      <div className="col-span-2">
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Efeitos Colaterais Reportados</span>
                                        <span className="text-amber-400">{evt.sideEffects}</span>
                                      </div>
                                    )}
                                    {evt.doctorName && (
                                      <div className="col-span-2">
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Médico Responsável</span>
                                        <span className="text-slate-300">{evt.doctorName}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {evt.type === 'EXAM' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded font-mono">
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Resultado</span>
                                      <span className={`font-bold ${evt.interpretation === 'Alterado' ? 'text-amber-400' : 'text-slate-200'}`}>
                                        {evt.value} {evt.unit}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Valores de Referência</span>
                                      <span className="text-slate-400">{evt.reference}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Interpretação</span>
                                      <span className={`font-semibold ${evt.interpretation === 'Alterado' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {evt.interpretation}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {evt.type === 'PATHOLOGY' && (
                                  <div className="bg-slate-950/80 p-2.5 rounded space-y-1">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-slate-500 font-bold uppercase text-[9px]">Status Clínico</span>
                                      <span className="font-semibold text-slate-300">{evt.status}</span>
                                    </div>
                                    {evt.raw.isCongenital && (
                                      <div className="text-[10px] text-amber-500/80 italic font-semibold">
                                        Condição preexistente (congênita).
                                      </div>
                                    )}
                                  </div>
                                )}

                                {evt.isCustom && (
                                  <div className="bg-slate-950/80 p-2.5 rounded space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Categoria</span>
                                        <span className="text-slate-300">{evt.raw.category}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-500 font-bold uppercase text-[9px] block">Data do Evento</span>
                                        <span className="text-slate-300">{dateDisplay}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 font-bold uppercase text-[9px] block">Detalhes</span>
                                      <p className="text-slate-300 leading-relaxed">
                                        {evt.raw.description || 'Sem detalhes adicionais registrados.'}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <AnimatePresence>
              {isAddModalOpen && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100">Adicionar Evento Manual</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Registre datas importantes, sintomas, procedimentos ou observações pessoais.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsAddModalOpen(false)}
                        className="text-slate-500 hover:text-slate-300 p-2 rounded-md transition-colors"
                      >
                        <ChevronDown size={16} className="rotate-45" />
                      </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold block mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Ex.: Início de fisioterapia, crise de dor, retorno com nefrologista..."
                          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold block mb-2">
                          Data
                        </label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-100"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold block mb-2">
                          Categoria
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-100"
                        >
                          <option value="OTHER">Anotação Livre</option>
                          <option value="SYMPTOM">Sintoma</option>
                          <option value="DIAGNOSIS">Diagnóstico</option>
                          <option value="MEDICINE">Medicamento</option>
                          <option value="EXAM">Exame</option>
                          <option value="SURGERY">Procedimento</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[11px] uppercase tracking-[0.18em] text-slate-500 font-bold block mb-2">
                          Detalhes
                        </label>
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          rows={5}
                          placeholder="Descreva o contexto clínico, orientações médicas, sintomas percebidos ou qualquer observação relevante."
                          className="w-full px-3 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:border-indigo-500 focus:outline-none text-slate-100 resize-none"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-800 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/40">
                      <p className="text-xs text-slate-500">
                        Os eventos salvos entram automaticamente na linha do tempo e podem ser excluídos depois.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 rounded-md border border-slate-700 text-slate-300 hover:text-slate-100 hover:border-slate-600 text-sm font-semibold transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveCustomEvent}
                          disabled={isSubmitting}
                          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors inline-flex items-center gap-2"
                        >
                          <Plus size={14} />
                          {isSubmitting ? 'Salvando...' : 'Salvar Evento'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right 1/3 Content: Insights Sidebar */}
        <div className="space-y-6">
          
          {/* Safety Interaction Alerts (Drug Guard) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-950/15">
            <h2 className="text-lg font-bold font-sans flex items-center gap-2 mb-4 text-white">
              <AlertCircle size={18} className="text-rose-450 animate-pulse animate-breathe" />
              Guarda Farmacológica
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Monitoramento automatizado de interações medicamentosas e compatibilidades de patologias para os tratamentos ativos.
            </p>

            <div className="space-y-3">
              {drugInteractionAlerts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span className="text-xs font-semibold">Nenhuma interação medicamentosa detectada.</span>
                </div>
              ) : (
                drugInteractionAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex gap-3 ${
                      alert.type === 'DANGER' 
                        ? 'bg-rose-500/10 border-rose-500/15 text-rose-300' 
                        : 'bg-amber-500/10 border-amber-500/15 text-amber-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <AlertTriangle size={16} className={alert.type === 'DANGER' ? 'text-rose-450' : 'text-amber-450'} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold font-sans uppercase tracking-wide">{alert.title}</h4>
                      <p className="text-[11px] leading-relaxed text-slate-400">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dose-Biomarker Graph (Dose vs Lab Result Correlation) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/60 rounded-3xl p-6 shadow-xl shadow-slate-950/15">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-sans flex items-center gap-2 text-white">
                <Sparkles size={18} className="text-indigo-400" />
                Correlação Dose-Efeito
              </h2>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Analise a resposta biológica de exames laboratoriais cruzada com as datas das alterações de doses.
            </p>

            {/* Selector for Med/Biomarker to map */}
            <div className="mb-4">
              <label className="label-micro !mb-1 text-slate-500">Selecionar Medicamento</label>
              <select 
                value={selectedCorrelationMed}
                onChange={(e) => setSelectedCorrelationMed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-900/60 transition-colors"
              >
                <option value="Trezor (Rosuvastatina)">Trezor (LDL Cholesterol)</option>
                <option value="Metformina">Metformina (Glicose / HbA1c)</option>
                <option value="Velija (Duloxetina)">Velija / Pregabalina (PCR - Inflamação)</option>
              </select>
            </div>

            {/* Biomarker Chart */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/60">
              <div className="text-[10px] text-center text-indigo-450 font-bold uppercase tracking-wider mb-3">
                Curva de Biomarcador ({selectedCorrelationMed.split(' ')[0]})
              </div>
              
              {correlationData.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 italic">
                  Dados de exames insuficientes para traçar gráfico de correlação para este marcador.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                        <XAxis 
                          dataKey="displayDate" 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false} 
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={9} 
                          tickLine={false} 
                          domain={['auto', 'auto']}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(9, 13, 22, 0.92)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: '12px',
                            fontSize: '10px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                          }}
                          labelStyle={{ color: '#818cf8', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                          itemStyle={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2196f3" 
                          strokeWidth={2}
                          dot={{ r: 4, stroke: '#2196f3', strokeWidth: 2, fill: '#0a0f1d' }}
                          activeDot={{ r: 6 }} 
                        />
                        
                        {/* Overlay dose changes as vertical reference lines */}
                        {correlationChanges.map((change, idx) => (
                          <ReferenceLine 
                            key={idx}
                            x={change.date.split('-').reverse().slice(0, 2).join('/')}
                            stroke="#fbbf24" 
                            strokeDasharray="3 3" 
                            label={{ 
                              value: change.dosage, 
                              fill: '#f59e0b', 
                              fontSize: 7, 
                              position: 'insideTopRight' 
                            }} 
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Correlations log list */}
                  <div className="space-y-2 border-t border-slate-900 pt-3">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Linha do tempo de alterações</span>
                    {correlationChanges.map((change, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[10px] bg-slate-900/60 p-1.5 rounded">
                        <span className="font-mono text-slate-400">{change.date.split('-').reverse().join('/')}</span>
                        <span className="font-semibold text-amber-400">{change.dosage}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Insights Checklist */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-6 shadow-md">
            <h2 className="text-lg font-bold font-sans flex items-center gap-2 mb-4">
              <Info size={18} className="text-indigo-400" />
              Notas e Condutas Recomendadas
            </h2>
            
            <ul className="space-y-3 text-[11px] leading-relaxed text-slate-400">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>
                  <strong>HbA1c & Metformina:</strong> Como o paciente possui diabetes, exames de HbA1c devem ser repetidos a cada 3 a 6 meses para avaliar a resposta e estabilização de dose da Metformina.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>
                  <strong>LIPIDOGRAMA & Trezor:</strong> O Trezor (Rosuvastatina) foi iniciado. Recomenda-se realizar perfil lipídico de controle (Colesterol LDL e Triglicérides) após 6 a 8 semanas para avaliar conformidade de meta terapêutica.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>
                  <strong>Monitorização da Insônia:</strong> Caso o uso de Venvanse de manhã cause agravamento da insônia à noite, discutir com o médico assistente o horário exato da ingestão do estimulante ou reavaliar o suporte da Quetiapina.
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
