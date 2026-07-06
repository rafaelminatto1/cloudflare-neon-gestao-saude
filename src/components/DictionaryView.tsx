import React, { useState, useMemo, useEffect } from 'react';
import Fuse from 'fuse.js';
import { motion, AnimatePresence } from 'motion/react';
import { EXAM_GLOSSARY, DictionaryItem, normalizeAndMatchExam } from '../utils/examDictionary';
import { useData } from '../App';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  BookOpen, 
  Layers, 
  FlaskConical, 
  Info, 
  ArrowRight, 
  Heart, 
  Tag, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ListFilter,
  Activity,
  Sparkles,
  FileText,
  Bot
} from 'lucide-react';

interface AbbreviationItem {
  sigla: string;
  nome: string;
  canonicalName: string;
  desc: string;
  categoria: string;
}

const COMMON_ABBREVIATIONS: AbbreviationItem[] = [
  { 
    sigla: "Vit D", 
    nome: "Vitamina D (25-OH)", 
    canonicalName: "Vitamina D", 
    desc: "Hormônio essencial na modulação da resposta imune e saúde osteoarticular. Fundamental no manejo da Artrite Reumatóide, Lúpus e Hashimoto para controlar a cascata inflamatória Th1/Th2.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "Cortisol", 
    nome: "Cortisol Basal", 
    canonicalName: "Cortisol", 
    desc: "Hormônio do estresse crônico. Seu esgotamento ou hiperativação exacerba sintomas de dor (Fibromialgia) e altera arquitetura do sono (Insônia crônica).",
    categoria: "Hormônios" 
  },
  { 
    sigla: "B12", 
    nome: "Vitamina B12 (Cianocobalamina)", 
    canonicalName: "Vitamina B12", 
    desc: "Neuroproteção direta. Deficiência pode causar séria neblina mental (brain fog), exacerbar a desatenção (TDAH) e agravar dores nevrálgicas refratárias da Fibromialgia.",
    categoria: "Nutrientes" 
  },
  { 
    sigla: "VHS", 
    nome: "Velocidade de Hemossedimentação", 
    canonicalName: "VHS", 
    desc: "Sinaliza níveis de atividade inflamatória inespecífica. Aumentado em crises sistêmicas de Artrite Reumatóide, Espondilite ou Lúpus.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "FAN", 
    nome: "Fator Antinuclear", 
    canonicalName: "FAN (Fator Antinuclear)", 
    desc: "Principal marcador essencial no rastreamento e diagnóstico de doenças autoimunes, capaz de apontar a presença de anticorpos reagindo contra núcleos das próprias células.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "Anti-TPO", 
    nome: "Anticorpo Antitireoperoxidase", 
    canonicalName: "Anti-TPO", 
    desc: "Detecta autoanticorpos contra enzimas da tireoide, principal indicador de Tireoidite de Hashimoto e flutuações tireoidianas imunológicas.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "FR", 
    nome: "Fator Reumatoide", 
    canonicalName: "Fator Reumatoide (FR)", 
    desc: "Usado primariamente para diagnosticar Artrite Reumatoide crônica e distinguir lesões articulares inflamatórias de autoimunes.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "PCR", 
    nome: "Proteína C-Reativa", 
    canonicalName: "Proteína C-Reativa (PCR)", 
    desc: "Mede atividade inflamatória aguda ou infecção bacteriana no organismo.",
    categoria: "Autoimunidade" 
  },
  { 
    sigla: "TSH", 
    nome: "Hormônio Tireoestimulante", 
    canonicalName: "TSH", 
    desc: "Principal indicador para rastreamento de hipotiroidismo e hipertiroidismo.",
    categoria: "Tireoide" 
  },
  { 
    sigla: "HbA1c", 
    nome: "Hemoglobina Glicada", 
    canonicalName: "Hemoglobina Glicada (HbA1c)", 
    desc: "Mapeia a média do nível de açúcar no sangue dos últimos 90 dias (Diabetes).",
    categoria: "Metabolismo" 
  },
  { 
    sigla: "TGP / ALT", 
    nome: "Transaminase Pirúvica", 
    canonicalName: "TGP (ALT)", 
    desc: "Enzima específica do fígado. Dosada para indicar esteatose ou lesão hepática.",
    categoria: "Fígado" 
  },
  { 
    sigla: "TGO / AST", 
    nome: "Transaminase Oxalacética", 
    canonicalName: "TGO (AST)", 
    desc: "Presente no fígado, coração e músculos. Avalia lesões celulares teciduais.",
    categoria: "Fígado" 
  },
  { 
    sigla: "VDRL", 
    nome: "Sorologia para Sífilis", 
    canonicalName: "VDRL (Sorologia para Sífilis)", 
    desc: "Rastreio e acompanhamento de tratamento para infecção por sífilis.",
    categoria: "Infectologia" 
  },
  { 
    sigla: "EAS", 
    nome: "Urina Tipo I", 
    canonicalName: "Urina Tipo I (EAS)", 
    desc: "Exame básico de urina. Avalia pH, densidade, hemácias e sinais de infecção.",
    categoria: "Rins" 
  },
  { 
    sigla: "TAP / TP", 
    nome: "Tempo de Protrombina", 
    canonicalName: "Tempo de Protrombina (TP / TAP)", 
    desc: "Avalia a via de coagulação extrínseca. Crucial para quem usa Varfarina.",
    categoria: "Sangue" 
  },
  { 
    sigla: "TTPA", 
    nome: "Tempo de Tromboplastina", 
    canonicalName: "Tempo de Tromboplastina Parcial Ativada (TTPA)", 
    desc: "Detecção de distúrbios hemorrágicos e monitoramento de Heparina.",
    categoria: "Sangue" 
  },
  { 
    sigla: "DHEA-S", 
    nome: "Sulfato de DHEA", 
    canonicalName: "DHEA-S (Sulfato de Deidroepiandrosterona)", 
    desc: "Androgênio produzido unicamente pela adrenal. Avalia SOP e hirsutismo.",
    categoria: "Hormônios" 
  },
  { 
    sigla: "PTH", 
    nome: "Paratormônio Intacto", 
    canonicalName: "PTH (Paratormônio Intacto)", 
    desc: "Hormônio regulador do Cálcio e Fósforo nos ossos e no sangue circulante.",
    categoria: "Metabolismo" 
  },
  { 
    sigla: "PSA", 
    nome: "Antígeno Prostático", 
    canonicalName: "PSA Total", 
    desc: "Rastreamento anual preventivo de alterações de próstata em homens.",
    categoria: "Saúde Masculina" 
  },
  { 
    sigla: "HBsAg", 
    nome: "Hepatite B Superfície", 
    canonicalName: "HBsAg (Antígeno de Superfície do Vírus da Hepatite B)", 
    desc: "Confirma infecção ativa (aguda ou crônica) pelo vírus da Hepatite B.",
    categoria: "Infectologia" 
  },
  { 
    sigla: "EPF", 
    nome: "Parasitológico Fezes", 
    canonicalName: "Parasitológico de Fezes (EPF)", 
    desc: "Pesquisa direta de helmintos, protozoários, larvas e cistos em amostras.",
    categoria: "Gastroenterologia" 
  },
  { 
    sigla: "Anti-TPO", 
    nome: "Anti-Peroxidase", 
    canonicalName: "Anticorpos Anti-Peroxidase Tireoidiana (Anti-TPO)", 
    desc: "Autoanticorpo cujo valor elevado confirma Tireoidite crônica de Hashimoto.",
    categoria: "Tireoide" 
  }
];

