export interface MedicalAppointment {
  id: string;
  type: 'EXAM' | 'APPOINTMENT' | 'THERAPY' | 'PHYSIOTHERAPY';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  doctor?: string;
  specialty?: string;
  location?: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  examCategory?: 'SANGUE' | 'URINA' | 'IMAGEM' | 'FEZES' | 'OUTROS' | string;
  clinicAddress?: string;
}

export interface UserPathology {
  id: string;
  condition: string;
  dateDetected: string;
  status: string;
  description?: string;
  userId: string;
  createdAt?: any;
  isCongenital?: boolean;
}

export interface ContinuousMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  userId: string;
  createdAt?: any;
  dosageHistory?: {
    date: string;
    dosage: string;
    notes?: string;
    sideEffects?: string;
  }[];
  sideEffects?: string;
  _mergedIds?: string[];
}

export interface ExamOrder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  doctorName?: string;
  notes?: string;
  pdfStoragePath?: string; // We'll reuse this field name for simplicity and compatibility with PDF url helper functions
  fileType?: string; // pdf or image type
  fileName?: string;
  isFulfilled: boolean;
  userId: string;
  createdAt?: any;
}

export interface ScientificReference {
  id?: string;
  title: string;
  authors?: string;
  year?: string;
  doi?: string;
  pmid?: string;
  url?: string;
  summary?: string;
  evidenceLevel?: string;
  sourceType?: string;
}

export function parseScientificReferences(raw?: string | ScientificReference[] | null): ScientificReference[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter(ref => !!ref?.title).map(ref => ({ ...ref, title: ref.title.trim() }));
  }

  return raw
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `ref_${index + 1}`,
      title: line,
    }));
}

export function formatScientificReferences(references?: ScientificReference[] | null): string {
  return (references || [])
    .map((ref) => {
      const parts = [ref.title, ref.doi && `DOI: ${ref.doi}`, ref.pmid && `PMID: ${ref.pmid}`, ref.url && `URL: ${ref.url}`].filter(Boolean);
      return parts.join(' | ');
    })
    .join('\n');
}

export type ExamCategory = 'SANGUE' | 'URINA' | 'FEZES' | 'IMAGEM' | 'LAUDO' | 'RELATÓRIO' | 'OUTROS' | 'LAB' | 'AVALIAÇÃO';

export interface MedicalRecord {
  id: string;
  dataExame: string;
  categoria: ExamCategory;
  nomeExame: string;
  resultado: string;
  unidade: string;
  valorReferencia: string;
  interpretacao: 'Normal' | 'Alterado' | 'Sub-ópt.' | 'Não Informado';
  medicoSolicitante: string;
  arquivoOrigem: string;
  pdfStoragePath?: string;
  observacoes?: string;
  // Advanced Labeled Metadata
  especialidadeMedica?: string;
  grupoSistemico?: string;
  tags?: string;
  impactoAutoimune?: 'Alto' | 'Médio' | 'Baixo' | 'Nenhum';
  isManualCategory?: boolean;
  scientificReferences?: ScientificReference[];
}

export interface UserPathology {
  id: string;
  condition: string;
  dateDetected: string;
  status: string;
  description?: string;
  userId: string;
  createdAt?: any;
  isCongenital?: boolean;
  scientificReferences?: ScientificReference[];
}

export interface ContinuousMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  userId: string;
  createdAt?: any;
  dosageHistory?: {
    date: string;
    dosage: string;
    notes?: string;
    sideEffects?: string;
  }[];
  sideEffects?: string;
  _mergedIds?: string[];
  scientificReferences?: ScientificReference[];
}

export function getAutoCategory(nomeExame: string, originalCategory?: string, scientificReferences?: ScientificReference[]): ExamCategory {
  const name = (nomeExame || '').toLowerCase().trim();
  const orig = (originalCategory || '').toUpperCase().trim();

  // Helper to normalize strings for comparison (accent removal and standard punctuation cleaning)
  const normalize = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .toLowerCase()
      .replace(/[-_()/\\+,.:;]/g, ' ') // Replace punctuation/symbols with space
      .replace(/\s+/g, ' ')            // Collapse multiple spaces
      .trim();
  };

  const normName = normalize(name);
  const words = normName.split(' ').filter(Boolean);
  const referenceText = (scientificReferences || [])
    .map((ref) => `${ref.title || ''} ${ref.summary || ''} ${ref.url || ''} ${ref.doi || ''}`.toLowerCase())
    .join(' ');

  const matchesKeyword = (kw: string): boolean => {
    const normKw = normalize(kw);
    if (!normKw) return false;
    if (normKw.includes(' ')) {
      // For phrase matching, match with word boundary spaces on both sides
      return ` ${normName} `.includes(` ${normKw} `);
    }
    // For single word matching
    return words.includes(normKw);
  };

  const referenceCategoryHints: Array<{ category: ExamCategory; terms: string[] }> = [
    { category: 'SANGUE', terms: ['tsh','thyroid','hormone','hormonal','cortisol','estrogen','insulin','glucose','glycated','hemoglobin','ferritin','vitamin','b12','folate','cholesterol','lipid','homocysteine','prolactin','fsh','lh','pth','prl'] },
    { category: 'IMAGEM', terms: ['mri','resonancia','tomography','ct','ultrasound','ultrassom','radiography','raio x','ray','ecg','eeg','mamography','doppler','endomoscopy','colonoscopy','espirometry'] },
    { category: 'URINA', terms: ['urine','urina','eas','proteinuria','microalbuminuria'] },
    { category: 'FEZES', terms: ['fezes','stool','copro','parasitological'] },
    { category: 'LAUDO', terms: ['assessment','avaliacao','laudo','report','relatorio','neuropsychological'] },
    { category: 'RELATÓRIO', terms: ['relatorio','atestado','declaracao','receita','pedido','encaminhamento','historico clinico','alta','evolucao'] }
  ];
  if (referenceText) {
    const matchedReferenceCategory = referenceCategoryHints.find(({ terms }) => terms.some(term => referenceText.includes(term)));
    if (matchedReferenceCategory) {
      return matchedReferenceCategory.category;
    }
  }

  // 1. Image exams / Diagnostic tests mapping
  const imageKeywords = [
    'raio x', 'raiox', 'rx', 'radiografia', 'ressonancia', 'rm', 'rmn',
    'ultrassom', 'ultrassonografia', 'usg', 'tomografia', 'tc', 'ecografia', 'mamografia',
    'endoscopia', 'colonoscopia', 'manometria', 'cintilografia', 'ecocardiograma', 'eletrocardiograma', 'ecg',
    'eletroencefalograma', 'eeg', 'densitometria', 'broncoscopia', 'cistoscopia', 'laringoscopia', 'nasolaringoscopia',
    'nasofibrolaringoscopia', 'videolaringoscopia', 'audiometria', 'espirometria', 'doppler', 'duplex', 'polissonografia',
    'tomografia computadorizada'
  ];
  if (imageKeywords.some(matchesKeyword) || orig === 'IMAGEM') {
    return 'IMAGEM';
  }

  // 2. Clinical Reports / Assessments / Laudos (Laudo ou Avaliação)
  const reportKeywords = [
    'laudo', 'parecer', 'avaliacao', 'neuropsicologica',
    'tea', 'tdah', 'espectro', 'autismo', 'psicopedagogica', 'psicologica',
    'neuropsicopedagogico', 'diagnostico'
  ];
  if (reportKeywords.some(matchesKeyword) || orig === 'AVALIAÇÃO' || orig === 'LAUDO') {
    return 'LAUDO';
  }

  // 2.5 Relatórios e Documentos Médicos
  const relatorioKeywords = [
    'relatorio', 'atestado', 'declaracao', 'psiquiatrico',
    'anamnese', 'relatorio medico', 'receita', 'pedido', 'encaminhamento', 'historico clinico', 'alta', 'evolucao'
  ];
  if (relatorioKeywords.some(matchesKeyword) || orig === 'RELATÓRIO') {
    return 'RELATÓRIO';
  }

  // 3. Urine exams (Urina / Líquidos urinários)
  const urineKeywords = [
    'urina', 'eas', 'tipo 1', 'jacto', 'urinocultura', 'clearence de creatinina', 'microalbuminuria',
    'proteinuria', 'uropatologia', 'urina de 24h', 'urina de 24 horas', 'urina tipo i'
  ];
  if (urineKeywords.some(matchesKeyword)) {
    return 'URINA';
  }

  // 4. Feces exams (Fezes / Parasitológico)
  const fecesKeywords = [
    'fezes', 'parasitologico', 'mif', 'coprocultura', 'sangue oculto', 'calprotectina fecal',
    'elastase fecal', 'pesquisa de rotavirus', 'rotavirus', 'fecal', 'coprologico'
  ];
  if (fecesKeywords.some(matchesKeyword)) {
    return 'FEZES';
  }

  // 5. Blood exams (Sangue)
  const bloodKeywords = [
    'sangue', 'hemograma', 'glicose', 'colesterol', 'tsh', 't3', 't4', 'insulina', 'tgo', 'tgp', 'pcr', 'vhs', 'fan',
    'creatinina', 'ureia', 'ferritina', 'vitamina', 'sodio', 'potassio', 'calcio', 'magnesio',
    'fosforo', 'gama gt', 'gama-gt', 'acido urico', 'perfil lipidico', 'lipidograma',
    'plaquetas', 'leucocitos', 'eritrocitos', 'hemoglobina', 'hematocrito',
    'vcm', 'hcm', 'chcm', 'rdw', 'neutrofilos', 'linfocitos', 'monocitos',
    'eosinofilos', 'basofilos', 'bilirrubinas', 'bilirrubina', 'amilase', 'lipase',
    'ferro', 'transferrina', 'anti-tpo', 'antitpo', 'tireoglobulina', 'antiglobulina',
    
    // Additional hormone and blood markers to make it extremely smart and robust:
    'fsh', 'lh', 'acth', 'pth', 'prl', 'arp', 'igf1', 'igf 1', 'fr', 'ccp', 'vdrl',
    'hbsag', 'hcv', 'tp', 'tap', 'ttpa', 'ptt', 'tpo', 'tg', 'aslo', 'aso', 'psa',
    'cortisol', 'prolactina', 'progesterona', 'estrogenio', 'estrogeno', 'testosterona', 'dhea', 'shbg',
    'hormonio', 'sorologia', 'hemacias', 'hemacia', 'leucocito', 'plaqueta', 'eritrocito',
    'hba1c', 'glicada', 'glicosilada', 'lipidico', 'hdl', 'ldl', 'vldl', 'triglicerides',
    'triglicerideos', 'transaminase', 'transaminases', 'ast', 'alt', 'ggt', 'fosfatase',
    'albumina', 'globulina', 'proteinas totais', 'folato', 'vit', 'b12', 'homocisteina',
    'ferro serico', 'ferritina serica', 'sodio serico', 'potassio serico', 'calcio ionico',
    'calcio serico', 'magnesio serico', 'fosforo serico', 'zinco', 'cobre', 'selenio'
  ];
  if (bloodKeywords.some(matchesKeyword) || orig === 'LAB' || orig === 'SANGUE') {
    return 'SANGUE';
  }

  // Default fallbacks 
  if (orig === 'LAB') return 'SANGUE';
  if (orig === 'AVALIAÇÃO') return 'LAUDO';

  return 'OUTROS';
}

