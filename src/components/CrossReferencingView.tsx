import React, { useState, useMemo } from 'react';
import { useData } from '../App';
import { 
  BarChart2, 
  Search, 
  Filter, 
  Stethoscope, 
  Activity, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  CheckCircle, 
  ChevronRight, 
  PieChart, 
  Info, 
  ArrowUpDown, 
  Printer, 
  Grid,
  TrendingUp,
  Tag,
  Stethoscope as DoctorIcon,
  HeartPulse,
  ArrowLeft,
  Clock,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LabelList,
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const BIOLOGICAL_SYSTEMS_INFO: Record<string, {
  description: string;
  functionalFocus: string[];
  warningSigns: string[];
  integrativeTips: string[];
  emoji: string;
  colorClass: string;
  gradientClass: string;
}> = {
  'Metabólico / Lipídico': {
    description: 'Gerencia o equilíbrio energético mitocondrial, transporte de colesterol e regulação da resistência periférica à insulina.',
    functionalFocus: ['Colesterol Total', 'Frações LDL/HDL', 'Triglicerídeos', 'Glicose', 'Apolipoproteína A1/B'],
    warningSigns: [
      'Névoa mental pós-prandial (fadiga pós-almoço)',
      'Acúmulo de gordura de padrão predominantemente visceral (abdominal)',
      'Desejo impulsivo por doces ou carboidratos de absorção rápida',
      'Oscilações abruptas de energia física durante o dia'
    ],
    integrativeTips: [
      'Realizar atividade física resistida (musculação/funcional) para aumentar a captação de glicose sem dependência estrita de insulina.',
      'Incrementar o consumo de gorduras monoinsaturadas saudáveis, como Azeite de Oliva Extra Virgem e abacates frescos.',
      'Manter jejum fisiológico mínimo de 12h entre a última refeição noturna e o desjejum.'
    ],
    emoji: '📊',
    colorClass: 'bg-emerald-500 text-white',
    gradientClass: 'from-emerald-650 via-emerald-700 to-teal-800'
  },
  'Hepático': {
    description: 'Central de metabolização de drogas fitoquímicas/sintéticas, síntese de proteínas plasmáticas e excreção de produtos de quebra molecular através das fases 1 e 2 de detoxificação.',
    functionalFocus: ['TGO (AST) / TGP (ALT)', 'Gama-GT', 'Bilirrubinas Totais e Frações', 'Fosfatase Alcalina', 'Albumina Sérica'],
    warningSigns: [
      'Digestão marcadamente lenta ou incômoda de gorduras',
      'Halitose injustificada e sabor amargo na boca pela manhã',
      'Prurido cutâneo persistente sem lesão primária',
      'Enxaquecas de padrão tensional frequentes',
      'Fezes de tonalidade excessivamente clara'
    ],
    integrativeTips: [
      'Apoiar as vias de sulfatação e conjugação hepática consumindo vegetais crucíferos (brócolis, couve, repolho, rabanete).',
      'Inserir fontes de Colina dietética (ovos com gema mole ou suplementação) para apoiar o tráfego lipídico e evitar esteatose.',
      'Fazer infusão de ervas amargas (boldo, dente-de-leão ou carqueja) antes de refeições mais gordurosas.'
    ],
    emoji: '🟢',
    colorClass: 'bg-teal-500 text-white',
    gradientClass: 'from-teal-600 via-teal-700 to-emerald-800'
  },
  'Imunológico & Inflamatório': {
    description: 'Rede ativa de reconhecimento de antígenos, manutenção da barreiras protetivas e autotolerância imunológica para prevenir agressões autoimunes crônicas.',
    functionalFocus: ['FAN (Fator Antinuclear)', 'Proteína C Reativa Ultrassensível (PCR-us)', 'VHS (Velocidade de Hemossedimentação)', 'Complementos C3 e C4 séricos', 'Anticorpos específicos de perfil de autoimunidade'],
    warningSigns: [
      'Dores articulares migratórias, simétricas ou assimétricas',
      'Rigidez articular prolongada pela manhã ao se levantar',
      'Erupções ou eritemas desencadeados por fotoexposição solar',
      'Aftas orais de repetição frequentes',
      'Sensibilidade extrema das mãos ao frio (fenômeno de Raynaud)'
    ],
    integrativeTips: [
      'Adotar protocolo alimentar focado na redução de alérgenos e açúcares altamente pró-inflamatórios, aumentando ingestão de ômega-3 ativo.',
      'Otimizar o manejo do estresse com respiração coerente ou meditação guiada, reduzindo a cascata de citocinas inflamatórias.',
      'Zelar pela barreira intestinal (suplementação com L-glutamina ou uso de caldos ricos em colágeno) para mitigar a translocação antigênica.'
    ],
    emoji: '🛡️',
    colorClass: 'bg-rose-500 text-white',
    gradientClass: 'from-rose-600 via-rose-700 to-indigo-800'
  },
  'Endócrino & Tireoide': {
    description: 'Eixo hormonal e glandular que coordena as taxas metabólicas celulares reativas, controle térmico periférico e regulação de neurotransmissores.',
    functionalFocus: ['TSH (Hormônio Tireoestimulante)', 'T4 Livre / T3 Livre', 'Anticorpos Anti-TPO e Anti-Tireoglobulina', 'Cortisol Plasmático / Linha Salivar', 'DHEA Hormonal Sérica'],
    warningSigns: [
      'Dificuldade incapacitante para redução de peso corporal mesmo sob restrição dietética coerente',
      'Queda severa e difusa de fios de cabelo e unhas fracas',
      'Pele excessivamente seca, descamativa ou fria',
      'Sensibilidade desproporcional ou intolerância severa ao frio',
      'Constipação crônica prolongada de difícil manejo'
    ],
    integrativeTips: [
      'Fornecer minerais co-fatores vitais na conversão periférica de T4 para T3 ativo: Selênio, Zinco e Magnésio.',
      'Garantir higiene do sono robusta (ambiente térmico agradável e livre de ondas de luz azul) para modular o cortisol basal.',
      'Evitar restrição calórica extrema ou jejum prolongado intermitente sem indicação médica, pois induzem a produção de T3 Reverso.'
    ],
    emoji: '🦋',
    colorClass: 'bg-amber-500 text-white',
    gradientClass: 'from-amber-600 via-amber-700 to-rose-800'
  },
  'Renal': {
    description: 'Sistemas de depuração plasmática, balanço de eletrólitos (sódio/potássio), eliminação de metabólitos nitrogenados e regulação do volume vascular arterial.',
    functionalFocus: ['Creatinina Sérica', 'Ureia Sérica', 'Taxa de Filtração Glomerular Estimada (TFGe)', 'Ácido Úrico', 'Urina Tipo I (EAS) com sedimentoscopia'],
    warningSigns: [
      'Retenção hídrica aparente em membros inferiores ou tornozelos',
      'Inchaço bipalpebral (ao redor dos olhos) marcante ao acordar',
      'Alterações repentinas no jato, espuma ou tonalidade da urina',
      'Cãibras intensas no repouso noturno',
      'Flutuações injustificadas da pressão arterial sistêmica'
    ],
    integrativeTips: [
      'Garantir hidratação regular ajustada para no mínimo 35ml por quilograma de peso corporal por dia de água purificada mineral.',
      'Controlar a carga e qualidade protéica dietética se houver sinais iniciais de diminuição da filtração glomerular.',
      'Evitar a automedicação repetitiva com anti-inflamatórios não-esteroidais, potenciais causadores de nefrotoxicidade silenciosa.'
    ],
    emoji: '🧬',
    colorClass: 'bg-blue-500 text-white',
    gradientClass: 'from-blue-600 via-blue-700 to-indigo-800'
  },
  'Hematológico': {
    description: 'Fornecimento molecular de oxigênio sistêmico, produção medular da linhagem eritroide, leucograma e preservação hemostática sanguínea.',
    functionalFocus: ['Eritrócitos totais / Concentração de Hemoglobina', 'Índices Hematimétricos (VCM, HCM, CHCM)', 'Leucócitos Globais e Subpopulações', 'Contagem de Plaquetas / VPM'],
    warningSigns: [
      'Fadiga profunda crônica incapacitante mesmo após sono longo',
      'Acentuada palidez visível na região interna das pálpebras',
      'Sensação de falta de ar frequente aos esforços diários comuns',
      'Dificuldade acentuada de memorização e foco no raciocínio',
      'Sangramento gengival frequente ou aparecimento fácil de manchas roxas'
    ],
    integrativeTips: [
      'Incrementar o aporte dietético biodisponível de ferro combinando fontes vegetais com extratos orgânicos de Vitamina C.',
      'Avaliar integridade gástrica, hipocloridria e fator intrínseco, que podem limitar a digestibilidade e o tráfego de minerais.',
      'Estar atento à modulação da medula óssea através de sono reparador e controle de inflamações basais silenciosas.'
    ],
    emoji: '🩸',
    colorClass: 'bg-indigo-500 text-white',
    gradientClass: 'from-indigo-600 via-indigo-700 to-teal-800'
  },
  'Musculoesquelético': {
    description: 'Estruturação biomecânica de sustentação corporal ativa, turnover celular ósseo e preservação da integridade miofascial.',
    functionalFocus: ['Creatinoquinase (CPK)', 'Aldolase Sérica', 'Cálcio Iônico / Fósforo Sérico', 'Fosfatase Alcalina Óssea', 'Check-ups de imagem estrutural'],
    warningSigns: [
      'Dores articulares severas localizadas e profundas',
      'Fraqueza muscular generalizada de caráter proximal',
      'Cãibras musculares agudas frequentes',
      'Limitação progressiva de amplitude mecânica articular comum'
    ],
    integrativeTips: [
      'Manter fortalecimento muscular de baixo impacto (pilates, hidroginástica, treinos calibrados por especialistas).',
      'Otimizar o status sérico de Magnésio e Cálcio em equilíbrio ativo para garantir o relaxamento neuromuscular.',
      'Consumir caldos ricos em peptídeos bioativos de colágeno e manter excelente hidratação da matriz extracelular.'
    ],
    emoji: '🦴',
    colorClass: 'bg-purple-500 text-white',
    gradientClass: 'from-purple-600 via-purple-700 to-pink-800'
  },
  'Nutricional & Neurológico': {
    description: 'Absorção e armazenamento de micronutrientes essenciais envolvidos na síntese de mielina nervosa, atividade de foco cognitivo e ciclo mitocondrial.',
    functionalFocus: ['Vitamina B12 (Cobalamina)', 'Vitamina D3 (Colecalciferol)', 'Ferritina Sérica', 'Zinco Sérico / Magnésio Sérico', 'Ácido Fólico (Folato)'],
    warningSigns: [
      'Névoa mental crônica (brain fog) acompanhada de dispersão constante',
      'Parestesias ou formigamentos recorrentes em membros periféricos',
      'Insônia marcada ou despertar noturno agitado',
      'Declínio sutil da velocidade cognitiva executiva',
      'Lapsos frequentes de memória cotidiana'
    ],
    integrativeTips: [
      'Suplementar ou repor Ativos de alta biodisponibilidade (como o Metilfolato e a Metilcobalamina) se houver limitações ou polimorfismos enzimáticos.',
      'Garantir de 15 a 20 minutos diários de exposição solar saudável sem bloqueador para ativação de Vitamina D de base hormonal.',
      'Fomentar a integridade ácida gástrica para a correta dissociação do fator intrínseco e absorção ideal de oligoelementos.'
    ],
    emoji: '🧠',
    colorClass: 'bg-cyan-500 text-white',
    gradientClass: 'from-cyan-600 via-cyan-700 to-indigo-800'
  },
  'Geral / Outros': {
    description: 'Grupo e nicho direcionado para exames de triagem rotineira complementar preventiva inespecífica.',
    functionalFocus: ['Hemogramas gerais preliminares', 'Parâmetros de triagem ampla de padrão bianual ou anual'],
    warningSigns: [
      'Oscilações gerais vagas de bem-estar integral e perda injustificada de peso',
      'Cansaço geral não adaptável após períodos curtos de tarefas cotidianas'
    ],
    integrativeTips: [
      'Mapear e catalogar todos os novos relatórios semestrais no HealthTracker para análise longitudinal correlacionada por IA.',
      'Praticar os quatro pilares básicos do bem-estar diário: sono profundo, nutrição íntegra, movimento diário e gestão mental consciente.'
    ],
    emoji: '🩺',
    colorClass: 'bg-slate-500 text-white',
    gradientClass: 'from-slate-600 via-slate-700 to-slate-900'
  }
};

export default function CrossReferencingView({ onNavigate }: { onNavigate?: (tab: string, params?: any) => void }) {
  const { processedExams } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'specialties' | 'systems' | 'matrix' | 'analytics'>('specialties');
  const [selectedSystemDetail, setSelectedSystemDetail] = useState<string | null>(null);
  const [expandedExamIdx, setExpandedExamIdx] = useState<number | null>(null);
  
  // Matrix Explorer State
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Todas');
  const [selectedSystem, setSelectedSystem] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculations logic for specialties
  const specialtyMetrics = useMemo(() => {
    const map = new Map<string, { total: number; altered: number; normal: number; exams: string[] }>();
    
    processedExams.forEach(e => {
      const spec = e.especialidadeMedica || 'Clínica Médica';
      if (!map.has(spec)) {
        map.set(spec, { total: 0, altered: 0, normal: 0, exams: [] });
      }
      const data = map.get(spec)!;
      data.total += 1;
      if (e.interpretacao === 'Alterado') {
        data.altered += 1;
      } else if (e.interpretacao === 'Normal') {
        data.normal += 1;
      }
      if (!data.exams.includes(e.nomeExame)) {
        data.exams.push(e.nomeExame);
      }
    });

    return Array.from(map.entries()).map(([name, calc]) => ({
      name,
      ...calc,
      alteredRatio: calc.total > 0 ? Math.round((calc.altered / calc.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [processedExams]);

  // 2. Calculations for systems
  const systemMetrics = useMemo(() => {
    const map = new Map<string, { total: number; altered: number; normal: number; markers: string[] }>();
    
    processedExams.forEach(e => {
      const sys = e.grupoSistemico || 'Geral / Outros';
      if (!map.has(sys)) {
        map.set(sys, { total: 0, altered: 0, normal: 0, markers: [] });
      }
      const data = map.get(sys)!;
      data.total += 1;
      if (e.interpretacao === 'Alterado') {
        data.altered += 1;
      } else {
        data.normal += 1;
      }
      if (!data.markers.includes(e.nomeExame)) {
        data.markers.push(e.nomeExame);
      }
    });

    return Array.from(map.entries()).map(([name, calc]) => ({
      name,
      ...calc,
      alteredRatio: calc.total > 0 ? Math.round((calc.altered / calc.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [processedExams]);

  // Unique list of Specialties & Systems for Matrix Explorer drop-downs
  const specialtiesList = useMemo(() => {
    return ['Todas', ...specialtyMetrics.map(s => s.name)];
  }, [specialtyMetrics]);

  const systemsList = useMemo(() => {
    return ['Todos', ...systemMetrics.map(s => s.name)];
  }, [systemMetrics]);

  // Matrix Filtered Results
  const crossFilteredExams = useMemo(() => {
    return processedExams.filter(e => {
      const spec = e.especialidadeMedica || 'Clínica Médica';
      const sys = e.grupoSistemico || 'Geral / Outros';
      
      const specialtyMatches = selectedSpecialty === 'Todas' || spec === selectedSpecialty;
      const systemMatches = selectedSystem === 'Todos' || sys === selectedSystem;
      
      const textMatches = !searchQuery || 
        e.nomeExame.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.resultado.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.tags || '').toLowerCase().includes(searchQuery.toLowerCase());

      return specialtyMatches && systemMatches && textMatches;
    });
  }, [processedExams, selectedSpecialty, selectedSystem, searchQuery]);

  // Recharts color list
  const COLORS = ['#0d9488', '#ea580c', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

  // Smart Clinical Insight Generator
  const clinicalMatrixInsight = useMemo(() => {
    if (processedExams.length === 0) {
      return 'Nenhum exame cadastrado no prontuário ainda.';
    }

    if (selectedSpecialty !== 'Todas' && selectedSystem !== 'Todos') {
      const count = crossFilteredExams.length;
      const altered = crossFilteredExams.filter(e => e.interpretacao === 'Alterado').length;
      
      let synthesis = `Você selecionou a especialidade **${selectedSpecialty}** cruzada com o sistema biológico **${selectedSystem}**. Foram encontrados **${count} marcador(es)** cadastrados, com **${altered} alterados**. `;
      
      if (selectedSpecialty === 'Reumatologia' && selectedSystem === 'Imunológico & Inflamatório') {
        synthesis += `\nHá uma correlação clínica de alta significância aqui. Exames de Reumatologia focam no rastreamento de suas condições autoimunes. Monitorar os marcadores autoimunes (FAN, anticorpos específicos) e inflamatórios (PCR, VHS) é crítico para prevenir recidivas de dor ativa (flares).`;
      } else if (selectedSpecialty === 'Endocrinologia' && selectedSystem === 'Endócrino & Tireoide') {
        synthesis += `\nAnálise centrada na tireoide e metabolismo hormonal. O acompanhamento regular de TSH e T4 Livre é indispensável para monitorar de perto a atividade imunológica contra a glândula tireoidiana.`;
      } else if (altered > 0) {
        synthesis += `\n⚠️ Atenção: A presença de ${altered} marcadores alterados sob o controle de ${selectedSpecialty} requer atenção clínica sinérgica. Discuta estes biomarcadores em sua próxima consulta agendada.`;
      } else {
        synthesis += `\nOs marcadores analisados estão estáveis dentro deste sistema de controle médico. Continue o acompanhamento preventivo padrão.`;
      }
      return synthesis;
    }

    return 'Selecione uma **Especialidade Médica** e um **Sistema Alvo** acima para gerar um cruzamento inteligente e síntese clínica baseada nos seus resultados.';
  }, [selectedSpecialty, selectedSystem, crossFilteredExams, processedExams]);

  const exportCSV = () => {
    let headers = ['Data', 'Exame', 'Resultado', 'Unidade', 'Referência', 'Status', 'Médico', 'Especialidade', 'Sistema Alvo', 'Tags', 'Impacto Autoimune'];
    let rows = crossFilteredExams.map(e => [
      e.dataExame,
      e.nomeExame,
      e.resultado,
      e.unidade || '—',
      e.valorReferencia || '—',
      e.interpretacao,
      e.medicoSolicitante,
      e.especialidadeMedica || 'Clínica Médica',
      e.grupoSistemico || 'Geral / Outros',
      e.tags || '',
      e.impactoAutoimune || 'Baixo'
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(';'), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cruzamento_exames_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="cross-referencing-tab" className="space-y-8 animate-fade-in text-slate-800">
      {/* Header Visual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 p-8 rounded-3xl text-white shadow-xl shadow-teal-950/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 opacity-[0.06] text-white pointer-events-none select-none">
          <PieChart size={240} />
        </div>
        <div className="relative">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-teal-200 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-white/10 select-none">
            Análise Avançada & Relações
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-2 leading-none">Cruzamento Clínico</h1>
          <p className="text-sm font-medium text-teal-100/95 mt-2 max-w-xl leading-relaxed">
            Navegue por especialidades médicas, sistemas biológicos integrados e faça pesquisas cruzadas imediatas para obter relatórios inteligentes sobre sua jornada de saúde.
          </p>
        </div>
        <button 
          onClick={exportCSV} 
          className="relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-900 font-bold text-sm hover:bg-teal-50 transition-all rounded-2xl shadow-lg shadow-teal-900/10 shrink-0 select-none cursor-pointer"
        >
          <Printer size={16} /> Exportar Cruzamento
        </button>
      </div>

      {/* Sub tabs selectors */}
      <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl border flex-wrap sm:flex-nowrap shadow-xs">
        <button
          onClick={() => { setActiveSubTab('specialties'); setSelectedSystemDetail(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeSubTab === 'specialties' ? 'bg-teal-500/10 text-teal-700 font-extrabold shadow-3xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Stethoscope size={16} /> Especialidades Médicas
        </button>
        <button
          onClick={() => { setActiveSubTab('systems'); setSelectedSystemDetail(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeSubTab === 'systems' ? 'bg-teal-500/10 text-teal-700 font-extrabold shadow-3xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Layers size={16} /> Sistemas Biológicos
        </button>
        <button
          onClick={() => { setActiveSubTab('matrix'); setSelectedSystemDetail(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeSubTab === 'matrix' ? 'bg-teal-500/10 text-teal-700 font-extrabold shadow-3xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <Grid size={16} /> Explorar Matriz Cruzada
        </button>
        <button
          onClick={() => { setActiveSubTab('analytics'); setSelectedSystemDetail(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${activeSubTab === 'analytics' ? 'bg-teal-500/10 text-teal-700 font-extrabold shadow-3xs' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <TrendingUp size={16} /> Autoimunologia & KPIs
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* 1. SPECIALTIES DETAILED ANALYSIS */}
      {activeSubTab === 'specialties' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bento metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart2 size={18} className="text-teal-600" /> Distribuição de Exames por Especialidade
              </h3>
              
              {specialtyMetrics.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  Nenhum registro clínico disponível para cálculo.
                </div>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={specialtyMetrics} layout="vertical" margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                          backdropFilter: 'blur(8px)',
                          padding: '10px 14px'
                        }}
                        formatter={(value, name) => [value, name === 'total' ? 'Total Exames' : name === 'altered' ? 'Alterados' : name]} 
                      />
                      <Bar dataKey="total" fill="#0d9488" name="Total Exames" radius={[0, 5, 5, 0]} barSize={12}>
                        <LabelList
                          dataKey="total"
                          position="right"
                          content={(props: any) => {
                            const { x, y, width, height, value } = props;
                            if (!value) return null;
                            return (
                              <g>
                                <rect x={Number(x)+Number(width)+3} y={Number(y)+Number(height)/2-8} width={20} height={16} rx={4} fill="#f0fdfa" stroke="#99f6e4" strokeWidth={1}/>
                                <text x={Number(x)+Number(width)+13} y={Number(y)+Number(height)/2+1} fill="#0f766e" fontSize={10} fontWeight="800" textAnchor="middle" dominantBaseline="middle">{value}</text>
                              </g>
                            );
                          }}
                        />
                      </Bar>
                      <Bar dataKey="altered" fill="#e11d48" name="Alterados" radius={[0, 5, 5, 0]} barSize={12}>
                        <LabelList
                          dataKey="altered"
                          position="right"
                          content={(props: any) => {
                            const { x, y, width, height, value } = props;
                            if (!value) return null;
                            return (
                              <g>
                                <rect x={Number(x)+Number(width)+3} y={Number(y)+Number(height)/2-8} width={20} height={16} rx={4} fill="#fff1f2" stroke="#fecdd3" strokeWidth={1}/>
                                <text x={Number(x)+Number(width)+13} y={Number(y)+Number(height)/2+1} fill="#be123c" fontSize={10} fontWeight="800" textAnchor="middle" dominantBaseline="middle">{value}</text>
                              </g>
                            );
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Specialties detail cards list */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Mapeamento Detalhado de Especialidades</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specialtyMetrics.map((spec, i) => (
                  <div key={spec.name} className="p-5 bg-slate-50 border border-slate-200/80 hover:border-teal-500/30 rounded-2xl transition-all relative overflow-hidden shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="p-2 bg-white text-teal-600 rounded-xl border border-slate-100 shadow-3xs"><DoctorIcon size={20} /></span>
                      <span className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full ${spec.alteredRatio > 30 ? 'bg-rose-50 text-rose-700 border border-rose-150' : 'bg-emerald-50 text-emerald-700 border border-emerald-150'}`}>
                        {spec.alteredRatio}% Alterados
                      </span>
                    </div>
                    <p className="text-base font-bold text-slate-800 leading-snug truncate">{spec.name}</p>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Exames Solicitados: <strong className="text-slate-800">{spec.total}</strong></p>
                    <div className="flex gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-200/60 overflow-hidden max-h-[50px]">
                      {spec.exams.slice(0, 3).map((item, key) => (
                        <span key={key} className="bg-white text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">{item}</span>
                      ))}
                      {spec.exams.length > 3 && (
                        <span className="bg-white text-[9px] font-bold text-teal-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center">+{spec.exams.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick recommendations sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-white/5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-[0.06] text-white pointer-events-none select-none">
                <Sparkles size={110} />
              </div>
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 shrink-0" /> Auditoria Médica Inteligente
              </h3>
              <p className="text-xs text-indigo-200/90 leading-relaxed mb-6">
                Filtros inferidos na catalogação automática de documentos médicos e PDFs de drive.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <HeartPulse size={12} /> Alta Relevância Reumatológica
                  </p>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    Exames atribuídos à <strong>Reumatologia</strong> concentram os biomarcadores inflamátorios ativos relacionados às suas dores articulares e fadiga.
                  </p>
                </div>

                <div className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <DoctorIcon size={12} /> Consultas Integradas
                  </p>
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    Sincronize a agenda de saúde para vincular agendamentos médicos diretamente à sua especialização correspondente, automatizando o resgate de históricos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIOLOGICAL SYSTEMS BREAKDOWN */}
      {activeSubTab === 'systems' && (
        <div className="space-y-6 animate-fade-in text-slate-800">
          {!selectedSystemDetail ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs animate-fade-in">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visão por Sistemas Orgânicos e Teciduais</h3>
              <p className="text-xs text-slate-500 mb-6">Esta divisão agrupa biomarcadores pela afinidade funcional de órgãos ou regulação homeostática corpórea. Clique em qualquer sistema para acessar sua tela clínica dedicada.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemMetrics.map((sys, idx) => {
                  const iconColor = COLORS[idx % COLORS.length];
                  const systemInfo = BIOLOGICAL_SYSTEMS_INFO[sys.name] || BIOLOGICAL_SYSTEMS_INFO['Geral / Outros'];
                  return (
                    <div 
                      key={sys.name} 
                      onClick={() => { setSelectedSystemDetail(sys.name); setExpandedExamIdx(null); }}
                      className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 hover:border-teal-500/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <span className="p-2 bg-white shadow-3xs border border-slate-100 rounded-xl text-xl w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform">
                            {systemInfo.emoji}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${sys.alteredRatio > 25 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {sys.alteredRatio}% Alterados
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-800 leading-snug group-hover:text-teal-700 transition-colors flex items-center gap-1.5">
                          {sys.name} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-teal-600" />
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Exames: <strong className="text-slate-800">{sys.total}</strong> | Biomarcadores únicos: <strong className="text-slate-800">{sys.markers.length}</strong></p>
                        <p className="text-xs text-slate-400 font-medium mt-2 line-clamp-2">{systemInfo.description}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-200/60">
                        <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Monitorando:</span>
                        <div className="flex flex-wrap gap-1 hover:max-h-full max-h-[60px] overflow-hidden">
                          {sys.markers.slice(0, 4).map((m, i) => (
                            <span key={i} className="bg-white px-2 py-0.5 text-[9px] font-medium text-slate-600 rounded border border-slate-200 truncate select-none max-w-[110px]">{m}</span>
                          ))}
                          {sys.markers.length > 4 && (
                            <span className="bg-white px-2 py-0.5 text-[9px] font-bold text-teal-600 rounded border border-slate-200 flex items-center">+{sys.markers.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // DETAILED SCREEN OF EACH BIOLOGICAL SYSTEM
            (() => {
              const info = BIOLOGICAL_SYSTEMS_INFO[selectedSystemDetail] || BIOLOGICAL_SYSTEMS_INFO['Geral / Outros'];
              const systemExams = processedExams.filter(e => (e.grupoSistemico || 'Geral / Outros') === selectedSystemDetail);
              
              const totalExams = systemExams.length;
              const alteredExams = systemExams.filter(e => e.interpretacao === 'Alterado');
              const suboptimalExams = systemExams.filter(e => e.interpretacao === 'Sub-ópt.');
              const normalExams = systemExams.filter(e => e.interpretacao === 'Normal' || (!['Alterado', 'Sub-ópt.'].includes(e.interpretacao)));
              
              const pctAltered = totalExams > 0 ? Math.round((alteredExams.length / totalExams) * 100) : 0;
              const pctSuboptimal = totalExams > 0 ? Math.round((suboptimalExams.length / totalExams) * 100) : 0;
              const pctNormal = totalExams > 0 ? Math.round((normalExams.length / totalExams) * 100) : 0;

              return (
                <div className="space-y-6 animate-fade-in">
                  {/* Back Navigation Bar */}
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedSystemDetail(null)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all border border-teal-200/40 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Voltar para Sistemas Orgânicos
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Prontuário Individual</span>
                  </div>

                  {/* Hero Biological Header */}
                  <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-lg bg-gradient-to-r ${info.gradientClass} relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 text-9xl pointer-events-none select-none">
                      {info.emoji}
                    </div>
                    <div className="relative z-10 font-sans">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="text-3xl p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">{info.emoji}</span>
                        <div>
                          <span className="text-teal-200 text-[10px] font-extrabold uppercase tracking-widest block font-sans">Sistema Fisiológico Alvo</span>
                          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mt-0.5">{selectedSystemDetail}</h2>
                        </div>
                      </div>
                      <p className="text-sm text-indigo-100 max-w-2xl font-medium leading-relaxed mb-6 mt-3">{info.description}</p>
                      
                      {/* Biological Dashboard KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/15">
                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                          <span className="block text-[9px] font-bold text-indigo-200 uppercase tracking-widest">Total Exames</span>
                          <span className="text-xl font-black text-white font-mono tracking-tight">{totalExams}</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                          <span className="block text-[9px] font-bold text-rose-200 uppercase tracking-widest">Alterados</span>
                          <span className="text-xl font-black text-rose-300 font-mono tracking-tight">{alteredExams.length}</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                          <span className="block text-[9px] font-bold text-amber-200 uppercase tracking-widest">Sub-ótimos</span>
                          <span className="text-xl font-black text-amber-300 font-mono tracking-tight">{suboptimalExams.length}</span>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/5 p-3 rounded-2xl">
                          <span className="block text-[9px] font-bold text-emerald-200 uppercase tracking-widest">Normais</span>
                          <span className="text-xl font-black text-emerald-300 font-mono tracking-tight">{normalExams.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Composition Meter */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-teal-600" /> Distribuição de Saúde do Sistema
                    </h4>
                    <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden flex shadow-inner">
                      {pctNormal > 0 && <div style={{ width: `${pctNormal}%` }} className="bg-emerald-550 h-full flex items-center justify-center text-[10px] font-black text-white transition-all duration-500" title={`Normais: ${pctNormal}%`}>{pctNormal}%</div>}
                      {pctSuboptimal > 0 && <div style={{ width: `${pctSuboptimal}%` }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white transition-all duration-500" title={`Sub-ótimos: ${pctSuboptimal}%`}>{pctSuboptimal}%</div>}
                      {pctAltered > 0 && <div style={{ width: `${pctAltered}%` }} className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-black text-white transition-all duration-500" title={`Alterados: ${pctAltered}%`}>{pctAltered}%</div>}
                    </div>
                    <div className="flex gap-4 mt-3 flex-wrap text-xs font-semibold text-slate-500 justify-center">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-550 rounded-xs block"></span> Saudável ({normalExams.length})</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 rounded-xs block"></span> Sub-ótimo ({suboptimalExams.length})</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-xs block"></span> Crítico / Alterado ({alteredExams.length})</span>
                    </div>
                  </div>

                  {/* Two Column Layout: Clinica & Roster */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Clinical Column */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Active Biomarkers Checked Checklist */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <Layers size={16} className="text-teal-600" /> Biomarcadores sob Vigilância Ativa
                        </h4>
                        <div className="space-y-2">
                          {info.functionalFocus.map((marker, i) => {
                            const isMeasured = systemExams.some(e => e.nomeExame.toLowerCase().includes(marker.toLowerCase()) || marker.toLowerCase().includes(e.nomeExame.toLowerCase()));
                            return (
                              <div key={i} className="flex items-start justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                                <span className="text-xs font-bold text-slate-700">{marker}</span>
                                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider border ${isMeasured ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                  {isMeasured ? 'Sincronizado' : 'Não Consta'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Warning signals */}
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 text-amber-700">
                          <AlertTriangle size={16} className="text-amber-500" /> Sinais de Alerta Associados
                        </h4>
                        <ul className="space-y-2.5">
                          {info.warningSigns.map((sign, i) => (
                            <li key={i} className="flex gap-2.5 items-start text-xs font-medium text-slate-600 leading-relaxed">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Integrative strategies advice */}
                      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-white/5 text-white p-6 rounded-3xl shadow-md">
                        <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sparkles size={16} className="text-amber-400 animate-pulse" /> Estratégias de Estilo de Vida e Dietética
                        </h4>
                        <p className="text-xs text-indigo-200 leading-relaxed mb-4">Recomendações preliminares para otimização clínica do {selectedSystemDetail}.</p>
                        <div className="space-y-3">
                          {info.integrativeTips.map((tip, i) => (
                            <div key={i} className="p-3.5 bg-white/5 border border-white/10 rounded-2xl flex gap-3 items-start">
                              <span className="text-amber-300 font-bold font-mono text-sm leading-none shrink-0">{i+1}.</span>
                              <p className="text-xs text-indigo-100 font-medium leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Patient exams roster Column */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none font-sans">
                            <BookOpen size={16} className="text-teal-600" /> Exames Históricos ({totalExams})
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono bg-slate-50 border border-slate-150 px-2 py-1 rounded">Rastreamento</span>
                        </div>

                        {systemExams.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-bold">Nenhum exame mapeado ainda.</p>
                            <p className="text-xs mt-1 text-slate-400/90 max-w-sm mx-auto">Novos exames adicionados serão catalogados automaticamente neste nicho orgânico.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {systemExams.map((exam, i) => {
                              const isExpanded = expandedExamIdx === i;
                              return (
                                <div 
                                  key={i} 
                                  className={`border rounded-2xl transition-all duration-150 ${isExpanded ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}`}
                                >
                                  {/* Head section */}
                                  <div 
                                    onClick={() => setExpandedExamIdx(isExpanded ? null : i)}
                                    className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wide flex items-center gap-1 shrink-0">
                                          <Calendar size={11} /> {exam.dataExame}
                                        </span>
                                        <span className={`px-2 py-0.2 rounded-md text-[9px] font-extrabold border ${
                                          exam.interpretacao === 'Alterado' ? 'bg-rose-50 text-rose-700 border-rose-150' : 
                                          exam.interpretacao === 'Sub-ópt.' ? 'bg-amber-50 text-amber-700 border-amber-150' : 
                                          'bg-emerald-50 text-emerald-700 border-emerald-150'}`}>
                                          {exam.interpretacao}
                                        </span>
                                      </div>
                                      <p className="text-sm font-bold text-slate-800 leading-snug truncate mt-1">{exam.nomeExame}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      <div className="text-right">
                                        <span className="text-sm font-bold text-slate-800 font-mono block leading-none">{exam.resultado}</span>
                                        <span className="text-[10px] text-slate-400 font-medium leading-none">{exam.unidade}</span>
                                      </div>
                                      <ChevronDown 
                                        size={16} 
                                        className={`text-slate-400 transition-transform duration-250 ${isExpanded ? 'rotate-180 text-teal-600' : ''}`} 
                                      />
                                    </div>
                                  </div>

                                  {/* Expandable clinical info */}
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pt-1 border-t border-slate-200/40 text-xs text-slate-600 leading-relaxed space-y-3 animate-fade-in">
                                      <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div className="p-2.5 bg-white rounded-xl border border-slate-150">
                                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Valores de Referência</span>
                                          <span className="font-extrabold text-slate-700 text-xs font-mono">{exam.valorReferencia || '—'}</span>
                                        </div>
                                        <div className="p-2.5 bg-white rounded-xl border border-slate-150">
                                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Impacto Reumatológico</span>
                                          <span className={`font-extrabold text-xs block ${exam.impactoAutoimune === 'Alto' ? 'text-rose-600' : exam.impactoAutoimune === 'Médio' ? 'text-amber-650' : 'text-slate-500'}`}>
                                            {exam.impactoAutoimune || 'Baixo'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="pt-1.5">
                                        <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Médico Requisitante:</span>
                                        <div className="flex items-center justify-between bg-white border border-slate-150 rounded-xl px-3 py-2">
                                          <span className="font-bold text-slate-850 text-[11px] truncate">{exam.medicoSolicitante}</span>
                                          <span className="text-[9px] font-extrabold text-teal-600 uppercase tracking-widest block bg-teal-50 px-1.5 py-0.5 rounded border border-teal-150">{exam.especialidadeMedica || 'Clínica Médica'}</span>
                                        </div>
                                      </div>

                                      {exam.arquivoOrigem && (
                                        <div>
                                          <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Documento Comprovatório:</span>
                                          <span className="text-[10px] text-slate-500 font-semibold bg-white border border-slate-155 rounded-xl px-3 py-1.5 block truncate leading-none">{exam.arquivoOrigem}</span>
                                        </div>
                                      )}

                                      {/* Intelligent clinical question trigger */}
                                      <div className="pt-2">
                                        <button 
                                          onClick={() => {
                                            if (onNavigate) {
                                              onNavigate('ia-doctor', { 
                                                prefill: `Olá Doutor IA! Poderia interpretar em detalhes e de forma integrativa o meu marcador '${exam.nomeExame}' que apresentou resultado de ${exam.resultado} ${exam.unidade} (Valores normais de referência: ${exam.valorReferencia || 'Não informada'}), interpretado como '${exam.interpretacao}' e indexado sob o sistema biológico '${selectedSystemDetail}'?`
                                              });
                                            }
                                          }}
                                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer select-none border-none"
                                        >
                                          <Sparkles size={14} /> Consultar Doutor IA sobre este Marcador
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* 3. MULTI-DIMENSIONAL MATRIX EXPLORER */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Grid size={18} className="text-teal-600" /> Explorador Avançado Multifiltro
            </h3>

            {/* Matrix Form Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DoctorIcon size={12} className="text-teal-600" /> Filtrar por Especialidade
                </label>
                <select 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 cursor-pointer"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  {specialtiesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers size={12} className="text-teal-600" /> Filtrar por Sistema Alvo
                </label>
                <select 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 cursor-pointer"
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                >
                  {systemsList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Tag size={12} className="text-teal-600" /> Procurar Biomarcador / Tag
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Hemograma, VHS, Antígeno..." 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Smart Clinical Insight Box */}
            <div className="bg-teal-550/5 lg:bg-teal-500/5 p-6 rounded-2xl border border-teal-500/15 mb-8 flex gap-4 items-start shadow-xs animate-fade-in">
              <span className="p-2.5 bg-white text-teal-600 rounded-xl border border-teal-500/10 shadow-3xs shrink-0"><Sparkles size={20} className="animate-pulse" /></span>
              <div className="space-y-1 leading-relaxed text-sm">
                <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest block leading-none mb-1">Correlação Inteligente</span>
                <p className="text-slate-700 font-medium whitespace-pre-wrap">{clinicalMatrixInsight}</p>
              </div>
            </div>

            {/* Matrix Data Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider">Data</th>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider">Marcador / Exame</th>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-center">Resultado</th>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider">Status</th>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider">Médico Solicitante</th>
                      <th className="py-4 px-5 text-xs font-bold uppercase tracking-wider">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {crossFilteredExams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                          Nenhum registro encontrado correspondendo aos filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      crossFilteredExams.map((e, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5 whitespace-nowrap text-slate-500 font-mono text-xs">{e.dataExame}</td>
                          <td className="py-4 px-5">
                            <span className="font-bold text-slate-800 hover:text-teal-700 block transition-colors leading-tight">{e.nomeExame}</span>
                            <span className="text-[10px] text-slate-400/90 font-bold uppercase tracking-wider">{e.grupoSistemico || 'Geral / Outros'}</span>
                          </td>
                          <td className="py-4 px-5 text-center font-mono text-sm">
                            <span className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100/80 font-bold block truncate max-w-[150px] mx-auto text-slate-800">
                              {e.resultado} <span className="text-slate-400 text-xs font-medium font-sans">{e.unidade}</span>
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${e.interpretacao === 'Alterado' ? 'bg-rose-50 text-rose-700 border-rose-150' : e.interpretacao === 'Sub-ópt.' ? 'bg-amber-50 text-amber-700 border-amber-150' : 'bg-emerald-50 text-emerald-700 border-emerald-150'}`}>
                              {e.interpretacao}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-slate-800 block truncate font-bold text-xs max-w-[140px]">{e.medicoSolicitante}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{e.especialidadeMedica || 'Clínica Médica'}</span>
                          </td>
                          <td className="py-4 px-5 max-w-[130px] truncate">
                            <div className="flex gap-1 flex-wrap overflow-hidden max-h-[22px]">
                              {e.tags ? e.tags.split(',').slice(0, 2).map((tag, i) => (
                                <span key={i} className="bg-teal-500/5 text-teal-700 font-semibold px-1 py-0.2 rounded text-[9px] uppercase tracking-wider">{tag.trim()}</span>
                              )) : <span className="text-xs text-slate-400 font-medium font-sans">Nenhum</span>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. AUTOIMMUNOLOGY AND PREVENTIVE KPIS */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Autoimmune and inflammatory indices monitoring card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
              <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <HeartPulse size={18} className="text-teal-600 animate-pulse" /> Monitoramento de Reatividade Autoimune
              </h3>
              <p className="text-xs text-slate-500 mb-6">Biomarcadores inflamatórios e inmunológicos críticos correlacionados (como FAN/VHS/PCR) relacionados ao seu perfil autoimune.</p>

              {/* Advanced auto-immune indicators dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1">
                      <Layers size={12} className="text-amber-500" /> FAN (Fator Antinuclear)
                    </span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase tracking-wide">Padrão Título</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pesquisa de autoanticorpos direcionados aos constituintes celulares. Padrões nucleares denotam focos ativos e direcionam tratamento com Reumatologia.
                  </p>
                </div>

                <div className="p-5 bg-teal-550/5 lg:bg-teal-500/5 border border-teal-500/15 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold text-teal-700 uppercase tracking-widest flex items-center gap-1">
                      <Activity size={12} className="text-teal-500" /> VHS & Proteína C Reativa (PCR)
                    </span>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-bold rounded text-[9px] uppercase tracking-wide">Cascata Inflamatória</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Indicadores diretos de atividade inflamatória sistêmica no corpo. Cruciais para acompanhar flutuações e crises de dores musculares-articulares.
                  </p>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 mt-6 flex gap-4 shadow-3xs text-slate-800">
                <span className="p-2.5 bg-white text-rose-600 rounded-xl border border-rose-200/60 shadow-3xs shrink-0"><AlertTriangle size={18} /></span>
                <div className="space-y-1 text-xs leading-relaxed">
                  <span className="text-xs font-extrabold text-rose-700 uppercase tracking-widest block leading-none mb-1">Alerta Preventivo Autoimune</span>
                  <p className="font-semibold text-rose-900/90">
                    O controle rígido com reumatologia é indispensável para evitar crises agudas. Mantenha os históricos de hematologia e FAN atualizados anexando novos laudos em anexo ou conectando o login inteligente ao Google Drive.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI sidebar summaries */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] group">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-1.5"><Info size={16} className="text-teal-600" /> Sobre a Sincronização</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Sistemas biológicos, tags adicionais e o nível de impacto autoimune são catalogados de forma unificada para exames processados por IA e importações do Drive Sinc.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Exames Processados:</span>
                <span className="text-2xl font-black text-teal-600 font-mono tracking-tight">{processedExams.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
