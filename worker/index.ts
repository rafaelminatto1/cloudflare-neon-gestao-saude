import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';
import { and, eq, inArray } from 'drizzle-orm';
import { salvageExamsFromTruncatedJson } from './jsonSalvage.js';
import { normalizeResultForKey } from './resultKey.js';

type Bindings = {
  DATABASE_URL: string;
  NEON_AUTH_BASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: any;
  VECTOR_INDEX: VectorizeIndex;
  GESTAO_SAUDE_KV: KVNamespace;
  HYPERDRIVE: Hyperdrive;
  PDF_PROCESS_QUEUE: any;
  AI_SEARCH: any; // AutoRAG / AI Search namespace binding
};

const app = new Hono<{ Bindings: Bindings, Variables: { userId: string } }>();

// Simple UUID fallback if crypto.randomUUID doesn't work (it should on CF Workers)
const generateId = () => crypto.randomUUID();

const normalizeForKey = (value: unknown) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

// Postgres (Neon) rejeita o caractere \u0000 em colunas text/varchar.
// PDFs extraídos via unpdf/OCR podem conter bytes nulos (visto em
// "Terapias.pdf": "Rua Vilela, 665, 8\u0000 andar"). Este helper remove
// \u0000 e outros control chars ilegais de strings antes do INSERT,
// recursivamente em objetos/arrays. Preserva \t \n \r (formato legítimo).
const sanitizeText = <T>(value: T): T => {
  if (typeof value === 'string') {
    // Removes \u0000 (Postgres rejects it) and other illegal control chars
    // eslint-disable-next-line no-control-regex
    return value.replace(/[\u0000\uFFFD]/g, '').replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, '') as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeText(item)) as unknown as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeText(val);
    }
    return result as unknown as T;
  }
  return value;
};

// Extract CID-10 codes from text using regex pattern
// Matches patterns like: F84.0, M79.7, C50.9, I10, J45.90, K35.80, etc.
// CID-10 format: Letter + 2-3 digits + optional decimal + optional digits
const extractCid10Codes = (text: string): string[] => {
  // Regex for CID-10: Letter (A-Z) followed by 2-3 digits, optionally . and 1-2 digits
  // Common patterns: F84.0, M79.7, C50.9, I10, J45.90, K35.80, G43.909, etc.
  const cid10Regex = /\b([A-TV-Z][0-9]{2,3}(?:\.[0-9]{1,4})?)\b/gi;
  const matches = text.match(cid10Regex);
  if (!matches) return [];
  
  // Deduplicate and normalize to uppercase
  const uniqueCodes = new Set<string>();
  for (const match of matches) {
    // Normalize: ensure letter is uppercase, remove trailing dots if any
    const normalized = match.toUpperCase().replace(/\.+$/, '');
    // Validate basic CID-10 structure
    if (/^[A-TV-Z][0-9]{2,3}(?:\.[0-9]{1,4})?$/.test(normalized)) {
      uniqueCodes.add(normalized);
    }
  }
  return Array.from(uniqueCodes).sort();
};

// Analyze longitudinal trends for a series of exam results over time
// Returns trend alerts for biomarkers that show concerning patterns
const analyzeLongitudinalTrends = (exams: any[]): any[] => {
  // Group exams by nomeExame (normalized)
  const grouped = new Map<string, any[]>();
  
  for (const exam of exams) {
    if (!exam.nomeExame || !exam.dataExame || !exam.resultado) continue;
    
    // Parse date from DD/MM/YYYY
    const dateMatch = exam.dataExame.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!dateMatch) continue;
    const date = new Date(`${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`);
    if (isNaN(date.getTime())) continue;
    
    // Parse numeric value from resultado
    const numericResult = parseNumericResult(exam.resultado);
    if (numericResult === null) continue;
    
    const key = normalizeForKey(exam.nomeExame);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push({
      ...exam,
      parsedDate: date,
      numericValue: numericResult,
      unit: exam.unidade || '',
      referenceRange: exam.valorReferencia || ''
    });
  }
  
  const alerts: any[] = [];
  
  // Biomarkers that are clinically significant for longitudinal monitoring
  const significantBiomarkers = new Set([
    // Kidney
    'creatinina', 'creatinina serica', 'ureia', 'acido urico', 'egfr', 'taxa de filtração glomerular',
    'microalbuminuria', 'albumina creatinina',
    // Liver
    'alt', 'tgp', 'ast', 'tgo', 'gama gt', 'gama-glutamil transferase', 'fosfatase alcalina', 'bilirrubina total', 'bilirrubina direta', 'albumina',
    // Lipids
    'colesterol total', 'colesterol hdl', 'colesterol ldl', 'colesterol vldl', 'colesterol nao hdl', 'triglicerides', 'triglicerídeos',
    // Glucose/Metabolic
    'glicose', 'glicose de jejum', 'hemoglobina glicada', 'hba1c', 'insulina', 'homa-ir', 'homa-beta',
    // Thyroid
    'tsh', 't3 livre', 't4 livre', 'anti-tpo', 'anti-tireoglobulina',
    // Inflammatory
    'pcr', 'proteina c reativa', 'vhs', 'velocidade de hemossedimentacao',
    // Blood
    'hemoglobina', 'hematocrito', 'hemacias', 'leucocitos', 'plaquetas', 'ferritina', 'ferro', 'vitamina b12', 'acido folico',
    // Cardiac
    'troponina', 'ck-mb', 'bnp', 'nt-probnp',
    // Others
    'vitamina d', '25-hidroxi vitamina d', 'zinco', 'magnesio', 'calcio', 'fosforo', 'potassio', 'sodio'
  ]);
  
  for (const [examName, entries] of grouped.entries()) {
    // Only analyze if we have at least 3 data points and it's a significant biomarker
    if (entries.length < 3) continue;
    if (!significantBiomarkers.has(examName.toLowerCase())) continue;
    
    // Sort by date
    entries.sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    
    // Calculate linear regression slope (trend)
    const trend = calculateTrend(entries.map(e => e.numericValue));
    if (!trend) continue;
    
    const { slope, rSquared, direction } = trend;
    
    // Only flag if there's a meaningful trend (R² > 0.3 and slope is significant)
    if (rSquared < 0.3 || Math.abs(slope) < 0.01) continue;
    
    const latest = entries[entries.length - 1];
    const earliest = entries[0];
    const changePercent = earliest.numericValue !== 0 
      ? ((latest.numericValue - earliest.numericValue) / Math.abs(earliest.numericValue)) * 100 
      : 0;
    
    // Determine clinical significance based on biomarker and direction
    const clinicalContext = getClinicalContext(examName, direction);
    if (!clinicalContext) continue;
    
    alerts.push({
      biomarker: latest.nomeExame,
      category: clinicalContext.category,
      trend: direction, // 'increasing' | 'decreasing' | 'stable'
      slope,
      rSquared,
      changePercent: Math.round(changePercent * 10) / 10,
      dataPoints: entries.length,
      dateRange: {
        first: earliest.parsedDate.toLocaleDateString('pt-BR'),
        last: latest.parsedDate.toLocaleDateString('pt-BR')
      },
      latestValue: `${latest.numericValue} ${latest.unit}`,
      referenceRange: latest.referenceRange,
      interpretation: clinicalContext.interpretation,
      severity: clinicalContext.severity,
      recommendation: clinicalContext.recommendation
    });
  }
  
  // Sort by severity (critical > high > moderate > low) then by R²
  const severityOrder: Record<string, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || b.rSquared - a.rSquared);
  
  return alerts;
};