export const getClinicalMetadata = (medicoName: string, examName: string) => {
  let especialidadeMedica = 'Clínica Médica';
  let grupoSistemico = 'Geral / Outros';
  let tags = 'Exame';
  let impactoAutoimune: 'Alto' | 'Médio' | 'Baixo' | 'Nenhum' = 'Nenhum';

  const doc = (medicoName || '').toLowerCase();
  const ex = (examName || '').toLowerCase();

  // Specialty parsing
  if (doc.includes('sarah') || doc.includes('joao') || doc.includes('alves') || ex.includes('fan') || ex.includes('anti-dna') || ex.includes('complemento') || ex.includes('ss-a') || ex.includes('ss-b')) {
    especialidadeMedica = 'Reumatologia';
  } else if (doc.includes('diego') || doc.includes('astur') || ex.includes('joelho') || ex.includes('coluna') || ex.includes('cervical') || ex.includes('ombro') || ex.includes('tibia')) {
    especialidadeMedica = 'Ortopedia';
  } else if (doc.includes('christiane') || doc.includes('pellegrino') || ex.includes('rm ') || ex.includes('ressonância') || ex.includes('ultrassom')) {
    especialidadeMedica = 'Radiologia';
  } else if (doc.includes('paula') || doc.includes('morais') || ex.includes('manometria') || ex.includes('endoscopia') || ex.includes('colonoscopia')) {
    especialidadeMedica = 'Gastroenterologia';
  } else if (ex.includes('tsh') || ex.includes('t3') || ex.includes('t4') || ex.includes('insulina') || ex.includes('tiroxina') || ex.includes('cortisol') || ex.includes('paratormônio') || ex.includes('pth')) {
    especialidadeMedica = 'Endocrinologia';
  } else if (ex.includes('colesterol') || ex.includes('ldl') || ex.includes('triglicérides') || ex.includes('tgp') || ex.includes('tgo')) {
    especialidadeMedica = 'Clínica Médica';
  }

  // Systemic group parsing
  if (ex.includes('colesterol') || ex.includes('ldl') || ex.includes('hdl') || ex.includes('triglicérides')) {
    grupoSistemico = 'Metabólico / Lipídico';
    tags = 'Colesterol, Cardiovascular, Perfil Lipídico, Metabolismo';
    impactoAutoimune = 'Médio';
  } else if (ex.includes('tgp') || ex.includes('tgo') || ex.includes('gama gt') || ex.includes('bilirrubina') || ex.includes('fosfatase')) {
    grupoSistemico = 'Hepático';
    tags = 'Fígado, Hepático, Metabolismo, Enzima Hepática';
    impactoAutoimune = 'Médio';
  } else if (ex.includes('fan') || ex.includes('complemento') || ex.includes('pcr') || ex.includes('proteína c-reativa') || ex.includes('vhs') || ex.includes('cardiolipina') || ex.includes('anca')) {
    grupoSistemico = 'Imunológico & Inflamatório';
    tags = 'Inflamação, Autoimunidade, Anticorpos, Marcador Inflamatório';
    impactoAutoimune = 'Alto';
  } else if (ex.includes('tsh') || ex.includes('t3') || ex.includes('t4') || ex.includes('anti-tpo') || ex.includes('shbg') || ex.includes('pth') || ex.includes('dhea') || ex.includes('paratormônio')) {
    grupoSistemico = 'Endócrino & Tireoide';
    tags = 'Hormônio, Metabolismo, Tireoide, Glândula';
    impactoAutoimune = 'Alto';
  } else if (ex.includes('creatinina') || ex.includes('ureia')) {
    grupoSistemico = 'Renal';
    tags = 'Rins, Função Renal, Filtragem, Urina';
    impactoAutoimune = 'Médio';
  } else if (ex.includes('hemoglobina') || ex.includes('plaquetas') || ex.includes('leucócitos') || ex.includes('eritrócitos')) {
    grupoSistemico = 'Hematológico';
    tags = 'Hematologia, Imunidade, Glóbulos Brancos, Sangue';
    impactoAutoimune = 'Médio';
  } else if (ex.includes('cpk') || ex.includes('aldolase') || ex.includes('joelho') || ex.includes('coluna') || ex.includes('cervical') || ex.includes('lombossacra')) {
    grupoSistemico = 'Musculoesquelético';
    tags = 'Músculo, Articulação, Coluna, Lesão, Muscular';
    impactoAutoimune = 'Alto';
  } else {
    grupoSistemico = 'Geral / Outros';
    tags = 'Rotina, Diagnóstico';
    impactoAutoimune = 'Baixo';
  }

  // Ferritina/Vitaminas
  if (ex.includes('ferritina') || ex.includes('vitamina d') || ex.includes('vitamina b') || ex.includes('zinco') || ex.includes('magnésio') || ex.includes('ácido fólico')) {
    grupoSistemico = 'Nutricional & Neurológico';
    tags = 'Suplementação, Cérebro, Foco, Sistema Nervoso';
    impactoAutoimune = 'Alto';
  }

  return { especialidadeMedica, grupoSistemico, tags, impactoAutoimune };
};

