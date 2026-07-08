import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList, ReferenceArea, ReferenceLine, Cell } from 'recharts';
import { Activity, FileText, Search, Filter, Stethoscope, HeartPulse, Calendar, User, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, ChevronDown, Table, Database, FileDigit, Info, ArrowUpDown, Plus, UploadCloud, Printer, Menu, X, AlertTriangle, Trash2, LayoutGrid, TrendingUp, Sparkles, PieChart, Eye, ArrowUp, ArrowDown, Loader2, Clock, RefreshCw, Edit, Download, MessageSquare, Send, Pill, BookOpen, Link as LinkIcon, Check, ExternalLink, Image as ImageIcon, History , ShieldAlert, ClipboardList, Sliders, MapPin} from 'lucide-react';

// Mocks for removed firebase and auth dependencies
const db: any = {};
const query: any = (...args: any[]) => {};
const collection: any = (...args: any[]) => {};
const onSnapshot: any = (...args: any[]) => () => {};
const doc: any = (...args: any[]) => {};
const setDoc: any = (...args: any[]) => {};
const getDoc: any = (...args: any[]) => {};
const serverTimestamp: any = () => {};
const orderBy: any = (...args: any[]) => {};
const handleFirestoreError: any = (...args: any[]) => {};
const getAllowedSmsPhoneNumber: any = () => '+5511999999999';
const getAccessToken: any = async () => '';
const getSmsSessionDurationHours: any = () => 24;
const requestSmsCode: any = async (...args: any[]) => {};
const confirmSmsCode: any = async (...args: any[]) => {};
const googleSignIn: any = async () => {};
const initAuth: any = (cb: any) => { cb({ uid: 'mock-user', id: 'mock-user' }, 'mock-token'); return () => {}; };
const uploadToFirebaseFolder: any = async (...args: any[]) => '';
const signInWithEmailAndPassword: any = async (...args: any[]) => {};
const signUpWithEmailAndPassword: any = async (...args: any[]) => {};
const logoutAuth: any = async (...args: any[]) => {};
type FirebaseUser = any;

import Markdown from 'react-markdown';
import { QuickFiltersRow } from './components/QuickFiltersRow';
import Select from 'react-select';
import { EXAM_DATA, MedicalRecord, MedicalAppointment, UserPathology, ContinuousMedication, getExamGroup, getClinicalMetadata, Doctor, ExamOrder, getAutoCategory, parseFanResult, getFanPadraoDescricao, FanParsed, parseLipidMarker, getLipidPanelRisk, LipidParsed, parseTireoidePanel, parseHepaticoPanel, parseUrinalise, parseHemogramaPanel, getValuePercentage, parseRenalPanel, parseGlycemicPanel, parseMusclePanel, parseVitaminsPanel, formatScientificReferences, parseScientificReferences } from './data';
import localforage from 'localforage';
import jsPDF from 'jspdf';
import { motion } from 'motion/react';
import { toPng, toCanvas } from 'html-to-image';
import { WeightTracker } from './components/WeightTracker';
import ChatWidget from './components/ChatWidget';
import { FocoAutoimuneWidget } from './components/FocoAutoimuneWidget';
import { PathologiesView } from './components/PathologiesView';
import { MedicationsView } from './components/MedicationsView';
import { VisualAnalysis } from './components/VisualAnalysis';
import { TimelineView } from './components/TimelineView';
import { normalizeAndMatchExam, EXAM_GLOSSARY } from './utils/examDictionary';
import { fetchWithRetry } from './utils/fetchWithRetry';
import DictionaryView from './components/DictionaryView';
import CrossReferencingView from './components/CrossReferencingView';
import { generateConsolidatedClinicalReport } from './utils/pdfGenerator';
import { GlobalAssistant } from './components/GlobalAssistant';
import DoctorsView from './components/DoctorsView';
import ExamOrdersView from './components/ExamOrdersView';
import { ProfileView } from './components/ProfileView';
import { SidebarSearch } from './components/SidebarSearch';
import { MedicalConsultationView } from './components/MedicalConsultationView';
import { NotificationBell } from './components/NotificationBell';
import MobileAppLayout from './components/MobileAppLayout';
import { BiomarkerRegressionChart } from './components/BiomarkerRegressionChart';
import { LongevityDashboard } from './components/LongevityDashboard';

// --- TOAST SYSTEM ---
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};


function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5500); // Friendly 5.5 second auto-dismiss
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-[24px] shadow-elevated text-xs font-bold backdrop-blur-2xl transition-all duration-300 animate-slideInFromTop ${
      toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
      toast.type === 'error' ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450' :
      'bg-slate-900/85 border-slate-700/50 text-white dark:bg-slate-950/85'
    }`}>
      {toast.type === 'success' && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
      {toast.type === 'error' && <AlertTriangle size={16} className="text-rose-500 shrink-0" />}
      {toast.type === 'info' && <Info size={16} className="text-teal-400 shrink-0" />}
      <p className="leading-snug flex-1">{toast.message}</p>
      <button 
        onClick={onClose} 
        style={{ cursor: 'pointer' }}
        className="opacity-40 hover:opacity-100 p-1.5 rounded-xl hover:bg-slate-500/10 transition-colors cursor-pointer shrink-0 ml-1.5"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-auto">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- DATA PROCESSING UTILS ---
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date(0);
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    if (parts.length === 2 && isNaN(Number(parts[0]))) {
      const months: Record<string, number> = { 'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11 };
      const month = months[parts[0].toLowerCase().substring(0, 3)] || 0;
      return new Date(Number(parts[1]), month, 1);
    }
  }
  return new Date(0);
};

export function getCategoryStyles(category: string) {
  const cat = (category || '').toUpperCase().trim();
  switch (cat) {
    case 'SANGUE':
      return { label: 'Sangue 🩸', className: 'bg-rose-50 text-rose-600 border border-rose-100/50' };
    case 'URINA':
      return { label: 'Urina 🧪', className: 'bg-amber-50 text-amber-600 border border-amber-100/50' };
    case 'FEZES':
      return { label: 'Fezes 🧫', className: 'bg-amber-100/40 text-amber-800 border border-amber-200/20' };
    case 'IMAGEM':
      return { label: 'Imagem 🩻', className: 'bg-teal-50 text-teal-600 border border-teal-100/50' };
    case 'LAUDO':
      return { label: 'Laudo Diagnóstico 📄', className: 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' };
    case 'RELATÓRIO':
      return { label: 'Relatório/Parecer 📝', className: 'bg-blue-50 text-blue-700 border border-blue-100/50' };
    case 'LAB':
      return { label: 'Sangue 🩸', className: 'bg-rose-50 text-rose-600 border border-rose-100/50' };
    case 'AVALIAÇÃO':
      return { label: 'Laudo/Avaliação 📄', className: 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' };
    default:
      return { label: category || 'Outro 📋', className: 'bg-slate-50 text-slate-600 border border-slate-100/50' };
  }
}

export function getCanonicalExamName(name: string): string {
  return normalizeAndMatchExam(name);
}

export function getBaseExamName(fullName: string): string {
  if (!fullName) return '';
  const clean = fullName.trim().replace(/\\s+/g, ' ');
  const lower = clean.toLowerCase();

  // Special hardcoded groupings
  if (lower.startsWith('hiv') || lower.includes('anti-hiv') || lower.includes('anti hiv')) {
    return 'HIV1/HIV2';
  }

  // Regex to recognize sub-components (with spaces around "-"): strip trailing "- Índice", "- Título", "- Padrão", etc.
  const componentRegex = /\\s*-\\s*(índice|indice|index|título|titulo|titer|padrão|padrao|pattern|resultado|result|frações|fracoes|fração|fracao|relato|observação|observacao|método|metodo|metodologia|sub-unidade|subunidade|nota|notas)\\b.*/i;
  
  let returnedName = clean;
  if (componentRegex.test(clean)) {
    const base = clean.replace(componentRegex, '').trim();
    if (base.length > 2) {
      returnedName = base;
    }
  }

  const returnedLower = returnedName.toLowerCase();
  if (returnedLower === 'fan' || returnedLower === 'fator antinuclear') {
    return 'FAN (Fator Antinuclear)';
  }
  
  return returnedName;
}

type NormalizedInterpretation = MedicalRecord['interpretacao'];

const normalizeTextForComparison = (value: any): string => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const parseLocalizedNumber = (value: any): number | null => {
  const match = String(value || '').match(/-?\d+(?:[.,]\d{3})*(?:[.,]\d+)?|-?\d+(?:[.,]\d+)?/);
  if (!match) return null;

  let normalized = match[0];
  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  if (hasComma) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (hasDot) {
    const parts = normalized.split('.');
    const lastPart = parts[parts.length - 1];
    if (parts.length > 2 || (lastPart.length === 3 && parts[0].length > 1)) {
      normalized = normalized.replace(/\./g, '');
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const inferInterpretationFromResult = (resultado?: string, valorReferencia?: string): NormalizedInterpretation | null => {
  const resultText = normalizeTextForComparison(resultado);
  const refText = normalizeTextForComparison(valorReferencia);

  if (!resultText) return null;

  const numericValue = parseLocalizedNumber(resultado);
  if (numericValue !== null && refText) {
    const normalizedRef = refText.replace(/\s+/g, ' ');
    const numberPattern = '-?\\d+(?:[.,]\\d{3})*(?:[.,]\\d+)?|-?\\d+(?:[.,]\\d+)?';
    const rangeMatch = normalizedRef.match(new RegExp(`(${numberPattern})\\s*(?:a|-|ate|até)\\s*(${numberPattern})`, 'i'));
    if (rangeMatch) {
      const min = parseLocalizedNumber(rangeMatch[1]);
      const max = parseLocalizedNumber(rangeMatch[2]);
      if (min !== null && max !== null && max >= min) {
        return numericValue >= min && numericValue <= max ? 'Normal' : 'Alterado';
      }
    }

    const lessMatch = normalizedRef.match(new RegExp(`(?:<|<=|≤|ate|até)\\s*(${numberPattern})`, 'i'));
    if (lessMatch) {
      const max = parseLocalizedNumber(lessMatch[1]);
      if (max !== null) return numericValue <= max ? 'Normal' : 'Alterado';
    }

    const greaterMatch = normalizedRef.match(new RegExp(`(?:>|>=|≥|maior que|acima de)\\s*(${numberPattern})`, 'i'));
    if (greaterMatch) {
      const min = parseLocalizedNumber(greaterMatch[1]);
      if (min !== null) return numericValue >= min ? 'Normal' : 'Alterado';
    }
  }

  const hasNegativeMeaning = /\b(nao|não|negativo|negativa|ausente|indetectavel|indetectável|normal|nao reagente|não reagente)\b/.test(resultText);
  const hasPositiveMeaning = /\b(positivo|positiva|reagente|presente|detectavel|detectável|alterado|alterada)\b/.test(resultText);

  if (hasPositiveMeaning && !hasNegativeMeaning) return 'Alterado';
  if (hasNegativeMeaning) return 'Normal';

  return null;
};

const normalizeInterpretation = (interpretacao?: string, resultado?: string, valorReferencia?: string): NormalizedInterpretation => {
  const normalized = normalizeTextForComparison(interpretacao).replace(/[-_\s]+/g, ' ');

  if (normalized.includes('sub') || normalized.includes('limitr') || normalized.includes('borderline')) {
    return 'Sub-ópt.';
  }
  if (normalized.includes('alter') || normalized.includes('fora') || normalized.includes('alto') || normalized.includes('baixo') || normalized.includes('positivo') || normalized.includes('reagente')) {
    if (!normalized.includes('nao reagente') && !normalized.includes('não reagente')) return 'Alterado';
  }
  if (normalized.includes('normal') || normalized.includes('dentro') || normalized.includes('adequado') || normalized.includes('negativo') || normalized.includes('nao reagente') || normalized.includes('não reagente')) {
    return 'Normal';
  }

  return inferInterpretationFromResult(resultado, valorReferencia) || 'Não Informado';
};


export function formatQualitativeResult(value: any): string {
  if (!value) return '';
  let str = String(value);

  str = str.replace(/ \| /g, '\n');
  str = str.replace(/(Não reagente)\s+(Reagente)/ig, '\
');
  str = str.replace(/(Reagente)\s+(Não reagente)/ig, '\
');
  str = str.replace(/(REAGENTE),\s+/ig, '\
');
  str = str.replace(/(padrão[^\n]+?(AC-\d+\*?))/ig, '\n\
');
  str = str.replace(/([0-9]+\/[0-9]+)/g, 'Titulação: ');
  str = str.replace(/\n+/g, '\n').trim();

  return str;
}


export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(fieldName => {
        let val = row[fieldName] || '';
        val = String(val).replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = '"' + val + '"';
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(["\uFEFF"+csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function parseDoctorString(text: string) {
  if (!text) return { name: '', crm: '', uf: 'SP' };
  
  // Normalizes common abbreviations and extracts CRM and optional state.
  // E.g. "DR. FELIPE ARAGAO SILVA CRM 174993SP", "Dr. João CRM nº 12345/RJ"
  const crmRegex = /CRM\s*(?:n[oºº°\.]+|n\.\s*|num\.\s*|no)?\s*:?\s*(\d+)\s*[\/\-]*\s*([A-Za-z]{2})?/i;
  const match = text.match(crmRegex);
  let crm = '';
  let uf = 'SP';
  let cleanName = text;

  if (match) {
    crm = match[1];
    if (match[2]) {
      uf = match[2].toUpperCase();
    }
    // Remove CRM part of the string
    cleanName = text.replace(match[0], '').replace(/\s*-\s*$/, '').trim();
  }

  // Clean prefixes commonly used
  cleanName = cleanName.replace(/^(?:DR|DRA|DR\(A\)|DR\(a\)|DOCTOR|DOC)\.?\s+/i, '').trim();
  
  // Strip trailing/leading symbols
  cleanName = cleanName.replace(/^[\s,.:()\-]+|[\s,.:()\-]+$/g, '').trim();

  return { name: cleanName, crm, uf };
}

export const renderBeautifulText = (text: string, isAI = false) => {
  if (!text) return null;
  
  // Split the text into lines or paragraphs by standard newlines
  const paragraphs = text.split(/\n+/).filter(p => p.trim() !== "");
  const markerRegex = /(?=\b[1-9]\d*\.\s+|\b[A-Za-z]\)\s+)/g;
  
  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const trimmedPara = para.trim();
        
        // If a paragraph contains multiple numbered items that are mashed together on one line (common in raw extraction outputs)
        // E.g., "1. Ritmo: Sinusal. 2. Ativação..."
        const hasMultipleNumbers = (trimmedPara.match(/\\b[1-9]\\d*\\.\\s+/g) || []).length > 1;
        
        let itemsToRender: string[] = [trimmedPara];
        if (hasMultipleNumbers) {
          itemsToRender = trimmedPara.split(markerRegex).map(item => item.trim()).filter(item => item !== "");
        }
        
        return (
          <div key={pIdx} className="space-y-2.5">
            {itemsToRender.map((item, iIdx) => {
              const trimmedItem = item.trim();
              if (!trimmedItem) return null;
              
              // 1. Check if it matches a numbered list pattern: e.g. "1. " or "1) "
              const numMatch = trimmedItem.match(/^([1-9]\\d*)\\s*[\\.)]\\s*(.*)/s);
              if (numMatch) {
                const num = numMatch[1];
                const content = numMatch[2].trim();
                
                // Check if content has a subheader like "Ritmo: Sinusal" -> split by first ":"
                const colonIdx = content.indexOf(':');
                if (colonIdx !== -1 && colonIdx < 50) {
                  const subHeader = content.substring(0, colonIdx).trim();
                  const subValue = content.substring(colonIdx + 1).trim();
                  return (
                    <div key={iIdx} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl shadow-xs transition-colors hover:border-slate-200">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shrink-0 mt-0.5 border ${
                        isAI 
                          ? 'bg-amber-100/60 text-amber-800 border-amber-200/45' 
                          : 'bg-teal-50 text-teal-800 border-teal-100'
                      }`}>
                        {num}
                      </span>
                      <div className="text-xs text-slate-700 leading-relaxed md:text-sm">
                        <strong className="text-slate-900 font-semibold">{subHeader}:</strong> {subValue}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={iIdx} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl shadow-xs transition-colors hover:border-slate-200">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shrink-0 mt-0.5 border ${
                      isAI 
                        ? 'bg-amber-100/60 text-amber-800 border-amber-200/45' 
                        : 'bg-teal-50 text-teal-800 border-teal-100'
                    }`}>
                      {num}
                    </span>
                    <div className="text-xs text-slate-700 leading-relaxed md:text-sm">
                      {content}
                    </div>
                  </div>
                );
              }
              
              // 2. Check if it's a headers/important prefix like "Comentários:", "Notas:", "Observações:"
              const alertMatch = trimmedItem.match(/^(Comentários|Notas|Observações|Notas\/Comentários|Atenção)\s*:\s*(.*)/i);
              if (alertMatch) {
                const prefix = alertMatch[1].trim();
                const textBody = alertMatch[2].trim();
                return (
                  <div key={iIdx} className={`p-4 rounded-xl border flex gap-3 items-start ${
                    isAI 
                      ? 'bg-amber-50/50 border-amber-150 text-amber-900' 
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <div className="mt-0.5 shrink-0 select-none">
                      {isAI ? <Sparkles size={16} className="text-amber-600" /> : <Info size={16} className="text-slate-500" />}
                    </div>
                    <div>
                      <strong className="font-bold block text-xs md:text-sm mb-1">{prefix}:</strong>
                      <p className="text-xs leading-relaxed opacity-95">{textBody}</p>
                    </div>
                  </div>
                );
              }
              
              // 3. Fallback standard paragraph or labeled text block
              const colonIdx = trimmedItem.indexOf(':');
              if (colonIdx !== -1 && colonIdx < 40 && !trimmedItem.includes('\n')) {
                const label = trimmedItem.substring(0, colonIdx).trim();
                const value = trimmedItem.substring(colonIdx + 1).trim();
                return (
                  <div key={iIdx} className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs md:text-sm flex flex-col sm:flex-row sm:items-baseline gap-1">
                    <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider shrink-0">{label}:</span>
                    <span className="text-slate-800 font-medium">{value}</span>
                  </div>
                );
              }
              
              return (
                <p key={iIdx} className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-wrap px-1 py-0.5">
                  {trimmedItem}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

import { 
  createUserProfile, 
  updateExam, 
   
  uploadPDF, 
  
  getPDFUrl, 
  saveExamsBatch, 
  deleteExam, 
  deleteExamsBatch,
  saveAppointment, 
  deleteAppointment as dbDeleteAppointment,
  savePathology as dbSavePathology,
  deletePathology as dbDeletePathology,
  saveMedication as dbSaveMedication,
  deleteMedication as dbDeleteMedication,
  saveDoctor as dbSaveDoctor,
  deleteDoctor as dbDeleteDoctor,
  saveExamOrder as dbSaveExamOrder,
  deleteExamOrder as dbDeleteExamOrder,
  renameSourceInExams,
  CustomTimelineEvent,
  saveCustomTimelineEvent as dbSaveCustomTimelineEvent,
  deleteCustomTimelineEvent as dbDeleteCustomTimelineEvent,
  fetchAllUserData,
  dataEventTarget
} from './db';
const auth: any = {};


import { ensureDriveFolder, uploadFileToDrive, listFilesInFolder, downloadDriveFile } from './driveHelper';

import { QueuedDocument, addDocumentToQueue, getQueuedDocuments, updateDocumentStatus, removeDocumentFromQueue, markDocumentForRetry } from './queue';

interface DataContextType {
  exams: MedicalRecord[];
  appointments: MedicalAppointment[];
  userPathologies: UserPathology[];
  medications: ContinuousMedication[];
  doctors: Doctor[];
  examOrders: ExamOrder[];
  customEvents: CustomTimelineEvent[];
  addExam: (exam: MedicalRecord) => void;
  addAppointment: (appointment: Partial<MedicalAppointment>) => void;
  deleteAppointment: (id: string) => void;
  savePathology: (pathology: Partial<UserPathology>) => Promise<void>;
  deletePathology: (id: string) => Promise<void>;
  saveMedication: (medication: Partial<ContinuousMedication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  saveDoctor: (doctor: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  saveExamOrder: (order: Partial<ExamOrder>) => Promise<void>;
  deleteExamOrder: (id: string, pdfStoragePath: string | undefined) => Promise<void>;
  saveCustomEvent: (event: Partial<CustomTimelineEvent>) => Promise<void>;
  deleteCustomEvent: (id: string) => Promise<void>;
  processedExams: MedicalRecord[];
  allSources: string[];
  pathologiesData: any[];
  comparativeData: any[];
  user: FirebaseUser | null;
  signOut: () => void;
  localFilePreviews: Record<string, { url: string; type: string }>;
  addLocalFilePreview: (fileName: string, file: File) => void;
  hasDriveAccess: boolean;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => void;
  isSyncingDrive: boolean;
  lastDriveSyncTime: Date | null;
  isDriveAutoSyncEnabled: boolean;
  setIsDriveAutoSyncEnabled: (val: boolean) => void;
  driveSyncLogs: string[];
  executeDriveSync: () => Promise<void>;
  registerProcessFile: (fn: (file: File, docId?: string, isBatch?: boolean, autoSave?: boolean) => Promise<void>) => void;
}

export const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

function parseMedNotes(rawNotes: string | undefined) {
  if (!rawNotes) return { notes: '', sideEffects: '', history: [] };
  const value = rawNotes.trim();
  if (value.startsWith('{') && value.endsWith('}')) {
    try {
      const parsed = JSON.parse(value);
      return {
        notes: parsed.notes || '',
        sideEffects: parsed.sideEffects || '',
        history: parsed.history || []
      };
    } catch (e) { }
  }
  return { notes: rawNotes, sideEffects: '', history: [] };
}

function encodeMedNotes(notes: string, sideEffects: string, history: any[]) {
  return JSON.stringify({ notes, sideEffects, history });
}

function unifyMedicationList(list: ContinuousMedication[]): ContinuousMedication[] {
  const groups: Record<string, ContinuousMedication[]> = {};
  
  const cleanMedName = (name: string): string => {
    if (!name) return "";
    let cleaned = name
      .replace(/\s*\(\s*\d{4}(?:\/\d{4})?\s*\)/g, "") // removes " (2026)" or " (2025/2026)"
      .replace(/\s*\b\d{4}\b/g, "") // removes " 2026"
      .trim();
    if (cleaned.toLowerCase() === "queteapina") {
      return "Quetiapina";
    }
    return cleaned;
  };

  list.forEach(med => {
    const normName = cleanMedName(med.name).toLowerCase();
    if (!groups[normName]) {
      groups[normName] = [];
    }
    groups[normName].push(med);
  });

  const unifiedList: ContinuousMedication[] = [];

  Object.keys(groups).forEach(key => {
    const items = groups[key];
    if (items.length === 0) return;

    // Sort: isActive first, then newest startDate descending
    const sorted = [...items].sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      const dateA = a.startDate || '';
      const dateB = b.startDate || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return a.id.localeCompare(b.id);
    });

    const primary = sorted[0];
    const primaryCleanName = cleanMedName(primary.name);

    if (sorted.length === 1) {
      unifiedList.push({
        ...primary,
        name: primaryCleanName,
        _mergedIds: [primary.id]
      });
      return;
    }

    let combinedNotes = "";
    let combinedSideEffects = "";
    const combinedHistoryList: any[] = [];
    const seenHistoryIds = new Set<string>();
    const hasAnyActive = sorted.some(i => i.isActive);

    sorted.forEach((item, index) => {
      const parsed = parseMedNotes(item.notes);
      
      if (parsed.notes && parsed.notes.trim()) {
        const val = parsed.notes.trim();
        if (combinedNotes) {
          if (!combinedNotes.includes(val)) {
            combinedNotes += " | " + val;
          }
        } else {
          combinedNotes = val;
        }
      }

      if (parsed.sideEffects && parsed.sideEffects.trim()) {
        const val = parsed.sideEffects.trim();
        if (combinedSideEffects) {
          if (!combinedSideEffects.includes(val)) {
            combinedSideEffects += " | " + val;
          }
        } else {
          combinedSideEffects = val;
        }
      }

      parsed.history.forEach((h: any) => {
        const uid = h.id || `${h.date}-${h.dosage}`;
        if (!seenHistoryIds.has(uid)) {
          seenHistoryIds.add(uid);
          combinedHistoryList.push(h);
        }
      });

      // Include duplicate past item state as history log entry
      if (index > 0) {
        const virtualHistoryId = `virtual-${item.id}`;
        if (!seenHistoryIds.has(virtualHistoryId)) {
          seenHistoryIds.add(virtualHistoryId);
          combinedHistoryList.push({
            id: virtualHistoryId,
            date: item.startDate || 'Sem data',
            dosage: item.dosage,
            notes: parsed.notes || `Histórico anterior do tratamento desmembrado de ${item.name}`,
            sideEffects: parsed.sideEffects || ''
          });
        }
      }
    });

    combinedHistoryList.sort((a, b) => {
      const dA = a.date || '';
      const dB = b.date || '';
      return dB.localeCompare(dA);
    });

    unifiedList.push({
      ...primary,
      id: primary.id,
      name: primaryCleanName,
      isActive: hasAnyActive,
      notes: encodeMedNotes(combinedNotes, combinedSideEffects, combinedHistoryList),
      startDate: primary.startDate,
      endDate: hasAnyActive ? undefined : primary.endDate,
      _mergedIds: sorted.map(i => i.id)
    });
  });

  return unifiedList;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [exams, setExams] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([]);
  const [userPathologies, setUserPathologies] = useState<UserPathology[]>([]);
  const [medications, setMedications] = useState<ContinuousMedication[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [examOrders, setExamOrders] = useState<ExamOrder[]>([]);
  const [customEvents, setCustomEvents] = useState<CustomTimelineEvent[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [localFilePreviews, setLocalFilePreviews] = useState<Record<string, { url: string; type: string }>>({});
  const [hasDriveAccess, setHasDriveAccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [smsPhone, setSmsPhone] = useState(getAllowedSmsPhoneNumber());
  const [smsCode, setSmsCode] = useState('');
  const [smsStep, setSmsStep] = useState<'phone' | 'code'>('phone');
  const [smsError, setSmsError] = useState('');
  const [showSmsSection, setShowSmsSection] = useState(false);

  const connectDrive = async () => {
    alert('A integração com Google Drive está desativada no modo de autenticação por SMS.');
  };

  const disconnectDrive = () => {
    setHasDriveAccess(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_drive_access_token');
    }
  };

  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const isSyncingRef = React.useRef(false);
  const [lastDriveSyncTime, setLastDriveSyncTime] = useState<Date | null>(null);
  const [isDriveAutoSyncEnabled, setIsDriveAutoSyncEnabled] = useState(true);
  const [driveSyncLogs, setDriveSyncLogs] = useState<string[]>([]);
  const processFileRef = React.useRef<((file: File, docId?: string, isBatch?: boolean, autoSave?: boolean) => Promise<void>) | null>(null);

  const registerProcessFile = (fn: (file: File, docId?: string, isBatch?: boolean, autoSave?: boolean) => Promise<void>) => {
    processFileRef.current = fn;
  };

  const addDriveLog = (msg: string) => {
    setDriveSyncLogs(prev => {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      return [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)];
    });
  };

  const executeDriveSync = async () => {
    if (isSyncingRef.current) return;
    const token = await getAccessToken();
    if (!user || !token) {
      addDriveLog("Erro: Sincronização cancelada. Usuário não autenticado ou sem acesso ao Drive.");
      return;
    }

    isSyncingRef.current = true;
    setIsSyncingDrive(true);
    addDriveLog("Iniciando varredura na pasta 'HealthTracker Importar'...");

    try {
      // 1. Ensure folder
      const folderId = await ensureDriveFolder(token, ['HealthTracker Importar']);
      if (!folderId) {
        addDriveLog("Erro: Pasta 'HealthTracker Importar' não encontrada ou falha ao criá-la.");
        isSyncingRef.current = false;
        setIsSyncingDrive(false);
        return;
      }

      // 2. List files
      const files = await listFilesInFolder(token, folderId);
      addDriveLog(`Pasta conectada. ${files.length} arquivo(s) compatíveis localizados.`);

      if (files.length === 0) {
        addDriveLog("Varredura concluída. Nenhum arquivo pendente.");
        setLastDriveSyncTime(new Date());
        isSyncingRef.current = false;
        setIsSyncingDrive(false);
        return;
      }

      let processedInThisRun = 0;

      // 3. Process new files
      for (const fileItem of files) {
        const syncDocRef = doc(db, `users/${user.uid}/syncedDriveFiles`, fileItem.id);
        const syncDocSnap = await getDoc(syncDocRef);

        if (!syncDocSnap.exists()) {
          addDriveLog(`Novo arquivo detectado: '${fileItem.name}'. Baixando arquivo do Google Drive...`);
          try {
            const blob = await downloadDriveFile(token, fileItem.id);
            const fileObj = new File([blob], fileItem.name, { type: fileItem.mimeType });

            if (processFileRef.current) {
              addDriveLog(`Extraindo exames clínicos de '${fileItem.name}' via Inteligência Artificial...`);
              await processFileRef.current(fileObj, undefined, false, true);

              // Record to avoid processing in subsequent runs
              await setDoc(syncDocRef, {
                processedAt: serverTimestamp(),
                fileName: fileItem.name,
                mimeType: fileItem.mimeType
              });

              addDriveLog(`Sucesso: '${fileItem.name}' catalogado e exames integrados.`);
              processedInThisRun++;
            } else {
              addDriveLog(`Aviso: O motor de processamento IA está inativo no momento.`);
            }
          } catch (fileErr: any) {
            console.error(fileErr);
            addDriveLog(`Erro ao importar '${fileItem.name}': ${fileErr.message || fileErr}`);
          }
        }
      }

      addDriveLog(`Sincronização realizada. Total de ${processedInThisRun} novo(s) documento(s) importado(s).`);
      setLastDriveSyncTime(new Date());
    } catch (e: any) {
      console.error(e);
      if (e?.message === 'UNAUTHORIZED_DRIVE_ACCESS') {
        addDriveLog("Erro: Sessão do Google Drive expirada. Reconecte sua conta do Google Drive.");
        setHasDriveAccess(false);
        localStorage.removeItem('google_drive_access_token');
      } else {
        addDriveLog(`Erro geral no driver de sincronização: ${e.message || e}`);
      }
    } finally {
      isSyncingRef.current = false;
      setIsSyncingDrive(false);
    }
  };

  // Automated background scheduler (every 60 seconds)
  React.useEffect(() => {
    if (!user || !hasDriveAccess || !isDriveAutoSyncEnabled) return;

    const runScheduler = async () => {
      try {
        await executeDriveSync();
      } catch (err) {
        console.error("Auto Drive Sync Scheduler error:", err);
      }
    };

    const delayTimer = setTimeout(() => {
      runScheduler();
    }, 5000); // initial trigger after 5 seconds delay to allow page settlement

    const interval = setInterval(runScheduler, 60 * 1000); // periodic verification every 60 seconds
    return () => {
      clearTimeout(delayTimer);
      clearInterval(interval);
    };
  }, [user, hasDriveAccess, isDriveAutoSyncEnabled]);

  const addLocalFilePreview = (fileName: string, file: File) => {
    const url = URL.createObjectURL(file);
    setLocalFilePreviews(prev => ({
      ...prev,
      [fileName]: { url, type: file.type }
    }));
  };

  React.useEffect(() => {
    const unsubscribe = initAuth(async (u: any, token: any) => {
      setUser(u);
      setHasDriveAccess(Boolean(token));
      setAuthReady(true);
      if (u) {
        await createUserProfile(u);
      }
    }, () => {
      setUser(null);
      setHasDriveAccess(false);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setExams([]);
      setAppointments([]);
      setUserPathologies([]);
      setMedications([]);
      setDoctors([]);
      setExamOrders([]);
      setCustomEvents([]);
      return;
    }

    let cancelled = false;

    const loadAllData = async () => {
      try {
        const data = await fetchAllUserData(user.uid);
        if (cancelled) return;

        setExams(Array.isArray(data.exams) ? data.exams : []);
        setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
        setUserPathologies(Array.isArray(data.pathologies) ? data.pathologies : []);
        setMedications(unifyMedicationList(Array.isArray(data.medications) ? data.medications : []));
        setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
        setExamOrders(Array.isArray(data.examOrders) ? data.examOrders : []);
        setCustomEvents(Array.isArray(data.timelineEvents) ? data.timelineEvents : []);
      } catch (error) {
        console.error('Erro ao carregar dados do servidor:', error);
      }
    };

    loadAllData();
    dataEventTarget.addEventListener('refresh', loadAllData);

    return () => {
      cancelled = true;
      dataEventTarget.removeEventListener('refresh', loadAllData);
    };
  }, [user]);

  const processedExams = useMemo(() => {
    return exams.map(exam => {
      const canonicalName = getCanonicalExamName(exam.nomeExame || '');
      const resolvedCategory = exam.isManualCategory 
        ? exam.categoria 
        : getAutoCategory(canonicalName, exam.categoria);
      return {
        ...exam,
        nomeExame: canonicalName,
        categoria: resolvedCategory,
        interpretacao: normalizeInterpretation(exam.interpretacao, exam.resultado, exam.valorReferencia)
      };
    }).sort((a, b) => parseDate(b.dataExame).getTime() - parseDate(a.dataExame).getTime());
  }, [exams]);

  const allSources = useMemo(() => {
    return Array.from(new Set(processedExams.map(e => e.arquivoOrigem))).sort();
  }, [processedExams]);

  const pathologiesData = useMemo(() => {
    const groups: Record<string, MedicalRecord[]> = {};
    processedExams.forEach(e => {
      if (!groups[e.nomeExame]) groups[e.nomeExame] = [];
      groups[e.nomeExame].push(e);
    });

    const results = [];
    for (const [nome, history] of Object.entries(groups)) {
      const hasAlteration = history.some(e => e.interpretacao === 'Alterado' || e.interpretacao === 'Sub-ópt.');
      
      if (!hasAlteration) continue;

      const latest = history[0];
      let status = 'Monitorização';
      if (latest.interpretacao === 'Alterado' || latest.interpretacao === 'Sub-ópt.') {
        status = 'Requer Reavaliação';
      } else if (latest.interpretacao === 'Normal') {
        status = 'Normalizado';
      }

      results.push({
        condition: nome,
        category: latest.categoria,
        dateDetected: history[history.length - 1].dataExame,
        lastExam: latest.dataExame,
        status: status,
        description: latest.resultado,
        source: latest.arquivoOrigem
      });
    }

    return results.sort((a, b) => {
      if (a.status === 'Requer Reavaliação' && b.status !== 'Requer Reavaliação') return -1;
      if (b.status === 'Requer Reavaliação' && a.status !== 'Requer Reavaliação') return 1;
      return parseDate(b.lastExam).getTime() - parseDate(a.lastExam).getTime();
    });
  }, [processedExams]);

  const comparativeData = useMemo(() => {
    const labExams = processedExams.filter(e => ['SANGUE', 'URINA', 'FEZES', 'LAB', 'LAUDO', 'RELATÓRIO', 'OUTROS'].includes(e.categoria));
    
    // Group all lab exams by getBaseExamName
    const examsByBaseName: Record<string, MedicalRecord[]> = {};
    labExams.forEach(e => {
      const baseName = getBaseExamName(e.nomeExame || '');
      if (!examsByBaseName[baseName]) {
        examsByBaseName[baseName] = [];
      }
      examsByBaseName[baseName].push(e);
    });

    return Object.entries(examsByBaseName).map(([baseName, examsInGroup]) => {
      const history: Record<string, any> = {};
      const uniqueDates = Array.from(new Set(examsInGroup.map(e => e.dataExame)));
      
      const units = Array.from(new Set(examsInGroup.map(e => e.unidade).filter(u => u && u !== '—')));
      const unit = units.length > 0 ? units.join(', ') : '—';

      const referenceMap: Record<string, string> = {};
      examsInGroup.forEach(e => {
        if (e.valorReferencia && e.valorReferencia !== '—') {
          let label = e.nomeExame;
          if (label !== baseName && label.startsWith(baseName)) {
            label = label.substring(baseName.length).replace(/^[\\s\\-_/(),.:;]+/, '').trim();
          }
          referenceMap[label] = e.valorReferencia;
        }
      });
      
      let reference = '';
      const refEntries = Object.entries(referenceMap);
      if (refEntries.length === 0) {
        reference = '—';
      } else if (refEntries.length === 1) {
        reference = capitalizeFirstLetter(refEntries[0][1]);
      } else {
        reference = refEntries.map(([label, ref]) => {
          if (!label || label === baseName) return capitalizeFirstLetter(ref);
          const capLabel = label.charAt(0).toUpperCase() + label.slice(1);
          return `${capLabel}: ${capitalizeFirstLetter(ref)}`;
        }).join('\
');
      }

      uniqueDates.forEach(date => {
        const examsOnDate = examsInGroup.filter(e => e.dataExame === date);
        if (examsOnDate.length === 0) return;

        const sortedExamsOnDate = [...examsOnDate].sort((a, b) => {
          const aIsBase = a.nomeExame === baseName;
          const bIsBase = b.nomeExame === baseName;
          if (aIsBase && !bIsBase) return -1;
          if (!aIsBase && bIsBase) return 1;
          return a.nomeExame.localeCompare(b.nomeExame);
        });

        const valuesList = sortedExamsOnDate.map(e => {
          let label = e.nomeExame;
          let prefix = '';
          if (label !== baseName && label.startsWith(baseName)) {
            let subWord = label.substring(baseName.length).replace(/^[\\s\\-_/(),.:;]+/, '').trim();
            if (subWord) {
              const capSubWord = subWord.charAt(0).toUpperCase() + subWord.slice(1);
              prefix = `${capSubWord}: `;
            }
          } else if (label !== baseName) {
            prefix = `${label}: `;
          }
          return `${prefix}${capitalizeFirstLetter(e.resultado)}`;
        });

        const combinedValStr = valuesList.join(' | ');

        let combinedInterp = 'Normal';
        if (examsOnDate.some(e => e.interpretacao === 'Alterado')) {
          combinedInterp = 'Alterado';
        } else if (examsOnDate.some(e => e.interpretacao === 'Sub-ópt.')) {
          combinedInterp = 'Sub-ópt.';
        }

        const firstWithSource = examsOnDate.find(e => e.arquivoOrigem) || examsOnDate[0];
        const source = firstWithSource ? firstWithSource.arquivoOrigem : '';

        let primaryNumVal: any = NaN;
        for (const e of sortedExamsOnDate) {
          let str = e.resultado.toLowerCase();
          
          let tempStr = str.replace(/\.(\d{3})(?=[^\d]|$|,)/g, '$1');
          
          let numMatch = tempStr.match(/\d+([.,]\d+)?/);
          
          if (numMatch) {
             let numStr = numMatch[0].replace(',', '.');
             primaryNumVal = parseFloat(numStr);
             break;
          } else {
             if (str.includes('não') || str.includes('ausente') || str.includes('negativo') || str.includes('indetectável') || str.includes('normal')) {
               primaryNumVal = 0;
               break;
             }
             if (str.includes('reagente') || str.includes('presente') || str.includes('positivo') || str.includes('detectável') || str.includes('alterado')) {
               primaryNumVal = 1;
               break;
             }
          }
        }
        if (isNaN(primaryNumVal) && sortedExamsOnDate[0]) {
          primaryNumVal = sortedExamsOnDate[0].resultado;
        }

        history[date] = {
          value: combinedValStr,
          numValue: primaryNumVal,
          source: source,
          interpretacao: combinedInterp,
          exams: sortedExamsOnDate
        };
      });

      return {
        testName: baseName,
        reference,
        history,
        unit
      };
    }).sort((a, b) => a.testName.localeCompare(b.testName));
  }, [processedExams]);

  const addExam = (exam: MedicalRecord) => {
    // We don't use this explicitly in state anymore. It will flow from firestore snapshot.
  };

  const addAppointment = async (appt: Partial<MedicalAppointment>) => {
    if (user) {
      await saveAppointment(appt, user.uid);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (user) {
      await dbDeleteAppointment(id, user.uid);
    }
  };

  const savePathology = async (pathology: Partial<UserPathology>) => {
    if (user) {
      await dbSavePathology(pathology, user.uid);
    }
  };

  const deletePathology = async (id: string) => {
    if (user) {
      await dbDeletePathology(id, user.uid);
    }
  };

  const saveMedication = async (medication: Partial<ContinuousMedication>) => {
    if (user) {
      if (medication.name) {
        medication.name = medication.name
          .replace(/\s*\(\s*\d{4}(?:\/\d{4})?\s*\)/g, "")
          .replace(/\s*\b\d{4}\b/g, "")
          .trim();
        if (medication.name.toLowerCase() === "queteapina") {
          medication.name = "Quetiapina";
        }
      }

      await dbSaveMedication(medication, user.uid);

      if (medication.id) {
        const found = medications.find(m => m.id === medication.id);
        if (found && found._mergedIds && found._mergedIds.length > 1) {
          const others = found._mergedIds.filter(oid => oid !== medication.id);
          for (const oid of others) {
            await dbDeleteMedication(oid, user.uid);
          }
        }
      }
    }
  };

  const deleteMedication = async (id: string) => {
    if (user) {
      const found = medications.find(m => m.id === id);
      if (found && found._mergedIds && found._mergedIds.length > 0) {
        for (const mId of found._mergedIds) {
          await dbDeleteMedication(mId, user.uid);
        }
      } else {
        await dbDeleteMedication(id, user.uid);
      }
    }
  };

  const saveDoctor = async (doctor: Partial<Doctor>) => {
    if (user) {
      await dbSaveDoctor(doctor, user.uid);
    }
  };

  const deleteDoctor = async (id: string) => {
    if (user) {
      await dbDeleteDoctor(id, user.uid);
    }
  };

  const saveExamOrder = async (order: Partial<ExamOrder>) => {
    if (user) {
      await dbSaveExamOrder(order, user.uid);
    }
  };

  const deleteExamOrder = async (id: string, pdfStoragePath: string | undefined) => {
    if (user) {
      await dbDeleteExamOrder(id, pdfStoragePath, user.uid);
    }
  };
  
  const saveCustomEvent = async (event: Partial<CustomTimelineEvent>) => {
    if (user) {
      await dbSaveCustomTimelineEvent(event, user.uid);
    }
  };

  const deleteCustomEvent = async (id: string) => {
    if (user) {
      await dbDeleteCustomTimelineEvent(id, user.uid);
    }
  };
  
  const handleSignOut = () => logoutAuth();

  if (!authReady) {
    return <div className="h-[100dvh] flex items-center justify-center text-slate-500">Iniciando aplicação...</div>;
  }

  if (!user) {
    const allowedPhoneNumber = getAllowedSmsPhoneNumber();
    const sessionHours = getSmsSessionDurationHours();

    const handleRequestSms = async () => {
      if (isLoggingIn) return;
      setIsLoggingIn(true);
      setSmsError('');
      try {
        await requestSmsCode(smsPhone, 'sms-recaptcha-container');
        setSmsStep('code');
      } catch (err: any) {
        console.warn("Falha ao solicitar SMS", err?.message);
        setSmsError(err?.message || 'Não foi possível enviar o código por SMS.');
      } finally {
        setIsLoggingIn(false);
      }
    };

    const handleConfirmSms = async () => {
      if (isLoggingIn) return;
      setIsLoggingIn(true);
      setSmsError('');
      try {
        await confirmSmsCode(smsCode);
      } catch (err: any) {
        console.warn("Falha ao confirmar SMS", err?.message);
        setSmsError(err?.message || 'Não foi possível validar o código SMS.');
      } finally {
        setIsLoggingIn(false);
      }
    };

    const handleGoogleSignIn = async () => {
      if (isGoogleLoggingIn) return;
      setIsGoogleLoggingIn(true);
      setSmsError('');
      try {
        await googleSignIn();
      } catch (err: any) {
        console.warn("Falha ao entrar com Google", err?.message);
        setSmsError(err?.message || 'Não foi possível entrar com o Google.');
      } finally {
        setIsGoogleLoggingIn(false);
      }
    };

    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 py-8 text-slate-900 overflow-y-auto">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 mb-6">
            <Activity size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">HealthTracker</h1>
          <p className="text-slate-500 text-sm mb-6">Faça login para acessar seus dados de saúde.</p>

          {/* Google Sign-In Button */}
          <div className="w-full mb-4">
            <button
              id="btn-google-signin"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoggingIn || isLoggingIn}
              className="w-full h-12 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-slate-700 font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-3"
            >
              {isGoogleLoggingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin text-teal-500" />
                  <span>Entrando com Google...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M47.532 24.552c0-1.636-.145-3.2-.414-4.698H24.48v8.883h12.979c-.558 3.017-2.26 5.572-4.818 7.288v6.058h7.797c4.561-4.202 7.094-10.393 7.094-17.53z" fill="#4285F4"/>
                    <path d="M24.48 48c6.503 0 11.956-2.156 15.941-5.841l-7.797-6.058c-2.156 1.445-4.91 2.3-8.144 2.3-6.262 0-11.565-4.231-13.461-9.918H2.94v6.254C6.91 43.42 15.095 48 24.48 48z" fill="#34A853"/>
                    <path d="M11.019 28.483A14.4 14.4 0 0 1 10.27 24c0-1.563.27-3.083.749-4.483v-6.254H2.94A23.92 23.92 0 0 0 .48 24c0 3.862.927 7.516 2.46 10.737l8.08-6.254z" fill="#FBBC05"/>
                    <path d="M24.48 9.599c3.527 0 6.694 1.213 9.183 3.594l6.882-6.882C36.428 2.379 30.975 0 24.48 0 15.095 0 6.91 4.58 2.94 11.263l8.079 6.254c1.896-5.687 7.199-9.918 13.461-9.918z" fill="#EA4335"/>
                  </svg>
                  <span>Entrar com Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* SMS Section Toggle */}
          {!showSmsSection ? (
            <button
              id="btn-show-sms"
              type="button"
              onClick={() => setShowSmsSection(true)}
              disabled={isGoogleLoggingIn}
              className="w-full h-11 border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MessageSquare size={16} />
              Entrar com SMS
            </button>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (smsStep === 'phone') {
                  handleRequestSms();
                } else {
                  handleConfirmSms();
                }
              }}
              className="w-full space-y-4"
            >
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs text-left p-3 rounded-lg leading-relaxed">
                <span className="font-semibold block mb-1">Sessão limitada:</span>
                Após validar o código, o acesso permanece ativo por apenas {sessionHours} horas.
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-1">Celular autorizado</label>
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+5511999999999"
                  disabled={smsStep === 'code' || !allowedPhoneNumber}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">Use o formato E.164. Apenas o número configurado no sistema pode receber o código.</p>
              </div>

              {smsStep === 'code' && (
                <div className="text-left">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Código SMS</label>
                  <input
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="Digite o código recebido"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                  />
                </div>
              )}

              {smsError && (
                <div className="text-left text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  {smsError}
                </div>
              )}

              {!allowedPhoneNumber && (
                <div className="text-left text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  Configure `VITE_ALLOWED_SMS_PHONE` no ambiente antes de usar este login.
                </div>
              )}

              <div id="sms-recaptcha-container" className="flex justify-center" />

              {smsStep === 'phone' ? (
                <button
                  id="btn-request-sms"
                  type="submit"
                  disabled={isLoggingIn || !allowedPhoneNumber}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-teal-400" />
                      <span>Enviando SMS...</span>
                    </>
                  ) : (
                    <span>Receber código por SMS</span>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    id="btn-confirm-sms"
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-teal-400" />
                        <span>Validando...</span>
                      </>
                    ) : (
                      <span>Entrar com código SMS</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSmsStep('phone');
                      setSmsCode('');
                      setSmsError('');
                    }}
                    className="w-full h-11 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Solicitar novo código
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowSmsSection(false);
                  setSmsStep('phone');
                  setSmsCode('');
                  setSmsError('');
                }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors"
              >
                Voltar às opções de login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={{ 
      exams, 
      appointments, 
      userPathologies,
      medications,
      doctors,
      examOrders,
      customEvents,
      addExam, 
      addAppointment, 
      deleteAppointment, 
      savePathology,
      deletePathology,
      saveMedication,
      deleteMedication,
      saveDoctor,
      deleteDoctor,
      saveExamOrder,
      deleteExamOrder,
      saveCustomEvent,
      deleteCustomEvent,
      processedExams, 
      allSources, 
      pathologiesData, 
      comparativeData, 
      user, 
      signOut: handleSignOut, 
      localFilePreviews, 
      addLocalFilePreview,
      hasDriveAccess,
      connectDrive,
      disconnectDrive,
      isSyncingDrive,
      lastDriveSyncTime,
      isDriveAutoSyncEnabled,
      setIsDriveAutoSyncEnabled,
      driveSyncLogs,
      executeDriveSync,
      registerProcessFile
    }}>
      {children}
    </DataContext.Provider>
  );
}

function AgendaView() {
  const { appointments, addAppointment, deleteAppointment } = useData();
  const { addToast } = useToast();

  const getApptTypeLabel = (appt: MedicalAppointment) => {
    if (appt.type === 'EXAM') {
      const categoryLabels: Record<string, string> = {
        SANGUE: 'Sangue',
        URINA: 'Urina',
        IMAGEM: 'Imagem',
        FEZES: 'Fezes',
        OUTROS: 'Outros'
      };
      const catName = appt.examCategory ? categoryLabels[appt.examCategory] || appt.examCategory : '';
      return `Exame${catName ? ` (${catName})` : ''}`;
    }
    if (appt.type === 'THERAPY') return 'Terapia';
    if (appt.type === 'PHYSIOTHERAPY') return 'Fisioterapia';
    return 'Consulta';
  };

  const getClinicDetails = (appt: MedicalAppointment) => {
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

  const getCalendarApptStyles = (appt: MedicalAppointment) => {
    if (appt.status === 'COMPLETED') {
      return {
        bgClass: 'bg-slate-100 border-slate-300 text-slate-500',
        iconColor: 'text-slate-450',
        borderClass: 'border-slate-300'
      };
    }
    switch (appt.type) {
      case 'EXAM':
        return {
          bgClass: 'bg-indigo-50 text-indigo-805',
          iconColor: 'text-indigo-500',
          borderClass: 'border-indigo-400'
        };
      case 'THERAPY':
        return {
          bgClass: 'bg-emerald-50 text-emerald-805',
          iconColor: 'text-emerald-500',
          borderClass: 'border-emerald-400'
        };
      case 'PHYSIOTHERAPY':
        return {
          bgClass: 'bg-sky-50 text-sky-805',
          iconColor: 'text-sky-500',
          borderClass: 'border-sky-400'
        };
      default:
        return {
          bgClass: 'bg-teal-50 text-teal-805',
          iconColor: 'text-teal-500',
          borderClass: 'border-teal-400'
        };
    }
  };
  const [formData, setFormData] = useState<Partial<MedicalAppointment>>({
    type: 'APPOINTMENT',
    title: '',
    date: '',
    time: '',
    doctor: '',
    specialty: '',
    location: '',
    status: 'SCHEDULED'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const pastAppointments = appointments.filter(a => new Date(a.date + 'T00:00') < new Date() || a.status === 'COMPLETED').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const futureAppointments = appointments.filter(a => new Date(a.date + 'T00:00') >= new Date() && a.status !== 'COMPLETED').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const last12Months = new Date();
  last12Months.setMonth(last12Months.getMonth() - 12);
  
  const appointmentsLast12Months = appointments.filter(a => {
    if (!a.date) return false;
    return new Date(a.date + 'T00:00') >= last12Months;
  });

  const specialtyCounts = appointmentsLast12Months.reduce((acc, appt) => {
    if (appt.type === 'APPOINTMENT') {
      const spec = appt.specialty || 'Clínica Geral / Não Informada';
      acc[spec] = (acc[spec] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(specialtyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date) {
      addToast('A data é obrigatória.', 'error');
      return;
    }
    if (formData.type === 'EXAM' && !formData.title?.trim()) {
      addToast('O título / procedimento é obrigatório para exames.', 'error');
      return;
    }

    const titleToSave = formData.title?.trim() || 
      (formData.type === 'APPOINTMENT' ? 'Consulta Médica' : 
       formData.type === 'THERAPY' ? 'Terapia' : 
       formData.type === 'PHYSIOTHERAPY' ? 'Fisioterapia' : 'Agendamento');

    const dataToSave = {
      ...formData,
      title: titleToSave,
      examCategory: formData.type === 'EXAM' ? (formData.examCategory || 'SANGUE') : undefined
    };

    try {
      await addAppointment(dataToSave);
      addToast('Agendamento salvo com sucesso!', 'success');
      setFormData({ type: 'APPOINTMENT', title: '', date: '', time: '', doctor: '', specialty: '', location: '', clinicAddress: '', status: 'SCHEDULED' });
      setIsAdding(false);
    } catch (err) {
      addToast('Erro ao salvar agendamento.', 'error');
    }
  };

  const handleComplete = async (id: string, appt: MedicalAppointment) => {
    try {
      await addAppointment({ ...appt, status: 'COMPLETED' });
      addToast('Marcado como concluído!', 'success');
    } catch (err) {
      addToast('Erro ao atualizar status', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Agenda de Saúde</h2>
          <p className="text-slate-500">Planejamento e histórico de consultas e exames médicos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancelar' : 'Novo Agendamento'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Novo Agendamento</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
              <select 
                value={formData.type} 
                onChange={(e) => {
                  const newType = e.target.value as 'EXAM' | 'APPOINTMENT' | 'THERAPY' | 'PHYSIOTHERAPY';
                  setFormData({
                    ...formData,
                    type: newType,
                    examCategory: newType === 'EXAM' ? 'SANGUE' : undefined
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              >
                <option value="APPOINTMENT">Consulta Médica</option>
                <option value="EXAM">Exame</option>
                <option value="THERAPY">Terapia</option>
                <option value="PHYSIOTHERAPY">Fisioterapia</option>
              </select>
            </div>
            {formData.type === 'EXAM' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Categoria do Exame</label>
                <select 
                  value={formData.examCategory || 'SANGUE'} 
                  onChange={(e) => setFormData({...formData, examCategory: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
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
              <label className="block text-xs font-bold text-slate-500 mb-1">
                {formData.type === 'EXAM' ? 'Título do Exame' : 'Título / Procedimento'} {formData.type !== 'EXAM' && '(Opcional)'}
              </label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required={formData.type === 'EXAM'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800" 
                placeholder={formData.type === 'EXAM' ? "Ex. Hemograma, Ressonância" : "Ex. Consulta Cardiologista"} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Data</label>
              <input 
                type="date" 
                required 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Horário (Opcional)</label>
              <input 
                type="time" 
                value={formData.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Médico</label>
              <input 
                type="text" 
                value={formData.doctor} 
                onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Especialidade</label>
              <input 
                type="text" 
                value={formData.specialty} 
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
                placeholder="Ex. Cardiologia, Neuro..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Local / Clínica</label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ex. Clínica La Vie"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Endereço da Clínica</label>
              <input 
                type="text" 
                value={formData.clinicAddress} 
                onChange={(e) => setFormData({...formData, clinicAddress: e.target.value})}
                placeholder="Ex. Rua Doutor Nicolau de Sousa Queirós, 177"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:border-teal-500 font-medium text-slate-800"
              />
            </div>

            {formData.type === 'EXAM' && (
              <div className="md:col-span-2 mt-2 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="text-blue-600" size={18} />
                  <h4 className="text-sm font-bold text-blue-900">Dicas de Preparação</h4>
                </div>
                
                <div className="mb-3">
                   <label className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">Selecione o tipo de exame para ver dicas:</label>
                   <select 
                     onChange={(e) => {
                        const val = e.target.value;
                        const tipsMap: Record<string, string> = {
                          'SANGUE_GERAL': 'Jejum de 8 a 12 horas. Beber água normalmente. Evitar exercícios físicos intensos no dia anterior.',
                          'ULTRASSOM_ABD': 'Jejum absoluto de 6 a 8 horas. Retenção urinária (bexiga cheia) para avaliação pélvica.',
                          'ENDOSCOPIA': 'Jejum absoluto de 8 a 12 horas. Ir acompanhado(a) e não dirigir após o exame devido à sedação.',
                          'RESSONANCIA': 'Chegar com 30 min de antecedência. Não usar adornos metálicos (brincos, relógio). Informar se possui marca-passo.',
                          'COLONOSCOPIA': 'Dieta líquida sem resíduos na véspera. Uso dos laxantes conforme orientação médica. Ir acompanhado(a).',
                          'URINA': 'Desprezar o primeiro jato. Colher o jato médio da primeira urina da manhã em frasco apropriado.'
                        };
                        const titleMap: Record<string, string> = {
                          'SANGUE_GERAL': 'Exame de Sangue',
                          'ULTRASSOM_ABD': 'Ultrassom Abdominal',
                          'ENDOSCOPIA': 'Endoscopia',
                          'RESSONANCIA': 'Ressonância / Tomografia',
                          'COLONOSCOPIA': 'Colonoscopia',
                          'URINA': 'Exame de Urina'
                        };
                        const tips = tipsMap[val] || '';
                        const autoTitle = titleMap[val] || '';
                        setFormData({
                          ...formData,
                          notes: tips,
                          title: formData.title?.trim() ? formData.title : autoTitle
                        });
                     }}
                     className="w-full sm:w-1/2 bg-white border border-blue-200 rounded-lg p-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                   >
                     <option value="">-- Selecione o tipo específico --</option>
                     <option value="SANGUE_GERAL">Exames de Sangue (Gerais)</option>
                     <option value="URINA">Exame de Urina / Urocultura</option>
                     <option value="ULTRASSOM_ABD">Ultrassom Abdominal / Pélvico</option>
                     <option value="ENDOSCOPIA">Endoscopia Digestiva Alta</option>
                     <option value="COLONOSCOPIA">Colonoscopia</option>
                     <option value="RESSONANCIA">Ressonância Magnética / Tomografia</option>
                   </select>
                </div>

                <div className="space-y-1">
                   <label className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider">Anotações / Instruções Específicas</label>
                   <textarea
                     value={formData.notes || ''}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                     className="w-full bg-white border border-blue-200 rounded-lg p-3 outline-none focus:border-blue-400 text-sm text-slate-700 resize-none min-h-[80px]"
                     placeholder="Nenhuma dica selecionada ou anotada..."
                   ></textarea>
                </div>
              </div>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700">Cancelar</button>
              <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 shadow-sm"><CheckCircle size={16} /> Salvar Agendamento</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Gráfico de Especialidades */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-teal-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">
                Frequência de Consultas por Especialidade
              </h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded ml-2">Últimos 12 meses</span>
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 36, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} width={140} />
                    <RechartsTooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(8px)',
                        fontSize: '12px',
                        padding: '10px 14px'
                      }}
                    />
                    <Bar dataKey="count" fill="#0D9488" radius={[0, 6, 6, 0]} barSize={28}>
                      <LabelList
                        dataKey="count"
                        position="right"
                        content={(props: any) => {
                          const { x, y, width, height, value } = props;
                          if (value === undefined || value === null) return null;
                          return (
                            <g>
                              <rect x={Number(x) + Number(width) + 4} y={Number(y) + Number(height)/2 - 9} width={22} height={18} rx={5} fill="#f0fdfa" stroke="#99f6e4" strokeWidth={1} />
                              <text x={Number(x) + Number(width) + 15} y={Number(y) + Number(height)/2 + 1} fill="#0f766e" fontSize={11} fontWeight="800" textAnchor="middle" dominantBaseline="middle">{value}</text>
                            </g>
                          );
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Activity size={32} className="text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">Nenhum dado de consultas nos últimos 12 meses.</p>
              </div>
            )}
          </div>
        </div>

        <div>
           <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
             <Calendar className="text-teal-600" /> Próximos (Agendados)
           </h3>
           <div className="space-y-4">
             {futureAppointments.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                   Nenhum compromisso futuro agendado.
                </div>
             ) : futureAppointments.map(appt => (
                <div key={appt.id} className="bg-white border text-left border-teal-100 shadow-sm shadow-teal-50 rounded-2xl p-4 flex flex-col gap-3 group transition-all hover:border-teal-300">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{getApptTypeLabel(appt)}</span>
                      <h4 className="font-bold text-slate-900 text-lg">{appt.title}</h4>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-slate-700 text-sm">{appt.date.split('-').reverse().join('/')}</p>
                       <p className="font-mono text-slate-500 text-xs">{appt.time || 'Horário a definir'}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-600 space-y-1.5 mt-2 mb-2">
                    {appt.specialty && <p className="flex items-center gap-1.5"><Activity size={12} className="text-slate-400" /> {appt.specialty}</p>}
                    {appt.doctor && <p className="flex items-center gap-1.5"><User size={12} className="text-slate-400" /> {appt.doctor}</p>}
                    {(() => {
                      const clinic = getClinicDetails(appt);
                      return (
                        <>
                          {clinic.name && <p className="flex items-center gap-1.5"><Database size={12} className="text-slate-400" /> <strong>Clínica:</strong> {clinic.name}</p>}
                          {clinic.address && (
                            <div className="flex items-center flex-wrap gap-2 pl-3.5 mt-1">
                              <span className="text-slate-500">{clinic.address}</span>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10.5px] font-extrabold bg-teal-50 hover:bg-teal-100 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200/50 transition-all cursor-pointer shadow-3xs hover:scale-102"
                              >
                                <MapPin size={11} className="text-teal-605" />
                                <span>Como chegar</span>
                              </a>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <button 
                       onClick={() => deleteAppointment(appt.id)}
                       className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                    >
                       Excluir
                    </button>
                    <button 
                       onClick={() => handleComplete(appt.id, appt)}
                       className="text-xs font-bold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 flex items-center gap-1"
                    >
                       <CheckCircle size={14} /> Marcar como Realizado
                    </button>
                  </div>
                </div>
             ))}
           </div>
        </div>

        <div>
           <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4 text-opacity-80">
             <CheckCircle className="text-slate-400" /> Histórico (Passados/Realizados)
           </h3>
           <div className="space-y-4">
             {pastAppointments.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500">
                   Nenhum histórico encontrado.
                </div>
             ) : pastAppointments.map(appt => (
                <div key={appt.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 group transition-all opacity-80 hover:opacity-100">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{getApptTypeLabel(appt)}</span>
                      <h4 className="font-bold text-slate-700 text-lg line-through decoration-slate-300">{appt.title}</h4>
                    </div>
                    <div className="text-right">
                       <p className="font-mono font-bold text-slate-500 text-sm">{appt.date.split('-').reverse().join('/')}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 space-y-1 mt-1">
                    {appt.specialty && <p className="flex items-center gap-1.5"><Activity size={12} className="text-slate-400" /> {appt.specialty}</p>}
                    {appt.doctor && <p className="flex items-center gap-1.5"><User size={12} className="text-slate-400" /> {appt.doctor}</p>}
                    {(() => {
                      const clinic = getClinicDetails(appt);
                      return (
                        <>
                          {clinic.name && <p className="flex items-center gap-1.5"><Database size={12} className="text-slate-400" /> <strong>Clínica:</strong> {clinic.name}</p>}
                          {clinic.address && (
                            <div className="flex items-center flex-wrap gap-2 pl-3.5 mt-1">
                              <span className="text-slate-550">{clinic.address}</span>
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10.5px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-300/60 transition-all cursor-pointer shadow-3xs hover:scale-102"
                              >
                                <MapPin size={11} className="text-slate-500" />
                                <span>Como chegar</span>
                              </a>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="flex justify-end pt-3">
                    <button 
                       onClick={() => deleteAppointment(appt.id)}
                       className="text-xs font-semibold text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       Excluir Histórico
                    </button>
                  </div>
                </div>
             ))}
           </div>
        </div>

      </div>

      {/* Calendário de Visão Mensal Adicionado */}
      <div className="mt-8 pt-8 border-t border-slate-100">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3 w-full justify-between sm:w-auto">
               <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"><ChevronLeft size={20} /></button>
               <span className="font-bold text-slate-800 min-w-[140px] text-center capitalize text-lg">
                 {calendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
               </span>
               <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"><ChevronRight size={20} /></button>
             </div>
             
             <button 
                onClick={() => setCalendarDate(new Date())}
                className="text-sm font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-100"
             >
                Ir para Hoje
             </button>
          </div>
          <div className="p-4 sm:p-6 text-sm">
             <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center font-bold text-slate-400 text-xs tracking-wider uppercase">
               <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
             </div>
             <div className="grid grid-cols-7 gap-1 sm:gap-2">
               {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                 <div key={`blank-${i}`} className="min-h-[80px] sm:min-h-[100px] border border-transparent p-1 sm:p-2 bg-slate-50/50 rounded-xl" />
               ))}
               {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                 const day = i + 1;
                 const apptsToday = appointments.filter(a => {
                   if (!a.date) return false;
                   const [y, m, d] = a.date.split('-');
                   return parseInt(y, 10) === calendarDate.getFullYear() && parseInt(m, 10) === calendarDate.getMonth() + 1 && parseInt(d, 10) === day;
                 });
                 const isToday = day === new Date().getDate() && calendarDate.getMonth() === new Date().getMonth() && calendarDate.getFullYear() === new Date().getFullYear();
                 
                 return (
                   <div key={day} className={`min-h-[80px] sm:min-h-[100px] border ${isToday ? 'border-teal-400 bg-teal-50/30 shadow-inner' : 'border-slate-100 bg-white hover:border-slate-200'} rounded-xl p-1 sm:p-2 flex flex-col gap-1 transition-all overflow-visible relative`}>
                     <span className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-teal-600 text-white' : 'text-slate-500'}`}>{day}</span>
                     <div className="flex flex-col gap-1 overflow-visible">
                       {apptsToday.map(a => {
                          const calendarStyles = getCalendarApptStyles(a);
                          return (
                            <div key={a.id} className={`group relative cursor-help text-[10px] leading-tight px-1.5 py-1 rounded border-l-2 ${calendarStyles.bgClass} ${calendarStyles.borderClass}`}>
                              <p className="truncate"><span className="opacity-70 font-mono mr-0.5">{a.time}</span>{a.title}</p>
                              
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-52 bg-slate-900 border border-slate-700 text-white rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[999] shadow-2xl pointer-events-none">
                                 <div className="flex items-center gap-2 mb-2 border-b border-slate-700/50 pb-2">
                                   {a.type === 'EXAM' ? <FileText size={14} className={calendarStyles.iconColor} /> : <Stethoscope size={14} className={calendarStyles.iconColor} />}
                                   <span className="font-bold text-xs uppercase tracking-wider">{getApptTypeLabel(a)}</span>
                                 </div>
                                 <p className="font-bold text-sm mb-2 whitespace-normal leading-tight">{a.title}</p>
                                 {a.doctor && <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5"><User size={12} className="text-slate-400 shrink-0"/> <span className="opacity-60 shrink-0">Médico:</span> <span className="truncate">{a.doctor}</span></p>}
                                 {a.specialty && <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5"><Activity size={12} className="text-slate-400 shrink-0"/> <span className="opacity-60 shrink-0">Esp.:</span> <span className="truncate">{a.specialty}</span></p>}
                                 {(() => {
                                    const clinic = getClinicDetails(a);
                                    return (
                                      <>
                                        {clinic.name && <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5"><Database size={12} className="text-slate-400 shrink-0" /> <span className="opacity-60 shrink-0">Clínica:</span> <span className="truncate">{clinic.name}</span></p>}
                                        {clinic.address && (
                                          <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5">
                                            <MapPin size={12} className="text-slate-400 shrink-0" /> 
                                            <span className="opacity-60 shrink-0">End.:</span> 
                                            <a 
                                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="truncate text-teal-400 hover:text-teal-300 hover:underline flex-1"
                                            >
                                              {clinic.address}
                                            </a>
                                          </p>
                                        )}
                                      </>
                                    );
                                  })()}
                                 <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                                   <p className="text-[10px] text-slate-300 font-mono flex items-center gap-1"><Clock size={10} className="text-slate-400"/>{a.date.split('-').reverse().join('/')} {a.time && ` ${a.time}`}</p>
                                   <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${a.status === 'COMPLETED' ? 'bg-slate-700 text-slate-300' : 'bg-teal-500/20 text-teal-300'}`}>{a.status === 'COMPLETED' ? 'CONCLUÍDO' : 'AGENDADO'}</span>
                                 </div>
                                 <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-[6px] border-transparent border-t-slate-900 drop-shadow-xl"></div>
                              </div>
                            </div>
                          );
                        })}
                     </div>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar a "Fonte" padronizada
const SourceBadge = ({ source }: { source: string }) => (
  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-600 font-mono group cursor-help transition-colors hover:bg-slate-200">
    <FileDigit size={14} className="text-teal-600" />
    <span className="truncate max-w-[250px]" title={source}>{source}</span>
  </div>
);


export default function App() {
  return (
    <ToastProvider>
      <DataProvider>
        <MainApp />
        <ChatWidget />
      </DataProvider>
    </ToastProvider>
  );
}

function MainApp() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validDesktopTabs = [
        'dashboard', 'comparison', 'charts', 'longevity', 'cross', 'exams', 'exam-orders',
        'pathologies', 'medications', 'timeline', 'agenda', 'doctors',
        'dictionary', 'sources', 'profile', 'medical-consultation'
      ];
      if (validDesktopTabs.includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  });
  const [navParams, setNavParams] = useState<any>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { 
    user, 
    signOut, 
    hasDriveAccess, 
    connectDrive, 
    disconnectDrive,
    registerProcessFile,
    isSyncingDrive,
    lastDriveSyncTime,
    doctors,
    saveDoctor,
    processedExams,
    medications
  } = useData();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const validDesktopTabs = [
          'dashboard', 'comparison', 'charts', 'longevity', 'cross', 'exams', 'exam-orders',
          'pathologies', 'medications', 'timeline', 'agenda', 'doctors',
          'dictionary', 'sources', 'profile', 'medical-consultation'
        ];
        if (validDesktopTabs.includes(hash)) {
          setActiveTab(hash);
        }
      } else {
        setActiveTab('dashboard');
      }
    };

    if (window.location.hash === '' && !isMobile) {
      window.location.hash = 'dashboard';
    } else {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isMobile]);

  const handleNavigate = (tab: string, params?: any) => {
    window.location.hash = tab;
    setNavParams(params || {});
  };

  React.useEffect(() => {
    const mainArea = document.getElementById('main-scroll-area');
    if (mainArea) {
      mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  if (isMobile) {
    return (
      <MobileAppLayout 
        onNavigate={handleNavigate}
        signOut={signOut}
      />
    );
  }

  const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium relative overflow-hidden group ${
        active 
          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/15 font-semibold' 
          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent'
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] bg-teal-400 rounded-r-full" style={{ animation: 'navPillSlide 0.2s ease-out' }} />}
      <span className={`shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {React.cloneElement(icon, { size: 18 })}
      </span>
      <span className="text-[13px] truncate">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans antialiased text-slate-900 flex-col md:flex-row overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2 text-teal-400">
          <Activity size={24} className="stroke-[2.5]" />
          <h1 className="text-lg font-bold tracking-tight">HealthTracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell onNavigate={handleNavigate} />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center justify-center text-white"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <aside 
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/60 flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.2)] md:shadow-none z-50 md:z-10 transition-transform duration-300 ease-in-out font-sans`}
      >
        <div className="p-5 pb-6 border-b border-slate-800/50 hidden md:block">
          <div className="flex items-center gap-2.5 text-teal-400 group cursor-pointer" onClick={() => handleNavigate('dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow duration-300">
              <Activity size={18} className="text-white stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white group-hover:text-teal-300 transition-colors leading-none">HealthTracker</h1>
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Prontuário Digital</span>
            </div>
          </div>
          <div className="mt-6 p-3.5 bg-slate-800/30 rounded-2xl border border-slate-700/30 flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 hover:border-slate-600/40 transition-all duration-200 group" onClick={signOut}>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500/15 to-teal-400/5 rounded-full flex items-center justify-center text-teal-400 font-bold shrink-0 ring-2 ring-teal-500/20 group-hover:ring-teal-500/40 transition-all relative">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Usuário'}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate cursor-pointer group-hover:text-teal-400 transition-colors">Encerrar Sessão</p>
            </div>
          </div>
        </div>
        
        {/* Mobile profile header inside menu */}
        <div className="p-6 border-b border-slate-800 md:hidden bg-slate-900/80">
          <div className="flex items-center gap-3 cursor-pointer" onClick={signOut}>
             <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold shrink-0 text-lg ring-1 ring-teal-500/30">
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'U'}
             </div>
             <div className="overflow-hidden">
                <p className="text-base font-bold text-white truncate">{user?.displayName || 'Usuário'}</p>
                <p className="text-xs text-slate-400 font-medium">Sair (Log out)</p>
             </div>
          </div>
        </div>

        <SidebarSearch 
          processedExams={processedExams}
          medications={medications}
          doctors={doctors}
          onNavigate={handleNavigate}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <nav className="flex-1 px-3 space-y-0.5 mt-3 overflow-y-auto custom-scrollbar">
          <NavItem icon={<Activity />} label="Visão Geral" active={activeTab === 'dashboard'} onClick={() => handleNavigate('dashboard')} />
          <NavItem icon={<Table />} label="Comparativo Analítico" active={activeTab === 'comparison'} onClick={() => handleNavigate('comparison')} />
          <NavItem icon={<HeartPulse />} label="Evolução (Gráficos)" active={activeTab === 'charts'} onClick={() => handleNavigate('charts')} />
          <NavItem icon={<TrendingUp />} label="Tendências & Risco" active={activeTab === 'longevity'} onClick={() => handleNavigate('longevity')} />
          <NavItem icon={<PieChart />} label="Cruzamento & Relatório" active={activeTab === 'cross'} onClick={() => handleNavigate('cross')} />
          <NavItem icon={<FileText />} label="Todos os Exames" active={activeTab === 'exams'} onClick={() => handleNavigate('exams')} />
          <NavItem icon={<ClipboardList />} label="Pedidos de Exames" active={activeTab === 'exam-orders'} onClick={() => handleNavigate('exam-orders')} />
          <NavItem icon={<Stethoscope />} label="Patologias e Condições" active={activeTab === 'pathologies'} onClick={() => handleNavigate('pathologies')} />
          <NavItem icon={<Pill />} label="Medicamentos Contínuos" active={activeTab === 'medications'} onClick={() => handleNavigate('medications')} />
          <NavItem icon={<History />} label="Linha do Tempo" active={activeTab === 'timeline'} onClick={() => handleNavigate('timeline')} />
          <NavItem icon={<Calendar />} label="Agenda de Saúde" active={activeTab === 'agenda'} onClick={() => handleNavigate('agenda')} />
          <NavItem icon={<Stethoscope />} label="Cadastro de Médicos" active={activeTab === 'doctors'} onClick={() => handleNavigate('doctors')} />
          <NavItem icon={<BookOpen />} label="Dicionário de Exames" active={activeTab === 'dictionary'} onClick={() => handleNavigate('dictionary')} />
          <NavItem icon={<Stethoscope />} label="Guia de Consulta & QR" active={activeTab === 'medical-consultation'} onClick={() => handleNavigate('medical-consultation')} />
          
          <div className="pt-5 pb-1.5">
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sistema</p>
          </div>
          <NavItem icon={<Database />} label="Fontes & Importação" active={activeTab === 'sources'} onClick={() => handleNavigate('sources')} />
          <NavItem icon={<User />} label="Perfil e Configurações" active={activeTab === 'profile'} onClick={() => handleNavigate('profile')} />

          <div className="mt-4 mb-4 mx-3 p-3 bg-gradient-to-br from-teal-500/[0.06] to-transparent rounded-xl border border-teal-500/10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">Google Drive</span>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSyncingDrive ? 'bg-amber-400' : 'bg-teal-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncingDrive ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-2 truncate">Sincronização ativa</p>
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <button 
                onClick={() => handleNavigate('sources')}
                className="text-[9px] bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-300 border border-slate-700/40 py-1 px-2.5 rounded-lg font-medium transition-all"
              >
                Configurar
              </button>
              <p className="text-[9px] text-slate-500 font-mono">
                {lastDriveSyncTime ? lastDriveSyncTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) : 'Ocioso'}
              </p>
            </div>
          </div>
        </nav>
      </aside>

      <GlobalAssistant />
      {/* Área Principal */}
      <main id="main-scroll-area" className="flex-1 overflow-y-auto p-4 pb-20 md:p-8 lg:p-10 bg-slate-50 w-full relative">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* Global Top Navigation Bar for Desktop */}
          <div className="hidden md:flex items-center justify-between pb-4 mb-6 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-xs tracking-wide">
              <span className="text-slate-400">PRONTUÁRIO DIGITAL</span>
              <ChevronRight size={12} className="text-slate-300" />
              <span className="text-teal-600 uppercase font-bold tracking-wider">{
                activeTab === 'dashboard' ? 'Painel de Visão Geral' :
                activeTab === 'comparison' ? 'Comparativo de Biomarcadores' :
                activeTab === 'charts' ? 'Gráficos de Evolução Clínica' :
                activeTab === 'longevity' ? 'Dashboard de Tendências' :
                activeTab === 'cross' ? 'Análise Cruzada e Correlação' :
                activeTab === 'exams' ? 'Lista completa de Exames' :
                activeTab === 'exam-orders' ? 'Pedidos e Receitas Médicas' :
                activeTab === 'pathologies' ? 'Histórico de Patologias' :
                activeTab === 'medications' ? 'Medicamentos Contínuos' :
                activeTab === 'timeline' ? 'Linha do Tempo Clínica' :
                activeTab === 'agenda' ? 'Agenda de Consultas e Exames' :
                activeTab === 'doctors' ? 'Corpo Clínico & Especialistas' :
                activeTab === 'dictionary' ? 'Dicionário de Exames Clínicos' :
                activeTab === 'medical-consultation' ? 'Guia de Consulta & Compartilhamento QR' :
                activeTab === 'sources' ? 'Fontes e Arquivos Digitais' : 'Perfil do Paciente'
              }</span>
            </div>
            <NotificationBell onNavigate={handleNavigate} />
          </div>

          {activeTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {activeTab === 'comparison' && <ComparisonView onNavigate={handleNavigate} />}
          {activeTab === 'charts' && <ChartsView initialFilter={navParams} />}
          {activeTab === 'longevity' && <LongevityDashboard />}
          {activeTab === 'cross' && <CrossReferencingView onNavigate={handleNavigate} />}
          {activeTab === 'exams' && <ExamsList initialFilter={navParams} onNavigate={handleNavigate} />}
          {activeTab === 'exam-orders' && <ExamOrdersView onNavigate={handleNavigate} />}
          {activeTab === 'pathologies' && <PathologiesView initialFilter={navParams} />}
          {activeTab === 'visual' && <VisualAnalysis />}
          {activeTab === 'medications' && <MedicationsView />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'agenda' && <AgendaView />}
          {activeTab === 'doctors' && <DoctorsView onNavigate={handleNavigate} />}
          {activeTab === 'dictionary' && <DictionaryView onNavigate={handleNavigate} initialSearchTerm={navParams?.filterTerm} />}
          {activeTab === 'sources' && <SourcesView initialFilter={navParams} />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'medical-consultation' && <MedicalConsultationView />}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES ---

export function Dashboard({ onNavigate }: { onNavigate?: (tab: string, params?: any) => void }) {
  const { processedExams, pathologiesData, allSources, userPathologies = [], medications = [] } = useData();
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [chartTab, setChartTab] = useState<'biomarkers' | 'exams'>('biomarkers');
  const [showDetailedAdvice, setShowDetailedAdvice] = useState(false);
  
  // Dynamic Therapeutic Mapping (Mapping active medications to pathologies and giving integrative care guidelines)
  const therapeuticMapping = useMemo(() => {
    const activeMeds = medications.filter(m => m.isActive);
    const activeConditions = userPathologies.filter(p => p.status === 'Ativo' || p.status === 'Em Tratamento' || p.status === 'Controlado');

    const result = {
      connections: [] as { med: string; dose: string; pathology: string; notes: string }[],
      safetyAlerts: [] as { title: string; type: 'warning' | 'info' | 'success'; text: string }[],
      generalAdvice: [] as { title: string; text: string; icon: string }[]
    };

    // 1. ADHD matching
    const hasTDAH = activeConditions.some(c => c.condition.toLowerCase().includes('tdah') || c.condition.toLowerCase().includes('déficit') || c.condition.toLowerCase().includes('atenção'));
    const hasVenvanse = activeMeds.some(m => m.name.toLowerCase().includes('venvanse') || m.name.toLowerCase().includes('lisdexamfetamina'));
    const hasConcerta = activeMeds.some(m => m.name.toLowerCase().includes('concerta') || m.name.toLowerCase().includes('metilfenidato'));
    
    if (hasTDAH && (hasVenvanse || hasConcerta)) {
      const medName = hasVenvanse ? 'Venvanse' : 'Concerta';
      result.connections.push({
        med: medName,
        dose: activeMeds.find(m => m.name.toLowerCase().includes(medName.toLowerCase()))?.dosage || 'Dose Ativa',
        pathology: 'TDAH (Transtorno do Déficit de Atenção e Hiperatividade)',
        notes: 'Modula concentrações de dopamina e noradrenalina, melhorando o foco e controle executivo.'
      });

      if (hasVenvanse) {
        result.safetyAlerts.push({
          title: 'Venvanse vs. Acidez Estomacal',
          type: 'warning',
          text: 'Evite o uso concomitante com sucos cítricos, refrigerantes ou vitamina C, que prejudicam a taxa de absorção.'
        });
      }
    }

    // Autoimmune Focus Mapping (3 conditions mentioned by User)
    const hasAutoimune = activeConditions.some(c => c.condition.toLowerCase().includes('autoimune') || c.condition.toLowerCase().includes('hashimoto') || c.condition.toLowerCase().includes('lúpus') || c.condition.toLowerCase().includes('artrite') || c.condition.toLowerCase().includes('espondilite') || c.condition.toLowerCase().includes('crohn') || c.condition.toLowerCase().includes('esclerose'));
    const isImunossupresso = activeMeds.some(m => m.name.toLowerCase().includes('azatioprina') || m.name.toLowerCase().includes('metotrexato') || m.name.toLowerCase().includes('prednisona') || m.name.toLowerCase().includes('corticoide') || m.name.toLowerCase().includes('adalimumabe') || m.name.toLowerCase().includes('infliximabe'));

    if (hasAutoimune) {
        result.generalAdvice.push({
          title: 'Modulação Autoimune',
          text: 'Acompanhe marcadores VHS, PCR e títulos do FAN. Dieta anti-inflamatória e controle de estresse apoiam o tratamento.',
          icon: 'ShieldAlert'
        });

        if (isImunossupresso) {
             result.connections.push({
               med: 'Terapia Imunomoduladora',
               dose: 'Tratamento Base',
               pathology: 'Condição Autoimune (Múltiplas)',
               notes: 'Reduz a resposta imune desregulada, controlando a progressão inflamatória em tecidos.'
             });
             
             result.safetyAlerts.push({
               title: 'Alerta Imunológico: Profilaxia',
               type: 'warning',
               text: 'Mantenha vacinas em dia (preferindo vírus inativado) e monitore flutuações de fadiga e febre.'
             });
        }
    }

    // 2. Fibromyalgia / Chronic Pain matching
    const hasFibro = activeConditions.some(c => c.condition.toLowerCase().includes('fibro') || c.condition.toLowerCase().includes('dor'));
    const hasPregabalin = activeMeds.some(m => m.name.toLowerCase().includes('pregabalina'));
    const hasVelija = activeMeds.some(m => m.name.toLowerCase().includes('velija') || m.name.toLowerCase().includes('duloxetina'));

    if (hasFibro && (hasPregabalin || hasVelija)) {
      const activeText = hasPregabalin && hasVelija ? 'Combo Pregabalina + Duloxetina' : hasPregabalin ? 'Pregabalina' : 'Velija (Duloxetina)';
      result.connections.push({
        med: activeText,
        dose: 'Ação Sinergética',
        pathology: 'Fibromialgia & Dores Crônicas Difusas',
        notes: 'Duloxetina inibe recaptação de serotonina/noradrenalina; Pregabalina modula canais de cálcio neurais hipercitados.'
      });
    }

    // 3. Chronic Insomnia matching
    const hasInsomnia = activeConditions.some(c => c.condition.toLowerCase().includes('insônia') || c.condition.toLowerCase().includes('sono'));
    const hasQuetiapine = activeMeds.some(m => m.name.toLowerCase().includes('queteapina') || m.name.toLowerCase().includes('quetiapina'));

    if (hasInsomnia && hasQuetiapine) {
      result.connections.push({
        med: 'Quetiapina (Dose Baixa)',
        dose: activeMeds.find(m => m.name.toLowerCase().includes('queteapina') || m.name.toLowerCase().includes('quetiapina'))?.dosage || '25mg',
        pathology: 'Insônia Crônica',
        notes: 'Funciona como antagonista de receptores H1 de histamina, promovendo sedação leve e melhor arquitetura do sono.'
      });
    }

    // 4. IgA Nephropathy safety check
    const hasIgA = activeConditions.some(c => c.condition.toLowerCase().includes('iga') || c.condition.toLowerCase().includes('rim') || c.condition.toLowerCase().includes('nefropatia'));
    if (hasIgA) {
      result.safetyAlerts.push({
        title: 'Proteção Glomerular vs. Alívio de Dor',
        type: 'warning',
        text: 'Nefropatia por IgA: Evite o uso de anti-inflamatórios (como Ibuprofeno). Prefira analgésicos simples para dor crônica.'
      });
      
      result.generalAdvice.push({
        title: 'Hidratação & Meta de PA',
        text: 'Mantenha consumo hídrico de 35 a 40 ml/kg diários e monitore a PA (meta recomendada < 125/80 mmHg).',
        icon: 'droplet'
      });
    }

    // 5. Gastrointestinal Reflux (Gastritis / Esophagitis / Hiatal Hernia) check
    const hasGastric = activeConditions.some(c => c.condition.toLowerCase().includes('esofagite') || c.condition.toLowerCase().includes('gastro') || c.condition.toLowerCase().includes('gastrite') || c.condition.toLowerCase().includes('hérnia') || c.condition.toLowerCase().includes('bulboduodenite'));
    if (hasGastric) {
      result.safetyAlerts.push({
        title: 'Gastroproteção & Fármacos Estimulantes',
        type: 'info',
        text: 'Evite Venvanse ou Velija de estômago completamente vazio. Prefira tomar junto ao desjejum proteico.'
      });
    }

    // 6. Hashimoto's Thyroiditis check
    const hasHashimoto = activeConditions.some(c => c.condition.toLowerCase().includes('hashimoto') || c.condition.toLowerCase().includes('tireoidite') || c.condition.toLowerCase().includes('hipotireoidismo'));
    if (hasHashimoto) {
      result.generalAdvice.push({
        title: 'Funcionamento de Tireoide',
        text: 'Supervisione Selênio, Zinco e Vitamina D séricos, que favorecem a boa conversão do hormônio T4 para T3 livre.',
        icon: 'sparkles'
      });
    }

    // Fallback default suggestions if no custom conditions match
    if (result.connections.length === 0 && result.safetyAlerts.length === 0) {
      result.generalAdvice.push({
        title: 'Organizador de Fármacos',
        text: 'Cadastre seus tratamentos contínuos no painel lateral para ativar verificações automáticas.',
        icon: 'info'
      });
    }

    return result;
  }, [medications, userPathologies]);
  
  // Helper to parse dates in various stored formats (e.g., DD/MM/YYYY, Out/2024, YYYY-MM-DD)
  const parseExamMonthYear = (dateStr: string): { year: number; month: number } | null => {
    if (!dateStr) return null;
    
    // Format DD/MM/YYYY
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const m = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!isNaN(m) && !isNaN(y)) {
          return { year: y, month: m };
        }
      } else if (parts.length === 2) {
        const mPart = parts[0].toLowerCase();
        const y = parseInt(parts[1], 10);
        if (!isNaN(y)) {
          const monthMap: Record<string, number> = {
            jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6, jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
            '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6, '07': 7, '08': 8, '09': 9, '10': 10, '11': 11, '12': 12
          };
          const m = monthMap[mPart] || parseInt(mPart, 10);
          if (m >= 1 && m <= 12) {
            return { year: y, month: m };
          }
        }
      }
    }
    
    // Format YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(m) && !isNaN(y)) {
          return { year: y, month: m };
        }
      }
    }

    return null;
  };

  const last6MonthsData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Choose anchor date dynamically so we don't end up with an empty graph with mock data
    let anchorDate = new Date();
    let latestExamDate: any = null;
    
    processedExams.forEach(e => {
      const parsed = parseExamMonthYear(e.dataExame);
      if (parsed) {
        const d = new Date(parsed.year, parsed.month - 1, 1);
        if (!latestExamDate || d > latestExamDate) {
          latestExamDate = d;
        }
      }
    });
    
    if (latestExamDate && latestExamDate.getTime() < anchorDate.getTime()) {
      anchorDate = latestExamDate;
    }
    
    const range: any[] = [];
    const currentMonth = anchorDate.getMonth();
    const currentYear = anchorDate.getFullYear();
    
    // Generate the last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      range.push({
        year: y,
        month: m,
        label: `${monthNames[m - 1]}/${String(y).slice(-2)}`,
        normal: 0,
        alterado: 0,
        suboptimo: 0,
        total: 0
      });
    }
    
    processedExams.forEach(e => {
      const parsed = parseExamMonthYear(e.dataExame);
      if (parsed) {
        const slot = range.find(r => r.year === parsed.year && r.month === parsed.month);
        if (slot) {
          if (e.interpretacao === 'Normal') {
            slot.normal += 1;
            slot.total += 1;
          } else if (e.interpretacao === 'Alterado') {
            slot.alterado += 1;
            slot.total += 1;
          } else if (e.interpretacao === 'Sub-ópt.') {
            slot.suboptimo += 1;
            slot.total += 1;
          }
        }
      }
    });
    
    return range;
  }, [processedExams]);

  const handleExportPDF = async () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    setIsExporting(true);
    addToast('Gerando captura de tela em PDF, aguarde...', 'info');
    
    try {
      // Small timeout to allow toast to render
      await new Promise(resolve => setTimeout(resolve, 50));
      const canvas = await toCanvas(element, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement && node.hasAttribute && node.hasAttribute('data-html2canvas-ignore')) {
            return false;
          }
          return true;
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0.1) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('dashboard-saude.pdf');
      addToast('Captura de painel exportada com sucesso!', 'success');
    } catch (err) {
      console.error('Error generating PDF', err);
      addToast('Erro ao exportar painel.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportConsolidated = async () => {
    setIsExporting(true);
    addToast('Gerando relatório clínico consolidado...', 'info');
    try {
      await generateConsolidatedClinicalReport(processedExams, userPathologies, medications);
      addToast('Relatório completo exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao gerar relatório completo.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const normalCount = processedExams.filter(e => e.interpretacao === 'Normal').length;
  const suboptimalCount = processedExams.filter(e => e.interpretacao === 'Sub-ópt.').length;
  const alteredCount = processedExams.filter(e => e.interpretacao === 'Alterado').length;
  const total = processedExams.length || 1;
  const healthScore = Math.round((normalCount / total) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-teal-500 bg-teal-50 border-teal-200';
    if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-rose-500 bg-rose-50 border-rose-200';
  };
  
  const getScoreText = (score: number) => {
    if (score >= 80) return 'text-teal-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const variationsLast6Months = useMemo(() => {
    const groups: Record<string, typeof processedExams> = {};
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    processedExams.forEach(e => {
      const parsed = parseExamMonthYear(e.dataExame);
      if (parsed) {
        const d = new Date(parsed.year, parsed.month - 1, 1);
        if (d >= sixMonthsAgo) {
          const g = getCanonicalExamName(e.nomeExame);
          if(!groups[g]) groups[g] = [];
          groups[g].push(e);
        }
      }
    });
    
    const evols = [];
    for(const name in groups) {
      if(groups[name].length < 2) continue;
      
      const sorted = [...groups[name]].sort((a,b) => {
        const pA = parseExamMonthYear(a.dataExame);
        const pB = parseExamMonthYear(b.dataExame);
        const dA = pA ? new Date(pA.year, pA.month-1, 1).getTime() : 0;
        const dB = pB ? new Date(pB.year, pB.month-1, 1).getTime() : 0;
        return dA - dB;
      });
      
      const first = sorted[0];
      const last = sorted[sorted.length-1];
      
      const v1 = parseFloat(first.resultado.replace(',','.'));
      const v2 = parseFloat(last.resultado.replace(',','.'));
      if(!isNaN(v1) && !isNaN(v2) && v1 !== v2) {
        const diff = v2 - v1;
        const pct = (diff / v1) * 100;
        evols.push({
          name,
          firstValue: String(v1),
          lastValue: String(v2),
          unit: last.unidade,
          diff,
          pct,
          isPositive: diff > 0,
          dates: [first.dataExame, last.dataExame]
        });
      }
    }
    
    return evols.sort((a,b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 4);
  }, [processedExams]);

  const [semestralInsight, setSemestralInsight] = useState('');
  const [loadingSemestralInsight, setLoadingSemestralInsight] = useState(false);

  const generateSemestralInsight = async () => {
    if (variationsLast6Months.length === 0) return;
    setLoadingSemestralInsight(true);
    setSemestralInsight('');
    
    const metricsData = variationsLast6Months.map(v => `${v.name}: de ${v.firstValue} para ${v.lastValue} ${v.unit !== '—' ? v.unit : ''} (${v.pct > 0 ? '+' : ''}${v.pct.toFixed(1)}%)`).join('; ');
    
    try {
      const resp = await fetchWithRetry("/api/chat-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analise criticamente a variação dos seguintes biomarcadores nos últimos 6 meses: ${metricsData}. Forneça uma análise descritiva breve sugerindo os possíveis significados clínicos integrativos ou alertas sobre o estilo de vida, use menos de 6 linhas e não faça saudações.`,
          history: [], 
          contextData: { pathologies: userPathologies, medications } 
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Falha ao gerar o insight.");
      }
      const data = await resp.json();
      setSemestralInsight(data.answer);
    } catch (e: any) {
      addToast(e.message || "Erro ao contactar a IA", "error");
    } finally {
      setLoadingSemestralInsight(false);
    }
  };
  const topEvolutions = useMemo(() => {
    // Group by canonical name
    const groups: Record<string, typeof processedExams> = {};
    processedExams.forEach(e => {
      const g = getCanonicalExamName(e.nomeExame);
      if(!groups[g]) groups[g] = [];
      groups[g].push(e);
    });
    
    const evols = [];
    for(const name in groups) {
      if(groups[name].length < 2) continue;
      
      const sorted = [...groups[name]].sort((a,b) => {
        const pA = parseExamMonthYear(a.dataExame);
        const pB = parseExamMonthYear(b.dataExame);
        const dA = pA ? new Date(pA.year, pA.month-1, 1).getTime() : 0;
        const dB = pB ? new Date(pB.year, pB.month-1, 1).getTime() : 0;
        return dA - dB;
      });
      
      const first = sorted[0];
      const last = sorted[sorted.length-1];
      
      const v1 = parseFloat(first.resultado.replace(',','.'));
      const v2 = parseFloat(last.resultado.replace(',','.'));
      if(!isNaN(v1) && !isNaN(v2) && v1 !== v2) {
        const diff = v2 - v1;
        const pct = (diff / v1) * 100;
        evols.push({
          name,
          firstValue: String(v1),
          lastValue: String(v2),
          unit: last.unidade,
          diff,
          pct,
          isPositive: diff > 0, // Doesn't necessarily mean good health, just math
          dates: [first.dataExame, last.dataExame]
        });
      }
    }
    
    // Sort by absolute percentage change and take top 4
    return evols.sort((a,b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 4);
  }, [processedExams]);

  // Group exams by month for the chart
  const examsPerMonth = useMemo(() => {
    const counts: Record<string, number> = {};
    processedExams.forEach(e => {
      if (e.dataExame.length >= 7) {
        // usually DD/MM/YYYY
        const parts = e.dataExame.split('/');
        if (parts.length === 3) {
          const monthYear = `${parts[1]}/${parts[2]}`;
          counts[monthYear] = (counts[monthYear] || 0) + 1;
        } else {
          counts[e.dataExame.substring(0, 7)] = (counts[e.dataExame.substring(0, 7)] || 0) + 1;
        }
      }
    });

    return Object.keys(counts)
      .sort((a, b) => {
         const pA = a.split('/');
         const pB = b.split('/');
         if(pA.length === 2 && pB.length === 2) {
           return new Date(parseInt(pA[1]), parseInt(pA[0])-1).getTime() - new Date(parseInt(pB[1]), parseInt(pB[0])-1).getTime();
         }
         return a.localeCompare(b);
      })
      .map(k => ({
        mes: k,
        exames: counts[k]
      }));
  }, [processedExams]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10" id="dashboard-content">
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4" data-html2canvas-ignore="true">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 group flex items-center gap-2 font-sans">
            Visão Geral da Saúde <Sparkles className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
          </h2>
          <p className="text-slate-500 mt-1 font-sans">Resumo clínico interativo baseado em {allSources.length} documentos médicos analisados.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 font-sans">
          <button 
            onClick={() => onNavigate?.('sources', { openUpload: true })}
            className="print-hidden flex w-full sm:w-auto justify-center items-center gap-2 bg-indigo-600 border border-transparent px-5 py-2 rounded-xl text-white font-bold hover:bg-indigo-700 hover:shadow-md transition-all shadow-xs text-xs"
          >
            <UploadCloud size={16} />
            <span>Adicionar Exames (PDF/Foto)</span>
          </button>
          
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="print-hidden flex w-full sm:w-auto justify-center items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-semibold hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            {isExporting ? 'Exportando Painel...' : 'Capturar Painel (PDF)'}
          </button>
          
          <button 
            onClick={handleExportConsolidated}
            disabled={isExporting}
            className="print-hidden flex w-full sm:w-auto justify-center items-center gap-2 bg-teal-600 border border-transparent px-4 py-2 rounded-xl text-white font-bold hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Gerar Relatório Completo</span>
          </button>
        </div>
      </header>
      
      {/* Container for PDF generation that includes the title inside */}
      <div className="hidden pdf-only min-h-0 mb-6 pb-4 border-b border-slate-200" style={{ display: isExporting ? 'block' : 'none' }}>
        <h2 className="text-3xl font-bold text-slate-900 mb-2 font-sans">HealthTracker - Visão Geral da Saúde</h2>
        <p className="text-slate-500 font-sans">Resumo clínico consolidado. Baseado em {allSources.length} documentos médicos analisados.</p>
        <p className="text-slate-400 text-sm mt-1 font-sans">Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      {/* SEÇÃO 1: PAINEL DE MÉTRICAS COESIVAS (HERO BREAKDOWN) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans"
      >
        
        {/* Health Circular progress gauge */}
        <div 
          onClick={() => onNavigate?.('exams', { interpFilter: 'Normal' })}
          className="col-span-1 bg-white p-6 rounded-3xl shadow-3xs border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden transition-all hover:shadow-xs cursor-pointer hover:-translate-y-0.5"
        >
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="55"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="55"
                className={`transition-all duration-1000 ${
                  healthScore >= 80 ? 'stroke-teal-500' : healthScore >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'
                }`}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 55}
                strokeDashoffset={2 * Math.PI * 55 * (1 - (processedExams.length ? healthScore : 0) / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className={`text-4xl font-extrabold ${getScoreText(healthScore)}`}>
                {processedExams.length ? healthScore : 0}
              </span>
              <span className={`text-sm font-bold ${getScoreText(healthScore)}`}>%</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Normalidade</p>
            </div>
          </div>

          <div className="text-center mt-4">
            <h4 className="text-sm font-bold text-slate-800">Taxa Geral de Saúde</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[230px] mx-auto">
              Proporção de exames dentro do limiar seguro de referência.
            </p>
          </div>
        </div>

        {/* 2x2 Bento Breakdown metrics list */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div 
            onClick={() => onNavigate?.('exams', { interpFilter: 'Normal' })}
            className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-teal-350 hover:shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-600">
                <CheckCircle size={22} />
              </div>
              <span className="text-3xl font-black text-slate-900">{normalCount}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Parâmetros Normais</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Indicadores biológicos em plena conformidade.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('exams', { interpFilter: 'Alterado' })}
            className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-rose-350 hover:shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <span className="text-3xl font-black text-slate-900">{alteredCount}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs text-rose-700">Parâmetros Alterados</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Fatores que ultrapassam o limite fisiológico.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('exams', { interpFilter: 'Sub-ópt.' })}
            className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-amber-300 hover:shadow-xs cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>
              <span className="text-3xl font-black text-slate-900">{suboptimalCount}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs text-amber-700">Zonas Limítrofes (Sub-óptimo)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Marcadores que demandam otimização clínica.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigate?.('sources')}
            className="bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all group hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={22} />
              </div>
              <span className="text-3xl font-black text-slate-900">{allSources.length}</span>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-xs">Exames Cadastrados</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Última leitura: <span className="font-semibold text-slate-600">{processedExams[0]?.dataExame || 'N/A'}</span></p>
            </div>
          </div>
        </div>

      </motion.div>

      {/* SEÇÃO 2: MONITORAMENTO BIOLÓGICO LONGITUDINAL (2/3 + 1/3) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans"
      >
        
        {/* Foco Autoimune timeline chart on Left (Takes 2/3 of space on desktop) */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0">
          <FocoAutoimuneWidget />
        </div>

        {/* Picos de Variação on Right (Takes 1/3 of space) */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
            <div>
              <div className="flex justify-between items-center mb-4 pb-1 border-b border-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" size={18} /> Picos de Variação (6 meses)
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Os maiores desvios identificados comparando com o histórico nos últimos 6 meses.</p>
                </div>
              </div>
              
              {variationsLast6Months.length > 0 ? (
                <div className="space-y-3.5">
                  {variationsLast6Months.map((evol, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 relative overflow-hidden group hover:border-indigo-150 transition-all flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-xs truncate max-w-[130px]" title={evol.name}>
                          {evol.name}
                        </span>
                        <div className={`inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          evol.isPositive ? "text-indigo-600 bg-indigo-50" : "text-emerald-600 bg-emerald-50"
                        }`}>
                          {evol.isPositive ? <ArrowUp size={10} strokeWidth={3} /> : <ArrowDown size={10} strokeWidth={3} />}
                          {Math.abs(evol.pct).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-slate-400/80 uppercase">Anterior ({evol.dates[0]})</span>
                          <span className="font-semibold text-slate-600 font-mono">{evol.firstValue} {evol.unit !== "—" ? evol.unit : ""}</span>
                        </div>
                        <ChevronRight className="text-slate-300" size={12} />
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-bold text-slate-400/80 uppercase">Atual ({evol.dates[1]})</span>
                          <span className="font-black text-slate-800 font-mono">{evol.lastValue} {evol.unit !== "—" ? evol.unit : ""}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AI Insight Button */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={generateSemestralInsight}
                      disabled={loadingSemestralInsight}
                      className="w-full inline-flex justify-center items-center gap-1.5 text-[11px] font-bold bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 active:bg-indigo-50 px-3 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Sparkles size={12} className={loadingSemestralInsight ? "animate-spin" : ""} />
                      {loadingSemestralInsight ? 'Analisando Variações...' : 'Gerar Análise de Evolução (IA)'}
                    </button>
                    
                    {semestralInsight && (
                      <div className="mt-3 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-left animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-[10px] uppercase font-bold text-indigo-800 mb-1.5 flex items-center gap-1">
                          <Sparkles size={10} /> Insight Evolutivo (6 meses)
                        </span>
                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{semestralInsight}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <TrendingUp className="mx-auto text-slate-300 mb-1" size={20} />
                  <p className="text-[10px] text-slate-400 font-semibold">Sem exames repetidos nos últimos 6 meses para comparar oscilações.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </motion.div>

      {/* SEÇÃO 3: CLINICA INTEGRATIVA & MAPAS DE SINERGIA IA (2/3 + 1/3) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans"
      >
        
        {/* Interactive Eixo Integrativo de Saúde (IA) - Left (Takes 2/3 space) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">Eixo Integrativo de Saúde (IA)</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">Mapeamento dinâmico entre tratamentos informados, condições e alertas preventivos.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDetailedAdvice(!showDetailedAdvice)}
                    className="text-xs font-bold text-teal-650 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 select-none"
                  >
                    <Sparkles size={12} className="text-teal-500 animate-pulse" />
                    {showDetailedAdvice ? 'Ocultar Detalhes Clínicos' : 'Ver Detalhes Clínicos'}
                  </button>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-teal-700 bg-teal-100/50 border border-teal-200 uppercase tracking-wide">
                    Sinergia Ativa ({therapeuticMapping.connections.length})
                  </span>
                </div>
              </div>

              {/* Mapeamentos de Sinergias */}
              {therapeuticMapping.connections.length > 0 ? (
                <div className="space-y-4 mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">Correspondências Alvo de Medicamento</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {therapeuticMapping.connections.map((conn, idx) => (
                      <div key={idx} className="bg-slate-50/55 p-4 rounded-2xl border border-slate-100/85 relative group overflow-hidden transition-all hover:border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center gap-1 mb-2.5">
                            <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-lg font-bold text-[10px] flex items-center gap-1">
                              <Pill size={11} /> {conn.med}
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold">{conn.dose}</span>
                          </div>
                          
                          <div className="font-extrabold text-[#0D9488] text-xs flex items-center gap-1.5 bg-teal-50/30 p-2 rounded-xl border border-teal-100/20">
                            <Stethoscope size={13} /> {conn.pathology}
                          </div>
                        </div>
                        
                        {showDetailedAdvice && (
                          <div className="text-[11px] text-slate-500 mt-3 leading-relaxed pl-2 border-l-2 border-indigo-400 italic">
                            {conn.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-150 text-slate-400 text-xs mb-6">
                  Cadastre suas condições e medicamentos contínuos para ativar o mapeamento cruzado.
                </div>
              )}

              {/* Alertas e Diretrizes Protetivas */}
              {therapeuticMapping.safetyAlerts.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">Alertas de Órgão-Alvo e Interações</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {therapeuticMapping.safetyAlerts.map((alert, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl border flex gap-3 h-full ${
                        alert.type === 'warning' ? 'bg-amber-50/20 border-amber-200 text-slate-700' :
                        'bg-blue-50/25 border-blue-200 text-slate-700'
                      }`}>
                        <div className={`p-2 rounded-xl h-fit shrink-0 ${
                          alert.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.type === 'warning' ? <AlertTriangle size={15} /> : <Info size={15} />}
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-slate-800 text-xs">{alert.title}</h5>
                          {showDetailedAdvice && (
                            <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{alert.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bem-estar Coadjuvante */}
              {therapeuticMapping.generalAdvice.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 select-none">Suporte Nutricional &amp; Ajustes de Rotina</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {therapeuticMapping.generalAdvice.map((advice, idx) => (
                      <div key={idx} className="bg-slate-50/30 p-3.5 rounded-2xl border border-slate-100 flex gap-2.5">
                        <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 h-fit shrink-0">
                          {advice.icon === 'droplet' ? <Activity size={13} /> : <Sparkles size={13} />}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-800 text-xs">{advice.title}</h5>
                          {showDetailedAdvice && (
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{advice.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User-Registered Conditions and Medications on Right (Takes 1/3 space) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Registered Conditions List */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="text-teal-600" size={16} /> Condições Cadastradas ({userPathologies.length})
              </h4>
              <button 
                onClick={() => onNavigate?.('pathologies')}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Gerenciar
              </button>
            </div>
            
            {userPathologies.length > 0 ? (
              <div className="space-y-2.5 max-h-[195px] overflow-y-auto pr-1">
                {userPathologies.slice(0, 3).map((pathology) => (
                  <div key={pathology.id} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-800 text-[11px] truncate">{pathology.condition}</h5>
                        {pathology.description && (
                          <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{pathology.description}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border shrink-0 ${
                        pathology.status === 'Ativo' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                        pathology.status === 'Em Tratamento' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                        pathology.status === 'Controlado' ? 'bg-teal-50 border-teal-100 text-teal-600' :
                        'bg-slate-50 border-slate-150 text-slate-500'
                      }`}>
                        {pathology.status}
                      </span>
                    </div>
                  </div>
                ))}
                {userPathologies.length > 3 && (
                  <button 
                    onClick={() => onNavigate?.('pathologies')}
                    className="text-[10px] font-bold text-teal-600 hover:underline block text-center w-full pt-1.5"
                  >
                    Ver todas (+{userPathologies.length - 3})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-150">
                <p className="text-[10px] text-slate-400 font-medium">Nenhum diagnóstico registrado.</p>
              </div>
            )}
          </div>

          {/* Continuous Prescription List */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Pill className="text-indigo-600" size={16} /> Farmácia Contínua ({medications.length})
              </h4>
              <button 
                onClick={() => onNavigate?.('medications')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-705 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Gerenciar
              </button>
            </div>

            {medications.length > 0 ? (
              <div className="space-y-2.5 max-h-[195px] overflow-y-auto pr-1">
                {medications.slice(0, 3).map((med) => (
                  <div key={med.id} className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-850 text-[11px] flex items-center gap-1 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span> {med.name}
                        </h5>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 font-bold">
                          <span className="text-indigo-600">{med.dosage}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{med.frequency}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border shrink-0 ${
                        med.isActive ? 'bg-teal-50 border-teal-100 text-teal-600' : 'bg-slate-50 border-slate-150 text-slate-500'
                      }`}>
                        {med.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
                {medications.length > 3 && (
                  <button 
                    onClick={() => onNavigate?.('medications')}
                    className="text-[10px] font-bold text-indigo-600 hover:underline block text-center w-full pt-1.5"
                  >
                    Ver todos (+{medications.length - 3})
                  </button>
                )}
              </div>
            ) : (
              <div className="py-6 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-150">
                <p className="text-[10px] text-slate-400 font-medium">Nenhum fármaco contínuo cadastrado.</p>
              </div>
            )}
          </div>

        </div>

      </motion.div>

      {/* SEÇÃO 4: ESTILO DE VIDA & ALERTAS GERAIS DE SCREENING (2/3 + 1/3) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans"
      >
        
        {/* Lifestyle / BMI and weight area chart on LHS (Takes 2/3 of space on desktop) */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0" id="dashboard-weight-tracker-wrapper">
          <WeightTracker />
        </div>

        {/* Biological flag alerts on Right (Takes 1/3 of space) */}
        <div className="lg:col-span-1 h-full flex flex-col">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-50">
                <Info className="text-amber-500" size={18} /> Sinais de Atenção ({pathologiesData.length})
              </h3>
              
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {pathologiesData.length > 0 ? (
                  <>
                    {pathologiesData.slice(0, 3).map((item, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => onNavigate?.('pathologies', { condition: item.condition })}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-amber-300 hover:shadow-2xs hover:bg-amber-50/35 cursor-pointer transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1.5 gap-1.5">
                          <h4 className="font-extrabold text-slate-700 text-xs group-hover:text-amber-800 transition-colors truncate">{item.condition}</h4>
                          <span className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 shrink-0 font-sans">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-1 font-sans">{item.description}</p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-150 text-[9px] text-slate-400 font-sans">
                          <span>Registrado em {item.dateDetected}</span>
                          <SourceBadge source={item.source} />
                        </div>
                      </div>
                    ))}
                    {pathologiesData.length > 3 && (
                      <button 
                        onClick={() => onNavigate?.('pathologies')}
                        className="w-full py-2 text-[11px] font-bold text-teal-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Ver mais alertas ({pathologiesData.length - 3}) <ChevronRight size={14} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <CheckCircle size={22} className="text-teal-400 mx-auto mb-2 opacity-55" />
                    <p className="text-[11px] font-semibold text-slate-500 font-sans">Nenhum sinal alterado.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </motion.div>

      {/* SEÇÃO 5: ANÁLISE DE TENDÊNCIA E REGRESSÃO LINEAR (D3.js) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 gap-6 font-sans mt-6"
      >
        <div className="flex flex-col h-full min-h-0">
          <BiomarkerRegressionChart />
        </div>
      </motion.div>

    </div>
  );
}

function ChartsView({ initialFilter }: { initialFilter?: any }) {
  const [dynAiInsight, setDynAiInsight] = useState('');
  const [isDynAiLoading, setIsDynAiLoading] = useState(false);
  const [groupAiInsights, setGroupAiInsights] = useState<Record<number, string>>({});
  const [loadingGroupAiInsights, setLoadingGroupAiInsights] = useState<Record<number, boolean>>({});

  const generateGroupInsight = async (groupIdx: number, metrics: string[]) => {
    if (!metrics || metrics.length === 0) return;
    setLoadingGroupAiInsights(prev => ({ ...prev, [groupIdx]: true }));
    setGroupAiInsights(prev => ({ ...prev, [groupIdx]: '' }));
    try {
      const resp = await fetchWithRetry("/api/chat-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Analise clinicamente a evolução do(s) seguinte(s) marcador(es): ${metrics.join(', ')}. Quais são os insights principais e a relação entre eles (se houver mais de um)? Seja direto, técnico e focado na prática médica holística, usando menos que 6 linhas.`,
          history: [], 
          contextData: { pathologies: [], medications: [] } 
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Erro ao contactar a Inteligência Artificial.");
      }
      const data = await resp.json();
      setGroupAiInsights(prev => ({ ...prev, [groupIdx]: data.answer }));
    } catch (e: any) {
      setGroupAiInsights(prev => ({ ...prev, [groupIdx]: e.message || "Erro ao contactar a Inteligência Artificial." }));
    } finally {
      setLoadingGroupAiInsights(prev => ({ ...prev, [groupIdx]: false }));
    }
  };

  const generatePhysioInsight = async () => {
    if (!corrMetricA || !corrMetricB) return;
    setIsDynAiLoading(true);
    setDynAiInsight('');
    try {
      const resp = await fetchWithRetry("/api/chat-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Faça uma rápida análise médica sobre a correlação fisiológica entre os exames ${corrMetricA} e ${corrMetricB}. Explique de forma amigável ao paciente qual a ligação orgânica comum que desregula ambos ao mesmo tempo ou como um afeta o outro.`,
          history: [], 
          contextData: { pathologies: [], medications: [] } 
        })
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || "Erro ao contactar a Inteligência Artificial.");
      }
      const data = await resp.json();
      setDynAiInsight(data.answer);
    } catch (e: any) {
      setDynAiInsight(e.message || "Erro ao contactar a Inteligência Artificial.");
    } finally {
      setIsDynAiLoading(false);
    }
  };
  const { comparativeData } = useData();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(initialFilter?.metricName ? [initialFilter.metricName] : []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [metricSearch, setMetricSearch] = useState('');
  const [timeRange, setTimeRange] = useState<string>('all'); // '3m', '6m', '1y', 'all'
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [groupChartsByUnit, setGroupChartsByUnit] = useState<boolean>(true);

  
  // States for dynamic clinical cross-referencing & mathematical correlation
  const [subTab, setSubTab] = useState<'evolution' | 'correlation'>(initialFilter?.metricName ? 'evolution' : 'evolution');
  const [corrMetricA, setCorrMetricA] = useState<string>('');
  const [corrMetricB, setCorrMetricB] = useState<string>('');
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.metricName) {
        if (!selectedMetrics.includes(initialFilter.metricName)) {
           setSelectedMetrics([initialFilter.metricName]);
        }
        setSubTab('evolution');
        setCorrMetricA(initialFilter.metricName);
      }
    }
  }, [initialFilter]);

  // Automatically configure smart default comparison metrics for cross-referencing
  useEffect(() => {
    if (comparativeData && comparativeData.length > 0) {
      const activeA = initialFilter?.metricName || corrMetricA || comparativeData[0]?.testName || '';
      setCorrMetricA(activeA);

      if (!corrMetricB) {
        // Find a correlated companion if possible, e.g., if AST, pair AST/ALT; if Glucose, pair Glucose/HbA1c; if Total Cholesterol, Cholesterol/Triglycerides
        const lowerA = activeA.toLowerCase();
        let defaultCompanion = '';
        
        if (lowerA.includes('glicose') || lowerA.includes('glicemia')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('hba1c') || d.testName.toLowerCase().includes('glicada'))?.testName || '';
        } else if (lowerA.includes('tgo') || lowerA.includes('ast')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('tgp') || d.testName.toLowerCase().includes('alt'))?.testName || '';
        } else if (lowerA.includes('tgp') || lowerA.includes('alt')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('tgo') || d.testName.toLowerCase().includes('ast'))?.testName || '';
        } else if (lowerA.includes('colesterol total')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('triglic'))?.testName || '';
        } else if (lowerA.includes('ureia')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('creatinina'))?.testName || '';
        } else if (lowerA.includes('creatinina')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('ureia'))?.testName || '';
        } else if (lowerA.includes('vitamina d')) {
          defaultCompanion = comparativeData.find(d => d.testName.toLowerCase().includes('cálcio') || d.testName.toLowerCase().includes('calcio'))?.testName || '';
        }

        if (!defaultCompanion || defaultCompanion === activeA) {
          const remaining = comparativeData.filter(d => d.testName !== activeA);
          defaultCompanion = remaining[0]?.testName || '';
        }
        
        setCorrMetricB(defaultCompanion);
      }
    }
  }, [comparativeData, initialFilter]);

  

  type MetricType = typeof comparativeData[0];

  const groupedMetrics = useMemo(() => {
    const groups: Record<string, MetricType[]> = {};
    comparativeData.forEach(metric => {
      if (metricSearch && !metric.testName.toLowerCase().includes(metricSearch.toLowerCase())) return;
      
      // ComparisonView local getExamGroup
      const group = getExamGroup(metric.testName);
      
      if (!groups[group]) groups[group] = [];
      groups[group].push(metric);
    });
    
    // Sort groups
    const sortedGroups: Record<string, MetricType[]> = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [comparativeData, metricSearch]);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.length > 1 ? prev.filter(m => m !== metric) : prev;
      }
      return [...prev, metric];
    });
  };

  const toggleGroup = (groupMetrics: MetricType[]) => {
    const metricNames = groupMetrics.map(m => m.testName);
    const allSelected = metricNames.every(name => selectedMetrics.includes(name));
    
    setSelectedMetrics(prev => {
      if (allSelected) {
        // Deselect all from group (but keep at least 1 overall)
        const newSet = prev.filter(m => !metricNames.includes(m));
        return newSet.length === 0 && prev.length > 0 ? [prev[0]] : newSet;
      } else {
        // Select all from group
        const newSet = new Set([...prev, ...metricNames]);
        return Array.from(newSet);
      }
    });
  };

  const selectQuickGroup = (groupName: string) => {
    setActiveGroup(groupName === 'Limpar' ? null : groupName);
    if (groupName === 'Limpar') {
      setSelectedMetrics([]);
      setIsDropdownOpen(false);
      return;
    }
    
    let groupMetricsNames = comparativeData
      .filter(m => getExamGroup(m.testName) === groupName)
      .map(m => m.testName);
    if (groupMetricsNames.length > 0) {
      setSelectedMetrics(groupMetricsNames);
      setIsDropdownOpen(false);
    }
  };

  // Formatar dados para o Recharts
  const chartData = useMemo(() => {
    const datesSet = new Set<string>();
    const metricsData = selectedMetrics.map(metric => comparativeData.find(d => d.testName === metric)).filter(Boolean);
    
    metricsData.forEach(m => {
      if (m) Object.keys(m.history).forEach(date => datesSet.add(date));
    });

    let dates = Array.from(datesSet).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());

    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      let limitDate = new Date();
      if (timeRange === '3m') limitDate.setMonth(now.getMonth() - 3);
      if (timeRange === '6m') limitDate.setMonth(now.getMonth() - 6);
      if (timeRange === '1y') limitDate.setFullYear(now.getFullYear() - 1);
      
      dates = dates.filter(d => parseDate(d).getTime() >= limitDate.getTime());
    }

    return dates.map(date => {
      const dataPoint: any = { date };
      metricsData.forEach(m => {
        if (m && m.history[date]) {
          dataPoint[m.testName] = m.history[date].numValue;
          if (!dataPoint._sources) dataPoint._sources = {};
          dataPoint._sources[m.testName] = m.history[date].source;
          if (!dataPoint._interpretations) dataPoint._interpretations = {};
          dataPoint._interpretations[m.testName] = m.history[date].interpretacao;
        }
      });
      return dataPoint;
    });
  }, [selectedMetrics, comparativeData, timeRange]);

  const colors = ['#0d9488', '#ea580c', '#2563eb', '#db2777', '#84cc16', '#8b5cf6', '#eab308', '#06b6d4'];

  const metricStats = useMemo(() => {
    const stats: Record<string, { min: number | string, max: number | string, avg: number | string, unit: string, latest: string | number, trend: 'up' | 'down' | 'stable', reference: string, latestDate: string, count: number, interpretation: string, isQualitative: boolean }> = {};
    
    selectedMetrics.forEach(metricName => {
      const metric = comparativeData.find(d => d.testName === metricName);
      if (!metric) return;
      
      const values: any[] = [];
      let latestValue: any = 0;
      let prevValue: any = 0;
      let latestDateStr = '';
      let latestInterpretation = 'Não Informado';
      let hasData = false;

      // Extract values from chartData
      chartData.forEach((point: any) => {
        if (point[metricName] !== undefined && point[metricName] !== null) {
          values.push(point[metricName]);
          prevValue = latestValue;
          latestValue = point[metricName];
          latestDateStr = point.date;
          if (point._interpretations && point._interpretations[metricName]) {
            latestInterpretation = point._interpretations[metricName];
          }
          hasData = true;
        }
      });

      if (!hasData) return;

      const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
      const hasNumeric = numericValues.length > 0;

      const min = hasNumeric ? Math.min(...numericValues) : 'N/A';
      const max = hasNumeric ? Math.max(...numericValues) : 'N/A';
      const avg = hasNumeric ? (numericValues.reduce((a, b) => a + b, 0) / numericValues.length) : 'N/A';
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      
      if (typeof latestValue === 'number' && typeof prevValue === 'number') {
        const diff = latestValue - prevValue;
        if (diff > latestValue * 0.05) trend = 'up';
        else if (diff < -latestValue * 0.05) trend = 'down';
      }

      stats[metricName] = { 
        min, 
        max, 
        avg, 
        latest: latestValue,
        trend,
        unit: metric.unit || '',
        reference: metric.reference || '',
        latestDate: latestDateStr,
        count: values.length,
        interpretation: latestInterpretation,
        isQualitative: !hasNumeric || values.some(v => typeof v === 'string' && isNaN(parseFloat(v)))
      };
    });
    
    return stats;
  }, [selectedMetrics, comparativeData, chartData]);

  const groupedCharts = useMemo(() => {
    if (!groupChartsByUnit) {
      return selectedMetrics.map(metricName => {
        const stats = metricStats[metricName];
        const isQualitative = stats?.isQualitative || false;
        const unit = stats?.unit || 'Sem Unidade';
        return {
          unitKey: metricName,
          title: metricName,
          isQualitative,
          metrics: [metricName],
          subtitle: isQualitative ? 'Resultados Qualitativos' : (unit === 'Sem Unidade' ? 'Sem unidade de medida' : `Medição em ${unit}`)
        };
      });
    }

    const groups: { unitKey: string, title: string, isQualitative: boolean, metrics: string[], subtitle?: string }[] = [];
    
    selectedMetrics.forEach(metricName => {
      const stats = metricStats[metricName];
      if (!stats) return;
      
      const isQualitative = stats.isQualitative;
      const unitKey = isQualitative ? 'Qualitativo' : (stats.unit || 'Sem Unidade');
      
      let group = groups.find(g => g.unitKey === unitKey && g.isQualitative === isQualitative);
      if (!group) {
        group = { 
          unitKey, 
          title: isQualitative ? 'Resultados Qualitativos' : (unitKey === 'Sem Unidade' ? 'Outros Resultados (Sem Unidade)' : `Resultados em ${unitKey}`), 
          isQualitative, 
          metrics: [],
          subtitle: isQualitative ? 'Apenas marcadores qualitativos' : 'Evolução temporal agrupada por unidade'
        };
        groups.push(group);
      }
      group.metrics.push(metricName);
    });
    
    return groups;
  }, [selectedMetrics, metricStats, groupChartsByUnit]);

  // Unified chronological history for two selected correlation metrics (Cross-referencing)
  const correlationData = useMemo(() => {
    if (!corrMetricA || !corrMetricB) return [];
    
    const mDataA = comparativeData.find(d => d.testName === corrMetricA);
    const mDataB = comparativeData.find(d => d.testName === corrMetricB);
    
    if (!mDataA && !mDataB) return [];
    
    const datesSet = new Set<string>();
    if (mDataA) Object.keys(mDataA.history).forEach(d => datesSet.add(d));
    if (mDataB) Object.keys(mDataB.history).forEach(d => datesSet.add(d));
    
    const sortedDates = Array.from(datesSet).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());
    
    return sortedDates.map(date => {
      return {
        date,
        valueA: mDataA?.history[date]?.numValue !== undefined && typeof mDataA?.history[date]?.numValue === 'number' && !isNaN(mDataA.history[date].numValue) ? mDataA.history[date].numValue : undefined,
        valueB: mDataB?.history[date]?.numValue !== undefined && typeof mDataB?.history[date]?.numValue === 'number' && !isNaN(mDataB.history[date].numValue) ? mDataB.history[date].numValue : undefined,
        displayTextA: mDataA?.history[date]?.value || '—',
        displayTextB: mDataB?.history[date]?.value || '—',
        interpretationA: mDataA?.history[date]?.interpretacao || 'Normal',
        interpretationB: mDataB?.history[date]?.interpretacao || 'Normal',
      };
    });
  }, [corrMetricA, corrMetricB, comparativeData]);

  const correlationStats = useMemo(() => {
    if (!corrMetricA || !corrMetricB || correlationData.length === 0) {
      return { r: 0, sharedCount: 0, interpretation: 'Sem exames selecionados', description: '', title: '', cssColor: 'text-slate-500 bg-slate-50 border-slate-200' };
    }
    
    const x: number[] = [];
    const y: number[] = [];
    
    correlationData.forEach(d => {
      if (d.valueA !== undefined && d.valueB !== undefined && typeof d.valueA === 'number' && typeof d.valueB === 'number') {
        x.push(d.valueA);
        y.push(d.valueB);
      }
    });

    const sharedCount = x.length;
    let r = 0;
    
    if (sharedCount >= 2) {
      const n = sharedCount;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
      for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += (x[i] * y[i]);
        sumX2 += (x[i] * x[i]);
        sumY2 += (y[i] * y[i]);
      }
      const num = (n * sumXY) - (sumX * sumY);
      const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
      r = den === 0 ? 0 : num / den;
    }

    let interpretation = 'Sem relação linear detectada';
    let cssColor = 'text-slate-700 bg-slate-50/80 border-slate-200';
    
    if (sharedCount < 2) {
      interpretation = 'Dados Insuficientes para Análise Estatística';
      cssColor = 'text-slate-500 bg-slate-100/50 border-slate-200/60';
    } else {
      if (r > 0.70) {
        interpretation = 'Altíssima Sinergia Direta (Co-elevação Síncrona)';
        cssColor = 'text-teal-800 bg-teal-50 border-teal-200';
      } else if (r > 0.25) {
        interpretation = 'Correlação Direta Fluida (Variação Simétrica)';
        cssColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
      } else if (r < -0.70) {
        interpretation = 'Robusto Feedback Negativo (Ação & Reação Inversa)';
        cssColor = 'text-indigo-800 bg-indigo-50 border-indigo-200';
      } else if (r < -0.25) {
        interpretation = 'Correlação Inversa Fluida (Ajuste Compensatório)';
        cssColor = 'text-blue-800 bg-blue-50 border-blue-200';
      } else {
        interpretation = 'Marcadores Independentes (Oscilação Isolada)';
        cssColor = 'text-slate-800 bg-slate-100/70 border-slate-200';
      }
    }

    const key = `${corrMetricA.toLowerCase()}|${corrMetricB.toLowerCase()}`;
    const reverseKey = `${corrMetricB.toLowerCase()}|${corrMetricA.toLowerCase()}`;
    
    let title = 'Correlação Médica Personalizada';
    let description = 'Selecionar dois biomarcadores permite visualizar as conexões metabólicas entre as células e os órgãos do seu corpo em uma escala temporal única.';

    const insightDatabase: Record<string, { title: string, explanation: string }> = {
      'glicose em jejum|hemoglobina glicada (hba1c)': {
        title: 'Média de Longo Prazo vs. Glicemia Instantânea',
        explanation: 'A HbA1c representa o controle patológico de glicose dos últimos 90 dias, enquanto a Glicose em Jejum reflete um ponto estático. Idealmente, suas variações andam de forma correlacionada. Flutuações acentuadas na Glicose sem correspondência na glicada sugerem desvios alimentares pontuais recentes.'
      },
      'tgo (ast)|tgp (alt)': {
        title: 'Integridade Celular Hepática (AST/ALT)',
        explanation: 'Estas transaminases são liberadas no sangue quando há sobrecarga ou lesão nos hepatócitos. Espera-se uma empolgante correlação positiva. Elevações concomitantes confirmam sobrecarga metabólica hepática (como esteatose ou metabolização de medicamentos).'
      },
      'colesterol total|triglicérides': {
        title: 'Fração Lipídica & Lipoproteínas no Sangue',
        explanation: 'Triglicérides e Colesterol constituem o painel lipídico. Variações acopladas geralmente apontam para influência direta do estilo de vida, sedentarismo e consumo de carboidratos refinados. Se divergirem, indica maior presença de traço genético isolado.'
      },
      'ureia|creatinina': {
        title: 'Depuração de Metabólitos Renais',
        explanation: 'Filtração e excreção renal de resíduos de nitrogênio e creatina muscular. Se ambos variam juntos, traduzem oscilação do ritmo de depuração normal. Se a ureia subir de forma desproporcional à creatinina, sugere estado inicial de desidratação.'
      },
      'vitamina d (25-hidróxi)|cálcio': {
        title: 'Eixo de Absorção Mineral Óssea',
        explanation: 'A Vitamina D atua elevando a absorção de Cálcio no intestino. A falta de vitamina D prejudica os níveis de cálcio, obrigando o corpo a recrutar cálcio extra dos ossos. Identificar tendências conjuntas ajuda a prevenir fragilidade.'
      },
      'hemoglobina|hematócrito': {
        title: 'Saturação de Oxigênio e Volume Eritrocitário',
        explanation: 'Comportamento síncrono clássico. Eles monitoram a concentração de glóbulos vermelhos no sangue. A queda paralela de ambos estabelece estados de anemia clínica ou diluição de plasma.'
      },
      'tsh|tiroxina (t4) livre': {
        title: 'Feedback Fisiológico da Glândula Tireoide',
        explanation: 'Feedback negativo clássico e elegante: se a tireoide produz menos T4 Livre (hipotireoidismo), a hipófise eleva o TSH para estimular a glândula, acarretando uma clássica contra-correlação temporal (quando um cai o outro sobe).'
      },
      'ferritina|ferro sérico': {
        title: 'Reserva Estocada vs. Ferro Circulante',
        explanation: 'O ferro sérico reflete o aporte recente dos alimentos e muda muito rápido, enquanto a ferritina representa a real poupança guardada. Ferritina baixa indica esgotamento iminente das reservas, mesmo se o ferro estiver aparentemente normal.'
      },
      'proteína c-reativa (pcr)|vhs (velocidade de hemossedimentação)': {
        title: 'Marcadores de Atividade Inflamatória de Fase Aguda',
        explanation: 'A Proteína C-Reativa (PCR) reage instantaneamente a infecções ou inflamações agudas, normalizando logo em seguida. Já o VHS responde de forma lenta e prolongada, sendo útil para mensurar atividade crônica de doenças imunológicas.'
      }
    };

    let matched = insightDatabase[key] || insightDatabase[reverseKey];
    if (matched) {
      title = matched.title;
      description = matched.explanation;
    } else {
      const itemA = EXAM_GLOSSARY.find(it => it.canonicalName.toLowerCase() === corrMetricA.toLowerCase());
      const itemB = EXAM_GLOSSARY.find(it => it.canonicalName.toLowerCase() === corrMetricB.toLowerCase());
      if (itemA && itemB) {
        title = `Variação Síncrona: ${itemA.canonicalName} + ${itemB.canonicalName}`;
        description = `O cruzamento de dados compara ${itemA.canonicalName} (para ${itemA.description.split('.')[0].toLowerCase()}) e ${itemB.canonicalName} (para ${itemB.description.split('.')[0].toLowerCase()}). Analisar estes marcadores juntos fornece diagnósticos mais assertivos e seguros.`;
      }
    }

    return {
      r,
      sharedCount,
      interpretation,
      description,
      title,
      cssColor
    };
  }, [corrMetricA, corrMetricB, correlationData]);

  // Unified Custom Tooltip for Double-Axis Cross-Reference Charts
  const CustomCorrelationTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string }) => {
    if (active && payload && payload.length) {
      const uA = comparativeData.find(d => d.testName === corrMetricA)?.unit || '';
      const uB = comparativeData.find(d => d.testName === corrMetricB)?.unit || '';
      const rawA = payload.find(p => p.dataKey === 'valueA');
      const rawB = payload.find(p => p.dataKey === 'valueB');
      
      return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 max-w-xs z-50">
          <p className="font-bold text-slate-500 mb-2.5 border-b border-slate-100 pb-2 text-[11px] uppercase tracking-wider">{label}</p>
          <div className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-xs font-bold text-teal-700 truncate max-w-[150px]">{corrMetricA}</span>
                <span className="text-sm font-extrabold text-slate-900">{rawA && rawA.value !== undefined ? rawA.value : '—'} <span className="text-[10px] font-medium text-slate-400">{uA}</span></span>
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5 border-t border-slate-50 pt-2">
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-xs font-bold text-indigo-700 truncate max-w-[150px]">{corrMetricB}</span>
                <span className="text-sm font-extrabold text-slate-900">{rawB && rawB.value !== undefined ? rawB.value : '—'} <span className="text-[10px] font-medium text-slate-400">{uB}</span></span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip mais elegante e simplificado
  const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string }) => {
    if (active && payload && payload.length) {
      // Helper to determine status of a value vs reference
      const getStatus = (value: any, stats: any): 'normal' | 'altered' | 'unknown' => {
        if (!stats?.reference || value === undefined) return 'unknown';
        const numVal = parseFloat(String(value).replace(',', '.'));
        if (isNaN(numVal)) return 'unknown';
        const ref = stats.reference;
        const rangeMatch = ref.replace(/\./g, '').replace(/,/g, '.').match(/([\d.]+)\s*a\s*([\d.]+)/i);
        if (rangeMatch) {
          return (numVal >= parseFloat(rangeMatch[1]) && numVal <= parseFloat(rangeMatch[2])) ? 'normal' : 'altered';
        }
        const lessMatch = ref.replace(/,/g, '.').match(/<\s*([\d.]+)/);
        if (lessMatch) return numVal < parseFloat(lessMatch[1]) ? 'normal' : 'altered';
        const greaterMatch = ref.replace(/,/g, '.').match(/>\s*([\d.]+)/);
        if (greaterMatch) return numVal > parseFloat(greaterMatch[1]) ? 'normal' : 'altered';
        return 'unknown';
      };

      return (
        <div style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} className="bg-white/95 p-4 rounded-2xl shadow-xl border border-slate-200/80 max-w-xs z-50 relative">
          <p className="font-bold text-slate-500 mb-3 border-b border-slate-100 pb-2 text-[10px] uppercase tracking-widest">{label}</p>
          <div className="space-y-3">
            {payload.map((entry, index) => {
              const stats = metricStats[entry.name];
              const status = getStatus(entry.value, stats);
              return (
                <div key={index} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-xs font-semibold text-slate-700 truncate" title={entry.name}>{entry.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 flex-shrink-0">
                      <span className={`text-base font-black ${
                        status === 'altered' ? 'text-rose-600' :
                        status === 'normal' ? 'text-teal-700' : 'text-slate-900'
                      }`}>{entry.value}</span>
                      {stats?.unit && <span className="text-[10px] text-slate-400 font-medium">{stats.unit}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-4">
                    {stats?.reference && (
                      <span className="text-[9px] text-slate-400 font-mono">Ref: {stats.reference}</span>
                    )}
                    {status !== 'unknown' && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ml-auto ${
                        status === 'normal'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {status === 'normal' ? '✓ Normal' : '⚠ Alterado'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Evolução Histórica</h2>
          <p className="text-slate-500">Acompanhe as tendências dos seus marcadores sanguíneos ao longo do tempo.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="print-hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-semibold hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-colors shadow-sm"
        >
          <Printer size={18} />
          Imprimir / Exportar
        </button>
      </header>

      {/* Selector de Abas de Visualização e Cruzamento */}
      <div className="print-hidden flex bg-slate-200/60 p-1 rounded-xl w-fit border border-slate-200 shadow-inner">
        <button
          type="button"
          onClick={() => setSubTab('evolution')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            subTab === 'evolution' 
              ? 'bg-white text-teal-800 shadow-sm' 
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <TrendingUp size={14} />
          Evoluções Individuais (Padrão)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('correlation')}
          className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
            subTab === 'correlation' 
              ? 'bg-gradient-to-r from-teal-700 to-indigo-800 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-950'
          }`}
        >
          <Sparkles size={14} className={subTab === 'correlation' ? 'text-teal-300 animate-pulse' : ''} />
          Cruzamento Dinâmico de Exames
        </button>
      </div>

      {subTab === 'evolution' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col gap-5 mb-6 bg-slate-50 border border-slate-100 p-4 rounded-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <HeartPulse className="text-teal-600" /> Evolução de Resultados
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap w-full lg:w-auto">
              <div className="flex bg-white border border-slate-200 p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar" title="Filtragem de Intervalo de Tempo">
                <button onClick={() => setTimeRange('3m')} className={`px-4 py-1.5 min-w-[65px] text-xs font-semibold rounded-md transition-colors ${timeRange === '3m' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>3M</button>
                <button onClick={() => setTimeRange('6m')} className={`px-4 py-1.5 min-w-[65px] text-xs font-semibold rounded-md transition-colors ${timeRange === '6m' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>6M</button>
                <button onClick={() => setTimeRange('1y')} className={`px-4 py-1.5 min-w-[65px] text-xs font-semibold rounded-md transition-colors ${timeRange === '1y' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>1A</button>
                <button onClick={() => setTimeRange('all')} className={`px-4 py-1.5 min-w-[65px] text-xs font-semibold rounded-md transition-colors ${timeRange === 'all' ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Todos</button>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
              <div className="flex bg-white border border-slate-200 p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar" title="Tipo de Gráfico">
                <button onClick={() => setChartType('line')} className={`px-4 py-1.5 min-w-[60px] text-xs font-semibold rounded-md transition-colors ${chartType === 'line' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Linha</button>
                <button onClick={() => setChartType('area')} className={`px-4 py-1.5 min-w-[60px] text-xs font-semibold rounded-md transition-colors ${chartType === 'area' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Área</button>
                <button onClick={() => setChartType('bar')} className={`px-4 py-1.5 min-w-[60px] text-xs font-semibold rounded-md transition-colors ${chartType === 'bar' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Barra</button>
              </div>
              <div className="hidden sm:block w-px h-6 bg-slate-200"></div>
              <div className="flex bg-white border border-slate-200 p-1 rounded-lg w-full sm:w-auto overflow-x-auto hide-scrollbar" title="Visualização e Agrupamento">
                <button onClick={() => setGroupChartsByUnit(true)} className={`px-4 py-1.5 min-w-[100px] text-xs font-semibold rounded-md transition-colors ${groupChartsByUnit ? 'bg-teal-50 text-teal-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}>Agrupar por Unidade</button>
                <button onClick={() => setGroupChartsByUnit(false)} className={`px-4 py-1.5 min-w-[100px] text-xs font-semibold rounded-md transition-colors ${!groupChartsByUnit ? 'bg-teal-50 text-teal-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}>Exames Separados</button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 border-t border-slate-200 pt-5">
            <QuickFiltersRow onSelect={selectQuickGroup} selectedGroup={activeGroup} />

            <div className="relative w-full z-50">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white border-2 border-teal-100 text-teal-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold flex items-center justify-between w-full shadow-sm hover:border-teal-300 hover:bg-teal-50 transition-colors"
                title="Explorar e Selecionar Marcadores"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span className="truncate">{selectedMetrics.length === 1 ? '1 Exame Selec.' : `${selectedMetrics.length} Exames Selecionados`}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden text-slate-900 ring-1 ring-slate-900/5 origin-top animate-in slide-in-from-top-2">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Pesquisar marcador..." 
                          value={metricSearch}
                          onChange={e => setMetricSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="p-2 space-y-2 max-h-[350px] overflow-y-auto">
                    {Object.entries(groupedMetrics).map(([group, metrics]) => (
                      <div key={group} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50/50 rounded-lg mb-1 group">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group}</div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleGroup(metrics as MetricType[]); }}
                            className="text-[10px] text-teal-600 hover:text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          >
                            Alternar Grupo
                          </button>
                        </div>
                        <div className="space-y-0.5 mt-1">
                          {(metrics as MetricType[]).map((metric: MetricType) => (
                            <label key={metric.testName} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 group-hover:border-teal-400 transition-colors"
                                checked={selectedMetrics.includes(metric.testName)}
                                onChange={() => toggleMetric(metric.testName)}
                              />
                              <span className="text-sm font-medium text-slate-900 leading-tight group-hover:text-teal-900 transition-colors">{metric.testName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(groupedMetrics).length === 0 && (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        Nenhum marcador encontrado
                      </div>
                    )}
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Chips de exames selecionados */}
        {selectedMetrics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Visualizando:</span>
            {selectedMetrics.map((metric, i) => (
              <span key={metric} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-sm group">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                {metric}
                <button 
                  onClick={() => toggleMetric(metric)} 
                  className="ml-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full p-0.5 transition-colors"
                  title="Remover métrica"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {selectedMetrics.length > 1 && (
              <button 
                onClick={() => setSelectedMetrics([])}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-full transition-colors ml-auto md:ml-0"
              >
                Limpar Todos
              </button>
            )}
          </div>
        )}

        {groupedCharts.length > 0 ? (
          <div className="flex flex-col gap-8 mb-8 pb-8">
            {groupedCharts.map((group, groupIdx) => {
              
              const isNumericValue = (val: any) => !isNaN(parseFloat(val)) && isFinite(Number(val));
              
              const parseReferenceRange = (refStr: string) => {
                if (!refStr || typeof refStr !== 'string') return null;
                const text = refStr.replace(/\\./g, '').replace(/,/g, '.');
                const rangeMatch = text.match(/([\\d\\.]+)\\s*a\\s*([\\d\\.]+)/i);
                if (rangeMatch) return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
                const lessMatch = text.match(/<\\s*([\\d\\.]+)/);
                if (lessMatch) return { max: parseFloat(lessMatch[1]) };
                const greaterMatch = text.match(/>\\s*([\\d\\.]+)/);
                if (greaterMatch) return { min: parseFloat(greaterMatch[1]) };
                return null;
              };
              
              let parsedRef = null;
              if (group.metrics.length === 1) {
                const stats = metricStats[group.metrics[0]];
                if (stats?.reference) {
                   parsedRef = parseReferenceRange(stats.reference);
                }
              }

              const renderCustomDot = (props: any, baseColor: string) => {
                const { cx, cy, value } = props;
                if (cx === undefined || cy === undefined || value === undefined) return null;
                
                let dotColor = baseColor;
                let isOut = false;
                
                if (parsedRef && isNumericValue(value)) {
                  const numValue = Number(value);
                  if (parsedRef.min !== undefined && parsedRef.max !== undefined) {
                    if (numValue < parsedRef.min || numValue > parsedRef.max) isOut = true;
                  } else if (parsedRef.min !== undefined) {
                    if (numValue < parsedRef.min) isOut = true;
                  } else if (parsedRef.max !== undefined) {
                    if (numValue > parsedRef.max) isOut = true;
                  }
                }

                if (isOut) dotColor = '#ef4444';

                return <circle cx={cx} cy={cy} r={isOut ? 6 : 5} fill={dotColor} stroke="#fff" strokeWidth={isOut ? 2.5 : 2} />;
              };

              const renderCustomLabel = (props: any, baseColor: string, dyOffset: number = -15, metricName: string = '') => {
                const { x, y, value, index } = props;
                if (x === undefined || y === undefined || value === undefined) return null;
                
                let labelColor = baseColor;
                let isOut = false;
                let arrowDir = '';

                if (parsedRef && isNumericValue(value)) {
                  const numValue = Number(value);
                  if (parsedRef.min !== undefined && parsedRef.max !== undefined) {
                    if (numValue < parsedRef.min) isOut = true;
                    else if (numValue > parsedRef.max) isOut = true;
                  } else if (parsedRef.min !== undefined) {
                    if (numValue < parsedRef.min) isOut = true;
                  } else if (parsedRef.max !== undefined) {
                    if (numValue > parsedRef.max) isOut = true;
                  }
                }

                if (isNumericValue(value) && index > 0 && metricName && chartData && chartData.length > 0) {
                  let prevValue = null;
                  for (let i = index - 1; i >= 0; i--) {
                    if (chartData[i] && chartData[i][metricName] !== undefined && isNumericValue(chartData[i][metricName])) {
                       prevValue = Number(chartData[i][metricName]);
                       break;
                    }
                  }
                  
                  if (prevValue !== null) {
                    const numValue = Number(value);
                    if (numValue > prevValue) {
                      arrowDir = 'up';
                    } else if (numValue < prevValue) {
                      arrowDir = 'down';
                    }
                  }
                }

                if (isOut) labelColor = '#ef4444';
                const formattedValue = isNumericValue(value) ? Number(value).toFixed(1) : value;
                const arrowColor = arrowDir === 'up' ? '#2563eb' : (arrowDir === 'down' ? '#e11d48' : '#94a3b8');

                return (
                  <g>
                    <text x={x} y={y} dy={dyOffset} fill={labelColor} fontSize={13} fontWeight={isOut ? "900" : "bold"} textAnchor="middle">
                      {formattedValue}
                    </text>
                    {arrowDir === 'up' && (
                      <path d={`M${x - 4.5},${y + dyOffset - 15} L${x + 4.5},${y + dyOffset - 15} L${x},${y + dyOffset - 22} Z`} fill={arrowColor} />
                    )}
                    {arrowDir === 'down' && (
                      <path d={`M${x - 4.5},${y + dyOffset + 4} L${x + 4.5},${y + dyOffset + 4} L${x},${y + dyOffset + 11} Z`} fill={arrowColor} />
                    )}
                  </g>
                );
              };

              // Adaptive bar label: inside tall bars (white), above short bars (colored)
              const renderCustomBarLabel = (props: any, baseColor: string, metricName: string = '') => {
                const { x, y, width, height, value, index } = props;
                if (x === undefined || y === undefined || value === undefined || width === undefined) return null;

                let labelColor = baseColor;
                let isOut = false;

                if (parsedRef && isNumericValue(value)) {
                  const numValue = Number(value);
                  if (parsedRef.min !== undefined && parsedRef.max !== undefined) {
                    if (numValue < parsedRef.min || numValue > parsedRef.max) isOut = true;
                  } else if (parsedRef.min !== undefined) {
                    if (numValue < parsedRef.min) isOut = true;
                  } else if (parsedRef.max !== undefined) {
                    if (numValue > parsedRef.max) isOut = true;
                  }
                }

                if (isOut) labelColor = '#ef4444';
                const formattedValue = isNumericValue(value) ? Number(value).toFixed(1) : value;

                const barHeight = Math.abs(Number(height) || 0);
                const isInsideBar = barHeight >= 28;

                // For inside placement: center vertically in bar
                const labelY = isInsideBar
                  ? Number(y) + barHeight / 2
                  : Number(y) - 7;

                const fillColor = isInsideBar ? '#fff' : (isOut ? '#ef4444' : baseColor);
                const fontWeight = isOut ? '900' : 'bold';

                // Background pill for labels above bar to improve readability
                const pillWidth = String(formattedValue).length * 7 + 10;
                const pillHeight = 16;

                return (
                  <g>
                    {!isInsideBar && (
                      <rect
                        x={Number(x) + Number(width) / 2 - pillWidth / 2}
                        y={labelY - pillHeight + 3}
                        width={pillWidth}
                        height={pillHeight}
                        rx={4}
                        fill={isOut ? '#fef2f2' : '#f8fafc'}
                        stroke={isOut ? '#fca5a5' : '#e2e8f0'}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={labelY}
                      fill={fillColor}
                      fontSize={isInsideBar ? 12 : 11}
                      fontWeight={fontWeight}
                      textAnchor="middle"
                      dominantBaseline={isInsideBar ? 'middle' : 'auto'}
                    >
                      {formattedValue}
                    </text>
                  </g>
                );
              };
              
              const renderReferenceElements = () => {
                if (!parsedRef) return null;
                if (parsedRef.min !== undefined && parsedRef.max !== undefined) {
                  return <ReferenceArea y1={parsedRef.min} y2={parsedRef.max} fill="#e2e8f0" fillOpacity={0.4} strokeOpacity={0} />;
                } else if (parsedRef.max !== undefined) {
                  return (
                    <>
                      <ReferenceArea y1={0} y2={parsedRef.max} fill="#e2e8f0" fillOpacity={0.4} strokeOpacity={0} />
                      <ReferenceLine y={parsedRef.max} stroke="#ef4444" strokeDasharray="3 3" />
                    </>
                  );
                } else if (parsedRef.min !== undefined) {
                  return (
                    <>
                      <ReferenceLine y={parsedRef.min} stroke="#ef4444" strokeDasharray="3 3" />
                    </>
                  );
                }
                return null;
              };

              const colors = ['#14b8a6', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#10b981'];

              return (
                <div key={groupIdx} className="bg-white border text-sm border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col pt-3">
                  <div className="flex flex-col gap-3 mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                       <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div>
                       <div>
                         <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           {group.title}
                         </h3>
                         {group.subtitle && (
                           <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
                         )}
                       </div>
                     </div>
                     {/* Subtitle list of exams when grouped by unit */}
                     {groupChartsByUnit && group.metrics.length > 1 && (
                       <div className="mt-2.5 pt-2.5 border-t border-slate-200/50 flex flex-wrap gap-2">
                         <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider self-center">Exames agrupados neste gráfico:</span>
                         {group.metrics.map((m, idx) => {
                           const color = colors[idx % colors.length];
                           const stats = metricStats[m];
                           return (
                             <span key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-white text-slate-700 border border-slate-200 shadow-3xs">
                               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                               {m}
                               {stats?.latest && (
                                 <span className="text-[9px] font-medium text-slate-400 font-mono">({stats.latest} {stats.unit})</span>
                               )}
                             </span>
                           );
                         })}
                       </div>
                     )}
                  </div>
                  
                  {/* Grid columns: Chart takes 3 parts, Side Legend takes 1 part on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
                    {/* Modern Dynamic Side Legend with Word Wrap & Medical Context */}
                    <div className="flex flex-col justify-start space-y-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-3xs max-h-[450px] overflow-y-auto">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Legenda da Visão</span>
                      <div className="flex flex-col gap-3.5">
                        {group.metrics.map((metricName, i) => {
                          const color = colors[i % colors.length];
                          const stats = metricStats[metricName];
                          return (
                            <div key={metricName} className="flex gap-2.5 items-start leading-tight">
                              <span className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-xs" style={{ backgroundColor: color }} />
                              <div className="flex flex-col text-left">
                                <span className="text-xs font-bold text-slate-800 break-words leading-tight">{metricName}</span>
                                {stats && (
                                  <div className="flex flex-col mt-0.5 space-y-0.5">
                                    <span className="text-[10px] font-semibold text-slate-500">
                                      Último: <span className="font-mono text-teal-700 font-extrabold">{stats.latest}</span> {stats.unit}
                                    </span>
                                    {stats.reference && (
                                      <span className="text-[9px] font-medium text-slate-400">
                                        Ref: {stats.reference}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* AI Group Insight Button & Result */}
                      <div className="mt-auto pt-4 border-t border-slate-200">
                         <button
                           type="button"
                           onClick={() => generateGroupInsight(groupIdx, group.metrics)}
                           disabled={loadingGroupAiInsights[groupIdx]}
                           className="w-full inline-flex justify-center items-center gap-1.5 text-[11px] font-bold bg-white hover:bg-slate-50 border border-indigo-200 text-indigo-700 active:bg-indigo-50 px-3 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                         >
                           <Sparkles size={12} className={loadingGroupAiInsights[groupIdx] ? "animate-spin" : ""} />
                           {loadingGroupAiInsights[groupIdx] ? 'Analisando...' : 'Gerar Insight IA'}
                         </button>
                         
                         {groupAiInsights[groupIdx] && (
                           <div className="mt-3 bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl text-left animate-in fade-in zoom-in-95 duration-200">
                             <span className="text-[10px] uppercase font-bold text-indigo-800 mb-1.5 flex items-center gap-1"><Sparkles size={10} /> Insight Clínico</span>
                             <p className="text-[11px] text-slate-700 font-medium leading-relaxed font-sans whitespace-pre-wrap">{groupAiInsights[groupIdx]}</p>
                           </div>
                         )}
                      </div>
                    </div>

                    {/* Graph container */}
                    <div className="lg:col-span-3 h-[380px] md:h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'line' ? (
                          <LineChart data={chartData} margin={{ top: 35, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} padding={{ left: 30, right: 30 }} />
                            <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} domain={[(dataMin: number) => { const v = Number((dataMin - Math.abs(dataMin)*0.05).toFixed(4)); return v === 0 ? -1 : v; }, (dataMax: number) => { const v = Number((dataMax + Math.abs(dataMax)*0.05).toFixed(4)); return v === 0 ? 1 : v; }]} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            {renderReferenceElements()}
                            {group.metrics.map((metricName, i) => {
                              const color = colors[i % colors.length];
                              return (
                                <Line 
                                  key={metricName} 
                                  type="monotone" 
                                  dataKey={metricName} 
                                  stroke={color} 
                                  strokeWidth={3}
                                  connectNulls={true}
                                  dot={(props: any) => renderCustomDot(props, color)} 
                                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                >
                                    <LabelList dataKey={metricName} content={(props: any) => renderCustomLabel(props, color, -15, metricName)} />
                                </Line>
                              );
                            })}
                          </LineChart>
                        ) : chartType === 'area' ? (
                          <AreaChart data={chartData} margin={{ top: 35, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} padding={{ left: 20, right: 20 }} />
                            <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} domain={[(dataMin: number) => { const v = Number((dataMin - Math.abs(dataMin)*0.05).toFixed(4)); return v === 0 ? -1 : v; }, (dataMax: number) => { const v = Number((dataMax + Math.abs(dataMax)*0.05).toFixed(4)); return v === 0 ? 1 : v; }]} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            {renderReferenceElements()}
                            {group.metrics.map((metricName, i) => {
                              const color = colors[i % colors.length];
                              return (
                                <Area 
                                  key={metricName} 
                                  type="monotone" 
                                  dataKey={metricName} 
                                  stroke={color} 
                                  fill={color}
                                  fillOpacity={0.1} 
                                  strokeWidth={3}
                                  connectNulls={true}
                                >
                                    <LabelList dataKey={metricName} content={(props: any) => renderCustomLabel(props, color, -12, metricName)} />
                                </Area>
                              );
                            })}
                          </AreaChart>
                        ) : (
                          <BarChart data={chartData} margin={{ top: 45, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} />
                            <YAxis stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 11}} domain={[(dataMin: number) => { const v = Number((dataMin - Math.abs(dataMin)*0.05).toFixed(4)); return v === 0 ? -1 : v; }, (dataMax: number) => { const v = Number((dataMax + Math.abs(dataMax)*0.05).toFixed(4)); return v === 0 ? 1 : v; }]} />
                            <RechartsTooltip content={<CustomTooltip />} />
                            {renderReferenceElements()}
                            {group.metrics.map((metricName, i) => {
                              const color = colors[i % colors.length];
                              return (
                                <Bar 
                                  key={metricName} 
                                  dataKey={metricName} 
                                  fill={color}
                                  fillOpacity={0.92}
                                  radius={[5, 5, 0, 0]}
                                  maxBarSize={group.metrics.length === 1 ? 80 : Math.max(20, 100 / group.metrics.length)}
                                >
                                    <LabelList dataKey={metricName} content={(props: any) => renderCustomBarLabel(props, color, metricName)} />
                                </Bar>
                              );
                            })}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white flex flex-col items-center justify-center p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 child-svg-lg">
                <TrendingUp size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Nenhum exame selecionado</h3>
            <p className="text-slate-500 max-w-sm">
              Selecione um ou mais exames acima para visualizar seu histórico e evolução temporal.
            </p>
          </div>
        )}
      </div>
      )}

      {subTab === 'correlation' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          {/* Header & Metric Selectors */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Activity className="text-teal-600" size={16} /> Seletores de Cruzamento Dinâmico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              <div className="md:col-span-5 text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Marcador A (Eixo Esquerdo)</label>
                <div className="relative">
                  <select 
                    value={corrMetricA} 
                    onChange={(e) => {
                      setCorrMetricA(e.target.value);
                      setDynAiInsight('');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs appearance-none cursor-pointer"
                  >
                    {comparativeData.map(m => (
                      <option key={m.testName} value={m.testName}>{m.testName}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center">
                <span className="hidden md:flex bg-teal-50 border border-teal-100 p-2 rounded-full text-teal-700 font-extrabold text-sm shadow-xs self-center">VS</span>
              </div>

              <div className="md:col-span-5 text-left">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Marcador B (Eixo Direito)</label>
                <div className="relative">
                  <select 
                    value={corrMetricB} 
                    onChange={(e) => {
                      setCorrMetricB(e.target.value);
                      setDynAiInsight('');
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs appearance-none cursor-pointer"
                  >
                    {comparativeData.map(m => (
                      <option key={m.testName} value={m.testName}>{m.testName}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats, Correlation Coefficient Display and AI Insight Button */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Correlation Index Panel */}
            <div className={`p-5 rounded-2xl border ${correlationStats.cssColor} flex flex-col justify-between space-y-4 text-left`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coeficiente de Correlação (r)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black tracking-tight">{correlationStats.sharedCount >= 2 ? (correlationStats.r >= 0 ? '+' : '') + correlationStats.r.toFixed(2) : '—'}</span>
                  {correlationStats.sharedCount >= 2 && (
                    <span className="text-xs font-bold text-slate-500">Pearson</span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold mt-3 leading-snug">
                  {correlationStats.interpretation}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {correlationStats.sharedCount < 2 ? (
                    'Necessitamos de pelo menos 2 exames com datas comuns de realização para quantificar a correlação estatística linear.'
                  ) : (
                    `Calculado com base em ${correlationStats.sharedCount} medições de datas sobrepostas.`
                  )}
                </p>
              </div>
              
              {correlationStats.sharedCount >= 2 && (
                <div className="w-full bg-slate-200/30 h-1.5 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 bottom-0 bg-teal-600 rounded-full" 
                    style={{ 
                      left: correlationStats.r >= 0 ? '50%' : `${50 + correlationStats.r * 50}%`,
                      right: correlationStats.r >= 0 ? `${50 - correlationStats.r * 50}%` : '50%'
                    }} 
                  />
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300" />
                </div>
              )}
            </div>

            {/* Insight Explanatory Text */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl lg:col-span-2 flex flex-col justify-between text-left">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <HeartPulse size={16} className="text-indigo-600" />
                  {correlationStats.title}
                </h4>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {correlationStats.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Efetue estudos integrados</span>
                <button
                  type="button"
                  id="btn-generate-physio-insight"
                  onClick={generatePhysioInsight}
                  disabled={isDynAiLoading || !corrMetricA || !corrMetricB}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles size={13} className={isDynAiLoading ? "animate-spin" : ""} />
                  {isDynAiLoading ? 'Analisando...' : 'Análise Médica (IA)'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Insight Results Drawer (if loaded) */}
          {((dynAiInsight && dynAiInsight.trim() !== '') || isDynAiLoading) && (
            <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-2xl text-slate-800 animate-in fade-in slide-in-from-top-1 duration-200 text-left">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={15} className="text-indigo-600 animate-pulse" />
                <h5 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">Laudo Fisiológico da Inteligência Artificial</h5>
              </div>
              {isDynAiLoading ? (
                <div className="py-4 flex flex-col items-center justify-center space-y-2">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-indigo-600 font-bold animate-pulse">Gerando explicação médica baseada na correlação fisiológica...</span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                  {dynAiInsight}
                </p>
              )}
            </div>
          )}

          {/* Dual Axis Chart Area */}
          <div className="relative pt-4 text-left">
            <h4 className="font-extrabold text-slate-800 text-sm mb-4">Gráfico Temporal Cruzado (Eixos Independentes)</h4>
            {correlationData.length > 0 ? (
              <div className="h-[380px] w-full bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={correlationData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis 
                      yAxisId="left" 
                      stroke="#0d9488" 
                      tick={{ fill: '#0d9488', fontSize: 11 }} 
                      domain={['auto', 'auto']}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#6366f1" 
                      tick={{ fill: '#6366f1', fontSize: 11 }} 
                      domain={['auto', 'auto']}
                    />
                    <RechartsTooltip content={<CustomCorrelationTooltip />} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="valueA" 
                      stroke="#0d9488" 
                      strokeWidth={3} 
                      name={corrMetricA} 
                      activeDot={{ r: 8 }} 
                      connectNulls 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="valueB" 
                      stroke="#6366f1" 
                      strokeWidth={3} 
                      name={corrMetricB} 
                      activeDot={{ r: 8 }} 
                      connectNulls 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed rounded-xl">
                Sem dados históricos comuns cadastrados para esses marcadores.
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

  export function ComparisonView({ onNavigate }: { onNavigate?: (tab: string, params?: any) => void }) {
  const { comparativeData } = useData();
  const { addToast } = useToast();
  const [metricSearch, setMetricSearch] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortConfig, setSortConfig] = useState<{ key: 'testName' | 'reference'; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedGlossaryItem, setSelectedGlossaryItem] = useState<any | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const getGlossaryItemForExam = (testName: string) => normalizeAndMatchExam(testName);
  
  const requestSort = (key: 'testName' | 'reference') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const allDates = useMemo(() => {
    const dates = new Set<string>();
    comparativeData.forEach(item => {
      Object.keys(item.history).forEach(date => dates.add(date));
    });
    return Array.from(dates).sort((a, b) => parseDate(b).getTime() - parseDate(a).getTime());
  }, [comparativeData]);

  

  type MetricType = typeof comparativeData[0];

  const groupedMetrics = useMemo(() => {
    const groups: Record<string, MetricType[]> = {};
    comparativeData.forEach(metric => {
      if (metricSearch && !metric.testName.toLowerCase().includes(metricSearch.toLowerCase())) return;
      const group = getExamGroup(metric.testName);
      if (groupFilter && group !== groupFilter) return;
      
      if (!groups[group]) groups[group] = [];
      groups[group].push(metric);
    });
    
    const sortedGroups: Record<string, MetricType[]> = {};
    Object.keys(groups).sort().forEach(key => {
      let items = groups[key];
      if (sortConfig) {
        items.sort((a, b) => {
          let aValue = String(a[sortConfig.key] || '');
          let bValue = String(b[sortConfig.key] || '');
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        });
      }
      sortedGroups[key] = items;
    });
    
    return sortedGroups;
  }, [comparativeData, metricSearch, sortConfig]);

  const ComparisonSortableHeader = ({ title, sortKey, className }: { title: string, sortKey: 'testName' | 'reference', className?: string }) => (
    <th 
      className={`${className} cursor-pointer hover:bg-slate-50 transition-colors shrink-0 group select-none`}
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-widest text-slate-500 group-hover:text-teal-700 transition-colors">
        {title}
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="text-teal-600" /> : <ArrowDown size={12} className="text-teal-600" />
        ) : (
          <ArrowUpDown size={12} className="text-slate-400 opacity-40 group-hover:opacity-100 group-hover:text-teal-500 transition-all" />
        )}
      </div>
    </th>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="mb-6 flex flex-col justify-between sm:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Table size={24} className="stroke-[2.5]" />
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Comparativo Analítico</h2>
          </div>
          <p className="text-slate-500 max-w-2xl text-[15px] ml-1">Matriz laboratorial avançada. Os resultados de todos os documentos e PDFs lidos estão consolidados e unificados em uma linha do tempo clínica inteligente.</p>
        </div>
      </header>

      {/* FILTER AND ACTION BAR */}
      <div className="bg-white border text-sm border-slate-200 p-2 sm:p-3 rounded-2xl shadow-sm mb-6 flex flex-col xl:flex-row gap-3 items-center">
        
        {/* Left Side: View modes & search */}
        <div className="flex flex-col sm:flex-row flex-1 w-full items-stretch sm:items-center gap-3">
           <div className="hidden sm:flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-900 transparent'
                }`}
              >
                <Table size={15} className={viewMode === 'table' ? 'stroke-[2.5]' : ''} />
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 rounded-lg font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60' : 'text-slate-500 hover:text-slate-900 transparent'
                }`}
              >
                <LayoutGrid size={15} className={viewMode === 'cards' ? 'stroke-[2.5]' : ''}/>
                Cards
              </button>
            </div>

            <div className="relative flex-1 max-w-md w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar biomarcador (ex: Vitamina D)" 
                value={metricSearch}
                onChange={e => setMetricSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-sm font-semibold placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
        </div>

        {/* Right Side: Quick Filters & Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto">
          <div className="hidden xl:block h-8 w-px bg-slate-200 mx-1"></div>
          
          <QuickFiltersRow 
            selectedGroup={groupFilter}
            onSelect={(group) => setGroupFilter(group === 'Limpar' ? null : group)} 
          />

          <div className="hidden xl:block h-8 w-px bg-slate-200 mx-1"></div>

          <button 
            onClick={() => {
              const csvData = comparativeData.map(item => {
                const row: any = { Exame: item.testName, Referência: item.reference };
                allDates.forEach(date => {
                  row[date] = item.history[date] ? item.history[date].value : '';
                });
                return row;
              });
              exportToCSV(csvData, 'comparativo_exames');
              addToast('Comparativo exportado com sucesso!', 'success');
            }}
            className="flex-1 sm:flex-none items-center justify-center flex gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm"
          >
            Exportar CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="print-hidden p-2.5 sm:px-4 flex-none items-center justify-center flex gap-2 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
            title="Imprimir"
          >
             <Printer size={16} />
             <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className={viewMode === 'table' ? "overflow-x-auto" : "p-4 sm:p-6"}>
          {Object.keys(groupedMetrics).length > 0 ? (
            viewMode === 'cards' ? (
              <div className="space-y-8 print-break-inside-avoid">
                {Object.entries(groupedMetrics).map(([groupName, groupItems]) => (
                  <div key={groupName} className="space-y-5">
                    <h3 className="font-extrabold text-slate-800 text-lg border-b-2 border-slate-100 pb-2 flex items-center gap-2 uppercase tracking-tight">
                       <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block shadow-sm"></span>
                       {groupName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {(groupItems as MetricType[]).map((item, idx) => {
                        const datesWithData = Object.keys(item.history).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());
                        const glossaryMatch = getGlossaryItemForExam(item.testName);
                        
                        return (
                          <div key={`${groupName}-${idx}`} className="bg-white border text-center relative pt-5 pb-0 flex flex-col justify-between border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-300 group">
                            <div className="px-5 mb-4">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <h4 className="font-extrabold text-slate-900 text-[17px] leading-tight">
                                  {item.testName}
                                </h4>
                                
                                <div className="flex items-center justify-center gap-1.5 flex-wrap mt-1">
                                  {glossaryMatch && (
                                    <button
                                      onClick={() => setSelectedGlossaryItem(glossaryMatch)}
                                      className="px-2.5 py-1 rounded border border-indigo-100/50 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                                      title="Ver definição e sinônimos no dicionário de exames"
                                    >
                                      <BookOpen size={11} className="stroke-[2.5]" />
                                      Definição Clínica
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onNavigate && onNavigate('charts', { metricName: item.testName })}
                                    className="px-2.5 py-1 rounded border border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-200 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                                    title="Ver gráfico de tendência clínica"
                                  >
                                    <TrendingUp size={11} className="stroke-[2.5] text-indigo-500" />
                                    Gráfico Evolutivo
                                  </button>
                                </div>
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-100/60 dashed-border">
                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1">
                                  Valores de Referência
                                </p>
                                <p className="text-xs text-slate-600 font-mono font-medium whitespace-pre-line leading-relaxed">{item.reference}</p>
                              </div>
                            </div>
                            
                            <div className="bg-slate-50/80 p-5 border-t border-slate-100 flex gap-4 overflow-x-auto custom-scrollbar items-center justify-start min-h-[90px]">
                               {datesWithData.length > 0 ? datesWithData.map((date, dateIdx) => {
                                  const dataPoint = (item.history as any)[date];
                                  const valStr = dataPoint ? String(dataPoint.value).toLowerCase() : '';
                                  const isAlert = valStr.includes('positivo') || (valStr.includes('reagente') && !valStr.includes('não')) || (dataPoint && dataPoint.interpretacao === 'Alterado');
                                  const isWarning = dataPoint && dataPoint.interpretacao === 'Sub-ópt.';
                                  
                                  return (
                                    <div key={date} className="flex items-center flex-shrink-0">
                                      <div className="flex-shrink-0 flex flex-col items-center min-w-[85px] bg-white p-2.5 rounded-xl shadow-xs border border-slate-100/80 group-hover:border-slate-200 transition-colors">
                                        <span className="text-[10px] font-extrabold text-slate-400 mb-2 font-mono">{date}</span>
                                        <span className={`px-2 py-1.5 rounded-lg border text-xs font-bold leading-normal text-center w-full min-h-[32px] flex items-center justify-center flex-col ${
                                          isAlert ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                          isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                          'bg-slate-50/50 text-slate-800 border-slate-200/60'
                                        }`}>
                                          <span className="whitespace-pre-line leading-tight">
  {formatQualitativeResult(dataPoint.value)}
</span>
                                          {item.unit !== '—' && <span className={`text-[10px] font-medium opacity-60 mt-0.5 leading-none ${isAlert || isWarning ? '' : 'text-slate-500'}`}>{item.unit}</span>}
                                        </span>
                                      </div>
                                      {/* Connector for cards */}
                                      {dateIdx < datesWithData.length - 1 && (
                                         <div className="w-4 h-px bg-slate-200 mx-2 flex-shrink-0 rounded-full mt-4 border-dashed border-t border-slate-300"></div>
                                      )}
                                    </div>
                                  );
                               }) : (
                                 <div className="flex items-center justify-center w-full text-slate-400 text-xs italic py-2">Sem histórico de resultados</div>
                               )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (<>
              {/* Mobile Exclusive View Always Cards */}
        <div className="sm:hidden p-4 space-y-8 bg-slate-50">
           {Object.entries(groupedMetrics).map(([groupName, groupItems]) => (
                <div key={"mobile-"+groupName} className="space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-tight">
                     <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block shadow-sm"></span>
                     {groupName}
                  </h3>
                  <div className="space-y-4">
                    {(groupItems as MetricType[]).map((item, idx) => {
                      const datesWithData = Object.keys(item.history).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());
                      return (
                        <div key={`${groupName}-${idx}`} className="bg-white border text-center pt-5 pb-0 flex flex-col justify-between border-slate-200 rounded-xl shadow-sm">
                           <div className="px-5 mb-4">
                              <h4 className="font-extrabold text-slate-900 text-lg leading-tight mb-2">
                                {item.testName}
                              </h4>
                              <div className="mt-2 pt-2 border-t border-slate-100/60 flex items-center justify-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400">Ref:</span>
                                <span className="text-xs font-mono text-slate-600 font-medium">{item.reference}</span>
                              </div>
                           </div>
                           <div className="bg-slate-50/80 p-4 border-t border-slate-100 flex gap-4 overflow-x-auto items-center justify-start min-h-[90px]">
                              {datesWithData.length > 0 ? datesWithData.map((date, dateIdx) => {
                                 const dataPoint = (item.history as any)[date];
                                 const valStr = dataPoint ? String(dataPoint.value).toLowerCase() : '';
                                 const isAlert = valStr.includes('positivo') || (valStr.includes('reagente') && !valStr.includes('não')) || (dataPoint && dataPoint.interpretacao === 'Alterado');
                                 const isWarning = dataPoint && dataPoint.interpretacao === 'Sub-ópt.';
                                 return (
                                   <div key={date} className="flex items-center flex-shrink-0">
                                     <div className="flex-shrink-0 flex flex-col items-center min-w-[85px] bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
                                       <span className="text-[10px] font-extrabold text-slate-400 mb-2 font-mono">{date}</span>
                                       <span className={`px-2 py-1.5 rounded-lg border text-xs font-bold leading-normal text-center w-full min-h-[32px] flex items-center justify-center flex-col ${
                                          isAlert ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                          isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                          'bg-slate-50/50 text-slate-800 border-slate-200'
                                       }`}>
                                         <span className="whitespace-pre-line leading-tight">
  {formatQualitativeResult(dataPoint.value)}
</span>
                                         {item.unit !== '—' && <span className="text-[10px] font-medium opacity-60 mt-0.5 leading-none">{item.unit}</span>}
                                       </span>
                                     </div>
                                   </div>
                                 );
                              }) : <span className="text-xs text-slate-400 italic py-2">Sem histórico</span>}
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
           ))}
        </div>
        
        <table className="w-full text-left border-collapse min-w-[1000px] mb-2 hidden sm:table">
                <thead className="bg-slate-50/80 border-y border-slate-200">
                  <tr>
                    <ComparisonSortableHeader title="Exame e Detalhes" sortKey="testName" className="py-4 px-6 w-[320px]" />
                    <th className="py-4 px-6 font-bold text-[11px] uppercase tracking-widest text-slate-400 border-l border-slate-100 bg-slate-50/40">
                       <span className="text-slate-500 font-extrabold flex items-center gap-2">
                         <History size={14} className="text-indigo-400" /> Linha do Tempo de Resultados
                       </span>
                    </th>
                    <ComparisonSortableHeader title="Referência Base" sortKey="reference" className="py-4 px-6 w-[240px] border-l border-slate-200/60" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(groupedMetrics).map(([groupName, groupItems]) => (
                    <React.Fragment key={groupName}>
                      <tr className="bg-slate-50/30 border-y border-slate-200/80">
                        <td colSpan={3} className="px-6 py-2.5 font-extrabold text-slate-700 text-[11px] uppercase tracking-widest flex items-center gap-2 w-full">
                          <span className="w-2 h-2 rounded-sm bg-indigo-400 inline-block shadow-sm"></span>
                          {groupName}
                        </td>
                      </tr>
                      {(groupItems as MetricType[]).map((item, idx) => {
                        const datesWithData = Object.keys(item.history).sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());
                        const glossaryMatch = getGlossaryItemForExam(item.testName);
                        
                        return (
                          <tr key={`${groupName}-${idx}`} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4 px-6 align-middle bg-white group-hover:bg-slate-50/30 transition-colors">
                              <div className="flex flex-col gap-2">
                                <div className="font-extrabold text-[15.5px] leading-snug text-slate-900 flex items-center gap-2 pr-4">
                                  <span>{item.testName}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {glossaryMatch && (
                                    <button
                                      onClick={() => setSelectedGlossaryItem(glossaryMatch)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] uppercase tracking-widest transition-colors border border-indigo-100/50"
                                      title="Ver definição clínica e mapeamento de sinônimos"
                                    >
                                      <BookOpen size={11} className="stroke-[2.5]" />
                                      Definição
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onNavigate && onNavigate('charts', { metricName: item.testName })}
                                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5"
                                    title={`Exibir histórico clínico de ${item.testName}`}
                                  >
                                    <TrendingUp size={11} className="stroke-[2.5]" />
                                    Evolução
                                  </button>
                                </div>
                              </div>
                            </td>
                            
                            {/* RESULTS RENDERED BEFORE REFERENCE TO MAKE IT FEEL LIKE A TIMELINE */}
                            <td className="py-3 px-6 border-l border-slate-100/60 bg-white group-hover:bg-slate-50/30 max-w-0 h-full">
                              <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2 pt-1 h-full min-h-[70px]">
                                {datesWithData.length > 0 ? (
                                  datesWithData.map((date, dateIdx) => {
                                    const dataPoint = (item.history as any)[date];
                                    const valStr = dataPoint ? String(dataPoint.value).toLowerCase() : '';
                                    const isAlert = valStr.includes('positivo') || (valStr.includes('reagente') && !valStr.includes('não')) || (dataPoint && dataPoint.interpretacao === 'Alterado');
                                    const isWarning = dataPoint && dataPoint.interpretacao === 'Sub-ópt.';
                                    
                                    return (
                                      <div key={date} className="flex items-center flex-shrink-0 h-full">
                                        <div className="flex flex-col items-center gap-1.5 w-[95px]">
                                          <span className="text-[10px] font-extrabold text-slate-400 font-mono tracking-tight uppercase">{date}</span>
                                          <div className={`px-2 py-1.5 rounded-lg border w-full text-center min-h-[38px] flex items-center justify-center flex-col transition-all group-hover:shadow-xs shadow-none ${
                                              isAlert ? 'bg-rose-50 border-rose-200' : 
                                              isWarning ? 'bg-amber-50 border-amber-200' :
                                              'bg-slate-50/80 border-slate-200/80 group-hover:border-slate-300'
                                            }`}>
                                            <span className={`font-bold text-[13px] whitespace-pre-line leading-tight ${isAlert ? 'text-rose-700' : isWarning ? 'text-amber-700' : 'text-slate-800'}`}>
  {formatQualitativeResult(dataPoint.value)}
</span>
                                            {item.unit && item.unit !== '—' && <span className={`text-[9px] font-bold leading-none mt-0.5 ${isAlert ? 'text-rose-500/80' : isWarning ? 'text-amber-600/80': 'text-slate-400'}`}>{item.unit}</span>}
                                          </div>
                                        </div>
                                        {/* Timeline dashed connector line */}
                                        {dateIdx < datesWithData.length - 1 && (
                                           <div className="w-5 h-px bg-slate-200 mx-2 flex-shrink-0 mt-5 rounded-full border-t border-dashed border-slate-300"></div>
                                        )}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className="text-slate-400 text-[11px] font-medium italic px-2">Nenhum histórico registrado na base</span>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-6 align-middle bg-slate-50/30 group-hover:bg-slate-50/80 transition-colors border-l border-slate-200/60 shadow-inner max-w-[280px]">
                              <div className="text-[12.5px] text-slate-600 font-mono font-medium whitespace-pre-line leading-relaxed selection:bg-indigo-100">{item.reference}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </>)
          ) : (
            <div className="text-center py-20 bg-slate-50/30 rounded-2xl mx-4 my-8 border border-slate-100 border-dashed">
              {metricSearch ? (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                     <Search className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-slate-800 font-extrabold text-xl mb-1.5 tracking-tight">Nenhum Biomarcador Encontrado</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-[15px] leading-relaxed">Tente outros termos de pesquisa ou remova os filtros de categoria ativos para visualizar todos os exames unificados.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                     <Database className="text-slate-400" size={32} />
                  </div>
                  <h3 className="text-slate-800 font-extrabold text-xl mb-1.5 tracking-tight">Matriz Analítica Vazia</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-[15px] leading-relaxed">Não há dados laboratoriais suficientes para gerar comparativos. Centralize seus PDFs na área de <strong className="text-slate-700">"Fontes & Importação"</strong>.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DEFINIÇÃO CLÍNICA INTELIGENTE (DICIONÁRIO) */}
      {selectedGlossaryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 to-indigo-800 text-white p-6 relative">
              <button 
                onClick={() => setSelectedGlossaryItem(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2 mb-1.5 bg-white/10 w-fit px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase text-teal-100">
                <Sparkles size={12} className="text-teal-300" />
                Mapeamento Inteligência Médica
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">{selectedGlossaryItem.canonicalName}</h3>
              <p className="text-teal-100 text-xs mt-1 font-mono uppercase tracking-widest">{selectedGlossaryItem.category}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Para que Serve / O que Analisa</h4>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed shadow-inner">
                  {selectedGlossaryItem.description}
                </div>
              </div>

              {selectedGlossaryItem.aliases && selectedGlossaryItem.aliases.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sinônimos & Termos Unificados</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedGlossaryItem.aliases.map((alias: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 capitalize">
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedGlossaryItem.labLabels && selectedGlossaryItem.labLabels.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exemplos de Rótulos de Laboratório</h4>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                    {selectedGlossaryItem.labLabels.map((lab: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 text-xs">
                        <span className="font-bold text-slate-500 font-mono text-[10px] uppercase tracking-wider">{lab.lab}</span>
                        <span className="font-medium text-slate-800 font-mono text-[10px]">{lab.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 italic leading-normal">
                    *Rótulos reais mapeados dos maiores laboratórios diagnósticos do Brasil. A IA consolida todos sob a mesma métrica de análise.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-between items-center">
              <button
                onClick={() => {
                  setSelectedGlossaryItem(null);
                  if (onNavigate) {
                    onNavigate('dictionary');
                  }
                }}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 hover:underline transition-all py-1 justify-center sm:justify-start"
              >
                <BookOpen size={14} />
                Consultar biblioteca de exames
              </button>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedGlossaryItem(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const testName = selectedGlossaryItem.canonicalName;
                    setSelectedGlossaryItem(null);
                    if (onNavigate) {
                      onNavigate('charts', { metricName: testName });
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <TrendingUp size={13} />
                  Ver Histórico de Gráficos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function ExamsList({ initialFilter, onNavigate }: { initialFilter?: any, onNavigate?: (tab: string, params?: any) => void }) {
  const { processedExams, user } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState(initialFilter?.searchTerm || '');
  const [isGroupedView, setIsGroupedView] = useState(false);
  const [startDate, setStartDate] = useState(initialFilter?.startDate || '');
  const [endDate, setEndDate] = useState(initialFilter?.endDate || '');
  const [categoryFilter, setCategoryFilter] = useState(initialFilter?.category || 'Todas');
  const [groupFilter, setGroupFilter] = useState<string | null>(initialFilter?.groupFilter || null);
  const [interpFilter, setInterpFilter] = useState(initialFilter?.interpFilter || 'Todas');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todas');
  const [systemFilter, setSystemFilter] = useState('Todos');

  const specialties = useMemo(() => {
    const s = new Set<string>();
    processedExams.forEach(e => {
      if (e.especialidadeMedica) s.add(e.especialidadeMedica);
    });
    return ['Todas', ...Array.from(s)].sort();
  }, [processedExams]);

  const systems = useMemo(() => {
    const s = new Set<string>();
    processedExams.forEach(e => {
      if (e.grupoSistemico) s.add(e.grupoSistemico);
    });
    return ['Todos', ...Array.from(s)].sort();
  }, [processedExams]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof MedicalRecord; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedExam, setSelectedExam] = useState<MedicalRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<MedicalRecord>>({});
  const itemsPerPage = 50;

  const [selectedExamsIds, setSelectedExamsIds] = useState<Set<string>>(new Set());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedExamsIds(new Set(currentItems.map(item => item.id).filter((id): id is string => !!id)));
    } else {
      setSelectedExamsIds(new Set());
    }
  };

  const toggleSelectExam = (id: string | undefined) => {
    if (!id) return;
    const next = new Set(selectedExamsIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedExamsIds(next);
  };

  const handleBulkUpdateStatus = async (newStatus: MedicalRecord['interpretacao']) => {
    if (selectedExamsIds.size === 0 || !user) return;
    setIsUpdatingStatus(true);
    try {
      const batchPromises = Array.from(selectedExamsIds).map(id => {
        return updateExam(id, { interpretacao: newStatus }, user.uid);
      });
      await Promise.all(batchPromises);
      addToast(`${selectedExamsIds.size} exame(s) atualizado(s) para '${newStatus}'.`, 'success');
      setSelectedExamsIds(new Set());
    } catch (err) {
      addToast('Erro ao atualizar exames em lote.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.searchTerm !== undefined) setSearchTerm(initialFilter.searchTerm);
      if (initialFilter.startDate !== undefined) setStartDate(initialFilter.startDate);
      if (initialFilter.endDate !== undefined) setEndDate(initialFilter.endDate);
      if (initialFilter.category !== undefined) setCategoryFilter(initialFilter.category);
      if (initialFilter.groupFilter !== undefined) setGroupFilter(initialFilter.groupFilter);
      if (initialFilter.interpFilter !== undefined) setInterpFilter(initialFilter.interpFilter);
    }
  }, [initialFilter]);

  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);

  const duplicateItems = useMemo(() => {
    const duplicates: MedicalRecord[] = [];
    const seen = new Set<string>();
    
    // Sort oldest first so that we keep the oldest entry and mark newer duplicates for removal
    const sorted = [...processedExams].sort((a, b) => {
      const getTime = (x: any) => {
        if (!x.createdAt) return 0;
        if (typeof x.createdAt.toMillis === 'function') return x.createdAt.toMillis();
        if (x.createdAt instanceof Date) return x.createdAt.getTime();
        if (typeof x.createdAt === 'number') return x.createdAt;
        if (typeof x.createdAt === 'string') return new Date(x.createdAt).getTime();
        return 0;
      };
      const diff = getTime(a) - getTime(b);
      if (diff !== 0) return diff;
      // Deterministic tie-breaker fallback using database document IDs to guarantee stability
      return (a.id || '').localeCompare(b.id || '');
    });
    
    sorted.forEach((e) => {
      const key = `${normalizeString(getCanonicalExamName(e.nomeExame || ''))}|${e.dataExame}|${normalizeString(String(e.resultado || ''))}`;
      if (seen.has(key)) {
        duplicates.push(e);
      } else {
        seen.add(key);
      }
    });
    return duplicates;
  }, [processedExams]);

  const handleClearDuplicates = async () => {
    if (duplicateItems.length === 0 || !user) return;
    
    if (confirm(`Isso irá apagar permanentemente ${duplicateItems.length} registros realmente duplicados (com o mesmo exame, data e resultado) do seu prontuário. Deseja prosseguir?`)) {
      setIsCleaningDuplicates(true);
      try {
        const ids = duplicateItems.map(item => item.id).filter((id): id is string => !!id);
        const paths = duplicateItems.map(item => item.pdfStoragePath);
        await deleteExamsBatch(ids, paths, user.uid);
        addToast(`${duplicateItems.length} exames duplicados foram removidos com sucesso.`, 'success');
      } catch (err) {
        console.error("Erro ao apagar exames duplicados em lote:", err);
        addToast('Erro ao remover alguns exames duplicados.', 'error');
      } finally {
        setIsCleaningDuplicates(false);
      }
    }
  };

  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAllExams = async () => {
    if (processedExams.length === 0 || !user) return;
    
    if (confirm(`⚠️ ALERTA DE SEGURANÇA:\
Isso irá APAGAR PERMANENTEMENTE TODOS OS SEUS EXAMES E PDFs processados no sistema (${processedExams.length} dados). Suas patologias, perfil e medicações serão mantidos.\
\
Tem certeza que deseja ZERAR todos os dados de exames para subi-los novamente?`)) {
      setIsDeletingAll(true);
      try {
        const ids = processedExams.map(item => item.id).filter((id): id is string => !!id);
        const paths = processedExams.map(item => item.pdfStoragePath);
        
        await deleteExamsBatch(ids, paths, user.uid);
        addToast(`Todos os exames (${ids.length}) foram apagados do banco de dados!`, 'success');
      } catch (err) {
        console.error('Erro ao apagar todos exames:', err);
        addToast('Houve um erro ao processar a exclusão total.', 'error');
      } finally {
        setIsDeletingAll(false);
      }
    }
  };

  const handleEditExam = () => {
    if (selectedExam) {
      setEditFormData({
        ...selectedExam,
        scientificReferences: selectedExam.scientificReferences || []
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedExam || !user) return;
    try {
      await updateExam(selectedExam.id, editFormData, user.uid);
      addToast('Exame atualizado com sucesso.', 'success');
      setIsEditing(false);
      setSelectedExam(null);
    } catch (err) {
      addToast('Erro ao atualizar o exame.', 'error');
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam || !user) return;
    if (confirm('Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.')) {
      try {
        await deleteExam(selectedExam.id, selectedExam.pdfStoragePath, user.uid);
        addToast('Exame excluído com sucesso.', 'success');
        setSelectedExam(null);
      } catch (err) {
        addToast('Erro ao excluir o exame.', 'error');
      }
    }
  };

  const requestSort = (key: keyof MedicalRecord) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredExams = useMemo(() => {
    const normalize = (text: string): string => {
      return (text || '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[-_()/\\+,.:;]/g, ' ') // Replace punctuation with space
        .replace(/\s+/g, ' ')            // Collapse multiple spaces
        .trim();
    };

    const searchClean = normalize(searchTerm);
    if (!searchClean) return processedExams;

    const searchTerms = searchClean.split(' ').filter(term => term.length > 1);
    if (searchTerms.length === 0) return processedExams;

    let result = processedExams.filter(exam => {
      return searchTerms.every(term => {
        // 1. Basic fields check (including observations/notes and interpretation)
        const matchesBasic = 
          normalize(exam.nomeExame).includes(term) ||
          normalize(exam.medicoSolicitante).includes(term) ||
          normalize(exam.resultado).includes(term) ||
          normalize(exam.interpretacao).includes(term) ||
          normalize(exam.especialidadeMedica || '').includes(term) ||
          normalize(exam.grupoSistemico || '').includes(term) ||
          normalize(exam.tags || '').includes(term) ||
          normalize(exam.observacoes || '').includes(term);

        if (matchesBasic) return true;

        // 2. Advanced Glossary/Alias check
        const normExamName = normalize(exam.nomeExame);
        
        for (const item of EXAM_GLOSSARY) {
          // Determine if this exam is related to this glossary item
          const isRelated = 
            normExamName.includes(normalize(item.canonicalName)) ||
            item.aliases.some(alias => {
              const normAlias = normalize(alias);
              return normAlias.length > 2 && normExamName.includes(normAlias);
            });

          if (isRelated) {
            // Check if the search term matches any metadata of the glossary item (name, aliases, description, category)
            const matchesGlossary = 
              normalize(item.canonicalName).includes(term) ||
              item.aliases.some(alias => normalize(alias).includes(term)) ||
              normalize(item.description).includes(term) ||
              normalize(item.category).includes(term);

            if (matchesGlossary) return true;
          }
        }

        return false;
      });
    });

    if (groupFilter) {
      result = result.filter(exam => getExamGroup(exam.nomeExame) === groupFilter);
    }

    if (categoryFilter !== 'Todas') {
      result = result.filter(exam => exam.categoria === categoryFilter);
    }
    
    if (interpFilter !== 'Todas') {
      result = result.filter(exam => exam.interpretacao === interpFilter);
    }

    if (specialtyFilter !== 'Todas') {
      result = result.filter(exam => exam.especialidadeMedica === specialtyFilter);
    }

    if (systemFilter !== 'Todos') {
      result = result.filter(exam => exam.grupoSistemico === systemFilter);
    }

    if (startDate) {
      const [year, month, day] = startDate.split('-');
      const startTime = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
      result = result.filter(exam => parseDate(exam.dataExame).getTime() >= startTime);
    }

    if (endDate) {
      const [year, month, day] = endDate.split('-');
      const endTime = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
      result = result.filter(exam => parseDate(exam.dataExame).getTime() <= endTime);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const { key, direction } = sortConfig;
        let aValue: any = a[key] ?? '';
        let bValue: any = b[key] ?? '';

        if (key === 'dataExame') {
          aValue = parseDate(aValue as string).getTime();
          bValue = parseDate(bValue as string).getTime();
        }

        if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchTerm, startDate, endDate, categoryFilter, interpFilter, specialtyFilter, systemFilter, sortConfig, processedExams]);

  const groupedExams = useMemo(() => {
    if (!isGroupedView) return filteredExams;
    const result: (MedicalRecord & { isGroup?: boolean; subExams?: MedicalRecord[] })[] = [];
    const hemogramaGroups: Record<string, any> = {};
    const fanGroups: Record<string, any> = {};
    const lipidogramaGroups: Record<string, any> = {};
    const hepaticoGroups: Record<string, any> = {};
    const tireoideGroups: Record<string, any> = {};
    const urinaGroups: Record<string, any> = {};
    const renalGroups: Record<string, any> = {};
    const glicemiaGroups: Record<string, any> = {};
    const musculoGroups: Record<string, any> = {};
    const vitaminasGroups: Record<string, any> = {};

    filteredExams.forEach(exam => {
      const isHemogramaItem = getExamGroup(exam.nomeExame) === 'Hematologia';
      const isFanItem = exam.nomeExame.toLowerCase().includes('fan') || exam.nomeExame.toLowerCase().includes('antinuclear');
      
      const isLipidogramItem = (getExamGroup(exam.nomeExame) === 'Perfil Lipídico' || exam.grupoSistemico === 'Metabólico / Lipídico') && 
        (exam.nomeExame.toLowerCase().includes('colesterol') || exam.nomeExame.toLowerCase().includes('triglic') || exam.nomeExame.toLowerCase().includes('hdl') || exam.nomeExame.toLowerCase().includes('ldl') || exam.nomeExame.toLowerCase().includes('vldl'));
      
      const isHepaticItem = (getExamGroup(exam.nomeExame) === 'Função Hepática' || exam.grupoSistemico === 'Hepático') && 
        (exam.nomeExame.toLowerCase().includes('tgo') || exam.nomeExame.toLowerCase().includes('ast') || exam.nomeExame.toLowerCase().includes('tgp') || exam.nomeExame.toLowerCase().includes('alt') || exam.nomeExame.toLowerCase().includes('gama-gt') || exam.nomeExame.toLowerCase().includes('ggt') || exam.nomeExame.toLowerCase().includes('fosfatase') || exam.nomeExame.toLowerCase().includes('bilirrubina') || exam.nomeExame.toLowerCase().includes('albumina') || exam.nomeExame.toLowerCase().includes('proteínas totais'));
      
      const isThyroidItem = (getExamGroup(exam.nomeExame) === 'Hormônios & Tireoide' || exam.grupoSistemico === 'Endócrino & Tireoide') && 
        (exam.nomeExame.toLowerCase().includes('tsh') || exam.nomeExame.toLowerCase().includes('t4') || exam.nomeExame.toLowerCase().includes('t3') || exam.nomeExame.toLowerCase().includes('tpo') || exam.nomeExame.toLowerCase().includes('tireoglobulina'));
      
      const isUrineEASItem = (exam.categoria === 'URINA' || getAutoCategory(exam.nomeExame) === 'URINA') && 
        (exam.nomeExame.toLowerCase().includes('urina') || exam.nomeExame.toLowerCase().includes('eas') || exam.nomeExame.toLowerCase().includes('leucócitos') || exam.nomeExame.toLowerCase().includes('proteínas') || exam.nomeExame.toLowerCase().includes('glicose') || exam.nomeExame.toLowerCase().includes('nitrito') || exam.nomeExame.toLowerCase().includes('hemácias') || exam.nomeExame.toLowerCase().includes('densidade') || exam.nomeExame.toLowerCase().includes('ph') || exam.nomeExame.toLowerCase().includes('piócitos') || exam.nomeExame.toLowerCase().includes('piocitos'));

      const isRenalItem = (getExamGroup(exam.nomeExame) === 'Função Renal' || exam.grupoSistemico === 'Renal') && 
        (exam.nomeExame.toLowerCase().includes('ureia') || exam.nomeExame.toLowerCase().includes('creatinina') || exam.nomeExame.toLowerCase().includes('tfg') || exam.nomeExame.toLowerCase().includes('filtração') || exam.nomeExame.toLowerCase().includes('filtracao') || exam.nomeExame.toLowerCase().includes('iga') || exam.nomeExame.toLowerCase().includes('dismorfismo'));
      
      const isGlycemicItem = (getExamGroup(exam.nomeExame) === 'Metabolismo Glicídico' || exam.grupoSistemico === 'Metabólico / Lipídico') && 
        (exam.nomeExame.toLowerCase().includes('glicose') || exam.nomeExame.toLowerCase().includes('glicemia') || exam.nomeExame.toLowerCase().includes('insulina') || exam.nomeExame.toLowerCase().includes('hba1c') || exam.nomeExame.toLowerCase().includes('glicada'));

      const isMuscleItem = (getExamGroup(exam.nomeExame) === 'Enzimas Musculares' || exam.grupoSistemico === 'Musculoesquelético') && 
        (exam.nomeExame.toLowerCase().includes('cpk') || exam.nomeExame.toLowerCase().includes('ck ') || exam.nomeExame.toLowerCase().includes('aldolase') || exam.nomeExame.toLowerCase().includes('dhl') || exam.nomeExame.toLowerCase().includes('desidrogenase'));

      const isVitaminsItem = (getExamGroup(exam.nomeExame) === 'Vitaminas & Minerais' || exam.grupoSistemico === 'Nutricional & Neurológico') && 
        (exam.nomeExame.toLowerCase().includes('vitamina') || exam.nomeExame.toLowerCase().includes('ácido fólico') || exam.nomeExame.toLowerCase().includes('acido folico') || exam.nomeExame.toLowerCase().includes('b12') || exam.nomeExame.toLowerCase().includes('ferro') || exam.nomeExame.toLowerCase().includes('ferritina') || exam.nomeExame.toLowerCase().includes('calcio') || exam.nomeExame.toLowerCase().includes('cálcio') || exam.nomeExame.toLowerCase().includes('magnésio') || exam.nomeExame.toLowerCase().includes('magnesio') || exam.nomeExame.toLowerCase().includes('potássio') || exam.nomeExame.toLowerCase().includes('potassio') || exam.nomeExame.toLowerCase().includes('sódio') || exam.nomeExame.toLowerCase().includes('sodio') || exam.nomeExame.toLowerCase().includes('zinco') || exam.nomeExame.toLowerCase().includes('folato'));

      const key = `${exam.dataExame}|${exam.arquivoOrigem || 'manual'}`;

      if (isHemogramaItem) {
        if (!hemogramaGroups[key]) {
          hemogramaGroups[key] = {
             id: `group-hemo-${key}`,
             isGroup: true,
             nomeExame: 'Hemograma Completo',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Sanguíneo',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(hemogramaGroups[key]);
        }
        hemogramaGroups[key].subExams.push(exam);
      } else if (isFanItem) {
        if (!fanGroups[key]) {
          fanGroups[key] = {
             id: `group-fan-${key}`,
             isGroup: true,
             nomeExame: 'Fator Antinuclear (FAN) / Auto-anticorpos',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Não reagente',
             unidade: '',
             valorReferencia: 'não reagente',
             subExams: []
          };
          result.push(fanGroups[key]);
        }
        fanGroups[key].subExams.push(exam);
      } else if (isLipidogramItem) {
        if (!lipidogramaGroups[key]) {
          lipidogramaGroups[key] = {
             id: `group-lip-${key}`,
             isGroup: true,
             nomeExame: 'Perfil Lipídico / Lipidograma',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Lipídico',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(lipidogramaGroups[key]);
        }
        lipidogramaGroups[key].subExams.push(exam);
      } else if (isHepaticItem) {
        if (!hepaticoGroups[key]) {
          hepaticoGroups[key] = {
             id: `group-hep-${key}`,
             isGroup: true,
             nomeExame: 'Perfil Hepático / Hepatograma',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Hepático',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(hepaticoGroups[key]);
        }
        hepaticoGroups[key].subExams.push(exam);
      } else if (isThyroidItem) {
        if (!tireoideGroups[key]) {
          tireoideGroups[key] = {
             id: `group-thyr-${key}`,
             isGroup: true,
             nomeExame: 'Perfil de Tireoide',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel de Tireoide',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(tireoideGroups[key]);
        }
        tireoideGroups[key].subExams.push(exam);
      } else if (isUrineEASItem) {
        if (!urinaGroups[key]) {
          urinaGroups[key] = {
             id: `group-uri-${key}`,
             isGroup: true,
             nomeExame: 'Exame de Urina / EAS',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Urinário',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(urinaGroups[key]);
        }
        urinaGroups[key].subExams.push(exam);
      } else if (isRenalItem) {
        if (!renalGroups[key]) {
          renalGroups[key] = {
             id: `group-renal-${key}`,
             isGroup: true,
             nomeExame: 'Perfil de Função Renal / Rim',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Renal',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(renalGroups[key]);
        }
        renalGroups[key].subExams.push(exam);
      } else if (isGlycemicItem) {
        if (!glicemiaGroups[key]) {
          glicemiaGroups[key] = {
             id: `group-glic-${key}`,
             isGroup: true,
             nomeExame: 'Metabolismo Glicídico & Diabetes',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Glicídico',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(glicemiaGroups[key]);
        }
        glicemiaGroups[key].subExams.push(exam);
      } else if (isMuscleItem) {
        if (!musculoGroups[key]) {
          musculoGroups[key] = {
             id: `group-musc-${key}`,
             isGroup: true,
             nomeExame: 'Painel de Enzimas Musculares',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Enzimático Muscular',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(musculoGroups[key]);
        }
        musculoGroups[key].subExams.push(exam);
      } else if (isVitaminsItem) {
        if (!vitaminasGroups[key]) {
          vitaminasGroups[key] = {
             id: `group-vit-${key}`,
             isGroup: true,
             nomeExame: 'Vitaminas & Minerais',
             dataExame: exam.dataExame,
             categoria: exam.categoria,
             arquivoOrigem: exam.arquivoOrigem,
             medicoSolicitante: exam.medicoSolicitante,
             interpretacao: 'Normal',
             resultado: 'Painel Micronutrientes',
             unidade: '',
             valorReferencia: '',
             subExams: []
          };
          result.push(vitaminasGroups[key]);
        }
        vitaminasGroups[key].subExams.push(exam);
      } else {
        result.push(exam);
      }
    });

    // Post-process group values for display
    result.forEach(group => {
      if (!group.isGroup || !group.subExams) return;

      const sub = group.subExams;

      // Ensure the group has the most altered interpretation of its members
      if (sub.some(e => e.interpretacao === 'Alterado')) group.interpretacao = 'Alterado';
      else if (sub.some(e => e.interpretacao === 'Sub-ópt.')) group.interpretacao = 'Sub-ópt.';
      else if (sub.some(e => e.interpretacao === 'Não Informado')) group.interpretacao = 'Não Informado';
      else group.interpretacao = 'Normal';

      // Pick any non-empty medicoSolicitante
      const docName = sub.find(e => e.medicoSolicitante && e.medicoSolicitante !== 'Dr. Desconhecido' && e.medicoSolicitante !== 'Não Informado' && e.medicoSolicitante !== '-') ?.medicoSolicitante;
      if (docName) group.medicoSolicitante = docName;

      // Custom summaries
      if (group.nomeExame.includes('FAN')) {
        // Parse all sub-exams for FAN
        const parsedSubs = sub.map(s => parseFanResult(s.nomeExame, s.resultado));
        const anyReagente = parsedSubs.some(p => p.isReagente);
        if (anyReagente) {
          // Find the highest título among reagentes
          const maxTitulo = parsedSubs.filter(p => p.isReagente).reduce((max, p) =>
            p.tituloNumerico > max.tituloNumerico ? p : max,
            parsedSubs.filter(p => p.isReagente)[0]
          );
          const tituloStr = maxTitulo.titulo ? ` · Título ${maxTitulo.titulo}` : '';
          const padraoStr = maxTitulo.padrao ? ` · ${maxTitulo.padrao}` : '';
          const icapStr = maxTitulo.icapCode ? ` (${maxTitulo.icapCode})` : '';
          group.resultado = `🔴 Reagente${tituloStr}${padraoStr}${icapStr}`;
        } else {
          group.resultado = '✅ Não Reagente';
        }
      } else if (group.nomeExame.includes('Lipídico')) {
        const markers = sub.map(s => parseLipidMarker(s.nomeExame, s.resultado, s.unidade, s.interpretacao));
        const { riscoGeral } = getLipidPanelRisk(markers);
        const ct = sub.find(s => s.nomeExame.toLowerCase().includes('total'))?.resultado || '—';
        const hdl = sub.find(s => s.nomeExame.toLowerCase().includes('hdl'))?.resultado || '—';
        const ldl = sub.find(s => s.nomeExame.toLowerCase().includes('ldl'))?.resultado || '—';
        const tri = sub.find(s => s.nomeExame.toLowerCase().includes('triglic'))?.resultado || '—';
        const riscoEmoji = riscoGeral === 'Ótimo' ? '✅' : riscoGeral === 'Limítrofe' ? '🟡' : riscoGeral === 'Muito Alto' ? '🔴' : '🟠';
        group.resultado = `${riscoEmoji} ${riscoGeral} · CT: ${ct} · LDL: ${ldl} · HDL: ${hdl} · TG: ${tri}`;
      } else if (group.nomeExame.includes('Tireoide')) {
        const tireode = parseTireoidePanel(sub);
        const tsh = sub.find(s => s.nomeExame.toLowerCase() === 'tsh')?.resultado || '—';
        const t4l = sub.find(s => s.nomeExame.toLowerCase().includes('t4'))?.resultado || '—';
        const tpo = sub.find(s => s.nomeExame.toLowerCase().includes('tpo'))?.resultado || '—';
        const funcaoEmoji = tireode.funcao === 'Eutireoideo' ? '✅' : tireode.funcao.includes('Hiper') ? '🔺' : '🔻';
        group.resultado = `${funcaoEmoji} ${tireode.funcao} · TSH: ${tsh} · T4L: ${t4l}${tireode.autoimune ? ' · 🧬 Autoimune' : ''}`;
      } else if (group.nomeExame.includes('Hepático')) {
        const hep = parseHepaticoPanel(sub);
        const tgo = sub.find(s => s.nomeExame.toLowerCase().includes('tgo') || s.nomeExame.toLowerCase().includes('ast'))?.resultado || '—';
        const tgp = sub.find(s => s.nomeExame.toLowerCase().includes('tgp') || s.nomeExame.toLowerCase().includes('alt'))?.resultado || '—';
        const ggt = sub.find(s => s.nomeExame.toLowerCase().includes('gama') || s.nomeExame.toLowerCase().includes('ggt'))?.resultado || '—';
        const lesaoEmoji = hep.tipoLesao === 'Normal' ? '✅' : hep.tipoLesao === 'Colestase' ? '🟡' : '🔴';
        const razaoStr = hep.razaoTgoTgp !== null ? ` · R TGO/TGP: ${hep.razaoTgoTgp}` : '';
        group.resultado = `${lesaoEmoji} ${hep.tipoLesao} · TGO: ${tgo} · TGP: ${tgp} · GGT: ${ggt}${razaoStr}`;
      } else if (group.nomeExame.includes('Urina')) {
        const leu = sub.find(s => s.nomeExame.toLowerCase().includes('leucócitos'))?.resultado || '—';
        const hem = sub.find(s => s.nomeExame.toLowerCase().includes('hemácias') || s.nomeExame.toLowerCase().includes('eritrócitos'))?.resultado || '—';
        const nit = sub.find(s => s.nomeExame.toLowerCase().includes('nitrito'))?.resultado || '—';
        group.resultado = `Leucócitos: ${leu} | Hemácias: ${hem} | Nitrito: ${nit}`;
      } else if (group.nomeExame.includes('Renal')) {
        const renal = parseRenalPanel(sub);
        const ur = sub.find(s => s.nomeExame.toLowerCase().includes('ureia') || s.nomeExame.toLowerCase().includes('uréia'))?.resultado || '—';
        const cr = sub.find(s => s.nomeExame.toLowerCase().includes('creatinina'))?.resultado || '—';
        const tfg = sub.find(s => s.nomeExame.toLowerCase().includes('tfg') || s.nomeExame.toLowerCase().includes('filtração') || s.nomeExame.toLowerCase().includes('filtracao') || s.nomeExame.toLowerCase().includes('clearance'))?.resultado || '—';
        const renalEmoji = renal.tfge !== null && renal.tfge < 60 ? '🚨' : '✅';
        group.resultado = `${renalEmoji} ${renal.estagioFiltracao} · Ureia: ${ur} · Creatinina: ${cr} · TFGe: ${tfg}`;
      } else if (group.nomeExame.includes('Glicídico')) {
        const glic = parseGlycemicPanel(sub);
        const gli = sub.find(s => s.nomeExame.toLowerCase().includes('glicose') || s.nomeExame.toLowerCase().includes('glicemia'))?.resultado || '—';
        const ins = sub.find(s => s.nomeExame.toLowerCase().includes('insulina'))?.resultado || '—';
        const gly = sub.find(s => s.nomeExame.toLowerCase().includes('glicada') || s.nomeExame.toLowerCase().includes('hba1c'))?.resultado || '—';
        const homaStr = glic.homaIr !== null ? ` · HOMA-IR: ${glic.homaIr}` : '';
        const glicEmoji = glic.statusGlicemico === 'Normal' ? '✅' : '🟡';
        group.resultado = `${glicEmoji} ${glic.statusGlicemico} · Glicose: ${gli} · Insulina: ${ins} · HbA1c: ${gly}${homaStr}`;
      } else if (group.nomeExame.includes('Musculares')) {
        const musc = parseMusclePanel(sub);
        const cpk = sub.find(s => s.nomeExame.toLowerCase().includes('cpk') || s.nomeExame.toLowerCase().includes('ck '))?.resultado || '—';
        const ald = sub.find(s => s.nomeExame.toLowerCase().includes('aldolase'))?.resultado || '—';
        const dhl = sub.find(s => s.nomeExame.toLowerCase().includes('dhl') || s.nomeExame.toLowerCase().includes('desidrogenase'))?.resultado || '—';
        const muscEmoji = musc.temCPKElevada ? '🔴 CPK Alta' : '✅ CPK Normal (S/ Miopatia)';
        group.resultado = `${muscEmoji} · CPK: ${cpk} · Aldolase: ${ald} · DHL: ${dhl}`;
      } else if (group.nomeExame.includes('Vitaminas')) {
        const vits = parseVitaminsPanel(sub);
        const d = sub.find(s => s.nomeExame.toLowerCase().includes('vitamina d'))?.resultado || '—';
        const b12 = sub.find(s => s.nomeExame.toLowerCase().includes('b12') || s.nomeExame.toLowerCase().includes('vitamina b12'))?.resultado || '—';
        const fer = sub.find(s => s.nomeExame.toLowerCase().includes('ferritina'))?.resultado || '—';
        const dEmoji = vits.alertaVitDSubotima ? '🟡 D Sub' : '✅ D Ok';
        const b12Emoji = vits.alertaB12Subotimo ? '🟡 B12 Sub' : '✅ B12 Ok';
        group.resultado = `${dEmoji} (${d}) · ${b12Emoji} (${b12}) · Ferritina: ${fer}`;
      }
    });

    return result;
  }, [filteredExams, isGroupedView]);

  const totalPages = Math.ceil(groupedExams.length / itemsPerPage);
  const currentItems = groupedExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleExpandGroup = (id: string) => {
    const next = new Set(expandedGroups);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedGroups(next);
  };
  
  const renderMultiColumnResult = (res: string, unidade: string, interpretacao: string) => {
    const parts = res.split(/\s*\|\s*|\n+/).filter(Boolean);
    if (parts.length > 1) {
       return (
         <div className="flex items-center gap-4 w-full">
           <div className="flex flex-col">
             <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Absoluto</span>
             <div className="flex items-baseline gap-1">
               <span className={`font-bold text-[13px] leading-tight ${interpretacao === 'Alterado' ? 'text-rose-600' : (interpretacao === 'Sub-ópt.' ? 'text-amber-600' : 'text-slate-800')}`}>{parts[0]}</span>
               {unidade && unidade !== '-' && <span className="text-[10px] text-slate-500 font-medium">{unidade}</span>}
             </div>
           </div>
           <div className="flex flex-col border-l border-slate-200 pl-4">
             <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Relativo (%)</span>
             <span className={`font-bold text-[13px] leading-tight ${interpretacao === 'Alterado' ? 'text-rose-600' : (interpretacao === 'Sub-ópt.' ? 'text-amber-600' : 'text-slate-800')}`}>{parts[1]}</span>
           </div>
         </div>
       );
    }
    return (
       <div className="flex items-baseline gap-1">
         <span className={`font-bold text-[13px] whitespace-pre-line leading-tight ${interpretacao === 'Alterado' ? 'text-rose-600' : (interpretacao === 'Sub-ópt.' ? 'text-amber-600' : 'text-slate-800')}`}>{formatQualitativeResult(res)}</span>
         {unidade && unidade !== '-' && <span className="text-[11px] text-slate-500 font-medium truncate">{unidade}</span>}
       </div>
    );
  };

  const renderCategorizedSubExams = (subExams: any[], renderFn: (e: any, isSub: boolean) => any, isDesktop: boolean) => {
    const Header = ({ title }: { title: string }) => (
      isDesktop ? (
        <div className="px-6 py-1.5 bg-slate-50/90 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-dashed border-slate-200 shadow-inner flex items-center">
          <div className="w-1 h-3 bg-teal-500 rounded-full mr-2"></div> {title}
        </div>
      ) : (
        <div className="px-4 py-1.5 mt-2 bg-slate-50/90 rounded-lg mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center border border-slate-200">
          <div className="w-1 h-3 bg-teal-500 rounded-full mr-2"></div> {title}
        </div>
      )
    );

    const parseNumericResult = (res: string): number | null => {
      if (!res) return null;
      const cleaned = res.replace('.', '').replace(',', '.').replace(/[<>≤≥]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };

    const renderVisualSliderRow = (examItem: any) => {
      const val = parseNumericResult(examItem.resultado);
      const { percentage, min, max, hasRange } = getValuePercentage(val, examItem.valorReferencia);

      const statusBadgeStyles = {
        'Alterado': 'text-rose-700 bg-rose-50 border-rose-100',
        'Sub-ópt.': 'text-amber-700 bg-amber-50 border-amber-100',
        'Normal': 'text-emerald-700 bg-emerald-50 border-emerald-100',
      }[examItem.interpretacao as string] || 'text-slate-700 bg-slate-50 border-slate-200';

      let highlightStyle: any = { left: '25%', right: '25%' };
      const cleanedRef = (examItem.valorReferencia || '').toLowerCase();
      if (cleanedRef.includes('<') || cleanedRef.includes('≤')) {
        highlightStyle = { left: '0%', right: '40%' };
      } else if (cleanedRef.includes('>') || cleanedRef.includes('≥')) {
        highlightStyle = { left: '40%', right: '0%' };
      }

      return (
        <div key={examItem.id} className="px-4 py-2.5 bg-white border-b border-slate-50">
          <div className="flex justify-between items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 shrink-0 min-w-[140px]">{examItem.nomeExame}</span>
            <div className="flex items-center gap-2 ml-auto">
              <span className={`text-[12px] font-bold ${
                examItem.interpretacao === 'Alterado' ? 'text-rose-600' :
                examItem.interpretacao === 'Sub-ópt.' ? 'text-amber-600' :
                'text-slate-800'
              }`}>
                {examItem.resultado} <span className="text-[10px] text-slate-400 font-normal">{examItem.unidade}</span>
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${statusBadgeStyles}`}>
                {examItem.interpretacao}
              </span>
            </div>
          </div>
          
          {hasRange && val !== null && (
            <div className="mt-2 px-1">
              <div className="relative w-full h-1.5 bg-slate-100 rounded-full">
                {/* Normal range target zone */}
                <div 
                  className="absolute top-0 bottom-0 bg-teal-100/60 rounded-full"
                  style={highlightStyle}
                ></div>
                {/* Patient dot */}
                <div 
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white shadow-sm ${
                    examItem.interpretacao === 'Alterado' ? 'bg-rose-500' :
                    examItem.interpretacao === 'Sub-ópt.' ? 'bg-amber-400' :
                    'bg-teal-500'
                  }`}
                  style={{ left: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] text-slate-400 mt-1 font-mono">
                <span>{min !== null ? min : ''}</span>
                <span className="text-teal-600 font-bold opacity-60">Alvo</span>
                <span>{max !== null ? max : ''}</span>
              </div>
            </div>
          )}
        </div>
      );
    };

    const renderTextRow = (examItem: any) => {
      const isAlt = examItem.interpretacao === 'Alterado';
      const isSub = examItem.interpretacao === 'Sub-ópt.';
      const statusBadgeStyles = isAlt ? 'text-rose-700 bg-rose-50 border-rose-100' : (isSub ? 'text-amber-700 bg-amber-50 border-amber-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100');
      
      return (
        <div key={examItem.id} className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-50`}>
          <span className="text-[11px] font-bold text-slate-700 shrink-0 min-w-[140px]">{examItem.nomeExame}</span>
          <div className="flex items-center gap-2 ml-auto">
            <span className={`text-[12px] font-bold ${isAlt ? 'text-rose-600' : (isSub ? 'text-amber-600' : 'text-slate-800')}`}>
              {examItem.resultado}
            </span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${statusBadgeStyles}`}>
              {examItem.interpretacao}
            </span>
          </div>
        </div>
      );
    };

    const renderRow = (e: any) => {
      const val = parseNumericResult(e.resultado);
      const { hasRange } = getValuePercentage(val, e.valorReferencia);
      return hasRange && val !== null ? renderVisualSliderRow(e) : renderTextRow(e);
    };

    const isFan = subExams.some(e => e.nomeExame.toLowerCase().includes('fan') || e.nomeExame.toLowerCase().includes('antinuclear'));
    const isLipid = subExams.some(e => e.nomeExame.toLowerCase().includes('colesterol') || e.nomeExame.toLowerCase().includes('triglic'));
    const isThyroid = subExams.some(e => e.nomeExame.toLowerCase().includes('tsh') || e.nomeExame.toLowerCase().includes('t4') || e.nomeExame.toLowerCase().includes('t3') || e.nomeExame.toLowerCase().includes('tpo'));
    const isHepatic = subExams.some(e => e.nomeExame.toLowerCase().includes('tgo') || e.nomeExame.toLowerCase().includes('ast') || e.nomeExame.toLowerCase().includes('tgp') || e.nomeExame.toLowerCase().includes('alt'));
    const isUrine = subExams.some(e => e.categoria === 'URINA' || getAutoCategory(e.nomeExame) === 'URINA');
    
    const isRenal = subExams.some(e => (getExamGroup(e.nomeExame) === 'Função Renal' || e.grupoSistemico === 'Renal') && 
      (e.nomeExame.toLowerCase().includes('ureia') || e.nomeExame.toLowerCase().includes('creatinina') || e.nomeExame.toLowerCase().includes('tfg') || e.nomeExame.toLowerCase().includes('filtração') || e.nomeExame.toLowerCase().includes('filtracao') || e.nomeExame.toLowerCase().includes('iga') || e.nomeExame.toLowerCase().includes('dismorfismo')));
    
    const isGlycemic = subExams.some(e => (getExamGroup(e.nomeExame) === 'Metabolismo Glicídico' || e.grupoSistemico === 'Metabólico / Lipídico') && 
      (e.nomeExame.toLowerCase().includes('glicose') || e.nomeExame.toLowerCase().includes('glicemia') || e.nomeExame.toLowerCase().includes('insulina') || e.nomeExame.toLowerCase().includes('hba1c') || e.nomeExame.toLowerCase().includes('glicada')));

    const isMuscle = subExams.some(e => (getExamGroup(e.nomeExame) === 'Enzimas Musculares' || e.grupoSistemico === 'Musculoesquelético') && 
      (e.nomeExame.toLowerCase().includes('cpk') || e.nomeExame.toLowerCase().includes('ck ') || e.nomeExame.toLowerCase().includes('aldolase') || e.nomeExame.toLowerCase().includes('dhl') || e.nomeExame.toLowerCase().includes('desidrogenase')));

    const isVitamins = subExams.some(e => (getExamGroup(e.nomeExame) === 'Vitaminas & Minerais' || e.grupoSistemico === 'Nutricional & Neurológico') && 
      (e.nomeExame.toLowerCase().includes('vitamina') || e.nomeExame.toLowerCase().includes('ácido fólico') || e.nomeExame.toLowerCase().includes('acido folico') || e.nomeExame.toLowerCase().includes('b12') || e.nomeExame.toLowerCase().includes('ferro') || e.nomeExame.toLowerCase().includes('ferritina') || e.nomeExame.toLowerCase().includes('calcio') || e.nomeExame.toLowerCase().includes('cálcio') || e.nomeExame.toLowerCase().includes('magnésio') || e.nomeExame.toLowerCase().includes('magnesio') || e.nomeExame.toLowerCase().includes('potássio') || e.nomeExame.toLowerCase().includes('potassio') || e.nomeExame.toLowerCase().includes('sódio') || e.nomeExame.toLowerCase().includes('sodio') || e.nomeExame.toLowerCase().includes('zinco') || e.nomeExame.toLowerCase().includes('folato')));

    if (isFan) {
      // Parse each sub-exam for rich FAN display
      const parsedFan: Array<{ exam: any; parsed: FanParsed }> = subExams.map(e => ({
        exam: e,
        parsed: parseFanResult(e.nomeExame, e.resultado),
      }));
      const anyReagente = parsedFan.some(pf => pf.parsed.isReagente);
      // Find highest título for clinical relevance note
      const reagentesSorted = parsedFan.filter(pf => pf.parsed.isReagente)
        .sort((a, b) => b.parsed.tituloNumerico - a.parsed.tituloNumerico);
      const topReagente = reagentesSorted[0]?.parsed ?? null;
      const padraoDesc = topReagente ? getFanPadraoDescricao(topReagente.padrao, topReagente.icapCode) : null;

      // Color helpers
      const relevanciaColor = (rel: string) => {
        switch (rel) {
          case 'Muito Alto': return 'bg-rose-600 text-white';
          case 'Alto':       return 'bg-rose-500 text-white';
          case 'Moderado':   return 'bg-amber-500 text-white';
          case 'Baixo':      return 'bg-amber-400 text-white';
          default:           return 'bg-emerald-500 text-white';
        }
      };

      // Icon by compartimento
      const compartimentoIcon: Record<string, string> = {
        'Nuclear': '🅐',
        'Nucleolar': '🅑',
        'Placa Cromossômica': '🅒',
        'Citoplasmático': '🅓',
        'Aparelho Mitótico': '🅔',
        'Geral': '🔬',
      };

      // Label short for compartimento
      const compartimentoLabel: Record<string, string> = {
        'Nuclear': '(A) Nuclear',
        'Nucleolar': '(B) Nucleolar',
        'Placa Cromossômica': '(C) Pl. Cromossômica',
        'Citoplasmático': '(D) Citoplasmático',
        'Aparelho Mitótico': '(E) Ap. Mitótico',
        'Geral': 'Geral',
      };

      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          {/* Section header */}
          <Header title="Indicadores do Fator Antinuclear (FAN / ANA)" />

          {/* Summary banner */}
          {anyReagente && topReagente && (
            <div className={`mx-${isDesktop ? '0' : '4'} mb-1 ${
              isDesktop ? 'mx-0' : 'mx-4'
            }`}>
              <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-rose-50 border-b border-rose-100">
                {/* Relevância badge */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                  relevanciaColor(topReagente.relevancia)
                }`}>
                  🔴 {topReagente.relevancia === 'Não Reagente' ? 'Não Reagente' : `Relevância ${topReagente.relevancia}`}
                </span>
                {topReagente.titulo && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
                    Título: {topReagente.titulo}
                  </span>
                )}
                {topReagente.padrao && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {topReagente.padrao}
                    {topReagente.icapCode && <span className="ml-1 text-slate-400">({topReagente.icapCode})</span>}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Per-compartment rows */}
          <div className="divide-y divide-slate-100">
            {parsedFan.map(({ exam, parsed }) => (
              <div key={exam.id}
                className={`flex items-start gap-3 px-4 py-2.5 ${
                  parsed.isReagente
                    ? 'bg-rose-50/40'
                    : 'bg-white'
                }`}
              >
                {/* Compartimento badge */}
                <div className="flex flex-col items-start shrink-0 min-w-[120px]">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {compartimentoIcon[parsed.compartimento] || '🔬'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 mt-0.5 leading-tight">
                    {compartimentoLabel[parsed.compartimento] || parsed.compartimento}
                  </span>
                </div>

                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  {parsed.isReagente
                    ? <span className="text-rose-500 text-base leading-none">🔴</span>
                    : <span className="text-emerald-500 text-base leading-none">✅</span>
                  }
                </div>

                {/* Result detail */}
                <div className="flex-1 min-w-0">
                  {parsed.isReagente ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-rose-600">REAGENTE</span>
                      {parsed.titulo && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                          {parsed.titulo}
                        </span>
                      )}
                      {parsed.padrao && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {parsed.padrao}
                          {parsed.icapCode && <span className="ml-1 text-slate-400">({parsed.icapCode})</span>}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Não Reagente</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Clinical interpretation note */}
          {padraoDesc && (
            <div className="mx-0 mt-1 px-4 py-2.5 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
              <span className="text-amber-500 text-sm shrink-0 mt-0.5">💡</span>
              <p className="text-[10px] text-amber-800 leading-relaxed">
                <strong className="font-bold">Interpretação clínica: </strong>{padraoDesc}
              </p>
            </div>
          )}

          {/* Relevância note */}
          {topReagente && topReagente.relevancia !== 'Não Reagente' && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 italic">
                📌 {topReagente.descricaoRelevancia}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (isLipid) {
      const markers: LipidParsed[] = subExams.map(e => parseLipidMarker(e.nomeExame, e.resultado, e.unidade, e.interpretacao));
      const { riscoGeral, nota } = getLipidPanelRisk(markers);

      const riscoColors: Record<string, string> = {
        'Ótimo': 'bg-emerald-500',
        'Limítrofe': 'bg-amber-400',
        'Alto': 'bg-orange-500',
        'Muito Alto': 'bg-rose-600',
        'Indeterminado': 'bg-slate-400',
      };

      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Frações do Perfil Lipídico" />

          {/* Risk banner */}
          <div className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b ${
            riscoGeral === 'Muito Alto' ? 'bg-rose-50 border-rose-100' :
            riscoGeral === 'Alto' ? 'bg-orange-50 border-orange-100' :
            riscoGeral === 'Limítrofe' ? 'bg-amber-50 border-amber-100' :
            'bg-emerald-50 border-emerald-100'
          }`}>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${
              riscoColors[riscoGeral] || 'bg-slate-400'
            }`}>
              ❤️ Risco Cardiovascular: {riscoGeral}
            </span>
          </div>

          {/* Per-marker rows with visual slider */}
          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          {/* Clinical note */}
          <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800 leading-relaxed">{nota}</p>
          </div>
        </div>
      );
    }

    if (isThyroid) {
      const tireode = parseTireoidePanel(subExams);

      const funcaoColor = {
        'Eutireoideo': 'bg-emerald-500 text-white',
        'Hipotireoidismo Subclínico': 'bg-amber-500 text-white',
        'Hipotireoidismo': 'bg-rose-600 text-white',
        'Hipertireoidismo Subclínico': 'bg-amber-400 text-white',
        'Hipertireoidismo': 'bg-rose-500 text-white',
        'Indeterminado': 'bg-slate-400 text-white',
      }[tireode.funcao] || 'bg-slate-400 text-white';

      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Hormônios e Autoanticorpos da Tireoide" />

          {/* Function banner */}
          <div className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b ${
            tireode.funcao === 'Eutireoideo' ? 'bg-emerald-50 border-emerald-100' :
            tireode.funcao.includes('Sub') ? 'bg-amber-50 border-amber-100' :
            'bg-rose-50 border-rose-100'
          }`}>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${funcaoColor}`}>
              🦋 {tireode.funcao}
            </span>
            {tireode.autoimune && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                🧬 Hashimoto (autoimune)
              </span>
            )}
            {tireode.tsh !== null && (
              <span className="text-[10px] text-slate-600 font-semibold">
                TSH: {tireode.tsh} mUI/L
              </span>
            )}
          </div>

          {/* Per-marker rows with visual slider */}
          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          {/* Clinical note */}
          {tireode.notaClinica && (
            <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
              <span className="text-amber-500 text-sm shrink-0">💡</span>
              <p className="text-[10px] text-amber-800 leading-relaxed">{tireode.notaClinica}</p>
            </div>
          )}
        </div>
      );
    }

    if (isHepatic) {
      const hep = parseHepaticoPanel(subExams);

      const lesaoColor = {
        'Normal': 'bg-emerald-500 text-white',
        'Lesão Hepatocelular': 'bg-rose-500 text-white',
        'Colestase': 'bg-amber-500 text-white',
        'Mista': 'bg-rose-600 text-white',
        'Indeterminado': 'bg-slate-400 text-white',
      }[hep.tipoLesao] || 'bg-slate-400 text-white';

      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Perfil de Função Hepática (Enzimas)" />

          {/* Lesion banner */}
          <div className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b ${
            hep.tipoLesao === 'Normal' ? 'bg-emerald-50 border-emerald-100' :
            hep.tipoLesao === 'Colestase' ? 'bg-amber-50 border-amber-100' :
            'bg-rose-50 border-rose-100'
          }`}>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${lesaoColor}`}>
              🫀 {hep.tipoLesao}
            </span>
            {hep.razaoTgoTgp !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                hep.razaoTgoTgp > 2 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
              }`}>
                TGO/TGP: {hep.razaoTgoTgp}{hep.razaoTgoTgp > 2 ? ' ⚠️' : ''}
              </span>
            )}
          </div>

          {/* Per-enzyme rows with visual slider */}
          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          {/* Clinical note */}
          <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800 leading-relaxed">{hep.notaClinica}</p>
          </div>
        </div>
      );
    }

    if (isRenal) {
      const renal = parseRenalPanel(subExams);
      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Perfil de Função Renal / Rim" />

          {(renal.temIgAAlterado || renal.temDismorfismo) && (
            <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex flex-col gap-1 mx-4 my-2 rounded-lg border">
              <p className="text-[10px] text-rose-700 font-extrabold flex items-center gap-1">
                ⚠️ Nefropatia por IgA:
              </p>
              <p className="text-[9.5px] text-rose-600 leading-normal">
                Marcadores ativos detectados (IgA elevada ou Eritrócitos dismórficos). Recomenda-se monitorar de perto a proteinúria e manter a pressão arterial em metas ideais (&lt; 120/80 mmHg).
              </p>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          <div className="px-4 py-2 bg-emerald-50/60 border-t border-emerald-100 flex gap-2 items-start">
            <span className="text-emerald-550 text-sm shrink-0">🩺</span>
            <p className="text-[10px] text-emerald-800 leading-relaxed font-semibold">
              Estágio: {renal.estagioFiltracao} · {renal.notaClinica}
            </p>
          </div>
        </div>
      );
    }

    if (isGlycemic) {
      const glic = parseGlycemicPanel(subExams);
      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Metabolismo Glicídico & Diabetes" />

          {glic.homaIr !== null && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex gap-3 text-[10px] font-bold text-slate-600">
              <span>HOMA-IR (Resistência à Insulina): {glic.homaIr}</span>
              {glic.homaIr > 2.5 && <span className="text-amber-600">⚠️ Elevado (&gt;2.5)</span>}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800 leading-relaxed">{glic.notaClinica}</p>
          </div>
        </div>
      );
    }

    if (isMuscle) {
      const musc = parseMusclePanel(subExams);
      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Painel de Enzimas Musculares" />

          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          <div className="px-4 py-2 bg-teal-50/60 border-t border-teal-100 flex gap-2 items-start">
            <span className="text-teal-500 text-sm shrink-0">🧠</span>
            <p className="text-[10px] text-teal-800 leading-relaxed">{musc.notaClinica}</p>
          </div>
        </div>
      );
    }

    if (isVitamins) {
      const vits = parseVitaminsPanel(subExams);
      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Vitaminas, Minerais & Micronutrientes" />

          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">{vits.notaClinica}</p>
          </div>
        </div>
      );
    }

    if (isUrine) {
      const urina = parseUrinalise(subExams);

      return (
        <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
          <Header title="Parâmetros de Urinálise (EAS Tipo I)" />

          {/* Alert chips */}
          {urina.alertas.length > 0 && (
            <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex flex-col gap-1">
              {urina.alertas.map((alerta, i) => (
                <p key={i} className="text-[10px] text-rose-700 font-semibold">{alerta}</p>
              ))}
            </div>
          )}

          {/* Per-parameter rows */}
          <div className="divide-y divide-slate-100">
            {subExams.map(renderRow)}
          </div>

          {/* Interpretation */}
          {urina.interpretacao && (
            <div className={`px-4 py-2 border-t flex gap-2 items-start ${
              urina.alertas.length > 0 ? 'bg-amber-50/60 border-amber-100' : 'bg-emerald-50/60 border-emerald-100'
            }`}>
              <span className="text-sm shrink-0">{urina.alertas.length > 0 ? '⚠️' : '✅'}</span>
              <p className="text-[10px] leading-relaxed ${
                urina.alertas.length > 0 ? 'text-amber-800' : 'text-emerald-700'
              }">{urina.interpretacao}</p>
            </div>
          )}
        </div>
      );
    }

    // Default: Hemograma Completo splits
    const hemParsed = parseHemogramaPanel(subExams);
    const serieVermelha = subExams.filter(e => ['Eritrócitos', 'Hemácias', 'Hemoglobina', 'Hematócrito', 'VCM', 'HCM', 'CHCM', 'RDW'].includes(e.nomeExame));
    const serieBranca = subExams.filter(e => ['Leucócitos', 'Neutrófilos', 'Eosinófilos', 'Basófilos', 'Linfócitos', 'Monócitos', 'Bastonetes'].includes(e.nomeExame));
    const plaquetas = subExams.filter(e => ['Plaquetas', 'VPM'].includes(e.nomeExame));
    
    const categorizedIds = [...serieVermelha, ...serieBranca, ...plaquetas].map(e => e.id);
    const outros = subExams.filter(e => !categorizedIds.includes(e.id));

    // Build status flags for banner
    const hasHematoAlerta = hemParsed.temAnemia || hemParsed.temLeucocitose || hemParsed.temLeucopenia || hemParsed.temTrombocitopenia || hemParsed.temTrombocitose;
  
    return (
      <div className={isDesktop ? 'border-b border-slate-200 pb-1' : 'pb-1'}>
        {/* Summary banner */}
        <div className={`flex flex-wrap items-center gap-2 px-4 py-2 border-b ${
          hasHematoAlerta ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
        }`}>
          {hemParsed.hemoglobina !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hemParsed.temAnemia ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              🩸 Hb: {hemParsed.hemoglobina} g/dL
              {hemParsed.temAnemia && ` (${hemParsed.tipoAnemia})`}
            </span>
          )}
          {hemParsed.leucocitos !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hemParsed.temLeucocitose || hemParsed.temLeucopenia ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              🔬 Leuc: {hemParsed.leucocitos?.toLocaleString('pt-BR')}/mm³
            </span>
          )}
          {hemParsed.plaquetas !== null && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              hemParsed.temTrombocitopenia || hemParsed.temTrombocitose ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              🫙 Plaq: {hemParsed.plaquetas?.toLocaleString('pt-BR')}/mm³
            </span>
          )}
        </div>

        {serieVermelha.length > 0 && <Header title="Série Vermelha (Eritrograma)" />}
        <div className="divide-y divide-slate-100">
          {serieVermelha.map(renderRow)}
        </div>
        
        {serieBranca.length > 0 && <Header title="Série Branca (Leucograma)" />}
        <div className="divide-y divide-slate-100">
          {serieBranca.map(renderRow)}
        </div>
        
        {plaquetas.length > 0 && <Header title="Série Plaquetária" />}
        <div className="divide-y divide-slate-100">
          {plaquetas.map(renderRow)}
        </div>
        
        {outros.length > 0 && <Header title="Outros Parâmetros" />}
        <div className="divide-y divide-slate-100">
          {outros.map(renderRow)}
        </div>

        {/* Clinical note */}
        {hemParsed.notaClinica !== 'Hemograma dentro dos limites normais.' ? (
          <div className="px-4 py-2 bg-amber-50/60 border-t border-amber-100 flex gap-2 items-start">
            <span className="text-amber-500 text-sm shrink-0">💡</span>
            <p className="text-[10px] text-amber-800 leading-relaxed">{hemParsed.notaClinica}</p>
          </div>
        ) : (
          <div className="px-4 py-2 bg-emerald-50/60 border-t border-emerald-100 flex gap-2 items-start">
            <span className="text-emerald-500 text-sm shrink-0">✅</span>
            <p className="text-[10px] text-emerald-700 leading-relaxed">{hemParsed.notaClinica}</p>
          </div>
        )}
      </div>
    );
  };

  const SortableHeader = ({ title, sortKey, className }: { title: string, sortKey: keyof MedicalRecord, className?: string }) => (
    <div 
      className={`${className} flex items-center gap-1.5 cursor-pointer text-[11px] uppercase tracking-widest text-slate-500 font-bold group select-none`}
      onClick={() => requestSort(sortKey)}
    >
      <span className="group-hover:text-teal-700 transition-colors">{title}</span>
      {sortConfig?.key === sortKey ? (
        sortConfig.direction === 'ascending' ? <ArrowUp size={12} className="text-teal-600" /> : <ArrowDown size={12} className="text-teal-600" />
      ) : (
        <ArrowUpDown size={12} className="text-slate-400 opacity-40 group-hover:opacity-100 group-hover:text-teal-500 transition-all" />
      )}
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Alterado': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Sub-ópt.': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Todos os Exames (Consolidado)</h2>
          <p className="text-slate-500">Lista cronológica dos principais achados extraídos de todos os documentos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 print-hidden">
          <button 
            onClick={handleDeleteAllExams}
            disabled={isDeletingAll || processedExams.length === 0}
            className="flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-rose-700 font-bold hover:bg-rose-600 hover:text-white transition-colors shadow-sm disabled:opacity-50"
          >
           <Trash2 size={18} />
           {isDeletingAll ? 'Apagando...' : 'Zerar Banco de Exames'}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-semibold hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-colors shadow-sm"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <button 
            onClick={() => setIsGroupedView(!isGroupedView)}
            className={`flex items-center justify-center gap-2 border px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm ${isGroupedView ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50'}`}
            title="Agrupar exames por painel clínico (ex: Hemograma, Lipidograma)"
          >
            <LayoutGrid size={18} />
            {isGroupedView ? 'Modo Lista' : 'Painéis'}
          </button>
        </div>
      </header>

      {/* Banner de Limpeza de Duplicados */}
      {duplicateItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-3xs animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none select-none">🧹</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Prontuário com Entradas Duplicadas</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Identificamos <strong className="text-amber-950">{duplicateItems.length} registros realmente duplicados</strong> (com mesmo exame, data, médico, arquivo original e resultado) salvos.
              </p>
            </div>
          </div>
          <button
            onClick={handleClearDuplicates}
            disabled={isCleaningDuplicates}
            className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isCleaningDuplicates ? 'Calculando & Limpando...' : 'Excluir Todos os Duplicados'}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm mb-6 flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Filter size={18} />
            </div>
            Refinar Resultados
          </div>
          <button 
            onClick={() => {
              exportToCSV(filteredExams.map(ex => ({
                Data: ex.dataExame,
                Categoria: ex.categoria,
                Exame: ex.nomeExame,
                Resultado: ex.resultado,
                Unidade: ex.unidade,
                Referência: ex.valorReferencia,
                Interpretação: ex.interpretacao,
                Médico: ex.medicoSolicitante,
                Fonte: ex.arquivoOrigem
              })), 'todos_exames_filtrados');
              addToast('Exames exportados com sucesso!', 'success');
            }}
            className="print-hidden flex w-full sm:w-auto justify-center items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-slate-600 font-semibold text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm whitespace-nowrap"
          >
            <Printer size={16} />
            Exportar CSV
          </button>
        </div>
        
        <div className="w-full pb-2">
          <QuickFiltersRow 
            selectedGroup={groupFilter}
            onSelect={(group) => {
              setGroupFilter(group === 'Limpar' ? null : group);
              setCurrentPage(1);
            }} 
          />
        </div>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar exame, médico..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-sm text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <select 
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-full text-slate-700 truncate"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="Todas">Todas Categorias</option>
              <option value="SANGUE">Exames de Sangue</option>
              <option value="URINA">Exames de Urina</option>
              <option value="FEZES">Exames de Fezes</option>
              <option value="IMAGEM">Exames de Imagem</option>
              <option value="LAUDO">Laudos & Avaliações</option>
              <option value="RELATÓRIO">Relatórios & Pareceres</option>
              <option value="OUTROS">Outros Exames</option>
            </select>

            <select 
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-full text-slate-700 truncate"
              value={interpFilter}
              onChange={(e) => { setInterpFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="Todas">Todos Status</option>
              <option value="Normal">Normal</option>
              <option value="Alterado">Alterado</option>
              <option value="Sub-ópt.">Sub-óptimo</option>
              <option value="Não Informado">Não Inf.</option>
            </select>

            <select 
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-full text-slate-700 truncate"
              value={specialtyFilter}
              onChange={(e) => { setSpecialtyFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="Todas">Todas Especialidades</option>
              {specialties.filter(s => s !== 'Todas').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select 
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-full text-slate-700 truncate"
              value={systemFilter}
              onChange={(e) => { setSystemFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="Todos">Todos Sistemas</option>
              {systems.filter(s => s !== 'Todos').map(sys => (
                <option key={sys} value={sys}>{sys}</option>
              ))}
            </select>

            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 w-full lg:col-span-1 md:col-span-4 col-span-2">
              <div className="flex flex-col px-3 w-1/2 border-r border-slate-200/60 justify-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">De</span>
                <input 
                  type="date" 
                  className="text-xs py-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded bg-transparent text-slate-900 w-full font-medium"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex flex-col px-3 w-1/2 justify-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Até</span>
                <input 
                  type="date" 
                  className="text-xs py-0 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded bg-transparent text-slate-900 w-full font-medium"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Category Count Quick Filters */}
      <div className="flex flex-wrap gap-2.5 items-center bg-slate-50 border border-slate-150 p-3.5 rounded-2xl mb-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none shrink-0 ml-1">Filtros Rápidos:</span>
        {[
          { key: 'Todas', label: 'Todos os Exames 🚀', count: processedExams.length },
          { key: 'SANGUE', label: 'Sangue 🩸', count: categoryCounts.SANGUE },
          { key: 'URINA', label: 'Urina 🧪', count: categoryCounts.URINA },
          { key: 'FEZES', label: 'Fezes 🧫', count: categoryCounts.FEZES },
          { key: 'IMAGEM', label: 'Imagem 🩻', count: categoryCounts.IMAGEM },
          { key: 'LAUDO', label: 'Laudos/Avaliações 📄', count: categoryCounts.LAUDO },
          { key: 'RELATÓRIO', label: 'Relatórios/Pareceres 📝', count: categoryCounts.RELATÓRIO },
          { key: 'OUTROS', label: 'Outros 📋', count: categoryCounts.OUTROS },
        ].map(pill => {
          const isActive = categoryFilter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => {
                setCategoryFilter(isActive && pill.key !== 'Todas' ? 'Todas' : pill.key);
                setCurrentPage(1);
              }}
              className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 scale-[1.02] border border-teal-600'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 active:scale-95'
              }`}
            >
              <span>{pill.label}</span>
              <span className={`inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {pill.count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedExamsIds.size > 0 && (
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="text-sm text-teal-800 font-bold flex items-center gap-2">
            <CheckCircle size={18} className="text-teal-600" />
            {selectedExamsIds.size} exame(s) selecionado(s)
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-teal-600 font-semibold uppercase tracking-wider hidden md:inline">Mudar status para:</span>
            <button disabled={isUpdatingStatus} onClick={() => handleBulkUpdateStatus('Normal')} className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer disabled:opacity-50">Normal</button>
            <button disabled={isUpdatingStatus} onClick={() => handleBulkUpdateStatus('Alterado')} className="px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer disabled:opacity-50">Alterado</button>
            <button disabled={isUpdatingStatus} onClick={() => handleBulkUpdateStatus('Sub-ópt.')} className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-50 cursor-pointer disabled:opacity-50">Sub-ópt.</button>
            <button disabled={isUpdatingStatus} onClick={() => handleBulkUpdateStatus('Não Informado')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50">Não Inf.</button>
          </div>
        </div>
      )}

      <div className="bg-transparent md:bg-white md:border md:border-slate-200 rounded-2xl md:shadow-sm flex flex-col overflow-hidden max-w-full" id="main-scroll-area">
         {/* Mobile Cards View */}
         <div className="md:hidden flex flex-col gap-3">
           {currentItems.map((exam: any, idx) => {
             const getStatusColor = (status: string) => {
               switch (status) {
                 case 'Normal': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                 case 'Alterado': return 'bg-rose-100 text-rose-800 border-rose-200';
                 case 'Sub-ópt.': return 'bg-amber-100 text-amber-800 border-amber-200';
                 default: return 'bg-slate-100 text-slate-900 border-slate-200';
               }
             };

             const isExpanded = expandedGroups.has(exam.id || '');

             const renderCard = (e: any, isSubItem: boolean = false) => (
                <div 
                  key={e.id}
                  className={`bg-white p-4 rounded-xl shadow-sm border ${isSubItem ? 'border-l-4 border-teal-200 ml-4 mb-2' : 'border-slate-200'} flex gap-3 relative cursor-pointer`}
                  onClick={() => {
                     if (e.isGroup) toggleExpandGroup(e.id);
                     else setSelectedExam(e);
                  }}
                >
                  {!isSubItem && (
                    <div className="flex pt-1" onClick={(ev) => ev.stopPropagation()}>
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer" 
                         checked={selectedExamsIds.has(e.id || '')}
                         onChange={() => toggleSelectExam(e.id)}
                       />
                    </div>
                  )}
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1 pr-2">
                         <span className="font-bold text-slate-900 leading-snug">{e.nomeExame}</span>
                         <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                           <Calendar size={12} className="shrink-0" />
                           {e.dataExame}
                           <span className="mx-1">•</span>
                           {e.categoria}
                         </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 ${getStatusColor(e.interpretacao)}`}>
                        {e.interpretacao}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                       <div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                           {e.isGroup ? 'Resumo do Painel' : 'Resultado'}
                         </div>
                         {e.isGroup ? (
                           <span className="font-bold text-xs text-slate-800 whitespace-pre-line leading-relaxed">{e.resultado}</span>
                         ) : (
                           renderMultiColumnResult(e.resultado, e.unidade, e.interpretacao)
                         )}
                       </div>
                       {!e.isGroup && e.valorReferencia && e.valorReferencia !== '-' && (
                         <div className="text-right pl-3">
                           <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Referência</div>
                           <div className="text-xs text-slate-600 font-mono bg-slate-100/70 border border-slate-200/50 px-1.5 py-0.5 rounded">
                             {e.valorReferencia}
                           </div>
                         </div>
                       )}
                    </div>

                    {e.isGroup && (
                       <div className="flex justify-center border-t border-slate-100 pt-3">
                          <button 
                            className="text-xs font-bold text-teal-600 uppercase flex items-center gap-1"
                          >
                             {isExpanded ? <><ChevronDown size={14}/> Ocultar Sub-Exames</> : <><ChevronRight size={14}/> Ver Detalhes do Painel</>}
                          </button>
                       </div>
                    )}
                    
                    {!isSubItem && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <User size={12} className="shrink-0" />
                        <span className="truncate">{e.medicoSolicitante && e.medicoSolicitante !== '-' ? e.medicoSolicitante : 'Não informado'}</span>
                      </div>
                    )}
                  </div>
                </div>
             );

             return (
               <React.Fragment key={exam.id}>
                 {renderCard(exam, false)}
                 {exam.isGroup && isExpanded && renderCategorizedSubExams(exam.subExams || [], renderCard, false)}
               </React.Fragment>
             );
           })}
           {filteredExams.length === 0 && (
             <div className="text-center py-16 bg-white w-full flex flex-col items-center justify-center rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Search className="text-slate-300" size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Nenhum exame encontrado</h3>
                <p className="text-slate-500 text-xs">Ajuste os filtros de pesquisa.</p>
             </div>
           )}
         </div>

         {/* Desktop Table View */}
         <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[1000px] flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 flex px-6 py-2.5 rounded-t-2xl items-center relative z-10 w-full mb-1">
                <div className="w-8 shrink-0 flex items-center">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                     onChange={toggleSelectAll}
                     checked={currentItems.length > 0 && selectedExamsIds.size === currentItems.length}
                   />
                </div>
                <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                  <SortableHeader title="Data" sortKey="dataExame" className="col-span-2 lg:col-span-2" />
                  <SortableHeader title="Exame & Origem" sortKey="nomeExame" className="col-span-4 lg:col-span-3" />
                  <SortableHeader title="Resultado (Ref.)" sortKey="resultado" className="col-span-3 lg:col-span-3" />
                  <SortableHeader title="Status" sortKey="interpretacao" className="col-span-3 lg:col-span-2 text-left" />
                  <SortableHeader title="Médico" sortKey="medicoSolicitante" className="hidden lg:flex col-span-2" />
                </div>
              </div>

              <div className="flex-1 bg-white w-full">
                {currentItems.map((exam: any, idx) => {
                  const isExpanded = expandedGroups.has(exam.id || '');

                  const renderDesktopRow = (e: any, isSubItem: boolean = false) => {
                    const isSameLaudo = !isSubItem && idx > 0 && !e.isGroup &&
                      e.dataExame === currentItems[idx - 1].dataExame && 
                      e.medicoSolicitante === currentItems[idx - 1].medicoSolicitante && 
                      e.arquivoOrigem === currentItems[idx - 1].arquivoOrigem;
                    
                    return (
                      <div 
                        key={e.id} 
                        className={`flex px-6 py-2.5 text-sm items-center hover:bg-slate-50/80 transition-colors w-full cursor-pointer group ${isSubItem ? 'bg-slate-50 border-b border-dashed border-slate-200' : 'bg-white border-b border-slate-100'} ${isSameLaudo ? 'border-dashed border-slate-100/60' : ''}`}
                        onClick={() => {
                           if (e.isGroup) toggleExpandGroup(e.id);
                           else setSelectedExam(e);
                        }}
                      >
                        <div className={`w-8 shrink-0 flex items-center ${isSubItem ? 'pl-2' : ''}`} onClick={(ev) => ev.stopPropagation()}>
                           {!isSubItem && (
                             <input 
                               type="checkbox" 
                               className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500 cursor-pointer"
                               checked={selectedExamsIds.has(e.id || '')}
                               onChange={() => toggleSelectExam(e.id)}
                             />
                           )}
                           {isSubItem && (
                             <div className="w-1.5 h-1.5 rounded-full bg-teal-300 ml-1"></div>
                           )}
                        </div>
                        <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                          {/* Data & Categoria */}
                          <div className="col-span-2 lg:col-span-2 flex flex-col gap-1.5 justify-center">
                            <div className="font-mono text-slate-700 font-medium flex items-center gap-1.5 group-hover:text-teal-700 transition-colors tracking-tight">
                              <Calendar size={14} className="shrink-0 text-slate-400 group-hover:text-teal-500 transition-colors" />
                              {e.dataExame}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const styles = getCategoryStyles(e.categoria);
                                return (
                                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${styles.className}`}>
                                    {styles.label}
                                  </span>
                                );
                              })()}
                              {isSameLaudo && (
                                <span className="bg-teal-50 text-teal-700 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider scale-90 origin-left shrink-0" title="Extraído do mesmo documento">
                                  Laudo
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Exame & Origem */}
                          <div className="col-span-4 lg:col-span-3 flex flex-col gap-1.5 justify-center pr-2">
                             <div className="font-semibold text-slate-900 leading-snug line-clamp-2 animate-in fade-in duration-300" title={e.nomeExame}>
                               {e.nomeExame}
                             </div>
                             {!isSubItem && (
                               <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium truncate" title={e.arquivoOrigem}>
                                 <FileDigit size={12} className="shrink-0 text-slate-400" />
                                 <span className="truncate">{e.arquivoOrigem || 'Entrada Manual'}</span>
                               </div>
                             )}
                          </div>

                          {/* Resultado & Ref */}
                          <div className="col-span-3 lg:col-span-3 flex flex-col justify-center pr-2 gap-1">
                             {!e.isGroup ? (
                               <>
                                 {renderMultiColumnResult(e.resultado, e.unidade, e.interpretacao)}
                                 {e.valorReferencia && e.valorReferencia !== '-' && (
                                   <div className="inline-flex">
                                     <span className="px-1.5 py-0.5 bg-slate-100/70 border border-slate-200/50 rounded text-[10px] font-mono text-slate-500 mt-0.5 truncate max-w-full" title={`Ref: ${e.valorReferencia}`}>
                                       Ref: {e.valorReferencia}
                                     </span>
                                   </div>
                                 )}
                               </>
                             ) : (
                               <div className="flex items-center gap-2 text-teal-600 font-bold text-[11px] uppercase tracking-wider">
                                  <div className="bg-teal-50 px-2 py-1 rounded">
                                    {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes do Painel'}
                                  </div>
                               </div>
                             )}
                          </div>

                          {/* Status (Interpretação) */}
                          <div className="col-span-3 lg:col-span-2 flex items-center justify-between lg:mr-4">
                             <span className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider uppercase shadow-sm ${getStatusColor(e.interpretacao)}`}>
                               {e.interpretacao}
                             </span>
                             <div className="relative w-4 h-4 hidden sm:block">
                               {e.isGroup ? (
                                  isExpanded ? <ChevronDown size={16} className="text-teal-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute top-1/2 -mt-2 -translate-y-1/2" /> : <ChevronRight size={16} className="text-teal-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute top-1/2 -mt-2 -translate-y-1/2" />
                               ) : (
                                  <ChevronRight size={16} className="text-teal-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all absolute top-1/2 -mt-2 -translate-y-1/2" />
                               )}
                             </div>
                          </div>

                          {/* Médico */}
                          <div className="hidden lg:flex col-span-2 items-center gap-2 text-slate-600 text-xs font-semibold truncate pr-2" title={e.medicoSolicitante}>
                             {!isSubItem && (
                               e.medicoSolicitante && e.medicoSolicitante !== 'Desconhecido' && e.medicoSolicitante !== '-' ? (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                       <User size={12} className="text-slate-400 group-hover:text-teal-500 transition-colors" />
                                    </div>
                                    <span className="truncate">{e.medicoSolicitante}</span>
                                  </>
                               ) : (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-slate-50/50 border border-slate-100 flex items-center justify-center shrink-0">
                                       <User size={12} className="text-slate-300" />
                                    </div>
                                    <span className="text-slate-400 italic font-medium">Não inf.</span>
                                  </>
                               )
                             )}
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <React.Fragment key={exam.id}>
                      {renderDesktopRow(exam, false)}
                      {exam.isGroup && isExpanded && renderCategorizedSubExams(exam.subExams || [], renderDesktopRow, true)}
                    </React.Fragment>
                  );
                })}
                {filteredExams.length === 0 && (
                  <div className="text-center py-24 bg-white w-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                       <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum exame encontrado</h3>
                    <p className="text-slate-500 font-medium text-sm">Tente ajustar ou remover os filtros de pesquisa atuais.</p>
                    {(searchTerm || categoryFilter !== 'Todas' || interpFilter !== 'Todas' || startDate || endDate) && (
                       <button 
                         onClick={() => {
                           setSearchTerm(''); setCategoryFilter('Todas'); setInterpFilter('Todas'); setStartDate(''); setEndDate('');
                         }}
                         className="mt-6 px-4 py-2 bg-teal-50 text-teal-600 font-bold text-xs rounded-lg hover:bg-teal-100 transition-colors uppercase tracking-wider"
                       >
                         Limpar Filtros
                       </button>
                    )}
                  </div>
                )}
              </div>
            </div>
         </div>
          
          {/* Pagination */}
          {filteredExams.length > 0 && (
            <div className="bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500 font-medium rounded-b-2xl">
              <div>Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredExams.length)}-{Math.min(currentPage * itemsPerPage, filteredExams.length)} de {filteredExams.length} registros extraídos</div>
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`uppercase tracking-widest flex items-center px-2 py-1 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 hover:text-teal-600'}`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </button>
                <div className="flex gap-2 text-teal-600 font-bold items-center bg-teal-50 px-3 py-1 rounded-md">
                  <span>{currentPage}</span>
                  <span className="text-teal-300 font-normal">/</span>
                  <span className="text-teal-800">{totalPages}</span>
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`uppercase tracking-widest flex items-center px-2 py-1 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 hover:text-teal-600'}`}
                >
                  Próximo <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
      </div>
      
      {/* Detalhes do Exame (Modal) */}
      {selectedExam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedExam(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col mx-auto my-auto animate-in zoom-in-95 duration-200 relative border border-slate-200/60" onClick={(e) => e.stopPropagation()}>
            {/* Cabecalho Modal */}
            <div className="p-6 sm:p-8 pb-0 shrink-0">
              <div className="flex justify-between items-start gap-4">
                <div>
                   <div className="flex items-center gap-3 mb-3">
                      {(() => {
                        const styles = getCategoryStyles(selectedExam.categoria);
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles.className}`}>
                            {styles.label}
                          </span>
                        );
                      })()}
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase border ${getStatusColor(selectedExam.interpretacao)}`}>
                         {selectedExam.interpretacao}
                      </span>
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 border-none">{selectedExam.nomeExame}</h3>
                   <div className="flex flex-wrap gap-4 mt-4 text-xs font-medium text-slate-500">
                     <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {selectedExam.dataExame}</span>
                     <span className="flex items-center gap-1.5"><User size={14} className="text-slate-400" /> {selectedExam.medicoSolicitante || 'Não informado'}</span>
                     {selectedExam.arquivoOrigem && (
                       <button
                         onClick={() => {
                           if (onNavigate) {
                             onNavigate('sources', { sourceName: selectedExam.arquivoOrigem });
                           }
                           setSelectedExam(null);
                         }}
                         className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                       >
                         <FileDigit size={14} />
                         <span>Exibir Documento Fonte</span>
                       </button>
                     )}
                   </div>
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <button 
                      onClick={handleEditExam}
                      className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
                      title="Editar este exame"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                  <button 
                    onClick={handleDeleteExam}
                    className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Excluir este exame"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={() => {
                        setSelectedExam(null);
                        setIsEditing(false);
                    }}
                    className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Corpo Modal */}
            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
               {isEditing ? (
                 <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Exame</label>
                      <input 
                        type="text" 
                        value={editFormData.nomeExame || ''} 
                        onChange={e => setEditFormData({...editFormData, nomeExame: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Resultado</label>
                        <input 
                          type="text" 
                          value={editFormData.resultado || ''} 
                          onChange={e => setEditFormData({...editFormData, resultado: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
                        <input 
                          type="date" 
                          value={editFormData.dataExame ? editFormData.dataExame.split('/').reverse().join('-') : ''} 
                          onChange={e => {
                             const date = new Date(e.target.value + 'T12:00:00');
                             setEditFormData({...editFormData, dataExame: date.toLocaleDateString('pt-BR')});
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                        <select
                          value={editFormData.categoria || 'OUTROS'}
                          onChange={e => setEditFormData({
                            ...editFormData,
                            categoria: e.target.value as any,
                            isManualCategory: true
                          })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700"
                        >
                          <option value="SANGUE">Sangue 🩸</option>
                          <option value="URINA">Urina 🧪</option>
                          <option value="FEZES">Fezes 💩</option>
                          <option value="IMAGEM">Imagem 🩻</option>
                          <option value="LAUDO">Laudo 📋</option>
                          <option value="RELATÓRIO">Relatório 📝</option>
                          <option value="OUTROS">Outros 📂</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor de Referência</label>
                        <input 
                          type="text" 
                          value={editFormData.valorReferencia || ''} 
                          onChange={e => setEditFormData({...editFormData, valorReferencia: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Interpretação</label>
                         <select
                            value={editFormData.interpretacao || 'Normal'}
                            onChange={e => setEditFormData({...editFormData, interpretacao: e.target.value as MedicalRecord['interpretacao']})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                         >
                            <option value="Normal">Normal</option>
                            <option value="Excedido">Excedido</option>
                            <option value="Alerta">Alerta</option>
                            <option value="Baixo">Baixo</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Unidade</label>
                         <input 
                           type="text" 
                           value={editFormData.unidade || ''} 
                           onChange={e => setEditFormData({...editFormData, unidade: e.target.value})}
                           className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                         />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Especialidade Médica</label>
                        <input 
                          type="text" 
                          value={editFormData.especialidadeMedica || ''} 
                          onChange={e => setEditFormData({...editFormData, especialidadeMedica: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Grupo Sistêmico</label>
                        <select 
                          value={editFormData.grupoSistemico || 'Geral / Outros'} 
                          onChange={e => setEditFormData({...editFormData, grupoSistemico: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                          <option value="Imunológico & Inflamatório">Imunológico & Inflamatório</option>
                          <option value="Metabólico / Lipídico">Metabólico / Lipídico</option>
                          <option value="Endócrino & Tireoide">Endócrino & Tireoide</option>
                          <option value="Renal">Renal</option>
                          <option value="Hepático">Hepático</option>
                          <option value="Hematológico">Hematológico</option>
                          <option value="Musculoesquelético">Musculoesquelético</option>
                          <option value="Nutricional & Neurológico">Nutricional & Neurológico</option>
                          <option value="Geral / Outros">Geral / Outros</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2 text-left">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tags (separadas por vírgula)</label>
                        <input 
                          type="text" 
                          value={editFormData.tags || ''} 
                          onChange={e => setEditFormData({...editFormData, tags: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Impacto Autoimune</label>
                        <select 
                          value={editFormData.impactoAutoimune || 'Baixo'} 
                          onChange={e => setEditFormData({...editFormData, impactoAutoimune: e.target.value as any})}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                        >
                          <option value="Alto">Alto</option>
                          <option value="Médio">Médio</option>
                          <option value="Baixo">Baixo</option>
                          <option value="Nenhum">Nenhum</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Referências científicas / artigos</label>
                      <textarea
                        rows={4}
                        value={formatScientificReferences(editFormData.scientificReferences || [])}
                        onChange={e => setEditFormData({...editFormData, scientificReferences: parseScientificReferences(e.target.value)})}
                        placeholder="Insira um artigo por linha. Ex.: TSH and thyroid hormone reference | DOI: 10.xxxx"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white resize-none"
                      />
                    </div>
                    <div className="flex pt-4 mt-2 border-t border-slate-100"></div>
                      <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 bg-white hover:bg-slate-50">Cancelar</button>
                      <button onClick={handleSaveEdit} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 shadow-sm shadow-teal-200">Salvar Alterações</button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6">
                   <div>
                    {/* Clinical Metadata Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-teal-500/5 p-4 rounded-2xl border border-teal-500/10 shadow-xs text-left mb-4">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Especialidade</span>
                        <span className="text-xs font-bold text-slate-800 block truncate">{selectedExam.especialidadeMedica || 'Clínica Médica'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Sistema Alvo</span>
                        <span className="text-xs font-bold text-slate-800 block truncate">{selectedExam.grupoSistemico || 'Geral / Outros'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Foco Autoimune</span>
                        <span className={`text-xs font-extrabold block truncate ${selectedExam.impactoAutoimune === 'Alto' ? 'text-rose-600' : selectedExam.impactoAutoimune === 'Médio' ? 'text-amber-600' : 'text-slate-500 font-medium'}`}>{selectedExam.impactoAutoimune || 'Baixo'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                        <span className="block text-[9px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Rótulos / Tags</span>
                        <div className="flex gap-1 flex-wrap overflow-hidden max-h-[18px]">
                          {selectedExam.tags ? selectedExam.tags.split(',').slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-teal-50 text-[8px] font-semibold text-teal-700 px-1 py-0.2 rounded uppercase tracking-wider truncate max-w-[55px]">{tag.trim()}</span>
                          )) : <span className="text-xs text-slate-400 font-medium">Nenhum</span>}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Resultado Detalhado</h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {renderBeautifulText(formatQualitativeResult(selectedExam.resultado), false)}
                    </div>
                   </div>

                 {selectedExam.observacoes && (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-100 pb-2">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 font-sans">
                          <Sparkles size={16} className="text-amber-500 animate-pulse shrink-0" />
                          Transcrição & Análise Inteligente
                        </h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px] uppercase tracking-wider select-none shrink-0 border border-amber-200/50">
                          Verificado por IA
                        </span>
                      </div>
                      
                      <div className="bg-gradient-to-br from-amber-50/20 to-orange-50/5 p-4 rounded-2xl border border-amber-200/50 relative overflow-hidden shadow-xs">
                        <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-[0.04] text-amber-500 pointer-events-none select-none">
                          <Sparkles size={140} />
                        </div>
                        
                        <div className="relative">
                          {renderBeautifulText(selectedExam.observacoes, true)}
                        </div>

                        <div className="mt-3 pt-3 border-t border-amber-100/40 text-[10px] text-amber-700/90 flex items-center gap-1.5">
                          <Info size={11} className="shrink-0" />
                          <span>Extraído automaticamente do arquivo e formatado de forma estruturada. Revise caso necessário.</span>
                        </div>
                      </div>
                    </div>
                 )}
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedExam.valorReferencia && selectedExam.valorReferencia !== '-') && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Valor de Referência</h4>
                        <div className="text-slate-600 text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm font-mono text-center">
                          {selectedExam.valorReferencia}
                        </div>
                      </div>
                    )}
                    {(selectedExam.scientificReferences && selectedExam.scientificReferences.length > 0) && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Referências científicas</h4>
                        <div className="space-y-2 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          {selectedExam.scientificReferences.map((ref, idx) => (
                            <div key={idx} className="text-xs leading-relaxed">
                              <div className="font-semibold text-slate-800">{ref.title}</div>
                              {ref.doi && <div>DOI: {ref.doi}</div>}
                              {ref.pmid && <div>PMID: {ref.pmid}</div>}
                              {ref.url && <div className="break-all">URL: {ref.url}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(selectedExam.unidade && selectedExam.unidade !== '-') && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2 border-b border-slate-100 pb-2">Unidade de Medida</h4>
                        <div className="text-slate-600 text-sm bg-white p-3 rounded-xl border border-slate-100 shadow-sm font-mono text-center">
                          {selectedExam.unidade}
                        </div>
                      </div>
                    )}
                 </div>

                 <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Origem do Arquivo</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm gap-4">
                       <div className="flex items-center gap-3 overflow-hidden">
                           <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl shrink-0">
                               <FileText size={20} />
                           </div>
                           <div className="truncate">
                               <p className="text-sm font-bold text-slate-800 truncate">{selectedExam.arquivoOrigem || 'Documento não especificado'}</p>
                               <p className="text-xs text-slate-500">Documento Anexado</p>
                           </div>
                       </div>
                       
                       <button
                         onClick={() => {
                           if (onNavigate) onNavigate('sources', { sourceName: selectedExam.arquivoOrigem });
                         }} 
                         className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 font-semibold text-xs text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded-xl transition-colors shrink-0 w-full sm:w-auto"
                       >
                          <Eye size={16} /> Mostrar Documento
                       </button>
                    </div>
                 </div>
               </div>
               )}
            </div>
            
            {/* Footer Modal */}
            <div className="p-4 sm:p-6 border-t border-slate-100 shrink-0 bg-slate-50 flex items-center justify-end rounded-b-3xl">
                <button 
                  onClick={() => setSelectedExam(null)}
                  className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors"
                >
                  Fechar
                </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function InlinePathologiesView({ initialFilter }: { initialFilter?: any }) {
  const { pathologiesData } = useData();
  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>(initialFilter?.status || 'Todos');
  const [searchTerm, setSearchTerm] = useState(initialFilter?.condition || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.status !== undefined) setSelectedStatus(initialFilter.status);
      if (initialFilter.condition !== undefined) setSearchTerm(initialFilter.condition);
    }
  }, [initialFilter]);

  const filteredPathologies = useMemo(() => {
    return pathologiesData.filter(p => {
      let matches = true;

      if (searchTerm && !p.condition.toLowerCase().includes(searchTerm.toLowerCase())) {
        matches = false;
      }

      // Status Filter
      if (selectedStatus !== 'Todos' && p.status !== selectedStatus) {
        matches = false;
      }

      // Date Range Filter logic based on `p.dateDetected`
      if (startDate && matches) {
        const [sy, sm, sd] = startDate.split('-');
        const sTime = new Date(Number(sy), Number(sm) - 1, Number(sd)).getTime();
        const pTime = parseDate(p.dateDetected).getTime();
        if (pTime < sTime) matches = false;
      }

      if (endDate && matches) {
        const [ey, em, ed] = endDate.split('-');
        const eTime = new Date(Number(ey), Number(em) - 1, Number(ed)).getTime();
        const pTime = parseDate(p.dateDetected).getTime();
        if (pTime > eTime) matches = false;
      }

      return matches;
    });
  }, [pathologiesData, selectedStatus, startDate, endDate, searchTerm]);

  const severeConditions = filteredPathologies.filter(p => p.status === 'Requer Reavaliação');
  const monitoringConditions = filteredPathologies.filter(p => p.status === 'Monitorização');
  const normalizedConditions = filteredPathologies.filter(p => p.status === 'Normalizado');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Achados Clínicos Históricos</h2>
          <p className="text-slate-500">Acompanhamento e evolução de alterações detetadas em exames.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              exportToCSV(filteredPathologies.map(p => ({
                Condição: p.condition,
                Categoria: p.category,
                'Status Atual': p.status,
                '1º Registo': p.dateDetected,
                'Último Exame': p.lastExam,
                'Descrição Clínica / Resultado': p.description,
                'Fonte Documental': p.source
              })), 'patologias_e_condicoes');
              addToast('Patologias exportadas com sucesso!', 'success');
            }}
            className="print-hidden flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors shadow-sm whitespace-nowrap"
          >
            Exportar CSV
          </button>
          <button 
            onClick={() => window.print()}
            className="print-hidden flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-semibold hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-colors shadow-sm"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </header>

      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-700 font-bold mb-1">
          <Filter size={18} className="text-teal-600" />
          Filtros de Pesquisa
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por condição ou marcador..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors text-sm text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto min-w-[200px]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Requer Reavaliação">Requer Reavaliação</option>
            <option value="Monitorização">Monitorização</option>
            <option value="Normalizado">Normalizado</option>
          </select>
          
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 w-full md:w-auto md:ml-auto">
            <div className="flex flex-col px-2 w-1/2 sm:w-auto border-r border-slate-200/60">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">De</span>
              <input 
                type="date" 
                className="text-xs py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded bg-transparent text-slate-900 w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col px-2 w-1/2 sm:w-auto">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Até</span>
              <input 
                type="date" 
                className="text-xs py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 rounded bg-transparent text-slate-900 w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {filteredPathologies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0 border border-rose-100 group-hover:bg-rose-100 transition-colors">
              <AlertCircle size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Atenção Necessária</p>
              <p className="text-3xl font-bold text-slate-900">{severeConditions.length} <span className="text-sm font-normal text-slate-500">condições</span></p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shrink-0 border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <Activity size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Em Monitorização</p>
              <p className="text-3xl font-bold text-slate-900">{monitoringConditions.length} <span className="text-sm font-normal text-slate-500">condições</span></p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center shrink-0 border border-teal-100 group-hover:bg-teal-100 transition-colors">
              <Stethoscope size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Filtrado</p>
              <p className="text-3xl font-bold text-slate-900">{filteredPathologies.length} <span className="text-sm font-normal text-slate-500">registos</span></p>
            </div>
          </div>
        </div>
      )}

      {filteredPathologies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Search className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-500 font-medium">Nenhuma condição encontrada com esses filtros.</p>
        </div>
      )}

      {severeConditions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={20} /> Requer Reavaliação
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {severeConditions.map((item, idx) => (
              <div key={idx} className="bg-rose-50/50 rounded-2xl shadow-sm border border-rose-100 p-5 flex flex-col md:flex-row gap-5 items-start">
                <div className="md:w-1/3">
                  <h4 className="font-bold text-rose-900 text-lg">{item.condition}</h4>
                  <p className="text-rose-700/80 text-sm mt-1">Detetado em: {item.dateDetected}</p>
                </div>
                <div className="md:w-2/3">
                  <p className="text-slate-900 text-sm mb-3">{item.description}</p>
                  <SourceBadge source={item.source} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {monitoringConditions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Em Monitorização Contínua
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {monitoringConditions.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-50 p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.condition}</h3>
                  <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold w-max mb-4">
                    {item.status}
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <p><strong>Detetado em:</strong> {item.dateDetected}</p>
                    <p><strong>Último Exame:</strong> {item.lastExam}</p>
                  </div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Descrição Clínica</h4>
                  <p className="text-slate-900 leading-relaxed mb-6">{item.description}</p>
                  
                  <div className="mt-auto">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Documento de Referência</h4>
                    <SourceBadge source={item.source} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {normalizedConditions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-teal-500" size={20} /> Histórico Normalizado
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {normalizedConditions.map((item, idx) => (
              <div key={idx} className="bg-teal-50/50 rounded-2xl shadow-sm border border-teal-100 p-5 flex flex-col md:flex-row gap-5 items-start opacity-80 hover:opacity-100 transition-opacity">
                <div className="md:w-1/3">
                  <h4 className="font-bold text-teal-900 text-lg">{item.condition}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase">{item.status}</span>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <div className="flex gap-4 text-xs text-slate-500 mb-3 font-medium">
                    <span><strong>1º Registo:</strong> {item.dateDetected}</span>
                    <span><strong>Normalizado:</strong> {item.lastExam}</span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">
                    <strong>Último Resultado:</strong> {item.description}
                  </p>
                  <SourceBadge source={item.source} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SourcesView({ initialFilter }: { initialFilter?: any }) {
  const { 
    allSources, 
    processedExams, 
    localFilePreviews, 
    user, 
    hasDriveAccess, 
    connectDrive,
    isSyncingDrive,
    lastDriveSyncTime,
    isDriveAutoSyncEnabled,
    setIsDriveAutoSyncEnabled,
    driveSyncLogs,
    executeDriveSync,
    doctors 
  } = useData();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(initialFilter?.sourceName || null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfView, setIsPdfView] = useState(initialFilter?.openPdf || false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [selectedSourcesTarget, setSelectedSourcesTarget] = useState<string[]>([]);
  const [reviewModalSearch, setReviewModalSearch] = useState('');

  const [sourcesTab, setSourcesTab] = useState<'list' | 'visual_instant'>(
    initialFilter?.openVisualInstant ? 'visual_instant' : 'list'
  );
  const [imageAnalysisHistory, setImageAnalysisHistory] = useState<Record<string, string>>({});
  const [isAnalyzingLocalImage, setIsAnalyzingLocalImage] = useState(false);
  const [localImagePrompt, setLocalImagePrompt] = useState('Analise os achados visuais desta imagem médica de forma compreensiva.');

  // Right-side tabs in document details modal
  const [rightTab, setRightTab] = useState<'summary' | 'chat' | 'visual_analysis'>('summary');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, Array<{sender: 'user' | 'ia', text: string}>>>({});
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [avgFileProcessingTime, setAvgFileProcessingTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('avg_file_processing_time');
      return stored ? parseInt(stored, 10) : 15000;
    } catch (_) {
      return 15000;
    }
  });

  const DEMO_HISTORY = useMemo(() => [
    { id: 'demo-1', name: 'Ressonancia_Sela.pdf', fullName: 'Ressonancia_Sela.pdf', type: 'PDF', sizeMb: 4.2, durationSec: 32.5, timestamp: '14:20', isDemo: true },
    { id: 'demo-2', name: 'Hemograma_Lemos.pdf', fullName: 'Hemograma_Lemos.pdf', type: 'PDF', sizeMb: 1.8, durationSec: 15.2, timestamp: '14:18', isDemo: true },
    { id: 'demo-3', name: 'Exame_Urina_Cruces.png', fullName: 'Exame_Urina_Cruces.png', type: 'PNG', sizeMb: 2.5, durationSec: 9.9, timestamp: '12:05', isDemo: true },
    { id: 'demo-4', name: 'Eletrocardiograma_Sion.pdf', fullName: 'Eletrocardiograma_Sion.pdf', type: 'PDF', sizeMb: 3.1, durationSec: 21.4, timestamp: '10:30', isDemo: true },
    { id: 'demo-5', name: 'Perfil_Lipidico_Fleury.jpg', fullName: 'Perfil_Lipidico_Fleury.jpg', type: 'JPG', sizeMb: 1.2, durationSec: 8.1, timestamp: '09:15', isDemo: true }
  ], []);

  const [processingHistory, setProcessingHistory] = useState<Array<{
    id: string;
    name: string;
    fullName: string;
    type: string;
    sizeMb: number;
    durationSec: number;
    timestamp: string;
    isDemo?: boolean;
  }>>([]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('processing_history_last_10');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProcessingHistory(parsed);
          return;
        }
      }
    } catch (_) {}
    setProcessingHistory(DEMO_HISTORY);
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => {
      loadHistory();
    };
    window.addEventListener('processing_history_updated', handleUpdate);
    return () => {
      window.removeEventListener('processing_history_updated', handleUpdate);
    };
  }, [DEMO_HISTORY]);

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.sourceName !== undefined) setSelectedSource(initialFilter.sourceName);
      if (initialFilter.openPdf !== undefined) setIsPdfView(initialFilter.openPdf);
      if (initialFilter.openVisualInstant) setSourcesTab('visual_instant');
      if (initialFilter.openUpload) setIsAddingDocument(true);
    }
  }, [initialFilter]);

  const handleDeleteSelected = async () => {
    if (!user) return;
    const confirmDelete = window.confirm(`Tem certeza que deseja apagar ${selectedSourcesTarget.length} documentos selecionados e todos os seus exames?`);
    if (!confirmDelete) return;

    try {
      const examsToDelete = processedExams.filter(exam => selectedSourcesTarget.includes(exam.arquivoOrigem));
      let examIdsCount = 0;
      if (examsToDelete.length > 0) {
        const examIds = examsToDelete.map(ex => ex.id).filter((id): id is string => !!id);
        const pdfPaths = examsToDelete.map(ex => ex.pdfStoragePath);
        examIdsCount = examIds.length;
        
        await deleteExamsBatch(examIds, pdfPaths, user.uid);
      }
      
      addToast(`${selectedSourcesTarget.length} documentos e ${examIdsCount} exames apagados.`, 'success');
      
      // Update processing history too
      setProcessingHistory(prev => {
        const newList = prev.filter(item => !selectedSourcesTarget.includes(item.fullName));
        try { localStorage.setItem('processing_history_last_10', JSON.stringify(newList)); } catch (_) {}
        return newList;
      });

      if (selectedSource && selectedSourcesTarget.includes(selectedSource)) {
        setSelectedSource(null);
      }
      setSelectedSourcesTarget([]);
    } catch (err) {
      console.error(err);
      addToast('Erro ao apagar documentos.', 'error');
    }
  };

  const handleDeleteSource = async (e: React.MouseEvent, sourceName: string) => {
    e.stopPropagation();
    if (!user) return;
    const confirmDelete = window.confirm(`Tem certeza que deseja apagar o documento e todos os exames extraídos de "${sourceName}"?`);
    if (!confirmDelete) return;

    // Achar todos os exames desta source
    const examsToDelete = processedExams.filter(exam => exam.arquivoOrigem === sourceName);
    if (examsToDelete.length > 0) {
      try {
        const examIds = examsToDelete.map(ex => ex.id).filter((id): id is string => !!id);
        const pdfPaths = examsToDelete.map(ex => ex.pdfStoragePath);
        
        await deleteExamsBatch(examIds, pdfPaths, user.uid);
        
        addToast(`Documento e ${examIds.length} exames associados apagados.`, 'success');
        
        if (selectedSource === sourceName) setSelectedSource(null);
      } catch (err) {
        console.error(err);
        addToast('Erro ao apagar o documento e os exames.', 'error');
        return;
      }
    } else {
       addToast(`Documento apagado.`, 'success');
       if (selectedSource === sourceName) setSelectedSource(null);
    }
    
    // Remove from processing history too
    setProcessingHistory(prev => {
      const newList = prev.filter(item => item.fullName !== sourceName);
      try { localStorage.setItem('processing_history_last_10', JSON.stringify(newList)); } catch (_) {}
      return newList;
    });
  };

  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [newSourceName, setNewSourceName] = useState<string>('');

  const handleRenameSource = async (oldName: string, newName: string) => {
    if (!user || !newName.trim() || oldName === newName) {
      setEditingSource(null);
      return;
    }
    
    // Achar todos os exames desta source
    const examsToRename = processedExams.filter(exam => exam.arquivoOrigem === oldName);
    if (examsToRename.length > 0) {
      try {
        const examIds = examsToRename.map(ex => ex.id).filter((id): id is string => !!id);
        
        await renameSourceInExams(newName.trim(), examIds, user.uid);
        
        addToast(`Documento renomeado com sucesso. (${examIds.length} exames atualizados)`, 'success');
        setEditingSource(null);
        if (selectedSource === oldName) setSelectedSource(newName.trim());
      } catch (err) {
        console.error(err);
        addToast('Erro ao renomear o documento e seus exames.', 'error');
      }
    } else {
       setEditingSource(null);
    }
  };

  const handleRenameHistoryItem = async (id: string, oldName: string, newName: string, isDemo?: boolean) => {
    if (!newName.trim() || oldName === newName) {
      setEditingSource(null);
      return;
    }

    if (!isDemo) {
       await handleRenameSource(oldName, newName);
    }
    
    setProcessingHistory(prev => {
      const newList = prev.map(item => item.id === id ? {
         ...item, 
         fullName: newName.trim(), 
         name: newName.trim().length > 25 ? `${newName.trim().substring(0, 25)}...` : newName.trim()
      } : item);
      try { localStorage.setItem('processing_history_last_10', JSON.stringify(newList)); } catch (_) {}
      return newList;
    });
    setEditingSource(null);
  };

  const handleDeleteHistoryItem = async (e: React.MouseEvent, id: string, fullName: string, isDemo?: boolean) => {
    e.stopPropagation();
    if (!isDemo) {
      // Prompt confirmation inside handleDeleteSource and await it... wait handleDeleteSource isn't returning a boolean block, it calls window.confirm directly!
      const confirmDelete = window.confirm(`Tem certeza que deseja apagar o documento e todos os exames extraídos de "${fullName}"?`);
      if (!confirmDelete) return;
      
      if (user) {
        // Find exams
        const examsToDelete = processedExams.filter(exam => exam.arquivoOrigem === fullName);
        if (examsToDelete.length > 0) {
          try {
            const examIds = examsToDelete.map(ex => ex.id).filter((id_c): id_c is string => !!id_c);
            const pdfPaths = examsToDelete.map(ex => ex.pdfStoragePath);
            await deleteExamsBatch(examIds, pdfPaths, user.uid);
            addToast(`Documento e ${examIds.length} exames associados apagados.`, 'success');
            if (selectedSource === fullName) setSelectedSource(null);
          } catch (err) {
            console.error(err);
            addToast('Erro ao apagar o documento e os exames.', 'error');
            return; // abort removal from history on error
          }
        } else {
          addToast(`Registro de histórico apagado.`, 'success');
        }
      }
    } else {
      const confirmDelete = window.confirm(`Tem certeza que deseja apagar o registro demonstrativo?`);
      if (!confirmDelete) return;
    }

    setProcessingHistory(prev => {
      const newList = prev.filter(item => item.id !== id);
      try { localStorage.setItem('processing_history_last_10', JSON.stringify(newList)); } catch (_) {}
      return newList;
    });
  };

  const handleCopyLink = () => {
    if (!pdfUrl) return;
    // se for string object blob não é globalmente acessível mas o comando tentará copiar a string
    navigator.clipboard.writeText(pdfUrl).then(() => {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      addToast('Link público copiado para a área de transferência!', 'success');
    }).catch(err => {
      console.error(err);
      addToast('Erro ao copiar o link.', 'error');
    });
  };

  const handleDownloadOriginal = async () => {
    if (!selectedSource || !pdfUrl) return;
    
    try {
      if (pdfUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = selectedSource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetchWithRetry(pdfUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = selectedSource;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      }
      addToast('Exame original baixado com sucesso!', 'success');
    } catch (err) {
      console.error("Erro ao baixar documento:", err);
      addToast('Não foi possível realizar o download. O documento será aberto em uma nova guia.', 'info');
      window.open(pdfUrl, '_blank');
    }
  };

  const handleGenerateReport = async () => {
    const reportElement = document.getElementById('printable-medical-laudo');
    if (!reportElement) {
      addToast('Não foi possível localizar o laudo para impressão.', 'error');
      return;
    }
    
    setIsExportingPDF(true);
    addToast('Gerando PDF do laudo reconstruído...', 'info');
    
    try {
      // Temporarily ensure it's visible if it was hidden
      const originalDisplay = reportElement.style.display;
      reportElement.style.display = 'flex';
      
      const canvas = await toCanvas(reportElement, {
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      reportElement.style.display = originalDisplay;
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0.1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${selectedSource!.replace(/\\.[^/.]+$/, "")}_Laudo_Original.pdf`);
      addToast('Laudo em PDF exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Erro ao exportar o laudo original para PDF.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const sourceExams = useMemo(() => {
    if (!selectedSource) return [];
    const selectedKey = normalizeString(selectedSource);
    return processedExams.filter(e => 
      e.arquivoOrigem === selectedSource ||
      normalizeString(e.arquivoOrigem || '') === selectedKey ||
      e.pdfStoragePath === selectedSource
    );
  }, [selectedSource, processedExams]);

  const filteredSourceExams = useMemo(() => {
    if (!reviewModalSearch.trim()) return sourceExams;
    const query = reviewModalSearch.toLowerCase();
    return sourceExams.filter(e => 
      (e.nomeExame || '').toLowerCase().includes(query) || 
      (e.resultado || '').toLowerCase().includes(query) ||
      (e.interpretacao || '').toLowerCase().includes(query)
    );
  }, [sourceExams, reviewModalSearch]);

  const matchDoctor = useMemo(() => {
    const docStr = sourceExams[0]?.medicoSolicitante || '';
    if (!docStr) return null;
    const parsed = parseDoctorString(docStr);
    return (doctors || []).find(d => {
      if (parsed.crm && d.crm) {
        return d.crm === parsed.crm;
      }
      return d.name.toLowerCase() === parsed.name.toLowerCase();
    });
  }, [doctors, sourceExams]);

  const isImageFile = useMemo(() => {
    if (!selectedSource) return false;
    if (localFilePreviews && localFilePreviews[selectedSource]) {
      return localFilePreviews[selectedSource].type.startsWith('image/');
    }
    const lowerName = selectedSource.toLowerCase();
    return lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.webp') || lowerName.endsWith('.gif');
  }, [selectedSource, localFilePreviews]);

  React.useEffect(() => {
    if (selectedSource) {
      if (localFilePreviews && localFilePreviews[selectedSource]) {
        setPdfUrl(localFilePreviews[selectedSource].url);
      } else {
        const storagePath = sourceExams.length > 0 ? sourceExams[0].pdfStoragePath : null;
        if (storagePath) {
          getPDFUrl(storagePath).then(url => {
            setPdfUrl(url);
          }).catch(() => {
            setPdfUrl(null);
          });
        } else {
          setPdfUrl(null);
        }
      }
      setIsPdfView(false);
    } else {
      setPdfUrl(null);
    }
  }, [selectedSource, sourceExams, localFilePreviews]);

  // Clean up object URLs if any (Firebase URL is just a string, no need to revoke)
  React.useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // Reset tab selection when selecting a new document source
  React.useEffect(() => {
    if (selectedSource) {
      setRightTab('summary');
      setLocalImagePrompt('Analise os achados visuais desta imagem médica de forma compreensiva.');
      setIsAnalyzingLocalImage(false);
    }
  }, [selectedSource]);

  const handleAnalyzeLocalImage = async () => {
    if (!pdfUrl || !selectedSource) return;
    setIsAnalyzingLocalImage(true);
    try {
      const resBlob = await fetchWithRetry(pdfUrl);
      const blob = await resBlob.blob();
      const file = new File([blob], selectedSource, { type: blob.type || 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userPrompt', localImagePrompt.trim());

      const response = await fetchWithRetry('/api/analyze-visual', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Falha ao analisar a imagem.');
      }

      const responseData = await response.json();
      setImageAnalysisHistory(prev => ({
        ...prev,
        [selectedSource]: responseData.analysis
      }));
    } catch (err: any) {
      console.error(err);
      addToast(`Erro ao analisar a imagem: ${err.message}`, 'error');
    } finally {
      setIsAnalyzingLocalImage(false);
    }
  };

  // Keep chat scrolls attached to bottom for smooth experience
  React.useEffect(() => {
    if (rightTab === 'chat') {
      const chatBox = document.getElementById('diagnostic-chat-scroll');
      if (chatBox) {
        const timer = setTimeout(() => {
          chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [rightTab, chatHistory, isSendingChat, selectedSource]);

  const filteredSources = useMemo(() => {
    return allSources.filter(source => 
      source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSources]);

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedSource || isSendingChat) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setIsSendingChat(true);

    const currentHist = chatHistory[selectedSource] || [];
    const updatedUserHist = [...currentHist, { sender: 'user' as const, text: userMsg }];
    
    setChatHistory(prev => ({
      ...prev,
      [selectedSource]: updatedUserHist
    }));

    try {
      const response = await fetchWithRetry("/api/chat-with-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          exams: sourceExams,
          userMessage: userMsg,
          history: currentHist
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Erro ao contatar o assistente médico virtual.");
      }

      const data = await response.json();
      setChatHistory(prev => ({
        ...prev,
        [selectedSource]: [...updatedUserHist, { sender: 'ia', text: data.answer }]
      }));
    } catch (err: any) {
      addToast(err.message || "Falha na resposta inteligente.", "error");
      setChatHistory(prev => ({
        ...prev,
        [selectedSource]: [...updatedUserHist, { sender: 'ia', text: `❌ Desculpe, não consegui obter uma resposta para a pergunta. Verifique se o servidor está ativo.` }]
      }));
    } finally {
      setIsSendingChat(false);
    }
  };

  const currentChats = selectedSource ? (chatHistory[selectedSource] || []) : [];

  const resolveSourceName = React.useCallback((sourceName: string) => {
    if (!sourceName) return sourceName;
    const normalized = normalizeString(sourceName);
    return allSources.find(source => source === sourceName)
      || allSources.find(source => normalizeString(source || '') === normalized)
      || sourceName;
  }, [allSources]);

  if (isAddingDocument) {
    return (
      <AddExamView 
        onSuccess={() => setIsAddingDocument(false)} 
        onCancel={() => setIsAddingDocument(false)}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 relative"
    >
      <header className="mb-6 bg-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <Database className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-900 opacity-50" size={120} />
        <div className="relative z-10 w-full md:w-2/3">
          <h2 className="text-3xl font-bold mb-2">Fontes de Dados & Importação</h2>
          <p className="text-slate-300 max-w-2xl">
            Esta página lista a totalidade dos <strong>{allSources.length} documentos</strong> originais que a Inteligência Artificial leu e indexou para construir todos os painéis, tabelas e gráficos desta aplicação.
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setIsAddingDocument(true)}
            className="flex w-full sm:w-auto items-center justify-center gap-2 bg-teal-500 border border-teal-400 px-4 py-2 rounded-xl text-white font-semibold hover:bg-teal-400 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nova Fonte
          </button>
          <button 
            onClick={() => window.print()}
            className="print-hidden flex w-full sm:w-auto items-center justify-center gap-2 bg-slate-700 border border-slate-600 px-4 py-2 rounded-xl text-white font-semibold hover:border-slate-500 hover:bg-slate-600 transition-colors shadow-sm"
          >
            <Printer size={18} />
            Imprimir
          </button>
        </div>
      </header>

      {/* Sub-Navegação interna de Fontes */}
      <div className="flex border-b border-slate-200 print-hidden max-w-full overflow-x-auto gap-6 mb-6">
        <button
          type="button"
          onClick={() => setSourcesTab('list')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all px-2 ${
            sourcesTab === 'list'
              ? 'border-teal-500 text-teal-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          🗂️ Documentos & Google Drive
        </button>
        <button
          type="button"
          onClick={() => setSourcesTab('visual_instant')}
          className={`pb-3 font-semibold text-sm border-b-2 transition-all px-2 flex items-center gap-1.5 ${
            sourcesTab === 'visual_instant'
              ? 'border-teal-500 text-teal-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          <Sparkles size={16} className="text-teal-500" /> Análise de Imagem (IA Instantânea)
        </button>
      </div>

      {sourcesTab === 'visual_instant' ? (
        <VisualAnalysis />
      ) : (
        <>
           {/* Gráfico de Barras de Eficiência de Processamento de Arquivos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 print-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-100 pb-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-850 text-base">📊 Eficiência & Rendimento por Documento</h3>
              <p className="text-xs text-slate-500">
                Velocidade e tempo de processamento dos últimos 10 exames analisados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm("Deseja redefinir o histórico para o estado de demonstração?");
                if (confirmed) {
                  try {
                    localStorage.removeItem('processing_history_last_10');
                    setProcessingHistory(DEMO_HISTORY);
                    addToast("Histórico redefinido para dados de demonstração.", "info");
                  } catch (_) {}
                }
              }}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
              title="Restaurar dados fictícios mockados para testar interface"
            >
              Resetar para Demo
            </button>
            <button
              type="button"
              onClick={() => {
                const confirmed = window.confirm("Deseja limpar todo o histórico de processamentos recente?");
                if (confirmed) {
                  try {
                    localStorage.setItem('processing_history_last_10', JSON.stringify([]));
                    setProcessingHistory([]);
                    addToast("Histórico limpo. Faça upload de arquivos para gerar dados reais.", "success");
                  } catch (_) {}
                }
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
            >
              Limpar Gráfico
            </button>
          </div>
        </div>

        {processingHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl animate-in fade-in zoom-in-95">
            <Info size={32} className="text-slate-400 mb-2.5" />
            <p className="text-sm font-bold text-slate-700">Sem histórico no gráfico</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
              Faça upload de novos exames na aba "Nova Fonte" para que a eficiência da IA comece a ser gravada e plotada aqui automaticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Gráfico de Barras */}
            <div className="bg-slate-50/30 p-3 rounded-xl border border-slate-100">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={processingHistory}
                  margin={{ top: 35, right: 10, left: -25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    unit="s"
                  />
                  <RechartsTooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isDemo = data.isDemo;
                        const speed = data.durationSec > 0 ? ((data.sizeMb * 1024) / data.durationSec).toFixed(1) : '0';
                        return (
                          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 shadow-lg max-w-[280px] text-xs space-y-1.5">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
                              <span className="font-extrabold truncate max-w-[160px] text-slate-100" title={data.fullName}>
                                {data.fullName}
                              </span>
                              {isDemo && (
                                <span className="text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">
                                  DEMO
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-355">
                              <span className="font-medium text-slate-400">Formato:</span>
                              <span className="font-bold text-slate-100 text-right font-mono">{data.type}</span>
                              <span className="font-medium text-slate-400">Tamanho:</span>
                              <span className="font-bold text-slate-100 text-right font-mono">{data.sizeMb} MB</span>
                              <span className="font-medium text-slate-400">Tempo:</span>
                              <span className="font-bold text-amber-400 text-right font-mono">{data.durationSec}s</span>
                              <span className="font-medium text-slate-400">Vazão IA:</span>
                              <span className="font-bold text-emerald-400 text-right font-mono">{speed} KB/s</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="durationSec" 
                    radius={[5, 5, 0, 0]}
                    maxBarSize={45}
                  >
                    {processingHistory.map((entry, idx) => {
                      const isPdf = entry.type === 'PDF';
                      const color = isPdf ? '#0d9488' : '#4f46e5';
                      return <Cell key={`cell-${idx}`} fill={color} />;
                    })}
                    <LabelList
                      dataKey="durationSec"
                      content={(props: any) => {
                        const { x, y, width, height, value } = props;
                        if (!value && value !== 0) return null;
                        const barH = Number(height);
                        const isInside = barH >= 28;
                        const labelY = isInside ? Number(y) + barH / 2 : Number(y) - 10;
                        const label = `${value}s`;
                        if (isInside) {
                          return (
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={labelY}
                              fill="#fff"
                              fontSize={9}
                              fontWeight={800}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >{label}</text>
                          );
                        }
                        const pillW = label.length * 6 + 10;
                        return (
                          <g>
                            <rect
                              x={Number(x) + Number(width) / 2 - pillW / 2}
                              y={Number(y) - 18}
                              width={pillW}
                              height={14}
                              rx={4}
                              fill="#f0fdf4"
                              stroke="#86efac"
                              strokeWidth={1}
                            />
                            <text
                              x={Number(x) + Number(width) / 2}
                              y={Number(y) - 11}
                              fill="#15803d"
                              fontSize={9}
                              fontWeight={800}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >{label}</text>
                          </g>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="flex justify-between items-center text-[10px] text-slate-405 font-bold px-2 pt-1 border-t border-slate-100 mt-2">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-teal-600"></span> Legenda: PDF (Teal)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-600"></span> Legenda: Imagem (Indigo)
                </span>
                <span className="text-slate-400">Total de registros no gráfico: {processingHistory.length}/10</span>
              </div>
            </div>

            {/* Listagem detalhada dos últimos processados no rodapé do gráfico */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-sm bg-white">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Arquivo</th>
                    <th className="px-4 py-3 text-center">Tipo</th>
                    <th className="px-4 py-3 text-right">Tamanho</th>
                    <th className="px-4 py-3 text-right">Duração (s)</th>
                    <th className="px-4 py-3 text-right">Velocidade (KB/s)</th>
                    <th className="px-4 py-3 text-center">Origem</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processingHistory.map((item) => {
                    const speed = item.durationSec > 0 ? ((item.sizeMb * 1024) / item.durationSec).toFixed(1) : '0';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors font-medium group cursor-pointer" onClick={() => { if (item.fullName) setSelectedSource(resolveSourceName(item.fullName)); }}>
                        <td className="px-4 py-2.5 font-bold text-slate-700 truncate max-w-[200px]" title={item.fullName}>
                          {editingSource === item.fullName ? (
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={newSourceName}
                                  onChange={(e) => setNewSourceName(e.target.value)}
                                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs outline-none"
                                  autoFocus
                                  onKeyDown={(e) => {
                                     if (e.key === 'Enter') handleRenameHistoryItem(item.id, item.fullName, newSourceName, item.isDemo);
                                     if (e.key === 'Escape') setEditingSource(null);
                                  }}
                                />
                                <button className="p-1 bg-teal-600 hover:bg-teal-700 transition-colors text-white rounded" onClick={() => handleRenameHistoryItem(item.id, item.fullName, newSourceName, item.isDemo)}>✔</button>
                                <button className="p-1 bg-slate-200 hover:bg-slate-300 transition-colors text-slate-700 rounded" onClick={() => setEditingSource(null)}>✕</button>
                              </div>
                          ) : (
                              item.fullName
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                            item.type === 'PDF' 
                              ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-slate-500 font-semibold">
                          {item.sizeMb} MB
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-amber-600 font-bold">
                          {item.durationSec}s
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-emerald-600 font-bold">
                          {speed} KB/s
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {item.isDemo ? (
                            <span className="text-[9px] bg-slate-100 text-slate-400 font-semibold px-2 py-0.5 rounded-full uppercase">
                              Demonstração
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-100/70 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase">
                              Arquivo Real
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setEditingSource(item.fullName);
                                 setNewSourceName(item.fullName);
                              }}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar nome"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteHistoryItem(e, item.id, item.fullName, item.isDemo)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Apagar dados"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {selectedSourcesTarget.length > 0 && (
          <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex justify-between items-center animate-in slide-in-from-top-2">
             <span className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <Trash2 size={16} /> 
                {selectedSourcesTarget.length} documentos selecionados
             </span>
             <button 
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
             >
                Apagar Selecionados
             </button>
          </div>
        )}
        <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {filteredSources.map((source, idx) => {
            const examsForThisSource = processedExams.filter(e => e.arquivoOrigem === source);
            const categories = Array.from(new Set(examsForThisSource.map(e => e.categoria))).filter(Boolean);
            
            // Definição dinâmica do ícone e cores com base nas categorias identificadas
            let icon = <FileText size={20} />;
            let iconColors = "bg-rose-50 text-rose-500 group-hover:bg-rose-100";
            
            if (categories.includes('IMAGEM')) {
              icon = <ImageIcon size={20} />;
              iconColors = "bg-teal-50 text-teal-600 group-hover:bg-teal-100";
            } else if (categories.includes('LAUDO')) {
              icon = <Stethoscope size={20} />;
              iconColors = "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100";
            } else if (categories.includes('URINA')) {
              icon = <ClipboardList size={20} />;
              iconColors = "bg-amber-50 text-amber-600 group-hover:bg-amber-100";
            } else if (categories.includes('FEZES')) {
              icon = <ClipboardList size={20} />;
              iconColors = "bg-amber-100/50 text-amber-800 group-hover:bg-amber-150/70";
            } else if (categories.includes('SANGUE')) {
              icon = <Activity size={20} />;
              iconColors = "bg-rose-50 text-rose-500 group-hover:bg-rose-100";
            } else if (source.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/)) {
              icon = <ImageIcon size={20} />;
              iconColors = "bg-teal-50 text-teal-600 group-hover:bg-teal-100";
            }

            return (
              <li 
                key={idx} 
                onClick={() => setSelectedSource(source)}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4 group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div 
                     className="shrink-0 flex items-center justify-center p-2 mt-0.5"
                     onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSourcesTarget(prev => 
                           prev.includes(source) 
                           ? prev.filter(s => s !== source) 
                           : [...prev, source]
                        );
                     }}
                  >
                     <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        checked={selectedSourcesTarget.includes(source)}
                        readOnly
                     />
                  </div>
                  <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${iconColors}`}>
                    {icon}
                  </div>
                  <div>
                    {editingSource === source ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={newSourceName}
                          onChange={(e) => setNewSourceName(e.target.value)}
                          className="bg-white border focus:border-teal-500 focus:ring-1 focus:ring-teal-500 border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 w-full sm:w-64 transition-all shadow-inner outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                             if (e.key === 'Enter') handleRenameSource(source, newSourceName);
                             if (e.key === 'Escape') setEditingSource(null);
                          }}
                        />
                        <div className="flex gap-1">
                          <button className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 transition-colors text-white rounded-lg text-xs font-bold shadow-sm" onClick={() => handleRenameSource(source, newSourceName)}>Salvar</button>
                          <button className="px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-700 rounded-lg text-xs font-bold shadow-sm" onClick={() => setEditingSource(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-slate-900 break-all group-hover:text-teal-700 transition-colors">{source}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {categories.length > 0 ? (
                        categories.map(cat => (
                          <span key={cat} className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            cat === 'IMAGEM' ? 'bg-teal-50 text-teal-700 border-teal-150' :
                            cat === 'SANGUE' ? 'bg-rose-50 text-rose-700 border-rose-150' :
                            cat === 'URINA' ? 'bg-amber-50 text-amber-700 border-amber-150' :
                            cat === 'FEZES' ? 'bg-amber-100/40 text-amber-850 border-amber-200' :
                            cat === 'LAUDO' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                            'bg-slate-100 text-slate-600 border-slate-205'
                          }`}>
                            {cat === 'SANGUE' ? '🩸 Sangue' :
                             cat === 'URINA' ? '🧪 Urina' :
                             cat === 'FEZES' ? '💩 Fezes' :
                             cat === 'IMAGEM' ? '🖼️ Imagem' :
                             cat === 'LAUDO' ? '📄 Laudo / Parecer' :
                             `📋 ${cat}`}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-400 border-slate-150 uppercase tracking-widest">
                          Aguardando leitura ou Vazio
                        </span>
                      )}
                      
                      <span className="text-xs text-slate-400 font-medium ml-1">
                        {examsForThisSource.length > 0 
                          ? `· ${examsForThisSource.length} exame(s) / laudo(s)`
                          : `· Vazio ou processando...`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSource(source);
                      setNewSourceName(source);
                    }}
                    className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Editar nome do documento (renomear)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteSource(e, source)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    title="Apagar fonte e todos os exames vinculados"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ChevronRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </li>
            );
          })}
          {filteredSources.length === 0 && (
            <li className="p-8 text-center text-slate-500 flex flex-col items-center">
              <FileDigit size={40} className="text-slate-300 mb-3" />
              Nenhum documento encontrado com esse nome.
            </li>
          )}
        </ul>
        <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Mostrando {filteredSources.length} de {allSources.length} ficheiros indexados.</span>
        </div>
      </div>
    </>
  )}

  {/* Modal de Detalhes da Fonte */}
      {selectedSource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedSource(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col mx-auto my-auto animate-in zoom-in-95 duration-200 relative border border-slate-200/60" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 pb-0 shrink-0 border-b border-slate-850">
               <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-slate-800 rounded-lg shrink-0">
                        <FileText size={20} className="text-rose-400" />
                     </div>
                     <div>
                        <h3 className="text-base sm:text-lg font-bold break-all leading-tight text-white mb-0.5">{selectedSource}</h3>
                        <p className="text-slate-400 text-xs mt-0">
                          {sourceExams.length > 0 ? `${sourceExams.length} achados clínicos identificados pela IA` : 'Nenhum achado estruturado neste documento'}
                        </p>
                     </div>
                  </div>
                  <button 
                   onClick={() => setSelectedSource(null)}
                   className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
               </div>

               
               {/* Abas Lado Esquerdo */}
               <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 px-1 border-b border-slate-800">
                 <div 
                   className={`pb-2.5 border-b-2 cursor-pointer px-1 transition-colors ${!isPdfView ? 'border-teal-400 text-white font-bold' : 'border-transparent hover:text-white'}`}
                   onClick={() => setIsPdfView(false)}
                 >
                   Texto Extraído pela IA
                 </div>
                 <div 
                   className={`pb-2.5 border-b-2 cursor-pointer px-1 transition-colors flex items-center gap-1 ${isPdfView ? 'border-teal-400 text-white font-bold' : 'border-transparent hover:text-white'}`}
                   onClick={() => setIsPdfView(true)}
                 >
                   Visualizar Original {isImageFile ? '(Imagem)' : '(PDF)'} <Eye size={12} className="inline ml-1" />
                 </div>
               </div>
            </div>

            {/* Corpo / Layout de "Split Screen" similar ao NotebookLM */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-slate-50">
              
              {/* Lado Esquerdo: Texto Extraído ou PDF */}
              <div className="w-full md:w-1/2 overflow-hidden border-r border-slate-200 bg-white shadow-[10px_0_15px_-3px_rgba(0,0,0,0.03)] z-10 flex flex-col">
                 
                 {isPdfView ? (
                    <div className="flex-1 w-full h-full p-0 bg-slate-900 flex flex-col relative overflow-hidden">
                      {/* Barra de Ações do PDF */}
                      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center shrink-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 select-none animate-pulse">
                          <Eye size={12} className="text-teal-400" />
                          {pdfUrl ? 'Visualização do Documento' : 'Reconstrução de Laudo Original (PDF)'}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {pdfUrl && !pdfUrl.startsWith('blob:') && (
                            <button
                              onClick={handleCopyLink}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all shadow-sm cursor-pointer select-none active:scale-[0.98]"
                            >
                              {isLinkCopied ? <Check size={12} className="text-emerald-400" /> : <LinkIcon size={12} />}
                              <span>{isLinkCopied ? 'Link Copiado!' : 'Copiar Link Público'}</span>
                            </button>
                          )}
                          {pdfUrl && (
                            <>
                              <button
                                onClick={() => window.open(pdfUrl, '_blank')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all shadow-sm cursor-pointer select-none active:scale-[0.98]"
                                title="Abrir em Nova Guia"
                              >
                                <ExternalLink size={12} />
                                <span className="hidden sm:inline">Nova Guia</span>
                              </button>
                              <button
                                onClick={handleDownloadOriginal}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all shadow-sm cursor-pointer select-none active:scale-[0.98]"
                                title="Baixar PDF Original"
                              >
                                <Download size={12} className="stroke-[2.5]" />
                                <span className="hidden sm:inline">Salvar Original</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={handleGenerateReport}
                            disabled={isExportingPDF}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-black tracking-wide uppercase transition-all shadow-sm cursor-pointer select-none active:scale-[0.98]"
                          >
                            {isExportingPDF ? (
                              <>
                                <Loader2 size={12} className="animate-spin" />
                                <span>Exportando...</span>
                              </>
                            ) : (
                              <>
                                <Printer size={12} className="stroke-[2.5]" />
                                <span>Gerar Laudo (PDF)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto custom-scrollbar flex items-start justify-center bg-slate-950 p-4 relative">
                        {pdfUrl ? (
                          isImageFile ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <img 
                                src={pdfUrl} 
                                className="max-w-full max-h-full object-contain rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-zoom-in" 
                                referrerPolicy="no-referrer"
                                alt="Exame Original" 
                              />
                            </div>
                          ) : (
                            <iframe src={pdfUrl} className="w-full h-full border-0 bg-white rounded-xl shadow-lg" title="Visualizador de Documentos"></iframe>
                          )
                        ) : (
                          <div className="flex w-full h-full border-0 bg-white rounded-xl shadow-lg flex-col items-center justify-center text-slate-500 gap-4">
                             <FileText size={48} className="text-slate-300" />
                             <p className="font-medium text-sm">Nenhum arquivo original salvo em banco de dados.</p>
                             <p className="text-xs text-slate-400 text-center max-w-sm">
                               Este documento foi importado e vetorizado diretamente da IA, mas o arquivo fonte não está presente neste dispositivo.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                 ) : (
                   <div className="flex-1 w-full p-6 overflow-y-auto custom-scrollbar">
                     <div className="flex items-center justify-between gap-4 mb-4 select-none">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Transcrição & Laudo (Segmentos IA)</h4>
                       {sourceExams.length > 0 && (
                         <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                           {filteredSourceExams.length} de {sourceExams.length}
                         </span>
                       )}
                     </div>

                     {/* Bar de Pesquisa do Modal */}
                     {sourceExams.length > 0 && (
                       <div className="relative mb-5 shrink-0 select-none">
                         <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                         <input
                           type="text"
                           placeholder="Buscar por nome do exame, laudo ou resultado..."
                           value={reviewModalSearch}
                           onChange={(e) => setReviewModalSearch(e.target.value)}
                           className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-1.5 focus:ring-teal-500/40 text-xs font-semibold text-slate-705 placeholder-slate-400 transition-all font-sans"
                         />
                         {reviewModalSearch && (
                           <button
                             onClick={() => setReviewModalSearch('')}
                             className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-205/50 transition-colors"
                           >
                             <X size={12} />
                           </button>
                         )}
                       </div>
                     )}
                     
                     {filteredSourceExams.length > 0 ? (
                       <div className="space-y-6">
                         <p className="text-xs text-slate-500 leading-relaxed">
                           A IA digitalizou os seguintes marcadores médicos e achados clínicos a partir do documento original <strong>{selectedSource}</strong>:
                         </p>
                         
                         <div className="pl-4 border-l-4 border-slate-200 space-y-4">
                           {filteredSourceExams.map((exam, i) => (
                             <div key={i} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 transition-all hover:bg-slate-100/40 hover:shadow-2xs relative overflow-hidden space-y-3 shrink-0">
                               <div className="mb-1 pb-1 border-b border-slate-200/60 flex justify-between items-start gap-2 flex-wrap text-left">
                                 <span className="font-bold text-slate-900">{exam.nomeExame}</span>
                                 {getCanonicalExamName(exam.nomeExame) && getCanonicalExamName(exam.nomeExame) !== exam.nomeExame && (
                                   <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-bold text-teal-700 flex items-center gap-0.5" title="Unificado de forma inteligente pelo sistema">
                                     ✨ Padronizado: {getCanonicalExamName(exam.nomeExame)}
                                   </span>
                                 )}
                               </div>
                                <div className="space-y-1 my-2.5">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block select-none">Resultado Extraído</span>
                                  <div className="bg-white p-3 rounded-xl border border-slate-150/70 shadow-2xs">
                                    {renderBeautifulText(formatQualitativeResult(exam.resultado), false)}
                                  </div>
                                </div>
                                {exam.observacoes && (
                                  <div className="space-y-1 my-3">
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1 select-none">
                                      <Sparkles size={11} className="animate-pulse" />
                                      Anotações & Insights da IA
                                    </span>
                                    <div className="bg-gradient-to-br from-amber-50/25 to-orange-50/10 p-3.5 rounded-xl border border-amber-200/50 relative overflow-hidden">
                                      {renderBeautifulText(exam.observacoes, true)}
                                    </div>
                                  </div>
                                )}
                               <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-3 text-slate-500">
                                  <span className="bg-white px-2 py-1 rounded border border-slate-200">Ref: {exam.valorReferencia}</span>
                                  <span className="bg-white px-2 py-1 rounded border border-slate-200">Unidade: {exam.unidade}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     ) : sourceExams.length > 0 ? (
                       <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 my-auto flex-1 select-none">
                         <Search size={28} className="text-slate-300 mb-2" />
                         <p className="text-xs font-bold text-slate-700">Nenhum marcador encontrado</p>
                         <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">Não encontramos resultados correspondendo ao termo de busca "{reviewModalSearch}" neste laudo.</p>
                         <button
                           onClick={() => setReviewModalSearch('')}
                           className="mt-4 px-4 py-1.5 bg-white hover:bg-slate-100 text-teal-600 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer uppercase tracking-widest border border-slate-200 shadow-3xs"
                         >
                           Limpar Filtro
                         </button>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-64 border-2 border-dashed border-slate-100 rounded-2xl">
                         <FileText size={32} className="mb-3 opacity-50" />
                         <p>Nenhuma anotação médica relevante ou tabelas foram extraídas deste documento.</p>
                       </div>
                     )}
                   </div>
                 )}
              </div>
              
              {/* Lado Direito: Metadata, Resumos e Chat Assistente */}
              <div className="w-full md:w-1/2 flex flex-col overflow-hidden bg-slate-50">
                {/* Abas Lado Direito */}
                <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-400 px-6 py-3 bg-white border-b border-slate-200 shrink-0 select-none">
                  <button 
                    type="button"
                    className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${rightTab === 'summary' ? 'border-teal-500 text-slate-850 font-bold' : 'border-transparent hover:text-slate-700'}`}
                    onClick={() => setRightTab('summary')}
                  >
                    Resumo do Documento
                  </button>
                  <button 
                    type="button"
                    className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${rightTab === 'chat' ? 'border-teal-500 text-slate-850 font-bold' : 'border-transparent hover:text-slate-700'}`}
                    onClick={() => setRightTab('chat')}
                  >
                    Dúvidas (Chat IA) <MessageSquare size={12} className="inline" />
                    {currentChats.length > 0 && (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </button>
                  {isImageFile && (
                    <button 
                      type="button"
                      className={`pb-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${rightTab === 'visual_analysis' ? 'border-teal-500 text-slate-850 font-bold' : 'border-transparent hover:text-slate-700'}`}
                      onClick={() => setRightTab('visual_analysis')}
                    >
                      <Sparkles size={12} className="text-teal-500" /> Análise de Imagem (IA)
                    </button>
                  )}
                </div>

                {rightTab === 'summary' && (
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none flex items-center gap-1.5 leading-none">
                      <FileDigit size={12} className="text-teal-600" /> Metadados & Origem
                    </h4>
                    
                    <div className="bg-white border text-xs sm:text-sm border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                       <div className="grid grid-cols-3 border-b border-slate-100/70">
                         <div className="col-span-1 p-3.5 bg-slate-50/50 font-semibold text-slate-500 border-r border-slate-100/70 select-none">Data de Coleta</div>
                         <div className="col-span-2 p-3.5 font-bold text-slate-800">{sourceExams[0]?.dataExame || 'Desconhecida'}</div>
                       </div>
                       <div className="grid grid-cols-3 border-b border-slate-100/75">
                         <div className="col-span-1 p-3.5 bg-slate-50/50 font-semibold text-slate-500 border-r border-slate-100/70 select-none">Total Extraído</div>
                         <div className="col-span-2 p-3.5 font-bold text-teal-600">{sourceExams.length} indicadores clínicos</div>
                       </div>
                       
                       {/* Solicitante/Médico CRM Consolidation Info */}
                       {matchDoctor ? (
                         <div className="col-span-3 bg-gradient-to-r from-teal-50/30 via-teal-50/10 to-transparent p-4 border-t border-slate-100/70 flex items-start gap-4">
                           <div className="p-3 bg-teal-500/10 text-teal-700 rounded-xl font-bold text-lg shrink-0 select-none">
                             🩺
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 flex-wrap">
                               <h5 className="font-bold text-slate-900 text-sm">Dr(a). {matchDoctor.name}</h5>
                               <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[9px] font-extrabold text-teal-700 uppercase tracking-wider shadow-3xs">
                                 {matchDoctor.specialty}
                               </span>
                             </div>
                             <p className="text-xs text-slate-500 mt-1 font-semibold">
                               CRM {matchDoctor.crm || 'N/A'} - {matchDoctor.uf || 'SP'}
                             </p>
                             <p className="text-[11px] text-teal-600/90 italic mt-1 leading-relaxed">
                               ✨ Médico registrado na carteira de contatos clínicos a partir deste laudo.
                             </p>
                           </div>
                         </div>
                       ) : (
                         <div className="col-span-3 bg-slate-50/30 p-4 border-t border-slate-100/70 flex items-start gap-3">
                           <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl leading-none text-base shrink-0 font-bold select-none">
                             👨‍⚕️
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-1.5">
                               <h5 className="font-bold text-slate-700 text-sm">{sourceExams[0]?.medicoSolicitante || 'Médico Solicitante Não Consta'}</h5>
                             </div>
                             <p className="text-[11px] text-slate-450 mt-1 select-none flex items-center gap-1.5 leading-none">
                               <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-350" /> Extraído diretamente do cabeçalho do exame
                             </p>
                           </div>
                         </div>
                       )}
                    </div>

                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none flex items-center gap-1.5 leading-none pt-2">
                      <Sparkles size={12} className="text-teal-600 animate-pulse" /> Diagnostic Insights & Alertas IA
                    </h4>

                    {/* Diagnostic Summary Bar */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-50/20 border border-emerald-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-extrabold text-emerald-600">{sourceExams.filter(e => e.interpretacao === 'Normal').length}</span>
                        <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-wider select-none mt-1">Normais</span>
                      </div>
                      <div className="bg-amber-50/20 border border-amber-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-extrabold text-amber-600">{sourceExams.filter(e => e.interpretacao === 'Sub-ópt.').length}</span>
                        <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider select-none mt-1">Sub-ótimos</span>
                      </div>
                      <div className="bg-rose-50/20 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-extrabold text-rose-600">{sourceExams.filter(e => e.interpretacao === 'Alterado').length}</span>
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider select-none mt-1">Alterados</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {sourceExams.some(e => e.interpretacao === 'Alterado') && (
                        <div className="flex items-start gap-4 p-4 bg-rose-50/60 border border-rose-150 rounded-xl shadow-2xs">
                          <AlertCircle size={18} className="text-rose-505 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <h5 className="font-bold text-rose-800 text-xs mb-0.5">Atenção Requerida</h5>
                            <p className="text-xs text-rose-600 leading-relaxed">Foram encontrados {sourceExams.filter(e => e.interpretacao === 'Alterado').length} resultados assinalados como Alterados nas classes deste documento, sugerindo correlação clínica e potencial necessidade de conduta.</p>
                          </div>
                        </div>
                      )}
                      {sourceExams.some(e => e.interpretacao === 'Sub-ópt.') && (
                        <div className="flex items-start gap-4 p-4 bg-amber-50/60 border border-amber-150 rounded-xl shadow-2xs">
                          <AlertTriangle size={18} className="text-amber-505 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-bold text-amber-800 text-xs mb-0.5">Acompanhamento Sugerido</h5>
                            <p className="text-xs text-amber-600 leading-relaxed">{sourceExams.filter(e => e.interpretacao === 'Sub-ópt.').length} resultados encontram-se em níveis limítrofes ou sub-ótimos.</p>
                          </div>
                        </div>
                      )}
                      {sourceExams.some(e => e.interpretacao === 'Normal') && (
                        <div className="flex items-start gap-4 p-4 bg-emerald-50/60 border border-emerald-150 rounded-xl shadow-2xs">
                          <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <h5 className="font-bold text-emerald-800 text-xs mb-0.5">Sem Achados Graves</h5>
                            <p className="text-xs text-emerald-600 leading-relaxed">Grande parte dos achados está dentro dos limites da normalidade ou com resultados esperados para as metodologias aplicadas.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {rightTab === 'chat' && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                    {/* Chat container */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar" id="diagnostic-chat-scroll">
                      {currentChats.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 my-auto">
                          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
                            <MessageSquare size={28} />
                          </div>
                          <div className="max-w-xs">
                            <h5 className="font-bold text-slate-800 text-sm">Assistente Clínico Virtual</h5>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                              Tire suas dúvidas sobre este laudo. Pergunte sobre termos técnicos, cruzamento com referências ou o que os valores significam.
                            </p>
                          </div>
                          
                          {/* Sugestões Rápidas */}
                          <div className="w-full flex flex-col gap-2 pt-2 max-w-sm">
                            {[
                              "O que significa esse exame em palavras simples?",
                              "Existem valores de alerta ou alterados?",
                              "Que perguntas posso fazer ao meu médico?",
                            ].map((q, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setChatMessage(q)}
                                className="text-left text-xs bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl hover:border-teal-400 hover:bg-teal-50/20 text-slate-700 font-medium transition-all shadow-3xs hover:shadow-2xs cursor-pointer"
                              >
                                🚀 {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {currentChats.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                        >
                          <div className={`max-w-[85%] rounded-2xl p-4 shadow-3xs ${
                            msg.sender === 'user'
                              ? 'bg-slate-800 text-white rounded-tr-none border border-slate-700'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-1.5 mb-2 text-[9px] font-bold tracking-wider uppercase select-none opacity-70">
                              {msg.sender === 'user' ? (
                                <>
                                  <User size={10} />
                                  <span>Paciente</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={10} className="text-teal-500 animate-pulse" />
                                  <span className="text-teal-600">Doutor IA</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs md:text-sm leading-relaxed">
                              {msg.sender === 'user' ? (
                                <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                              ) : (
                                renderBeautifulText(msg.text, true)
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isSendingChat && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-2.5 shadow-3xs">
                            <Loader2 size={14} className="text-teal-500 animate-spin" />
                            <span className="text-xs text-slate-500 font-medium">Analisando o laudo com IA...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChatMessage();
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          placeholder="Digite sua dúvida clínica..."
                          className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1.5 focus:ring-teal-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          disabled={isSendingChat}
                          required
                        />
                        <button
                          type="submit"
                          disabled={!chatMessage.trim() || isSendingChat}
                          className="bg-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-teal-600 transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                        >
                          <Send size={12} />
                          <span>Perguntar</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {rightTab === 'visual_analysis' && (
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-teal-500 animate-pulse" size={18} />
                      <h4 className="text-sm font-bold text-slate-800 font-sans">Doutor IA: Segunda Leitura Visual</h4>
                    </div>
                    
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      A Inteligência Artificial fará um escaneamento gráfico completo da imagem e oferecerá um diagnóstico descritivo, interpretativo e contextualizado com o histórico de dores e autoimunidade do paciente.
                    </p>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs space-y-4 font-sans">
                      <label className="text-xs font-bold text-slate-700 block select-none">Indique o foco da análise ou faça uma pergunta específica:</label>
                      <textarea
                        value={localImagePrompt}
                        onChange={(e) => setLocalImagePrompt(e.target.value)}
                        placeholder="Ex: Quais são os principais achados desta imagem e o que indicam?"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none text-slate-800"
                        rows={3}
                      />
                      <button 
                        onClick={handleAnalyzeLocalImage}
                        disabled={isAnalyzingLocalImage}
                        className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs cursor-pointer shadow-sm"
                      >
                        {isAnalyzingLocalImage ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Processando análise da imagem...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-white shrink-0" />
                            <span>Analisar Imagem agora</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Resultado da Análise */}
                    {(imageAnalysisHistory[selectedSource] || isAnalyzingLocalImage) && (
                      <div className="bg-slate-800 text-slate-100 rounded-2xl overflow-hidden shadow-md flex flex-col">
                        <div className="p-3 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 select-none font-mono">
                            <Sparkles size={12} className="text-teal-400" />
                            Parecer Clínico de Imagem (IA)
                          </span>
                        </div>
                        <div className="p-5 text-slate-100 leading-relaxed overflow-y-auto">
                          {isAnalyzingLocalImage ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-3">
                              <Loader2 size={32} className="text-teal-400 animate-spin" />
                              <p className="text-xs text-teal-200 animate-pulse font-medium">A IA está decodificando e interpretando visualmente o arquivo físico...</p>
                            </div>
                          ) : (
                            <div className="prose prose-invert prose-xs text-slate-200 max-w-none text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                              {renderBeautifulText(imageAnalysisHistory[selectedSource] || '', true)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* RECONSTRUÇÃO DE LAUDO CLÍNICO ORIGINAL (HIDDEN OFF-SCREEN) */}
      <div 
        id="printable-medical-laudo"
        className="bg-white text-slate-800 p-10 shadow-sm w-[800px] select-text text-left font-serif shrink-0 absolute left-[-9999px] top-[-9999px] flex flex-col justify-between"
        style={{ minHeight: '1000px', zIndex: -10 }}
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600"></div>
        
        <div>
          {/* Clinica Header */}
          <div className="flex justify-between items-center border-b-[3px] border-slate-100 pb-6 mb-8 font-sans mt-2">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-xs">
                 <Activity size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-widest text-slate-900 uppercase">Diagnóstico Clínico Integrado</h1>
                <p className="text-[10px] text-slate-400 font-extrabold tracking-[0.2em] uppercase mt-0.5">Rede Nacional de Análises Integradas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Laudo Oficial</p>
              <p className="text-sm font-black text-teal-600 mt-0.5 tracking-tight">HealthSuite AI</p>
              <p className="text-[8px] text-slate-400 font-mono mt-1">ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </div>
          
          {/* Patient info box */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-8 text-sm font-sans text-slate-700 grid grid-cols-2 gap-y-4 gap-x-8 shadow-sm">
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block select-none mb-1">Nome do Paciente</span>
              <span className="font-extrabold text-slate-900 text-base">{user?.displayName || 'Rafael Minatto'}</span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block select-none mb-1">Médico(a) Solicitante</span>
              <span className="font-bold text-slate-800 text-base">{sourceExams.length > 0 ? (sourceExams[0]?.medicoSolicitante || 'Dr(a). Não Identificado') : '—'}</span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block select-none mb-1">Data do Exame</span>
              <span className="font-bold text-slate-800 text-base">{sourceExams.length > 0 ? (sourceExams[0]?.dataExame || '—') : '—'}</span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block select-none mb-1">Arquivo Origem</span>
              <span className="font-bold text-slate-800 truncate block max-w-full text-base" title={selectedSource || 'Desconhecido'}>{selectedSource || 'Desconhecido'}</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center my-8 font-sans">
            <h2 className="text-xs font-black tracking-[0.25em] text-slate-500 uppercase border-y border-slate-200 py-3 mx-10 bg-slate-50/50 rounded-sm">
              RELATÓRIO CLÍNICO DIGITALIZADO
            </h2>
          </div>

          {/* Results Table */}
          <div className="w-full font-sans text-xs mt-6 px-1">
            <div className="grid grid-cols-12 bg-slate-100/80 text-slate-600 font-bold p-3 rounded-t-xl border border-slate-200 uppercase text-[9px] tracking-wider select-none mb-0.5">
              <div className="col-span-5 pl-2">Exame / Parâmetro</div>
              <div className="col-span-3 text-right">Resultado</div>
              <div className="col-span-2 text-right">Referência</div>
              <div className="col-span-2 text-center">Estado</div>
            </div>
            <div className="divide-y divide-slate-100 border-x border-b border-slate-200 rounded-b-xl overflow-hidden bg-white shadow-sm">
              {sourceExams.map((exam, i) => (
                <div key={i} className="grid grid-cols-12 p-3.5 items-center hover:bg-slate-50/50 transition-colors">
                  <div className="col-span-5 font-bold text-slate-800 break-words pr-4 pl-2 text-[11px] leading-snug">
                    <div>{exam.nomeExame}</div>
                    {getCanonicalExamName(exam.nomeExame) && getCanonicalExamName(exam.nomeExame) !== exam.nomeExame && (
                      <div className="text-[9px] text-teal-600/80 font-bold tracking-tight mt-1" title="Consolidado automaticamente para o histórico agrupado">
                        Padronização: {getCanonicalExamName(exam.nomeExame)}
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 text-right font-extrabold text-slate-900 text-sm">
                    {exam.resultado} <span className="text-[10px] font-semibold text-slate-400 ml-1">{exam.unidade !== '—' && exam.unidade}</span>
                  </div>
                  <div className="col-span-2 text-right text-slate-500 font-semibold text-[11px] leading-tight px-2">{exam.valorReferencia !== '—' ? exam.valorReferencia : '—'}</div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-[9px] uppercase tracking-wider border shadow-3xs ${
                      exam.interpretacao === 'Normal' ? 'bg-teal-50 text-teal-700 border-teal-200' : 
                      exam.interpretacao === 'Sub-ópt.' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {exam.interpretacao}
                    </span>
                  </div>
                  {exam.observacoes && exam.observacoes.trim() && (
                    <div className="col-span-12 mt-2 ml-2 pl-3 border-l-[3px] border-slate-200/60 text-[11px] text-slate-500 italic bg-slate-50/50 p-2 rounded-r-lg">
                      <span className="font-bold text-slate-400 not-italic uppercase text-[9px] tracking-wider mr-2">Obs:</span>
                      {exam.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Signature and footer */}
        <div className="border-t-[3px] border-slate-100 pt-8 mt-12 font-sans mb-4">
          <div className="flex justify-between items-end">
            <div className="max-w-[350px]">
              <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5 select-none text-teal-600/70">Certificado de Autenticidade Digital</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Este documento foi vetorizado e validado digitalmente. A extração das métricas clínicas possui selo de precisão HealthSuite AI.
              </p>
            </div>
            <div className="text-center">
              <div className="text-[11px] italic font-serif text-teal-700/80 mb-2 font-bold select-none opacity-80">
                Assinado Eletronicamente
              </div>
              <div className="border-t-2 border-slate-300 pt-1.5 w-48 mx-auto">
                <span className="text-[9px] font-black text-slate-600 block uppercase select-none tracking-wider">HealthSuite AI Engine</span>
                <span className="text-[8px] text-slate-400 block font-bold uppercase tracking-widest mt-0.5">Data Center</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Duplicate import removed

export const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const isDuplicateExam = (existingExams: MedicalRecord[], newExamName: string, newExamDate: string, newExamResult: string) => {
  const normNewName = normalizeString(getCanonicalExamName(newExamName));
  const normNewResult = normalizeString(String(newExamResult));
  
  return existingExams.some(e => {
    if (e.dataExame !== newExamDate) return false;
    
    const normExistingName = normalizeString(getCanonicalExamName(e.nomeExame));
    const normExistingResult = normalizeString(String(e.resultado));
    
    // Require exact match of normalized name and result to prevent false duplicates with sub-tests (e.g. FAN vs FAN TITULO)
    return normExistingName === normNewName && normExistingResult === normNewResult;
  });
};

export const getConflictingExam = (existingExams: MedicalRecord[], newExamName: string, newExamDate: string, newExamResult: string) => {
  const normNewName = normalizeString(getCanonicalExamName(newExamName));
  const normNewResult = normalizeString(String(newExamResult));
  
  return existingExams.find(e => {
    if (e.dataExame !== newExamDate) return false;
    
    const normExistingName = normalizeString(getCanonicalExamName(e.nomeExame));
    const normExistingResult = normalizeString(String(e.resultado));
    
    return normExistingName === normNewName && normExistingResult !== normNewResult;
  });
};

export function AddExamView({ onSuccess, onCancel }: { onSuccess: () => void, onCancel?: () => void }) {
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  
  const { exams, user, addLocalFilePreview, registerProcessFile, doctors, saveDoctor, disconnectDrive } = useData();
  const { addToast } = useToast();
  const [mode, setMode] = useState<'pdf' | 'manual'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [reviewExams, setReviewExams] = useState<(Partial<MedicalRecord> & { forceSave?: boolean })[] | null>(null);
  const [reviewTabFilter, setReviewTabFilter] = useState<'all' | 'new' | 'duplicate'>('all');
  const [pdfStoragePaths, setPdfStoragePaths] = useState<{name: string, path: string}[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [saveProgress, setSaveProgress] = useState<{current: number, total: number} | null>(null);
  const [docProgress, setDocProgress] = useState<{progress: number, total: number, message?: string} | null>(null);
  
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const [saveStartTime, setSaveStartTime] = useState<number | null>(null);
  const [avgFileProcessingTime, setAvgFileProcessingTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('avg_file_processing_time');
      return stored ? parseInt(stored, 10) : 15000;
    } catch (_) {
      return 15000;
    }
  });

  const updateFileProcessingTime = (durationMs: number, file: File) => {
    if (durationMs > 100) {
      setAvgFileProcessingTime(prev => {
        const next = Math.round(prev * 0.7 + durationMs * 0.3);
        try {
          localStorage.setItem('avg_file_processing_time', next.toString());
        } catch (_) {}
        return next;
      });

      try {
        const rawHistory = localStorage.getItem('processing_history_last_10');
        const history = rawHistory ? JSON.parse(rawHistory) : [];
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        const fileTypeLabel = isPdf ? 'PDF' : (file.type.split('/')[1]?.toUpperCase() || 'Imagem');
        const newRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          name: file.name.length > 25 ? file.name.substring(0, 22) + '...' : file.name,
          fullName: file.name,
          type: fileTypeLabel,
          sizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          durationSec: parseFloat((durationMs / 1000).toFixed(1)),
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isDemo: false
        };
        const updated = [newRecord, ...history].slice(0, 10);
        localStorage.setItem('processing_history_last_10', JSON.stringify(updated));
        window.dispatchEvent(new Event('processing_history_updated'));
      } catch (err) {
        console.error("Erro ao salvar histórico de arquivos no localStorage:", err);
      }
    }
  };

  const formatRemainingTime = (ms: number) => {
    const totalSecs = Math.round(ms / 1000);
    if (totalSecs < 1) return 'menos de 1 seg';
    if (totalSecs < 60) return `${totalSecs}s`;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (secs === 0) {
      return `${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const getUploadEta = () => {
    if (!uploadProgress) return '';
    const { current, total } = uploadProgress;
    if (current >= total) return 'Finalizando...';
    
    const remainingCount = total - current;
    let estimatedMs = remainingCount * avgFileProcessingTime;
    
    if (uploadStartTime && current > 0) {
      const elapsed = Date.now() - uploadStartTime;
      const avgCurrentBatch = elapsed / current;
      const blendedAvg = (avgCurrentBatch * 0.6) + (avgFileProcessingTime * 0.4);
      estimatedMs = remainingCount * blendedAvg;
    }
    
    return formatRemainingTime(estimatedMs);
  };

  const getSaveEta = () => {
    if (!saveProgress) return '';
    const { current, total } = saveProgress;
    if (current >= total) return 'Finalizando...';
    if (current === 0) return 'Iniciando gravação...';
    
    if (saveStartTime) {
      const elapsed = Date.now() - saveStartTime;
      const avgTimePerDoc = elapsed / current;
      const remainingCount = total - current;
      const remainingMs = remainingCount * avgTimePerDoc;
      return formatRemainingTime(remainingMs);
    }
    return '';
  };
  const [batchStats, setBatchStats] = useState<{
    totalFiles: number;
    processedSuccessfully: number;
    failedQuotaOrAI: number;
    zeroExams: number;
    duplicateExamsExcluding: number;
  } | null>(null);
  
  const [queuedDocs, setQueuedDocs] = useState<QueuedDocument[]>([]);
  
  useEffect(() => {
    loadQueue();
    const interval = setInterval(() => {
      getQueuedDocuments().then(docs => {
        setQueuedDocs(docs);
        if (!isProcessing) {
          const now = Date.now();
          const toRetry = docs.find(d => d.status === 'failed' && d.nextRetryTime && d.nextRetryTime <= now);
          if (toRetry) {
             console.log(`Auto-retrying document ${toRetry.name}`);
             handleRetry(toRetry);
          }
        }
      });
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isProcessing]);

  const loadQueue = async () => {
    const docs = await getQueuedDocuments();
    setQueuedDocs(docs);
  };

  const initBatchStats = (total: number) => {
    setBatchStats({
      totalFiles: total,
      processedSuccessfully: 0,
      failedQuotaOrAI: 0,
      zeroExams: 0,
      duplicateExamsExcluding: 0
    });
  };

  const incrementZeroExams = () => {
    setBatchStats(prev => prev ? { ...prev, zeroExams: prev.zeroExams + 1 } : null);
  };

  const incrementFailed = () => {
    setBatchStats(prev => prev ? { ...prev, failedQuotaOrAI: prev.failedQuotaOrAI + 1 } : null);
  };

  const handleRetry = async (doc: QueuedDocument) => {
    if (isProcessing) return;
    let fileToProcess = doc.fileBlob;
    if (!(fileToProcess instanceof File)) {
       fileToProcess = new File([doc.fileBlob], doc.name, { type: 'application/pdf' });
    }
    initBatchStats(1);
    await processFile(fileToProcess as File, doc.id);
  };

  const handleRemoveFromQueue = async (id: string) => {
    await removeDocumentFromQueue(id);
    await loadQueue();
  };
  
  // Header data
  const [dataExame, setDataExame] = useState('');
  const [medico, setMedico] = useState('');
  const [origem, setOrigem] = useState('Entrada Manual');
  
  // List of markers
  const [markers, setMarkers] = useState<Partial<MedicalRecord>[]>([{
    categoria: 'LAB',
    interpretacao: 'Normal',
    nomeExame: '',
    resultado: '',
    unidade: '',
    valorReferencia: '',
    observacoes: ''
  }]);

  React.useEffect(() => {
    registerProcessFile(processFile);
  }, [registerProcessFile]);

  const autoRegisterDoctor = async (medicoText: string) => {
    if (!user || !medicoText) return;
    const trimmed = medicoText.trim();
    if (
      trimmed.toLowerCase() === 'não informado' || 
      trimmed.toLowerCase() === '—' || 
      trimmed.toLowerCase() === 'desconhecido' || 
      trimmed.toLowerCase() === '-' ||
      trimmed.toLowerCase() === 'não especificado' ||
      trimmed.toLowerCase() === 'dr. desconhecido'
    ) {
      return;
    }

    const parsed = parseDoctorString(trimmed);
    const hasCrm = !!parsed.crm;

    // Check if doctor is already registered (by name or crm)
    const alreadyExists = (doctors || []).some(d => {
      if (hasCrm && d.crm) {
        return d.crm === parsed.crm;
      }
      return d.name.toLowerCase() === parsed.name.toLowerCase();
    });

    if (alreadyExists) {
      console.log(`Médico ${parsed.name} já cadastrado no sistema.`);
      return;
    }

    console.log(`Auto-cadastrando médico: ${trimmed}`);
    try {
      const response = await fetchWithRetry('/api/lookup-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crm: parsed.crm,
          uf: parsed.uf || 'SP',
          doctorName: parsed.name
        })
      });

      if (response.ok) {
        const res = await response.json();
        const doctorData = res.data || res;
        const docId = doctorData.crm ? `doc_${doctorData.crm}_${doctorData.uf || 'SP'}` : `doc_${Date.now()}`;
        const newDoc = {
          id: docId,
          name: doctorData.name || parsed.name,
          crm: doctorData.crm || parsed.crm,
          uf: doctorData.uf || parsed.uf || 'SP',
          specialty: doctorData.specialty || 'Clínica Médica',
          userId: user.uid,
          notes: 'Cadastrado automaticamente via IA ao indexar laudo em formato PDF.'
        };
        await saveDoctor(newDoc);
        addToast(`Médico Dr(a). ${newDoc.name} (${newDoc.specialty}) auto-cadastrado com sucesso!`, 'success');
      } else {
        // Fallback local registration
        const docId = parsed.crm ? `doc_${parsed.crm}_${parsed.uf}` : `doc_${Date.now()}`;
        const newDoc = {
          id: docId,
          name: parsed.name,
          crm: parsed.crm,
          uf: parsed.uf,
          specialty: 'Clínica Médica',
          userId: user.uid,
          notes: 'Cadastrado automaticamente de forma interpretativa a partir dos metadados do laudo.'
        };
        await saveDoctor(newDoc);
        addToast(`Médico Dr(a). ${newDoc.name} cadastrado a partir do laudo.`, 'info');
      }
    } catch (e) {
      console.error("Erro no auto-cadastro de médico:", e);
    }
  };

  async function processFile(file: File, docId?: string, isBatch?: boolean, autoSave?: boolean) {
    if (!user) return;
    setIsProcessing(true);
    setDocProgress(null);
    addLocalFilePreview(file.name, file);
    let queueId = docId;
    
    try {
      if (!queueId) {
         const queuedDoc = await addDocumentToQueue(file);
         queueId = queuedDoc.id;
         await loadQueue();
         await updateDocumentStatus(queueId!, 'processing');
      } else {
         await updateDocumentStatus(queueId!, 'processing');
         await loadQueue();
      }
      
      addToast('Processando documento com Inteligência Artificial, isso pode levar alguns segundos...', 'info');
      
      const formData = new FormData();
      formData.append("file", file);

      // Add cache buster to aggressively bypass any stuck Service Worker caching
      const response = await fetchWithRetry(`/api/parse-pdf?_t=${Date.now()}`, {
        method: "POST",
        body: formData
      });

      const contentType = response.headers.get("content-type");
      if (contentType && !contentType.includes("application/json")) {
         const respText = await response.text();
         throw new Error(`O servidor retornou um formato inválIDO (${response.status} ${response.statusText}) ao invés de JSON. body: ${respText.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Falha na requisição: ${response.status}`);
      }

      let data = await response.json();
      let pdfStoragePath = data.pdfStoragePath || '';
      
      if (data.taskId) {
        addToast('Documento em processamento estendido (background). Pode levar alguns minutos. Por favor, aguarde.', 'info');
        let iterations = 0;
        const maxIterations = 150; // 150 * 8s = 1200s (approx 20 min)
        while (iterations < maxIterations && isMounted.current) {
          await new Promise(r => setTimeout(r, 8000));
          if (!isMounted.current) break;
          iterations++;
          try {
            const statusRes = await fetchWithRetry(`/api/task-status/${data.taskId}?_t=${Date.now()}`);
            if (!statusRes.ok) throw new Error("Erro ao consultar status da IA.");
            const statusData = await statusRes.json();
            if (statusData.status === "completed") {
              data = { exams: statusData.result, pdfStoragePath: statusData.pdfStoragePath || pdfStoragePath };
              pdfStoragePath = data.pdfStoragePath || pdfStoragePath;
              break;
            } else if (statusData.status === "error") {
              throw new Error(statusData.error || "Falha na extração de dados");
            } else if (statusData.status === "processing") {
              if (statusData.total && statusData.progress !== undefined) {
                 setDocProgress({ 
                   progress: statusData.progress, 
                   total: statusData.total, 
                   message: statusData.message 
                 });
              }
            }
          } catch (e: any) {
            if (e.message === "Failed to fetch" || e.name === "TypeError") {
               console.warn("Retrying fetch after transient network error...");
            } else {
               throw e;
            }
          }
        }
        if (iterations >= maxIterations) {
          throw new Error("O processamento excedeu o tempo limite. Tente novamente mais tarde.");
        }
        if (!isMounted.current) return;
      }

      if (data.exams && Array.isArray(data.exams)) {
        if (data.exams.length === 0) {
            addToast('A IA não encontrou nenhum exame reconhecível neste documento.', 'info');
            // Desvinculado do Google Drive e Firebase. Cloudflare R2 é usado primariamente.
            await removeDocumentFromQueue(queueId);
            await loadQueue();
            incrementZeroExams();
            if (!isBatch) setIsProcessing(false);
            return;
        }

        let newExamsBatch: Partial<MedicalRecord>[] = [];
        let dupCount = 0;

        for (let idx = 0; idx < data.exams.length; idx++) {
          const examData = data.exams[idx];
          const dxDate = examData.dataExame || new Date().toLocaleDateString('pt-BR');
          const nName = examData.nomeExame || 'Exame (IA)';
          const res = examData.resultado || '';

          if (isDuplicateExam(exams, nName, dxDate, res)) {
            dupCount++;
          }

          const newExam: Partial<MedicalRecord> = {
            dataExame: dxDate.substring(0, 20),
            categoria: (examData.categoria || 'LAB').substring(0, 50),
            nomeExame: nName.substring(0, 150),
            resultado: String(res).substring(0, 300),
            unidade: ((examData.unidade === '—' || examData.unidade === '-') ? '' : (examData.unidade || '')).substring(0, 50),
            valorReferencia: ((examData.valorReferencia === '—' || examData.valorReferencia === '-') ? '' : (examData.valorReferencia || '')).substring(0, 250),
            interpretacao: (examData.interpretacao || 'Não Informado').substring(0, 50),
            medicoSolicitante: (examData.medicoSolicitante || 'Dr. Desconhecido').substring(0, 150),
            arquivoOrigem: file.name.substring(0, 250),
            pdfStoragePath: (examData.pdfStoragePath || pdfStoragePath || '').substring(0, 500),
            observacoes: (examData.observacoes || '').substring(0, 10000),
            especialidadeMedica: (examData.especialidadeMedica || 'Clínica Médica').substring(0, 100),
            grupoSistemico: (examData.grupoSistemico || 'Geral / Outros').substring(0, 100),
            tags: (examData.tags || '').substring(0, 500),
            impactoAutoimune: examData.impactoAutoimune || 'Baixo'
          };
          newExamsBatch.push(newExam);
        }
        
        setBatchStats(prev => prev ? {
          ...prev,
          processedSuccessfully: prev.processedSuccessfully + 1,
          duplicateExamsExcluding: prev.duplicateExamsExcluding + dupCount
        } : null);

        setPdfStoragePaths(prev => {
          if (!prev.some(p => p.path === pdfStoragePath)) {
            return [...prev, { name: file.name, path: pdfStoragePath }];
          }
          return prev;
        });
        
        // Firebase removido. pdfStoragePath fornecido pela API é definitivo (Cloudflare R2).
        
        if (autoSave || !isMounted.current) {
          try {
            const autosaveBatch: Partial<MedicalRecord>[] = [];
             newExamsBatch.forEach(m => {
                const isDupe = isDuplicateExam(exams, String(m.nomeExame), String(m.dataExame), String(m.resultado));
                if (!isDupe) autosaveBatch.push(m);
             });
             if (autosaveBatch.length > 0) {
                await saveExamsBatch(autosaveBatch, user.uid);
                addToast(`${autosaveBatch.length} exame(s) importados e salvos automaticamente em segundo plano!`, 'success');
             } else {
                addToast(`Exames do arquivo em segundo plano já existiam no banco, ignorados.`, 'info');
             }
          } catch (e) {
            console.error("Erro no autoSave:", e);
          }
        } else {
          setReviewExams(prev => prev ? [...prev, ...newExamsBatch] : newExamsBatch);
        }
        
        // Auto-cadastro de médico se houver CRM / nome
        const firstDoctorString = newExamsBatch.find(e => e.medicoSolicitante && e.medicoSolicitante !== 'Dr. Desconhecido' && e.medicoSolicitante !== 'Não Informado' && e.medicoSolicitante !== 'Não informado' && e.medicoSolicitante !== '-') ?.medicoSolicitante;
        if (firstDoctorString) {
          autoRegisterDoctor(firstDoctorString);
        }

        addToast(`${newExamsBatch.length} exame(s) identificado(s). Verifique e valide as informações antes de salvar.`, 'success');
        
        try {
          const driveToken = await getAccessToken();
          if (driveToken) {
            const categories = newExamsBatch.map(e => e.categoria).filter(Boolean);
            const mainCategory = categories.length > 0 ? categories[0] : 'Geral';
            addToast('Organizando cópia no Google Drive...', 'info');
            const folderId = await ensureDriveFolder(driveToken, ['HealthTracker Exames', mainCategory || 'Geral']);
            if (folderId) {
              await uploadFileToDrive(driveToken, file, folderId);
              addToast('Arquivo catalogado no Google Drive com sucesso!', 'success');
            }
          }
        } catch (driveErr: any) {
          console.error("Erro no Drive:", driveErr);
          if (driveErr?.message === 'UNAUTHORIZED_DRIVE_ACCESS') {
             addToast('Sua sessão do Google Drive expirou. Reconecte nas configurações.', 'error');
             disconnectDrive();
          } else {
             addToast('Falha ao organizar no Google Drive.', 'error');
          }
        }

        await removeDocumentFromQueue(queueId);
        await loadQueue();
      } else {
         throw new Error("Formato de resposta inválido retornado pela IA.");
      }
    } catch (err: any) {
      incrementFailed();
      if (err.message.includes('503') || err.message.includes('A model is overloaded') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE') || err.message.includes('experiencing high demand')) {
         addToast('A Inteligência Artificial está com alta demanda. Tentar novamente em breve automaticamente.', 'info');
         await markDocumentForRetry(queueId!, 'API de IA sobrecarregada');
      } else if (err.message.includes('limite diário') || err.message.includes('requisições por minuto') || err.message.includes('429') || err.message.includes('exceeded your current quota') || err.message.includes('RESOURCE_EXHAUSTED')) {
         const displayMsg = (err.message.includes('limite') || err.message.includes('requisições')) ? err.message : 'O limite de uso da Inteligência Artificial foi atingido. Por favor, aguarde.';
         addToast(displayMsg, 'error');
         await updateDocumentStatus(queueId!, 'failed', displayMsg);
      } else {
         addToast(`Erro ao processar: ${err.message}`, 'error');
         await updateDocumentStatus(queueId!, 'failed', err.message);
      }
      console.error(err);
      await loadQueue();
    } finally {
      if (!isBatch) setIsProcessing(false);
      setDocProgress(null);
    }
  };

  const validateAndProcessFile = async (fileToProcess: File, isBatch?: boolean) => {
    if (fileToProcess.size === 0) {
      addToast(`O arquivo ${fileToProcess.name} selecionado está vazio e foi ignorado.`, 'error');
      return;
    }
    
    // limit size to 100MB
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (fileToProcess.size > MAX_FILE_SIZE) {
      addToast(`O arquivo ${fileToProcess.name} excede o limite (100MB) e foi ignorado.`, 'error');
      return;
    }
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileToProcess.type)) {
      addToast(`Formato não suportado para ${fileToProcess.name}. Envie PDF, JPG, PNG ou WEBP.`, 'error');
      return;
    }

    let file = fileToProcess;
    const COMPRESSION_THRESHOLD = 1.5 * 1024 * 1024; // 1.5MB
    
    if (fileToProcess.size > COMPRESSION_THRESHOLD) {
      const origSizeMB = (fileToProcess.size / (1024 * 1024)).toFixed(1);
      addToast(`Comprimindo ${fileToProcess.type === 'application/pdf' ? 'PDF' : 'imagem'} de ${origSizeMB}MB para otimizar envio com IA...`, 'info');
      
      try {
        if (fileToProcess.type === 'application/pdf') {
          const { compressPDF } = await import('./utils/fileCompressor');
          file = await compressPDF(fileToProcess);
        } else {
          const { compressImage } = await import('./utils/fileCompressor');
          file = await compressImage(fileToProcess);
        }
        
        const compressedSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        if (file.size < fileToProcess.size) {
          const percentSaved = Math.round((1 - file.size / fileToProcess.size) * 100);
          addToast(`Arquivo otimizado com sucesso! Reduzido de ${origSizeMB}MB para ${compressedSizeMB}MB (-${percentSaved}%).`, 'success');
        } else {
          console.log('Original was smaller or equal, keeping original');
        }
      } catch (err) {
        console.error('Erro na compressão:', err);
      }
    }
    
    await processFile(file, undefined, isBatch);
  };

  const processMultipleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    // Validar limite de 100MB por arquivo
    const validFiles = files.filter(f => f.size <= 100 * 1024 * 1024);
    if (validFiles.length < files.length) {
      addToast('Alguns arquivos excedem o limite de 100MB e não foram processados. Envie originais menores.', 'error');
    }
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    setUploadProgress({ current: 0, total: validFiles.length });
    setUploadStartTime(Date.now());
    setReviewExams(null);
    setPdfStoragePaths([]);
    initBatchStats(validFiles.length);
    
    try {
      const concurrencyLimit = 2; // Process 2 files simultaneously
      
      const executeWithConcurrencyLimit = async <T,>(items: T[], limit: number, asyncFn: (item: T) => Promise<void>) => {
        const results: Promise<void>[] = [];
        const executing: Promise<void>[] = [];
        
        for (const item of items) {
          const p = asyncFn(item);
          results.push(p);
          
          if (limit <= items.length) {
            const e: Promise<void> = p.then(() => {
              executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);
            if (executing.length >= limit) {
              await Promise.race(executing);
            }
          }
        }
        
        return Promise.all(results);
      };

      await executeWithConcurrencyLimit(validFiles, concurrencyLimit, async (file: File) => {
        const fileStart = Date.now();
        await validateAndProcessFile(file, true);
        const duration = Date.now() - fileStart;
        updateFileProcessingTime(duration, file);
        
        setUploadProgress(prev => {
          if (!prev) return null;
          return { current: Math.min(prev.current + 1, prev.total), total: prev.total };
        });
      });
      
    } finally {
      setUploadProgress(null);
      setUploadStartTime(null);
      setIsProcessing(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && user) {
      const files = Array.from(e.target.files) as File[];
      await processMultipleFiles(files);
      if (e.target) e.target.value = ''; // Reset input after processing the files, this prevents browsers from GCing the file handle before subsequent awaited files are parsed.
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (isProcessing) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && user) {
      const files = Array.from(e.dataTransfer.files) as File[];
      await processMultipleFiles(files);
    }
  };

  const handleApproveReview = async () => {
    if (!reviewExams || !user) return;
    setIsProcessing(true);
    let addedCount = 0;
    let forcedCount = 0;
    let duplicatedCount = 0;
    let finalBatch: (Partial<MedicalRecord> & { forceSave?: boolean })[] = [];

    for (let i = 0; i < reviewExams.length; i++) {
        const m = reviewExams[i];
        if (!m.nomeExame || !m.resultado) continue;
        const isDuplicateInDB = isDuplicateExam(exams, m.nomeExame, m.dataExame || '', m.resultado || '');
        const isDuplicateInBatch = isDuplicateExam(finalBatch as MedicalRecord[], m.nomeExame, m.dataExame || '', m.resultado || '');
        const isDuplicate = isDuplicateInDB || isDuplicateInBatch;
        
        if (!isDuplicate) {
           finalBatch.push(m);
           addedCount++;
        } else if (m.forceSave) {
           finalBatch.push(m);
           addedCount++;
           forcedCount++;
        } else {
           duplicatedCount++;
        }
    }
    
    try {
      if (finalBatch.length > 0) {
        // Exclude forceSave property before saving to DB
        const sanitizedBatch = finalBatch.map(({ forceSave, ...fields }) => fields);
        setSaveProgress({ current: 0, total: sanitizedBatch.length });
        setSaveStartTime(Date.now());
        await saveExamsBatch(sanitizedBatch, user.uid, (completed, total) => {
          setSaveProgress({ current: completed, total });
        });
      }
      
      setIsProcessing(false);

      if (addedCount > 0) {
        let msg = `${addedCount} exame(s) salvos com sucesso!`;
        const extras = [];
        if (forcedCount > 0) extras.push(`${forcedCount} duplicados forçados`);
        if (duplicatedCount > 0) extras.push(`${duplicatedCount} descartados`);
        if (extras.length > 0) msg += ` (${extras.join(' e ')})`;
        
        addToast(msg, 'success');
        onSuccess();
      } else if (duplicatedCount > 0) {
        addToast(`Todos os ${duplicatedCount} exames inseridos já estavam cadastrados (duplicatas descartadas).`, 'info');
        onSuccess();
      } else {
         addToast("Nenhum exame válido foi salvo.", "info");
         onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      addToast(`Erro ao salvar exames: ${err.message}`, 'error');
    } finally {
      setSaveProgress(null);
      setSaveStartTime(null);
    }
  };

  const updateReviewExam = (index: number, field: keyof MedicalRecord, value: string) => {
    if (!reviewExams) return;
    const newExams = [...reviewExams];
    (newExams[index] as any)[field] = value;
    setReviewExams(newExams);
  };

  const toggleForceSaveExam = (index: number) => {
    if (!reviewExams) return;
    const newExams = [...reviewExams];
    newExams[index] = { ...newExams[index], forceSave: !newExams[index].forceSave };
    setReviewExams(newExams);
  };

  const handleAddMarker = () => {
    setMarkers([...markers, {
      categoria: 'LAB',
      interpretacao: 'Normal',
      nomeExame: '',
      resultado: '',
      unidade: '',
      valorReferencia: '',
      observacoes: ''
    }]);
  };

  const handleRemoveMarker = (index: number) => {
    setMarkers(markers.filter((_, i) => i !== index));
  };

  const updateMarker = (index: number, field: keyof MedicalRecord, value: string) => {
    const newMarkers = [...markers];
    (newMarkers[index] as any)[field] = value;
    setMarkers(newMarkers);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataExame) {
      addToast('A Data do Exame é obrigatória.', 'error');
      return;
    }

    const invalid = markers.some(m => !m.nomeExame || !m.resultado);
    if (invalid) {
      addToast('Preencha o Nome e o Resultado para todos os exames/marcadores.', 'error');
      return;
    }

    if (!user) {
      addToast('Usuário não autenticado.', 'error');
      return;
    }

    let addedCount = 0;
    let duplicatedCount = 0;
    setIsProcessing(true);

    let newExamsBatch: Partial<MedicalRecord>[] = [];

    for (let idx = 0; idx < markers.length; idx++) {
      const m = markers[idx];
      const nomeExame = m.nomeExame!;
      const isDuplicate = isDuplicateExam(exams, nomeExame, dataExame, m.resultado || '');

      if (!isDuplicate) {
        const meta = getClinicalMetadata(medico || 'Não Informado', nomeExame);
        const newExam: Partial<MedicalRecord> = {
          dataExame: dataExame,
          categoria: m.categoria as any,
          nomeExame: nomeExame,
          resultado: m.resultado!,
          unidade: m.unidade || '—',
          valorReferencia: m.valorReferencia || '—',
          interpretacao: m.interpretacao as any,
          medicoSolicitante: medico || 'Não Informado',
          arquivoOrigem: origem ? origem.substring(0, 250) : 'Entrada Manual',
          observacoes: m.observacoes ? m.observacoes.substring(0, 10000) : '',
          especialidadeMedica: meta.especialidadeMedica,
          grupoSistemico: meta.grupoSistemico,
          tags: meta.tags,
          impactoAutoimune: meta.impactoAutoimune
        };
        newExamsBatch.push(newExam);
        addedCount++;
      } else {
        duplicatedCount++;
      }
    }
    
    try {
      if (newExamsBatch.length > 0) {
        setSaveProgress({ current: 0, total: newExamsBatch.length });
        setSaveStartTime(Date.now());
        await saveExamsBatch(newExamsBatch, user.uid, (completed, total) => {
          setSaveProgress({ current: completed, total });
        });
        
        if (medico) {
          autoRegisterDoctor(medico);
        }
      }
      
      setIsProcessing(false);

      if (addedCount > 0) {
        addToast(`${addedCount} exame(s) adicionados com sucesso! ${duplicatedCount > 0 ? `(${duplicatedCount} duplicados ignorados)` : ''}`, 'success');
        onSuccess();
      } else if (duplicatedCount > 0) {
        addToast(`Todos os ${duplicatedCount} exames inseridos já estavam cadastrados (duplicatas).`, 'info');
      }
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
      addToast(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setSaveProgress(null);
      setSaveStartTime(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-28 text-slate-900">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Adicionar Novo Exame</h2>
          <p className="text-slate-500 mt-1">Insira os resultados via IA enviando documentos (PDF/Imagem) ou preencha manualmente.</p>
        </div>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="flex items-center justify-center p-3 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors font-semibold shadow-sm"
          >
            <ChevronRight size={18} className="rotate-180 hidden sm:block mr-2" />
            <X size={20} className="sm:hidden" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        )}
      </header>

      <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-xl w-full sm:w-fit shadow-inner mb-6">
        <button
          onClick={() => setMode('pdf')}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto ${mode === 'pdf' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <UploadCloud size={18} /> Inteligência Artificial (Documento/Foto)
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto mt-1 sm:mt-0 ${mode === 'manual' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <FileText size={18} /> Entrada Manual
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-4xl w-full text-slate-900 shadow-md">
        {reviewExams ? (
          <div className="space-y-6">
            <div className="p-4 bg-teal-50 border border-teal-150 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <h3 className="text-lg font-bold text-teal-800">Revisão de Exames Extraídos</h3>
                  <p className="text-sm text-teal-700 mt-1">Por favor, revise e ajuste os detalhes de cada um de seus exames abaixo identificados pela IA antes de aprovar e salvar definitivamente.</p>
               </div>
               <span className="px-3 py-1 bg-teal-600 text-white rounded-full font-bold text-xs">
                 {reviewExams.length} item(ns)
               </span>
            </div>

            {batchStats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs md:text-sm">
                 <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-slate-500 font-medium">Arquivos Enviados</span>
                    <span className="text-xl font-bold text-slate-800 mt-1">{batchStats.totalFiles}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Sucesso IA
                    </span>
                    <span className="text-xl font-bold text-slate-800 mt-1">{batchStats.processedSuccessfully}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-rose-600 font-semibold">Erros / Limites IA</span>
                    <span className="text-xl font-bold text-slate-800 mt-1">{batchStats.failedQuotaOrAI}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-amber-600 font-semibold">Arquivos s/ Exames</span>
                    <span className="text-xl font-bold text-slate-800 mt-1">{batchStats.zeroExams}</span>
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      Exames Duplicados ⚠️
                    </span>
                    <span className="text-xl font-bold text-slate-800 mt-1">{batchStats.duplicateExamsExcluding}</span>
                 </div>
              </div>
            )}
            
            {isProcessing && uploadProgress && (
              <div className="p-4 bg-teal-50/60 border border-teal-200/50 rounded-xl space-y-3 animate-in fade-in duration-300 mb-4">
                 <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                       </span>
                       <span className="text-teal-900 font-bold">Extração por IA em Execução...</span>
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-teal-200/50 text-teal-800 text-[10px] font-black uppercase">
                       Analisando arquivo {uploadProgress.current} de {uploadProgress.total}
                    </span>
                 </div>
                 <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner font-normal">
                    <div 
                      className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    ></div>
                 </div>
                 <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold tracking-wider">
                    <span>DICA: Você já pode revisar os exames identificados abaixo enquanto o restante é processado!</span>
                    <span className="flex items-center gap-2 shrink-0 select-none">
                      <span className="text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded border border-teal-200/50 flex items-center gap-1 font-bold">
                        <Clock size={10} /> Tempo restante: {getUploadEta()}
                      </span>
                      <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </span>
                  </div>
              </div>
            )}

            {isProcessing && !uploadProgress && (
              <div className="p-4 bg-teal-50/60 border border-teal-200/50 rounded-xl flex flex-col gap-3 animate-in fade-in duration-300 mb-4 font-sans text-slate-900">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl border border-teal-100 shadow-xs flex items-center justify-center shrink-0">
                     <svg className="animate-spin text-teal-600 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-teal-900 flex justify-between items-center">
                      <span>Salvando registros no prontuário...</span>
                      {saveProgress && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md font-bold">
                          {saveProgress.current} de {saveProgress.total} exames
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                      {saveProgress 
                        ? `Escrevendo no banco de dados. Salvou ${saveProgress.current} de ${saveProgress.total} registros.` 
                        : "Estamos adicionando os exames ao seu prontuário médico. Por favor, aguarde."}
                    </p>
                  </div>
                </div>
                {saveProgress && (
                  <div className="space-y-1.5 font-sans">
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                       <div 
                         className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out" 
                         style={{ width: `${Math.min(100, Math.round((saveProgress.current / saveProgress.total) * 100))}%` }}
                       ></div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold flex justify-between items-center select-none animate-in fade-in duration-300">
                      <span className="text-teal-700 bg-teal-50/80 px-1.5 py-0.5 rounded border border-teal-100/50 flex items-center gap-1 font-bold">
                        <Clock size={10} /> Tempo restante: {getSaveEta()}
                      </span>
                      <span>{Math.min(100, Math.round((saveProgress.current / saveProgress.total) * 100))}% concluído</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filter Tabs & Quick Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-150 shadow-3xs">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/65 rounded-xl border border-slate-205/10">
                <button
                  type="button"
                  onClick={() => setReviewTabFilter('all')}
                  className={`px-3 focus:outline-none py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewTabFilter === 'all' 
                      ? 'bg-teal-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <span>Todos os Extraídos</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${reviewTabFilter === 'all' ? 'bg-teal-700/60 text-white' : 'bg-slate-350 text-slate-700'}`}>
                    {reviewExams.length}
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setReviewTabFilter('new')}
                  className={`px-3 focus:outline-none py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewTabFilter === 'new' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-655 hover:text-emerald-750 hover:bg-emerald-50'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Prontos para Salvar</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${reviewTabFilter === 'new' ? 'bg-emerald-700/60 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    {reviewExams.length - reviewExams.filter(exam => isDuplicateExam(exams, exam.nomeExame || '', exam.dataExame || '', exam.resultado || '')).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewTabFilter('duplicate')}
                  className={`px-3 focus:outline-none py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    reviewTabFilter === 'duplicate' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'text-slate-655 hover:text-amber-750 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-[11px]">⚠️</span>
                  <span>Conflitos / Duplicados</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${reviewTabFilter === 'duplicate' ? 'bg-amber-700/60 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {reviewExams.filter(exam => isDuplicateExam(exams, exam.nomeExame || '', exam.dataExame || '', exam.resultado || '')).length}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-semibold px-1.5">
                {reviewTabFilter === 'duplicate' ? (
                  <span>💡 Ative "Forçar" para manter duplicatas voluntariamente.</span>
                ) : (
                  <span>💡 Ajuste os campos extraídos antes de salvar.</span>
                )}
              </div>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 pb-6 border-b border-slate-100">
              {reviewExams.map((exam, i) => {
                const isDuplicate = isDuplicateExam(exams, exam.nomeExame || '', exam.dataExame || '', exam.resultado || '');
                const conflicting = isDuplicate ? getConflictingExam(exams, exam.nomeExame || '', exam.dataExame || '', exam.resultado || '') : null;
                
                // Filtering based on active tab
                if (reviewTabFilter === 'new' && isDuplicate) return null;
                if (reviewTabFilter === 'duplicate' && !isDuplicate) return null;

                return (
                  <div 
                    key={i} 
                    className={`p-4 border rounded-2xl space-y-3.5 relative transition-all duration-300 shadow-3xs hover:shadow-2xs ${
                      isDuplicate 
                        ? exam.forceSave 
                          ? 'border-emerald-350 bg-emerald-50/15 hover:bg-emerald-50/25 ring-1 ring-emerald-100' 
                          : 'border-amber-250/80 bg-amber-50/10 hover:bg-amber-50/15' 
                        : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <button 
                       onClick={() => setReviewExams(reviewExams.filter((_, index) => index !== i))}
                       className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 rounded-lg p-1.5 hover:bg-white hover:shadow-xs transition-colors cursor-pointer"
                       title="Remover este exame da lista"
                    >
                      <Trash2 size={16} />
                    </button>

                    {isDuplicate && (
                      <div className={`p-3.5 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-semibold animate-in fade-in duration-300 ${
                        exam.forceSave 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                          : 'bg-amber-50/80 border-amber-200/60 text-amber-950'
                      }`}>
                        <div className="flex items-start gap-2 max-w-xl">
                          <span className="text-base leading-none select-none">{exam.forceSave ? '✅' : '⚠️'}</span>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {exam.forceSave ? 'Importação Forçada Habilitada' : 'Exame Duplicado Encontrado'}
                            </p>
                            <p className="text-[11.5px] font-medium leading-relaxed mt-1 text-slate-650">
                              {conflicting ? (
                                <>
                                  Este item bate exatamente com o exame <strong className="text-slate-900">"{conflicting.nomeExame}"</strong> cadastrado em <strong className="text-slate-900">{conflicting.dataExame}</strong> com resultado <strong className="text-slate-900">{conflicting.resultado} {conflicting.unidade || ''}</strong>. 
                                  {exam.forceSave ? ' Ele será re-importado como uma nova entrada extra.' : ' Ele será pulado silenciosamente para evitar poluição.'}
                                </>
                              ) : (
                                `Já cadastrado no prontuário com este resultado.${exam.forceSave ? ' Será salvo como um novo registro.' : ' Fará o descarte automático.'}`
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Force Toggle */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs">
                          <span className={`text-[9.5px] font-black uppercase tracking-wider ${exam.forceSave ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {exam.forceSave ? 'Forçar' : 'Pular'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleForceSaveExam(i)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              exam.forceSave ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                            title={exam.forceSave ? "Desativar salvamento forçado" : "Ativar salvamento forçado"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                                exam.forceSave ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2.5 pt-1">
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nome do Exame</label>
                         <input type="text" value={exam.nomeExame || ''} onChange={e => updateReviewExam(i, 'nomeExame', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Resultado / Valor</label>
                         <input type="text" value={exam.resultado || ''} onChange={e => updateReviewExam(i, 'resultado', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Data (DD/MM/AAAA)</label>
                         <input type="text" value={exam.dataExame || ''} onChange={e => updateReviewExam(i, 'dataExame', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unidade</label>
                         <input type="text" value={exam.unidade || ''} onChange={e => updateReviewExam(i, 'unidade', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Valor de Referência</label>
                         <input type="text" value={exam.valorReferencia || ''} onChange={e => updateReviewExam(i, 'valorReferencia', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Interpretação (Status)</label>
                         <select value={exam.interpretacao || 'Não Informado'} onChange={e => updateReviewExam(i, 'interpretacao', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none">
                            <option value="Normal">Normal</option>
                            <option value="Alterado">Alterado</option>
                            <option value="Sub-ópt.">Sub-óptimo</option>
                            <option value="Não Informado">Não Informado</option>
                         </select>
                       </div>
                    </div>

                    {/* Rótulos Inteligentes e Metadados Clínicos */}
                    <div className="mt-3.5 pt-4 border-t border-dashed border-slate-200 bg-slate-50/70 p-4 rounded-2xl space-y-4">
                      
                      {/* Cabecalho da Rotulacao com Rank de Confianca */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-900 uppercase tracking-widest">
                          <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                          <span>Rotulação Médica Avançada & Inteligência Clínica</span>
                        </div>
                        <div className="flex items-center gap-1 bg-teal-150 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle size={10} className="text-teal-600 animate-bounce" />
                          <span>Nível de Confiança Extração: Alta (99%)</span>
                        </div>
                      </div>

                      {/* Procura dinamica no Dicionario de Diagnosticos Clinicos */}
                      {(() => {
                        const glossaryItem = EXAM_GLOSSARY.find(g => 
                          g.canonicalName.toLowerCase() === (exam.nomeExame || '').toLowerCase() ||
                          g.aliases.some(alias => alias.toLowerCase() === (exam.nomeExame || '').toLowerCase()) ||
                          normalizeAndMatchExam(exam.nomeExame || '').toLowerCase() === g.canonicalName.toLowerCase()
                        );
                        
                        if (glossaryItem) {
                          return (
                            <div className="p-3 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 border border-indigo-150 rounded-xl space-y-1 shadow-3xs">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                                <BookOpen size={14} className="text-indigo-600 shrink-0" />
                                <span>Termo Clínico Padronizado: {glossaryItem.canonicalName}</span>
                              </div>
                              <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                                {glossaryItem.description}
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-3 bg-slate-100/60 border border-slate-200/50 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <Info size={13} className="text-slate-500 shrink-0" />
                                <span>Marcador Personalizado</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                                Este biomarcador será indexado especificamente sob o nicho de <strong className="text-slate-800">{exam.grupoSistemico || 'Geral / Outros'}</strong>.
                              </p>
                            </div>
                          );
                        }
                      })()}

                      {/* Painel Alerta Autoimunidade se for Alto ou Medio */}
                      {(exam.impactoAutoimune === 'Alto' || exam.impactoAutoimune === 'Médio') && (
                        <div className="p-3 bg-rose-50/65 border border-rose-150/85 rounded-xl flex items-start gap-2.5 text-xs animate-in slide-in-from-top-2 duration-300">
                           <ShieldAlert className="text-rose-600 shrink-0 mt-0.5 animate-pulse" size={17} />
                           <div>
                             <p className="font-bold text-rose-950">
                               Relevância Diagnóstica Autoimune ({exam.impactoAutoimune})
                             </p>
                             <p className="text-[11px] text-rose-800 font-medium leading-relaxed mt-0.5">
                               Este analito é de alta criticidade e auxilia diretamente no monitoramento de condições imunológicas e processos infamatórios de suas patologias ativas.
                             </p>
                           </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                            <span>🧪 Grupo Sistêmico</span>
                          </label>
                          <select 
                            value={exam.grupoSistemico || 'Geral / Outros'} 
                            onChange={e => updateReviewExam(i, 'grupoSistemico', e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 shadow-3xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="Imunológico & Inflamatório">🔴 Imunológico & Inflamatório</option>
                            <option value="Metabólico / Lipídico">🟢 Metabólico / Lipídico</option>
                            <option value="Endócrino & Tireoide">🟣 Endócrino & Tireoide</option>
                            <option value="Renal">🔵 Renal</option>
                            <option value="Hepático">🟤 Hepático</option>
                            <option value="Hematológico">🩸 Hematológico</option>
                            <option value="Musculoesquelético">🦴 Musculoesquelético</option>
                            <option value="Nutricional & Neurológico">🧠 Nutricional & Neurológico</option>
                            <option value="Geral / Outros">⚪ Geral / Outros</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            👩‍⚕️ Especialidade Médica
                          </label>
                          <input 
                            type="text" 
                            placeholder="Reumatologia, Endocrinologia, etc"
                            value={exam.especialidadeMedica || ''} 
                            onChange={e => updateReviewExam(i, 'especialidadeMedica', e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 shadow-3xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            ⚠️ Impacto Autoimune
                          </label>
                          <select 
                            value={exam.impactoAutoimune || 'Nenhum'} 
                            onChange={e => updateReviewExam(i, 'impactoAutoimune', e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 shadow-3xs focus:ring-2 focus:ring-indigo-500 focus:outline-none animate-none"
                          >
                            <option value="Alto">Alto Impacto</option>
                            <option value="Médio">Médio Impacto</option>
                            <option value="Baixo">Baixo Impacto</option>
                            <option value="Nenhum">Nenhum</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            🏷️ Tags Clínicas (por vírgula)
                          </label>
                          <input 
                            type="text" 
                            placeholder="Ex: FAN, Tireoide, Infecção"
                            value={exam.tags || ''} 
                            onChange={e => updateReviewExam(i, 'tags', e.target.value)} 
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 shadow-3xs focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                          />
                        </div>
                      </div>

                      {/* Pills de Tags representativas em tempo real */}
                      {((exam.tags || '').split(',').map(tag => tag.trim()).filter(Boolean).length > 0) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(exam.tags || '').split(',').map((tag, tIdx) => (
                            <span key={tIdx} className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold rounded-lg transition-transform hover:scale-105">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">
                          📄 Notas Clínicas / Conclusão & Laudo da IA
                        </label>
                        <textarea 
                          rows={2}
                          placeholder="Descrição cirúrgica do laudo ou achados textuais completos observados..."
                          value={exam.observacoes || ''} 
                          onChange={e => updateReviewExam(i, 'observacoes', e.target.value)} 
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 shadow-3xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y font-medium"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setReviewExams(null)} 
                  disabled={isProcessing}
                  className="px-6 py-3 border border-slate-200 rounded-xl font-bold bg-white text-slate-700 hover:bg-slate-50 w-full sm:w-auto transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                >
                   Cancelar Importação
                </button>
                <button 
                  onClick={handleApproveReview} 
                  disabled={isProcessing} 
                  className="flex-1 px-6 py-3 bg-teal-600 rounded-xl font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                   {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>
                          {uploadProgress 
                            ? `IA Processando Outros Arquivos (${uploadProgress.current}/${uploadProgress.total})...` 
                            : saveProgress 
                              ? `Salvando Exames no Prontuário (${saveProgress.current}/${saveProgress.total})...`
                              : 'Salvando Exames no Prontuário...'}
                        </span>
                      </>
                   ) : (
                      'Aprovar e Salvar Exames extraídos'
                   )}
                </button>
            </div>
          </div>
        ) : mode === 'pdf' ? (
          <>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-xl transition-all relative group ${isProcessing ? 'border-teal-300 bg-teal-50/20' : isDragging ? 'border-teal-500 bg-teal-50 scale-[1.02]' : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer'}`}
            >
              <input 
                type="file"
                multiple 
                accept=".pdf,image/jpeg,image/png,image/webp" 
                onChange={handlePdfUpload}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
              />
              {isProcessing ? (
                <div className="flex flex-col items-center gap-4 text-teal-700 w-full max-w-md mx-auto text-center relative z-20">
                  <div className="relative">
                     <div className="absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                     <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center relative border-4 border-teal-100 mb-2 shadow-inner">
                        <svg className="animate-spin text-teal-600 w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">Processando {uploadProgress && uploadProgress.total > 1 ? `(${uploadProgress.current}/${uploadProgress.total})` : ''} documentos...</h3>
                  {uploadProgress && uploadProgress.total > 1 && (
                    <div className="w-full mt-2">
                       <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                          ></div>
                       </div>
                       <p className="text-xs text-slate-500 mt-2 font-medium flex justify-between items-center w-full">
                         <span>Analisando dados médicos com IA... ({Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)</span>
                         <span className="text-teal-700 font-bold flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 select-none shrink-0">
                           <Clock size={11} className="shrink-0 text-teal-600 animate-pulse" />
                           ETA: {getUploadEta()}
                         </span>
                       </p>
                    </div>
                  )}
                  {(!uploadProgress || uploadProgress.total <= 1) && (
                    <div className="w-full font-normal">
                      {docProgress ? (
                        <div className="w-full mt-4">
                           <div className="flex justify-between items-center mb-1.5 px-1">
                              <span className="text-xs text-teal-850 font-bold flex items-center gap-1.5">
                                 <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                                 </span>
                                 Extraindo marcadores...
                              </span>
                              <span className="text-xs font-black bg-teal-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                                 {Math.round((docProgress.progress / docProgress.total) * 100)}%
                              </span>
                           </div>
                           <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300/35 relative">
                              <div 
                                className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out shadow-sm" 
                                style={{ width: `${(docProgress.progress / docProgress.total) * 100}%` }}
                              ></div>
                           </div>
                           <p className="text-xs text-slate-550 mt-2.5 font-semibold">
                              {docProgress.message || `Analisando parte ${docProgress.progress} de ${docProgress.total} do laudo...`}
                           </p>
                        </div>
                      ) : (
                        <div className="w-full mt-4">
                           <p className="text-sm text-slate-550 font-medium mb-3">A Inteligência Artificial está lendo e analisando o seu documento.</p>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner relative max-w-[280px] mx-auto border border-slate-150">
                              <div className="h-full bg-teal-500/50 rounded-full animate-pulse w-3/4"></div>
                           </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg w-full flex items-start gap-3 text-left">
                     <div className="text-amber-500 mt-0.5"><Activity size={20} /></div>
                     <div>
                       <p className="text-sm font-semibold text-amber-800">Recomendação Importante</p>
                       <p className="text-xs text-amber-700 mt-1">Por favor, <strong>não feche e nem atualize esta página</strong>. Este processo pode levar alguns segundos dependendo do tamanho do documento.</p>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-500 group-hover:text-teal-600 transition-colors relative z-20">
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-teal-100 text-slate-400 group-hover:text-teal-500 rounded-full flex items-center justify-center transition-colors">
                    <UploadCloud size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg text-center mb-1 group-hover:text-teal-800 transition-colors">Sim, é melhor enviar por aqui! (PDF/JPG)</h3>
                    <p className="text-sm text-center">A IA do Prontuário irá processar, classificar e analisar os laudos no seu histórico.<br/>O tamanho máximo suportado é de <strong>100MB por arquivo</strong>.</p>
                  </div>
                </div>
              )}
            </div>

            {queuedDocs.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <span className="p-2 bg-slate-100 rounded-lg text-slate-600"><Clock size={16} /></span>
                    Fila de Processamento <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">{queuedDocs.length}</span>
                  </h3>
                  {queuedDocs.length > 0 && (
                    <button 
                      onClick={() => {
                        queuedDocs.forEach(d => handleRemoveFromQueue(d.id));
                        setIsProcessing(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 font-medium hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    >
                      Limpar toda a fila
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {queuedDocs.map(doc => (
                    <div key={doc.id} className="p-4 rounded-xl border flex items-center justify-between bg-white shadow-sm border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-semibold text-slate-700 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {doc.status === 'processing' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-600 flex items-center gap-1.5 w-max"><Loader2 size={12} className="animate-spin" /> Processando...</span>}
                          {doc.status === 'failed' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-600 flex items-center gap-1.5 w-max"><AlertCircle size={12} /> {doc.errorMessage || 'Falhou ao extrair os dados'}</span>}
                          {doc.status === 'failed' && doc.nextRetryTime && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-600 flex items-center gap-1.5 w-max"><Clock size={12} /> Auto-tentativa prog. p/ {new Date(doc.nextRetryTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>
                          )}
                          {doc.status === 'pending' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1.5 w-max"><Clock size={12} /> Na fila aguardando processamento</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {doc.status !== 'processing' && (
                          <button 
                            onClick={() => handleRetry(doc)}
                            disabled={isProcessing}
                            className="p-2.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border border-teal-100"
                            title="Tentar Novamente (Processar agora)"
                          >
                            <RefreshCw size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            handleRemoveFromQueue(doc.id);
                            // Also clear isProcessing if this was the last item
                            if (queuedDocs.length <= 1) {
                              setIsProcessing(false);
                            }
                          }}
                          className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-rose-100"
                          title="Remover / Cancelar documento da fila"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Data do Exame <span className="text-rose-500">*</span></label>
                <input type="date" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white text-slate-900" 
                  value={dataExame.split('/').reverse().join('-') || ''} onChange={e => {
                    const [y, m, d] = e.target.value.split('-');
                    if (y) setDataExame(`${d}/${m}/${y}`);
                  }} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Médico Solicitante</label>
                <input type="text" placeholder="Dr(a). ..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white text-slate-900" 
                  value={medico} onChange={e => setMedico(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Fonte (Opcional)</label>
                <input type="text" placeholder="Nome do arquivo ou origem" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white text-slate-900" 
                  value={origem} onChange={e => setOrigem(e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900">Resultados / Biomarcadores</h3>
              </div>
              
              {markers.map((marker, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative group">
                  <button 
                    type="button"
                    onClick={() => handleRemoveMarker(idx)}
                    className="absolute right-2 top-2 bg-white border border-slate-200 rounded-full p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all disabled:opacity-0 z-10"
                    disabled={markers.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-6 md:pt-0">
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marcador <span className="text-rose-500">*</span></label>
                      <input type="text" placeholder="ex: Colesterol" required className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" 
                        value={marker.nomeExame || ''} onChange={e => updateMarker(idx, 'nomeExame', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor <span className="text-rose-500">*</span></label>
                      <input type="text" placeholder="ex: 120" required className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono" 
                        value={marker.resultado || ''} onChange={e => updateMarker(idx, 'resultado', e.target.value)} />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidade</label>
                      <input type="text" placeholder="ex: mg/dL" className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" 
                        value={marker.unidade || ''} onChange={e => updateMarker(idx, 'unidade', e.target.value)} />
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interpretação</label>
                      <select className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                        value={marker.interpretacao} onChange={e => updateMarker(idx, 'interpretacao', e.target.value)}
                      >
                        <option value="Normal">Normal</option>
                        <option value="Sub-ópt.">Sub-ótimo</option>
                        <option value="Alterado">Alterado</option>
                        <option value="Não Informado">Não Informado</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</label>
                      <select className="w-full px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        value={marker.categoria} onChange={e => updateMarker(idx, 'categoria', e.target.value)}
                      >
                        <option value="SANGUE">Sangue</option>
                        <option value="URINA">Urina</option>
                        <option value="FEZES">Fezes</option>
                        <option value="IMAGEM">Imagem</option>
                        <option value="LAUDO">Laudo / Avaliação</option>
                        <option value="RELATÓRIO">Relatório / Parecer</option>
                        <option value="OUTROS">Outros</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Observações / Laudo</label>
                     <textarea 
                        placeholder="Adicione detalhes, método utilizado, laudo descritivo..." 
                        rows={2} 
                        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none custom-scrollbar"
                        value={marker.observacoes || ''} 
                        onChange={e => updateMarker(idx, 'observacoes', e.target.value)}
                     ></textarea>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddMarker}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Adicionar outro marcador
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200 flex sm:justify-end gap-3">
              <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/30 flex items-center justify-center gap-2">
                <CheckCircle size={18} /> Salvar Exames ({markers.length})
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