// Helper to parse numeric result from string
const parseNumericResult = (result: string): number | null => {
  if (!result) return null;
  // Handle formats like "12.5", "12,5", "< 10", "> 5", "12.5 mg/dL", "Negativo", etc.
  const cleaned = String(result).replace(/[<>]/g, '').trim();
  // Try to extract first number
  const match = cleaned.match(/(-?\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  const num = Number(match[1].replace(',', '.'));
  return Number.isFinite(num) ? num : null;
};

// Calculate linear regression trend for a series of values
const calculateTrend = (values: number[]): { slope: number; rSquared: number; direction: 'increasing' | 'decreasing' | 'stable' } | null => {
  const n = values.length;
  if (n < 3) return null;
  
  const x = values.map((_, i) => i);
  const y = values;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R²
  const yMean = sumY / n;
  const ssTotal = y.reduce((a, b) => a + Math.pow(b - yMean, 2), 0);
  const ssResidual = y.reduce((a, b, i) => a + Math.pow(b - (slope * x[i] + intercept), 2), 0);
  const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
  
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (slope > 0.01) direction = 'increasing';
  else if (slope < -0.01) direction = 'decreasing';
  
  return { slope, rSquared, direction };
};

// Clinical context for biomarker trends
const getClinicalContext = (examName: string, direction: string): any => {
  const name = examName.toLowerCase();
  
  // Kidney function - increasing creatinine/urea is bad, decreasing eGFR is bad
  if (/(creatinina|ureia|acido urico)/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Rins',
        interpretation: 'Função renal possivelmente em declínio. Creatinina/ureia em elevação progressiva.',
        severity: 'high',
        recommendation: 'Avaliar nefrologista. Revisar medicações nefrotóxicas, hidratação, controle de PA e diabetes.'
      };
    }
  }
  
  if (/egfr|taxa de filtração glomerular/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Rins',
        interpretation: 'Taxa de filtração glomerular em queda. Risco de doença renal crônica progressiva.',
        severity: 'high',
        recommendation: 'Investigar causa (diabetes, hipertensão, nefrotoxicidade). Encaminhar nefrologia se < 60.'
      };
    }
  }
  
  // Liver - increasing enzymes
  if (/(alt|tgp|ast|tgo|gama gt|fosfatase alcalina)/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Fígado',
        interpretation: 'Enzimas hepáticas em elevação progressiva. Pode indicar esteatose, hepatite, toxicidade medicamentosa.',
        severity: 'moderate',
        recommendation: 'Avaliar hepatologista. Excluir esteatose (ultrassom), revisar medicações, dosar vírus hepatotrópicos.'
      };
    }
  }
  
  // Lipids - increasing LDL/total cholesterol/triglycerides is bad
  if (/(colesterol total|colesterol ldl|triglicer)/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Metabolismo / Cardiovascular',
        interpretation: 'Perfil lipídico em piora progressiva. Risco cardiovascular aumentado.',
        severity: 'moderate',
        recommendation: 'Reforçar dieta mediterrânea, exercício, avaliar indicação de estatina (escores de risco).'
      };
    }
  }
  
  // HDL - decreasing is bad
  if (/colesterol hdl/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Metabolismo / Cardiovascular',
        interpretation: 'HDL (colesterol bom) em queda. Fator de risco cardiovascular.',
        severity: 'moderate',
        recommendation: 'Aumentar atividade aeróbica, cessar tabagismo, avaliar perfil metabólico completo.'
      };
    }
  }
  
  // Glucose/HbA1c - increasing is bad
  if (/(glicose|hemoglobina glicada|hba1c|insulina|homa)/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Metabolismo / Diabetes',
        interpretation: 'Controle glicêmico em deterioração. Risco de pré-diabetes/diabetes ou descompensação.',
        severity: 'high',
        recommendation: 'Avaliar endocrinologista. Revisar dieta, exercício, medicações. Dosar insulina/HOMA se ainda não feito.'
      };
    }
  }
  
  // Thyroid - TSH increasing may indicate hypothyroidism
  if (/tsh/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Tireoide',
        interpretation: 'TSH em elevação. Sugere hipotireoidismo subclínico ou em desenvolvimento.',
        severity: 'moderate',
        recommendation: 'Dosar T4 livre e anticorpos anti-TPO. Avaliar necessidade de reposição.'
      };
    }
    if (direction === 'decreasing') {
      return {
        category: 'Tireoide',
        interpretation: 'TSH em queda. Sugere hipertireoidismo ou superdosagem de levotiroxina.',
        severity: 'moderate',
        recommendation: 'Dosar T3/T4 livres. Ajustar dose de reposição se em uso.'
      };
    }
  }
  
  // Inflammatory markers - increasing CRP/VHS
  if (/(pcr|proteina c reativa|vhs|velocidade de hemossedimentacao)/.test(name)) {
    if (direction === 'increasing') {
      return {
        category: 'Inflamação / Autoimunidade',
        interpretation: 'Marcadores inflamatórios em elevação. Pode indicar atividade de doença autoimune, infecção crônica ou neoplasia.',
        severity: 'moderate',
        recommendation: 'Investigar causa (autoimunidade, infecção, neoplasia). Correlacionar com sintomas e outros exames.'
      };
    }
  }
  
  // Hemoglobin - decreasing suggests anemia
  if (/(hemoglobina|hematocrito|hemacias)/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Sangue / Anemia',
        interpretation: 'Hemoglobina/hematócrito em queda progressiva. Anemia em desenvolvimento.',
        severity: 'moderate',
        recommendation: 'Investigar causa (ferro, B12, folato, sangramento oculto, doença crônica). Hemograma seriado.'
      };
    }
  }
  
  // Ferritin - decreasing suggests iron deficiency
  if (/ferritina/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Sangue / Ferro',
        interpretation: 'Ferritina em queda. Depleção de estoques de ferro (pré-anemia ou anemia ferropênica).',
        severity: 'moderate',
        recommendation: 'Dosar ferro sérico, transferrina, saturação. Investigar sangramento oculto se homem/pós-menopausa.'
      };
    }
  }
  
  // Vitamin D - decreasing
  if (/vitamina d/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Nutrientes / Ósseo',
        interpretation: 'Vitamina D em queda. Risco de osteopenia/osteoporose, imunidade comprometida.',
        severity: 'low',
        recommendation: 'Suplementação guiada por dosagem. Exposição solar segura. Avaliar PTH e cálcio.'
      };
    }
  }
  
  // B12 - decreasing
  if (/vitamina b12|b12/.test(name)) {
    if (direction === 'decreasing') {
      return {
        category: 'Nutrientes / Neurológico',
        interpretation: 'B12 em queda. Risco de neuropatia, anemia megaloblástica, declínio cognitivo.',
        severity: 'moderate',
        recommendation: 'Suplementar B12 (metilcobalamina). Investigar causa (dieta, absorção, metformina, PPI).'
      };
    }
  }
  
  return null;
};

const parseBrazilianDateFromText = (text: string, fileName: string) => {
  const collectionMatch = text.match(/DATA COLETA\/RECEBIMENTO:\s*(\d{2})\/(\d{2})\/(\d{4})/i);
  if (collectionMatch) return `${collectionMatch[1]}/${collectionMatch[2]}/${collectionMatch[3]}`;

  const fileMatch = fileName.match(/(\d{2})[-.](\d{2})[-.](\d{4})/);
  if (fileMatch) return `${fileMatch[1]}/${fileMatch[2]}/${fileMatch[3]}`;

  return new Date().toLocaleDateString('pt-BR');
};

const parseRequesterFromText = (text: string) => {
  // Try pattern: Solicitante: ...
  let match = text.match(/(?:Solicitante|Médico Solicitante|Solicitado por):\s*([^\n\r]+)/i);
  if (match) {
    return match[1].trim();
  }

  // Try pattern: Dr.(a): 174993 - FELIPE ARAGAO DA SILVA (NotreLabs style)
  match = text.match(/Dr\.\(a\):\s*(\d+)\s*-\s*([^\n\r]+)/i) || text.match(/Dr\(a\)\.?\s*:\s*(\d+)\s*-\s*([^\n\r]+)/i);
  if (match) {
    const crm = match[1].trim();
    const name = match[2].trim();
    return `${name} - CRM ${crm}`;
  }

  // General Dr. prefix pattern
  match = text.match(/(?:Dr|Dra|Dr\(a\))\.?\s*:\s*([^\n\r]+)/i);
  if (match) {
    return match[1].trim();
  }

  return 'Dr. Desconhecido';
};

const categorizeLabExam = (name: string) => {
  const normalized = normalizeForKey(name);
  if (/microalbuminuria|creatinina urinaria|albumina creatinina|acido urico/.test(normalized)) return 'Rins';
  if (/bilirrubina|gama glutamil|fosfatase alcalina|albumina|globulina|proteinas/.test(normalized)) return 'Fígado';
  if (/calcio|fosforo|magnesio|ferro|ferritina|transferrina|zinco/.test(normalized)) return 'Nutrientes';
  if (/t3|t4|tireoide/.test(normalized)) return 'Tireoide';
  if (/testosterona|shbg|psa|fsh|luteinizante|prolactina|aldosterona|cortisol|insulina|dehidroepiandrosterona/.test(normalized)) return 'Hormônios';
  if (/fator reumatoide|endomisio|transglutaminase|auto|fan|nucleo|nucleolo|citoplasma|metafasica/.test(normalized)) return 'Autoimunidade';
  if (/proteina c reativa|pcr|creatinofosfoquinase|cpk/.test(normalized)) return 'Marcadores Celulares Integrados';
  return 'Sangue';
};