const rawData: string[][] = [
  // dataExame, categoria, nomeExame, resultado, unidade, valorReferencia, interpretacao, medicoSolicitante, arquivoOrigem
  
  // Avaliações & Imagens (Alguns de histórico)
  ['06/05/2025', 'AVALIAÇÃO', 'Manometria Anorretal', 'Hipertonia de esfincter anal interno', '—', '—', 'Alterado', 'Paula Morais Ribeiro', 'Manometria Anorretal.pdf'],
  ['30/04/2025', 'IMAGEM', 'RM Coluna Lombossacra', 'Retrolistese L5-S1. Abaulamento L4-L5. Protrusão L5-S1 com fissura do ânulo.', '—', '—', 'Alterado', 'Dra. Christiane Pellegrino Rosa', 'RM_Lombossacra.pdf'],
  ['30/04/2025', 'IMAGEM', 'RM Coluna Cervical', 'Abaulamento C3-C4, C5-C6. Protrusão C4-C5 com fissura do ânulo.', '—', '—', 'Alterado', 'Dra. Christiane Pellegrino Rosa', 'RM_Cervical.pdf'],
  ['24/11/2022', 'IMAGEM', 'RM Joelho Esquerdo', 'Edema da gordura interposta ao trato iliotibial (atrito iliotibial).', '—', '—', 'Alterado', 'Dr. Diego da Costa Astur', 'RM_Joelho_Esq.pdf'],
  ['24/11/2022', 'IMAGEM', 'RM Joelho Direito', 'Degeneração do corno anterior do menisco lateral. Atrito iliotibial.', '—', '—', 'Alterado', 'Dr. Diego da Costa Astur', 'RM_Joelho_Dir.pdf'],
  ['24/11/2022', 'IMAGEM', 'RM Pernas', 'Sem evidência de periostite ou fratura', '—', '—', 'Normal', 'Dr. Diego da Costa Astur', 'RM_Pernas.pdf'],
  ['02/12/2022', 'IMAGEM', 'Colonoscopia', 'Preparo inadequado aparentemente sem lesões', '—', '—', 'Não Informado', 'Dra. Regina Santos da Silveira', 'Colonoscopia.pdf'],
  ['22/11/2022', 'IMAGEM', 'Endoscopia Digestiva Alta', 'Esofagite erosiva distal (Grau A de Los Angeles); Pangastrite erosiva plana leve. H. pylori negativo.', '—', '—', 'Alterado', 'Dra. Mirela Costa de Miranda', 'Endoscopia.pdf'],
  ['30/08/2022', 'IMAGEM', 'USG Aparelho Urinário', 'Cisto renal à direita (2,6 cm)', '—', '—', 'Alterado', 'Natalia Fernandes Coelho Francatto', 'USG_Rins.pdf'],
  ['03/10/2022', 'IMAGEM', 'TC Seios Paranasais', 'Septo nasal com desvio para direita, espícula óssea.', '—', '—', 'Alterado', 'Dr. João Vitor Ribeiro Henklain', 'TC_Face.pdf'],
  ['27/09/2022', 'AVALIAÇÃO', 'Eletroneuromiografia M. Inferiores', 'Exame normal', '—', '—', 'Normal', 'Dra. Natália Boaventura', 'ENMG.pdf'],
  ['Out/2024', 'AVALIAÇÃO', 'Avaliação Neuropsicológica', 'Diagnóstico de TEA (Nível 1) e TDAH', '—', '—', 'Alterado', 'Dr. Sérgio Barbosa de Barros', 'Laudo_Neuropsicologico.pdf'],
  ['22/11/2022', 'AVALIAÇÃO', 'Anatomopatológico - Antro Gástrico', 'Normal, H. Pylori Negativo', '—', '—', 'Normal', 'Mario Antonio Torezan', 'Lab_BP_AP_Gastrico.pdf'],

  // EXAMES LAB A PARTIR DOS 20 PDFS EXTRAIDOS:
  
  // 14/04/2026 - Dra. Gizelle Gouvea - Fleury
  ['14/04/2026', 'LAB', 'Hemoglobina', '15,2', 'g/dL', '13,3 a 16,5', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Reticulócitos', '66.800', '/mm3', '30.000 a 100.000', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'FAN - Anticorpos Anti-núcleo', 'Reagente 1/160 (Pontilhado Fino Denso)', 'título', 'Não Reagente', 'Alterado', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Anti-DNA Nativo', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Fator Reumatóide', '< 10', 'UI/mL', '< 14', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Anti-SSA / Anti-SSB', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Anti-Sm / Anti-RNP', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Anti-CCP', 'Não Reagente', 'U/mL', '< 5,0', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Complemento C3', '125', 'mg/dL', '81 a 157', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Complemento C4', '34', 'mg/dL', '13 a 39', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Proteína C-Reativa (PCR)', '1,97', 'mg/dL', '< 1,00', 'Alterado', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'VHS (Vel. Hemossedimentação)', '18', 'mm', '2 a 28', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Ferritina', '206', 'mcg/L', '26 a 446', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'CPK (Creatinoquinase)', '133', 'U/L', '38 a 174', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],
  ['14/04/2026', 'LAB', 'Aldolase', '5,2', 'U/L', '1,5 a 8,1', 'Normal', 'Dra. Gizelle Gouvea Rezende', 'Lab_Fleury_2026_Abril.pdf'],

  // 28/02/2026 - Dra. Bruna Nagano - Fleury
  ['28/02/2026', 'LAB', 'Ácido Fólico', '13,0', 'ng/mL', '> 3,9', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Gama-GT', '68', 'U/L', '12 a 73', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Vitamina D 1,25', '78,8', 'pg/mL', '19,9 a 79,3', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Testosterona Livre', '300,7', 'pmol/L', '131 a 640', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'SHBG', '55', 'nmol/L', '18 a 54', 'Alterado', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'TSH', '2,2', 'mUI/L', '0,45 a 4,5', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'T4 Livre', '1,4', 'ng/dL', '0,9 a 1,7', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Ureia', '34', 'mg/dL', '10 a 50', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'TGP', '41', 'U/L', '< 41', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'TGO', '22', 'U/L', '< 40', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Colesterol Total', '248', 'mg/dL', '< 190', 'Alterado', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'LDL-Colesterol', '171', 'mg/dL', '< 130', 'Alterado', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'HDL-Colesterol', '51', 'mg/dL', '> 40', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Triglicérides', '125', 'mg/dL', '< 150', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Glicose', '90', 'mg/dL', '70 a 99', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Ferro', '94', 'mcg/dL', '65 a 175', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Ferritina', '225', 'microg/L', '26 a 446', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'T3 Livre', '1,2', 'ng/dL', '0,9 a 1,8', 'Normal', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],
  ['28/02/2026', 'LAB', 'Desidrogenase Láctica (DHL)', '235', 'U/L', '135 a 225', 'Alterado', 'Dra. Bruna Eiko P Nagano', 'Lab_Fleury_2026_Fev.pdf'],


  // 25/09/2024 - Dr. Joao Filipe - Fleury
  ['25/09/2024', 'LAB', 'Fosfatase Alcalina', '64', 'U/L', '40 a 129', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Gama GT', '43', 'U/L', '12 a 73', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'FAN - Anticorpos Anti-núcleo', 'Reagente 1/160', 'título', 'Não Reagente', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'IgA', '413', 'mg/dL', '50 a 400', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Dismorfismo Eritrocitário', 'Discreto dismorfismo', '—', 'Sem dismorfismo', 'Sub-ópt.', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'TGP', '42', 'U/L', '< 41', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'CPK (Creatinoquinase)', '189', 'U/L', '38 a 174', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Hemoglobina Glicada', '5,7', '%', '< 5,7', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Anti-Musculo Liso', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Anti-LKM', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],
  ['25/09/2024', 'LAB', 'Beta-2 Glicoproteína 1 IgG/IgM', 'Não Reagente', 'U/mL', '< 20', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_Fleury_2024_Set.pdf'],

  // 28/08/2024 - Dra. Luiza - Delboni
  ['28/08/2024', 'LAB', 'Anti-Mitocôndria M2', '0,6', 'índice', '< 1,0', 'Normal', 'Dra. Luiza Mansur', 'Lab_Delboni_2024_Ago.pdf'],

  // 23/08/2024 - Dra. Luiza - Fleury
  ['23/08/2024', 'LAB', 'CPK (Creatinoquinase)', '212', 'U/L', '38 a 174', 'Alterado', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'Desidrogenase Láctica (DHL)', '166', 'U/L', '135 a 225', 'Normal', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'Anti-TPO', '49', 'U/mL', '< 34', 'Alterado', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'Plaquetas', '331.000', '/mm3', '151.000 a 304.000', 'Normal', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'Proteínas Totais', '7,3', 'g/dL', '6,5 a 8,1', 'Normal', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'TSH', '2,1', 'mUI/L', '0,45 a 4,5', 'Normal', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],
  ['23/08/2024', 'LAB', 'Anti-Jo1', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dra. Luiza Mansur', 'Lab_Fleury_2024_Ago.pdf'],

  // 23/03/2023 - Dr Joao Filipe - BP
  ['23/03/2023', 'LAB', 'TGP', '44', 'U/L', '< 41', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2023_Mar.pdf'],
  ['23/03/2023', 'LAB', 'Colesterol Total', '224', 'mg/dL', '< 190', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2023_Mar.pdf'],
  ['23/03/2023', 'LAB', 'LDL-Colesterol', '152', 'mg/dL', '< 130', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2023_Mar.pdf'],
  ['23/03/2023', 'LAB', 'Hemoglobina Glicada', '5,4', '%', '< 5,7', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2023_Mar.pdf'],
  ['23/03/2023', 'LAB', 'CK (Creatinoquinase)', '169', 'U/L', '38 a 174', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2023_Mar.pdf'],

  // 26/08/2022 - Dra. Mirela - Lavoisier
  ['26/08/2022', 'LAB', 'CPK (Creatinoquinase)', '208', 'U/L', '46 a 171', 'Alterado', 'Dra. Mirela Costa de Miranda', 'Lab_Lavoisier_2022_Ago.pdf'],
  ['26/08/2022', 'LAB', 'FAN - Anticorpos Anti-núcleo', 'Reagente 1/320', 'título', 'Não Reagente', 'Alterado', 'Dra. Mirela Costa de Miranda', 'Lab_Lavoisier_2022_Ago.pdf'],
  ['26/08/2022', 'LAB', 'Testosterona Total', '817,8', 'ng/dL', '240 a 816', 'Alterado', 'Dra. Mirela Costa de Miranda', 'Lab_Lavoisier_2022_Ago.pdf'],
  ['26/08/2022', 'LAB', 'SHBG', '70,9', 'nmol/L', '10 a 57', 'Alterado', 'Dra. Mirela Costa de Miranda', 'Lab_Lavoisier_2022_Ago.pdf'],

  // 12/09/2022 - Dra Juliana - Lavoisier
  ['12/09/2022', 'LAB', 'Tempo de Protrombina (TAP)', '13,60', 's', 'Até 14,0', 'Normal', 'Dra Juliana Guimarães', 'Lab_Lavoisier_2022_Set.pdf'],
  ['12/09/2022', 'LAB', 'Metanefrinas Totais Urina 24h', '207,74', 'µg/24h', '< 1000', 'Normal', 'Dra Juliana Guimarães', 'Lab_Lavoisier_2022_Set.pdf'],



  // 07/09/2022 - Mirela - Lavoisier
  ['07/09/2022', 'LAB', 'ACTH (Adrenocorticotrófico)', '< 5,0', 'pg/mL', 'Até 46', 'Normal', 'Dra. Mirela Costa', 'Lab_Lavoisier_2022_Set_ACTH.pdf'],
  ['07/09/2022', 'LAB', 'Renina Plasmática', '0,4', 'ng/mL/h', '0,4 a 3,8', 'Normal', 'Dra. Mirela Costa', 'Lab_Lavoisier_2022_Set_ACTH.pdf'],
  ['07/09/2022', 'LAB', 'PSA Total', '1,06', 'ng/mL', '< 4,00', 'Normal', 'Dra. Mirela Costa', 'Lab_Lavoisier_2022_Set_ACTH.pdf'],
  // 04/11/2022 - Dr. Joao Filipe - BP
  ['04/11/2022', 'LAB', 'Anticoagulante Lúpico', 'Positivo', '—', 'Negativo', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Desidrogenase Láctica (DHL)', '243', 'U/L', '135 a 225', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Magnésio', '2,1', 'mg/dL', '1,6 a 2,6', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Reticulócitos', '90.600', '/mm3', '30.000 a 100.000', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Fração Reticulócitos Imaturos', '7,8', '%', '2,1 a 14,9', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Hemoglobina Glicada', '5,5', '%', '< 5,7', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Cálcio Ionizado', '1,31', 'mmol/L', '1,11 a 1,40', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'pH venoso', '7,26', '—', '7,33 a 7,43', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'pO2 venoso', '49', 'mmHg', '30 a 50', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'pCO2 venoso', '63', 'mmHg', '38 a 50', 'Alterado', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'HCO3 venoso', '27', 'mmol/L', '23 a 27', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'BE venoso', '-1,1', '—', '-3,0 a +3,0', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Sat O2 venoso', '72', '%', '60 a 85', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Anti-RNP', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Anti-Cardiolipina IgM', 'Não Reagente', 'U/MPL', '< 10', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Anti-Cardiolipina IgG', 'Não Reagente', 'U/GPL', '< 10', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'PTH (Paratormônio)', '33', 'pg/mL', '10 a 65', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'ANCA', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Anti-HCV', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'LA/SS-B', 'Não Reagente', 'índice', '< 1,0', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'AgHBs', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'HIV 1/2', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'Sífilis (Floculação)', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  ['04/11/2022', 'LAB', 'C3 (Complemento)', '130', 'mg/dL', '81 a 157', 'Normal', 'Dr. Joao Filipe Costa Alves Pereira', 'Lab_BP_2022_Nov_1.pdf'],
  
  // 17/11/2022 - Dra. Sarah Abati - BP
  ['17/11/2022', 'LAB', 'Proteína C-Reativa (PCR)', '0,15', 'mg/dL', '< 1,0', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'TGP', '75', 'U/L', '< 41', 'Alterado', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Fosfatase Alcalina', '69', 'U/L', '40 a 129', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'CPK (Creatinoquinase)', '372', 'U/L', '38 a 174', 'Alterado', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Bilirrubina Direta', '0,22', 'mg/dL', '< 0,30', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Bilirrubina Indireta', '0,33', 'mg/dL', '< 0,80', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Bilirrubina Total', '0,55', 'mg/dL', '< 1,10', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Gama GT', '51', 'U/L', '12 a 73', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'TGO', '31', 'U/L', '< 40', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'VHS', '21', 'mm', '2 a 28', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Hemoglobina', '15,3', 'g/dL', '13,3 a 16,5', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Leucócitos', '8.210', '/mm3', '3.650 a 8.120', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Plaquetas', '296.000', '/mm3', '151.000 a 304.000', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'FAN - Nuclear', 'Não Reagente', '—', 'Não Reagente', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'FAN - Placa Cromossômica', 'Reagente 1/640', 'título', 'Não Reagente', 'Alterado', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Aldolase', '9,9', 'U/L', '1,5 a 8,1', 'Alterado', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Eritrócitos (Urina)', '28.000', '/mL', '< 10.000', 'Alterado', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Haptoglobina', '115', 'mg/dL', '32 a 197', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'C4 (Complemento)', '37', 'mg/dL', '13 a 39', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
  ['17/11/2022', 'LAB', 'Eletroforese Proteínas (Gama Globulina)', '1,09', 'g/dL', '0,74 a 1,75', 'Normal', 'Dra. Sarah Abati Curi Neaime', 'Lab_BP_2022_Nov_2.pdf'],
];

export const EXAM_DATA: MedicalRecord[] = rawData.map((d, index) => {
  const metadata = getClinicalMetadata(d[7], d[2]);
  return {
    id: String(index + 1),
    dataExame: d[0],
    categoria: d[1] as any,
    nomeExame: d[2],
    resultado: d[3],
    unidade: d[4],
    valorReferencia: d[5],
    interpretacao: d[6] as any,
    medicoSolicitante: d[7],
    arquivoOrigem: d[8],
    especialidadeMedica: metadata.especialidadeMedica,
    grupoSistemico: metadata.grupoSistemico,
    tags: metadata.tags,
    impactoAutoimune: metadata.impactoAutoimune,
  };
});


export const EXAM_GROUPS: Record<string, string[]> = {
  'Perfil Lipídico': ['Colesterol', 'LDL', 'HDL', 'Triglicérides'],
  'Função Hepática': ['TGO', 'TGP', 'Gama', 'Fosfatase', 'Bilirrubina'],
  'Função Renal': ['Ureia', 'Creatinina'],
  'Hormônios & Tireoide': ['TSH', 'T3', 'T4', 'Tiroxina', 'Anti-TPO', 'Testosterona', 'SHBG', 'DHEA', 'FSH', 'Estradiol', 'ACTH', 'Renina', 'PTH', 'PSA', 'Prolactina'],
  'Vitaminas & Minerais': ['Vitamina D', 'Vitamina B', 'Ácido Fólico', 'Cálcio', 'Magnésio', 'Ferro', 'Ferritina', 'Potássio', 'Sódio', 'Zinco'],
  'Autoimunidade & Inflamação': ['PCR', 'Proteína C-Reativa', 'VHS', 'Reumatóide', 'FAN', 'Anti-DNA', 'SSA', 'SSB', 'Sm', 'RNP', 'CCP', 'Complemento', 'C3', 'C4', 'ANCA', 'Lúpico', 'Cardiolipina', 'Liso', 'LKM', 'Mitocôndria', 'Glicoproteína', 'Jo-1', 'Gliadina', 'Endomísio', 'Transglutaminase'],
  'Hematologia': ['Hemoglobina', 'Plaquetas', 'Reticulócitos', 'Leucócitos', 'Eritrócitos', 'Hematócrito', 'VCM', 'HCM', 'CHCM', 'RDW', 'Neutrófilos', 'Eosinófilos', 'Basófilos', 'Linfócitos', 'Monócitos'],
  'Metabolismo Glicídico': ['Glicose', 'Glicemia', 'Insulina', 'HbA1c'],
  'Enzimas Musculares': ['CPK', 'CK', 'Aldolase', 'Desidrogenase Láctica', 'DHL'],
};

export const getExamGroup = (examName: string) => {
  if (!examName) return 'Outros';
  for (const [group, keywords] of Object.entries(EXAM_GROUPS)) {
    if (keywords.some(k => examName.toLowerCase().includes(k.toLowerCase()))) return group;
  }
  return 'Outros';
};

// ─── FAN / ANA – Classificação e Parsing ───────────────────────────────────

export type FanCompartimento =
  | 'Nuclear'
  | 'Nucleolar'
  | 'Placa Cromossômica'
  | 'Citoplasmático'
  | 'Aparelho Mitótico'
  | 'Geral';

export type FanRelevancia = 'Não Reagente' | 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto';

export interface FanParsed {
  isReagente: boolean;
  titulo: string | null;      // ex: "1/160", "1/320", "1/640"
  tituloNumerico: number;     // ex: 160, 320, 640 — 0 se não reagente
  padrao: string | null;      // ex: "Pontilhado Fino Denso", "Homogêneo"
  icapCode: string | null;    // ex: "AC-2*", "AC-1"
  compartimento: FanCompartimento;
  relevancia: FanRelevancia;
  descricaoRelevancia: string;
}

/** Mapeia variações de nome de exame para compartimento padrão */
export const FAN_COMPARTIMENTO_MAP: Record<string, FanCompartimento> = {
  // Nuclear
  'nuclear': 'Nuclear',
  'fan - nuclear': 'Nuclear',
  'fan nuclear': 'Nuclear',
  'antinuclear': 'Nuclear',
  'anticorpos anti-núcleo': 'Nuclear',
  'anticorpos anti nucleo': 'Nuclear',
  'anticorpos anti-nucleo': 'Nuclear',
  // Nucleolar
  'nucleolar': 'Nucleolar',
  'fan - nucleolar': 'Nucleolar',
  'fan nucleolar': 'Nucleolar',
  // Placa Cromossômica
  'placa cromoss': 'Placa Cromossômica',
  'placa cromossômica': 'Placa Cromossômica',
  'fan - placa': 'Placa Cromossômica',
  // Citoplasmático
  'citoplasm': 'Citoplasmático',
  'fan - citoplasm': 'Citoplasmático',
  'fan citoplasm': 'Citoplasmático',
  // Aparelho Mitótico
  'mitótico': 'Aparelho Mitótico',
  'mitotico': 'Aparelho Mitótico',
  'aparelho mitótico': 'Aparelho Mitótico',
  'fan - aparelho': 'Aparelho Mitótico',
};

/** Interpreta o compartimento do FAN a partir do nome do exame */
export function getFanCompartimento(nomeExame: string): FanCompartimento {
  const lower = (nomeExame || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, comp] of Object.entries(FAN_COMPARTIMENTO_MAP)) {
    const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(normKey)) return comp;
  }
  return 'Geral';
}

/** Extrai título numérico de uma string como "1/160", "1/320", "até 1/640" */
function extractTituloNumerico(text: string): number {
  const match = text.match(/1\s*\/\s*(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 0;
}

/** Extrai o título formatado "1/160" de um texto de resultado */
function extractTitulo(text: string): string | null {
  const match = text.match(/(1\s*\/\s*\d+)/);
  if (match) return match[1].replace(/\s/g, '');
  return null;
}

/** Extrai o padrão de fluorescência (ex: "Pontilhado Fino Denso") */
function extractPadrao(text: string): string | null {
  const padroes = [
    'Pontilhado Fino Denso',
    'Pontilhado Grosso',
    'Pontilhado Misto',
    'Nuclear Pontilhado Fino Denso',
    'Nuclear Pontilhado',
    'Homogêneo',
    'Homogeneo',
    'Nucleolar',
    'Centromérico',
    'Centrômero',
    'Citoplasmático Reticular',
    'Citoplasmático Pontilhado',
    'Citoplasmático',
    'Mitótico',
    'Periférico',
    'Misto',
  ];
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const p of padroes) {
    const normP = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(normP)) return p;
  }
  // Regex fallback: tenta capturar "padrão X" ou "padrão: X"
  const patternMatch = text.match(/padr[aã]o\s*(?:de\s*)?[:.]?\s*([A-ZÀ-Üa-zà-ü][^,\n(]{3,40})/i);
  if (patternMatch) return patternMatch[1].trim();
  return null;
}

/** Extrai código ICAP (ex: "AC-2*", "AC-1", "AC2*") */
function extractIcapCode(text: string): string | null {
  const match = text.match(/\(?(AC[-\s]?\d+\*?)\)?/i);
  if (match) return match[1].toUpperCase().replace(/\s/g, '');
  return null;
}

/** Determina a relevância clínica pelo título */
function getRelevanciaByTitulo(tituloNumerico: number): { relevancia: FanRelevancia; descricao: string } {
  if (tituloNumerico === 0) return { relevancia: 'Não Reagente', descricao: 'Negativo — sem anticorpos detectados' };
  if (tituloNumerico <= 80) return { relevancia: 'Baixo', descricao: 'Título baixo — possível inespecífico. Raro significado clínico isolado.' };
  if (tituloNumerico <= 160) return { relevancia: 'Moderado', descricao: 'Título moderado (1/160) — pode ocorrer em indivíduos assintomáticos. Investigar contexto clínico.' };
  if (tituloNumerico <= 320) return { relevancia: 'Alto', descricao: 'Título alto (≥ 1/320) — relevância clínica aumentada. Indicado painel de auto-anticorpos específicos.' };
  return { relevancia: 'Muito Alto', descricao: 'Título muito alto (≥ 1/640) — forte associação com doença autoimune sistêmica. Investigação reumatológica urgente.' };
}

/** Interpreta o padrão ICAP e retorna descrição clínica */
export function getFanPadraoDescricao(padrao: string | null, icapCode: string | null): string | null {
  const p = (padrao || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ic = (icapCode || '').toUpperCase();
  if (p.includes('pontilhado fino denso') || ic.startsWith('AC-2') || ic.startsWith('AC2')) {
    return 'Padrão AC-2* (LEDGF/75): Comum em indivíduos assintomáticos e em processos inflamatórios inespecíficos. Raramente associado a doenças reumatológicas.';
  }
  if (p.includes('homogeneo') || ic === 'AC-1') {
    return 'Padrão Homogêneo (AC-1): Associado a anti-dsDNA e anti-histona. Muito sugestivo de Lúpus Eritematoso Sistêmico (LES).';
  }
  if (p.includes('centromer') || ic === 'AC-3') {
    return 'Padrão Centromérico (AC-3): Associado a anti-centrômero (ACA). Característico de Esclerodermia Limitada (CREST).';
  }
  if (p.includes('nucleolar') || ic.startsWith('AC-8') || ic.startsWith('AC-9') || ic.startsWith('AC-10')) {
    return 'Padrão Nucleolar: Associado a anti-Scl70 e anti-RNA polimerase. Encontrado na Esclerodermia Difusa.';
  }
  if (p.includes('pontilhado grosso') || ic === 'AC-5') {
    return 'Padrão Pontilhado Grosso (AC-5): Associado a anti-U1 RNP. Encontrado em DMTC (Doença Mista do Tecido Conjuntivo).';
  }
  if (p.includes('pontilhado') && (ic === 'AC-4' || ic === 'AC-29')) {
    return 'Padrão Pontilhado Fino (AC-4): Associado a anti-SSA/Ro e anti-SSB/La. Encontrado na Síndrome de Sjögren e Lúpus.';
  }
  return null;
}

/**
 * Função principal: parseia um registro de FAN e retorna estrutura rica
 */
export function parseFanResult(nomeExame: string, resultado: string): FanParsed {
  const res = resultado || '';
  const lower = res.toLowerCase();
  const isReagente = lower.includes('reagente') && !lower.includes('não reagente') && !lower.includes('nao reagente');

  const titulo = isReagente ? extractTitulo(res) : null;
  const tituloNumerico = isReagente ? extractTituloNumerico(res) : 0;
  const padrao = extractPadrao(res);
  const icapCode = extractIcapCode(res);
  const compartimento = getFanCompartimento(nomeExame);
  const { relevancia, descricao } = getRelevanciaByTitulo(tituloNumerico);

  return {
    isReagente,
    titulo,
    tituloNumerico,
    padrao,
    icapCode,
    compartimento,
    relevancia,
    descricaoRelevancia: descricao,
  };
}

// ─── Fim: FAN / ANA ─────────────────────────────────────────────────────────

// ─── Perfil Lipídico ─────────────────────────────────────────────────────────

export type RiscoCardiovascular = 'Ótimo' | 'Limítrofe' | 'Alto' | 'Muito Alto' | 'Indeterminado';

export interface LipidParsed {
  nomeExame: string;
  resultado: string;
  valor: number | null;
  unidade: string;
  interpretacao: string;
  risco: RiscoCardiovascular;
  alvo: string;
}

function parseNumericResult(resultado: string): number | null {
  if (!resultado) return null;
  const cleaned = resultado.replace(',', '.').replace(/[<>≤≥]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/** Classifica cada marcador lipídico individualmente */
export function parseLipidMarker(nomeExame: string, resultado: string, unidade: string, interpretacao: string): LipidParsed {
  const nome = (nomeExame || '').toLowerCase();
  const valor = parseNumericResult(resultado);

  let risco: RiscoCardiovascular = 'Indeterminado';
  let alvo = '';

  if (nome.includes('colesterol total') || nome.includes('colesterol t')) {
    alvo = '< 190 mg/dL';
    if (valor === null) risco = 'Indeterminado';
    else if (valor < 190) risco = 'Ótimo';
    else if (valor < 240) risco = 'Limítrofe';
    else if (valor < 280) risco = 'Alto';
    else risco = 'Muito Alto';
  } else if (nome.includes('ldl')) {
    alvo = '< 130 mg/dL';
    if (valor === null) risco = 'Indeterminado';
    else if (valor < 100) risco = 'Ótimo';
    else if (valor < 130) risco = 'Limítrofe';
    else if (valor < 160) risco = 'Alto';
    else risco = 'Muito Alto';
  } else if (nome.includes('hdl')) {
    alvo = '> 40 mg/dL';
    if (valor === null) risco = 'Indeterminado';
    else if (valor >= 60) risco = 'Ótimo';
    else if (valor >= 40) risco = 'Limítrofe';
    else risco = 'Alto';
  } else if (nome.includes('trigl')) {
    alvo = '< 150 mg/dL';
    if (valor === null) risco = 'Indeterminado';
    else if (valor < 150) risco = 'Ótimo';
    else if (valor < 200) risco = 'Limítrofe';
    else if (valor < 500) risco = 'Alto';
    else risco = 'Muito Alto';
  } else if (nome.includes('vldl')) {
    alvo = '< 30 mg/dL';
    if (valor === null) risco = 'Indeterminado';
    else if (valor < 30) risco = 'Ótimo';
    else risco = 'Alto';
  }

  return { nomeExame, resultado, valor, unidade, interpretacao, risco, alvo };
}

/** Retorna risco cardiovascular geral do painel lipídico */
export function getLipidPanelRisk(markers: LipidParsed[]): { riscoGeral: RiscoCardiovascular; nota: string } {
  const ldl = markers.find(m => m.nomeExame.toLowerCase().includes('ldl'));
  const hdl = markers.find(m => m.nomeExame.toLowerCase().includes('hdl'));
  const tri = markers.find(m => m.nomeExame.toLowerCase().includes('trigl'));
  const ct = markers.find(m => m.nomeExame.toLowerCase().includes('colesterol total') || m.nomeExame.toLowerCase().includes('colesterol t'));

  const hasAlto = markers.some(m => m.risco === 'Muito Alto');
  const hasModerado = markers.some(m => m.risco === 'Alto');

  let riscoGeral: RiscoCardiovascular = 'Ótimo';
  let nota = 'Perfil lipídico dentro dos alvos recomendados.';

  if (hasAlto) {
    riscoGeral = 'Muito Alto';
    nota = 'Risco cardiovascular muito elevado. Avaliação médica prioritária.';
  } else if (hasModerado) {
    riscoGeral = 'Alto';
    nota = 'Risco cardiovascular elevado. Reavaliação dietética e tratamento indicados.';
  } else if (markers.some(m => m.risco === 'Limítrofe')) {
    riscoGeral = 'Limítrofe';
    nota = 'Valores limítrofes. Monitoramento e ajuste de estilo de vida recomendados.';
  }

  // Special combinations
  if (ldl && tri && ldl.valor !== null && tri.valor !== null && ldl.valor >= 130 && tri.valor >= 150) {
    nota += ' Combinação LDL elevado + Triglicérides elevado indica síndrome metabólica possível.';
  }
  if (hdl && hdl.valor !== null && hdl.valor < 40) {
    nota += ' HDL baixo é fator de risco cardiovascular independente.';
  }

  // Índice CT/HDL
  if (ct && hdl && ct.valor !== null && hdl.valor !== null && hdl.valor > 0) {
    const ratio = ct.valor / hdl.valor;
    if (ratio > 5) {
      nota += ` Relação CT/HDL: ${ratio.toFixed(1)} (> 5 = alto risco).`;
    }
  }

  return { riscoGeral, nota };
}

// ─── Tireoide ────────────────────────────────────────────────────────────────

export type FuncaoTireoide = 'Eutireoideo' | 'Hipotireoidismo' | 'Hipotireoidismo Subclínico' | 'Hipertireoidismo' | 'Hipertireoidismo Subclínico' | 'Indeterminado';

export interface TireoideParsed {
  tsh: number | null;
  t4livre: number | null;
  t3livre: number | null;
  antiTPO: number | null;
  antiTPOAlterado: boolean;
  funcao: FuncaoTireoide;
  notaClinica: string;
  autoimune: boolean;
}

export function parseTireoidePanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): TireoideParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const tshEx = find('tsh');
  const t4Ex = find('t4');
  const t3Ex = find('t3');
  const tpoEx = find('tpo') || find('anti-tpo');

  const tsh = tshEx ? parseNumericResult(tshEx.resultado) : null;
  const t4livre = t4Ex ? parseNumericResult(t4Ex.resultado) : null;
  const t3livre = t3Ex ? parseNumericResult(t3Ex.resultado) : null;
  const antiTPO = tpoEx ? parseNumericResult(tpoEx.resultado) : null;
  const antiTPOAlterado = tpoEx?.interpretacao === 'Alterado';
  const autoimune = antiTPOAlterado && antiTPO !== null && antiTPO > 34;

  let funcao: FuncaoTireoide = 'Indeterminado';
  let notaClinica = '';

  if (tsh !== null) {
    if (tsh < 0.1) {
      funcao = 'Hipertireoidismo';
      notaClinica = 'TSH suprimido (< 0,1) indica hipertireoidismo. Avaliar Graves, nódulo tóxico.';
    } else if (tsh < 0.45) {
      funcao = 'Hipertireoidismo Subclínico';
      notaClinica = 'TSH levemente suprimido. Monitorar progressão para hipertireoidismo.';
    } else if (tsh > 10) {
      funcao = 'Hipotireoidismo';
      notaClinica = 'TSH muito elevado (> 10) indica hipotireoidismo clínico. Reposição hormonal indicada.';
    } else if (tsh > 4.5) {
      funcao = 'Hipotireoidismo Subclínico';
      notaClinica = 'TSH elevado com T4 livre normal indica hipotireoidismo subclínico. Avaliar sintomas.';
    } else {
      funcao = 'Eutireoideo';
      notaClinica = 'Função tireoidiana dentro dos parâmetros normais.';
    }
  }

  if (autoimune) {
    notaClinica += ' Anti-TPO positivo indica Tireoidite de Hashimoto (autoimune). Seguimento periódico.';
  }

  return { tsh, t4livre, t3livre, antiTPO, antiTPOAlterado, funcao, notaClinica, autoimune };
}

// ─── Função Hepática ─────────────────────────────────────────────────────────

export type TipoLesaoHepatica = 'Normal' | 'Lesão Hepatocelular' | 'Colestase' | 'Mista' | 'Indeterminado';

export interface HepaticoParsed {
  tgo: number | null;
  tgp: number | null;
  ggt: number | null;
  fa: number | null;
  biliTotal: number | null;
  razaoTgoTgp: number | null;
  tipoLesao: TipoLesaoHepatica;
  notaClinica: string;
}

export function parseHepaticoPanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): HepaticoParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key));

  const tgoEx = find('tgo') || find('ast');
  const tgpEx = find('tgp') || find('alt');
  const ggtEx = find('gama') || find('ggt') || find('gamma');
  const faEx = find('fosfatase');
  const bilEx = find('bilirrubina total') || find('bilirrubina t');

  const tgo = tgoEx ? parseNumericResult(tgoEx.resultado) : null;
  const tgp = tgpEx ? parseNumericResult(tgpEx.resultado) : null;
  const ggt = ggtEx ? parseNumericResult(ggtEx.resultado) : null;
  const fa = faEx ? parseNumericResult(faEx.resultado) : null;
  const biliTotal = bilEx ? parseNumericResult(bilEx.resultado) : null;

  const razaoTgoTgp = tgo !== null && tgp !== null && tgp > 0
    ? parseFloat((tgo / tgp).toFixed(2))
    : null;

  let tipoLesao: TipoLesaoHepatica = 'Normal';
  let notaClinica = 'Enzimas hepáticas dentro dos limites normais.';

  const tgoAlterado = tgoEx?.interpretacao === 'Alterado';
  const tgpAlterado = tgpEx?.interpretacao === 'Alterado';
  const ggtAlterado = ggtEx?.interpretacao === 'Alterado';
  const faAlterado = faEx?.interpretacao === 'Alterado';

  if ((tgoAlterado || tgpAlterado) && (faAlterado || ggtAlterado)) {
    tipoLesao = 'Mista';
    notaClinica = 'Padrão misto: lesão hepatocelular + colestase. Investigar hepatite, cirrose ou obstrução biliar.';
  } else if (tgoAlterado || tgpAlterado) {
    tipoLesao = 'Lesão Hepatocelular';
    if (razaoTgoTgp !== null && razaoTgoTgp > 2) {
      notaClinica = `Padrão hepatocelular com razão TGO/TGP = ${razaoTgoTgp} (> 2 sugere etiologia alcoólica ou isquêmica).`;
    } else {
      notaClinica = 'Padrão hepatocelular: TGO/TGP elevados sugerem hepatite viral, medicamentosa ou autoimune.';
    }
  } else if (faAlterado || ggtAlterado) {
    tipoLesao = 'Colestase';
    notaClinica = 'Padrão colestático: GGT/FA elevados. Investigar obstrução biliar, medicamentos ou álcool (GGT isolado).';
  } else if (!tgoAlterado && !tgpAlterado && !ggtAlterado && !faAlterado) {
    tipoLesao = 'Normal';
  } else {
    tipoLesao = 'Indeterminado';
  }

  return { tgo, tgp, ggt, fa, biliTotal, razaoTgoTgp, tipoLesao, notaClinica };
}

// ─── Urinálise (EAS) ─────────────────────────────────────────────────────────

export interface UrinaliseParsed {
  temHematuria: boolean;
  temLeucocituria: boolean;
  temNitritoPositivo: boolean;
  temProteinuria: boolean;
  temGlucosuria: boolean;
  alertas: string[];
  interpretacao: string;
}

export function parseUrinalise(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): UrinaliseParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key));
  const isAlterado = (e: any) => e?.interpretacao === 'Alterado' || e?.interpretacao === 'Sub-ópt.';

  const hemEx = find('hemácia') || find('hemacias') || find('eritrócit') || find('eritrocit');
  const leucEx = find('leucócit') || find('leucocit') || find('piócit') || find('piocit');
  const nitrEx = find('nitrit');
  const protEx = find('proteína') || find('proteina');
  const glucEx = find('glicos') || find('glucose');

  const hemVal = hemEx ? parseNumericResult(hemEx.resultado) : null;
  const leucVal = leucEx ? parseNumericResult(leucEx.resultado) : null;

  const temHematuria = isAlterado(hemEx) || (hemVal !== null && hemVal > 10000);
  const temLeucocituria = isAlterado(leucEx) || (leucVal !== null && leucVal > 10000);
  const temNitritoPositivo = nitrEx ? /(positiv|present)/i.test(nitrEx.resultado) : false;
  const temProteinuria = isAlterado(protEx);
  const temGlucosuria = isAlterado(glucEx);

  const alertas: string[] = [];
  if (temHematuria) alertas.push('🔴 Hematúria detectada — avaliar origem glomerular ou urológica');
  if (temLeucocituria) alertas.push('🟡 Leucocitúria — sugestivo de infecção urinária ou inflamação');
  if (temNitritoPositivo) alertas.push('🦠 Nitrito positivo — forte indicativo de bacteriúria');
  if (temProteinuria) alertas.push('⚠️ Proteinúria — investigar função renal (nefropatia?)');
  if (temGlucosuria) alertas.push('🍬 Glicosúria — pesquisar hiperglicemia ou diabetes');

  let interpretacao = alertas.length === 0 ? 'Urinálise dentro dos parâmetros normais.' : '';
  if (temNitritoPositivo && temLeucocituria) {
    interpretacao = 'Quadro compatível com Infecção do Trato Urinário (ITU). Urinocultura indicada.';
  } else if (temHematuria && !temLeucocituria) {
    interpretacao = 'Hematúria isolada — investigar causas glomerulares, litíase ou neoplasia.';
  }

  return { temHematuria, temLeucocituria, temNitritoPositivo, temProteinuria, temGlucosuria, alertas, interpretacao };
}

// ─── Hemograma ───────────────────────────────────────────────────────────────

export type TipoAnemia = 'Sem anemia' | 'Microcítica Hipocrômica' | 'Normocítica Normocrômica' | 'Macrocítica' | 'Indeterminado';

export interface HemogramaParsed {
  hemoglobina: number | null;
  vcm: number | null;
  hcm: number | null;
  leucocitos: number | null;
  plaquetas: number | null;
  temAnemia: boolean;
  tipoAnemia: TipoAnemia;
  temLeucopenia: boolean;
  temLeucocitose: boolean;
  temTrombocitopenia: boolean;
  temTrombocitose: boolean;
  notaClinica: string;
}

export function parseHemogramaPanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): HemogramaParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const hbEx = find('hemoglobina');
  const vcmEx = find('vcm') || find('volume corpuscular médio');
  const hcmEx = find('hcm') || find('hemoglobina corpuscular');
  const leucEx = find('leucócito') || find('leucocito');
  const platEx = find('plaqueta');

  const hemoglobina = hbEx ? parseNumericResult(hbEx.resultado) : null;
  const vcm = vcmEx ? parseNumericResult(vcmEx.resultado) : null;
  const hcm = hcmEx ? parseNumericResult(hcmEx.resultado) : null;
  const leucocitos = leucEx ? parseNumericResult(leucEx.resultado?.replace('.', '').replace(',', '.')) : null;
  const platVal = platEx ? parseNumericResult(platEx.resultado?.replace('.', '').replace(',', '.')) : null;
  const plaquetas = platVal;

  // Anemia: Hb < 13 homens / < 12 mulheres (usar 13 como limiar conservador)
  const temAnemia = hemoglobina !== null && hemoglobina < 13;

  let tipoAnemia: TipoAnemia = 'Sem anemia';
  if (temAnemia) {
    if (vcm !== null && hcm !== null) {
      if (vcm < 80 && hcm < 27) tipoAnemia = 'Microcítica Hipocrômica';
      else if (vcm > 100) tipoAnemia = 'Macrocítica';
      else tipoAnemia = 'Normocítica Normocrômica';
    } else {
      tipoAnemia = 'Indeterminado';
    }
  }

  const temLeucopenia = leucocitos !== null && leucocitos < 3650;
  const temLeucocitose = leucocitos !== null && leucocitos > 8120;
  const temTrombocitopenia = plaquetas !== null && plaquetas < 151000;
  const temTrombocitose = plaquetas !== null && plaquetas > 400000;

  const notas: string[] = [];
  if (temAnemia) {
    notas.push(`Anemia detectada (Hb ${hemoglobina} g/dL): ${tipoAnemia}.`);
    if (tipoAnemia === 'Microcítica Hipocrômica') notas.push('Sugere deficiência de ferro ou talassemia.');
    if (tipoAnemia === 'Macrocítica') notas.push('Sugere deficiência de B12/folato ou hipotireoidismo.');
    if (tipoAnemia === 'Normocítica Normocrômica') notas.push('Investigar doença crônica ou hemólise.');
  }
  if (temLeucocitose) notas.push(`Leucocitose (${leucocitos?.toLocaleString('pt-BR')} /mm³) — investigar infecção, inflamação ou corticoide.`);
  if (temLeucopenia) notas.push(`Leucopenia (${leucocitos?.toLocaleString('pt-BR')} /mm³) — atenção para imunossupressão.`);
  if (temTrombocitopenia) notas.push(`Plaquetopenia (${plaquetas?.toLocaleString('pt-BR')} /mm³) — risco hemorrágico.`);
  if (temTrombocitose) notas.push(`Trombocitose (${plaquetas?.toLocaleString('pt-BR')} /mm³) — investigar reacional ou mieloproliferativo.`);

  const notaClinica = notas.length > 0 ? notas.join(' ') : 'Hemograma dentro dos limites normais.';

  return {
    hemoglobina, vcm, hcm, leucocitos, plaquetas,
    temAnemia, tipoAnemia, temLeucopenia, temLeucocitose,
    temTrombocitopenia, temTrombocitose, notaClinica,
  };
}

// ─── Função Renal ─────────────────────────────────────────────────────────────

export interface RenalParsed {
  ureia: number | null;
  creatinina: number | null;
  tfge: number | null;
  temIgAAlterado: boolean;
  temDismorfismo: boolean;
  razaoUreiaCreatinina: number | null;
  estagioFiltracao: string;
  notaClinica: string;
}

export function parseRenalPanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): RenalParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const urEx = find('ureia') || find('uréia');
  const crEx = find('creatinina');
  const tfgEx = find('tfg') || find('filtração glomerular') || find('filtracao glomerular') || find('clearance de creatinina');
  const igaEx = find('iga') || find('imunoglobulina a');
  const disEx = find('dismorfismo');

  const ureia = urEx ? parseNumericResult(urEx.resultado) : null;
  const creatinina = crEx ? parseNumericResult(crEx.resultado) : null;
  const tfge = tfgEx ? parseNumericResult(tfgEx.resultado) : null;
  const temIgAAlterado = igaEx ? (igaEx.interpretacao === 'Alterado' || parseNumericResult(igaEx.resultado) !== null && (parseNumericResult(igaEx.resultado) || 0) > 400) : false;
  const temDismorfismo = disEx ? (!disEx.resultado.toLowerCase().includes('sem') && !disEx.resultado.toLowerCase().includes('ausente') && disEx.resultado !== '—') : false;

  let razaoUreiaCreatinina: number | null = null;
  if (ureia !== null && creatinina !== null && creatinina > 0) {
    razaoUreiaCreatinina = Math.round((ureia / creatinina) * 10) / 10;
  }

  let estagioFiltracao = 'Não Informado';
  if (tfge !== null) {
    if (tfge >= 90) estagioFiltracao = 'Filtração Normal (G1)';
    else if (tfge >= 60) estagioFiltracao = 'Queda Leve (G2)';
    else if (tfge >= 45) estagioFiltracao = 'Queda Moderada Leve (G3a)';
    else if (tfge >= 30) estagioFiltracao = 'Queda Moderada Grave (G3b)';
    else if (tfge >= 15) estagioFiltracao = 'Queda Severa (G4)';
    else estagioFiltracao = 'Falência Renal (G5)';
  } else if (creatinina !== null) {
    estagioFiltracao = creatinina <= 1.2 ? 'Filtração Preservada (Est.)' : 'Filtração Reduzida (Est.)';
  }

  const notas: string[] = [];
  if (temIgAAlterado || temDismorfismo) {
    notas.push('Atenção: IgA elevada e/ou Dismorfismo eritrocitário discreto são compatíveis com Nefropatia por IgA ativa.');
  }
  if (tfge !== null && tfge < 60) {
    notas.push(`Taxa de filtração reduzida (${tfge} mL/min/1.73m²). Monitorar proteinúria.`);
  }
  if (razaoUreiaCreatinina !== null && razaoUreiaCreatinina > 20) {
    notas.push('Razão Ureia/Creatinina elevada (>20) sugere desidratação ou estado catabólico.');
  }

  const notaClinica = notas.length > 0 ? notas.join(' ') : 'Função renal preservada e estável.';

  return {
    ureia, creatinina, tfge, temIgAAlterado, temDismorfismo,
    razaoUreiaCreatinina, estagioFiltracao, notaClinica
  };
}

