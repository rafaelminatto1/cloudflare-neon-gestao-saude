import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Pill, User, ChevronRight } from 'lucide-react';
import { MedicalRecord, ContinuousMedication, Doctor } from '../data';

interface SidebarSearchProps {
  processedExams: MedicalRecord[];
  medications: ContinuousMedication[];
  doctors: Doctor[];
  onNavigate: (tab: string, item?: any) => void;
  onCloseMobile?: () => void;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ 
  processedExams, 
  medications, 
  doctors, 
  onNavigate,
  onCloseMobile
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const newResults: any[] = [];

    // Search Exams (limit to top 5 unique by name)
    const matchedExams = processedExams.filter(e => e.nomeExame?.toLowerCase().includes(q));
    const uniqueExamNames = new Set();
    matchedExams.forEach(e => {
        if (!uniqueExamNames.has(e.nomeExame) && uniqueExamNames.size < 5) {
            uniqueExamNames.add(e.nomeExame);
            newResults.push({ type: 'exam', label: e.nomeExame, item: e, sub: e.categoria });
        }
    });

    // Search Medications
    const matchedMeds = medications.filter(m => m.name.toLowerCase().includes(q) || m.notes?.toLowerCase().includes(q)).slice(0, 3);
    matchedMeds.forEach(m => {
        newResults.push({ type: 'med', label: m.name, item: m, sub: m.dosage || 'Medicamento' });
    });

    // Search Doctors
    const matchedDocs = doctors.filter(d => d.name.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)).slice(0, 3);
    matchedDocs.forEach(d => {
        newResults.push({ type: 'doc', label: d.name, item: d, sub: d.specialty });
    });

    setResults(newResults);
    setIsOpen(true);
  }, [query, processedExams, medications, doctors]);

  const handleSelect = (result: any) => {
    if (onCloseMobile) onCloseMobile();
    
    switch (result.type) {
        case 'exam':
            onNavigate('dictionary', { filterTerm: result.label });
            break;
        case 'med':
            onNavigate('medications');
            break;
        case 'doc':
            onNavigate('doctors');
            break;
    }
    
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative px-4 mt-4" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-7 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Buscar no prontuário..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-sans"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                {r.type === 'exam' && <FileText size={14} className="text-blue-400" />}
                {r.type === 'med' && <Pill size={14} className="text-purple-400" />}
                {r.type === 'doc' && <User size={14} className="text-teal-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate">{r.label}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate uppercase">{r.sub}</p>
              </div>
              <ChevronRight size={14} className="text-slate-500 shrink-0" />
            </button>
          ))}
        </div>
      )}
      
      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 text-center z-20">
            <p className="text-sm text-slate-400">Nenhum resultado encontrado.</p>
        </div>
      )}
    </div>
  );
};
