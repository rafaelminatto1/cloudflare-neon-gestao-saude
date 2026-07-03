import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  ChevronRight,
  Scale,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { useData, useToast } from '../App';
import { saveExamsBatch, deleteExam } from '../db';

// Extract helpers
const parseHeightFromObs = (obs?: string): number => {
  if (!obs) return 1.70;
  const match = obs.match(/Altura:\s*([\d.]+)/);
  if (match) return parseFloat(match[1]);
  return 1.70;
};

const parseIMCFromObs = (obs?: string): number => {
  if (!obs) return 24.2;
  const match = obs.match(/IMC:\s*([\d.]+)/);
  if (match) return parseFloat(match[1]);
  return 24.2;
};

const getImcClass = (imc: number) => {
  if (imc < 18.5) return { label: 'Abaixo do Peso', color: 'text-amber-600 bg-amber-50 border-amber-200', interp: 'Sub-ópt.' };
  if (imc < 25) return { label: 'Peso Saudável', color: 'text-teal-600 bg-teal-50 border-teal-200', interp: 'Normal' };
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-amber-600 bg-amber-50 border-amber-200', interp: 'Sub-ópt.' };
  return { label: 'Obesidade', color: 'text-rose-600 bg-rose-50 border-rose-200', interp: 'Alterado' };
};

