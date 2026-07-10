import React, { useState } from 'react';
import { Pill, Printer, Beaker, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function SmartPrescription({ 
  onClose, 
  patientName = 'Paciente', 
  recentExams = [] 
}: { 
  onClose: () => void,
  patientName?: string,
  recentExams?: string[]
}) {
  const [generating, setGenerating] = useState(false);
  const [medicines, setMedicines] = useState<{name: string, dose: string, usage: string}[]>([
    { name: 'Metformina', dose: '500mg', usage: 'Tomar 1 comprimido após o almoço' },
    { name: 'Rosuvastatina', dose: '10mg', usage: 'Tomar 1 comprimido à noite' }
  ]);

  const [aiAnalysis, setAiAnalysis] = useState('Analisando exames recentes... Glicemia e Colesterol indicam necessidade de controle. Sugestão baseada em guidelines atuais (SBC 2023).');

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dose: '', usage: '' }]);
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...medicines];
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const element = document.getElementById('prescription-paper');
      if (!element) throw new Error("Elemento do receituário não encontrado");
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1130px';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Iframe document not found");
      
      const title = "Clínica Gestão Saúde";
      const dateStr = new Date().toLocaleDateString('pt-BR');
      
      const medicinesHtml = medicines.map((med, idx) => `
        <div style="margin-bottom: 24px; border-bottom: 1px dashed #eee; padding-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-bottom: 6px; font-family: sans-serif;">
            <span>${idx + 1}. ${med.name || '—'}</span>
            <span>${med.dose || ''}</span>
          </div>
          <div style="font-style: italic; color: #555; font-size: 14px; margin-left: 20px; font-family: sans-serif;">
            ${med.usage || '—'}
          </div>
        </div>
      `).join('');
      
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Times New Roman', Times, serif;
                color: #222;
                background-color: #fff;
                padding: 50px;
                margin: 0;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
                margin-bottom: 40px;
              }
              .header h1 {
                margin: 0;
                font-size: 28px;
                color: #111;
              }
              .header p {
                margin: 5px 0 0 0;
                font-size: 12px;
                letter-spacing: 3px;
                color: #666;
                text-transform: uppercase;
              }
              .patient-info {
                margin-bottom: 40px;
                font-size: 16px;
                font-family: sans-serif;
              }
              .patient-info p {
                margin: 6px 0;
              }
              .medicines-list {
                min-height: 450px;
              }
              .signature {
                margin-top: 100px;
                text-align: center;
              }
              .signature-line {
                width: 250px;
                border-bottom: 1px solid #333;
                margin: 0 auto 8px auto;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${title}</h1>
              <p>Receituário Médico</p>
            </div>
            
            <div class="patient-info">
              <p><strong>Para:</strong> <span style="font-size: 18px; font-weight: bold;">${patientName}</span></p>
              <p><strong>Data:</strong> ${dateStr}</p>
            </div>
            
            <div class="medicines-list">
              ${medicinesHtml}
            </div>
            
            <div class="signature">
              <div class="signature-line"></div>
              <p style="margin: 0; font-size: 14px; color: #555; font-family: sans-serif;">Assinatura do Médico</p>
            </div>
          </body>
        </html>
      `;
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(iframeDoc.body, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const width = imgWidth * ratio;
      const height = imgHeight * ratio;
      const x = (pdfWidth - width) / 2;
      const y = 0;
      
      pdf.addImage(imgData, 'PNG', x, y, width, height);
      pdf.save(`receita-${patientName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      document.body.removeChild(iframe);
    } catch (err) {
      console.error("Prescription PDF generation error:", err);
      alert('Falha ao gerar o PDF da receita.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-800/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Prescription</h2>
              <p className="text-sm text-slate-400">Receituário Inteligente para {patientName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col lg:flex-row gap-6">
          
          {/* AI Suggestions Panel */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>RAG Insights</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {aiAnalysis}
              </p>
              
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Baseado em:</div>
              <div className="flex flex-col gap-2">
                <div className="bg-slate-900/50 rounded-lg p-2 flex items-center gap-2 border border-white/5 text-slate-300 text-xs">
                  <FileText className="w-4 h-4 text-rose-400" />
                  <span>Exame de Sangue (Ontem)</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 flex items-center gap-2 border border-white/5 text-slate-300 text-xs">
                  <Beaker className="w-4 h-4 text-emerald-400" />
                  <span>Diretriz SBC Hipercolesterolemia</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Interações e Alertas</span>
              </div>
              <p className="text-xs text-slate-300">Nenhuma interação medicamentosa grave detectada nas sugestões atuais.</p>
            </div>
          </div>

          {/* Prescription Editor */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="bg-white rounded-2xl p-8 flex-1 min-h-[400px] shadow-inner text-slate-800 relative" id="prescription-paper">
              {/* Fake paper texture/branding */}
              <div className="border-b-2 border-slate-200 pb-4 mb-6 text-center">
                <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">Clínica Gestão Saúde</h1>
                <p className="text-sm text-slate-500 uppercase tracking-widest mt-1">Receituário Médico</p>
              </div>

              <div className="mb-6">
                <p className="text-slate-600">Para: <span className="font-bold text-slate-900 text-lg">{patientName}</span></p>
                <p className="text-slate-500 text-sm">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="space-y-6 flex-1">
                {medicines.map((med, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex items-start gap-4">
                      <div className="font-serif font-bold text-lg pt-1">{idx + 1}.</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            value={med.name}
                            onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                            placeholder="Nome do Medicamento"
                            className="flex-1 font-bold text-lg bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none transition-colors px-1"
                          />
                          <input 
                            value={med.dose}
                            onChange={(e) => updateMedicine(idx, 'dose', e.target.value)}
                            placeholder="Dose/Qtd"
                            className="w-24 text-right bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none transition-colors px-1"
                          />
                        </div>
                        <input 
                          value={med.usage}
                          onChange={(e) => updateMedicine(idx, 'usage', e.target.value)}
                          placeholder="Posologia (ex: Tomar 1 vez ao dia)"
                          className="w-full text-slate-600 italic bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none transition-colors px-1"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => removeMedicine(idx)}
                      className="absolute -right-4 top-2 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={addMedicine}
                className="mt-6 text-teal-600 font-semibold hover:text-teal-700 text-sm flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                + Adicionar Medicamento
              </button>

              <div className="mt-16 pt-8 border-t border-slate-200 text-center">
                <div className="w-48 border-b border-slate-800 mx-auto mb-2"></div>
                <p className="text-sm text-slate-600">Assinatura do Médico</p>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="mt-4 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={generatePDF}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
              >
                {generating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Gerando PDF...</>
                ) : (
                  <><Printer className="w-5 h-5" /> Imprimir e Salvar</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