export default function DictionaryView({ onNavigate, initialSearchTerm }: { onNavigate?: (tab: string, params?: any) => void, initialSearchTerm?: string }) {
  const { processedExams } = useData();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [abbrevSearch, setAbbrevSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterCommonOnly, setFilterCommonOnly] = useState(false);

  // If initialSearchTerm changes from outside, update the local state
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // AI Explainer State
  const [aiExplainTerm, setAiExplainTerm] = useState('');
  const [isAiExplaining, setIsAiExplaining] = useState(false);
  const [aiExplanationResult, setAiExplanationResult] = useState<string | null>(null);

  const handleExplainAI = async () => {
    if (!aiExplainTerm.trim()) return;
    setIsAiExplaining(true);
    setAiExplanationResult(null);
    try {
      const response = await fetch('/api/explain-medical-term', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: aiExplainTerm })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao gerar explicação.');
      setAiExplanationResult(data.explanation);
    } catch (e: any) {
      setAiExplanationResult('Não foi possível gerar a explicação neste momento. Tente novamente em alguns instantes.');
    } finally {
      setIsAiExplaining(false);
    }
  };

  // Map processing of user exams to their canonical name group
  const matchingUserExams = useMemo(() => {
    const map: Record<string, typeof processedExams> = {};
    if (!processedExams) return map;
    processedExams.forEach(exam => {
      const canonical = normalizeAndMatchExam(exam.nomeExame);
      if (canonical) {
        if (!map[canonical]) map[canonical] = [];
        map[canonical].push(exam);
      }
    });
    return map;
  }, [processedExams]);

  // Extract all unique categories for the filters
  const categories = useMemo(() => {
    const cats = new Set<string>();
    EXAM_GLOSSARY.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats).sort();
  }, []);

  // Filter the dictionary list based on search term, category, and "most common" filter
  const filteredItems = useMemo(() => {
    let result = EXAM_GLOSSARY;

    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (filterCommonOnly) {
      result = result.filter(item => item.mostCommonBrazil);
    }

    if (searchTerm) {
      const fuse = new Fuse(result, {
        keys: [
          { name: 'canonicalName', weight: 3 },
          { name: 'aliases', weight: 2 },
          { name: 'description', weight: 1 },
          { name: 'category', weight: 0.5 },
          { name: 'labExamples.label', weight: 0.5 }
        ],
        threshold: 0.4,
        ignoreLocation: true,
        useExtendedSearch: true
      });
      result = fuse.search(searchTerm).map(match => match.item);
    }

    return result;
  }, [searchTerm, selectedCategory, filterCommonOnly]);

  // Filter the abbreviations based on abbreviation lookup search input
  const filteredAbbreviations = useMemo(() => {
    if (abbrevSearch) {
      const query = abbrevSearch.toLowerCase();
      return COMMON_ABBREVIATIONS.filter(ab => 
        ab.sigla.toLowerCase().includes(query) || 
        ab.nome.toLowerCase().includes(query) || 
        ab.desc.toLowerCase().includes(query) ||
        ab.categoria.toLowerCase().includes(query)
      );
    }
    // Sincronização lógica inteligente: se houver pesquisa na barra principal, refina as siglas também!
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matched = COMMON_ABBREVIATIONS.filter(ab => 
        ab.sigla.toLowerCase().includes(query) || 
        ab.nome.toLowerCase().includes(query) ||
        ab.canonicalName.toLowerCase().includes(query)
      );
      if (matched.length > 0) return matched;
    }
    return COMMON_ABBREVIATIONS;
  }, [abbrevSearch, searchTerm]);

  const handleAbbrevClick = (canonicalName: string, sigla: string) => {
    setSearchTerm(canonicalName);
    setSelectedCategory('all');
    // Scroll to results or item beautifully if possible
    setTimeout(() => {
      const element = document.getElementById('exam-grid-header');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-800 font-semibold mb-1">
            <BookOpen size={20} className="text-teal-600" />
            <span className="text-xs font-black uppercase tracking-wider text-teal-700">Explorador Clínico</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dicionário de Referências e Sinônimos de Exames</h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Laboratórios de referência (como Fleury, CDB, Delboni, Lavoisier, Alta e a+) usam nomenclaturas e abreviações diferentes para o mesmo exame.
            Nossa inteligência do sistema unifica esses apelidos automaticamente para agrupar e comparar seu histórico em gráficos e relatórios!
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-xs py-2.5 px-4 rounded-xl border border-teal-100 flex items-center gap-3 shrink-0 shadow-3xs">
          <ShieldCheck className="text-teal-600" size={24} />
          <div>
            <p className="text-xs text-slate-500 font-medium">Modelagem Clínica</p>
            <p className="text-sm font-bold text-teal-800">Padronização TUSS</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO DA HERO SEARCH COMPACTA E PODEROSA (Topo, Largura Total) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 max-w-full space-y-4 relative overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg inline-flex">
                <Search size={18} />
              </span>
              Portal de Pesquisa e Unificação de Nomenclaturas
            </h2>
            <p className="text-xs text-slate-500">
              Procure por qualquer exame escrito de diferentes formas (sinônimos, gírias laboratoriais, códigos ou siglas) para identificar seu termo clínico padronizado.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {/* "Most Common" Switcher */}
            <label className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-all text-xs font-bold text-slate-700 shadow-3xs">
              <input
                type="checkbox"
                checked={filterCommonOnly}
                onChange={(e) => setFilterCommonOnly(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 mr-1.5"
              />
              <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse shrink-0 mr-1" />
              <span>Mais Efetuados no Brasil</span>
            </label>
            
            {/* Category selection */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-3xs">
              <ListFilter size={14} className="text-slate-400 mr-1" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="all">Todas Áreas Médicas</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Central Search input block with portal layout */}
        <div className="relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-600" size={20} />
            <input
              type="text"
              placeholder="Pesquise por qualquer termo, sigla ou apelido clínico (ex: 'VIT D', 'FAN', 'ALT', 'Fleury', 'Hemograma')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-slate-50 hover:bg-slate-50/50 focus:bg-white border-2 border-slate-200 focus:border-teal-500 rounded-2xl text-sm font-semibold text-slate-950 focus:outline-none placeholder-slate-450 transition-all shadow-inner focus:shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setAbbrevSearch('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450 hover:text-red-500 bg-slate-200/60 hover:bg-slate-200 p-1 w-6 h-6 flex items-center justify-center rounded-full transition-all"
                title="Limpar pesquisa"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Popular research suggetions */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500 font-semibold relative z-10">
          <span className="text-slate-400 flex items-center gap-1 shrink-0">
            <Sparkles size={13} className="text-amber-500 mr-0.5" />
            Sugestões Clínicas:
          </span>
          {[
            { tag: 'Vit D', search: 'Vitamina D' },
            { tag: 'PCR', search: 'Proteína C-Reativa' },
            { tag: 'FAN', search: 'Fator Antinuclear' },
            { tag: 'TSH', search: 'TSH' },
            { tag: 'Hemograma', search: 'Hemograma Completo' },
            { tag: 'B12', search: 'Vitamina B12' },
            { tag: 'Cortisol', search: 'Cortisol' },
            { tag: 'TGP / ALT', search: 'TGP' }
          ].map((item) => (
            <button
              key={item.tag}
              onClick={() => {
                setSearchTerm(item.search);
                setSelectedCategory('all');
                setTimeout(() => {
                  const el = document.getElementById('exam-grid-header');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-850 rounded-lg transition-all shadow-3xs cursor-pointer active:scale-95"
            >
              #{item.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left col for primary Results, Right col for abbreviations quick-finder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Primary column (lg:col-span-8): results count and list cards */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Term Explainer Module */}
          <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-100 p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center shrink-0 border border-indigo-200/50">
                <Bot size={20} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Explicador de Exames com IA
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Não encontrou no catálogo? Digite um termo médico complexo e nossa IA traduzirá para você de forma simples.
                </p>
              </div>
            </div>
            
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all max-w-xl shadow-xs">
              <input
                type="text"
                placeholder="Exemplo: Ferritina Sérica, CPK, Fator Reumatóide..."
                value={aiExplainTerm}
                onChange={(e) => setAiExplainTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleExplainAI(); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium border-0 focus:ring-0"
              />
              <button
                onClick={handleExplainAI}
                disabled={isAiExplaining || !aiExplainTerm.trim()}
                className="px-5 bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isAiExplaining ? (
                   <span className="flex items-center gap-1.5">
                     <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                     Pensando...
                   </span>
                ) : (
                   <>
                     <Sparkles size={14} /> Explicar
                   </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {aiExplanationResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-white border border-indigo-100 rounded-xl p-4 shadow-inner"
                >
                  <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-indigo-950 prose-a:text-indigo-600 prose-p:text-slate-700 prose-strong:text-slate-800 text-xs">
                    <ReactMarkdown>{aiExplanationResult}</ReactMarkdown>
                  </div>
                  <button 
                    onClick={() => setAiExplanationResult(null)}
                    className="mt-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest text-center w-full"
                  >
                    Fechar Explicação
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Grid header identifier for smooth scrolling */}
          <div id="exam-grid-header" className="flex justify-between items-center border-b border-slate-200 pb-2.5 pt-1 scroll-mt-6">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Layers size={16} className="text-teal-600" />
              <span>Resultados Busca / Catálogo ({filteredItems.length})</span>
            </h3>
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setAbbrevSearch('');
                }}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 transition-colors cursor-pointer"
              >
                Limpar Busca
              </button>
            )}
          </div>

          {/* Grid of Dictionary Items */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center max-w-lg mx-auto">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                <Search size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Nenhum exame catalogado encontrado</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tente buscar com outros termos ou limpe os filtros selecionados para encontrar o que procura.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setFilterCommonOnly(false);
                }} 
                className="mt-4 px-4 py-2 bg-teal-600 text-white font-semibold text-xs rounded-lg hover:bg-teal-700 transition"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => {
                const isCurrentlySelected = searchTerm === item.canonicalName;
                return (
                  <div 
                    key={item.canonicalName} 
                    className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between group relative ${
                      isCurrentlySelected 
                        ? "border-teal-500 shadow-md ring-2 ring-teal-500/10 bg-gradient-to-b from-teal-50/5 via-white to-white" 
                        : "border-slate-150/80 shadow-3xs hover:shadow-2xs hover:border-teal-200/50"
                    }`}
                  >
                    <div>
                      {/* Header Information */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-600 rounded-lg uppercase tracking-wider">
                              {item.category}
                            </span>
                            {isCurrentlySelected && (
                              <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-850 border border-teal-250 rounded-lg text-[9px] font-bold shrink-0">
                                COMPATÍVEL
                              </span>
                            )}
                          </div>
                          <h2 className="text-sm font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors flex items-center flex-wrap gap-1.5 leading-snug">
                            {item.canonicalName}
                            {item.mostCommonBrazil && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/55 rounded-full text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                                🔥 Principal
                              </span>
                            )}
                          </h2>
                        </div>
                        <div className="w-8 h-8 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                          <FlaskConical size={16} />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Synonyms/Aliases */}
                      <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 mb-4 text-[11px]">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                            <Tag size={10} className="text-teal-500" />
                            <span>Sinônimos e Abreviações Mapeados ({item.aliases.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                            {item.aliases.map(alias => (
                              <span 
                                key={alias} 
                                className="px-2 py-0.5 bg-white border border-slate-205 text-slate-700 rounded-md shadow-3xs sm:hover:border-slate-300 transition-colors"
                              >
                                {alias}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Representative Lab Examples */}
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1.5 border-t border-slate-150 pt-2.5">
                            <ExternalLink size={10} className="text-slate-400" />
                            <span>Como aparece nos principais laboratórios</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            {item.labExamples.map((ex, i) => (
                              <div key={i} className="flex flex-col bg-white p-1.5 rounded border border-slate-200/60 leading-tight">
                                <span className="text-slate-400 font-sans font-semibold text-[8px] uppercase tracking-wider">{ex.lab}</span>
                                <span className="text-slate-700 truncate font-semibold mt-0.5" title={ex.label}>{ex.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Informações Funcionais / Clínicas do Dicionário Rico */}
                      {(item.optimalRange || item.symptomsHigh || item.symptomsLow || (item.recommendations && item.recommendations.length > 0)) && (
                        <div className="mt-4 bg-slate-50/40 border border-slate-200/60 rounded-xl p-3.5 space-y-3 mb-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-905 uppercase tracking-wider">
                            <Sparkles size={11} className="text-indigo-600 animate-pulse shrink-0" />
                            <span>Referenciais Clínicos Avançados</span>
                          </div>

                          {item.optimalRange && (
                            <div className="p-2.5 bg-indigo-50/50 hover:bg-indigo-50/70 transition-colors border border-indigo-100 rounded-lg space-y-0.5 shadow-3xs">
                              <span className="text-[9px] font-black text-indigo-800 uppercase tracking-wider block">🎯 Alvo Funcional Otimizado (Ideal)</span>
                              <span className="text-xs font-bold text-slate-800">{item.optimalRange}</span>
                            </div>
                          )}

                          {(item.symptomsHigh || item.symptomsLow) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                              {item.symptomsHigh && (
                                <div className="p-2.5 bg-rose-50/40 hover:bg-rose-50/60 transition-colors border border-rose-100/60 rounded-lg">
                                  <span className="text-[9px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
                                    📈 Sinais Se Elevado
                                  </span>
                                  <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-snug">{item.symptomsHigh}</p>
                                </div>
                              )}
                              {item.symptomsLow && (
                                <div className="p-2.5 bg-blue-50/40 hover:bg-blue-50/60 transition-colors border border-blue-100/60 rounded-lg">
                                  <span className="text-[9px] font-black text-blue-800 uppercase tracking-wider flex items-center gap-1">
                                    📉 Sinais Se Deficitário
                                  </span>
                                  <p className="text-[10px] font-semibold text-slate-700 mt-1 leading-snug">{item.symptomsLow}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {item.recommendations && item.recommendations.length > 0 && (
                            <div className="p-2.5 bg-teal-50/45 hover:bg-teal-50/70 transition-colors border border-teal-100/70 rounded-lg space-y-1.5">
                              <span className="text-[9px] font-black text-teal-850 uppercase tracking-wider block">🥑 Recomendações Saudáveis & Estilo de Vida</span>
                              <ul className="text-[10px] font-semibold text-teal-950 space-y-1 list-none pl-0">
                                {item.recommendations.map((rec, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-1.5">
                                    <span className="text-teal-600 select-none font-bold mt-0.5 shrink-0">✔</span>
                                    <span className="text-slate-700 leading-snug">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Real User Records integration */}
                      {(() => {
                        const userRecords = matchingUserExams[item.canonicalName] || [];
                        const hasUserRecords = userRecords.length > 0;
                        if (!hasUserRecords) return null;
                        return (
                          <div className="mt-3.5 border-t border-dashed border-teal-150 bg-teal-50/20 rounded-xl p-3 border border-teal-100">
                            <div className="flex items-center justify-between gap-1.5 mb-2">
                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-teal-800 uppercase tracking-widest leading-none">
                                <Activity size={10} className="text-teal-650 animate-pulse" />
                                <span>Laudos Vinculados ({userRecords.length})</span>
                              </span>
                            </div>
                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                              {userRecords.map((rec, idx) => {
                                let badgeStyle = "bg-slate-100 text-slate-700";
                                if (rec.interpretacao === 'Normal') badgeStyle = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                                else if (rec.interpretacao === 'Alterado') badgeStyle = "bg-rose-50 text-rose-700 border-rose-100";
                                else if (rec.interpretacao === 'Sub-ópt.') badgeStyle = "bg-amber-50 text-amber-700 border-amber-100";
                                
                                return (
                                  <div key={idx} className="bg-white/95 border border-teal-100/50 rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] leading-tight shadow-2xs hover:border-teal-300/60 transition-colors">
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-mono text-slate-555 font-bold text-[9px]">{rec.dataExame}</span>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide ${badgeStyle}`}>
                                          {rec.interpretacao}
                                        </span>
                                      </div>
                                      <p className="font-extrabold text-slate-800 truncate">
                                        {rec.resultado} <span className="font-semibold text-slate-500 font-sans text-[10px]">{rec.unidade && rec.unidade !== '—' ? rec.unidade : ''}</span>
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                                      {rec.arquivoOrigem && (
                                        <button
                                          onClick={() => {
                                            if (onNavigate) {
                                              onNavigate('sources', { sourceName: rec.arquivoOrigem, openPdf: true });
                                            }
                                          }}
                                          className="flex items-center gap-1.5 text-[9px] font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white px-2.5 py-1.5 rounded-md border border-teal-200 transition-all cursor-pointer shadow-3xs"
                                          title="Visualizar este PDF original diretamente"
                                        >
                                          <FileText size={10} />
                                          <span>Ver PDF</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Automatic Grouping workflow showcase */}
                    <div className="border-t border-slate-150 pt-3 flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-3">
                      <span className="flex items-center gap-1 text-slate-400">
                        <CheckCircle2 size={13} className="text-emerald-500" /> Unificação Inteligente
                      </span>
                      <button
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate('exams', { searchTerm: item.canonicalName });
                          }
                        }}
                        className="text-teal-600 font-bold hover:text-teal-700 transition-colors flex items-center gap-1.5 bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <span>Histórico Comparativo</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (lg:col-span-4): Decodificador de Siglas / Leitura Rápida Card */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">
          <div className="bg-gradient-to-br from-slate-50 to-zinc-50 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-snug">
                <Sparkles size={16} className="text-teal-600 animate-pulse shrink-0" />
                Decodificador de Siglas Rápido
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Seu laudo de exame exibe siglas misteriosas? Digite uma sigla ou selecione-a abaixo para entender seu significado clínico instantaneamente e abrir os detalhes no painel principal:
              </p>
            </div>

            {/* Mini-Input for Abbreviation search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Exágono de siglas (Ex: PCR, TSH)..."
                value={abbrevSearch}
                onChange={(e) => setAbbrevSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 font-semibold placeholder-slate-400 transition-all font-mono"
              />
              {abbrevSearch && (
                <button
                  onClick={() => setAbbrevSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600"
                  title="Limpar buscador de siglas"
                >
                  ✕
                </button>
              )}
            </div>

            {/* List Grid wrapper with max-height scroll in right column */}
            <div className="max-h-[500px] overflow-y-auto pr-1 bg-white/60 rounded-xl p-3 border border-slate-150 shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {filteredAbbreviations.map((abbrev, index) => {
                  // Determine category styling
                  let catColor = "bg-slate-100 text-slate-750";
                  if (abbrev.categoria === "Inflamação") catColor = "bg-rose-50 text-rose-700 border-rose-100";
                  else if (abbrev.categoria === "Tireoide") catColor = "bg-purple-50 text-purple-700 border-purple-100";
                  else if (abbrev.categoria === "Glicemia") catColor = "bg-amber-50 text-amber-700 border-amber-100";
                  else if (abbrev.categoria === "Fígado") catColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  else if (abbrev.categoria === "Sorologia") catColor = "bg-blue-50 text-blue-700 border-blue-100";
                  else if (abbrev.categoria === "Urinário") catColor = "bg-cyan-50 text-cyan-700 border-cyan-100";
                  else if (abbrev.categoria === "Coagulação") catColor = "bg-red-50 text-red-700 border-red-100";
                  else if (abbrev.categoria === "Hormônios") catColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                  else if (abbrev.categoria === "Metabolismo") catColor = "bg-teal-50 text-teal-700 border-teal-100";
                  else if (abbrev.categoria === "Urologia") catColor = "bg-violet-50 text-violet-700 border-violet-100";
                  
                  const isCurrentlySelected = searchTerm === abbrev.canonicalName;
                  
                  return (
                    <button
                      key={`${abbrev.sigla}-${index}`}
                      onClick={() => handleAbbrevClick(abbrev.canonicalName, abbrev.sigla)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between hover:shadow-2xs group cursor-pointer ${
                        isCurrentlySelected 
                          ? "bg-teal-50/70 border-teal-500 shadow-xs ring-2 ring-teal-500/10 cursor-default" 
                          : "bg-white border-slate-200/70 hover:border-teal-400 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start gap-1 pb-1">
                          <span className="font-mono text-xs font-black tracking-wide text-slate-900 flex items-center gap-1">
                            {abbrev.sigla}
                            {isCurrentlySelected && (
                              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping inline-block" />
                            )}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${catColor}`}>
                            {abbrev.categoria}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-none mb-0.5 truncate">
                          {abbrev.nome}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                          {abbrev.desc}
                        </p>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-slate-100/70 flex justify-between items-center text-[9px] font-bold leading-none shrink-0 border-dashed">
                        <span className={`${isCurrentlySelected ? "text-teal-700 animate-pulse font-bold" : "text-slate-400 font-medium group-hover:text-teal-600"}`}>
                          {isCurrentlySelected ? "📍 Selecionado" : "Ver Exame Completo"}
                        </span>
                        <ArrowRight size={10} className={`${isCurrentlySelected ? "text-teal-600 stroke-[3px]" : "text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredAbbreviations.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs font-medium flex flex-col items-center justify-center gap-1.5">
                  <Activity size={20} className="text-teal-600 animate-pulse" />
                  Nenhuma sigla de exame encontrada
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