const inferInterpretation = (result: string, reference: string) => {
  const resultNumber = Number(String(result).replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'));
  if (!Number.isFinite(resultNumber) || !reference) return 'Não Informado';

  const refNumbers = Array.from(reference.matchAll(/\d+(?:[.,]\d+)?/g))
    .map(match => Number(match[0].replace('.', '').replace(',', '.')))
    .filter(Number.isFinite);

  if (refNumbers.length >= 2) {
    const [min, max] = [Math.min(refNumbers[0], refNumbers[1]), Math.max(refNumbers[0], refNumbers[1])];
    if (resultNumber < min || resultNumber > max) return 'Alterado';
    return 'Normal';
  }

  if (/inferior|menor|até|ate/i.test(reference) && refNumbers.length >= 1) {
    return resultNumber <= refNumbers[0] ? 'Normal' : 'Alterado';
  }

  return 'Não Informado';
};

const looksLikeLabHeader = (line: string) => /RESULTADO.*REFER|R E S U LTA D O/i.test(line);

const isLabFooterLine = (line: string) => /^Assinado|^Responsável|^Núcleo|^www\.|^Rafael |^Sexo:|^DATA COLETA|^Dentro do intervalo|^Legenda|^A interpretação|^Data da geração|^Sob a|^Scapulatempo|^Laudo|^prescritor|^Laboratório|^NAM|^Valide|^Code$|^valida|^Token|^Pág\./i.test(line);

const shouldSkipLabLine = (line: string) => !line
  || /^\(?(Material|Método)/i.test(line)
  || /^Nota|^Observa|^Referencia|^Referências|^Bibliografia|^Tabela de Referência|^Comentários|^Metodologia|^Coleta entre|^\*|^Caso|^indivíduos/i.test(line);

const extractStructuredLabExams = (pdfText: string, fileName: string, pdfStoragePath: string) => {
  const lines = pdfText.split(/\n/)
    .map(line => line.trim().replace(/\s+/g, ' '))
    .filter(Boolean);

  const dataExame = parseBrazilianDateFromText(pdfText, fileName);
  const medicoSolicitante = parseRequesterFromText(pdfText);
  const unitPattern = '(?:m?UI\\/mL|mU\\/L|U\\/L|ng\\/dL|mg\\/dL|g\\/dL|mg\\/L|g\\/L|nmol\\/L|Elia\\s*U\\/mL|[µμu]g\\/dL|%)';
  const resultValuePattern = '(?:Inferior|Superior|Maior|Menor|Negativo|Positivo|Reagente|Não Reagente|Nao Reagente|Vide Observação|[<>]?\\d+[\\d.,]*(?:\\/\\d+)?)(?:\\s+a\\s+\\d+[\\d.,]*)?';
  const resultPattern = new RegExp(`^(.*?)\\s+(${resultValuePattern})\\s*(${unitPattern})?\\s*(.*)$`, 'i');
  const leadingResultPattern = new RegExp(`^(${resultValuePattern})\\s*(${unitPattern})?\\s*(.*)$`, 'i');

  const hasMaterialSoon = (index: number) => {
    for (let cursor = index + 1; cursor <= Math.min(index + 6, lines.length - 1); cursor++) {
      if (/^\(?(Material|Método)/i.test(lines[cursor])) return true;
      if (looksLikeLabHeader(lines[cursor]) || isLabFooterLine(lines[cursor])) return false;
    }
    return false;
  };

  let inResultSection = false;
  let pendingNameParts: string[] = [];
  const exams: any[] = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (looksLikeLabHeader(line)) {
      inResultSection = true;
      pendingNameParts = [];
      continue;
    }

    if (!inResultSection) continue;

    if (isLabFooterLine(line)) {
      if (/^Assinado|^Responsável|^Núcleo/i.test(line)) {
        pendingNameParts = [];
        inResultSection = false;
      }
      continue;
    }

    if (shouldSkipLabLine(line)) continue;

    const leadingResultMatch = pendingNameParts.length > 0 ? line.match(leadingResultPattern) : null;
    const resultMatch = leadingResultMatch || line.match(resultPattern);
    const materialSoon = hasMaterialSoon(index);

    if (resultMatch && materialSoon) {
      const nameParts = leadingResultMatch ? pendingNameParts : [...pendingNameParts, resultMatch[1]];
      const name = nameParts
        .join(' ')
        .replace(/\bGlobul\s+ina\b/gi, 'Globulina')
        .replace(/\bTot\s+ais\b/gi, 'Totais')
        .replace(/\s+/g, ' ')
        .trim();

      if (
        name
        && !/^\d|^de |^até |^ate |^confira|^vide|^pré |^pre |^pós |^pos |^abaixo de|^acima de/i.test(name)
      ) {
        const resultado = (leadingResultMatch ? resultMatch[1] : resultMatch[2]).trim();
        const unidade = (leadingResultMatch ? (resultMatch[2] || '') : (resultMatch[3] || '')).replace(/\s+/g, '').trim();
        const valorReferencia = (leadingResultMatch ? resultMatch[3] : resultMatch[4] || '').trim();

        exams.push({
          dataExame,
          categoria: categorizeLabExam(name),
          nomeExame: name,
          resultado,
          unidade,
          valorReferencia,
          interpretacao: inferInterpretation(resultado, valorReferencia),
          medicoSolicitante,
          arquivoOrigem: fileName,
          especialidadeMedica: 'Clínica Médica',
          grupoSistemico: categorizeLabExam(name),
          tags: 'extração estruturada, laboratório',
          impactoAutoimune: categorizeLabExam(name) === 'Autoimunidade' ? 'Médio' : 'Baixo',
          pdfStoragePath
        });
      }

      pendingNameParts = [];
    } else if (
      !resultMatch
      && line.length < 70
      && !/^de \d|^CONFIRA|^VIDE|^Em pé|^Posição|^Abaixo de|^Acima de|^\d+\s+a\s+\d+ anos|^Sexo |^Pré|^Pre|^Pós|^Pos|^Adultos|^Coleta/i.test(line)
    ) {
      pendingNameParts.push(line);
    }
  }

  return exams;
};

async function fetchPubMedReferences(examName: string) {
  try {
    const query = encodeURIComponent(`"${examName}" AND ("clinical significance" OR "diagnosis")`);
    const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${query}&retmode=json&retmax=3`);
    if (!searchRes.ok) return null;
    const searchData: any = await searchRes.json();
    const pmids = searchData.esearchresult?.idlist || [];
    if (pmids.length === 0) return null;
    
    const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`);
    if (!summaryRes.ok) return null;
    const summaryData: any = await summaryRes.json();
    
    const refs = pmids.map((id: string) => {
      const doc = summaryData.result[id];
      return {
        title: doc?.title || 'Unknown Title',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        source: doc?.source || 'PubMed',
        pubdate: doc?.pubdate || ''
      };
    });
    
    return JSON.stringify(refs);
  } catch (e) {
    console.error("PubMed fetch error", e);
    return null;
  }
}

const dedupeExtractedExams = (exams: any[]) => {
  const seen = new Set<string>();
  return exams.filter(exam => {
    const key = [
      normalizeForKey(exam.nomeExame),
      normalizeForKey(exam.dataExame),
      normalizeResultForKey(exam.resultado),
      normalizeForKey(exam.unidade)
    ].join('|');

    if (!exam.nomeExame || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Infla um stream Flate/zlib (Workers têm DecompressionStream nativo).
async function inflateStream(bytes: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// Extrai as imagens JPEG embutidas de um PDF escaneado (XObjects /DCTDecode,
// possivelmente com /FlateDecode por cima). Retorna JPEGs prontos para OCR.
async function extractJpegImagesFromPdf(buf: ArrayBuffer): Promise<Uint8Array[]> {
  const data = new Uint8Array(buf);
  const marker = new TextDecoder('latin1').decode(data); // 1 byte/char: offsets batem
  const images: Uint8Array<ArrayBufferLike>[] = [];
  let idx = 0;
  while (images.length < 8) {
    const dct = marker.indexOf('DCTDecode', idx);
    if (dct < 0) break;
    idx = dct + 9;
    const st = marker.indexOf('stream', dct);
    if (st < 0) continue;
    let p = st + 6;
    if (data[p] === 0x0d && data[p + 1] === 0x0a) p += 2;
    else if (data[p] === 0x0a || data[p] === 0x0d) p += 1;
    const end = marker.indexOf('endstream', p);
    if (end < 0) continue;
    let blob: Uint8Array<ArrayBufferLike> = data.slice(p, end);
    while (blob.length && (blob[blob.length - 1] === 0x0a || blob[blob.length - 1] === 0x0d)) {
      blob = blob.slice(0, -1);
    }
    try {
      if (blob[0] === 0x78) blob = await inflateStream(blob); // Flate + DCT
      if (blob[0] === 0xff && blob[1] === 0xd8) images.push(blob); // é JPEG
    } catch { /* stream não decodificável: ignora */ }
  }
  return images;
}

// Detecta texto ilegível (PDF escaneado/manuscrito sem camada de texto): a
// extração devolve símbolos como ~ | \ « ª {}. Docs reais têm >99% de
// caracteres normais; lixo fica bem abaixo. Não usa proporção de palavras
// para evitar falso positivo em laudos laboratoriais cheios de números.
const looksGarbled = (text: string): boolean => {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length < 30) return true;
  const good = (t.match(/[A-Za-zÀ-ÿ0-9\s.,;:%/()\-]/g) || []).length;
  return good / t.length < 0.9;
};

// Título legível a partir do nome do arquivo (remove prefixo (NN), datas e sufixos).
const titleFromFileName = (fileName: string): string =>
  (fileName || 'Documento')
    .replace(/\.(pdf|jpe?g|png|bmp)$/i, '')
    .replace(/^\(\d+\)\s*/, '')
    .replace(/\d{2}[.\-]\d{2}[.\-]\d{4}/, '')
    .replace(/\s*\(laudo\+imagem\)/i, '')
    .replace(/\s+imagem$/i, '')
    .replace(/\s+/g, ' ').trim() || 'Documento';

// Auth Middleware
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/health') return next();
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development/mocking purposes when frontend is mocked
    c.set('userId', 'mock-user');
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const neonAuthUrl = c.env.NEON_AUTH_BASE_URL;
    if (!neonAuthUrl) {
      console.warn("NEON_AUTH_BASE_URL not set, falling back to mock user");
      c.set('userId', 'mock-user');
      return next();
    }
    const JWKS = createRemoteJWKSet(new URL(neonAuthUrl.replace(/\/$/, '') + '/.well-known/jwks.json'));
    const { payload } = await jwtVerify(token, JWKS);
    c.set('userId', (payload.sub || payload.id) as string);
    await next();
  } catch (err: any) {
    console.error("JWT Validation Error:", err);
    // Hard fallback to mock-user if Neon is not fully integrated yet, just for smooth RAG dev
    c.set('userId', 'mock-user');
    await next();
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok', environment: 'cloudflare-worker' }));

// 1. PDF Parser and RAG Ingestion
app.post('/api/parse-pdf', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    const userId = getScopedUserId(c, body['userId'] as string | undefined);
    
    if (!file || !userId) return c.json({ error: 'Arquivo ou userId não fornecido' }, 400);

    const fileId = generateId();
    const pdfStoragePath = `exams/${userId}/${fileId}.pdf`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    await c.env.R2_BUCKET.put(pdfStoragePath, arrayBuffer, {
      httpMetadata: { contentType: 'application/pdf' },
      customMetadata: { userId }
    });

    await c.env.PDF_PROCESS_QUEUE.send({
      userId,
      fileId,
      pdfStoragePath,
      fileName: file.name
    });

    await c.env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'processing' }));

    return c.json({ success: true, taskId: fileId, status: 'processing', pdfStoragePath });
  } catch (err: any) {
    console.error("Error parsing PDF:", err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/task-status/:taskId', async (c) => {
  const jobId = c.req.param('taskId');
  const jobData = await c.env.GESTAO_SAUDE_KV.get(`job:${jobId}`);
  if (!jobData) return c.json({ status: 'unknown' });
  return c.json(JSON.parse(jobData));
});

// GET File from R2
app.get('/api/file/*', async (c) => {
  const path = c.req.path.replace('/api/file/', '');
  const userId = c.get('userId');
  
  // Basic ACL
  if (!path.includes(userId) && userId !== 'mock-user') {
     return c.json({ error: 'Forbidden' }, 403);
  }

  const object = await c.env.R2_BUCKET.get(path);
  if (!object) return c.json({ error: 'File not found' }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
});

// RAG Chat Endpoint
app.post('/api/rag-chat', async (c) => {
  try {
    const { question } = await c.req.json();
    // const userId = c.get('userId');

    // 1. Vectorize the question
    const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [question] });
    const vector = embeddingResponse.data[0];

    // 2. Query Vectorize
    const matches = await c.env.VECTOR_INDEX.query(vector, { topK: 3 });
    
    // Fetch text from KV
    let retrievedTexts: string[] = [];
    for (const match of matches.matches) {
       const text = await c.env.GESTAO_SAUDE_KV.get(`doc:${match.id}`);
       if (text) retrievedTexts.push(`[Documento: ${match.id}]\n${text}`);
    }
    
    let contextStr = retrievedTexts.length > 0 
       ? "Contextos de exames do paciente encontrados:\n\n" + retrievedTexts.join('\n\n')
       : "Nenhum histórico médico específico foi encontrado.";

    // 3. Answer Question
    const messages = [
      { role: 'system', content: 'Você é um assistente médico auxiliando um paciente a interpretar seus exames.' },
      { role: 'user', content: `Contexto do paciente:\n${contextStr}\n\nPergunta: ${question}` }
    ];

    // Return SSE Stream
    return streamSSE(c, async (stream) => {
       let aiResponse;
       try {
         aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096, stream: true }, {
           gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
         }) as AsyncGenerator<any>;
       } catch (e) {
         console.warn("LLaMA 70b failed for chat, trying 3b fallback", e);
         aiResponse = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 4096, stream: true }, {
           gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
         }) as AsyncGenerator<any>;
       }
       
       for await (const chunk of aiResponse) {
          if (chunk.response) {
             await stream.writeSSE({ data: JSON.stringify({ text: chunk.response }) });
          }
       }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// AutoRAG Setup Endpoint - Creates the AutoRAG instance (config done via Dashboard)
app.post('/api/autorag/setup', async (c) => {
  try {
    const { instanceName = 'gestao-saude-autorag' } = await c.req.json().catch(() => ({}));
    
    // Create or get the AutoRAG instance
    await c.env.AI_SEARCH.create({ id: instanceName });
    
    return c.json({ 
      success: true, 
      instance: instanceName,
      message: 'Instance created. Configure data source (R2 bucket: gestao-saude-pdfs), chunking, embedding, and generation models via Cloudflare Dashboard > AI Search.'
    });
  } catch (err: any) {
    console.error('AutoRAG setup error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// AutoRAG Sync Endpoint - Trigger sync via REST API (not available in Workers binding yet)
app.post('/api/autorag/sync', async (c) => {
  try {
    const { instanceName = 'gestao-saude-autorag' } = await c.req.json().catch(() => ({}));
    // Note: Sync must be triggered via Cloudflare Dashboard or REST API
    // The Workers binding doesn't expose sync() method yet
    return c.json({ 
      success: true, 
      message: 'Sync must be triggered via Cloudflare Dashboard > AI Search > ' + instanceName + ' > Sync index',
      dashboardUrl: 'https://dash.cloudflare.com/?to=/:account/ai/autorag'
    });
  } catch (err: any) {
    console.error('AutoRAG sync error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// AutoRAG Chat Endpoint - Uses managed RAG pipeline
app.post('/api/autorag/chat', async (c) => {
  try {
    const { question, userId, instanceName = 'gestao-saude-autorag' } = await c.req.json();
    
    if (!question) {
      return c.json({ error: 'Pergunta é obrigatória' }, 400);
    }
    
    const instance = await c.env.AI_SEARCH.get(instanceName);
    
    // Build filters for multi-tenancy - only search user's documents
    // New AI Search API uses direct filter object with operators like $eq
    const filters = userId ? {
      folder: { $eq: `${userId}/` }
    } : undefined;
    
    const results = await instance.search({
      messages: [{ role: 'user', content: question }],
      ai_search_options: {
        retrieval: {
          max_num_results: 5,
          filters,
        },
        generation: {
          model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
          system_prompt: 'Você é um assistente médico auxiliando um paciente a interpretar seus exames. Responda em português do Brasil, de forma clara, empática e baseada em evidências. Cite as fontes quando relevante.',
        },
      },
    });
    
    // Stream the response
    return streamSSE(c, async (stream) => {
      for await (const chunk of results) {
        if (chunk.response) {
          await stream.writeSSE({ data: JSON.stringify({ text: chunk.response }) });
        }
      }
    });
  } catch (err: any) {
    console.error('AutoRAG chat error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Global Chat / Insights Endpoint
app.post('/api/chat-global', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const queryText = body.userMessage || body.message || '';
    const history = body.history || [];
    const contextData = body.contextData || {};
    
    // 1. Vectorize the question
    let contextStr = "Nenhum histórico médico específico foi encontrado.";
    if (queryText) {
      try {
        const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [queryText] });
        const vector = embeddingResponse.data[0];

        // 2. Query Vectorize
        const matches = await c.env.VECTOR_INDEX.query(vector, { topK: 3 });
        
        // Fetch text from KV
        let retrievedTexts: string[] = [];
        for (const match of matches.matches) {
           const text = await c.env.GESTAO_SAUDE_KV.get(`doc:${match.id}`);
           if (text) retrievedTexts.push(`[Documento: ${match.id}]\n${text}`);
        }
        if (retrievedTexts.length > 0) {
          contextStr = retrievedTexts.join('\n\n');
        }
      } catch (embErr) {
        console.warn("Embedding or Vectorize query failed inside chat-global", embErr);
      }
    }

    // Prepare additional context from pathologies and medications
    let clientContext = "";
    if (contextData.pathologies && Array.isArray(contextData.pathologies) && contextData.pathologies.length > 0) {
      clientContext += "\nPatologias / Condições diagnosticadas:\n" + contextData.pathologies.map((p: any) => `- ${p.condition} (Status: ${p.status}, Detecção: ${p.dateDetected})`).join('\n');
    }
    if (contextData.medications && Array.isArray(contextData.medications) && contextData.medications.length > 0) {
      clientContext += "\nMedicamentos Contínuos:\n" + contextData.medications.map((m: any) => `- ${m.name} (Dosagem: ${m.dosage}, Frequência: ${m.frequency})`).join('\n');
    }
    if (contextData.comparativeData && Array.isArray(contextData.comparativeData) && contextData.comparativeData.length > 0) {
      clientContext += "\nBiomarcadores Recentes:\n" + contextData.comparativeData.map((d: any) => `- ${d.testName}: Último valor ${d.lastValue} ${d.unit} (Ref: ${d.refRange || '—'})`).join('\n');
    }

    const messages = [
      { 
        role: 'system', 
        content: `Você é um assistente médico integrativo e especialista em interpretar exames de laboratório e exames de imagem em português do Brasil.
Você deve responder em formato JSON estrito contendo duas chaves:
1. "answer": Sua análise detalhada, amigável, técnica e baseada em evidências científicas. Use formatação Markdown rica (negritos, listas, tabelas se necessário).
2. "suggestedFollowUps": Um array de 2 a 3 perguntas de acompanhamento curtas e lógicas que o paciente pode clicar para fazer em seguida.

Regras importantes:
- Nunca prescreva tratamentos ou dê diagnósticos definitivos. Forneça insights integrativos, explique mecanismos fisiológicos e sugira perguntas para o médico do paciente.
- Se houver medicamentos ou patologias informadas no contexto, correlacione-os se fizer sentido clínico.
- Retorne APENAS o JSON válido. Não inclua blocos de código com a marcação \`\`\`json ou qualquer texto adicional fora do JSON.` 
      }
    ];

    // Add history messages
    for (const h of history) {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    }

    // Add user query with context
    messages.push({
      role: 'user',
      content: `Contexto do paciente:${clientContext}\n\nContexto dos exames extraídos:\n${contextStr}\n\nPergunta: ${queryText}`
    });

    let rawAiResponse = "";
    try {
      const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 }, {
        gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
      });
      rawAiResponse = aiResponse.response || "";
    } catch (e) {
      console.warn("LLaMA 70b failed for chat-global, trying 3b fallback", e);
      try {
        const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 4096 }, {
          gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
        });
        rawAiResponse = aiResponse.response || "";
      } catch (fallbackErr: any) {
        console.error("3b fallback failed too", fallbackErr);
        return c.json({ error: fallbackErr.message }, 500);
      }
    }

    // Parse JSON safely
    let parsed: any = {};
    try {
      const match = rawAiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = JSON.parse(rawAiResponse);
      }
    } catch (parseErr) {
      console.warn("Failed to parse JSON response from LLM, using fallback structure", parseErr);
      parsed = {
        answer: rawAiResponse,
        suggestedFollowUps: [
          "O que significa essa alteração?",
          "Quais exames complementares devo fazer?",
          "Como melhorar este biomarcador com estilo de vida?"
        ]
      };
    }

    return c.json({
      answer: parsed.answer || rawAiResponse,
      suggestedFollowUps: parsed.suggestedFollowUps || []
    });

  } catch (err: any) {
    console.error("Error in chat-global endpoint:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Generate Health Executive Summary Endpoint
app.post('/api/generate-health-executive-summary', async (c) => {
  try {
    const { processedExams = [], userPathologies = [], medications = [] } = await c.req.json().catch(() => ({}));

    // Compile patient details for the prompt
    let profileDetails = "";
    if (userPathologies.length > 0) {
      profileDetails += "\nPatologias diagnosticadas:\n" + userPathologies.map((p: any) => `- ${p.condition} (Status: ${p.status}, Detecção: ${p.dateDetected})`).join('\n');
    }
    if (medications.length > 0) {
      profileDetails += "\nMedicamentos em uso:\n" + medications.map((m: any) => `- ${m.name} (Dosagem: ${m.dosage}, Frequência: ${m.frequency})`).join('\n');
    }
    
    // Sort and limit exams to fit inside token context
    const sortedExams = [...processedExams].sort((a: any, b: any) => {
      const dateA = String(a.dataExame || '').split('/').reverse().join('');
      const dateB = String(b.dataExame || '').split('/').reverse().join('');
      return dateB.localeCompare(dateA); // newest first
    });
    
    // Get distinct list of latest exams
    const seenExams = new Set<string>();
    const latestDistinctExams = sortedExams.filter((e: any) => {
      const key = `${e.nomeExame.trim().toUpperCase()}`;
      if (seenExams.has(key)) return false;
      seenExams.add(key);
      return true;
    }).slice(0, 30); // top 30 distinct exams

    let examsDetails = "\nÚltimos resultados de exames de laboratório/imagem:\n" + 
      latestDistinctExams.map((e: any) => `- ${e.nomeExame}: ${e.resultado} ${e.unidade || ''} (Ref: ${e.valorReferencia || '—'}, Data: ${e.dataExame}, Interp: ${e.interpretacao})`).join('\n');

    const messages = [
      {
        role: 'system',
        content: `Você é um médico auditor e especialista em inteligência clínica integrativa.
Sua tarefa é analisar os dados do paciente (patologias, medicamentos e exames recentes) e gerar um "Resumo Executivo Semestral" em português do Brasil, estruturado de forma profissional para que o paciente exiba ao seu médico durante uma consulta.

Estruture sua resposta usando os seguintes tópicos em Markdown:
1. **Parecer Geral e Síntese de Saúde**: Breve resumo do quadro clínico.
2. **Correlações Integrativas**: Como as patologias relatadas, os medicamentos ativos e os biomarcadores alterados ou limítrofes se cruzam. Explique os mecanismos de sobreposição (ex: carga hepática, regulação imunológica, desequilíbrio eletrolítico).
3. **Recomendações Clínicas e Próximos Passos**: Monitoramento de exames e perguntas preventivas.

Diretrizes:
- Escreva de forma objetiva, científica, técnica e ao mesmo tempo clara para o paciente.
- Não prescreva medicamentos ou tratamentos específicos. Foque em insights e pontos de monitoramento fisiológico.
- Retorne apenas o texto formatado em markdown.`
      },
      {
        role: 'user',
        content: `Dados do paciente:\n${profileDetails}\n${examsDetails}`
      }
    ];

    let summaryText = "";
    try {
      const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 }, {
        gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
      });
      summaryText = aiResponse.response || "";
    } catch (e) {
      console.warn("LLaMA 70b failed for summary, trying 3b", e);
      try {
        const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 4096 }, {
          gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
        });
        summaryText = aiResponse.response || "";
      } catch (e2: any) {
        return c.json({ error: e2.message }, 500);
      }
    }

    return c.json({ result: summaryText });
  } catch (err: any) {
    console.error("Error in executive summary endpoint:", err);
    return c.json({ error: err.message }, 500);
  }
});

// Generate Consultation Questions Endpoint
app.post('/api/generate-consultation-questions', async (c) => {
  try {
    const { processedExams = [], userPathologies = [], medications = [] } = await c.req.json().catch(() => ({}));

    let profileDetails = "";
    if (userPathologies.length > 0) {
      profileDetails += "\nPatologias:\n" + userPathologies.map((p: any) => `- ${p.condition}`).join('\n');
    }
    if (medications.length > 0) {
      profileDetails += "\nMedicamentos:\n" + medications.map((m: any) => `- ${m.name}`).join('\n');
    }
    
    // Sort and get altered/borderline exams
    const sortedExams = [...processedExams].sort((a: any, b: any) => {
      const dateA = String(a.dataExame || '').split('/').reverse().join('');
      const dateB = String(b.dataExame || '').split('/').reverse().join('');
      return dateB.localeCompare(dateA);
    });

    const alteredExams = sortedExams.filter((e: any) => e.interpretacao === 'Alterado' || e.interpretacao === 'Sub-ópt.').slice(0, 10);
    const normalExams = sortedExams.filter((e: any) => e.interpretacao === 'Normal').slice(0, 10);

    let examsDetails = "";
    if (alteredExams.length > 0) {
      examsDetails += "\nExames Alterados/Sub-ótimos:\n" + alteredExams.map((e: any) => `- ${e.nomeExame}: ${e.resultado} ${e.unidade || ''} (Ref: ${e.valorReferencia})`).join('\n');
    }
    if (normalExams.length > 0) {
      examsDetails += "\nExames Normais Recentes:\n" + normalExams.map((e: any) => `- ${e.nomeExame}: ${e.resultado} ${e.unidade || ''}`).join('\n');
    }

    const messages = [
      {
        role: 'system',
        content: `Você é um assistente médico integrativo.
Sua tarefa é analisar os dados do paciente e formular de 3 a 5 perguntas de discussão médica altamente personalizadas e clinicamente relevantes para o paciente fazer ao seu médico na consulta.

Você deve responder APENAS com um JSON contendo uma chave "questions", que é uma lista de objetos no seguinte formato estrito:
[
  {
    "id": 1,
    "title": "Título curto da correlação (ex: Otimização de Micronutrientes ou Função Hepática)",
    "question": "Pergunta direta e polida que o paciente fará ao médico.",
    "context": "Contexto clínico ou explicação de apoio ao diálogo para o paciente saber o porquê de fazer essa pergunta."
  }
]

Regras de conteúdo:
- As perguntas devem ser baseadas nos exames alterados/sub-ótimos, patologias e medicamentos descritos.
- Seja estritamente técnico e focado na prática integrativa e preventiva de saúde.
- Retorne apenas o JSON puro, sem blocos de código com a marcação \`\`\`json ou texto adicional.`
      },
      {
        role: 'user',
        content: `Dados do paciente:\n${profileDetails}\n${examsDetails}`
      }
    ];

    let rawResponse = "";
    try {
      const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 2048 }, {
        gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
      });
      rawResponse = aiResponse.response || "";
    } catch (e) {
      console.warn("LLaMA 70b failed for questions, trying 3b", e);
      try {
        const aiResponse: any = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 2048 }, {
          gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
        });
        rawResponse = aiResponse.response || "";
      } catch (e2: any) {
        return c.json({ error: e2.message }, 500);
      }
    }

    let parsedQuestions: any[] = [];
    try {
      const objectMatch = rawResponse.match(/\{[\s\S]*\}/);
      const arrayMatch = rawResponse.match(/\[[\s\S]*\]/);
      
      const objIndex = objectMatch && typeof objectMatch.index !== 'undefined' ? objectMatch.index : -1;
      const arrIndex = arrayMatch && typeof arrayMatch.index !== 'undefined' ? arrayMatch.index : -1;
      
      if (objectMatch && (!arrayMatch || objIndex < arrIndex)) {
        const parsed = JSON.parse(objectMatch[0]);
        parsedQuestions = parsed.questions || parsed.exames || parsed;
      } else if (arrayMatch) {
        parsedQuestions = JSON.parse(arrayMatch[0]);
      } else {
        parsedQuestions = JSON.parse(rawResponse);
      }
      
      if (!Array.isArray(parsedQuestions)) {
        if (typeof parsedQuestions === 'object' && parsedQuestions !== null) {
          const obj = parsedQuestions as any;
          parsedQuestions = obj.questions || obj.exames || [obj];
        } else {
          parsedQuestions = [];
        }
      }
    } catch (parseErr) {
      console.warn("Failed to parse JSON for consultation questions:", parseErr, rawResponse);
      parsedQuestions = [
        {
          id: 1,
          title: 'Correlação dos Marcadores Alterados',
          question: 'Doutor, reparei que alguns marcadores estão fora das faixas ideais. Como podemos correlacionar esses desvios com meus sintomas atuais?',
          context: 'Importante para traçar um panorama geral de bem-estar.'
        }
      ];
    }

    return c.json({ questions: parsedQuestions });
  } catch (err: any) {
    console.error("Error generating consultation questions:", err);
    return c.json({ error: err.message }, 500);
  }
});

// --- CRUD Endpoints ---
const getDb = (c: any) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString);
  return drizzle(sql, { schema });
};


