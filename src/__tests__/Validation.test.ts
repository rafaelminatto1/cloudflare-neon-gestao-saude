import { describe, it, expect, vi } from 'vitest';
import { isDuplicateExam, normalizeString } from '../App';
import { MedicalRecord, getAutoCategory } from '../data';

describe('Validation and Processing tests', () => {
  it('should normalize strings correctly for comparison', () => {
    expect(normalizeString('Hemoglobina Glicada ')).toBe('hemoglobinaglicada');
    expect(normalizeString('Ácido Úrico')).toBe('acidourico');
    expect(normalizeString('LDL-Colesterol')).toBe('ldlcolesterol');
    expect(normalizeString('  Açúcar no Sangue  ')).toBe('acucarnosangue');
  });

  it('should detect duplicate exams from existing array', () => {
    const existingExams: MedicalRecord[] = [
      {
        id: '1',
        dataExame: '14/04/2026',
        nomeExame: 'Hemoglobina',
        resultado: '15,2',
        unidade: 'g/dL',
        valorReferencia: '',
        medicoSolicitante: '',
        arquivoOrigem: '',
        categoria: 'LAB',
        interpretacao: 'Normal'
      },
      {
        id: '2',
        dataExame: '14/04/2026',
        nomeExame: 'Eritrócitos',
        resultado: '5,10',
        unidade: 'M/uL',
        valorReferencia: '',
        medicoSolicitante: '',
        arquivoOrigem: '',
        categoria: 'LAB',
        interpretacao: 'Normal'
      }
    ];

    // Perfect match
    expect(isDuplicateExam(existingExams, 'Hemoglobina', '14/04/2026', '15,2')).toBe(true);

    // Accent differences and spaces
    expect(isDuplicateExam(existingExams, 'Eritrocitos', '14/04/2026', ' 5,10 ')).toBe(true);

    // Different date
    expect(isDuplicateExam(existingExams, 'Hemoglobina', '15/04/2026', '15,2')).toBe(false);

    // Different result
    expect(isDuplicateExam(existingExams, 'Hemoglobina', '14/04/2026', '14,8')).toBe(false);

    // Completely new exam
    expect(isDuplicateExam(existingExams, 'Leucocitos', '14/04/2026', '6.290')).toBe(false);
  });

  describe('File validation mocks', () => {
    it('should reject a file if it is empty (size 0)', () => {
      const file = new File([''], 'empty.pdf', { type: 'application/pdf' });
      const isValidSize = file.size > 0;
      expect(isValidSize).toBe(false);
    });

    it('should allow valid pdf files with some size', () => {
      const file = new File(['valid content'], 'valid.pdf', { type: 'application/pdf' });
      const isValidSize = file.size > 0;
      expect(isValidSize).toBe(true);
    });
  });

  describe('getAutoCategory classification tests', () => {
    it('should classify blood exams with Hormônio or hormone acronyms as SANGUE', () => {
      expect(getAutoCategory('FSH (Hormônio Folículo-Estimulante)')).toBe('SANGUE');
      expect(getAutoCategory('LH (Hormônio Luteinizante)')).toBe('SANGUE');
      expect(getAutoCategory('TSH')).toBe('SANGUE');
      expect(getAutoCategory('Cortisol')).toBe('SANGUE');
      expect(getAutoCategory('Estrógeno')).toBe('SANGUE');
    });

    it('should classify image exams as IMAGEM and not match inside other words', () => {
      // should not match "rm" inside "hormônio"
      expect(getAutoCategory('Hormônio')).toBe('SANGUE');
      // should match "RM" as a whole word
      expect(getAutoCategory('RM de Coluna Cervical')).toBe('IMAGEM');
      expect(getAutoCategory('USG Abdome Total')).toBe('IMAGEM');
      expect(getAutoCategory('Raio-X de Tórax')).toBe('IMAGEM');
    });

    it('should classify reports and medical assessments as LAUDO or RELATÓRIO', () => {
      expect(getAutoCategory('Avaliação Neuropsicológica')).toBe('LAUDO');
      expect(getAutoCategory('Relatório Médico')).toBe('RELATÓRIO');
      expect(getAutoCategory('Atestado Médico')).toBe('RELATÓRIO');
    });

    it('should classify feces and urine exams correctly', () => {
      expect(getAutoCategory('Urina Tipo 1')).toBe('URINA');
      expect(getAutoCategory('EAS')).toBe('URINA');
      expect(getAutoCategory('Exame Parasitológico de Fezes')).toBe('FEZES');
    });

    it('should use scientific references as evidence for classification', () => {
      expect(getAutoCategory('Exame de rotina', undefined, [{ title: 'TSH and thyroid hormone reference' }])).toBe('SANGUE');
      expect(getAutoCategory('Exame de rotina', undefined, [{ title: 'MRI of the knee for musculoskeletal injury' }])).toBe('IMAGEM');
    });
  });
});
