import React, { useState, useRef } from 'react';
import { fetchWithRetry } from '../utils/fetchWithRetry';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertTriangle, FileImage, Loader2, Send } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export function VisualAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Por favor, selecione uma imagem.");
        return;
    }
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      if (userPrompt.trim()) {
         formData.append('userPrompt', userPrompt.trim());
      }
      
      const response = await fetchWithRetry('/api/analyze-visual', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Falha ao analisar a imagem.');
      }
      
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (e: any) {
      setAnalysisResult("Infelizmente ocorreu um erro na análise: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
      setSelectedImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setAnalysisResult(null);
      setUserPrompt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="text-teal-600" /> Doutor IA: Análise de Imagem Médica
        </h2>
        <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Novo Recurso Experimental</span>
      </div>
      
      <p className="text-sm text-slate-600">
        Faça upload de fotos de seus laudos, lesões cutâneas, exames de Raio-X, Tomografia ou Ressonância para uma segunda leitura técnica e didática do Doutor IA.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
              {/* Upload Area */}
              {!previewUrl ? (
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] transition-all \${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'} cursor-pointer space-y-4`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       ref={fileInputRef} 
                       onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 bg-white shrink-0 shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-teal-500">
                       <UploadCloud size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-700">Clique para selecionar imagem</p>
                        <p className="text-xs text-slate-500 mt-1">Ou arraste a imagem do exame até aqui</p>
                    </div>
                </div>
              ) : (
                <div className="border border-slate-200 bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col items-center justify-center min-h-[300px] relative group hover:shadow-md transition-shadow">
                    <img src={previewUrl} alt="Preview do Exame" className="object-cover w-full h-[300px] group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-center z-10 transition-opacity">
                        <span className="text-white text-xs font-semibold truncate px-2">{selectedImage?.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); clearSelection(); }} className="bg-white/20 text-white hover:bg-red-500 p-1.5 rounded-md text-xs font-bold transition-colors">Remover</button>
                    </div>
                </div>
              )}

              {/* Input section */}
              {previewUrl && (
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-3">
                      <label className="text-sm font-bold tracking-tight text-slate-700 block ml-1">Pergunte o que você gostaria de analisar:</label>
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Ex: Qual sua interpretação desse Raio-X? Tem sinais de fratura?"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none"
                        rows={3}
                      />
                      <button 
                         onClick={handleAnalyze}
                         disabled={isLoading}
                         className="w-full flex justify-center items-center gap-2 bg-slate-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-teal-400" />}
                         {isLoading ? 'I.A. analisando imagem...' : 'Analisar Imagem agora'}
                      </button>
                  </div>
              )}
          </div>

          <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col relative text-slate-100 min-h-[400px]">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                   <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest text-slate-300">
                      <Sparkles size={16} className="text-teal-400" /> Resultado Médico I.A.
                   </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                    {!analysisResult && !isLoading && (
                        <div className="flex flex-col items-center justify-center text-center opacity-40 mt-16 space-y-3">
                            <FileImage size={48} />
                            <p className="text-sm max-w-[250px]">Faça upload de uma foto do exame para receber a leitura visual e técnica.</p>
                        </div>
                    )}
                    
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center mt-16 space-y-4">
                            <div className="relative">
                               <div className="absolute inset-0 bg-teal-500 rounded-full blur opacity-20 animate-pulse"></div>
                               <Loader2 size={48} className="text-teal-400 animate-spin relative z-10" />
                            </div>
                            <p className="text-sm font-semibold text-teal-200 animate-pulse">A Inteligência Artificial está decodificando a imagem médica...</p>
                        </div>
                    )}

                    {analysisResult && !isLoading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm leading-relaxed prose-invert prose">
                            <Markdown>{analysisResult}</Markdown>
                        </motion.div>
                    )}
              </div>
              
              <div className="bg-slate-900 text-[10px] uppercase font-bold text-slate-500 p-3 pb-4 text-center tracking-wider px-6">
                Lembre-se: Esta é uma ferramenta educacional e não anula a consulta médica oficial para diagnóstico.
              </div>
          </div>
      </div>
    </div>
  );
}