const invalidateCache = async (c: any, userId: string) => {
  try {
    await c.env.GESTAO_SAUDE_KV.delete(`cache:alldata:${userId}`);
  } catch(e) { console.error("Cache invalidation failed", e); }
};

const getScopedUserId = (c: any, requestedUserId?: string) => {
  const authUserId = c.get('userId');
  if (authUserId && authUserId !== 'mock-user') return authUserId;
  return requestedUserId || authUserId || 'mock-user';
};

const ensureUser = async (db: ReturnType<typeof getDb>, userId: string, email?: string, name?: string) => {
  if (!userId) return;
  const resolvedEmail = email || `${userId}@local.healthtracker`;
  await db.insert(schema.users).values(sanitizeText({
    id: userId,
    email: resolvedEmail,
    name: name || resolvedEmail,
    createdAt: new Date(),
  })).onConflictDoNothing();
};

app.post('/api/users/ensure', async (c) => {
  try {
    const { userId: requestedUserId, email, name } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    if (!userId) return c.json({ error: 'Invalid payload' }, 400);
    const db = getDb(c);
    await ensureUser(db, userId, email, name);
    return c.json({ success: true });
  } catch (err: any) {
    console.error('Error ensuring user:', err, err?.cause);
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/save-exams', async (c) => {
  try {
    const { exams, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    if (!userId || !exams || !Array.isArray(exams)) return c.json({ error: 'Invalid payload' }, 400);
    if (exams.length === 0) return c.json({ success: true, count: 0 });

    const db = getDb(c);
    await ensureUser(db, userId);
    const values = sanitizeText(exams.map((exam: any) => ({
      id: exam.id || generateId(),
      userId,
      dataExame: exam.dataExame,
      categoria: exam.categoria,
      nomeExame: exam.nomeExame,
      resultado: exam.resultado,
      unidade: exam.unidade,
      valorReferencia: exam.valorReferencia,
      interpretacao: exam.interpretacao,
      medicoSolicitante: exam.medicoSolicitante,
      arquivoOrigem: exam.arquivoOrigem,
      pdfStoragePath: exam.pdfStoragePath,
      observacoes: exam.observacoes,
      especialidadeMedica: exam.especialidadeMedica,
      grupoSistemico: exam.grupoSistemico,
      tags: exam.tags,
      impactoAutoimune: exam.impactoAutoimune,
      scientificReferences: exam.scientificReferences,
      isManualCategory: exam.isManualCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    await db.insert(schema.medicalRecords).values(values);
    await invalidateCache(c, userId);
    return c.json({ success: true, count: values.length });
  } catch (err: any) {
    console.error('Error saving exams:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/exams/:id', async (c) => {
  try {
    const db = getDb(c);
    const userId = getScopedUserId(c);
    await db.delete(schema.medicalRecords).where(and(eq(schema.medicalRecords.id, c.req.param('id')), eq(schema.medicalRecords.userId, userId)));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.put('/api/exams/:id', async (c) => {
  try {
    const updates = await c.req.json();
    const db = getDb(c);
    const userId = getScopedUserId(c, updates.userId);
    const { userId: _ignoredUserId, ...safeUpdates } = sanitizeText(updates) as any;
    await db.update(schema.medicalRecords).set({ ...safeUpdates, updatedAt: new Date() }).where(and(eq(schema.medicalRecords.id, c.req.param('id')), eq(schema.medicalRecords.userId, userId)));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/delete-exams-batch', async (c) => {
  try {
    const { examIds, userId: requestedUserId } = await c.req.json();
    if (!examIds || !examIds.length) return c.json({ success: true });
    const db = getDb(c);
    const userId = getScopedUserId(c, requestedUserId);
    await db.delete(schema.medicalRecords).where(and(inArray(schema.medicalRecords.id, examIds), eq(schema.medicalRecords.userId, userId)));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/rename-source', async (c) => {
  try {
    const { newSourceName, examIds, userId: requestedUserId } = await c.req.json();
    if (!examIds || !examIds.length) return c.json({ success: true });
    const db = getDb(c);
    const userId = getScopedUserId(c, requestedUserId);
    await db.update(schema.medicalRecords).set({ arquivoOrigem: newSourceName }).where(and(inArray(schema.medicalRecords.id, examIds), eq(schema.medicalRecords.userId, userId)));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/doctors', async (c) => {
  try {
    const { doctor, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    if (!userId || !doctor) return c.json({ error: 'Invalid payload' }, 400);
    const db = getDb(c);
    await ensureUser(db, userId);
    const values = sanitizeText({
      id: doctor.id || generateId(),
      userId,
      name: doctor.name,
      crm: doctor.crm,
      uf: doctor.uf,
      specialty: doctor.specialty,
      createdAt: new Date(),
    });
    await db.insert(schema.doctors).values(values);
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.delete('/api/doctors/:id', async (c) => {
  try {
    const db = getDb(c);
    const userId = getScopedUserId(c);
    await db.delete(schema.doctors).where(and(eq(schema.doctors.id, c.req.param('id')), eq(schema.doctors.userId, userId)));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/lookup-crm', async (c) => {
  try {
    const { crm, uf, doctorName } = await c.req.json();
    if (!crm && !doctorName) return c.json({ error: "Você deve fornecer o CRM ou o nome do médico para busca." }, 400);

    const prompt = `Faça uma busca ou análise lógica para validar/encontrar o CRM, Estado e Especialidade Médica do seguinte profissional de saúde no Brasil:
- CRM Informado: "${crm || 'Não especificado'}"
- UF Informada: "${uf || 'Não especificada'}"
- Nome Informado: "${doctorName || 'Não especificado'}"

Retorne APENAS um JSON estrito no formato: {"name": "Nome Oficial", "crm": "12345", "uf": "SP", "specialty": "Especialidade"}. 
Seja extremamente preciso. Caso não encontre, infira a provável especialidade. Sem markdown, apenas o JSON.`;

    const messages = [{ role: 'user', content: prompt }];
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 500 });
    const rawAiResponse = (aiResponse as { response: string }).response;

    let parsed = { name: doctorName, crm: crm, uf: uf, specialty: 'Clínico Geral' };
    let found = false;
    try {
      const match = rawAiResponse.match(/\{[\s\S]*\}/);
      const parsedObj = match ? JSON.parse(match[0]) : JSON.parse(rawAiResponse);
      if (parsedObj) {
        parsed = {
          name: parsedObj.name || doctorName,
          crm: parsedObj.crm || crm,
          uf: parsedObj.uf || uf || 'SP',
          specialty: parsedObj.specialty || 'Clínica Médica'
        };
        // If the AI found a specific CRM or name that matches/is updated, set found true
        if (parsedObj.crm && parsedObj.crm !== crm) found = true;
        if (parsedObj.specialty && parsedObj.specialty !== 'Clínico Geral' && parsedObj.specialty !== 'Clínica Médica') found = true;
      }
    } catch (e) {
      console.error("AI JSON parse error on CRM lookup:", rawAiResponse);
    }

    return c.json({ success: true, ...parsed, data: parsed, found });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/appointments', async (c) => {
  try {
    const { appointment, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    const db = getDb(c);
    await ensureUser(db, userId);
    await db.insert(schema.medicalAppointments).values(sanitizeText({ ...appointment, id: appointment.id || generateId(), userId, createdAt: new Date() }));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/appointments/:id', async (c) => {
  try { const db = getDb(c); const userId = getScopedUserId(c); await db.delete(schema.medicalAppointments).where(and(eq(schema.medicalAppointments.id, c.req.param('id')), eq(schema.medicalAppointments.userId, userId))); await invalidateCache(c, userId); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/pathologies', async (c) => {
  try {
    const { pathology, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    const db = getDb(c);
    await ensureUser(db, userId);
    await db.insert(schema.userPathologies).values(sanitizeText({ ...pathology, id: pathology.id || generateId(), userId, createdAt: new Date() }));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/pathologies/:id', async (c) => {
  try { const db = getDb(c); const userId = getScopedUserId(c); await db.delete(schema.userPathologies).where(and(eq(schema.userPathologies.id, c.req.param('id')), eq(schema.userPathologies.userId, userId))); await invalidateCache(c, userId); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/medications', async (c) => {
  try {
    const { medication, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    const db = getDb(c);
    await ensureUser(db, userId);
    await db.insert(schema.continuousMedications).values(sanitizeText({ ...medication, id: medication.id || generateId(), userId, createdAt: new Date() }));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/medications/:id', async (c) => {
  try { const db = getDb(c); const userId = getScopedUserId(c); await db.delete(schema.continuousMedications).where(and(eq(schema.continuousMedications.id, c.req.param('id')), eq(schema.continuousMedications.userId, userId))); await invalidateCache(c, userId); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/exam-orders', async (c) => {
  try {
    const { examOrder, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    const db = getDb(c);
    await ensureUser(db, userId);
    await db.insert(schema.examOrders).values(sanitizeText({ ...examOrder, id: examOrder.id || generateId(), userId, createdAt: new Date() }));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/exam-orders/:id', async (c) => {
  try { const db = getDb(c); const userId = getScopedUserId(c); await db.delete(schema.examOrders).where(and(eq(schema.examOrders.id, c.req.param('id')), eq(schema.examOrders.userId, userId))); await invalidateCache(c, userId); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/timeline-events', async (c) => {
  try {
    const { event, userId: requestedUserId } = await c.req.json();
    const userId = getScopedUserId(c, requestedUserId);
    const db = getDb(c);
    await ensureUser(db, userId);
    await db.insert(schema.customTimelineEvents).values(sanitizeText({ ...event, id: event.id || generateId(), userId, createdAt: new Date() }));
    await invalidateCache(c, userId);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/timeline-events/:id', async (c) => {
  try { const db = getDb(c); const userId = getScopedUserId(c); await db.delete(schema.customTimelineEvents).where(and(eq(schema.customTimelineEvents.id, c.req.param('id')), eq(schema.customTimelineEvents.userId, userId))); await invalidateCache(c, userId); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.get('/api/all-data/:userId', async (c) => {
  try {
    const requestedUserId = c.req.param('userId');
    const userId = getScopedUserId(c, requestedUserId);
    
    // Check KV Cache First
    const cachedData = await c.env.GESTAO_SAUDE_KV.get(`cache:alldata:${userId}`);
    if (cachedData) {
      return c.json(JSON.parse(cachedData));
    }

    const db = getDb(c);
    const [
      records, appointments, pathologies, medications, orders, events, docs
    ] = await Promise.all([
      db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.userId, userId)),
      db.select().from(schema.medicalAppointments).where(eq(schema.medicalAppointments.userId, userId)),
      db.select().from(schema.userPathologies).where(eq(schema.userPathologies.userId, userId)),
      db.select().from(schema.continuousMedications).where(eq(schema.continuousMedications.userId, userId)),
      db.select().from(schema.examOrders).where(eq(schema.examOrders.userId, userId)),
      db.select().from(schema.customTimelineEvents).where(eq(schema.customTimelineEvents.userId, userId)),
      db.select().from(schema.doctors).where(eq(schema.doctors.userId, userId)),
    ]);
    
    const responseData = {
      exams: records,
      appointments,
      pathologies,
      medications,
      examOrders: orders,
      timelineEvents: events,
      doctors: docs
    };

    // Save to KV Cache (expires in 1 hour if not invalidated manually)
    await c.env.GESTAO_SAUDE_KV.put(`cache:alldata:${userId}`, JSON.stringify(responseData), { expirationTtl: 3600 });

    return c.json(responseData);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

// Longitudinal Trends Analysis Endpoint
// Detects concerning trends in biomarkers over time
app.get('/api/longitudinal-trends/:userId', async (c) => {
  try {
    const requestedUserId = c.req.param('userId');
    const userId = getScopedUserId(c, requestedUserId);
    
    const db = getDb(c);
    const records = await db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.userId, userId));
    
    if (!records || records.length === 0) {
      return c.json({ alerts: [], message: 'Nenhum exame encontrado para análise de tendência.' });
    }
    
    // Filter exams with valid data for trend analysis
    const examsForTrend = records.filter(r => r.nomeExame && r.dataExame && r.resultado);
    
    if (examsForTrend.length < 3) {
      return c.json({ alerts: [], message: 'Mínimo de 3 exames necessários para análise de tendência.' });
    }
    
    const alerts = analyzeLongitudinalTrends(examsForTrend);
    
    return c.json({ 
      alerts,
      totalExamsAnalyzed: examsForTrend.length,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

const buildExtractionMessages = (fileName: string, chunkText: string, partLabel: string) => [
  { role: 'system', content: 'Você é um assistente médico especializado na leitura de laudos e exames. Retorne APENAS um JSON estruturado, sem blocos de markdown e sem texto adicional.' },
  { role: 'user', content: `Extraia as informações do exame abaixo e retorne APENAS um JSON válido contendo um array 'exames'. Não use outros arrays como 'avaliacoes'.
ATENÇÃO 1: Para perfis lipídicos, diferencie claramente 'Colesterol Total', 'Colesterol HDL', 'Colesterol LDL', 'Colesterol VLDL' e 'Colesterol Não-HDL' no campo 'nomeExame'. NUNCA chame as frações apenas de 'Colesterol Total'.
ATENÇÃO 2: Para Bilirrubinas, diferencie 'Bilirrubina Total', 'Bilirrubina Direta' e 'Bilirrubina Indireta'.
ATENÇÃO 3: Para Proteínas, diferencie 'Proteínas Totais', 'Albumina' e 'Globulina'.
ATENÇÃO 4: Para marcadores Autoimunes e de Tireoide, seja estrito e não os agrupe. Diferencie 'c-ANCA' de 'p-ANCA', 'Anti-TPO' de 'Anti-Tireoglobulina'.
ATENÇÃO 5: NÃO extraia as tabelas de referência como se fossem resultados de exames do paciente. Ignore linhas de legendas ou tabelas de referência, como 'Reagente: Superior a...', 'Não Reagente:', ou 'Inconclusivo:'. O resultado do paciente é apenas o valor principal que aparece antes da tabela.
ATENÇÃO 6: Ignore seções de 'Notas', 'Observações' ou explicações teóricas que costumam aparecer após os resultados (ex: 'Como indicador de risco cardiovascular...'). Não extraia isso como novos exames.
ATENÇÃO 7: Para exames descritivos longos (ex: anatomopatológico, biópsias, ecocardiograma, ultrassom, raio-x, tomografia, ressonância), extraia a 'Conclusão' ou 'Diagnóstico' como sendo o 'resultado'. Se não houver uma conclusão explícita, faça um breve resumo dos achados mais importantes no campo 'resultado'.
ATENÇÃO 8: Para o campo 'medicoSolicitante', se houver um CRM (registro de médico) ou UF visível próximo ao nome do médico solicitante no texto, extraia-o junto no formato: 'Nome do Médico - CRM: 123456/UF' ou 'Nome do Médico - CRM 123456'. Exemplo: se encontrar 'Dr.(a): 174993 - FELIPE ARAGAO DA SILVA', retorne 'FELIPE ARAGAO DA SILVA - CRM 174993'.
ATENÇÃO 9: Se encontrar o nome do Médico Responsável Técnico ou Médico Executante/Assinante do exame, anexe-o ao final do campo 'interpretacao' no formato: '\\n(Realizado/Assinado por: Nome do Médico - CRM 123456)'.
Formato OBRIGATÓRIO do array exames: [{ dataExame: string, categoria: string (USE APENAS: Autoimunidade, Coração, Eletrólitos, Exames de Imagem, Fígado, Gastroenterologia, Hormônios, Infectologia, Marcadores Celulares Integrados, Metabolismo, Nutrientes, Pâncreas, Rins, Sangue, Saúde Feminina, Saúde Masculina, Tireoide, Toxicologia), nomeExame: string, resultado: string, unidade: string, valorReferencia: string, interpretacao: string, medicoSolicitante: string, arquivoOrigem: string, especialidadeMedica: string, grupoSistemico: string, tags: string, impactoAutoimune: string }].\n\nArquivo Origem Nome: ${fileName}\nParte do Texto do PDF (${partLabel}):\n${chunkText}` }
];

// Chama o modelo de extração com fallback. Retorna o campo `response` bruto
// (pode ser string OU objeto JSON, dependendo do modelo). Lança se ambos falharem.
async function runExtractionAi(env: Bindings, messages: any[]): Promise<unknown> {
  let aiResponse: any;
  try {
    aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 8192 }, {
      gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
    });
  } catch (e) {
    console.warn("LLaMA 70b failed for chunk, trying 3b fallback", e);
    aiResponse = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 4096 }, {
      gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
    });
  }
  return aiResponse?.response;
}

// Interpreta a resposta da IA. ok=false indica JSON truncado/malformado
// (exams contém o que foi possível resgatar do texto truncado).
const parseExamsFromAiResponse = (raw: unknown): { exams: any[]; ok: boolean } => {
  let parsedJson: any = null;
  if (raw && typeof raw === 'object') {
    parsedJson = raw;
  } else {
    const responseText = String(raw ?? '');
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      parsedJson = JSON.parse(match ? match[0] : responseText);
    } catch (e) {
      console.error("Failed to parse JSON for chunk:", e);
      return { exams: salvageExamsFromTruncatedJson(responseText), ok: false };
    }
  }
  const arr = parsedJson?.exams ?? parsedJson?.exames;
  if (!Array.isArray(arr)) {
    // Resposta parseou mas não tem o array esperado: sinaliza possível desvio de schema do modelo
    console.warn("Resposta da IA sem array 'exames'/'exams'; chaves recebidas:", parsedJson && typeof parsedJson === 'object' ? Object.keys(parsedJson).join(', ') : typeof parsedJson);
    return { exams: [], ok: true };
  }
  return { exams: arr, ok: true };
};

export default {
  fetch: app.fetch,
  async queue(batch: any, env: Bindings) {
    for (let message of batch.messages) {
      const { userId, fileId, pdfStoragePath, fileName } = message.body;
      
      try {
        const object = await env.R2_BUCKET.get(pdfStoragePath);
        if (!object) throw new Error("File not found in R2");
        const arrayBuffer = await object.arrayBuffer();
        // Cópia dos bytes ANTES do extractText: o pdf.js (unpdf) detacha o
        // ArrayBuffer original, o que quebraria a extração de imagens do OCR.
        const ocrPdfBytes = arrayBuffer.slice(0);

        const pdfData = new Uint8Array(arrayBuffer);
        const { extractText } = await import('unpdf');
        const textData = await extractText(pdfData);
        let pdfTextStr = sanitizeText(Array.isArray(textData.text) ? textData.text.join('\n') : String(textData.text));

        // Documento digitalizado/manuscrito: a camada de texto veio ilegível.
        // Extrai as imagens JPEG embutidas e OCR-a via AI.toMarkdown (que lê
        // imagens com modelo de visão no próprio Worker). Se o OCR vier
        // legível, segue o pipeline normal de extração com esse texto.
        if (looksGarbled(pdfTextStr)) {
          try {
            const images = await extractJpegImagesFromPdf(ocrPdfBytes);
            if (images.length > 0) {
              const docs = images.map((img, i) => ({
                name: `pagina-${i + 1}.jpg`,
                blob: new Blob([img], { type: 'image/jpeg' }),
              }));
              const md = await env.AI.toMarkdown(docs);
              const ocrText = Array.isArray(md) ? md.map((m: any) => String(m?.data || '')).join('\n\n') : '';
              if (ocrText && !looksGarbled(ocrText)) {
                pdfTextStr = ocrText;
                console.log(`OCR recuperou ${ocrText.length} chars de ${images.length} imagem(ns) em ${fileName}`);
              }
            }
          } catch (ocrErr) {
            console.warn('OCR via toMarkdown falhou', ocrErr);
          }
        }

        // Ainda ilegível mesmo após OCR: não alimenta o extrator nem a IA
        // (gerariam códigos estranhos ou alucinações). Cataloga com um
        // registro-nota apontando para o PDF original.
        if (looksGarbled(pdfTextStr)) {
          const note = {
            dataExame: parseBrazilianDateFromText(pdfTextStr, fileName),
            categoria: 'Outros',
            nomeExame: titleFromFileName(fileName).substring(0, 150),
            resultado: 'Documento digitalizado (imagem/manuscrito) sem texto legível para extração automática. Consulte o PDF original anexado.',
            unidade: '',
            valorReferencia: '',
            interpretacao: 'Não Informado',
            medicoSolicitante: 'Dr. Desconhecido',
            arquivoOrigem: fileName,
            especialidadeMedica: 'Clínica Médica',
            grupoSistemico: 'Geral / Outros',
            tags: 'documento digitalizado, sem texto extraível',
            impactoAutoimune: 'Baixo',
            pdfStoragePath,
            cid10Codes: [],
          };
          await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'completed', result: [note], pdfStoragePath }));
          continue;
        }

        // Extract CID-10 codes from the full PDF text
        const cid10Codes = extractCid10Codes(pdfTextStr);
        if (cid10Codes.length > 0) {
          console.log(`Extraídos ${cid10Codes.length} código(s) CID-10 de ${fileName}: ${cid10Codes.join(', ')}`);
        }

        // Keep vector text small for embedding models
        const vectorText = pdfTextStr.substring(0, 5000);

        try {
          const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [vectorText] });
          const vector = embeddingResponse.data[0];
          
          await env.VECTOR_INDEX.upsert([
            {
              id: fileId,
              values: vector,
              metadata: { userId, path: pdfStoragePath, type: 'exam_pdf' }
            }
          ]);
          await env.GESTAO_SAUDE_KV.put(`doc:${fileId}`, vectorText);
        } catch (vectorErr) {
          console.error("Vectorize insertion error:", vectorErr);
        }

        const chunkSize = 10000;
        let structuredLabExams = extractStructuredLabExams(pdfTextStr, fileName, pdfStoragePath);
        // Add CID-10 codes to structured exams
        structuredLabExams = structuredLabExams.map((exam: any) => ({ ...exam, cid10Codes }));
        
        if (structuredLabExams.length >= 10) {
          await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'completed', result: dedupeExtractedExams(structuredLabExams), pdfStoragePath }));
          continue;
        }

        let allExams: any[] = [...structuredLabExams];
        let hasError = false;
        let lastError = "";

        for (let i = 0; i < pdfTextStr.length; i += chunkSize) {
          const chunkText = pdfTextStr.substring(i, i + chunkSize);
          const chunkLabel = String(Math.floor(i / chunkSize) + 1);

          let rawResponse: unknown;
          try {
            rawResponse = await runExtractionAi(env, buildExtractionMessages(fileName, chunkText, chunkLabel));
          } catch (e2: any) {
            console.error("3b fallback also failed for chunk", e2);
            hasError = true;
            lastError = e2.message;
            continue;
          }

          const parsed = parseExamsFromAiResponse(rawResponse);
          // Add CID-10 codes to AI-extracted exams
          const aiExams = parsed.exams.map((ex: any) => ({ ...ex, pdfStoragePath, cid10Codes }));
          allExams = allExams.concat(aiExams);

          if (!parsed.ok) {
            // Resposta truncada: o que era recuperável já foi salvo acima.
            // Reprocessa o chunk em duas metades (prompt diferente escapa do cache do gateway).
            console.warn(`Resposta truncada no chunk ${chunkLabel}: ${parsed.exams.length} exame(s) recuperado(s); reprocessando em metades`);
            let chunkTotal = parsed.exams.length;
            const half = Math.ceil(chunkText.length / 2);
            const parts = [chunkText.substring(0, half), chunkText.substring(half)];
            for (let p = 0; p < parts.length; p++) {
              try {
                const partRaw = await runExtractionAi(env, buildExtractionMessages(fileName, parts[p], `${chunkLabel}.${p + 1}`));
                const partParsed = parseExamsFromAiResponse(partRaw);
                allExams = allExams.concat(partParsed.exams.map((ex: any) => ({ ...ex, pdfStoragePath, cid10Codes })));
                chunkTotal += partParsed.exams.length;
              } catch (e: any) {
                console.error(`Falha ao reprocessar metade ${p + 1} do chunk ${chunkLabel}`, e);
              }
            }
            if (chunkTotal === 0) {
              hasError = true;
              lastError = 'Resposta da IA truncada e nenhum exame pôde ser recuperado';
            }
          }
        }
        
        allExams = dedupeExtractedExams(allExams);

        // Passo 1 RAG: Enriquecimento Automático com PubMed
        for (let exam of allExams) {
          if (exam.interpretacao === 'Alterado' || /reagente|positivo/i.test(exam.resultado)) {
            const refs = await fetchPubMedReferences(exam.nomeExame);
            if (refs) {
              exam.scientificReferences = refs;
            }
          }
        }

        if (allExams.length === 0 && hasError) {
           await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'error', error: lastError || 'Falha na extração de dados JSON' }));
        } else {
           await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'completed', result: allExams, pdfStoragePath }));
        }
        
      } catch (err: any) {
         await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'error', error: err.message }));
      }
    }
  }
};
