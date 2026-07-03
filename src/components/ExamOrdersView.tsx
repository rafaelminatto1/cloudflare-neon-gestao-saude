import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../App';
import { ExamOrder } from '../data';
import { getPDFUrl, uploadPDF } from '../db';
import { 
  FileText, ImageIcon, Trash2, Plus, Search, Calendar, User, 
  CheckCircle, Clock, AlertCircle, ExternalLink, Eye, Check, X, 
  UploadCloud, Loader2, ClipboardList, Info, Edit
} from 'lucide-react';

interface ExamOrdersViewProps {
  onNavigate?: (tab: string) => void;
}

export default function ExamOrdersView({ onNavigate }: ExamOrdersViewProps) {
  const { examOrders, doctors, saveExamOrder, deleteExamOrder } = useData();
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'FULFILLED'>('ALL');
  
  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Partial<ExamOrder> | null>(null);
  
  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document Preview State (Lightbox/Modal)
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocType, setPreviewDocType] = useState<string>('');
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDoctorName, setFormDoctorName] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Search/Filter matching
  const filteredOrders = useMemo(() => {
    return examOrders.filter(order => {
      const matchSearch = 
        order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchStatus = 
        statusFilter === 'ALL' ||
        (statusFilter === 'FULFILLED' && order.isFulfilled) ||
        (statusFilter === 'PENDING' && !order.isFulfilled);
        
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [examOrders, searchTerm, statusFilter]);

  // Handle Drag Events for File Upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadError('');
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Apenas arquivos PDF ou Imagens (PNG, JPG, WEBP) são permitidos.');
      return;
    }
    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('O arquivo excede o limite de tamanho de 15MB.');
      return;
    }
    setSelectedFile(file);
  };

  // Open Add/Edit Modal
  const handleOpenAddModal = () => {
    setEditingOrder(null);
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDoctorName('');
    setFormNotes('');
    setSelectedFile(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: ExamOrder) => {
    setEditingOrder(order);
    setFormTitle(order.title);
    setFormDate(order.date);
    setFormDoctorName(order.doctorName || '');
    setFormNotes(order.notes || '');
    setSelectedFile(null);
    setUploadError('');
    setIsModalOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      let finalFilePath = editingOrder?.pdfStoragePath || '';
      let finalFileType = editingOrder?.fileType || '';
      let finalFileName = editingOrder?.fileName || '';

      // Upload file if new one is selected
      if (selectedFile) {
        // Reuse uploadPDF helper (which saves to localforage)
        const userId = 'user_uid_placeholder'; // App context automatically handles replacing this in dbSaveExamOrder
        finalFilePath = await uploadPDF(selectedFile, userId);
        finalFileType = selectedFile.type;
        finalFileName = selectedFile.name;
      }

      await saveExamOrder({
        ...(editingOrder?.id ? { id: editingOrder.id } : {}),
        title: formTitle,
        date: formDate,
        doctorName: formDoctorName || undefined,
        notes: formNotes || undefined,
        pdfStoragePath: finalFilePath || undefined,
        fileType: finalFileType || undefined,
        fileName: finalFileName || undefined,
        isFulfilled: editingOrder ? !!editingOrder.isFulfilled : false
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar pedido de exame:', err);
      alert('Não foi possível salvar o pedido de exames.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Fulfilled State
  const handleToggleFulfilled = async (order: ExamOrder) => {
    try {
      await saveExamOrder({
        ...order,
        isFulfilled: !order.isFulfilled
      });
    } catch (err) {
      console.error('Erro ao atualizar status do pedido:', err);
    }
  };

  // Delete Exam Request
  const handleDelete = async (order: ExamOrder) => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido "${order.title}"?`)) {
      try {
        await deleteExamOrder(order.id, order.pdfStoragePath);
      } catch (err) {
        console.error('Erro ao deletar pedido:', err);
        alert('Erro ao excluir o pedido.');
      }
    }
  };

  // Safe Document Viewer / Preview
  const handlePreviewDocument = async (order: ExamOrder) => {
    if (!order.pdfStoragePath) return;
    
    setIsLoadingPreview(true);
    setPreviewDocTitle(order.title);
    setPreviewDocType(order.fileType || 'application/pdf');
    
    try {
      const url = await getPDFUrl(order.pdfStoragePath);
      setPreviewDocUrl(url);
    } catch (err) {
      console.error('Erro ao obter URL do documento:', err);
      alert('Não foi possível carregar o arquivo para visualização.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="text-teal-600 shrink-0" size={30} />
            Pedidos de Exames
          </h2>
          <p className="text-slate-500 mt-1">
            Guarde, organize e acesse seus pedidos médicos e prescrições em PDF ou imagem.
          </p>
        </div>
        
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-5 rounded-2xl shadow-md transition-colors text-sm"
        >
          <Plus size={18} />
          Novo Pedido
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por título, médico ou anotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow transition-colors placeholder-slate-400"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`flex-1 md:flex-initial text-xs font-semibold py-1.5 px-4 rounded-xl transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`flex-1 md:flex-initial text-xs font-semibold py-1.5 px-4 rounded-xl transition-all ${statusFilter === 'PENDING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('FULFILLED')}
            className={`flex-1 md:flex-initial text-xs font-semibold py-1.5 px-4 rounded-xl transition-all ${statusFilter === 'FULFILLED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Realizados
          </button>
        </div>
      </div>

      {/* Grid of Exam Orders */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <ClipboardList size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Nenhum pedido encontrado</h3>
          <p className="text-slate-500 mt-2 text-sm">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Tente alterar os termos da busca ou os filtros aplicados.'
              : 'Adicione seus pedidos de exames médicos enviados pelo seu doutor para salvá-los e lembrá-los sempre.'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={handleOpenAddModal}
              className="mt-6 inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100/80 text-teal-700 font-bold py-2 px-4 rounded-xl text-sm transition-colors"
            >
              <Plus size={16} />
              Adicionar Primeiro Pedido
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isPdf = order.fileType === 'application/pdf';
            return (
              <div 
                key={order.id} 
                className={`bg-white rounded-3xl border transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative group ${order.isFulfilled ? 'border-slate-100/80 bg-slate-50/50' : 'border-slate-100'}`}
              >
                {/* Header visual cue of type */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPdf ? 'bg-red-50 text-red-500' : order.pdfStoragePath ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}>
                        {isPdf ? <FileText size={20} /> : order.pdfStoragePath ? <ImageIcon size={20} /> : <ClipboardList size={20} />}
                      </div>
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${order.isFulfilled ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                          {order.isFulfilled ? (
                            <>
                              <CheckCircle size={10} />
                              Realizado
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              Pendente
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={14} className="stroke-[2.5]" />
                      </button>
                      <button 
                        onClick={() => handleDelete(order)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  <h4 className={`font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 ${order.isFulfilled ? 'line-through text-slate-400' : ''}`}>
                    {order.title}
                  </h4>

                  {/* Metadata fields */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={13} className="shrink-0" />
                      <span>{new Date(order.date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>

                    {order.doctorName && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <User size={13} className="shrink-0" />
                        <span className="truncate">Dr(a). {order.doctorName}</span>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <p className="mt-3 text-slate-500 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100/60 leading-relaxed font-normal min-h-[40px] line-clamp-2">
                      {order.notes}
                    </p>
                  )}
                </div>

                {/* Card Action footer bar */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={order.isFulfilled}
                      onChange={() => handleToggleFulfilled(order)}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-600">Marcar como feito</span>
                  </label>

                  {order.pdfStoragePath ? (
                    <button
                      onClick={() => handlePreviewDocument(order)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors bg-teal-50/60 hover:bg-teal-50 py-1.5 px-3 rounded-xl border border-teal-500/10"
                    >
                      <Eye size={13} />
                      Visualizar
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium italic flex items-center gap-1">
                      <Info size={11} /> Sem arquivo anexo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 md:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200/50">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg ${previewDocType.includes('pdf') ? 'bg-rose-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  {previewDocType.includes('pdf') ? <FileText size={18} /> : <ImageIcon size={18} />}
                </div>
                <h3 className="font-bold text-slate-800 truncate text-sm md:text-base leading-none">
                  {previewDocTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocUrl}
                  download={previewDocTitle}
                  className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">Baixar Arquivo</span>
                </a>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewDocUrl);
                    setPreviewDocUrl(null);
                  }}
                  className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center overflow-auto relative p-2 md:p-6">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center gap-2.5 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-teal-500" />
                  <span className="text-xs font-semibold">Carregando arquivo...</span>
                </div>
              ) : previewDocType.includes('pdf') ? (
                <iframe
                  src={`${previewDocUrl}#toolbar=1`}
                  title={previewDocTitle}
                  className="w-full h-full rounded-2xl border-0 bg-white shadow-inner"
                />
              ) : (
                <div className="max-w-full max-h-full flex items-center justify-center p-2">
                  <img
                    src={previewDocUrl}
                    alt={previewDocTitle}
                    className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-md bg-white border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg border border-slate-100/80 animate-scale-up overflow-hidden">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingOrder ? 'Editar Pedido de Exames' : 'Adicionar Pedido de Exames'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Simple Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título / Identificação do Pedido <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hemograma & Ferro - Dr. João"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Data do Pedido <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Médico Solicitante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Dra. Christiane Rosa"
                    value={formDoctorName}
                    onChange={(e) => setFormDoctorName(e.target.value)}
                    list="registered-doctors"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow transition-colors"
                  />
                  <datalist id="registered-doctors">
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anotações / Instruções Especiais
                </label>
                <textarea
                  placeholder="Instruções de jejum, preparo especial ou exames que devem ser agendados."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-shadow transition-colors resize-none"
                />
              </div>

              {/* Real Drag & Drop File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anexar Arquivo (PDF ou Imagem) {editingOrder?.pdfStoragePath && <span className="text-[10px] text-teal-600 font-bold lowercase">(já possui anexo)</span>}
                </label>
                
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-teal-500 bg-teal-50/20' : 'border-slate-200 bg-slate-50'} ${selectedFile ? 'border-teal-500/50 bg-teal-50/5' : ''}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center mb-3">
                        {selectedFile.type.includes('pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
                      </div>
                      <p className="text-xs font-bold text-slate-800 max-w-[240px] truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="mt-3 text-xs text-rose-500 hover:text-rose-600 font-bold transition-colors"
                      >
                        Remover e Escolher Outro
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="text-slate-400 mb-3" size={32} />
                      <p className="text-xs font-bold text-slate-700">Arraste seu arquivo aqui ou clique para buscar</p>
                      <p className="text-[10px] text-slate-400 mt-1">Suporta PDF, PNG, JPG, JPEG, WEBP de até 15MB</p>
                    </div>
                  )}
                </div>
                
                {uploadError && (
                  <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle size={12} /> {uploadError}
                  </p>
                )}
                {editingOrder?.pdfStoragePath && !selectedFile && (
                  <p className="mt-1.5 text-xs text-slate-500 font-medium flex items-center gap-1 leading-none">
                    <Info size={12} className="text-teal-500" /> Mantendo o arquivo atual <b>{editingOrder.fileName || 'pedido.pdf'}</b> caso selecione salvar sem anexar um novo.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-11 px-5 border border-slate-200 text-slate-600 rounded-xl hover:text-slate-800 hover:bg-slate-50 transition-colors text-sm font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-teal-400" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar Pedido</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
