import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MedicalRecord, UserPathology, ContinuousMedication } from '../data';

export async function generateConsolidatedClinicalReport(
  exams: MedicalRecord[],
  pathologies: UserPathology[],
  medications: ContinuousMedication[],
  patientName: string = "Paciente"
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Custom font size
  doc.setFontSize(18);
  doc.text('Relatório Clínico Consolidado', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
  
  let currentY = 40;

  // 1. Patologias e Condições
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Patologias e Condições Crônicas', 14, currentY);
  currentY += 8;

  const pathologiesData = pathologies.map(p => [
    p.condition,
    p.dateDetected === 'De Nascença' ? 'Congênita' : p.dateDetected,
    p.status,
    p.description || '-'
  ]);

  if (pathologiesData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Condição', 'Diagnóstico', 'Status', 'Observações']],
      body: pathologiesData,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] }, // teal-600
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhuma patologia registrada no histórico.', 14, currentY);
    currentY += 15;
  }

  // 2. Medicações de Uso Contínuo
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Medicações de Uso Contínuo', 14, currentY);
  currentY += 8;

  const medicationsData = medications.map(m => [
    m.name,
    m.dosage,
    m.frequency,
    m.isActive ? 'Ativo' : 'Suspenso',
    m.notes || '-'
  ]);

  if (medicationsData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Medicamento', 'Dosagem', 'Frequência', 'Status', 'Indicação/Notas']],
      body: medicationsData,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhuma medicação registrada no histórico.', 14, currentY);
    currentY += 15;
  }

  // 3. Exames e Marcadores (Recentes/Alterados priorizados)
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Histórico de Exames Consolidado', 14, currentY);
  currentY += 8;

  // Sort exams by date descending
  const sortedExams = [...exams].sort((a, b) => {
    const da = a.dataExame.split('/').reverse().join('-');
    const db = b.dataExame.split('/').reverse().join('-');
    return db.localeCompare(da);
  });

  const examsData = sortedExams.map(e => [
    e.dataExame,
    e.nomeExame,
    `${e.resultado} ${e.unidade === '—' ? '' : e.unidade}`,
    e.valorReferencia,
    e.interpretacao
  ]);

  if (examsData.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Data', 'Exame', 'Resultado', 'Ref.', 'Status']],
      body: examsData,
      theme: 'grid',
      headStyles: { fillColor: [13, 148, 136] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          const status = data.cell.raw;
          if (status === 'Alterado') data.cell.styles.textColor = [225, 29, 72]; // rose-600
          if (status === 'Normal') data.cell.styles.textColor = [13, 148, 136]; // teal-600
          if (status === 'Sub-ópt.') data.cell.styles.textColor = [217, 119, 6]; // amber-600
        }
      }
    });
    currentY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhum exame estruturado no histórico.', 14, currentY);
    currentY += 15;
  }

  // Footer for each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - HealthTracker - Documento gerado automaticamente`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save('Historico_Clinico_Consolidado.pdf');
}
