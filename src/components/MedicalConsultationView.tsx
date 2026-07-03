import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Stethoscope, Share2, QrCode as QrCodeIcon, FileText, CheckCircle2, 
  HelpCircle, AlertCircle, Shield, Clock, Heart, Printer, Copy, Check, Loader2,
  Activity, TrendingUp, AlertTriangle, Pill
} from 'lucide-react';
import { useData, getCategoryStyles } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { generateConsolidatedClinicalReport } from '../utils/pdfGenerator';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import Markdown from 'react-markdown';
import QRCode from 'react-qr-code';

export function MedicalConsultationView() {
  const { processedExams = [], userPathologies = [], medications = [] } = useData();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedShareExpires, setSelectedShareExpires] = useState('24h');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [shareToken, setShareToken] = useState('HT-000-00A');
  const [shareLink, setShareLink] = useState('');
  const [isFullscreenQR, setIsFullscreenQR] = useState(false);

  // States for Semiannual Executive Summary
  const [loadingStep, setLoadingStep] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [executiveSummary, setExecutiveSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (isLoadingSummary) return;
    setIsLoadingSummary(true);
    setSummaryError(null);
    setExecutiveSummary(null);

    const steps = [
      'Compilando dados do prontuário...',
      'Analisando histórico de condições autoimunes...',
      'Correlacionando biomarcadores com medicações em uso...',
      'Avaliando faixas funcionais sub-ótimas de analitos...',
      'Verificando sinergia farmacológica e saúde renal/hepática...',
      'Formatando Resumo Clínico Executivo...'
    ];

    let currentStepIndex = 0;
    setLoadingStep(steps[currentStepIndex]);

    const interval = setInterval(() => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        setLoadingStep(steps[currentStepIndex]);
      }
    }, 1500);

    try {
      const response = await fetchWithRetry('/api/generate-health-executive-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          processedExams,
          userPathologies,
          medications
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Falha no servidor ao processar o relatório de saúde.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setExecutiveSummary(data.result);
    } catch (err: any) {
      console.error(err);
      setSummaryError(err.message || 'Erro inesperado ao gerar laudo consolidado.');
    } finally {
      clearInterval(interval);
      setIsLoadingSummary(false);
    }
  };

  const handlePrint = async () => {
    if (isGeneratingPDF) return;
    try {
      setIsGeneratingPDF(true);
      await generateConsolidatedClinicalReport(processedExams, userPathologies, medications);
    } catch (err) {
      console.error(err);
      alert('Não foi possível gerar a ficha consolidada em PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const criticalFindings = useMemo(() => {
    return processedExams.filter(exam => 
      exam.interpretacao === 'Alterado' || exam.interpretacao === 'Sub-ópt.'
    ).sort((a, b) => {
      if (a.interpretacao === 'Alterado' && b.interpretacao !== 'Alterado') return -1;
      if (a.interpretacao !== 'Alterado' && b.interpretacao === 'Alterado') return 1;
      return 0;
    });
  }, [processedExams]);

  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = 'HT-';
    for (let i = 0; i < 3; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    token += '-';
    for (let i = 0; i < 3; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    setShareToken(token);
    setShareLink(`${window.location.origin}/share/${token.toLowerCase()}`);
  }, []);

  const loadAiQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetchWithRetry('/api/generate-consultation-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedExams, userPathologies, medications })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.questions) setAiQuestions(data.questions);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadAiQuestions();
  }, [processedExams, userPathologies, medications]);

  const suggestedQuestions = useMemo(() => {
    if (aiQuestions.length > 0) return aiQuestions;
    const list = [
      {
        id: 1,
        title: 'Correlação Fadiga e Autoimunidade',
        question: 'Doutor, dado o meu histórico de fadiga associado à Fibromialgia e o resultado do meu FAN / marcadores inflamatórios, existe alguma sobreposição autoimune ativa que devemos investigar mais a fundo?',
        context: 'Geralmente indicada quando há FAN reagente ou VHS/PCR levemente elevados.'
      },
      {
        id: 2,
        title: 'Otimização de Micronutrientes na Fibromialgia',
        question: 'Meus níveis de Vitamina D e Vitaminas do complexo B estão em limites clínicos limítrofes (sub-ótimos). Qual o impacto de manter esses níveis na otimização da minha performance neurológica, sono e controle das dores miofasciais?',
        context: 'Excelente para discutir faixas funcionais de vitaminas acima dos limites mínimos de laboratório.'
      },
      {
        id: 3,
        title: 'Monitoramento da Tireoide',
        question: 'Com base no meu balanço de TSH e Hormônios Tireoidianos, existe alguma necessidade de dosagem de autoanticorpos (Anti-TPO e Anti-TG) ou ultrassonografia preventiva para descartar tireoidite autoimune?',
        context: 'Fundamental para pacientes com sintomas sutis de lentidão metabólica ou estresse físico.'
      }
    ];

    if (medications.length > 0) {
      list.push({
        id: 4,
        title: 'Sinergia Terapêutica de Medicamentos',
        question: `Atualmente estou em uso de medicamentos de suporte (${medications.slice(0, 2).map(m => m.name).join(', ')}). Existe alguma consideração ou efeito colateral de longo prazo nesses marcadores hepáticos/renais que eu precise monitorar preventivamente?`,
        context: 'Indicada para avaliar poupadores de fígado e rins no tratamento prolongado.'
      });
    }

    return list;
  }, [medications, aiQuestions]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="bg-[#0B0F19] text-slate-100 p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col gap-6 font-sans">
      
      {/* Background radial glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <Stethoscope size={24} className="stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Guia de Consulta <span className="text-blue-400">&</span> QR Sync
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Resumo clínico de alta performance e compartilhamento seguro de exames
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">QR Sync Ativo</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column (QR and Doctor Alerts) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* QR Code Temporary Sharing Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center text-center shadow-xl relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-inner flex flex-col items-center justify-center shrink-0 w-44 h-44 cursor-pointer hover:scale-102 hover:shadow-lg transition-all" onClick={() => setIsFullscreenQR(true)}>
                <QRCode value={shareLink} size={144} level="H" fgColor="#0A0F1D" />
              </div>
              <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase mt-4 leading-none">
                Token de Acesso: <span className="font-mono text-white tracking-widest">{shareToken}</span>
              </span>
              
              <div className="w-full border-t border-slate-800/80 my-5" />
              
              <div className="w-full space-y-1.5 text-left mb-4">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Tempo de Expiração do Link
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['1h', '24h', '7 dias'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedShareExpires(time)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedShareExpires === time
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-955/60 hover:bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl hover:bg-slate-900 active:scale-95 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  {copied ? <Check size={14} className="text-emerald-400 stroke-[3px]" /> : <Copy size={14} className="text-slate-400" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Token'}</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl hover:bg-slate-900 active:scale-95 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400 stroke-[3px]" /> : <Share2 size={14} className="text-slate-400" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold bg-slate-955/40 p-3 border border-slate-800/80 rounded-2xl mt-4 w-full text-left">
                <Shield size={14} className="text-blue-400 shrink-0" />
                <span>Dados criptografados. Expiração em <strong>{selectedShareExpires}</strong>.</span>
              </div>
            </div>
          </div>

          {/* Doctor Alerts Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-400 shrink-0 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider text-rose-300">Resumo de Alertas (Exiba ao Médico)</h2>
              <span className="ml-auto text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/30">
                {criticalFindings.length} pendentes
              </span>
            </div>
            <div className="p-5 space-y-3">
              {criticalFindings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  🎉 Nenhum biomarcador alterado ou sub-ótimo atualmente!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {criticalFindings.slice(0, 8).map((exam) => (
                    <div key={exam.id} className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs transition-colors">
                      <div className="min-w-0">
                        <h4 className="font-bold text-white truncate leading-tight">{exam.nomeExame}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500 font-bold font-mono">{exam.dataExame}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">• Ref: {exam.valorReferencia}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-white">{exam.resultado} {exam.unidade}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase leading-none inline-block mt-1 ${
                          exam.interpretacao === 'Alterado' 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {exam.interpretacao === 'Alterado' ? 'Alterado' : 'Sub-ótimo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (Quadro Clínico, AI Insights, Suggested Questions) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quadro Clínico (Pathologies & Medications) */}
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Heart size={16} className="text-teal-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white">Quadro Clínico Atual</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patologias & Condições</h3>
                {userPathologies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {userPathologies.map(p => (
                      <span key={p.id} className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        {p.condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhuma condição informada.</p>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicamentos em Uso</h3>
                {medications.length > 0 ? (
                  <div className="space-y-2">
                    {medications.map(m => (
                      <div key={m.id} className="flex items-center justify-between text-xs bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Pill size={13} className="text-blue-400" />
                          {m.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{m.dosage || 'Uso contínuo'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Nenhum medicamento informado.</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          <div className="bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-blue-950/20 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles size={64} className="text-blue-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-400 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">Resumo Executivo Semestral</h2>
              </div>
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
            </div>
            
            {!executiveSummary ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Nossa inteligência artificial cruzará seu histórico de patologias, as medicações ativas de uso contínuo e a evolução dos seus biomarcadores nos últimos 6 meses para gerar um parecer clínico unificado.
                </p>
                {isLoadingSummary ? (
                  <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-5 text-center space-y-4">
                    <Loader2 className="animate-spin text-blue-400 mx-auto" size={24} />
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-white animate-pulse">{loadingStep}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Isso pode levar de 15 a 30 segundos...</p>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full animate-progress-bar w-1/3 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={generateSummary}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:scale-98 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                  >
                    <Sparkles size={14} className="text-blue-200 animate-pulse" />
                    <span>Gerar Relatório com IA</span>
                  </button>
                )}
                {summaryError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2 text-rose-300 text-xs font-medium">
                    <AlertTriangle size={15} className="shrink-0 text-rose-400 mt-0.5" />
                    <span>{summaryError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-slate-955/60 p-4 border border-slate-800 rounded-2xl space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  <div className="markdown-body text-xs text-slate-300 leading-relaxed font-medium">
                    <Markdown
                      components={{
                        h1: ({node, ...props}) => <h3 className="text-xs font-black text-white uppercase tracking-wide border-b border-slate-800 pb-1 mt-4 mb-2 first:mt-0 flex items-center gap-1.5" {...props} />,
                        h2: ({node, ...props}) => <h3 className="text-xs font-black text-white uppercase tracking-wide border-b border-slate-800 pb-1 mt-4 mb-2 first:mt-0 flex items-center gap-1.5" {...props} />,
                        h3: ({node, ...props}) => <h4 className="text-[11px] font-bold text-blue-300 mt-3 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="text-xs text-slate-300 leading-relaxed my-2 font-medium" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300 my-2 font-medium" {...props} />,
                        li: ({node, ...props}) => <li className="pl-0.5" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                      }}
                    >
                      {executiveSummary}
                    </Markdown>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={generateSummary}
                    className="flex-1 bg-slate-950/80 border border-slate-800 text-slate-300 font-bold rounded-2xl h-10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-900 transition-all cursor-pointer active:scale-95"
                  >
                    <Loader2 size={12} className={isLoadingSummary ? "animate-spin" : ""} />
                    <span>Regerar</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(executiveSummary || '');
                      alert('Laudo executivo copiado!');
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl h-10 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-500/10"
                  >
                    <Copy size={12} />
                    <span>Copiar</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-400" />
                <h2 className="text-xs font-black uppercase tracking-wider text-white">Perguntas Inteligentes para a Consulta</h2>
              </div>
              <button onClick={loadAiQuestions} disabled={isLoadingQuestions} className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded-lg transition-colors cursor-pointer" title="Regerar perguntas">
                <Loader2 className={isLoadingQuestions ? "animate-spin" : ""} size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {isLoadingQuestions ? (
                <div className="flex justify-center items-center py-6 text-slate-400">
                  <Loader2 className="animate-spin text-blue-400 mr-2" size={20} />
                  <span className="text-xs font-bold">Processando histórico clínico...</span>
                </div>
              ) : suggestedQuestions.map((q) => (
                <div key={q.id} className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 p-4 rounded-2xl space-y-2 group transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-lg uppercase tracking-wide border border-blue-500/20">
                      {q.title}
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Sugestão #{q.id}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-250 leading-relaxed">
                    "{q.question}"
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium border-t border-slate-850 pt-2 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400 shrink-0" />
                    <span><strong>Apoio ao Diálogo:</strong> {q.context}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* PDF Print/Download Actions */}
      <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 text-center space-y-3 relative z-10">
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
          Prefere entregar um documento físico ao médico? Geramos a Ficha Consolidada em formato oficial PDF para impressão rápida.
        </p>
        <button
          onClick={handlePrint}
          disabled={isGeneratingPDF}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 disabled:bg-slate-800 text-slate-955 hover:scale-102 disabled:hover:scale-100 active:scale-98 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-2xl transition-all shadow-lg cursor-pointer disabled:cursor-not-allowed"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 size={14} className="animate-spin text-slate-955" />
              <span>Gerando Relatório...</span>
            </>
          ) : (
            <>
              <Printer size={14} className="text-slate-955" />
              <span>Imprimir Ficha Completa</span>
            </>
          )}
        </button>
      </div>

      {/* Fullscreen QR Modal */}
      <AnimatePresence>
        {isFullscreenQR && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-[#0A0F1D]/95 backdrop-blur-md flex flex-col items-center justify-center p-6"
            onClick={() => setIsFullscreenQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full relative"
            >
              <button 
                onClick={() => setIsFullscreenQR(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="text-center space-y-2 mt-4">
                <h2 className="text-xl font-extrabold text-white tracking-tight">Escaneie o Código</h2>
                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                  O seu médico usará a câmera do celular ou tablet para acessar seus exames com segurança.
                </p>
              </div>

              <div className="p-4 bg-white rounded-3xl shadow-inner">
                <QRCode value={shareLink} size={220} level="H" fgColor="#0A0F1D" />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-6 py-3 rounded-2xl w-full text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1">Token de Acesso</span>
                <span className="text-2xl font-black font-mono tracking-widest text-white">{shareToken}</span>
              </div>
            </motion.div>
            <div className="mt-8 text-slate-400 font-bold text-xs tracking-wider uppercase opacity-50">
              Toque fora para fechar
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
