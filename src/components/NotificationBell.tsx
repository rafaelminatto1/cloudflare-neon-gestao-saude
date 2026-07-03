import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../App';
import { 
  Bell, 
  AlertTriangle, 
  Calendar, 
  Pill, 
  FileText, 
  User, 
  X, 
  ChevronRight, 
  CheckCircle,
  Activity
} from 'lucide-react';

export interface AlertNotification {
  id: string;
  type: 'doctor_missing' | 'exam_order_pending' | 'appointment_upcoming' | 'medication_active' | 'exam_abnormal';
  title: string;
  description: string;
  tabTarget: string;
  tabParams?: any;
  severity: 'high' | 'medium' | 'info';
  date?: string;
}

export function NotificationBell({ onNavigate }: { onNavigate: (tab: string, params?: any) => void }) {
  const { 
    exams = [], 
    appointments = [], 
    medications = [], 
    doctors = [], 
    examOrders = [] 
  } = useData();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute pending notifications dynamically
  const notifications = useMemo(() => {
    const list: AlertNotification[] = [];

    // 1. Doctors missing CRM or Specialty (Mandatory user requirement)
    doctors.forEach(doc => {
      const hasMissingCrm = !doc.crm || doc.crm.trim() === '';
      const hasMissingSpecialty = !doc.specialty || doc.specialty === 'Clínica Médica' || doc.specialty.trim() === '';
      
      if (hasMissingCrm || hasMissingSpecialty) {
        let details = [];
        if (hasMissingCrm) details.push('CRM ausente');
        if (hasMissingSpecialty) details.push('especialidade pendente');
        
        list.push({
          id: `doc-missing-${doc.id}`,
          type: 'doctor_missing',
          title: `Médico Incompleto: ${doc.name}`,
          description: `Este profissional possui pendências: ${details.join(' e ')}. Adicione para completar o prontuário.`,
          tabTarget: 'doctors',
          severity: 'high'
        });
      }
    });

    // 2. Unfulfilled Exam Orders
    examOrders.forEach(order => {
      if (!order.isFulfilled) {
        list.push({
          id: `order-pending-${order.id}`,
          type: 'exam_order_pending',
          title: `Pedido de Exame Pendente`,
          description: `O exame "${order.title}" prescrito em ${order.date} ainda não foi marcado como realizado.`,
          tabTarget: 'exam-orders',
          severity: 'medium',
          date: order.date
        });
      }
    });

    // 3. Upcoming/Scheduled Appointments
    const todayStr = new Date().toISOString().split('T')[0];
    appointments.forEach(appt => {
      if (appt.status === 'SCHEDULED') {
        const isUpcoming = appt.date >= todayStr;
        if (isUpcoming) {
          list.push({
            id: `appt-scheduled-${appt.id}`,
            type: 'appointment_upcoming',
            title: appt.type === 'EXAM' ? `Exame Agendado` : 
                   appt.type === 'THERAPY' ? `Terapia Agendada` : 
                   appt.type === 'PHYSIOTHERAPY' ? `Fisioterapia Agendada` : `Consulta Agendada`,
            description: `Marcado com ${appt.doctor || 'médico'} para o dia ${appt.date} às ${appt.time || 'horário não informado'}.`,
            tabTarget: 'agenda',
            severity: 'info',
            date: appt.date
          });
        }
      }
    });

    // 4. Continuous Medications in use
    medications.forEach(med => {
      if (med.isActive) {
        list.push({
          id: `med-active-${med.id}`,
          type: 'medication_active',
          title: `Tratamento Ativo: ${med.name}`,
          description: `Dosagem ativa: ${med.dosage} (${med.frequency}). Lembre-se de reavaliar com seu médico de tempos em tempos.`,
          tabTarget: 'medications',
          severity: 'info'
        });
      }
    });

    // 5. Abnormal ("Alterados" or "Sub-ópt.") recently added exam results
    exams.forEach(ex => {
      if (ex.interpretacao === 'Alterado' || ex.interpretacao === 'Sub-ópt.') {
        list.push({
          id: `exam-abnormal-${ex.id}`,
          type: 'exam_abnormal',
          title: `Resultado ${ex.interpretacao}: ${ex.nomeExame}`,
          description: `Medição de ${ex.resultado} ${ex.unidade} (Ref: ${ex.valorReferencia}) em ${ex.dataExame}.`,
          tabTarget: 'exams',
          tabParams: { selectedExamId: ex.id, sourceName: ex.arquivoOrigem, searchName: ex.nomeExame },
          severity: ex.interpretacao === 'Alterado' ? 'high' : 'medium',
          date: ex.dataExame
        });
      }
    });

    return list;
  }, [exams, appointments, medications, doctors, examOrders]);

  const highSeverityCount = notifications.filter(n => n.severity === 'high').length;

  const getIcon = (type: string, severity: string) => {
    switch (type) {
      case 'doctor_missing':
        return <User className="text-rose-500 bg-rose-50 p-2 rounded-xl shrink-0 border border-rose-100" size={36} />;
      case 'exam_order_pending':
        return <FileText className="text-amber-500 bg-amber-50 p-2 rounded-xl shrink-0 border border-amber-100" size={36} />;
      case 'appointment_upcoming':
        return <Calendar className="text-blue-500 bg-blue-50 p-2 rounded-xl shrink-0 border border-blue-100" size={36} />;
      case 'medication_active':
        return <Pill className="text-emerald-500 bg-emerald-50 p-2 rounded-xl shrink-0 border border-emerald-100" size={36} />;
      case 'exam_abnormal':
        return <AlertTriangle className={`${severity === 'high' ? 'text-red-500 bg-red-50 border-red-100' : 'text-amber-500 bg-amber-50 border-amber-100'} p-2 rounded-xl shrink-0 border`} size={36} />;
      default:
        return <Bell className="text-slate-400 bg-slate-50 p-2 rounded-xl shrink-0 border border-slate-100" size={36} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Target Bell Trigger */}
      <button
        id="btn-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-full border border-slate-200 shadow-sm transition-all duration-150 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
        title="Pendências e Alertas de Saúde"
      >
        <Bell size={20} className={notifications.length > 0 ? 'animate-bounce' : ''} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3.5 w-[330px] sm:w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                Central de Pendências
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                  {notifications.length} pendentes
                </span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">Sincronização instantânea e alertas médicos</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 px-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 font-bold transition-colors cursor-pointer text-xs"
            >
              Fechar
            </button>
          </div>

          {/* Content Scroll List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <CheckCircle className="text-teal-500 bg-teal-50 p-2 rounded-full mb-3 stroke-[1.5]" size={48} />
                <p className="text-sm font-bold text-slate-800">Tudo em dia!</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Não encontramos nenhuma pendência clínica ou médicos com informações faltantes.</p>
              </div>
            ) : (
              notifications.map((notify) => (
                <div 
                  key={notify.id} 
                  onClick={() => {
                    onNavigate(notify.tabTarget, notify.tabParams);
                    setIsOpen(false);
                  }}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3.5 relative group"
                >
                  {/* Left Icon Indicators */}
                  {getIcon(notify.type, notify.severity)}

                  {/* Body Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        notify.severity === 'high' ? 'text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded' : 
                        notify.severity === 'medium' ? 'text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded'
                      }`}>
                        {notify.severity === 'high' ? 'Crítico' : 
                         notify.severity === 'medium' ? 'Pendente' : 'Informativo'}
                      </span>
                      {notify.date && (
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">{notify.date}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-850 mt-1 truncate group-hover:text-teal-600 transition-colors">
                      {notify.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notify.description}
                    </p>
                  </div>

                  {/* Arrow Action Hover */}
                  <div className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity pl-1">
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Information */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            {highSeverityCount > 0 ? (
              <span className="text-[11px] font-bold text-red-600">
                ⚠️ Atenção: {highSeverityCount} pendências requerem correção.
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Escolha um item para navegar e preencher as informações.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
