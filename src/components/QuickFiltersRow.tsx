import React from 'react';

export const QUICK_FILTERS = [
  { id: 'Limpar', label: 'Limpar', activeClass: 'bg-slate-200 text-slate-800', hoverClass: 'hover:bg-slate-300' },
  { id: 'Perfil Lipídico', label: 'Lipídios', activeClass: 'bg-indigo-100 text-indigo-700', hoverClass: 'hover:bg-indigo-200' },
  { id: 'Metabolismo Glicídico', label: 'Glicemia', activeClass: 'bg-emerald-100 text-emerald-700', hoverClass: 'hover:bg-emerald-200' },
  { id: 'Função Hepática', label: 'Hepático', activeClass: 'bg-amber-100 text-amber-700', hoverClass: 'hover:bg-amber-200' },
  { id: 'Função Renal', label: 'Renal', activeClass: 'bg-sky-100 text-sky-700', hoverClass: 'hover:bg-sky-200' },
  { id: 'Hormônios & Tireoide', label: 'Hormonal', activeClass: 'bg-purple-100 text-purple-700', hoverClass: 'hover:bg-purple-200' },
  { id: 'Autoimunidade & Inflamação', label: 'Inflamatório', activeClass: 'bg-rose-100 text-rose-700', hoverClass: 'hover:bg-rose-200' },
  { id: 'Vitaminas & Minerais', label: 'Vitaminas', activeClass: 'bg-yellow-100 text-yellow-700', hoverClass: 'hover:bg-yellow-200' },
  { id: 'Hematologia', label: 'Hematologia', activeClass: 'bg-red-100 text-red-700', hoverClass: 'hover:bg-red-200' },
  { id: 'Enzimas Musculares', label: 'Muscular', activeClass: 'bg-orange-100 text-orange-700', hoverClass: 'hover:bg-orange-200' }
];

export function QuickFiltersRow({ onSelect, selectedGroup = null }: { onSelect: (group: string) => void, selectedGroup?: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-default select-none">Filtros Rápidos de Especialidade:</span>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full translate-z-0">
        {QUICK_FILTERS.map(filter => {
          const isActive = selectedGroup && selectedGroup === filter.id && filter.id !== 'Limpar';
          const finalClass = isActive 
             ? `shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ring-2 ring-offset-1 ring-${filter.activeClass.split(' ')[0].replace('bg-', '')} ${filter.activeClass}`
             : `shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter.activeClass} ${filter.hoverClass}`;
             
          return (
            <button 
              key={filter.id}
              onClick={() => onSelect(filter.id)} 
              className={finalClass}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
