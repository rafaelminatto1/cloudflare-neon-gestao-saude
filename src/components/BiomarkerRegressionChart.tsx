import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { LineChart, Sparkles } from 'lucide-react';
import { useData } from '../App';
import { MedicalRecord } from '../data';

// Helper to parse dates like "DD/MM/YYYY" or "YYYY-MM-DD"
const parseDate = (d: string) => {
  if (!d) return new Date();
  if (d.includes('/')) {
    const [day, month, year] = d.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(d);
};

// Helper for regression equation
const linearRegression = (data: [number, number][]) => {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let [x, y] of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
};

export const BiomarkerRegressionChart: React.FC = () => {
  const { processedExams } = useData();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Group by canonical name to find top biomarkers with at least 3 data points
  const candidateBiomarkers = useMemo(() => {
    const groups: Record<string, MedicalRecord[]> = {};
    processedExams.forEach(e => {
      const g = e.nomeExame.trim().toUpperCase();
      if (!groups[g]) groups[g] = [];
      groups[g].push(e);
    });
    
    // valid specific candidate
    return Object.entries(groups)
      .filter(([_, exams]) => exams.length >= 3)
      .map(([name, exams]) => {
        const sorted = exams.sort((a,b) => parseDate(a.dataExame).getTime() - parseDate(b.dataExame).getTime());
        return { name, exams: sorted };
      })
      .sort((a, b) => b.exams.length - a.exams.length);
  }, [processedExams]);

  const [selectedMarker, setSelectedMarker] = useState<string>(candidateBiomarkers[0]?.name || '');
  const [brushRange, setBrushRange] = useState<[Date, Date] | null>(null);

  useEffect(() => {
    if (!selectedMarker && candidateBiomarkers.length > 0) {
      setSelectedMarker(candidateBiomarkers[0].name);
    }
  }, [candidateBiomarkers, selectedMarker]);

  useEffect(() => {
    setBrushRange(null);
  }, [selectedMarker]);

  const chartData = useMemo(() => {
    const markerData = candidateBiomarkers.find(c => c.name === selectedMarker);
    if (!markerData) return [];
    
    return markerData.exams.map(e => {
      const val = parseFloat(e.resultado.replace(',', '.'));
      if (isNaN(val)) return null;
      return {
        date: parseDate(e.dataExame),
        value: val,
        unit: e.unidade || '',
        reference: e.valorReferencia || ''
      };
    }).filter(d => d !== null) as { date: Date, value: number, unit: string, reference: string }[];
  }, [candidateBiomarkers, selectedMarker]);

  const visibleChartData = useMemo(() => {
    if (!brushRange) return chartData;
    const filtered = chartData.filter(d => d.date.getTime() >= brushRange[0].getTime() && d.date.getTime() <= brushRange[1].getTime());
    return filtered.length >= 2 ? filtered : chartData; // Fallback to full data if brush selection leaves less than 2 points
  }, [chartData, brushRange]);

  const [dimensions, setDimensions] = useState({ width: 600, height: 240 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && svgRef.current.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: 240
        });
      }
    };
    
    // Initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || visibleChartData.length < 2) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const { width, height } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);
    
    // Define clip path
    svg.append("defs").append("clipPath")
       .attr("id", "clip")
       .append("rect")
       .attr("width", innerWidth)
       .attr("height", innerHeight);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(visibleChartData, d => d.date) as [Date, Date];
    const yExtent = d3.extent(visibleChartData, d => d.value) as [number, number];
    
    // Add some padding to Y domain
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 1;

    // Add some padding to X domain to avoid cutting off points
    const xPaddingMs = (xExtent[1].getTime() - xExtent[0].getTime()) * 0.05 || 86400000;
    const paddedXExtent: [Date, Date] = [
        new Date(xExtent[0].getTime() - xPaddingMs), 
        new Date(xExtent[1].getTime() + xPaddingMs)
    ];

    const xScale = d3.scaleTime()
      .domain(paddedXExtent)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([Math.max(0, yExtent[0] - yPadding), yExtent[1] + yPadding])
      .range([innerHeight, 0]);

    // Draw Axes
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat((domainValue: Date | d3.NumberValue) => {
        return d3.timeFormat("%b/%y")(domainValue as Date);
    });
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr("color", "#94a3b8")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", "10px");

    g.append("g")
      .call(yAxis)
      .attr("color", "#94a3b8")
      .attr("font-family", "Inter, sans-serif")
      .attr("font-size", "10px");

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => "").ticks(5))
      .attr("stroke", "#f1f5f9")
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.5)
      .selectAll("line")
      .style("stroke", "#e2e8f0");
      
    // Remove the domain line of grid
    g.selectAll(".grid path").remove();

    // Add brush
    const brush = d3.brushX()
       .extent([[0, 0], [innerWidth, innerHeight]])
       .on("end", (event) => {
          if (!event.selection) return;
          const [x0, x1] = event.selection.map(xScale.invert);
          setBrushRange([x0, x1]);
       });

    const brushArea = g.append("g")
       .attr("class", "brush")
       .call(brush);

    const chartArea = g.append("g")
       .attr("clip-path", "url(#clip)");

    // Actual Data Line
    const line = d3.line<{date: Date, value: number}>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    chartArea.append("path")
      .datum(visibleChartData)
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Data points & tooltips
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(15, 23, 42, 0.92)")
      .style("backdrop-filter", "blur(12px)")
      .style("-webkit-backdrop-filter", "blur(12px)")
      .style("border", "1px solid rgba(99, 102, 241, 0.3)")
      .style("padding", "10px 12px")
      .style("border-radius", "12px")
      .style("box-shadow", "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.05)")
      .style("font-size", "11px")
      .style("font-family", "Inter, sans-serif")
      .style("color", "#f1f5f9")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("min-width", "140px")
      .style("transition", "opacity 0.15s ease");

    chartArea.selectAll(".dot")
      .data(visibleChartData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 5)
      .attr("fill", "#6366f1")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "r 0.15s ease, fill 0.15s ease")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 8).attr("fill", "#4f46e5").attr("stroke-width", 2.5);
        tooltip.html(`
          <div style="border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 6px; padding-bottom: 6px; font-size: 10px; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700">${d3.timeFormat("%d/%m/%Y")(d.date)}</div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px">
            <span style="color: #a5b4fc; font-size: 10px; font-weight: 600">Valor</span>
            <span style="font-size: 16px; font-weight: 900; color: #818cf8; font-variant-numeric: tabular-nums">${d.value}</span>
            <span style="color: #64748b; font-size: 10px; font-weight: 500">${d.unit}</span>
          </div>
          ${d.reference ? `<div style="font-size: 9px; color: #475569; background: rgba(255,255,255,0.05); padding: 3px 6px; border-radius: 4px; margin-top: 2px">Ref: ${d.reference}</div>` : ''}
        `)
        .style("visibility", "visible");
      })
      .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 14) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 5).attr("fill", "#6366f1").attr("stroke-width", 2);
        tooltip.style("visibility", "hidden");
      });

    // Regression Line computation
    const regressionData = visibleChartData.map(d => [xScale(d.date), yScale(d.value)] as [number, number]);
    const { slope, intercept } = linearRegression(regressionData);

    // Calculate start and end points for the regression line within visible range
    const xMin = xScale(paddedXExtent[0]);
    const xMax = xScale(paddedXExtent[1]);
    const yStart = slope * xMin + intercept;
    const yEnd = slope * xMax + intercept;

    // Draw regression line
    chartArea.append("line")
      .attr("x1", xMin)
      .attr("y1", yStart)
      .attr("x2", xMax)
      .attr("y2", yEnd)
      .attr("stroke", "#ec4899") // Pink/Rose color for regression
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0); // start invisible for animation

    // Animate regression line
    chartArea.selectAll("line[stroke='#ec4899']")
      .transition()
      .duration(1000)
      .attr("opacity", 0.7);

    // Cleanup tooltips on unmount
    return () => {
      d3.selectAll(".d3-tooltip").remove();
    };
  }, [visibleChartData, dimensions]);

  if (candidateBiomarkers.length === 0) {
    return (
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-full flex flex-col justify-center items-center text-center">
         <LineChart className="text-slate-300 mb-2" size={24} />
         <p className="text-sm font-semibold text-slate-500">Regressão de Evolução</p>
         <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">É necessário pelo menos um biomarcador com 3 resultados históricos para calcular a regressão linear.</p>
       </div>
    );
  }

  // Find if progression is trending up or down
  const regressionTrendDesc = () => {
    if (chartData.length < 2) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const diff = last.value - first.value;
    const pct = (diff / first.value) * 100;
    
    return {
      isUp: diff > 0,
      diff: Math.abs(diff),
      pct: Math.abs(pct)
    };
  };

  const trend = regressionTrendDesc();

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <LineChart className="text-pink-500" size={18} /> Progressão e Tendência (D3)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Regressão linear da evolução do biomarcador a longo prazo.</p>
        </div>
        <select
          value={selectedMarker}
          onChange={(e) => setSelectedMarker(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 focus:ring-0 focus:border-pink-300 font-semibold max-w-[200px]"
        >
          {candidateBiomarkers.map(c => (
            <option key={c.name} value={c.name}>{c.name} ({c.exams.length} aferições)</option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full relative min-h-[250px]">
        {/* Chart container */}
        <div className="w-full h-full pb-6">
          <svg ref={svgRef} className="w-full h-full overflow-visible absolute top-0 left-0"></svg>
        </div>
        
        {/* Trend summary overlay */}
        {trend && (
           <div className="absolute top-0 right-0 bg-white/90 backdrop-blur-sm border border-slate-100 shadow-sm rounded-xl px-3 py-2 flex flex-col items-end z-10 pointer-events-none">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Tendência Linear</span>
             <div className="flex items-center gap-1.5">
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.isUp ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                 {trend.isUp ? 'Aumento' : 'Redução'} de ~{trend.pct.toFixed(1)}%
               </span>
             </div>
             {brushRange && (
               <button 
                 onClick={(e) => { e.preventDefault(); setBrushRange(null); }}
                 className="mt-2 text-[9px] font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded w-full text-center transition-colors pointer-events-auto cursor-pointer"
               >
                 Remover Zoom
               </button>
             )}
           </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1.5 justify-center border-t border-slate-50 pt-2">
        <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span> 
        Linha tracejada representa a regressão linear de mínimos quadrados.
      </div>
    </div>
  );
};