// ─── Metabolismo Glicídico ───────────────────────────────────────────────────

export interface GlycemicParsed {
  glicose: number | null;
  insulina: number | null;
  hba1c: number | null;
  homaIr: number | null;
  statusGlicemico: string;
  notaClinica: string;
}

export function parseGlycemicPanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): GlycemicParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const glicEx = find('glicose') || find('glicemia');
  const insEx = find('insulina');
  const hbaEx = find('hba1c') || find('glicada') || find('hemoglobina glicada');

  const glicose = glicEx ? parseNumericResult(glicEx.resultado) : null;
  const insulina = insEx ? parseNumericResult(insEx.resultado) : null;
  const hba1c = hbaEx ? parseNumericResult(hbaEx.resultado) : null;

  let homaIr: number | null = null;
  if (glicose !== null && insulina !== null) {
    homaIr = Math.round(((glicose * insulina) / 405) * 100) / 100;
  }

  let statusGlicemico = 'Normal';
  if (hba1c !== null) {
    if (hba1c >= 6.5) statusGlicemico = 'Diabetes';
    else if (hba1c >= 5.7) statusGlicemico = 'Pré-Diabetes';
  } else if (glicose !== null) {
    if (glicose >= 126) statusGlicemico = 'Diabetes (Jejum)';
    else if (glicose >= 100) statusGlicemico = 'Glicemia de Jejum Alterada';
  }

  const notas: string[] = [];
  if (homaIr !== null && homaIr > 2.5) {
    notas.push(`HOMA-IR elevado (${homaIr}), sugerindo resistência à insulina.`);
  }
  if (statusGlicemico === 'Pré-Diabetes' || statusGlicemico === 'Glicemia de Jejum Alterada') {
    notas.push('Indicação de otimização dietética para controle glicêmico preventivo.');
  }

  const notaClinica = notas.length > 0 ? notas.join(' ') : 'Metabolismo da glicose sob bom controle.';

  return {
    glicose, insulina, hba1c, homaIr, statusGlicemico, notaClinica
  };
}

