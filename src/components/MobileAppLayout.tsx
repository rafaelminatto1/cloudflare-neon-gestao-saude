import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, FileText, HeartPulse, Sparkles, Menu, Search, 
  ChevronRight, Calendar, User, Database, Table, 
  AlertCircle, AlertTriangle, CheckCircle, Info, ArrowLeft,
  X, Send, Loader2, Plus, UploadCloud, Stethoscope, BookOpen, 
  Pill, Link as LinkIcon, ExternalLink, ChevronDown, Trash2, 
  Smartphone, Share2, ClipboardList, PieChart, RefreshCw, Key, Layers, History, MapPin
} from 'lucide-react';
import { useData, getCategoryStyles, ComparisonView, SourcesView } from '../App';
import { getAutoCategory } from '../data';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import { PathologiesView } from './PathologiesView';
import { MedicationsView } from './MedicationsView';
import { VisualAnalysis } from './VisualAnalysis';
import DictionaryView from './DictionaryView';
import CrossReferencingView from './CrossReferencingView';
import DoctorsView from './DoctorsView';
import ExamOrdersView from './ExamOrdersView';
import { ProfileView } from './ProfileView';
import { MedicalConsultationView } from './MedicalConsultationView';
import { TimelineView } from './TimelineView';

interface MobileAppLayoutProps {
  onNavigate?: (tab: string, params?: any) => void;
  signOut: () => void;
}

