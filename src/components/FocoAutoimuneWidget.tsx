import React, { useMemo } from 'react';
import { ShieldAlert, TrendingUp } from 'lucide-react';
import { useData } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

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

export function FocoAutoimuneWidget() {
  const { processedExams } = useData();

  const data = useMemo(() => {
    // Filter out FAN, VHS, PCR exams
    const markers = ['FAN', 'VHS', 'Proteína C-Reativa (PCR)', 'PCR'];
    
    // Process the exams into a timeline format
    const examsToTrack = processedExams.filter(e => 
      markers.some(m => e.nomeExame.toLowerCase().includes(m.toLowerCase()))
    );

    const datesSet = new Set<string>();
    examsToTrack.forEach(e => datesSet.add(e.dataExame));
    
    // Sort dates
    const sortedDates = Array.from(datesSet).sort((a, b) => 
      parseDate(a).getTime() - parseDate(b).getTime()
    );

    const chartData = sortedDates.map(date => {
      const dataPoint: any = { data: date };
      
      const examsOnDate = examsToTrack.filter(e => e.dataExame === date);
      
      examsOnDate.forEach(e => {
        let value = NaN;
        
        // 1. Prioritize FAN title matching (e.g. 1/160, 1/640)
        const fanMatch = e.resultado.match(/1\/(\d+)/);
        if (fanMatch) {
          value = parseInt(fanMatch[1], 10);
        } else if (e.resultado.toLowerCase().includes('não reagente') || e.resultado.toLowerCase().includes('negativo')) {
          value = 0;
        } else if (e.resultado.toLowerCase().includes('reagente') || e.resultado.toLowerCase().includes('positivo')) {
          value = 1; // Arbitrary positive indicator
        } else {
          // 2. Regular numeric parsing
          const cleanStr = e.resultado.replace(',', '.').replace(/[^\d.-]/g, '');
          const num = parseFloat(cleanStr);
          if (!isNaN(num)) {
            value = num;
          }
        }
        
        let normalizedName = e.nomeExame.toUpperCase();
        if (normalizedName.includes('PCR') || normalizedName.includes('C-REATIVA')) normalizedName = 'PCR';
        if (normalizedName.includes('VHS') || normalizedName.includes('HEMOSSED')) normalizedName = 'VHS';
        if (normalizedName.includes('FAN') || normalizedName.includes('ANTINUCLEAR')) normalizedName = 'FAN (Título)';

        if (!isNaN(value)) {
          dataPoint[normalizedName] = value;
        }
      });
      return dataPoint;
    });

    return chartData;
  }, [processedExams]);

  if (data.length === 0) {
      return (
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-200">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
               <ShieldAlert className="text-rose-500" size={18} /> Foco Autoimune
            </h3>
            <div className="py-6 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
               <p className="text-[10px] text-slate-400 font-semibold">Nenhum exame de marcador inflamatório (FAN, VHS, PCR) registrado.</p>
            </div>
         </div>
      );
  }

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-rose-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
           <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="text-rose-500" size={18} /> Foco Autoimune
           </h3>
           <p className="text-[10px] text-slate-400 mt-0.5">Rastreamento de PCR, VHS e Títulos do FAN</p>
        </div>
      </div>
      
      <div className="h-[200px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 15, right: 35, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8B5CF6' }} />
            <RechartsTooltip 
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
                backgroundColor: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(12px)',
                padding: '10px 14px'
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 700 }}
              labelStyle={{ fontSize: '10px', color: '#64748B', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
            
            {/* Safe reference lines */}
            <ReferenceLine yAxisId="left" y={1} stroke="#F43F5E" strokeDasharray="3 3" label={{ value: "PCR <1.0", position: "top", fill: "#F43F5E", fontSize: 9, fontWeight: 'bold' }} />
            <ReferenceLine yAxisId="left" y={20} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: "VHS <20", position: "top", fill: "#F59E0B", fontSize: 9, fontWeight: 'bold' }} />
            
            <Line yAxisId="left" type="monotone" dataKey="PCR" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3.5, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2 }} connectNulls />
            <Line yAxisId="left" type="monotone" dataKey="VHS" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3.5, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="FAN (Título)" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3.5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