// ─── Enzimas Musculares ──────────────────────────────────────────────────────

export interface MuscleParsed {
  cpk: number | null;
  aldolase: number | null;
  dhl: number | null;
  temCPKElevada: boolean;
  notaClinica: string;
}

export function parseMusclePanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): MuscleParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const cpkEx = find('cpk') || find('creatinofosfoquinase') || find('creatina fosfoquinase') || find('ck ');
  const aldEx = find('aldolase');
  const dhlEx = find('dhl') || find('desidrogenase lactica') || find('desidrogenase láctica');

  const cpk = cpkEx ? parseNumericResult(cpkEx.resultado) : null;
  const aldolase = aldEx ? parseNumericResult(aldEx.resultado) : null;
  const dhl = dhlEx ? parseNumericResult(dhlEx.resultado) : null;

  const temCPKElevada = cpkEx ? (cpkEx.interpretacao === 'Alterado' || cpk !== null && cpk > 190) : false;

  const notas: string[] = [];
  if (temCPKElevada) {
    notas.push(`CPK elevada (${cpk} U/L) sugere sobrecarga ou lesão de fibras musculares periféricas.`);
  } else {
    notas.push('Enzimas musculares estruturais normais suportam a hipótese de dor neuropática central (Fibromialgia) sem miopatia inflamatória.');
  }

  const notaClinica = notas.join(' ');

  return { cpk, aldolase, dhl, temCPKElevada, notaClinica };
}