export function WeightTracker() {
  const { exams, user } = useData();
  const { addToast } = useToast();

  const [dateStr, setDateStr] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  
  const [chartView, setChartView] = useState<'weight' | 'bmi'>('weight');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // Initialize inputs
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setDateStr(`${yyyy}-${mm}-${dd}`);

    const savedHeight = localStorage.getItem('user_height');
    if (savedHeight) {
      setHeightInput(savedHeight);
    }
  }, []);

  // Filter weight exams
  const weightHistory = useMemo(() => {
    return exams
      .filter(exam => exam.categoria === 'AVALIAÇÃO' && exam.nomeExame === 'Peso Corporal')
      .map(exam => {
        let parsedDate = new Date(0);
        if (exam.dataExame.includes('/')) {
          const parts = exam.dataExame.split('/');
          if (parts.length === 3) {
            parsedDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
          }
        }
        
        const weight = parseFloat(exam.resultado.replace(',', '.'));
        const height = parseHeightFromObs(exam.observacoes);
        const imc = parseIMCFromObs(exam.observacoes);

        return {
          id: exam.id,
          rawDate: exam.dataExame,
          dateObject: parsedDate,
          weight,
          height,
          imc,
          classification: getImcClass(imc).label,
          interpretation: exam.interpretacao
        };
      })
      .sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
  }, [exams]);

  const calculatedLiveImc = useMemo(() => {
    const w = parseFloat(weightInput.replace(',', '.'));
    const h = parseFloat(heightInput.replace(',', '.')) / 100; // cm to m
    if (!w || !h || isNaN(w) || isNaN(h)) return null;
    const imcValue = Number((w / (h * h)).toFixed(2));
    const info = getImcClass(imcValue);
    return {
      value: imcValue,
      label: info.label,
      color: info.color
    };
  }, [weightInput, heightInput]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Você deve estar autenticado para registrar dados.', 'error');
      return;
    }

    const weightNum = parseFloat(weightInput.replace(',', '.'));
    const heightCm = parseFloat(heightInput.replace(',', '.'));

    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      addToast('Insira um peso válido.', 'error');
      return;
    }

    if (isNaN(heightCm) || heightCm <= 30 || heightCm > 300) {
      addToast('Insira uma altura válida.', 'error');
      return;
    }

    setIsSubmitting(true);
    addToast('Registrando dados corporais...', 'info');

    try {
      localStorage.setItem('user_height', heightCm.toString());

      const heightM = heightCm / 100;
      const imcVal = Number((weightNum / (heightM * heightM)).toFixed(2));
      const imcClassification = getImcClass(imcVal);

      const dateParts = dateStr.split('-');
      const formattedDate = dateParts.length === 3 
        ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
        : new Date().toLocaleDateString('pt-BR');

      const weightExam = {
        dataExame: formattedDate,
        categoria: 'AVALIAÇÃO' as const,
        nomeExame: 'Peso Corporal',
        resultado: `${weightNum.toFixed(1)}`.replace('.', ','),
        unidade: 'kg',
        valorReferencia: 'IMC Saudável: 18.5 - 24.9',
        interpretacao: imcClassification.interp as any,
        medicoSolicitante: 'Paciente (Registro Manual)',
        arquivoOrigem: 'Registro de Peso',
        observacoes: `Altura: ${heightM.toFixed(2)} m | IMC: ${imcVal.toFixed(2)} (${imcClassification.label})`
      };

      await saveExamsBatch([weightExam], user.uid);
      addToast('Dados de peso corporal e IMC registrados!', 'success');
      
      setWeightInput('');
      setShowForm(false); // Collapses the form on success
    } catch (err) {
      console.error(err);
      addToast('Erro ao realizar o registro.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (confirm('Deseja excluir este registro de peso?')) {
      try {
        await deleteExam(id, undefined, user.uid);
        addToast('Registro de peso excluído.', 'success');
      } catch (err) {
        addToast('Erro ao excluir registro.', 'error');
      }
    }
  };

  const latestEntry = weightHistory[weightHistory.length - 1];

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-md">
          <Scale className="text-teal-600" size={18} /> Composição Corporal
        </h3>
        
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              showLogs 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History size={12} /> {showLogs ? 'Ocultar' : 'Expandir'}
          </button>
          <button 
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              showForm 
                ? 'bg-slate-100 text-slate-700' 
                : 'bg-teal-50 text-teal-600 hover:bg-teal-100/80'
            }`}
          >
            {showForm ? 'Fechar' : '+ Registrar'}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE FORM */}
      {showForm && (
        <form onSubmit={handleRegister} className="mb-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3.5 animate-in slide-in-from-top-3 duration-250">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data</label>
              <input 
                type="date" 
                required
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1.5 focus:ring-teal-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Peso (kg)</label>
              <input 
                type="text" 
                required
                placeholder="75.4"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1.5 focus:ring-teal-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Altura (cm)</label>
              <input 
                type="number" 
                required
                placeholder="175"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1.5 focus:ring-teal-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
              />
            </div>
          </div>

          {calculatedLiveImc && (
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">IMC Estimado</span>
                <span className="text-sm font-extrabold text-slate-800">{calculatedLiveImc.value}</span>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${calculatedLiveImc.color}`}>
                {calculatedLiveImc.label}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !weightInput || !heightInput}
            className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
          >
            <span>Salvar Medição</span>
          </button>
        </form>
      )}

      {/* METRICS QUICK DISPLAY */}
      {latestEntry ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Peso Atual</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800">{latestEntry.weight}</span>
              <span className="text-xs font-semibold text-slate-500">kg</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Medido em {latestEntry.rawDate}</span>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Índice IMC</span>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{latestEntry.imc}</p>
            </div>
            <span className={`w-fit text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border mt-1 shrink-0 ${
              latestEntry.interpretation === 'Normal' ? 'bg-teal-50 text-teal-600 border-teal-100' :
              latestEntry.interpretation === 'Sub-ópt.' ? 'bg-amber-50 text-amber-600 border-amber-150' :
              'bg-rose-50 text-rose-600 border-rose-150'
            }`}>
              {latestEntry.classification}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-5 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-150 mb-4">
          <Scale className="mx-auto text-slate-300 mb-2" size={24} />
          <p className="text-xs font-semibold text-slate-500">Nenhum peso registrado.</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Registre seu peso corporal utilizando o botão acima.</p>
        </div>
      )}

      {/* COMPACT EVOLUTION CHART */}
      {weightHistory.length >= 2 ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico de Evolução</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
              <button
                type="button"
                onClick={() => setChartView('weight')}
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-all cursor-pointer ${
                  chartView === 'weight' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'
                }`}
              >
                Peso
              </button>
              <button
                type="button"
                onClick={() => setChartView('bmi')}
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded transition-all cursor-pointer ${
                  chartView === 'bmi' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500'
                }`}
              >
                IMC
              </button>
            </div>
          </div>
          
          <div className="h-32 w-full bg-slate-50/20 border border-slate-100/50 rounded-2xl p-1.5 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightHistory} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                <defs>
                  <linearGradient id="compactColorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="compactColorBmi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="rawDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 8, fill: '#94A3B8', fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  domain={chartView === 'weight' ? ['dataMin - 3', 'dataMax + 3'] : [16, 35]}
                  tick={{ fontSize: 8, fill: '#94A3B8', fontWeight: 600 }} 
                />
                <RechartsTooltip 
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const isWeight = chartView === 'weight';
                    const imcInfo = getImcClass(d.imc);
                    return (
                      <div style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                           className="bg-white/95 border border-slate-200 rounded-xl p-3 shadow-lg text-left min-w-[130px]">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1.5">{d.rawDate}</p>
                        {isWeight ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-teal-700">{d.weight?.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400 font-medium">kg</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-purple-700">{d.imc?.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400 font-medium">IMC</span>
                          </div>
                        )}
                        <span className={`mt-1.5 inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${imcInfo.color}`}>
                          {imcInfo.label}
                        </span>
                      </div>
                    );
                  }}
                />
                {chartView === 'weight' ? (
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#0D9488" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#compactColorWeight)" 
                    name="Peso (kg)"
                    dot={{ r: 3, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: '#0D9488', stroke: '#fff', strokeWidth: 2 }}
                  />
                ) : (
                  <>
                    <ReferenceLine y={18.5} stroke="#38BDF8" strokeDasharray="2 2" strokeWidth={1} />
                    <ReferenceLine y={24.9} stroke="#F43F5E" strokeDasharray="2 2" strokeWidth={1} />
                    <Area 
                      type="monotone" 
                      dataKey="imc" 
                      stroke="#8B5CF6" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#compactColorBmi)" 
                      name="IMC"
                      dot={{ r: 3, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* COMPACT LOGS TOGGLE */}
      {showLogs && weightHistory.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 mb-2 px-1">
             <History size={14} className="text-slate-400" />
             <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Histórico (Últimos 30 Dias)</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
            <div className="divide-y divide-slate-100">
              {[...weightHistory]
                .reverse()
                .filter(entry => {
                   const now = new Date();
                   const entryDate = entry.dateObject;
                   const diffTime = Math.abs(now.getTime() - entryDate.getTime());
                   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                   return diffDays <= 30;
                })
                .map((entry) => (
                <div key={entry.id} className="p-2 flex items-center justify-between text-[11px] hover:bg-slate-100/50 transition-colors">
                  <div>
                    <span className="font-bold text-slate-700">{entry.rawDate}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600 font-medium">{entry.weight.toFixed(1)} kg</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold border uppercase ${
                      entry.interpretation === 'Normal' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                      entry.interpretation === 'Sub-ópt.' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      IMC {entry.imc}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remover"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