export default function MobileAppLayout({ onNavigate, signOut }: MobileAppLayoutProps) {
  const { 
    processedExams = [], 
    allSources = [], 
    userPathologies = [], 
    medications = [], 
    appointments = [],
    comparativeData = [],
    isSyncingDrive,
    lastDriveSyncTime,
    executeDriveSync,
    user
  } = useData();

  // Mobile Bottom Tab Bar state
  const [mobileTab, setMobileTab] = useState<'inicio' | 'exames' | 'evolucao' | 'ia-doctor' | 'mais'>('inicio');
  
  // Custom states
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>('');
  const [activeBentoTab, setActiveBentoTab] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync state with hash on mount/hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setMobileTab('inicio');
        setActiveBentoTab(null);
        setSelectedExamId(null);
        return;
      }

      if (hash.startsWith('bento-')) {
        const bentoKey = hash.replace('bento-', '');
        setMobileTab('mais');
        setActiveBentoTab(bentoKey);
        setSelectedExamId(null);
      } else if (hash.startsWith('exam-')) {
        const examId = hash.replace('exam-', '');
        setSelectedExamId(examId);
      } else {
        const validMobileTabs = ['inicio', 'exames', 'evolucao', 'ia-doctor', 'mais'];
        if (validMobileTabs.includes(hash)) {
          setMobileTab(hash as any);
          setActiveBentoTab(null);
          setSelectedExamId(null);
        }
      }
    };

    if (!window.location.hash) {
      window.location.hash = 'inicio';
    } else {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Chat/IA specific states
  const [messages, setMessages] = useState<{ sender: 'user' | 'sys'; text: string; suggestedFollowUps?: string[] }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Core Stats Math
  const normalCount = processedExams.filter(e => e.interpretacao === 'Normal').length;
  const suboptimalCount = processedExams.filter(e => e.interpretacao === 'Sub-ópt.').length;
  const alteredCount = processedExams.filter(e => e.interpretacao === 'Alterado').length;
  const totalExams = processedExams.length || 1;
  const healthScore = Math.round((normalCount / totalExams) * 100);

  const categoryCounts = useMemo(() => {
    const counts = { SANGUE: 0, URINA: 0, FEZES: 0, IMAGEM: 0, LAUDO: 0, RELATÓRIO: 0, OUTROS: 0 };
    processedExams.forEach(exam => {
      const cat = (exam.categoria || '').toUpperCase().trim();
      if (cat === 'SANGUE' || cat === 'URINA' || cat === 'FEZES' || cat === 'IMAGEM' || cat === 'LAUDO' || cat === 'RELATÓRIO' || cat === 'OUTROS') {
        counts[cat as keyof typeof counts]++;
      } else if (cat === 'LAB') {
        counts.SANGUE++;
      } else if (cat === 'AVALIAÇÃO') {
        counts.LAUDO++;
      } else {
        counts.OUTROS++;
      }
    });
    return counts;
  }, [processedExams]);

  // Set default selected biomarker once comparativeData is loaded
  useEffect(() => {
    if (comparativeData.length > 0 && !selectedBiomarker) {
      // Find popular ones first
      const names = comparativeData.map(d => d.testName);
      const popular = ['Glicose', 'Colesterol Total', 'TSH', 'Triglicerídeos', 'Creatinina', 'Hemoglobina'];
      const found = popular.find(p => names.some(n => n.toLowerCase().includes(p.toLowerCase())));
      setSelectedBiomarker(found || names[0]);
    }
  }, [comparativeData, selectedBiomarker]);

  // Clean exam lookup
  const selectedExam = useMemo(() => {
    if (!selectedExamId) return null;
    return processedExams.find(e => e.id === selectedExamId) || null;
  }, [selectedExamId, processedExams]);

  // AI Semantic Search State
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<any[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) { setAiSearchResults(null); return; }
    setIsAiSearching(true);
    try {
      const resp = await fetchWithRetry("/api/search-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await resp.json();
      if (data.exams) {
        setAiSearchResults(data.exams);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Filtered Exams
  const filteredExams = useMemo(() => {
    let result = processedExams;
    
    if (isAiMode && aiSearchResults !== null) {
      return aiSearchResults;
    }

    return processedExams.filter(exam => {
      // Category filter
      if (categoryFilter !== 'Todas') {
        const cat = (exam.categoria || '').toUpperCase().trim();
        let match = false;
        if (categoryFilter === 'SANGUE') match = cat === 'SANGUE' || cat === 'LAB';
        else if (categoryFilter === 'LAUDO') match = cat === 'LAUDO' || cat === 'AVALIAÇÃO';
        else match = cat === categoryFilter;
        if (!match) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const name = (exam.nomeExame || '').toLowerCase();
        const res = (exam.resultado || '').toLowerCase();
        const obs = (exam.observacoes || '').toLowerCase();
        return name.includes(query) || res.includes(query) || obs.includes(query);
      }

      return true;
    });
  }, [processedExams, categoryFilter, searchQuery, isAiMode, aiSearchResults]);

  // Chart dataset processing
  const chartData = useMemo(() => {
    if (!selectedBiomarker) return [];
    const marker = comparativeData.find(d => d.testName === selectedBiomarker);
    if (!marker) return [];

    return Object.entries(marker.history)
      .map(([date, histEntry]: [string, any]) => ({
        date,
        formattedDate: date.substring(0, 10),
        valStr: histEntry.value,
        value: typeof histEntry.numValue === 'number' ? histEntry.numValue : parseFloat(histEntry.value),
        interpretacao: histEntry.interpretacao
      }))
      .sort((a, b) => {
        const [da, ma, aa] = a.date.split('/');
        const [db, mb, ab] = b.date.split('/');
        return new Date(Number(aa), Number(ma) - 1, Number(da)).getTime() - new Date(Number(ab), Number(mb) - 1, Number(db)).getTime();
      });
  }, [selectedBiomarker, comparativeData]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiLoading]);

  // Handle Send to AI
  const handleSendChatMessage = async (textToSubmit?: string) => {
    const text = textToSubmit ? textToSubmit.trim() : inputValue.trim();
    if (!text) return;

    if (!textToSubmit) {
      setInputValue('');
    }

    const currentHistory = [...messages];
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setIsAiLoading(true);

    const storedProfile = localStorage.getItem(`health_tracker_profile_${user?.uid}`);
    let profileData = null;
    if (storedProfile) {
      try {
        profileData = JSON.parse(storedProfile);
      } catch (e) {
        // ignore
      }
    }

    try {
      const resp = await fetchWithRetry("/api/chat-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: text,
          history: currentHistory,
          contextData: {
            comparativeData,
            pathologies: userPathologies,
            medications,
            profile: profileData
          }
        })
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Erro na solicitação");
      }
      const data = await resp.json();
      setMessages(prev => [...prev, { 
        sender: 'sys', 
        text: data.answer, 
        suggestedFollowUps: data.suggestedFollowUps 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        sender: 'sys', 
        text: "Houve um problema de rede ao falar com meus servidores médicos. Por favor, tente novamente de forma compacta." 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Quick prompt triggers
  const chatPrompts = [
    { label: "Análise Geral de Sangue 🩸", prompt: "Faça uma recomendação geral integrativa baseada em todos os meus exames de sangue recentes." },
    { label: "Atenção a Autoimunes 🛡️", prompt: "Quais marcadores mostram tendência de inflamação relevante para patologias autoimunes?" },
    { label: "Checklist de TDAH & Sono 🧠", prompt: "Como posso modular meu estresse físico, sono e foco clínico baseados nos meus dados?" }
  ];

  const handleSyncDrive = async () => {
    setIsSyncing(true);
    try {
      if (executeDriveSync) {
        await executeDriveSync();
      } else {
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans select-none overflow-hidden relative">
      
      {/* 1. STATEFUL OVERLAY MODAL FOR BENTO MENUS */}
      <AnimatePresence>
        {activeBentoTab && (
          <motion.div 
            initial={{ opacity: 0, x: '100vw' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100vw' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden"
          >
            {/* Bento top header */}
            <div className="h-14 bg-slate-900 text-white px-4 flex items-center justify-between border-b border-slate-800">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white"
              >
                <ArrowLeft size={18} />
                <span>Voltar</span>
              </button>
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-teal-400">
                {activeBentoTab === 'pathologies' ? 'Patologias e Condições' :
                 activeBentoTab === 'medications' ? 'Medicamento Contínuo' :
                 activeBentoTab === 'appointments' ? 'Agenda de Saúde' :
                 activeBentoTab === 'doctors' ? 'Corpo Clínico' :
                 activeBentoTab === 'dictionary' ? 'Dicionário Médico' :
                 activeBentoTab === 'visual' ? 'Análise de Imagens IA' :
                 activeBentoTab === 'profile' ? 'Seu Perfil Clínico' :
                 activeBentoTab === 'systems' ? 'Sistemas Biológicos' :
                 activeBentoTab === 'comparison' ? 'Comparativo Analítico' :
                 activeBentoTab === 'exam-orders' ? 'Pedidos e Receitas' :
                 activeBentoTab === 'sources' ? 'Fontes e Arquivos' :
                 activeBentoTab === 'timeline' ? 'Linha do Tempo' : 'Detalhamento'}
              </h2>
              <div className="w-8"></div>
            </div>

            {/* Bento rendering content wrapper */}
            <div className="flex-1 overflow-y-auto p-4 pb-12 bg-slate-50">
              {activeBentoTab === 'pathologies' && <PathologiesView />}
              {activeBentoTab === 'medications' && <MedicationsView />}
              {activeBentoTab === 'appointments' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Cadastre e veja as suas próximas consultas e exames preventivos.</p>
                  <AgendaViewWrapper />
                </div>
              )}
              {activeBentoTab === 'doctors' && <DoctorsView />}
              {activeBentoTab === 'dictionary' && <DictionaryView />}
              {activeBentoTab === 'visual' && <VisualAnalysis />}
              {activeBentoTab === 'profile' && <ProfileView />}
              {activeBentoTab === 'medical-consultation' && <MedicalConsultationView />}
              {activeBentoTab === 'timeline' && <TimelineView />}
              {activeBentoTab === 'systems' && (
                <CrossReferencingView onNavigate={(tab, params) => {
                  if (tab === 'ia-doctor') {
                    window.location.hash = 'ia-doctor';
                    if (params?.prefill) {
                      setInputValue(params.prefill);
                    }
                  }
                }} />
              )}
              {activeBentoTab === 'comparison' && (
                <ComparisonView onNavigate={(tab, params) => {
                  if (tab === 'charts' && params) {
                    setSelectedBiomarker(params);
                    window.location.hash = 'evolucao';
                  } else if (tab === 'ia-doctor') {
                    window.location.hash = 'ia-doctor';
                    if (params?.prefill) {
                      setInputValue(params.prefill);
                    }
                  }
                }} />
              )}
              {activeBentoTab === 'exam-orders' && (
                <ExamOrdersView onNavigate={(tab) => {
                  if (tab === 'doctors') {
                    window.location.hash = 'bento-doctors';
                  }
                }} />
              )}
              {activeBentoTab === 'sources' && <SourcesView />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HEADER BAR */}
      <header className="bg-slate-950 text-white px-4 h-14 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wide uppercase">HealthTracker</h1>
            <span className="text-[9px] text-teal-400 uppercase tracking-widest font-black leading-none block">Prontuário Mobile</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full border border-slate-705">
            <div className={`w-1.5 h-1.5 rounded-full ${isSyncingDrive ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></div>
            <span className="text-[10px] font-bold text-slate-300">Nuvem</span>
          </div>
          <button 
            onClick={signOut}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg px-2 py-1.5"
          >
            Sair
          </button>
        </div>
      </header>

      {/* 3. DYNAMIC PAGES VIEW AREA */}
      <main className="flex-1 overflow-y-auto pb-20 relative bg-slate-50" id="mobile-main-scroll">
        <AnimatePresence mode="wait">
        
        {/* TAB 1: INÍCIO (DASHBOARD) */}
        {mobileTab === 'inicio' && (
          <motion.div 
            key="inicio"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 space-y-4"
          >
            {/* Welcome banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                <Activity size={160} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Boas-vindas</p>
              <h2 className="text-xl font-black mt-0.5">Olá, {user?.displayName || 'Paciente'} 👋</h2>
              <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                Seu ecossistema de saúde monitorado em tempo real por inteligência médica avançada.
              </p>

              <div className="mt-4 pt-4 border-t border-slate-850/70 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Exames Carregados</p>
                  <p className="text-base font-extrabold text-teal-400">{processedExams.length} exames</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Última Sinc</p>
                  <p className="text-base font-extrabold text-blue-400 font-mono">
                    {lastDriveSyncTime ? lastDriveSyncTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'Ocioso'}
                  </p>
                </div>
              </div>
            </div>

            {/* General Health Gauge Card */}
            <div className="bg-white rounded-3xl p-4 border border-slate-201 shadow-3xs flex items-center justify-between gap-4">
              <div className="space-y-1 my-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Diagnóstico</span>
                <h3 className="text-sm font-extrabold text-slate-800">Taxa Geral de Saúde</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-[170px]">
                  Sua proporção de marcadores na faixa ideal de normalidade.
                </p>
              </div>
              {/* Circular score gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="32" className="stroke-slate-100" strokeWidth="6.5" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    className={`transition-all duration-1000 ${
                      healthScore >= 80 ? 'stroke-teal-500' : healthScore >= 60 ? 'stroke-amber-400' : 'stroke-rose-500'
                    }`}
                    strokeWidth="6.5" 
                    strokeDasharray={2 * Math.PI * 32}
                    strokeDashoffset={2 * Math.PI * 32 * (1 - (processedExams.length ? healthScore : 0) / 100)}
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute text-center flex flex-col justify-center items-center">
                  <span className="text-lg font-black text-slate-805 leading-none">{processedExams.length ? healthScore : 0}</span>
                  <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase leading-none mt-0.5">% ok</span>
                </div>
              </div>
            </div>

            {/* Quick Categories shortcut grids with counts */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Acesso Rápido por Categorias</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'SANGUE', label: 'Sangue', icon: '🩸', count: categoryCounts.SANGUE, color: 'bg-rose-50 text-rose-800 border-rose-100' },
                  { key: 'URINA', label: 'Urina', icon: '🧪', count: categoryCounts.URINA, color: 'bg-amber-50 text-amber-800 border-amber-150' },
                  { key: 'IMAGEM', label: 'Imagem', icon: '🩻', count: categoryCounts.IMAGEM, color: 'bg-teal-50 text-teal-800 border-teal-100' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setCategoryFilter(item.key);
                      window.location.hash = 'exames';
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer active:scale-95 ${item.color}`}
                  >
                    <span className="text-xl block mb-1">{item.icon}</span>
                    <span className="text-xs font-extrabold block truncate">{item.label}</span>
                    <span className="inline-flex items-center justify-center text-[10px] font-black px-1.5 py-0.5 rounded-full mt-1.5 bg-white/60 text-slate-800">
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Pills */}
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => window.location.hash = 'ia-doctor'}
                className="w-full btn-primary h-11 justify-center"
              >
                <Sparkles size={14} />
                <span>Consultar IA</span>
              </button>
              <button 
                onClick={() => {
                  setCategoryFilter('Todas');
                  window.location.hash = 'exames';
                }}
                className="w-full btn-secondary h-11 justify-center"
              >
                <FileText size={14} />
                <span>Ver Exames</span>
              </button>
            </div>

            {/* Dynamic Therapeutic alerts box */}
            {medications.length > 0 && (
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-4 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wide text-amber-900">Plano de Cuidados IA</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    Monitoramento contínuo active de {medications.filter(m => m.isActive).length} medicamentos.
                  </p>
                  <button 
                    onClick={() => window.location.hash = 'bento-medications'}
                    className="text-[10px] font-black uppercase tracking-wider text-teal-600 hover:text-teal-700 mt-1 block"
                  >
                    Ver Cronograma de Medicamentos ➔
                  </button>
                </div>
              </div>
            )}

            {/* Last 3 recent results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Últimos Resultados Clínicos</span>
                <button 
                  onClick={() => window.location.hash = 'exames'}
                  className="text-[10px] font-black text-teal-600 uppercase tracking-wide cursor-pointer"
                >
                  Ver todos ({processedExams.length})
                </button>
              </div>

              {processedExams.length === 0 ? (
                <div className="bg-white rounded-3xl p-6 text-center border border-slate-180">
                  <p className="text-slate-400 text-xs">Nenhum exame cadastrado no sistema.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {processedExams.slice(0, 3).map((exam) => (
                    <div 
                      key={exam.id}
                      onClick={() => { if (exam.id) window.location.hash = 'exam-' + exam.id; }}
                      className="card-interactive p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="overflow-hidden space-y-1">
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const catStyles = getCategoryStyles(exam.categoria);
                            return (
                              <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${catStyles.className}`}>
                                {catStyles.label}
                              </span>
                            );
                          })()}
                          <span className="text-[9px] text-slate-400 font-bold font-mono">{exam.dataExame}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-800 truncate">{exam.nomeExame}</h4>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-extrabold text-slate-800">{exam.resultado} {exam.unidade}</p>
                        <span className={`text-[8px] font-bold uppercase tracking-wider ${
                          exam.interpretacao === 'Normal' ? 'text-teal-600 bg-teal-50 px-1 py-0.5 rounded' : 
                          exam.interpretacao === 'Sub-ópt.' ? 'text-amber-600 bg-amber-50 px-1 py-0.5 rounded' : 'text-rose-600 bg-rose-50 px-1 py-0.5 rounded'
                        }`}>
                          {exam.interpretacao}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: EXAMES (LISTA DE EXAMES COM FILTROS) */}
        {mobileTab === 'exames' && (
          <motion.div 
            key="exames"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 space-y-4"
          >
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">Resultados Clínicos</h2>
              <p className="text-xs text-slate-400 mt-1">Navegue, pesquise e filtre de forma rápida.</p>
            </div>

            {/* Input Search Block */}
            <div className="flex flex-col gap-3">
              <div className={`relative flex items-center bg-white border rounded-2xl overflow-hidden px-3 shadow-3xs transition-all ${
                isAiMode ? 'border-purple-300 ring-2 ring-purple-500/20' : 'border-slate-201 focus-within:ring-2 focus-within:ring-teal-500'
              }`}>
                <Search size={16} className={isAiMode ? 'text-purple-500' : 'text-slate-400'} />
                <input 
                  type="text" 
                  placeholder={isAiMode ? "Descreva o que procura (ex: Glicose alta)..." : "Pesquisar marcadores, resultados..."}
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    if (isAiMode && e.target.value === '') setAiSearchResults(null);
                  }}
                  onKeyDown={e => {
                    if (isAiMode && e.key === 'Enter') handleAiSearch();
                  }}
                  className={`w-full text-xs font-bold px-2 py-3 focus:outline-none ${isAiMode ? 'text-purple-900 placeholder:text-purple-400' : 'text-slate-800'}`}
                />
                {searchQuery && !isAiMode && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400">
                    <X size={14} />
                  </button>
                )}
                {isAiMode && (
                  <button 
                    onClick={handleAiSearch}
                    disabled={isAiSearching || !searchQuery}
                    className="ml-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
                  >
                    {isAiSearching ? <Loader2 size={14} className="animate-spin" /> : 'Buscar'}
                  </button>
                )}
              </div>
              
              <button
                onClick={() => {
                  setIsAiMode(!isAiMode);
                  setSearchQuery('');
                  setAiSearchResults(null);
                }}
                className={`self-start px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  isAiMode ? 'bg-slate-900 text-white' : 'bg-purple-50 border border-purple-200 text-purple-600'
                }`}
              >
                <Sparkles size={12} className={isAiMode ? 'text-purple-400' : ''} />
                {isAiMode ? 'Voltar Busca Normal' : 'Busca Semântica IA'}
              </button>
            </div>

            {/* Search pills horizontal scroll */}
            <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-none select-none">
              {[
                { key: 'Todas', label: 'Todos', emoji: '📋' },
                { key: 'SANGUE', label: 'Sangue', emoji: '🩸' },
                { key: 'URINA', label: 'Urina', emoji: '🧪' },
                { key: 'FEZES', label: 'Fezes', emoji: '🧫' },
                { key: 'IMAGEM', label: 'Imagem', emoji: '🩻' },
                { key: 'LAUDO', label: 'Laudo', emoji: '📄' },
                { key: 'RELATÓRIO', label: 'Relatório', emoji: '📝' },
                { key: 'OUTROS', label: 'Outros', emoji: '🩺' },
              ].map(pill => {
                const isActive = categoryFilter === pill.key;
                return (
                  <button
                    key={pill.key}
                    onClick={() => setCategoryFilter(pill.key)}
                    className={`py-1.5 px-3 rounded-full text-xs font-extrabold cursor-pointer transition-all shrink-0 flex items-center gap-1.5 ${
                      isActive 
                        ? 'bg-teal-600 text-white shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-201 hover:bg-slate-50'
                    }`}
                  >
                    <span>{pill.emoji}</span>
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Vertical Exam Ledger List */}
            {filteredExams.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-201">
                <FileText size={40} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-550">Nenhum exame encontrado para esse filtro.</p>
                <button 
                  onClick={() => { setCategoryFilter('Todas'); setSearchQuery(''); }}
                  className="mt-3 text-xs text-teal-600 font-extrabold uppercase tracking-wide"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExams.map((exam) => (
                  <div 
                    key={exam.id}
                    onClick={() => { if (exam.id) window.location.hash = 'exam-' + exam.id; }}
                    className="card-interactive p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="overflow-hidden space-y-1">
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const catStyles = getCategoryStyles(exam.categoria);
                          return (
                            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${catStyles.className}`}>
                              {catStyles.label}
                            </span>
                          );
                        })()}
                        <span className="text-[9px] text-slate-400 font-bold font-mono">{exam.dataExame}</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-805 truncate">{exam.nomeExame}</h4>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-slate-800">{exam.resultado} {exam.unidade}</p>
                      <span className={`text-[8.5px] font-bold uppercase tracking-wider ${
                        exam.interpretacao === 'Normal' ? 'text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded' : 
                        exam.interpretacao === 'Sub-ópt.' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded'
                      }`}>
                        {exam.interpretacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: EVOLUÇÃO (GRÁFICOS POLIDOS PARA MOBILE) */}
        {mobileTab === 'evolucao' && (
          <motion.div 
            key="evolucao"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 space-y-4"
          >
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">Tendências & Gráficos</h2>
              <p className="text-xs text-slate-400 mt-1 font-semibold">Selecione e acompanhe seu progresso ao longo do tempo.</p>
            </div>

            {/* horizontal metrics buttons tag row */}
            {comparativeData.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-180">
                <HeartPulse size={36} className="text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum biomarcador comparável encontrado.</p>
              </div>
            ) : (
              <div className="space-y-4.5">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Escolha o Marcador</span>
                  <div className="overflow-x-auto flex gap-2 pb-1 scrollbar-none select-none">
                    {comparativeData.map((d) => {
                      const isActive = selectedBiomarker === d.testName;
                      return (
                        <button
                          key={d.testName}
                          onClick={() => setSelectedBiomarker(d.testName)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-black cursor-pointer transition-all shrink-0 ${
                            isActive 
                              ? 'bg-teal-600 text-white shadow-sm' 
                              : 'bg-white text-slate-705 border border-slate-201 hover:bg-slate-50'
                          }`}
                        >
                          {d.testName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Render the core chart */}
                {chartData.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-180">
                    <p className="text-slate-400 text-xs">Dados insuficientes para desenhar curva histórica de {selectedBiomarker}.</p>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-3xl border border-slate-201 shadow-3xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{selectedBiomarker}</h4>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Unidade: {chartData[0]?.valStr?.split(" ").pop() || "vazio"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Variação Recente</span>
                        <p className="text-xs font-bold text-slate-850">
                          {chartData.length > 1 ? (
                            chartData[chartData.length - 1].value > chartData[chartData.length - 2].value ? '📈 Subiu' :
                            chartData[chartData.length - 1].value < chartData[chartData.length - 2].value ? '📉 Caiu' : '↕️ Estável'
                          ) : 'Único registro'}
                        </p>
                      </div>
                    </div>

                    {/* Recharts Wrapper constrained strictly for mobile screens */}
                    <div className="h-56 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="formattedDate" 
                            tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(15, 23, 42, 0.92)',
                              backdropFilter: 'blur(12px)',
                              WebkitBackdropFilter: 'blur(12px)',
                              border: '1px solid rgba(99, 102, 241, 0.25)',
                              borderRadius: '14px',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
                            }} 
                            labelStyle={{ color: '#94a3b8', fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            itemStyle={{ color: '#2dd4bf', fontWeight: 700, fontSize: '11px' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0d9488" 
                            strokeWidth={3} 
                            dot={{ r: 5, strokeWidth: 1 }}
                            activeDot={{ r: 7 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Linear legend checklist below */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Histórico de Valores</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto">
                        {chartData.map((pt, index) => (
                          <div key={index} className="flex items-center justify-between text-xs font-bold bg-slate-50 border border-slate-150 p-2 rounded-xl">
                            <span className="text-slate-400 font-mono">{pt.date}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-800">{pt.value}</span>
                              <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase ${
                                pt.interpretacao === 'Normal' ? 'bg-teal-50 text-teal-600' :
                                pt.interpretacao === 'Sub-ópt.' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                              }`}>{pt.interpretacao}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 4: DOUTOR IA (FULL MESSAGING APP EXPERIENCE) */}
        {mobileTab === 'ia-doctor' && (
          <motion.div 
            key="ia-doctor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col h-[calc(100vh-120px)] bg-slate-55"
          >
            {/* Fake dynamic avatar chat header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center relative">
                  <Sparkles size={18} className="text-teal-200" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-450 border border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold tracking-wide uppercase">Doutor IA Integrativo</h3>
                  <span className="text-[9.5px] text-teal-200 font-medium leading-none flex items-center gap-1 progress">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    <span>Analisando exames de forma integrativa</span>
                  </span>
                </div>
              </div>

              {/* Reset button chat */}
              <button 
                onClick={() => setMessages([])} 
                className="text-[10px] text-teal-100 hover:text-white font-extrabold uppercase border border-white/20 p-1.5 rounded-lg"
              >
                Limpar
              </button>
            </div>

            {/* Conversation text lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" style={{ scrollBehavior: 'smooth' }}>
              
              {messages.length === 0 && (
                <div className="space-y-4 max-w-sm mx-auto text-center pt-4">
                  <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shadow-inner mx-auto">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Opinião Clínica & Cruzamento Científico</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      Consulte correlações secundárias, indicação de artigos da literatura científica, TDAH e dores da Fibromialgia.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black text-slate-450 uppercase tracking-widest pl-1 text-left">Toque em uma pergunta rápida:</span>
                    <div className="flex flex-col gap-1.5">
                      {chatPrompts.map((cp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChatMessage(cp.prompt)}
                          className="text-left w-full p-2.5 bg-white active:bg-teal-50/50 border border-slate-201 hover:border-teal-200 rounded-xl transition-all shadow-3xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span className="text-xs font-semibold text-slate-700 leading-snug">{cp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, idx) => (
                <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 px-1 block">
                    {m.sender === 'user' ? 'Você' : 'Doutor IA'}
                  </span>
                  
                  <div className={`px-3 py-2.5 rounded-2xl max-w-[88%] text-xs sm:text-xs leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-teal-600 text-white rounded-tr-sm font-semibold' 
                      : 'bg-white border border-slate-201 text-slate-700 rounded-tl-sm shadow-3xs'
                  }`}>
                    {m.sender === 'user' ? (
                      m.text
                    ) : (
                      <div className="markdown-body prose-p:my-1 prose-ul:my-1" style={{color: 'inherit'}}>
                        <Markdown>{m.text}</Markdown>
                      </div>
                    )}
                  </div>

                  {m.sender === 'sys' && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && idx === messages.length - 1 && (
                    <div className="mt-2 pl-1 space-y-1.5 text-left w-full select-none">
                      <span className="block text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Ideias de Continuação:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedFollowUps.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleSendChatMessage(opt)}
                            className="bg-white border border-slate-201 text-[10px] font-semibold text-slate-700 px-2.5 py-1.5 rounded-xl hover:border-teal-400"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isAiLoading && (
                <div className="flex flex-col items-start animate-pulse">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Doutor IA</span>
                  <div className="px-3 py-2.5 rounded-2xl bg-white border border-slate-201 shadow-3xs flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Loader2 size={12} className="animate-spin text-teal-600" />
                    <span>Lendo referências científicas...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Sticky Messaging Input Row */}
            <div className="p-2.5 border-t border-slate-200/60 bg-white/95 backdrop-blur-sm shrink-0 flex items-center gap-1.5 rounded-t-xl">
              <input 
                type="text" 
                placeholder="Perguntar ao Doutor IA..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendChatMessage(); }}
                className="flex-1 bg-slate-50 border border-slate-201 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-teal-500 text-xs font-bold text-slate-800"
              />
              <button 
                onClick={() => handleSendChatMessage()}
                disabled={!inputValue.trim() || isAiLoading}
                className="w-9 h-9 items-center justify-center flex rounded-xl bg-teal-600 text-white disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 5: MAIS (BENTO GRID REVOLUTION) */}
        {mobileTab === 'mais' && (
          <motion.div 
            key="mais"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 space-y-4"
          >
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-none">Todos os Recursos</h2>
              <p className="text-xs text-slate-400 mt-1">Acesse as ferramentas secundárias do HealthTracker.</p>
            </div>

            {/* Premium Bento Grid of Secondary Options */}
            <div className="grid grid-cols-2 gap-3 stagger-children">
              {[
                { key: 'systems', label: 'Sistemas Orgânicos', d: 'Eixos e sistemas biológicos', icon: <Layers size={24} className="text-teal-600" />, color: 'bg-teal-50/70 border-teal-100' },
                { key: 'comparison', label: 'Comparativo Analítico', d: 'Análise de múltiplos biomarcadores', icon: <Table size={24} className="text-pink-600" />, color: 'bg-pink-50/70 border-pink-100' },
                { key: 'timeline', label: 'Linha do Tempo', d: 'Linha do tempo clínica detalhada', icon: <History size={24} className="text-violet-600" />, color: 'bg-violet-50/70 border-violet-100' },
                { key: 'medical-consultation', label: 'Guia de Consulta & QR', d: 'Modo médico com resumo rápido e QR Code', icon: <Stethoscope size={24} className="text-teal-600 animate-pulse" />, color: 'bg-teal-100/40 border-teal-200' },
                { key: 'exam-orders', label: 'Pedidos e Receitas', d: 'Histórico de pedidos médicos', icon: <ClipboardList size={24} className="text-amber-600" />, color: 'bg-amber-50/70 border-amber-100' },
                { key: 'sources', label: 'Origem dos Dados', d: 'Fontes digitais e GDrive', icon: <Database size={24} className="text-blue-600" />, color: 'bg-blue-50/70 border-blue-100' },
                { key: 'pathologies', label: 'Histórico Patologias', d: 'Seu controle estrutural de diagnósticos', icon: <Stethoscope size={24} className="text-indigo-600" />, color: 'bg-indigo-50/70 border-indigo-100' },
                { key: 'medications', label: 'Medicamento Direto', d: 'Controle de tomadas contínuas', icon: <Pill size={24} className="text-emerald-600" />, color: 'bg-emerald-50/70 border-emerald-100' },
                { key: 'appointments', label: 'Agenda & Consultas', d: 'Sua linha do tempo de preventivos', icon: <Calendar size={24} className="text-sky-600" />, color: 'bg-sky-50/70 border-sky-100' },
                { key: 'doctors', label: 'Corpo de Médicos', d: 'Cadastro estruturado e CRM', icon: <User size={24} className="text-purple-600" />, color: 'bg-purple-50/70 border-purple-100' },
                { key: 'dictionary', label: 'Dicionário Clínico', d: 'Consulte os termos médicos reais', icon: <BookOpen size={24} className="text-rose-600" />, color: 'bg-rose-50/70 border-rose-100' },
                { key: 'visual', label: 'Imagens Clinicas', d: 'Examine exames de radiologia c/ IA', icon: <UploadCloud size={24} className="text-teal-600" />, color: 'bg-teal-50/70 border-teal-100' },
                { key: 'profile', label: 'Perfil de Paciente', d: 'Suas informações vitais e de saúde', icon: <User size={24} className="text-slate-600" />, color: 'bg-slate-100/70 border-slate-200' },
              ].map(tile => (
                <button
                  key={tile.key}
                  onClick={() => window.location.hash = 'bento-' + tile.key}
                  className={`card-interactive p-4 text-left flex flex-col justify-between h-34 group ${tile.color}`}
                >
                  <div className="p-2 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {tile.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 tracking-tight block group-hover:text-teal-700 transition-colors">{tile.label}</h4>
                    <span className="text-[9.5px] text-slate-500 font-medium leading-tight mt-0.5 block">{tile.d}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Cloud Sync status block inside More bar */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">Nuvem Google Drive</h4>
                  <p className="text-[10px] text-slate-400">Arquivos e documentos sincronizados</p>
                </div>
                <button 
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  className="bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm shrink-0"
                >
                  {isSyncing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  <span>{isSyncing ? 'Sincronizando' : 'Sincronizar'}</span>
                </button>
              </div>

              <div className="bg-slate-850/50 p-3 rounded-2xl border border-slate-800/80 text-xs flex justify-between items-center text-slate-300">
                <span className="font-semibold block truncate">Total de Documentos de Origem:</span>
                <span className="font-mono font-bold text-teal-400">{allSources.length} PDFs</span>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* 4. SPRING NATIVE BOTTOM SHEET COMPONENT (EXAM LAUDO DETAILS) */}
      <AnimatePresence>
        {selectedExamId && selectedExam && (
          <>
            {/* Dark sliding backdrop overlay on viewport */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => window.history.back()}
              className="fixed inset-0 z-50 bg-slate-950/60"
            />

            {/* Bottom Sheet wrapper sliding up */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] bg-white rounded-t-[34px] shadow-2xl flex flex-col overflow-hidden text-slate-900"
            >
              {/* Drag Indicator Bar */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto my-3 shrink-0 cursor-pointer hover:bg-slate-400 transition-colors" onClick={() => window.history.back()}></div>

              {/* Title & Info blocks scrollable container */}
              <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">
                
                {/* Header title */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    {(() => {
                      const catStyles = getCategoryStyles(selectedExam.categoria);
                      return (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${catStyles.className}`}>
                          {catStyles.label}
                        </span>
                      );
                    })()}
                    <h3 className="text-base font-black text-slate-805 mt-1">{selectedExam.nomeExame}</h3>
                    <p className="text-[10px] text-slate-400 font-bold font-mono">Realizado em {selectedExam.dataExame}</p>
                  </div>
                  <button 
                    onClick={() => window.history.back()}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Quantitative Metric display panels */}
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-0.5 block">Resultado Encontrado</span>
                    <p className="text-lg font-black text-slate-800 mt-1">{selectedExam.resultado} {selectedExam.unidade}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Classificação Geral</span>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-xl mt-1 ${
                      selectedExam.interpretacao === 'Normal' ? 'bg-teal-50 text-teal-700' :
                      selectedExam.interpretacao === 'Sub-ópt.' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {selectedExam.interpretacao}
                    </span>
                  </div>
                </div>

                {/* References range */}
                <div className="space-y-1.5 bg-slate-50 border border-slate-150 p-4 rounded-3xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pl-0.5">Valores de Referência Ativos</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed font-mono">
                    {selectedExam.valorReferencia || 'Não Informado'}
                  </p>
                </div>

                {/* Doctor Request */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Médico Solicitante</span>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate">{selectedExam.medicoSolicitante || '—'}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Especialidade</span>
                    <p className="text-xs font-extrabold text-slate-800 mt-0.5 truncate">{selectedExam.especialidadeMedica || 'Geral'}</p>
                  </div>
                </div>

                {/* Obs and full details */}
                {selectedExam.observacoes && (
                  <div className="space-y-1.5 bg-slate-50 border border-slate-150 p-4 rounded-3xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block pl-0.5">Laudos e Anotações de laboratório</span>
                    <div className="text-xs text-slate-705 leading-relaxed overflow-y-auto max-h-48 prose-p:my-1 font-semibold">
                      <Markdown>{selectedExam.observacoes}</Markdown>
                    </div>
                  </div>
                )}

                {/* Direct buttons triggers */}
                <div className="space-y-2 pt-2 shrink-0">
                  <button 
                    onClick={() => {
                      const examName = selectedExam.nomeExame;
                      const val = selectedExam.resultado;
                      const unit = selectedExam.unidade;
                      const query = `Por favor, faça um parecer integrativo estruturado sobre o meu exame "${examName}" que deu o valor "${val} ${unit}". Explique os potenciais impactos e o que posso discutir com o meu médico.`;
                      window.location.hash = 'ia-doctor';
                      handleSendChatMessage(query);
                    }}
                    className="w-full btn-primary h-12 justify-center"
                  >
                    <Sparkles size={14} />
                    <span>Perguntar ao Doutor IA sobre este Exame</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedBiomarker(selectedExam.nomeExame);
                      window.location.hash = 'evolucao';
                    }}
                    className="w-full btn-secondary h-12 justify-center mt-2"
                  >
                    <HeartPulse size={14} />
                    <span>Ver no Gráfico de Evolução</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. NATIVE BOTTOM APP NAVIGATION TAB BAR */}
      <nav className="bottom-nav">
        {[
          { key: 'inicio', label: 'Início', icon: <Activity size={20} /> },
          { key: 'exames', label: 'Exames', icon: <FileText size={20} /> },
          { key: 'evolucao', label: 'Evolução', icon: <HeartPulse size={20} /> },
          { key: 'ia-doctor', label: 'Doutor IA', icon: <Sparkles size={20} /> },
          { key: 'mais', label: 'Mais', icon: <Menu size={20} /> },
        ].map(tb => {
          const isSelected = mobileTab === tb.key;
          return (
            <button
              key={tb.key}
              onClick={() => {
                window.location.hash = tb.key;
              }}
              className={`bottom-nav-item ${isSelected ? 'bottom-nav-item-active' : ''}`}
            >
              <div className={`mb-0.5 transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}>{tb.icon}</div>
              <span>{tb.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

// Quick fallback helper wrapper to fit Agenda appointments smoothly
function AgendaViewWrapper() {
  const { appointments, addAppointment, deleteAppointment } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [type, setType] = useState<'EXAM' | 'APPOINTMENT' | 'THERAPY' | 'PHYSIOTHERAPY'>('APPOINTMENT');
  const [examCategory, setExamCategory] = useState<string>('SANGUE');

  const getClinicDetails = (appt: any) => {
    let name = appt.location || '';
    let address = appt.clinicAddress || '';
    
    if (!address && name.includes('|')) {
      const parts = name.split('|');
      const part1 = parts[0].trim();
      const part2 = parts[1].trim();
      if (/\d/.test(part1)) { // contains a number, probably address
        address = part1;
        name = part2;
      } else {
        name = part1;
        address = part2;
      }
    }
    return { name, address };
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    if (type === 'EXAM' && !title.trim()) return;

    const titleToSave = title.trim() || 
      (type === 'APPOINTMENT' ? 'Consulta Médica' : 
       type === 'THERAPY' ? 'Terapia' : 
       type === 'PHYSIOTHERAPY' ? 'Fisioterapia' : 'Agendamento');

    try {
      await addAppointment({
        type,
        title: titleToSave,
        date,
        time: time || undefined,
        location: location || undefined,
        clinicAddress: clinicAddress || undefined,
        notes: notes || undefined,
        status: 'SCHEDULED',
        examCategory: type === 'EXAM' ? examCategory : undefined
      });
      setTitle('');
      setDate('');
      setTime('');
      setLocation('');
      setClinicAddress('');
      setNotes('');
      setType('APPOINTMENT');
      setExamCategory('SANGUE');
      setIsAdding(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {isAdding ? (
        <form onSubmit={handleAdd} className="bg-white border p-4 rounded-3xl space-y-3.5 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Agendar Evento</h4>
            <button onClick={() => setIsAdding(false)} type="button" className="text-slate-400"><X size={16} /></button>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Tipo</label>
              <select 
                value={type} 
                onChange={(e) => {
                  const newType = e.target.value as any;
                  setType(newType);
                  if (newType !== 'EXAM') {
                    setExamCategory('SANGUE');
                  }
                }} 
                className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805"
              >
                <option value="APPOINTMENT">Consulta Médica</option>
                <option value="EXAM">Exame</option>
                <option value="THERAPY">Terapia</option>
                <option value="PHYSIOTHERAPY">Fisioterapia</option>
              </select>
            </div>
            {type === 'EXAM' && (
              <div>
                <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Categoria do Exame</label>
                <select 
                  value={examCategory} 
                  onChange={(e) => setExamCategory(e.target.value)} 
                  className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805"
                >
                  <option value="SANGUE">Sangue</option>
                  <option value="URINA">Urina</option>
                  <option value="IMAGEM">Exame de Imagem</option>
                  <option value="FEZES">Fezes</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">
                {type === 'EXAM' ? 'Título do Exame' : 'Título / Procedimento'} {type !== 'EXAM' && '(Opcional)'}
              </label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required={type === 'EXAM'} 
                type="text" 
                placeholder={type === 'EXAM' ? "Ex: Hemograma, Ressonância" : "Ex: Consulta com Dra Ana"} 
                className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Data</label>
                <input value={date} onChange={e => setDate(e.target.value)} required type="date" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805" />
              </div>
              <div>
                <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Hora</label>
                <input value={time} onChange={e => setTime(e.target.value)} type="time" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805" />
              </div>
            </div>
            <div>
              <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Local / Clínica</label>
              <input value={location} onChange={e => setLocation(e.target.value)} type="text" placeholder="Ex: Clínica La Vie" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805" />
            </div>
            <div>
              <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Endereço da Clínica</label>
              <input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} type="text" placeholder="Ex: Rua Doutor Nicolau de Sousa Queirós, 177" className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805" />
            </div>
            <div>
              <label className="text-[10.5px] font-extrabold text-slate-500 uppercase block">Notas Adicionais</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anotações, preparo ou CRM do médico..." className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-805 h-16 resize-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-teal-600 text-white font-extrabold h-10 rounded-xl text-xs uppercase tracking-wider">Salvar na Agenda</button>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full h-11 border border-dashed border-teal-500 hover:border-teal-600 bg-teal-50/50 hover:bg-teal-50 text-teal-700 font-extrabold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={14} />
          <span>Agendar Consulta ou Exame</span>
        </button>
      )}

      <div className="space-y-2">
        <span className="text-[9.5px] font-black text-slate-450 uppercase tracking-widest pl-1 block">Próximos Compromissos</span>
        {appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 border text-center text-slate-400 text-xs font-medium">Nenhum agendamento futuro marcado na planilha.</div>
        ) : (
          <div className="space-y-2">
            {appointments.map(apt => (
              <div key={apt.id} className="bg-white p-3.5 border border-slate-180 rounded-2xl flex items-center justify-between gap-3 shadow-3xs">
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md ${
                      apt.type === 'EXAM' ? 'bg-indigo-50 text-indigo-700' :
                      apt.type === 'THERAPY' ? 'bg-emerald-50 text-emerald-700' :
                      apt.type === 'PHYSIOTHERAPY' ? 'bg-sky-50 text-sky-700' :
                      'bg-teal-50 text-teal-700'
                    }`}>
                      {apt.type === 'EXAM' 
                        ? `Exame (${apt.examCategory === 'SANGUE' ? 'Sangue' : apt.examCategory === 'URINA' ? 'Urina' : apt.examCategory === 'IMAGEM' ? 'Imagem' : apt.examCategory === 'FEZES' ? 'Fezes' : 'Outros'})` 
                        : apt.type === 'THERAPY' ? 'Terapia'
                        : apt.type === 'PHYSIOTHERAPY' ? 'Fisioterapia'
                        : 'Consulta'}
                    </span>
                  </div>
                  <h5 className="text-xs font-black text-slate-800">{apt.title}</h5>
                  <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5">{apt.date.split('-').reverse().join('/')} {apt.time ? `às ${apt.time}` : ''}</p>
                  {(() => {
                    const clinic = getClinicDetails(apt);
                    return (
                      <>
                        {clinic.name && <p className="text-[10px] text-slate-650 font-bold mt-1">📍 {clinic.name}</p>}
                        {clinic.address && (
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            <span className="text-[9.5px] text-slate-450 font-semibold">{clinic.address}</span>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-150/40 hover:bg-teal-100 transition-colors shadow-3xs"
                            >
                              <MapPin size={9} className="text-teal-600" />
                              <span>Como chegar</span>
                            </a>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {apt.notes && <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{apt.notes}</p>}
                </div>
                <button 
                  onClick={async () => {
                    try {
                      if (apt.id) await deleteAppointment(apt.id);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-slate-150 rounded-xl transition-colors"
                  title="Apagar da Agenda"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