// ─── Vitaminas & Minerais ───────────────────────────────────────────────────

export interface VitaminsParsed {
  vitD: number | null;
  vitB12: number | null;
  ferro: number | null;
  ferritina: number | null;
  magnesio: number | null;
  zinco: number | null;
  alertaB12Subotimo: boolean;
  alertaVitDSubotima: boolean;
  notaClinica: string;
}

export function parseVitaminsPanel(subExams: Array<{ nomeExame: string; resultado: string; interpretacao: string }>): VitaminsParsed {
  const find = (key: string) => subExams.find(e => e.nomeExame.toLowerCase().includes(key.toLowerCase()));

  const vitDEx = find('vitamina d');
  const vitB12Ex = find('vitamina b12') || find('b12');
  const ferroEx = find('ferro');
  const ferritinaEx = find('ferritina');
  const magEx = find('magnésio') || find('magnesio');
  const zinEx = find('zinco');

  const vitD = vitDEx ? parseNumericResult(vitDEx.resultado) : null;
  const vitB12 = vitB12Ex ? parseNumericResult(vitB12Ex.resultado) : null;
  const ferro = ferroEx ? parseNumericResult(ferroEx.resultado) : null;
  const ferritina = ferritinaEx ? parseNumericResult(ferritinaEx.resultado) : null;
  const magnesio = magEx ? parseNumericResult(magEx.resultado) : null;
  const zinco = zinEx ? parseNumericResult(zinEx.resultado) : null;

  const alertaB12Subotimo = vitB12 !== null && vitB12 < 450;
  const alertaVitDSubotima = vitD !== null && vitD < 40;

  const notas: string[] = [];
  if (alertaB12Subotimo) {
    notas.push(`Vitamina B12 sub-ótima (${vitB12} pg/mL) para metas neurológicas/TDAH. Ideal > 450 pg/mL.`);
  }
  if (alertaVitDSubotima) {
    notas.push(`Vitamina D sub-ótima (${vitD} ng/mL). Alvos ideais > 40 ng/mL para suporte imunológico e muscular.`);
  }
  if (ferritina !== null && ferritina < 50) {
    notas.push(`Estoques de ferro baixos (Ferritina: ${ferritina} µg/L).`);
  }

  const notaClinica = notas.length > 0 ? notas.join(' ') : 'Painel de micronutrientes em níveis adequados.';

  return {
    vitD, vitB12, ferro, ferritina, magnesio, zinco,
    alertaB12Subotimo, alertaVitDSubotima, notaClinica
  };
}

