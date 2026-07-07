import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  HeartPulse, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  AlertCircle, 
  Info,
  Clock,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { useData } from '../App';

export function LongevityDashboard() {
  const { processedExams, user } = useData();

  // Basic Longevity & Risk Heuristics based on exams
  const insights = useMemo(() => {
    let bioAgeModifier = 0;
    let cardiovascularRisk = 0; // 0 to 100
    let riskFactors = [];
    let protectiveFactors = [];

    // Latest Exams
    const latestExams = [...processedExams].sort((a, b) => {
      const dateA = a.dataExame.split('/').reverse().join('');
      const dateB = b.dataExame.split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });

    const getLatest = (keywords: RegExp) => 
      latestExams.find(e => keywords.test(e.nomeExame.toLowerCase()));

    const parseNum = (str: string) => {
      if (!str) return 0;
      return parseFloat(str.replace(/[^0-9,.]/g, '').replace(',', '.'));
    };

    const hba1c = getLatest(/hemoglobina glicada|a1c/i);
    const crp = getLatest(/pcr|proteína c reativa|proteina c reativa/i);
    const hdl = getLatest(/hdl/i);
    const ldl = getLatest(/ldl/i);
    const trig = getLatest(/triglic/i);
    const vitd = getLatest(/vitamina d|25 oh/i);
    const insulina = getLatest(/insulina/i);

    // HbA1c
    if (hba1c) {
      const v = parseNum(hba1c.resultado);
      if (v > 5.7) { bioAgeModifier += 2; cardiovascularRisk += 10; riskFactors.push('Glicada acima do ideal'); }
      else if (v < 5.4) { bioAgeModifier -= 1; protectiveFactors.push('Glicemia Otimizada'); }
    }

    // CRP (Inflammation)
    if (crp) {
      const v = parseNum(crp.resultado);
      if (v > 3) { bioAgeModifier += 3; cardiovascularRisk += 15; riskFactors.push('Inflamação Sistêmica Alta (PCR)'); }
      else if (v < 1) { bioAgeModifier -= 1; protectiveFactors.push('Baixa Inflamação Sistêmica'); }
    }

    // Lipids
    if (ldl) {
      const v = parseNum(ldl.resultado);
      if (v > 130) { bioAgeModifier += 1; cardiovascularRisk += 10; riskFactors.push('LDL elevado'); }
    }
    if (hdl) {
      const v = parseNum(hdl.resultado);
      if (v < 40) { bioAgeModifier += 2; cardiovascularRisk += 10; riskFactors.push('HDL baixo'); }
      else if (v >= 60) { bioAgeModifier -= 2; cardiovascularRisk -= 5; protectiveFactors.push('HDL Cardioprotetor'); }
    }

    // Vitamin D
    if (vitd) {
      const v = parseNum(vitd.resultado);
      if (v < 30) { bioAgeModifier += 1; riskFactors.push('Vitamina D Baixa'); }
      else if (v >= 40) { bioAgeModifier -= 1; protectiveFactors.push('Vitamina D Excelente'); }
    }

    // Base Age (assuming 40 if not set, or extract from user profile if exists)
    const chronologicalAge = 40; 
    const biologicalAge = chronologicalAge + bioAgeModifier;

    cardiovascularRisk = Math.max(0, Math.min(100, cardiovascularRisk));

    return {
      biologicalAge,
      chronologicalAge,
      cardiovascularRisk,
      riskFactors,
      protectiveFactors
    };
  }, [processedExams]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    // Group by Date for a unified timeline
    const grouped: Record<string, any> = {};
    
    // Sort oldest to newest
    const sorted = [...processedExams].sort((a, b) => {
      const dateA = a.dataExame.split('/').reverse().join('');
      const dateB = b.dataExame.split('/').reverse().join('');
      return dateA.localeCompare(dateB);
    });

    sorted.forEach(exam => {
      if (!grouped[exam.dataExame]) {
        grouped[exam.dataExame] = { date: exam.dataExame };
      }
      
      const val = parseFloat(exam.resultado.replace(/[^0-9,.-]/g, '').replace(',', '.'));
      if (isNaN(val)) return;

      const name = exam.nomeExame.toLowerCase();
      if (name.includes('glicada') || name === 'a1c') grouped[exam.dataExame].HbA1c = val;
      if (name.includes('ldl')) grouped[exam.dataExame].LDL = val;
      if (name.includes('hdl')) grouped[exam.dataExame].HDL = val;
      if (name.includes('vitamina d')) grouped[exam.dataExame].VitD = val;
    });

    return Object.values(grouped).filter(d => Object.keys(d).length > 1);
  }, [processedExams]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard de Longevidade</h1>
          <p className="text-sm font-medium text-slate-500">Estimativas baseadas nos seus exames laboratoriais mais recentes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Idade Biológica */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                <Clock size={16} className="text-indigo-500" />
                Idade Biológica Estimada
              </span>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                IA Analítica
              </div>
            </div>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-black text-slate-800 tracking-tighter">{insights.biologicalAge}</span>
              <span className="text-xl font-bold text-slate-400">anos</span>
            </div>
            
            <p className="mt-4 text-sm text-slate-500 font-medium">
              Sua idade cronológica base é <span className="font-bold text-slate-700">~{insights.chronologicalAge} anos</span>. 
              {insights.biologicalAge < insights.chronologicalAge 
                ? " Parabéns! Seus biomarcadores indicam um envelhecimento mais lento." 
                : insights.biologicalAge > insights.chronologicalAge 
                  ? " Atenção: alguns biomarcadores inflamatórios ou metabólicos estão acelerando seu envelhecimento celular."
                  : " Sua idade biológica está perfeitamente alinhada com sua cronologia."}
            </p>
          </div>
        </motion.div>

        {/* Risco Cardiovascular */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                <HeartPulse size={16} className="text-rose-500" />
                Risco Cardiovascular (10 anos)
              </span>
            </div>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className={`text-6xl font-black tracking-tighter ${insights.cardiovascularRisk > 20 ? 'text-rose-600' : insights.cardiovascularRisk > 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {insights.cardiovascularRisk}%
              </span>
            </div>
            
            <div className="mt-6 h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
              <div className="h-full bg-amber-400" style={{ width: '10%' }}></div>
              <div className="h-full bg-rose-500" style={{ width: '80%' }}></div>
              {/* Pointer */}
              <div 
                className="absolute w-1 h-5 bg-slate-800 rounded-full transform -translate-y-1 shadow-md transition-all duration-1000" 
                style={{ left: `calc(${insights.cardiovascularRisk}% - 2px)` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
              <span>Baixo</span>
              <span>Moderado</span>
              <span>Alto</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fatores Protetores */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100"
        >
          <h3 className="flex items-center gap-2 font-bold text-emerald-800 mb-4">
            <ShieldCheck size={20} className="text-emerald-600" />
            Fatores Protetores Identificados
          </h3>
          {insights.protectiveFactors.length > 0 ? (
            <ul className="space-y-3">
              {insights.protectiveFactors.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-emerald-700 bg-white p-3 rounded-xl shadow-sm border border-emerald-50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600/70 font-medium">Nenhum fator protetor forte detectado nos exames recentes.</p>
          )}
        </motion.div>

        {/* Fatores de Risco */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-rose-50/50 rounded-3xl p-6 border border-rose-100"
        >
          <h3 className="flex items-center gap-2 font-bold text-rose-800 mb-4">
            <Flame size={20} className="text-rose-600" />
            Atenção (Pontos de Melhoria)
          </h3>
          {insights.riskFactors.length > 0 ? (
            <ul className="space-y-3">
              {insights.riskFactors.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-rose-700 bg-white p-3 rounded-xl shadow-sm border border-rose-50">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  {f}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-rose-600/70 font-medium">Excelente! Nenhum fator de risco severo detectado.</p>
          )}
        </motion.div>
      </div>

      {/* Gráfico de Evolução Metabólica */}
      {chartData.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200"
        >
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Curva Metabólica</h3>
            <p className="text-sm text-slate-500 font-medium">Evolução de marcadores chave de longevidade ao longo do tempo</p>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHbA1c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVitD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}
                />
                
                {chartData.some(d => d.HbA1c) && (
                  <Area type="monotone" dataKey="HbA1c" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorHbA1c)" activeDot={{ r: 6 }} />
                )}
                {chartData.some(d => d.VitD) && (
                  <Area type="monotone" dataKey="VitD" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVitD)" activeDot={{ r: 6 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 justify-center mt-4 text-xs font-bold text-slate-500">
            {chartData.some(d => d.HbA1c) && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-violet-500"></div> HbA1c (Glicada)</div>}
            {chartData.some(d => d.VitD) && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-md bg-amber-500"></div> Vitamina D</div>}
          </div>
        </motion.div>
      )}

    </div>
  );
}