// ─── Fim: Painéis de Exames ──────────────────────────────────────────────────

export interface RangePercentage {
  percentage: number;
  min: number | null;
  max: number | null;
  hasRange: boolean;
}

/**
 * Calcula a posição percentual de um valor dentro do intervalo de referência.
 * Mapeia o intervalo de referência para ocupar a faixa central (25% a 75%) do slider,
 * facilitando a visualização de valores limítrofes ou alterados.
 */
export function getValuePercentage(value: number | null, referenceRange: string): RangePercentage {
  if (value === null || !referenceRange) {
    return { percentage: 50, min: null, max: null, hasRange: false };
  }

  // Normaliza e limpa o texto
  const cleaned = referenceRange.replace(',', '.').toLowerCase();

  // Caso 1: Intervalo duplo ("0.45 a 4.5", "0.45 - 4.5")
  if (cleaned.includes('a') || (cleaned.includes('-') && !cleaned.startsWith('-'))) {
    const separator = cleaned.includes('a') ? 'a' : '-';
    const parts = cleaned.split(separator);
    if (parts.length >= 2) {
      const min = parseFloat(parts[0].replace(/[^\d.]/g, '').trim());
      const max = parseFloat(parts[1].replace(/[^\d.]/g, '').trim());
      if (!isNaN(min) && !isNaN(max) && max > min) {
        let pct = 50;
        if (value < min) {
          pct = Math.max(5, (value / min) * 25);
        } else if (value > max) {
          pct = Math.min(95, 75 + ((value - max) / max) * 20);
        } else {
          pct = 25 + ((value - min) / (max - min)) * 50;
        }
        return { percentage: pct, min, max, hasRange: true };
      }
    }
  }

  // Caso 2: Menor que ("< 190", "<= 190")
  if (cleaned.includes('<') || cleaned.includes('≤')) {
    const max = parseFloat(cleaned.replace(/[<≤]/g, '').replace(/[^\d.]/g, '').trim());
    if (!isNaN(max) && max > 0) {
      let pct = 50;
      if (value <= max) {
        pct = Math.max(5, (value / max) * 60); // Ocupa até 60%
      } else {
        pct = Math.min(95, 75 + ((value - max) / max) * 20); // Acima de 75%
      }
      return { percentage: pct, min: 0, max, hasRange: true };
    }
  }

  // Caso 3: Maior que ("> 40", ">= 40")
  if (cleaned.includes('>') || cleaned.includes('≥')) {
    const min = parseFloat(cleaned.replace(/[>≥]/g, '').replace(/[^\d.]/g, '').trim());
    if (!isNaN(min) && min > 0) {
      let pct = 50;
      if (value >= min) {
        pct = Math.min(95, 40 + ((value - min) / min) * 40); // Acima de 40%
      } else {
        pct = Math.max(5, (value / min) * 30); // Abaixo de 30%
      }
      return { percentage: pct, min, max: null, hasRange: true };
    }
  }

  return { percentage: 50, min: null, max: null, hasRange: false };
}


export interface Doctor {
  id: string;
  name: string;
  crm?: string;
  uf?: string; // State
  specialty?: string;
  phone?: string;
  email?: string;
  notes?: string;
  userId: string;
  createdAt?: any;
}

