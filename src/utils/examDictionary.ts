export interface DictionaryItem {
  canonicalName: string;
  category: string;
  description: string;
  mostCommonBrazil: boolean;
  aliases: string[];
  labExamples: { lab: string; label: string }[];
  optimalRange?: string;
  symptomsHigh?: string;
  symptomsLow?: string;
  recommendations?: string[];
}

export const EXAM_GLOSSARY: DictionaryItem[] = [
  {
    canonicalName: "Hemograma Completo",
    category: "Sangue",
    description: "Avalia as três linhagens de células do sangue fezendo a contagem de glóbulos vermelhos (hemácias), glóbulos brancos (leucócitos) e plaquetas. Primordial para diagnosticar anemia, processos infecciosos, quadros de leucemia e distúrbios de coagulação sanguínea.",
    mostCommonBrazil: true,
    aliases: ["hemograma", "hemograma completo", "eritrograma", "leucograma", "plaquetograma", "blood count", "cbc", "serie vermelha", "serie branca"],
    labExamples: [
      { lab: "Fleury", label: "HEMOGRAMA, SANGUE TOTAL" },
      { lab: "Delboni", label: "HEMOGRAMA COMPLETO, SANGUE" },
      { lab: "CDB", label: "HEMOGRAMA COMPLETO COM PLAQUETAS" },
      { lab: "Lavoisier", label: "HEMOGRAMA COMPLETO SANGUE" }
    ],
    optimalRange: "Hemácias: 4.1 a 5.1 M/µL | Leucócitos: 4.500 a 7.500/mm³ | Plaquetas: 150.000 a 300.000/mm³",
    symptomsHigh: "Febre, dores corporais, processos inflamatórios severos agudos e risco de hipercoagulação sanguínea.",
    symptomsLow: "Fadiga extrema, palidez nas mucosas, desânimo severo, infecções oportunistas frequentes e tonturas.",
    recommendations: [
      "Manter hidratação regular constante (> 2.5L/dia)",
      "Avaliar estoques corporais de Ferro, Ferritina, Ácido Fólico e Vitamina B12",
      "Evitar excesso de exercícios exaustivos antes da coleta"
    ]
  },
  {
    canonicalName: "Glicose em Jejum",
    category: "Metabolismo",
    description: "Mede o nível de glicose (açúcar) circulante no plasma sanguíneo após período de jejum. Usado para diagnosticar e controlar distúrbios glicêmicos como Pré-Diabetes e Diabetes Mellitus.",
    mostCommonBrazil: true,
    aliases: ["glicose", "glicemia", "glicose em jejum", "glicose serica", "glicemia em jejum", "glucose", "glicose de jejum"],
    labExamples: [
      { lab: "Fleury", label: "GLICOSE, DOSAGEM SERICA" },
      { lab: "Delboni", label: "GLICEMIA EM JEJUM, SANGUE" },
      { lab: "Lavoisier", label: "GLICOSE SERICA" },
      { lab: "a+", label: "GLICEMIA DE JEJUM" }
    ],
    optimalRange: "70 a 85 mg/dL (Faixa Funcional Preventiva)",
    symptomsHigh: "Sede excessiva (polidipsia), micção frequente (poliúria), cansaço inexplicável pós-refeição e visão turva.",
    symptomsLow: "Suor frio, taquicardia, tremores, fraqueza muscular súbita e dor de cabeça.",
    recommendations: [
      "Associa carboidratos a fibras de boa qualidade, proteínas e gorduras saudáveis",
      "Priorizar treinos de força para aumentar a densidade dos receptores Glut-4 no músculo",
      "Reduzir açúcares simples e produtos ultraprocessados no jantar"
    ]
  },
  {
    canonicalName: "Hemoglobina Glicada (HbA1c)",
    category: "Metabolismo",
    description: "Reflete a média do controle glicêmico das hemácias nos últimos 2 a 3 meses. Essencial para acompanhamento de longo prazo e diagnóstico seguro do diabetes controle de glicose grudada na hemoglobina.",
    mostCommonBrazil: true,
    aliases: ["hemoglobina glicada", "hemoglobina glicosilada", "hba1c", "glicada", "a1c", "hb glicosilada", "hb glicada", "glicosilada"],
    labExamples: [
      { lab: "Fleury", label: "HEMOGLOBINA GLICADA (A1C), DOSAGEM" },
      { lab: "Delboni", label: "HEMOGLOBINA GLICILADA (A1C)" },
      { lab: "Alta", label: "HEMOGLOBINA GLICADA POR HPLC" }
    ],
    optimalRange: "4.6% a 5.3%",
    symptomsHigh: "Dificuldade para cicatrizar lesões cutâneas, prurido persistente, ganho de peso visceral crônico e fadiga sustentada.",
    symptomsLow: "Hipoglicemias frequentes reativas em dietas inadequadas.",
    recommendations: [
      "Praticar caminhadas leves logo de 10-15 min após as principais refeições do dia",
      "Suplementar Magnésio e Cromo picolinato para otimização dos transportadores de insulina",
      "Evitar petiscar carboidratos isolados ao longo do dia"
    ]
  },
  {
    canonicalName: "Insulina em Jejum",
    category: "Metabolismo",
    description: "Avalia a dosagem basal de insulina. É fundamental no cálculo dos índices de resistência insulínica (como o HOMA-IR e o HOMA-Beta), ajudando a detectar sobrecarga pancreática antes da elevação da glicose.",
    mostCommonBrazil: true,
    aliases: ["insulina", "insulina em jejum", "insulina basal", "insulinemia", "fasting insulin"],
    labExamples: [
      { lab: "Fleury", label: "INSULINA, DOSAGEM SERICA" },
      { lab: "Delboni", label: "INSULINA COMPLETA" }
    ],
    optimalRange: "2.0 a 6.0 µUI/mL (Excelente sensibilidade à insulina)",
    symptomsHigh: "Acantose Nigricans (escurecimento do pescoço ou axilares), compulsão por doces e massas, acúmulo de gordura no abdômen.",
    symptomsLow: "Baixa reserva de pâncreas (se associado a alta glicose) ou cetose controlada.",
    recommendations: [
      "Utilizar estratégias de jejum intermitente fisiológico racional",
      "Inserir vinagre de maçã diluído antes de refeições volumosas ricos em amido",
      "Realizar musculação e treinos resistidos de alta carga pelo menos 3 vezes por semana"
    ]
  },
  {
    canonicalName: "Colesterol Total",
    category: "Coração",
    description: "Indica a soma de todas as subfrações de colesterol circulantes no soro sanguíneo (HDL + LDL + VLDL). Permite triagem rápida de hipercolesterolemia.",
    mostCommonBrazil: true,
    aliases: ["colesterol total", "colesterol", "dosagem de colesterol total", "total cholesterol"],
    labExamples: [
      { lab: "Fleury", label: "COLESTEROL TOTAL, SERICO" },
      { lab: "Delboni", label: "COLESTEROL TOTAL" },
      { lab: "CDB", label: "COLESTEROL TOTAL, DOSAGEM" }
    ],
    optimalRange: "140 a 200 mg/dL",
    symptomsHigh: "Se acompanhado de inflamação arterial, pode induzir circulação subfisiológica e fadiga.",
    symptomsLow: "Possível flacidez hormonal, secura da pele, imunidade flutuante e depressão celular (o colesterol é precursor de hormônios esteroides).",
    recommendations: [
      "Avaliar exames inflamatórios paralelos como PCR de alta sensibilidade e Homocisteína",
      "Consumir gorduras monoinsaturadas saudáveis como Azeite de Oliva Extravirgem e Abacate",
      "Monitorar o rácio de triglicerídeos/HDL"
    ]
  },
  {
    canonicalName: "HDL - Colesterol",
    category: "Coração",
    description: "Conhecido como 'colesterol bom'. Atua transportando o excesso de colesterol das artérias de volta para depósitos metabólicos no fígado, agindo de forma cardioprotetora.",
    mostCommonBrazil: true,
    aliases: ["hdl", "colesterol hdl", "hdl-colesterol", "hdl colesterol", "lipoproteina de alta densidade", "high-density lipoprotein"],
    labExamples: [
      { lab: "Fleury", label: "COLESTEROL HDL, FRAÇÃO" },
      { lab: "Lavoisier", label: "COLESTEROL - FRAÇÃO HDL" },
      { lab: "a+", label: "COLESTEROL HDL SANGUE" }
    ],
    optimalRange: "Superior a 55 mg/dL (Cardioprotetor)",
    symptomsHigh: "Níveis extremamente altos (>100) devem ser investigados sob polimorfismos ou excelente longevidade.",
    symptomsLow: "Aumento drástico do risco cardiovascular inflamatório e de dores crônicas sistêmicas.",
    recommendations: [
      "Suplementação programada de Omega 3 rico em EPA e DHA",
      "Atividade aeróbica diária contínua e moderada",
      "Consumir oleaginosas (amêndoas, nozes e castanhas) nos lanches"
    ]
  },
  {
    canonicalName: "LDL - Colesterol",
    category: "Coração",
    description: "Conhecido popularmente como 'colesterol ruim'. Subunidade de lipoproteína que em níveis em excesso deposita gordura nas paredes arteriais, estimulando placas ateroscleróticas.",
    mostCommonBrazil: true,
    aliases: ["ldl", "colesterol ldl", "ldl-colesterol", "ldl colesterol", "lipoproteina de baixa densidade", "low-density lipoprotein"],
    labExamples: [
      { lab: "Fleury", label: "COLESTEROL LDL, DOSAGEM DIRETA" },
      { lab: "Delboni", label: "COLESTEROL FRACAO LDL" }
    ],
    optimalRange: "70 a 110 mg/dL (conforme risco individual)",
    symptomsHigh: "Xantomas de pele em níveis patológicos raros; cansaço muscular se o sangue estiver mais espesso.",
    symptomsLow: "Atenção a problemas cognitivos se estiver excessivamente baixo (<50) sem orientação médica.",
    recommendations: [
      "Prevenir oxidação do LDL reduzindo óleos vegetais refinados (soja, canola e milho)",
      "Adicionar antioxidantes na rotina tais como chá verde, romã e fitoesteróis",
      "Evitar co-associação de LDL elevado com Tabagismo e Sedentarismo"
    ]
  },
  {
    canonicalName: "VLDL - Colesterol",
    category: "Coração",
    description: "Fração de colesterol de muito baixa densidade que transporta principalmente triglicérides produzidos endogenamente pelo fígado.",
    mostCommonBrazil: true,
    aliases: ["vldl", "colesterol vldl", "vldl-colesterol", "vldl colesterol", "very low-density lipoprotein"],
    labExamples: [
      { lab: "CDB", label: "COLESTEROL - FRAÇÃO VLDL" },
      { lab: "Fleury", label: "COLESTEROL VLDL, FRAÇÃO" }
    ],
    optimalRange: "Menor que 20 mg/dL",
    symptomsHigh: "Associação clara a fígados sobrecarregados (esteatose hepática) e pletora abdominal ou dislipidemia.",
    symptomsLow: "Raramente representa condição patológica isolada.",
    recommendations: [
      "Diminuir radicalmente a ingestão de álcool purificado e refrigerantes",
      "Eliminar açúcares líquidos e reduzir o consumo excessivo de frutose isolada industrializada",
      "Aumentar o consumo diário de vegetais crucíferos"
    ]
  },
  {
    canonicalName: "Triglicérides",
    category: "Coração",
    description: "Reserva lipídica primária do nosso organismo. Níveis altos no plasma favorecem o risco cardiovascular e podem levar a inflamações agudas no pâncreas (pancreatite) se passarem de limites seguros.",
    mostCommonBrazil: true,
    aliases: ["triglicerides", "triglicerideos", "triglicerides sericos", "triglycerides", "trigliceris"],
    labExamples: [
      { lab: "Fleury", label: "TRIGLICERIDEOS, DOSAGEM SERICA" },
      { lab: "Delboni", label: "TRIGLICERIDES DE JEJUM" }
    ],
    optimalRange: "Menor que 90 mg/dL (Excelente controle metabólico)",
    symptomsHigh: "Xantelasmas na pele, sonolência intensa após almoçar, fígado gorduroso, dores de cabeça intermitentes.",
    symptomsLow: "Possível subnutrição primária crônica ou dietas cetogênicas muito restritas.",
    recommendations: [
      "Eliminar estritamente massas brancas, pães refinados e doces refinados industrializados",
      "Fazer suplementação com Óleo de Peixe / Omega 3 de alta pureza",
      "Evitar misturar carboidratos pesados com gorduras ruins na mesma refeição"
    ]
  },
  {
    canonicalName: "TSH",
    category: "Tireoide",
    description: "Hormônio secretado pela glândula hipófise que atua estimulando o funcionamento da tireoide. É o exame de triagem mais sensível para detectar Hipotireoidismo ou Hipertireoidismo.",
    mostCommonBrazil: true,
    aliases: ["tsh", "tsh ultra-sensivel", "tsh ultrassensivel", "tsh ultra sensivel", "thyroid stimulating hormone", "hormonio estimulante da tireoide"],
    labExamples: [
      { lab: "Fleury", label: "HORMÔNIO ESTIMULANTE DA TIREOIDE (TSH)" },
      { lab: "Alta", label: "TSH ULTRASSENSÍVEL" },
      { lab: "Lavoisier", label: "TSH ULTRA SENSÍVEL" }
    ],
    optimalRange: "0.5 a 2.0 µUI/mL (Faixa Funcional Otimizada)",
    symptomsHigh: "(Hipotireoidismo) Ganho de peso involuntário, fadiga extrema constante, humor deprimido, queda de cabelos, unhas quebradiças, constipação intestinal severa.",
    symptomsLow: "(Hipertireoidismo) Palpitações súbitas cardiacas, tremores motores delicados, perda acelerada de peso, insônia severa de manutenção, irritabilidade extrema.",
    recommendations: [
      "Focar no equilíbrio nutricional com Selênio (2 castanhas do pará/dia), Zinco e Coenzima Q10",
      "Controlar o estresse psicológico e nível de cortisol (o cortisol alto inibe a conversão de T4 em T3 ativo)",
      "Realizar rastreio integrado com autoanticorpos Anti-TPO e Anti-Tg"
    ]
  },
  {
    canonicalName: "Tiroxina (T4) Livre",
    category: "Tireoide",
    description: "Hormônio ativo sintetizado e liberado pela tireoide. Juntamente com o TSH, ajuda a traçar o diagnóstico e acompanhamento tático de condições endócrinas.",
    mostCommonBrazil: true,
    aliases: ["t4 livre", "tiroxina livre", "ft4", "free t4", "tiroxinemia livre"],
    labExamples: [
      { lab: "Fleury", label: "TIROXINA LIVRE (T4 LIVRE)" },
      { lab: "Delboni", label: "T4 LIVRE, DOSAGEM" }
    ]
  },
  {
    canonicalName: "Triiodotironina (T3) Livre",
    category: "Tireoide",
    description: "Fração do hormônio T3 livre circulante, convertida principalmente a partir do T4. Usada para diagnosticar formas específicas de hipertireoidismo.",
    mostCommonBrazil: false,
    aliases: ["t3 livre", "triiodotironina livre", "ft3", "free t3", "triiodotironina livre serica"],
    labExamples: [
      { lab: "Fleury", label: "TRIIODOTIRONINA LIVRE (T3 LIVRE)" },
      { lab: "a+", label: "T3 LIVRE, DOSAGEM" }
    ]
  },
  {
    canonicalName: "TGP (ALT)",
    category: "Fígado",
    description: "Enzima presente predominantemente no fígado. Aumentos acentuados indicam lesão direta nas células do fígado (hepatites, cirrose, esteatose severa ou toxicologia medicamentosa).",
    mostCommonBrazil: true,
    aliases: ["tgp", "alt", "alanina aminotransferase", "transaminase glutamico piruvica", "transaminase tgp"],
    labExamples: [
      { lab: "Fleury", label: "ALT (TRANSAMINASE GLUTAMICO-PIRUVICA - TGP)" },
      { lab: "CDB", label: "TRANSAMINASE GLUTAMICO PIRUVICA TGP" }
    ],
    optimalRange: "9 a 25 U/L (Excelente integridade inflamatória hepática)",
    symptomsHigh: "Fadiga inexplicável, desconforto no quadrante superior direito do abdômen, náuseas recorrentes, icterícia (pele ou olhos amarelados) e urina escura.",
    symptomsLow: "Geralmente sem repercusão patológica (pode indicar excelente conservação celular).",
    recommendations: [
      "Reduzir o consumo de frituras, farináceos industriais e bebidas alcoólicas",
      "Investigar o acúmulo de gordura no fígado por meio de ultrassonografia abdominal",
      "Praticar jejum noturno fisiológico simples de 12 horas para descansar a atividade metabólica do fígado"
    ]
  },
  {
    canonicalName: "TGO (AST)",
    category: "Fígado",
    description: "Enzima presente em células do fígado, rins, coração e músculos. Sua elevação aponta danos celulares viscerais ou musculares agudos.",
    mostCommonBrazil: true,
    aliases: ["tgo", "ast", "aspartato aminotransferase", "transaminase glutamico oxalacetica", "transaminase tgo"],
    labExamples: [
      { lab: "Fleury", label: "AST (TRANSAMINASE GLUTAMICO-OXALACETICA - TGO)" },
      { lab: "CDB", label: "TRANSAMINASE GLUTAMICO OXALACETICA TGO" }
    ],
    optimalRange: "10 a 25 U/L",
    symptomsHigh: "Dores corporais ou musculares intensas pós-exercício extenuante, fadiga crônica persistente, náuseas.",
    symptomsLow: "Sem relevância clínica patológica habitual.",
    recommendations: [
      "Evitar o consumo concomitante de medicamentos metabolizados pelo fígado (como Paracetamol) sem supervisão",
      "Controlar a intensidade de treinos musculares hipertróficos até 48 horas antes da coleta de exames",
      "Aumentar o consumo de vegetais amargos (alcachofra, rúcula, agrião) que estimulam a colerese e depuração"
    ]
  },
  {
    canonicalName: "Gama-Glutamil Transferase (Gama GT)",
    category: "Fígado",
    description: "Enzima do sistema de ductos biliares e fígado. Muito sensível aos efeitos inflamatórios por abuso alcoólico, drogas medicamentosas e quadros obstrutivos de vesícula biliar.",
    mostCommonBrazil: true,
    aliases: ["gama gt", "gama-gt", "ggt", "gama glutamil transferase", "gamagt"],
    labExamples: [
      { lab: "Fleury", label: "GAMA GLUTAMIL TRANSFERASE (GAMA GT)" },
      { lab: "Delboni", label: "GAMA GT DOSAGEM SERICA" }
    ]
  },
  {
    canonicalName: "Ureia",
    category: "Rins",
    description: "Composto sintetizado pelo fígado a partir do metabolismo proteico e excretado pelos rins. Auxilia na avaliação rápida do clearance e uremia clínica.",
    mostCommonBrazil: true,
    aliases: ["ureia", "ureia serica", "nitrogenio ureico"],
    labExamples: [
      { lab: "Fleury", label: "UREIA, DOSAGEM SERICA" },
      { lab: "Delboni", label: "UREIA COMPLETA" }
    ],
    optimalRange: "15 a 40 mg/dL (Excelente equilíbrio proteico e hidratação)",
    symptomsHigh: "Fadiga extrema, náuseas, hálito com odor peculiar (urêmico), coceira no corpo e confusão mental leve.",
    symptomsLow: "Possível desnutrição de proteínas, dieta vegetariana estrita sem compensação ou sobrecarga de hidratação flutuante.",
    recommendations: [
      "Adequar o consumo de fontes proteicas ao peso corporal ideal atual",
      "Monitorar a ingestão diária de líquidos (principalmente água, no rácio de 35ml por kg)",
      "Avaliar a saúde funcional do fígado se associado a baixíssima produção"
    ]
  },
  {
    canonicalName: "Creatinina",
    category: "Rins",
    description: "Resíduo metabólico gerado continuamente pelos músculos que é filtrado e eliminado quase exclusivamente pela urina. É o padrão de ouro inicial para calcular a Taxa de Filtração Glomerular renal.",
    mostCommonBrazil: true,
    aliases: ["creatinina", "creatinina serica", "creatinina de jejum"],
    labExamples: [
      { lab: "Fleury", label: "CREATININA, DOSAGEM SERICA" },
      { lab: "Lavoisier", label: "CREATININA, SANGUE" }
    ],
    optimalRange: "0.60 a 1.10 mg/dL (Ajustado por massa magra e densidade muscular)",
    symptomsHigh: "Inchaço nas pernas e pés (edema periférico), dores lombares baixas, aumento ou redução drástica do volume urinário, hipertensão inexplicável.",
    symptomsLow: "Falta ou atrofia de massa muscular magra, repouso prolongado, fraqueza estrutural corporal crônica.",
    recommendations: [
      "Evitar o uso de medicamentos anti-inflamatórios não-esteroidais (AINEs) sem supervisão direta",
      "Praticar musculação de forma regular para conservar integridade da massa esquelética ativa",
      "Investigar o rácio com a taxa de filtração glomerular estimada (eGFR)"
    ]
  },
  {
    canonicalName: "Microalbuminúria",
    category: "Rins",
    description: "Mede a excreção de quantidades microscópicas de albumina pela urina. É um indicador precoce de nefropatia e estresse glomerular, essencial no acompanhamento da Nefropatia por IgA e nefropatia diabética.",
    mostCommonBrazil: true,
    aliases: ["microalbuminuria", "micro albumina", "microalbuminuria isolada", "relação albumina creatinina", "rac", "albumina na urina"],
    labExamples: [
      { lab: "Fleury", label: "MICROALBUMINURIA EM AMOSTRA ISOLADA" },
      { lab: "Delboni", label: "ALBUMINURIA ISOLADA" }
    ]
  },
  {
    canonicalName: "Ácido Úrico",
    category: "Metabolismo",
    description: "Subproduto final da metabolização de purinas ricas em DNA na dieta alimentar. Níveis persistentemente altos levam a deposições de urato de sódio nas articulações (Gota) ou rins (Cálculos).",
    mostCommonBrazil: true,
    aliases: ["acido urico", "acido urico serico", "donate", "urate", "acido urico de jejum"],
    labExamples: [
      { lab: "Fleury", label: "ACIDO URICO, DOSAGEM SERICA" },
      { lab: "CDB", label: "ACIDO URICO SANGUE" }
    ]
  },
  {
    canonicalName: "Proteína C-Reativa (PCR)",
    category: "Autoimunidade",
    description: "Proteína de fase aguda sintetizada de forma responsiva pelo fígado durante eventos de agressão inflamatórias ou infecções bacterianas. Versões ultrassensíveis apontam estimativas subclínicas vasculares.",
    mostCommonBrazil: true,
    aliases: ["pcr", "proteina c reativa", "pcr ultra-sensivel", "pcr ultrassensivel", "pcr de alta sensibilidade", "pcr-us"],
    labExamples: [
      { lab: "Fleury", label: "PROTEINA C REATIVA, DOSAGEM ULTRASSENSIVEL" },
      { lab: "CDB", label: "PROTEINA C REATIVA - CLASSE I" },
      { lab: "a+", label: "PROTEINA C REATIVA ESPONTANEA" }
    ],
    optimalRange: "Menor que 1.0 mg/L (Baixo nível de inflamação sistêmica)",
    symptomsHigh: "Dores articulares migratórias, rigidez matinal persistente, indisposição geral crônica, suscetibilidade a infecções e cansaço recorrente.",
    symptomsLow: "Concentrações indetectáveis ou mínimas sinalizam homeostase imunológica plena.",
    recommendations: [
      "Consumir uma dieta balanceada rica em compostos polifenóis e fitoquímicos (azeite, cúrcuma, gengibre, frutas vermelhas)",
      "Adotar uma rotina restaurativa de sono com duração consistente de 7-8 horas diárias",
      "Realizar atividades físicas moderadas de impacto controlado para reduzir estresse metabólico"
    ]
  },
  {
    canonicalName: "VHS (Velocidade de Hemossedimentação)",
    category: "Autoimunidade",
    description: "Exame reumatológico simples que indica a velocidade de queda das hemácias no tubo sob gravidade. Exibe comportamento elevado na vigência de processos inflamatórios de longa data.",
    mostCommonBrazil: true,
    aliases: ["vhs", "velocidade de hemossedimentacao", "velocidade de sedimentacao das hemacias"],
    labExamples: [
      { lab: "Fleury", label: "VELOCIDADE DE HEMOSSEDIMENTACAO (VHS)" },
      { lab: "Delboni", label: "VHS, SANGUE" }
    ],
    optimalRange: "Menor que 10 mm na primeira hora",
    symptomsHigh: "Dores musculares difusas, debilidade física após esforço mínimo, dor de cabeça e cansaço generalizado persistente.",
    symptomsLow: "Ausência de sinalização inflamatória musculoesquelética ou reumatológica crônica.",
    recommendations: [
      "Acompanhar o VHS em conjunto com a Proteína C-Reativa (PCR) para monitoramento dinâmico de surtos autoimunes",
      "Praticar jejum noturno fisiológico de pelo menos 11 a 12 horas para desinflamação intestinal",
      "Garantir aporte diário ideal de água corporativa e líquidos isotônicos saudáveis"
    ]
  },
  {
    canonicalName: "Vitamina D (25-hidróxi)",
    category: "Nutrientes",
    description: "Formulação metabólica estável de armazenamento de Vitamina D que serve de estoque. Primordial para a regulação do balanço imunológico, calcificação óssea e mineralização celular.",
    mostCommonBrazil: true,
    aliases: ["vitamina d", "vitamina d (25-hidroxi)", "25-oh vitamina d", "25-oh-vitamina-d", "vitamina d3", "25-hidroxicolecalciferol", "vitamina d 250h"],
    labExamples: [
      { lab: "Fleury", label: "25-HIDROXIVITAMINA D (VITAMINA D3)" },
      { lab: "Delboni", label: "VITAMINA D 25 HIDROXI" }
    ],
    optimalRange: "40 a 60 ng/mL (Imunomodulação e contenção autoimune otimizada)",
    symptomsHigh: "Excesso extremo (>100) pode induzir sintomas de hipercalcemia como náuseas, fraqueza generalizada e dores abdominais.",
    symptomsLow: "(Deficiência) Redução da densidade óssea, fibromialgias de repetição, cansaço inexplicável, queda capilar e maior propensão a surtos autoimunes inflamatórios.",
    recommendations: [
      "Praticar exposição solar moderada diária de 15 a 20 minutos fora dos horários de pico ou sob indicação",
      "Associar a ingestão ou suplementação de Vitamina D com Vitamina K2 (MK-7) e Magnésio para direcionar o cálcio aos ossos",
      "Consumir semanalmente peixes gordos selvagens (salmão, cavala, sardinha e ovos)"
    ]
  },
  {
    canonicalName: "Vitamina B12",
    category: "Nutrientes",
    description: "Importante cofator metabólico para a maturação eritrocitária e conservação da integridade da bainha de mielina em neurônios. Deficiências acusam cansaço sistêmico extremos ou anemias megaloblásticas.",
    mostCommonBrazil: true,
    aliases: ["vitamina b12", "vit b12", "cianocobalamina", "cobalamina", "b12"],
    labExamples: [
      { lab: "Fleury", label: "VITAMINA B12 (CIANOCOBALAMINA)" },
      { lab: "a+", label: "VITAMINA B12" }
    ],
    optimalRange: "Superior a 500 pg/mL (Otimização cognitiva, neurológica e de metilação celular)",
    symptomsHigh: "Hipervitaminose isolada geralmente devida a megadoses suplementares recentes sem repercussão patológica.",
    symptomsLow: "(Deficiência) Formigamentos nas extremidades (parestesias), fadiga intelectual pronunciada, falhas de concentração e memória, dores crônicas difusas.",
    recommendations: [
      "Suplementar preferencialmente na forma ativa de Metilcobalamina por via sublingual rápida em caso de disfunções gástricas",
      "Consumir alimentos ricos em cobalamina de origem animal como pescados, carnes magras e ovos",
      "Monitorar o nível com exames de Homocisteína (um indicador reflexo de integridade no ciclo de metilação)"
    ]
  },
  {
    canonicalName: "Ácido Fólico (Vitamina B9)",
    category: "Nutrientes",
    description: "Nutriente crucial para a síntese do DNA, maturação das hemácias e prevenção de defeitos do tubo neural. Níveis em queda podem acarretar anemia macrocítica e aumento da homocisteína.",
    mostCommonBrazil: false,
    aliases: ["acido folico", "folato", "vitamina b9", "folato serico"],
    labExamples: [
      { lab: "Fleury", label: "ACIDO FOLICO, DOSAGEM SERICA" },
      { lab: "Hermes Pardini", label: "FOLATO SERICO, DOSAGEM" }
    ]
  },
  {
    canonicalName: "Ferritina",
    category: "Nutrientes",
    description: "Proteína que abriga o estoque fisiológico de Ferro intracelular. É o termômetro clínico mais fidedigno para confirmar carência latente de ferro (Microcitose / Anemia) ou sobrecarga sistêmica tóxica (Hemocromatose).",
    mostCommonBrazil: true,
    aliases: ["ferritina", "ferritina serica", "ferritin", "dosagem de ferritina"],
    labExamples: [
      { lab: "Fleury", label: "FERRITINA, DOSAGEM" },
      { lab: "CDB", label: "FERRITINA SERICA SANGUE" }
    ],
    optimalRange: "70 a 150 ng/mL para homens | 50 a 100 ng/mL para mulheres (Faixa de reserva ideal livre de sobrecarga ou inflamação)",
    symptomsHigh: "Rigidez nas articulações, dores abdominais inespecíficas, fadiga severa de estresse oxidativo, predisposição a esteatose hepática e picos fáceis de glicose (a ferritina é proteína reativa de fase aguda).",
    symptomsLow: "Fadiga extrema incessante, cabelos opacos e fracos com queda difusa, pernas inquietas no repouso noturno, unhas fracas e falta de ar.",
    recommendations: [
      "Investigar em conjunto as concentrações de Proteína C-Reativa (PCR) para descartar elevações de ferritina por simples processo inflamatório agudo",
      "Consumir fontes de Ferro Heme (carnes vermelhas, vísceras sob moderação) associadas à Vitamina C nas refeições para melhor absorção intestinal",
      "Evitar o consumo concomitante de cafés, chás escuros ou cálcio junto a alimentos ricos em ferro (eles inibem fortemente a absorção)"
    ]
  },
  {
    canonicalName: "Ferro Sérico",
    category: "Nutrientes",
    description: "Mede o mineral Ferro presente de forma transitória ligada diretamente nas proteínas transportadoras no sangue periférico.",
    mostCommonBrazil: false,
    aliases: ["ferro serico", "ferro", "dosagem de ferro", "sideremia"],
    labExamples: [
      { lab: "Fleury", label: "FERRO SERICO, DOSAGEM" }
    ]
  },
  {
    canonicalName: "Sódio",
    category: "Eletrólitos",
    description: "Principal cátion extracelular encarregado do controle osmótico fisiológico da pressão e regulação da hidratação celular corporal.",
    mostCommonBrazil: true,
    aliases: ["sodio", "sodio serico", "na serico", "na", "sodium"],
    labExamples: [
      { lab: "Fleury", label: "SODIO SERICO" }
    ]
  },
  {
    canonicalName: "Potássio",
    category: "Eletrólitos",
    description: "Principal cátion intracelular responsável pelas dinâmicas rápidas de despolarizações neurais e contrações rítmicas do músculo do coração (miocárdio).",
    mostCommonBrazil: true,
    aliases: ["potassio", "potassio serico", "k serico", "k", "potassium"],
    labExamples: [
      { lab: "Fleury", label: "POTASSIO SERICO" }
    ]
  },
  {
    canonicalName: "Cálcio Sérico",
    category: "Eletrólitos",
    description: "Mede a quantidade total de cálcio circulante. Um dos minerais mais abundantes e importantes do corpo, regulador de batimentos cardíacos, transmissão neuronal e contratilidade muscular.",
    mostCommonBrazil: true,
    aliases: ["calcio", "calcio serico", "calcio total", "ca"],
    labExamples: [
      { lab: "Fleury", label: "CALCIO SERICO" },
      { lab: "a+", label: "CALCIO TOTAL" }
    ]
  },
  {
    canonicalName: "Cálcio Iônico",
    category: "Eletrólitos",
    description: "Mede a fração livre e metabolicamente ativa do cálcio, que não está unida a proteínas (como a albumina). É o indicador mais fidedigno de distúrbios de cálcio.",
    mostCommonBrazil: false,
    aliases: ["calcio ionico", "calcio livre", "ca ionico", "calcio ativo"],
    labExamples: [
      { lab: "Fleury", label: "CALCIO IONICO, DOSAGEM" },
      { lab: "Dasa", label: "CALCIO IONIZAVEL" }
    ]
  },
  {
    canonicalName: "Magnésio Sérico",
    category: "Eletrólitos",
    description: "Ativador enzimático fundamental em mais de 300 processos bioquímicos corporais, incluindo a contração das miofibrilas vasculares e estabilidade neuronal.",
    mostCommonBrazil: true,
    aliases: ["magnesio", "magnesio serico", "mg"],
    labExamples: [
      { lab: "Fleury", label: "MAGNESIO SERICO" }
    ]
  },
  {
    canonicalName: "Fósforo",
    category: "Eletrólitos",
    description: "Mineral que interage de forma oposta e conjugada com o cálcio. Fundamental no metabolismo ósseo e estritamente controlado pela função de purificação glomerular renal.",
    mostCommonBrazil: false,
    aliases: ["fosforo", "fosfato", "fosforoe", "p"],
    labExamples: [
      { lab: "Fleury", label: "FOSFORO SERICO" }
    ]
  },
  {
    canonicalName: "Imunoglobulina A (IgA) Sérica",
    category: "Autoimunidade",
    description: "Principal anticorpo de proteção presente nas secreções e mucosas. Sua flutuação é crucial para monitorar a atividade imunológica e disfunções de filtragem em portadores de Nefropatia por IgA.",
    mostCommonBrazil: true,
    aliases: ["iga", "imunoglobulina a", "iga serica", "iga total", "immunoglobulin a"],
    labExamples: [
      { lab: "Fleury", label: "IMUNOGLOBULINA A - IgA" },
      { lab: "Delboni", label: "IGA COMPLETA, SUE" }
    ]
  },
  {
    canonicalName: "Cortisol Sérico",
    category: "Hormônios",
    description: "Conhecido como o hormônio adaptativo de sobrecarga e estresse, secretado pelas glândulas suprarrenais. Apresenta variação diurna (ritmo circadiano) com pico principal do dia pela manhã.",
    mostCommonBrazil: true,
    aliases: ["cortisol", "cortisol matinal", "cortisol 8h", "cortisol serico", "cortisol de jejum"],
    labExamples: [
      { lab: "Fleury", label: "CORTISOL SERICO (8 HORAS)" },
      { lab: "Alta", label: "CORTISOL MATINAL" }
    ]
  },
  {
    canonicalName: "Testosterona Total",
    category: "Hormônios",
    description: "Principal hormônio esteroide androgênico. Fundamental no homem para regulação da espermatogênese e caracteres sexuais. Essencial em ambos os sexos para densidade mineral, força muscular e vigor físico.",
    mostCommonBrazil: true,
    aliases: ["testosterona", "testosterona total", "testosterona serica"],
    labExamples: [
      { lab: "Fleury", label: "TESTOSTERONA TOTAL, DOSAGEM SERICA" },
      { lab: "Delboni", label: "TESTOSTERONA COMPLETA" }
    ]
  },
  {
    canonicalName: "Testosterona Livre",
    category: "Hormônios",
    description: "Fração biologicamente ativa do hormônio que não se encontra ligada a proteínas carreadoras como a SHBG, sendo capaz de interagir de forma imediata com os receptores celulares de tecido.",
    mostCommonBrazil: false,
    aliases: ["testosterona livre", "testo livre", "free testosterone"],
    labExamples: [
      { lab: "Fleury", label: "TESTOSTERONA LIVRE CALCULADA" },
      { lab: "Delboni", label: "TESTOSTERONA LIVRE DOSAGEM" }
    ]
  },
  {
    canonicalName: "Prolactina",
    category: "Hormônios",
    description: "Hormônio secretado na glândula hipófise anterior. Estimula a lactação mamária, mas cansaço ou medicações antipsicóticas/ansiolíticas provocam hiperprolactinemia subclínica.",
    mostCommonBrazil: true,
    aliases: ["prolactina", "prl", "prolactina serica"],
    labExamples: [
      { lab: "Fleury", label: "PROLACTINA, DOSAGEM SERICA" },
      { lab: "Lavoisier", label: "PROLACTINA COMPLETA" }
    ]
  },
  {
    canonicalName: "FSH (Hormônio Folículo-Estimulante)",
    category: "Hormônios",
    description: "Glicoproteína hipofisária que ativa as funções gonadais. Nas mulheres estimula os folículos primordiais e nos homens regula a adequada maturação dos espermatozoides.",
    mostCommonBrazil: true,
    aliases: ["fsh", "hormonio foliculo estimulante", "fsh dosagem"],
    labExamples: [
      { lab: "Fleury", label: "HORMÔNIO FOLÍCULO-ESTIMULANTE (FSH)" }
    ]
  },
  {
    canonicalName: "LH (Hormônio Luteinizante)",
    category: "Hormônios",
    description: "Atua síncronamente ao FSH. Nas mulheres coordena a ovulação (pico de LH) e nos homens ativa as células linfoides de Leydig a sintetizar testosterona.",
    mostCommonBrazil: true,
    aliases: ["lh", "hormonio luteinizante", "lh dosagem"],
    labExamples: [
      { lab: "Fleury", label: "HORMÔNIO LUTEINIZANTE (LH)" }
    ]
  },
  {
    canonicalName: "Homocisteína",
    category: "Coração",
    description: "Aminoácido sulfurado decorrente do metabolismo da metionina. Níveis altos são fortemente irritantes da parede interna das artérias (endotélio) e atuam como preditor vascular independente.",
    mostCommonBrazil: false,
    aliases: ["homocisteina", "homocysteine"],
    labExamples: [
      { lab: "Fleury", label: "HOMOCISTEINA, SANGUE" },
      { lab: "Delboni", label: "HOMOCISTEINA SERICA" }
    ]
  },
  {
    canonicalName: "Lítio",
    category: "Toxicologia",
    description: "Monitoramento obrigatório da concentração sérica do estabilizador de humor Carbonato de Lítio. Auxilia a manter o fármaco estritamente em sua janela terapêutica protetora e não nociva.",
    mostCommonBrazil: false,
    aliases: ["litio", "litio serico", "litemia", "lithium"],
    labExamples: [
      { lab: "Fleury", label: "LITIO, DOSAGEM SERICA" },
      { lab: "Delboni", label: "LITEMIA COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "PSA Total",
    category: "Saúde Masculina",
    description: "Antígeno molecular produzido pelo parênquima da próstata. Permite monitorar e rastrear patologias prostáticas benignas ou oncológicas.",
    mostCommonBrazil: true,
    aliases: ["psa", "psa total", "prostate-specific antigen", "antigeno prostatico especifico"],
    labExamples: [
      { lab: "Fleury", label: "ANTIGENO PROSTATICO ESPECIFICO (PSA TOTAL)" }
    ]
  },
  {
    canonicalName: "CPK (Creatinoquinase)",
    category: "Coração",
    description: "Fração enzimática abundante em células de tecidos musculares esqueléticos e cardíacos. Sua elevação expressiva aponta lesões agudas musculares (Rabdomiólise) ou esforço vigoroso recente.",
    mostCommonBrazil: false,
    aliases: ["cpk", "ck", "creatinoquinase", "creatinofosfoquinase"],
    labExamples: [
      { lab: "Fleury", label: "CREATINOQUINASE COMPLETA" }
    ]
  },
  {
    canonicalName: "Desidrogenase Láctica (LDH/DHL)",
    category: "Marcadores Celulares Integrados",
    description: "Enzima multifuncional celular expressa em vários tecidos. Usada como indicador sistêmico genérico de injúria de tecidos, apoptose aumentada ou anemias hemolíticas.",
    mostCommonBrazil: false,
    aliases: ["ldh", "dhl", "desidrogenase lactica"],
    labExamples: [
      { lab: "Fleury", label: "DESIDROGENASE LACTICA (LDH)" }
    ]
  },
  {
    canonicalName: "Eritrócitos (Hemácias)",
    category: "Sangue",
    description: "A contagem absoluta por milímetro cúbico de glóbulos vermelhos (hemácias) circulantes no corpo, responsáveis diretos pelo fluxo aeróbico dos pulmões aos tecidos.",
    mostCommonBrazil: true,
    aliases: ["eritreocitos", "eritrócitos", "hemacias", "red blood cells", "rbc", "hemácias"],
    labExamples: [
      { lab: "Fleury", label: "ERITROCILOS, HEMOGRAMA" }
    ]
  },
  {
    canonicalName: "Hemoglobina",
    category: "Sangue",
    description: "Proteína globular tetramérica com ferro contida no interior das hemácias. É o principal marcador laboratorial para confirmar anemias crônicas de fluxo ou hemorragias agudas.",
    mostCommonBrazil: true,
    aliases: ["hemoglobina", "hb", "hemoglobin"],
    labExamples: [
      { lab: "Delboni", label: "HEMOGLOBINA, DOSAGEM" }
    ]
  },
  {
    canonicalName: "Hematócrito",
    category: "Sangue",
    description: "Expressa em porcentagem do volume que a massa globular (hemácias) representa sobre o total do volume de amostra líquida centrifugada do sangue analisado.",
    mostCommonBrazil: true,
    aliases: ["hematocrito", "ht", "packed cell volume", "pcv"],
    labExamples: [
      { lab: "Fleury", label: "HEMATOCRITO, PERCENTUAL" }
    ]
  },
  {
    canonicalName: "Leucócitos",
    category: "Sangue",
    description: "Soma das frações de células de defesa imunológica circulantes (Neutrófilos, Linfócitos, Monócitos, Eosinófilos e Basófilos). Indica ativação ou resposta a infecções agudas.",
    mostCommonBrazil: true,
    aliases: ["leucocitos", "leucocito", "globulos brancos", "wbc", "leucograma"],
    labExamples: [
      { lab: "Fleury", label: "LEUCOCITOS TOTAIS, HEMOGRAMA" }
    ]
  },
  {
    canonicalName: "Plaquetas",
    category: "Sangue",
    description: "Fragmentos citoplasmáticos celulares oriundos dos megacariócitos medulares, responsáveis diretos por desencadear a cascata de tamponamentos iniciais primários da coagulação sanguínea.",
    mostCommonBrazil: true,
    aliases: ["plaquetas", "plaquetograma", "platelets", "plq"],
    labExamples: [
      { lab: "Fleury", label: "CONTAGEM DE PLAQUETAS" }
    ]
  },
  {
    canonicalName: "Amilase",
    category: "Pâncreas",
    description: "Enzima secretada pelo pâncreas para fatiar moléculas complexas de amido. Seu aumento agudo em 3x aponta inflamação transitória imediata no pâncreas.",
    mostCommonBrazil: false,
    aliases: ["amilase", "amylase", "amilasemia"],
    labExamples: [
      { lab: "Fleury", label: "AMILASE SERICA, DOSAGEM" }
    ]
  },
  {
    canonicalName: "Lipase",
    category: "Pâncreas",
    description: "Enzima digestiva altamente específica do pâncreas para decomposição de triglicérides intestinais. Possui permanência elevada diagnóstica por período mais longo comparado à amilase.",
    mostCommonBrazil: false,
    aliases: ["lipase", "lipase serica", "lipasemia"],
    labExamples: [
      { lab: "Fleury", label: "LIPASE, DOSAGEM SERICA" }
    ]
  },
  {
    canonicalName: "D-Dímero",
    category: "Sangue",
    description: "Subproduto degradado da rede tridimensional insolúvel de fibrina de coágulos formados. Alta sensibilidade e valor preditivo negativo excelente para triar embolias pulmonares (TEP) ou tromboses venosas agudas (TVP).",
    mostCommonBrazil: false,
    aliases: ["d-dimero", "ddimero", "d dimero", "produtos de degradacao da fibrina", "pdf", "d-dimer"],
    labExamples: [
      { lab: "Fleury", label: "D-DIMERO, DOSAGEM PLASMATICA" },
      { lab: "Dasa", label: "PESQUISA DE D-DIMERO" }
    ]
  },
  {
    canonicalName: "Estradiol",
    category: "Hormônios",
    description: "Principal hormônio estrogênio produzido pelos ovários e, em menores quantidades, pelos testículos e glândulas adrenais. Essencial para o desenvolvimento dos caracteres sexuais femininos secundários, controle do ciclo menstrual, saúde óssea e integridade vascular.",
    mostCommonBrazil: true,
    aliases: ["estradiol", "estradiol serico", "e2", "17-beta estradiol", "dosagem de estradiol"],
    labExamples: [
      { lab: "Fleury", label: "ESTRADIOL, DOSAGEM SERICA" },
      { lab: "Delboni", label: "ESTRADIOL COMPLETO" }
    ]
  },
  {
    canonicalName: "Progesterona",
    category: "Hormônios",
    description: "Hormônio esteroide envolvido no ciclo menstrual feminino, gravidez e embriogênese. Produzido principalmente pelo corpo lúteo no ovário. Crucial para preparar o endométrio para implantação do óvulo e manutenção da gestação.",
    mostCommonBrazil: true,
    aliases: ["progesterona", "progesterona serica", "prog", "dosagem de progesterona"],
    labExamples: [
      { lab: "Fleury", label: "PROGESTERONA, DOSAGEM SERICA" },
      { lab: "CDB", label: "PROGESTERONA SANGUE" }
    ]
  },
  {
    canonicalName: "SHBG (Globulina Carreadora)",
    category: "Hormônios",
    description: "Glicoproteína que se liga a hormônios sexuais, especificamente testosterona e estradiol, regulando suas frações livres (biologicamente ativas) na circulação sanguínea. Útil na investigação de distúrbios androgênicos na mulher (como SOP) e no cálculo da testosterona livre.",
    mostCommonBrazil: false,
    aliases: ["shbg", "globulina carreadora de hormonios sexuais", "globulina carreadora", "shbg serica"],
    labExamples: [
      { lab: "Fleury", label: "GLOBULINA TRANSP. DE HORMONIOS SEXUAIS (SHBG)" },
      { lab: "Delboni", label: "SHBG COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "Urina Tipo I (EAS)",
    category: "Rins",
    description: "Exame básico de urina (Elementos Animais e Sedimentoscopia). Analisa aspectos físicos (cor, densidade, pH), químicos (presença de glicose, proteínas, corpos cetônicos, hemoglobina, nitritos e esterase leucocitária) e microscópicos (células epiteliais, leucócitos, hemácias, cristais e cilindros). Essencial na triagem de infecções urinárias e microhematúria glomerular (nefropatias).",
    mostCommonBrazil: true,
    aliases: ["urina tipo i", "eas", "exame de urina", "urina tipo 1", "sumario de urina", "elementos anormais e sedimentoscopia", "analise de urina"],
    labExamples: [
      { lab: "Fleury", label: "URINA TIPO I - EAS" },
      { lab: "Delboni", label: "URINA ROTINA (EAS)" },
      { lab: "CDB", label: "ELEMENTOS ANORMAIS E SEDIMENTOSCOPIA - EAS" }
    ]
  },
  {
    canonicalName: "HOMA-IR & HOMA-Beta",
    category: "Metabolismo",
    description: "Índices matemáticos calculados a partir da Glicose em Jejum e da Insulina em Jejum. O HOMA-IR estima o grau de resistência celular à ação da insulina, enquanto o HOMA-Beta estima a capacidade secretora das células beta do pâncreas.",
    mostCommonBrazil: true,
    aliases: ["homa ir", "homa-ir", "homa beta", "homa-beta", "indice homa", "calculo do indice homa io"],
    labExamples: [
      { lab: "Fleury", label: "INDICE HOMA (HOMA-IR / HOMA-BETA)" },
      { lab: "Delboni", label: "CALCULO DOS INDICES HOMA-IR E HOMA-BETA" }
    ]
  },
  {
    canonicalName: "Zinco Sérico",
    category: "Nutrientes",
    description: "Dosagem de Zinco na circulação. O zinco é um mineral traço essencial, operando como cofator para mais de 100 enzimas metabólicas. Crucial para o sistema imunológico, cicatrização de tecidos, síntese de DNA e integridade da barreira intestinal.",
    mostCommonBrazil: false,
    aliases: ["zinco", "zinco serico", "zinc", "dosagem de zinco"],
    labExamples: [
      { lab: "Fleury", label: "ZINCO, DOSAGEM SERICA" },
      { lab: "Delboni", label: "ZINCO SANGUE" }
    ]
  },
  {
    canonicalName: "Selênio Sérico",
    category: "Nutrientes",
    description: "Exame que mede os níveis corporais de Selênio. Sendo um antioxidante biológico formidável, é um oligoelemento fundamental para a síntese e ótima ativação dos hormônios tireoidianos (através das desidogenases) e proteção contra estresse oxidativo.",
    mostCommonBrazil: false,
    aliases: ["selenio", "selenio serico", "selenium"],
    labExamples: [
      { lab: "Fleury", label: "SELENIO, DOSAGEM SERICA" }
    ]
  },
  {
    canonicalName: "Eletrocardiograma (ECG)",
    category: "Exames de Imagem",
    description: "Registro gráfico da atividade elétrica cardíaca durante o ciclo de contração. Permite diagnosticar arritmias, bloqueios de condução, hipertrofia de câmaras cardíacas e sobrecargas coronárias ou isquemias ativas.",
    mostCommonBrazil: true,
    aliases: ["ecg", "eletrocardiograma", "eletrocardiograma de repouso", "eletrocardiograma convencional"],
    labExamples: [
      { lab: "Fleury", label: "ELETROCARDIOGRAMA DE REPOUSO (ECG)" },
      { lab: "CDB", label: "ELETROCARDIOGRAMA CONVENCIONAL DE 12 DERIVACOES" }
    ]
  },
  {
    canonicalName: "Ultrassonografia de Abdome Total",
    category: "Exames de Imagem",
    description: "Exame não invasivo que utiliza ondas sonoras de alta frequência para obter imagens em tempo real de órgãos e estruturas intra-abdominais, como fígado, vesícula biliar, vias biliares, pâncreas, baço, rins, glândulas adrenais, aorta abdominal e bexiga. Fundamental na detecção de esteatose hepática (gordura no fígado), cálculos biliares, cistos renais ou esplenomegalia.",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia de abdome total", "ultrassom abdome total", "usg abdome total", "us abdome total", "ultrassonografia abdominal"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA DE ABDOME TOTAL" },
      { lab: "CDB", label: "US ABDOME TOTAL" }
    ]
  },
  {
    canonicalName: "Ultrassonografia de Tireoide",
    category: "Exames de Imagem",
    description: "Avalia a estrutura anatômica da glândula tireoide, permitindo medir suas dimensões totais, textura do parênquima, fluxo vascular (se associado ao Doppler) e, principalmente, caracterizar com precisão nódulos no pescoço (através da classificação TI-RADS) para avaliar risco de malignidade.",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia de tireoide", "ultrassom tireoide", "usg tireoide", "us de tireoide", "ultrassonografia cervical"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA DE TIREOIDE" },
      { lab: "Delboni", label: "USG TIREOIDE COM DOPPLER" }
    ]
  },
  {
    canonicalName: "Ecocardiograma Transtorácico",
    category: "Exames de Imagem",
    description: "Ultrassonografia do coração que avalia em tempo real o fluxo sanguíneo pelas válvulas, diâmetros das cavidades atriais e ventriculares, espessura miocárdica e, crucialmente, a Fração de Ejeção do Ventrículo Esquerdo (FEVE), essencial para diagnosticar insuficiência cardíaca e cardiopatias.",
    mostCommonBrazil: true,
    aliases: ["ecocardiograma", "ecocardiograma transtoracico", "eco", "ecocardiografia com doppler", "ecocardiograma bidimensional"],
    labExamples: [
      { lab: "Fleury", label: "ECOCARDIOGRAMA TRANSTORACICO COM DOPPLER COLORIDO" },
      { lab: "Delboni", label: "ECOCARDIOGRAFIA UNIDIMENSIONAL/BIDIMENSIONAL" }
    ]
  },
  {
    canonicalName: "Ressonância Magnética do Crânio",
    category: "Exames de Imagem",
    description: "Método de imagem de alta definição baseado em campo magnético que provê excelente visualização do parênquima cerebral, cerebelo, tronco encefálico e vascularização intracraniana. Padrão de ouro para detectar lesões desmielinizantes, microangiopatia vascular, tumores, AVC isquêmico/hemorrágico e malformações anatômicas.",
    mostCommonBrazil: false,
    aliases: ["ressonancia do cranio", "rm de cranio", "ressonancia magnetica cerebral", "ressonancia de cranio", "rm de encefalo", "ressonancia do cerebro"],
    labExamples: [
      { lab: "Fleury", label: "RESSONANCIA MAGNETICA DO CRANIO (ENCEFALO)" },
      { lab: "Delboni", label: "RM DE ENCEFALO COMPLETA" }
    ]
  },
  {
    canonicalName: "Tomografia Computadorizada de Tórax",
    category: "Exames de Imagem",
    description: "Exame de raios-X fatiados de alta velocidade assistido por computador. Permite uma reconstrução tridimensional detalhada do pulmão, brônquios, mediastino, vasos da base do coração e gradil costal. Essencial para avaliar nódulos pulmonares, pneumonia severa, bronquiectasias e enfisema.",
    mostCommonBrazil: true,
    aliases: ["tomografia de torax", "tc de torax", "tomografia computadorizada do torax", "tc de pulmao", "tomografia de pulmao"],
    labExamples: [
      { lab: "Fleury", label: "TOMOGRAFIA COMPUTADORIZADA DE TORAX" },
      { lab: "CDB", label: "TC DE TORAX DE ALTA RESOLUCAO" }
    ]
  },
  {
    canonicalName: "Raio-X de Tórax",
    category: "Exames de Imagem",
    description: "Radiografia convencional rápida do tórax em incidências padrão (geralmente PA e Perfil). Método de triagem inicial excelente para estimar silhueta cardíaca (índice cardiotorácico), transparência pulmonar, presença de derrames pleurais (líquido nos pulmões) e consolidações alveolares.",
    mostCommonBrazil: true,
    aliases: ["raio x de torax", "rx de torax", "radiografia de torax", "raio-x do torax", "rx torax"],
    labExamples: [
      { lab: "Fleury", label: "RADIOGRAFIA DE TORAX (PA E PERFIL)" },
      { lab: "CDB", label: "RAIO-X DE TORAX, 2 INCIDENCIAS" }
    ]
  },
  {
    canonicalName: "Mamografia Digital",
    category: "Exames de Imagem",
    description: "Radiologia digital especializada de baixa dose para as mamas nas posições crânio-caudal e médio-lateral oblíqua (incidências básicas). Permite a detecção precoce de microcalcificações suspeitas, distorções arquiteturais e nódulos mamários ocultos antes de serem palpáveis, classificados pelo sistema internacional BI-RADS.",
    mostCommonBrazil: true,
    aliases: ["mamografia", "mamografia digital", "mamografia de alta resolucao", "mmg digital"],
    labExamples: [
      { lab: "Fleury", label: "MAMOGRAFIA DIGITAL BILATERAL" },
      { lab: "CDB", label: "MAMOGRAFIA COM RECONSTRUCAO TRIDIMENSIONAL" }
    ]
  },
  {
    canonicalName: "Densitometria Óssea",
    category: "Exames de Imagem",
    description: "Analisa a quantidade de carga mineral de cálcio contida em pontos críticos de fratura (Coluna Lombar e Colo do Fêmur) usando raios de baixa energia (DEXA). Permite diagnosticar Osteopenia (-1.0 a -2.5 DP) ou Osteoporose (igual ou menor que -2.5 DP no T-Score).",
    mostCommonBrazil: true,
    aliases: ["densitometria ossea", "densitometria", "densitometria coluna e femur", "dexa", "densitometria de dupla energia"],
    labExamples: [
      { lab: "Fleury", label: "DENSITOMETRIA OSSEA DUO (COLUNA E FEMUR)" },
      { lab: "CDB", label: "DENSITOMETRIA OSSEA SEGMENTO COMPLETO" }
    ]
  },
  {
    canonicalName: "USG de Carótidas e Vertebrais com Doppler",
    category: "Exames de Imagem",
    description: "Ultrassonografia cervical focada no fluxo sanguíneo dinâmico das artérias carótidas e vertebrais. Permite medir com precisão o calibre interno, espessura íntima-média (marcador cardiovascular precoce) e rastrear a presença e repercussão hemodinâmica de placas de gordura (estenose).",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia de carotidas", "doppler de carotidas", "us de carotidas", "usg doppler de carotidas", "ultrassom de carotidas"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA DOPPLER DE CAROTIDAS E VERTEBRAIS" },
      { lab: "CDB", label: "DUPLO DOPPLER DE CAROTIDAS" }
    ]
  },
  {
    canonicalName: "Endoscopia Digestiva Alta",
    category: "Exames de Imagem",
    description: "Avaliação direta por imagem óptica por fibra de vídeo flexível da parede interna do Esôfago, Estômago e primeiras porções do Duodeno. Fundamental no diagnóstico e acompanhamento sob biópsia de refluxo gastresofágico (Esofagite), Hérnia de Hiato, Úlceras e inflamações severas (Gastrite de padrão erosivo, Bulboduodenite).",
    mostCommonBrazil: true,
    aliases: ["endoscopia", "endoscopia digestiva", "endoscopia digestiva alta", "eda", "videoendoscopia alta"],
    labExamples: [
      { lab: "Fleury", label: "ENDOSCOPIA DIGESTIVA ALTA COM PESQUISA DE H. PYLORI" },
      { lab: "CDB", label: "VIDEOENDOSCOPIA DIGESTIVA ALTA COM BIOPSIA" }
    ]
  },
  {
    canonicalName: "Colonoscopia",
    category: "Exames de Imagem",
    description: "Exame óptico de vídeo que percorre internamente toda a extensão do Intestino Grosso (Cólon) e porção terminal do Íleo. Padrão de ouro absoluto para triagem, prevenção e remoção precoce de apólices benignas (pólipos coloniais), além do diagnóstico de doenças inflamatórias intestinais (Retocolite, Doença de Crohn).",
    mostCommonBrazil: false,
    aliases: ["colonoscopia", "videocolonoscopia", "colonoscopia completa", "video colonoscopia"],
    labExamples: [
      { lab: "Fleury", label: "COLONOSCOPIA COMPLETA COM SEDACAO" },
      { lab: "CDB", label: "VIDEOCOLONOSCOPIA COMPLETA CONVENCIONAL" }
    ]
  },
  {
    canonicalName: "Ultrassonografia Pélvica Transvaginal",
    category: "Exames de Imagem",
    description: "Exame de imagem ginecológico de alta resolução por via vaginal que avalia detalhadamente o colo uterino, endométrio, miométrio e ovários. Indispensável para o diagnóstico e controle de miomas, adenomiose, cistos ovarianos, ovários policísticos, endometriose profunda e monitoramento inicial de gestação.",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia transvaginal", "ultrassom transvaginal", "usg transvaginal", "us transvaginal", "usg pelvica transvaginal", "ultrassonografia ginecologica transvaginal"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA PÉLVICA TRANSVAGINAL" },
      { lab: "CDB", label: "US TRANSVAGINAL DE ALTA RESOLUÇÃO" },
      { lab: "Delboni", label: "ULTRASSONOGRAFIA TRANSVAGINAL CONVENCIONAL" }
    ]
  },
  {
    canonicalName: "Ultrassonografia de Abdome Superior",
    category: "Exames de Imagem",
    description: "Avaliação dirigida por ultrassom que analisa órgãos do andar superior do abdome (fígado, vesícula biliar, vias biliares, pâncreas e baço). Focado em rastreamento célere de esteatose hepática, colelitíase (pedra na vesícula) e alterações pancreáticas agudas.",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia de abdome superior", "ultrassom abdome superior", "usg abdome superior", "us abdome superior", "ultrassonografia abdominal superior", "ultrassom hepatobiliar"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA DE ABDOME SUPERIOR" },
      { lab: "CDB", label: "US ABDOME SUPERIOR (VIAS BILIARES)" }
    ]
  },
  {
    canonicalName: "Ultrassonografia de Mamas",
    category: "Exames de Imagem",
    description: "Método complementar excelente de diagnóstico por imagem para diferenciação de nódulos mamários sólidos (fibradenomas, carcinoma) de lesões císticas preenchidas por líquido, além de guiar punções aspirativas e biópsias. Muito associado à Mamografia Digital em mamas de padrão denso.",
    mostCommonBrazil: true,
    aliases: ["ultrassonografia de mamas", "ultrassom de mama", "usg mamas", "us de mama", "ultrassonografia mamaria bilateral", "ultrassom de mama com doppler"],
    labExamples: [
      { lab: "Fleury", label: "ULTRASSONOGRAFIA DE MAMAS (BILATERAL)" },
      { lab: "Delboni", label: "USG MAMARIA COM DOPPLER" }
    ]
  },
  {
    canonicalName: "Tomografia Computadorizada de Abdome Total",
    category: "Exames de Imagem",
    description: "Exame de raios-X helicoidal acoplado a computador que reconstrói em três dimensões todo o compartimento intra-abdominal e pélvico. Frequentemente realizado com contraste iodado intravenoso para investigação detalhada de abdome agudo, neoplasias viscerais e linfonodopatias.",
    mostCommonBrazil: false,
    aliases: ["tomografia de abdome total", "tc de abdome", "tomografia computadorizada do abdome total", "tc abdome total", "tc abdominal de alta resolucao"],
    labExamples: [
      { lab: "Fleury", label: "TOMOGRAFIA COMPUTADORIZADA DE ABDOME TOTAL" },
      { lab: "Delboni", label: "TC ABDOME TOTAL COM E SEM CONTRASTE" }
    ]
  },
  {
    canonicalName: "Ressonância Magnética de Coluna Lombar",
    category: "Exames de Imagem",
    description: "Método de imagem de alta definição por ressonância magnética focado na região lombar e sacra. Proporciona contraste insuperável do parênquima para avaliação de discos intervertebrais (hérnias, extrusões), estenose de canal medular e compressões de nervos e raízes espinhais.",
    mostCommonBrazil: true,
    aliases: ["ressonancia de coluna lombar", "rm de coluna lombar", "ressonancia lombar", "rm cl", "ressonancia magnetica da coluna lombosacra", "rm lombossacra"],
    labExamples: [
      { lab: "Fleury", label: "RESSONANCIA MAGNETICA DE COLUNA LOMBAR" },
      { lab: "CDB", label: "RM DE COLUNA LOMBOSSACRA" }
    ]
  },
  {
    canonicalName: "Ressonância Magnética de Coluna Cervical",
    category: "Exames de Imagem",
    description: "Mapeamento minucioso do pescoço e transição crânio-cervical por ressonância, permitindo avaliar a medula espinhal alta, compressão discal cervical, mielopatia cervical e radiculopatias de membros superiores.",
    mostCommonBrazil: false,
    aliases: ["ressonancia de coluna cervical", "rm de coluna cervical", "ressonancia cervical", "rm cc", "ressonancia magnetica cervical", "rm da coluna cervical"],
    labExamples: [
      { lab: "Fleury", label: "RESSONANCIA MAGNETICA DE COLUNA CERVICAL" },
      { lab: "Delboni", label: "RM DE COLUNA CERVICAL COMPLETA" }
    ]
  },
  {
    canonicalName: "Ressonância Magnética de Joelho",
    category: "Exames de Imagem",
    description: "Exame ortopédico de eleição para avaliação de tecidos moles articulares do joelho. Permite diagnosticar rupturas parciais ou totais de ligamentos cruzados (LCA e LCP) e colaterais, lesões de menisco lateral e medial, condromalácia patelar e derrames articulares.",
    mostCommonBrazil: true,
    aliases: ["ressonancia de joelho", "rm de joelho", "ressonancia magnetica do joelho", "rm joelho direito", "rm joelho esquerdo"],
    labExamples: [
      { lab: "Fleury", label: "RESSONANCIA MAGNETICA DE JOELHO" },
      { lab: "CDB", label: "RM ARTICULACAO DO JOELHO" }
    ]
  },
  {
    canonicalName: "Holter 24 Horas",
    category: "Exames de Imagem",
    description: "Monitoramento ambulatorial contínuo do ritmo ou atividade elétrica do coração por meio de um pequeno gravador portátil preso à cintura por um período mínimo de 24 horas. Fundamental para detectar palpitações fugazes, taquicardias, episódios ocultos de fibrilação atrial e risco de morte súbita.",
    mostCommonBrazil: true,
    aliases: ["holter 24 horas", "holter", "eletrocardiografia dinamica 24 horas", "holter de 3 canais", "cardioholter", "holter cardiaco"],
    labExamples: [
      { lab: "Fleury", label: "ELETROCARDIOGRAFIA DINAMICA (HOLTER 24 HORAS)" },
      { lab: "Delboni", label: "HOLTER DE 24 HORAS - 3 CANAIS" },
      { lab: "a+", label: "ELETROCARDIOGRAMA DE REPOUSO CONTINUO (HOLTER)" }
    ]
  },
  {
    canonicalName: "M.A.P.A. (Monitorização Ambulatorial da Pressão Arterial)",
    category: "Exames de Imagem",
    description: "Registro automatizado das pressões sistólica e diastólica por 24 horas sob intervalos pré-programados enquanto o paciente realiza suas tarefas habituais e dorme. Padrão-ouro para diagnóstico de hipertensão limítrofe e identificação do ritmo de queda pressórica do sono (descenso fisiológico).",
    mostCommonBrazil: true,
    aliases: ["mapa", "m.a.p.a.", "monitorizacao ambulatorial da pressao arterial", "mapa 24 horas", "mapa de pressao arterial", "mapa pressao arterial de 24 horas"],
    labExamples: [
      { lab: "Fleury", label: "MONITORIZACAO AMBULATORIAL DA PRESSAO ARTERIAL (MAPA)" },
      { lab: "CDB", label: "M.A.P.A. DE 24 HORAS (DUAS VIAS)" }
    ]
  },
  {
    canonicalName: "Teste Ergométrico Computadorizado",
    category: "Exames de Imagem",
    description: "Acompanhamento dinâmico do comportamento dinâmico eletrocardiográfico e pressórico diante de sobrecarga gradual por atividade física orientada em esteira ou cicloergômetro. Ideal para triar isquemia coronariana latente induzida pelo exercício.",
    mostCommonBrazil: true,
    aliases: ["teste ergometrico", "teste de esforco", "teste ergometrico computadorizado", "teste de esteira", "eletrocardiograma de esforco"],
    labExamples: [
      { lab: "Fleury", label: "TESTE ERGOMETRICO COMPUTADORIZADO DE ESFORCO" },
      { lab: "CDB", label: "TESTE ERGOMETRICO EM ESTEIRA INCLINADA" }
    ]
  },
  {
    canonicalName: "Doppler Colorido de Membros Inferiores",
    category: "Exames de Imagem",
    description: "Estudo dinâmico das artérias ou veias das pernas por ultrassom e mapeamento de fluxo em cores. Crucial para confirmar a presença de trombose venosa profunda (TVP), insuficiência valvular venosa (varizes) ou obstruções críticas arteriais (claudicação intermitente).",
    mostCommonBrazil: true,
    aliases: ["doppler de membros inferiores", "ultrassom com doppler de membros inferiores", "doppler venoso membros inferiores", "doppler arterial pernas", "doppler bilateral pernas"],
    labExamples: [
      { lab: "Fleury", label: "DOPPLER COLORIDO VENOSO (OU ARTERIAL) DE MEMBROS INFERIORES" },
      { lab: "CDB", label: "US SANGUINEO CENTRAL COM DOPPLER DE MEMBROS INFERIORES" }
    ]
  },
  {
    canonicalName: "Radiografia de Coluna",
    category: "Exames de Imagem",
    description: "Raios-X de triagem esquelética rápida da coluna vertebral dividida por segmentos (Cervical, Torácico, Lombar ou Lombossacro). Permite mensurar desvios de postura (escoliose, lordose acentuada), bicos de papagaio (osteófitos) e diminuição do espaço discal geral.",
    mostCommonBrazil: true,
    aliases: ["raio x de coluna", "rx de coluna", "radiografia de coluna lombar", "rx cervical", "raio-x da coluna lombo sacra"],
    labExamples: [
      { lab: "Fleury", label: "RADIOGRAFIA DE COLUNA LOMBAR (OU CERVICAL/TORACICA)" },
      { lab: "Delboni", label: "RX COLUNA LOMBOSSACRA EM AP E PERFIL" }
    ]
  },
  {
    canonicalName: "Saturação de Transferrina",
    category: "Nutrientes",
    description: "Índice que estima a porcentagem de sítios de ligação da proteína transferrina ocupados pelo ferro circulante. Marcador de altíssima relevância no diagnóstico de anemias ferroprivas (quando baixa) ou hemocromatose hereditária (quando persistentemente elevada acima de 50%).",
    mostCommonBrazil: true,
    aliases: ["saturacao de transferrina", "indice de saturacao de transferrina", "saturacao da transferrina", "st"],
    labExamples: [
      { lab: "Fleury", label: "SATURACAO DE TRANSFERRINA, SANGUE" },
      { lab: "Delboni", label: "INDICE DE SATURACAO DA TRANSFERRINA" }
    ]
  },
  {
    canonicalName: "Capacidade Total de Ligação do Ferro (TIBC)",
    category: "Nutrientes",
    description: "Mede o quão disponível estão as proteínas do sangue para se ligarem ao ferro sérico. Costuma aumentar compensatoriamente para otimizar a absorção em estados de carência grave de ferro corporal.",
    mostCommonBrazil: false,
    aliases: ["tibc", "capacidade de ligacao do ferro", "ctlf", "capacidade total de combinacao de ferro"],
    labExamples: [
      { lab: "Fleury", label: "CAPACIDADE TOTAL DE LIGACAO DO FERRO (TIBC)" },
      { lab: "Lavoisier", label: "CAPACIDADE DE FIXACAO DE FERRO SANGUE" }
    ]
  },
  {
    canonicalName: "Urocultura com Antibiograma",
    category: "Rins",
    description: "Cultura microbiológica de urina de jato médio para isolamento biológico de microrganismos invasores específicos (como E. coli), acompanhado do teste de susceptibilidade a antimicrobianos (antibiograma) que informa a quais antibióticos a bactéria é resistente ou sensível.",
    mostCommonBrazil: true,
    aliases: ["urocultura", "cultura de urina", "exame de urocultura", "antibiograma urina", "urocultura com antibiograma", "esquema antibiograma urina"],
    labExamples: [
      { lab: "Fleury", label: "UROCULTURA COM TESTE DE SUSCEPTIBILIDADE" },
      { lab: "Delboni", label: "CULTURA DE URINA COM IDENTIFICACAO DE MICROBIOTA" },
      { lab: "CDB", label: "UROCULTURA SELETIVA COM CAS" }
    ]
  },
  {
    canonicalName: "Glicose Pós-Prandial",
    category: "Metabolismo",
    description: "Mede os níveis de glicose na circulação plasmática exatamente 2 horas após o início de uma refeição padronizada (geralmente almoço habitual ou carga de glicose). Avalia a eficácia dinâmica da secreção de insulina pós-carga.",
    mostCommonBrazil: true,
    aliases: ["glicose pos-prandial", "glicose pos prandial", "glicemia pos prandial", "glicemia pos-prandial", "glicose de 2h pos refeicao"],
    labExamples: [
      { lab: "Fleury", label: "GLICOSE POS-PRANDIAL, SANGUE" },
      { lab: "CDB", label: "GLICEMIA DE 2 HORAS (POS-PRANDIAL)" }
    ]
  },
  {
    canonicalName: "Curva Glicêmica (TOTG)",
    category: "Metabolismo",
    description: "Teste Oral de Tolerância à Glicose. Envolve a mensuração sequencial de glicose plasmática em intervalos (ex: 0, 30, 60 e 120 minutos) após a ingestão de uma solução supersaturada de glicose (dextrosol). Exame primordial na confirmação de diabetes gestacional.",
    mostCommonBrazil: true,
    aliases: ["curva glicemica", "totg", "teste oral de tolerancia a glicose", "curva glicêmica de 3 pontos", "glicose apos dextrosol"],
    labExamples: [
      { lab: "Fleury", label: "TESTE ORAL DE TOLERANCIA A GLICOSE - TOTG" },
      { lab: "Delboni", label: "CURVA GLICEMICA SANGUINEA (75G DE GLICOSE)" }
    ]
  },
  {
    canonicalName: "Bilirrubinas (Total e Frações)",
    category: "Fígado",
    description: "Mensuração de subprodutos abundantes do catabolismo do grupo heme de hemácias envelhecidas degradadas, divididos em Bilirrubina Direta (conjugada pelo fígado) e Bilirrubina Indireta (livre circulante). Essencial na investigação de icterícia, anemias hemolíticas e obstruções biliares.",
    mostCommonBrazil: true,
    aliases: ["bilirrubinas", "bilirrubina total e fracoes", "bilirrubina direta", "bilirrubina indireta", "bilirrubina total", "dosagem de bilirrubinas"],
    labExamples: [
      { lab: "Fleury", label: "BILIRRUBINAS (TOTAL E FRACOES) SANGUE" },
      { lab: "Delboni", label: "BILIRRUBINA COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "Beta HCG Quantitativo",
    category: "Hormônios",
    description: "Dosagem quantitativa da subunidade beta do hormônio Gonadotrofina Coriônica Humana circulante no soro sanguíneo. Permite detectar gravidez ativa com altíssima sensibilidade a partir de poucos dias pós-concepção, operando também no acompanhamento do desenvolvimento gestacional precoce.",
    mostCommonBrazil: true,
    aliases: ["beta hcg quantitativo", "beta hcg", "hcg quantitativo", "hcg total quantitativo", "exame de gravidez de sangue", "bhcg quantitativo"],
    labExamples: [
      { lab: "Fleury", label: "GONADOTROFINA CORIONICA HUMANA (BETA-HCG QUANTITATIVO)" },
      { lab: "CDB", label: "BETA HCG SANGUE SANGUINEO" },
      { lab: "Delboni", label: "BETA HCG QUANTITATIVO SERICO" }
    ]
  },
  {
    canonicalName: "Insulina Sérica",
    category: "Metabolismo",
    description: "Dosagem de Insulina basal produzida pelas células beta do pâncreas. Essencial no rastreamento de resistência à insulina precoce, hiperinsulinemia e no cálculo do índice HOMA-IR antes que ocorram alterações na glicose de jejum.",
    mostCommonBrazil: true,
    aliases: ["insulina", "insulina de jejum", "insulina basal", "insulina serica", "fasting insulin", "dosagem de insulina"],
    labExamples: [
      { lab: "Fleury", label: "INSULINA, DOSAGEM SERICA" },
      { lab: "CDB", label: "INSULINA DE JEJUM SANGUE" }
    ]
  },
  {
    canonicalName: "Prolactina Sérica",
    category: "Hormônios",
    description: "Hormônio secretado pela glândula hipófise anterior. Estimula a produção de leite durante a amamentação. Sua elevação fora do período gestacional/lactação (hiperprolactinaemia) pode sugerir adenomas hipofisários (prolactinomas), disfunções tireoidianas ou ser induzida por certos medicamentos, causando infertilidade, alterações menstruais ou galactorreia.",
    mostCommonBrazil: true,
    aliases: ["prolactina", "prolactina serica", "dosagem de prolactina", "prl"],
    labExamples: [
      { lab: "Fleury", label: "PROLACTINA, DOSAGEM SERICA" },
      { lab: "Delboni", label: "PROLACTINA COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "DHEA-S (Sulfato de Deidroepiandrosterona)",
    category: "Hormônios",
    description: "Hormônio androgênio produzido quase que exclusivamente pelas glândulas adrenais (suprarrenais). É o androgênio circulante mais abundante e serve como um excelente marcador da função adrenal e no rastreio de hirsutismo, acne severa, virilização feminina ou suspeita de Síndrome dos Ovários Policísticos (SOP).",
    mostCommonBrazil: false,
    aliases: ["dhea-s", "dheas", "sulfato de deidroepiandrosterona", "sulfato de dhea", "sdhea"],
    labExamples: [
      { lab: "Fleury", label: "SULFATO DE DEIDROEPIANDROSTERONA (DHEA-S)" },
      { lab: "Delboni", label: "SULFATO DE DEIDROEPIANDROSTERONA SANGUE" }
    ]
  },
  {
    canonicalName: "PTH (Paratormônio Intacto)",
    category: "Hormônios",
    description: "Hormônio produzido pelas glândulas paratireoides. Exerce papel primordial no controle homeostático do Cálcio e Fósforo nos ossos, rins e intestinos. Essencial para diferenciar causas de hipercalcemia e hipocalcemia e no acompanhamento de osteodistrofia renal ou distúrbios da tireoide/paratireoide.",
    mostCommonBrazil: true,
    aliases: ["pth", "paratormonio", "paratormonio intacto", "pth intacto", "dosagem de pth", "pth serico"],
    labExamples: [
      { lab: "Fleury", label: "PARATORMONIO INTACTO (PTH), DOSAGEM" },
      { lab: "Delboni", label: "PARATORMONIO - PTH SANGUE" }
    ]
  },
  {
    canonicalName: "Homocisteína Plasmática",
    category: "Autoimunidade",
    description: "Aminoácido intermediário no ciclo de metilação celular. Níveis persistentemente elevados de Homocisteína correlacionam-se com maior risco de aterosclerose, trombose venosa profunda e infarto, sendo frequentemente causados por deficiência de ácido fólico (B9) ou vitamina B12 (metilcobalamina).",
    mostCommonBrazil: false,
    aliases: ["homocisteina", "homocisteina plasmatica", "homocysteine", "homocisteina serica"],
    labExamples: [
      { lab: "Fleury", label: "HOMOCISTEINA, DOSAGEM PLASMATICA" },
      { lab: "Delboni", label: "HOMOCISTEINA SANGUE" }
    ]
  },
  {
    canonicalName: "Cortisol Salivar",
    category: "Hormônios",
    description: "Dosagem rápida de cortisol livre e biologicamente ativo na saliva em períodos determinados (ex: manhã, tarde ou noite). Exame padrão de excelência para avaliar a rítmica circadiana da glândula adrenal e triagem de estresse crônico (hipocortisolismo ou hipercortisolismo/Síndrome de Cushing).",
    mostCommonBrazil: false,
    aliases: ["cortisol salivar", "cortisol na saliva", "dosagem de cortisol salivar", "cortisol ritmico salivar"],
    labExamples: [
      { lab: "Fleury", label: "CORTISOL SALIVAR, DOSAGEM" },
      { lab: "Delboni", label: "CORTISOL NA SALIVA (MATUTINO/VESPERTINO)" }
    ]
  },
  {
    canonicalName: "Peptídeo C",
    category: "Metabolismo",
    description: "Dosagem do Peptídeo C, um subproduto direto da clivagem da proinsulina. Ao contrário da insulina, ele não sofre metabolização hepática de primeira passagem de forma expressiva, servindo como estimativa mais fidedigna e estável da secreção de insulina endógena real e na diferenciação de diabetes tipo 1 e tipo 2.",
    mostCommonBrazil: true,
    aliases: ["peptideo c", "peptideo-c", "c-peptide", "dosagem de peptideo c"],
    labExamples: [
      { lab: "Fleury", label: "PEPTIDEO C, DOSAGEM SERICA" },
      { lab: "Delboni", label: "PEPTIDEO-C SANGUE" }
    ]
  },
  {
    canonicalName: "IGF-1 (Somatomedina C)",
    category: "Hormônios",
    description: "Fator de Crescimento Semelhante à Insulina Tipo 1 (Somatomedina C), produzido principalmente pelo fígado sob estímulo direto do GH (Hormônio do Crescimento). Funciona como o principal biomarcador para diagnosticar e monitorar acromegalia, gigantismo ou deficiências de GH.",
    mostCommonBrazil: true,
    aliases: ["igf-1", "igf1", "somatomedina c", "somatomedina", "insulin-like growth factor 1"],
    labExamples: [
      { lab: "Fleury", label: "SOMATOMEDINA C (IGF-1)" },
      { lab: "CDB", label: "FATOR DE CRESCIMENTO SEMELHANTE A INSULINA 1" }
    ]
  },
  {
    canonicalName: "Aldosterona Sérica",
    category: "Hormônios",
    description: "Hormônio esteroide mineralocorticoide sintetizado na zona glomerulosa da córtex adrenal. Regula o equilíbrio hidroeletrolítico por meio da reabsorção renal de sódio e secreção de potássio, sendo crucial na triagem de hipertensão refratária secundária a hiperaldosteronismo.",
    mostCommonBrazil: false,
    aliases: ["aldosterona", "aldosterona serica", "dosagem de aldosterona", "aldosterone"],
    labExamples: [
      { lab: "Fleury", label: "ALDOSTERONA, DOSAGEM SERICA" },
      { lab: "Delboni", label: "ALDOSTERONA SANGUE" }
    ]
  },
  {
    canonicalName: "Atividade de Renina Plasmática (ARP)",
    category: "Hormônios",
    description: "Mede o ritmo de conversão microbiológica de angiotensinogênio em angiotensina I, servindo como indicador indireto da liberação de renina pelo aparelho justa-glomerular. Essencial no cálculo da relação Aldosterona/Renina (ARR) para detectar hiperaldosteronismo primário.",
    mostCommonBrazil: false,
    aliases: ["renina", "renina plasmatica", "atividade de renina plasmatica", "arp", "atividade da renina"],
    labExamples: [
      { lab: "Fleury", label: "RENINA, ATIVIDADE PLASMATICA" },
      { lab: "Delboni", label: "ATIVIDADE DE RENINA PLASMATICA" }
    ]
  },
  {
    canonicalName: "Eletroforese de Proteínas",
    category: "Metabolismo",
    description: "Separa as proteínas do soro sanguíneo em frações distintas (Albumina, Alfa-1, Alfa-2, Beta e Gama). Primordial para diagnosticar picos monoclonais (gamopatias monoclonais como o Mieloma Múltiplo), processos inflamatórios severos ou perda excessiva de imunoglobulinas.",
    mostCommonBrazil: true,
    aliases: ["eletroforese de proteinas", "eletroforese de proteinas sericas", "proteinas sericas eletroforese", "eletroforese de proteinas no sangue"],
    labExamples: [
      { lab: "Fleury", label: "ELETROFORESE DE PROTEINAS, DOSAGEM SERICA" },
      { lab: "CDB", label: "ELETROFORESE DE PROTEINAS SANGUE" }
    ]
  },
  {
    canonicalName: "Gasometria Arterial",
    category: "Metabolismo",
    description: "Mapeamento rápido e de alta precisão do equilíbrio metabólico e ácido-base sistêmico, avaliando pH sanguíneo arterial, pressão parcial de oxigênio (pO2), pressão parcial de gás carbônico (pCO2), bicarbonato (HCO3-), excesso de bases (BE) e saturação final de oxigênio.",
    mostCommonBrazil: true,
    aliases: ["gasometria arterial", "gasometria", "gasp", "gasometria de sangue arterial"],
    labExamples: [
      { lab: "Fleury", label: "GASOMETRIA ARTERIAL, SELECAO" },
      { lab: "Delboni", label: "GASOMETRIA SANGUE ARTERIAL" }
    ]
  },
  {
    canonicalName: "Gasometria Venosa",
    category: "Metabolismo",
    description: "Avaliação do status ácido-base através de sangue venoso periférico, útil para triagem rápida de acidose metabólica grave e estimativa indireta do teor de bicarbonato sistêmico sem a necessidade de punção arterial dolorosa.",
    mostCommonBrazil: false,
    aliases: ["gasometria venosa", "gasometria de sangue venoso"],
    labExamples: [
      { lab: "Fleury", label: "GASOMETRIA VENOSA SANGUE" },
      { lab: "Delboni", label: "GASOMETRIA VENOSA COMPLETA" }
    ]
  },
  {
    canonicalName: "Fator Reumatoide (FR)",
    category: "Autoimunidade",
    description: "Autoanticorpo (geralmente da classe IgM) dirigido contra a porção Fc de imunoglobulinas da classe IgG. Exame clássico de rastreamento para investigação diagnóstica de artrite reumatoide, embora também possa positivar em outras enfermidades autoimunes e infecciosas.",
    mostCommonBrazil: true,
    aliases: ["fator reumatoide", "fr", "fator reumatoide latex", "prova do latex", "dosagem de fator reumatoide"],
    labExamples: [
      { lab: "Fleury", label: "FATOR REUMATOIDE (PROVA DO LATEX), SANGUE" },
      { lab: "CDB", label: "FATOR REUMATOIDE SANGUE" }
    ]
  },
  {
    canonicalName: "Anti-CCP (Anticorpos Anti-Peptídeo Citrulinado Cíclico)",
    category: "Autoimunidade",
    description: "Marcador de altíssima especificidade diagnóstica (superior a 95%) para o diagnóstico precoce e prognóstico clínico da Artrite Reumatoide (AR), auxiliando na diferenciação diagnóstica de outras sinovites agudas.",
    mostCommonBrazil: false,
    aliases: ["anti ccp", "anti-ccp", "anticorpos anti-ccp", "anticorpo anti peptideo citrulinado ciclico"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-PEPTIDEO CITRULINADO CICLICO (ANTI-CCP)" },
      { lab: "Delboni", label: "ANTI CCP ANTICORPOS" }
    ]
  },
  {
    canonicalName: "Apolipoproteína A-1 (Apo A-1)",
    category: "Metabolismo",
    description: "Proteína estrutural primordial das partículas que compõem os complexos de HDL (Colesterol bom), exercendo papel principal na mediação ativa do efluxo de colesterol livre celular por transporte reverso de lípidos de volta para descarte hepático.",
    mostCommonBrazil: false,
    aliases: ["apo a-1", "apolipoproteina a1", "apo a1", "apolipoproteina a-1", "apo-a1"],
    labExamples: [
      { lab: "Fleury", label: "APOLIPOPROTEINA A-1 (APO A-1)" },
      { lab: "Delboni", label: "APOLIPOPROTEINA A-1 SANGUE" }
    ]
  },
  {
    canonicalName: "Apolipoproteína B (Apo B)",
    category: "Metabolismo",
    description: "Subunidade proteica estrutural fundamental presente em todas as partículas lipoproteicas aterogênicas não-HDL (LDL, VLDL, IDL). Oferece um reflexo muito fiel do número real absoluto de partículas aterogênicas na circulação para estimativa rigorosa de risco coronariano residual.",
    mostCommonBrazil: false,
    aliases: ["apo b", "apolipoproteina b", "apo-b", "dosagem de apolipoproteina b"],
    labExamples: [
      { lab: "Fleury", label: "APOLIPOPROTEINA B (APO B)" },
      { lab: "Delboni", label: "APOLIPOPROTEINA B SANGUE" }
    ]
  },
  {
    canonicalName: "Tempo de Protrombina (TP / TAP)",
    category: "Sangue",
    description: "Avalia a via extrínseca e comum da cascata de coagulação. Frequentemente relatado como INR (RNI) e atividade de protrombina (TAP). Essencial para o monitoramento de terapia com anticoagulantes orais (como varfarina) e avaliação de função hepática sintética.",
    mostCommonBrazil: true,
    aliases: ["tp", "tap", "tempo de protrombina", "atividade de protrombina", "rni", "inr", "tempo de atividade de protrombina"],
    labExamples: [
      { lab: "Fleury", label: "TEMPO DE PROTROMBINA (TP), PLASMATICO" },
      { lab: "Delboni", label: "TAP - TEMPO E ATIVIDADE DE PROTROMBINA" }
    ]
  },
  {
    canonicalName: "Tempo de Tromboplastina Parcial Ativada (TTPA)",
    category: "Sangue",
    description: "Avalia a via intrínseca e comum da coagulação. Crucial no acompanhamento de terapia com heparina não fracionada, investigação de sangramentos inexplicados, distúrbios genéticos (como hemofilias) ou presença de inibidores como o anticoagulante lúpico.",
    mostCommonBrazil: true,
    aliases: ["ttpa", "ptt", "tempo de tromboplastina parcial ativada", "tempo de tromboplastina parcial", "ktt"],
    labExamples: [
      { lab: "Fleury", label: "TEMPO DE TROMBOPLASTINA PARCIAL ATIVADA (TTPA)" },
      { lab: "CDB", label: "TTPA COMPLETO PLASMATICO" }
    ]
  },
  {
    canonicalName: "Pesquisa de Sangue Oculto nas Fezes",
    category: "Gastroenterologia",
    description: "Pesquisa por métodos imunológicos altamente sensíveis (sem necessidade de dieta restritiva) ou químicos para detectar micro-sangramentos no trato gastrintestinal. É um dos principais exames de triagem preventiva para o câncer colorretal e lesões pré-cancerosas (pólipos).",
    mostCommonBrazil: true,
    aliases: ["sangue oculto", "sangue oculto nas fezes", "pesquisa de sangue oculto", "sangue oculto fezes", "pso"],
    labExamples: [
      { lab: "Fleury", label: "SANGUE OCULTO NAS FEZES, PESQUISA" },
      { lab: "Delboni", label: "SANGUE OCULTO, FEZES AMOSTRA" }
    ]
  },
  {
    canonicalName: "Parasitológico de Fezes (EPF)",
    category: "Gastroenterologia",
    description: "Exame parasitológico de fezes para pesquisa microscópica de ovos, cistos, larvas ou trofozoítos de helmintos e protozoários intestinais (como amebas, giárdia, lombrigas, etc.). Essencial para investigar diarreia crônica, dor abdominal difusa e anemias por má-absorção.",
    mostCommonBrazil: true,
    aliases: ["epf", "parasitologico", "parasitologico de fezes", "exame parasitologico", "parasitologico fezes", "pesquisa de parasitas"],
    labExamples: [
      { lab: "Fleury", label: "PARASITOLOGICO DE FEZES" },
      { lab: "CDB", label: "EXAME PARASITOLOGICO DE FEZES (EPF)" }
    ]
  },
  {
    canonicalName: "VDRL (Sorologia para Sífilis)",
    category: "Infectologia",
    description: "Exame não treponêmico de triagem sorológica para detecção de anticorpos circulantes contra a bactéria Treponema pallidum, causadora da sífilis. Permite rastreio populacional, diagnóstico e acompanhamento de resposta terapêutica através do título quantitativo de diluição.",
    mostCommonBrazil: true,
    aliases: ["vdrl", "vdrl quantitativo", "sorologia para sifilis", "vdrl serico", "sifilis vdrl"],
    labExamples: [
      { lab: "Fleury", label: "VDRL, REACAO SOROLOGICA" },
      { lab: "Delboni", label: "VDRL - PESQUISA E TITULACAO" }
    ]
  },
  {
    canonicalName: "Sorologia para HIV (HIV 1 e 2)",
    category: "Infectologia",
    description: "Detecção combinada de anticorpos conta os vírus HIV-1 e HIV-2 e do antígeno p24 do capsídeo viral (teste de 4ª geração) no soro. Fornece diagnóstico precoce extremamente seguro para a infecção pelo vírus da imunodeficiência humana.",
    mostCommonBrazil: true,
    aliases: ["hiv", "anti-hiv", "sorologia hiv", "anti hiv 1 e 2", "pesquisa de hiv", "hiv 1 2"],
    labExamples: [
      { lab: "Fleury", label: "H.I.V., ANTICORPOS ANTI-HIV 1 E 2" },
      { lab: "Lavoisier", label: "HIV DE ROTINA (QUARTA GERACAO)" }
    ]
  },
  {
    canonicalName: "HBsAg (Antígeno de Superfície do Vírus da Hepatite B)",
    category: "Infectologia",
    description: "Detecção do Antígeno de Superfície do vírus da Hepatite B (também historicamente conhecido como Antígeno Austrália). Sua presença indica infecção ativa (aguda ou crônica) pelo vírus HBV. Principal marcador no rastreamento e saúde ocupacional.",
    mostCommonBrazil: true,
    aliases: ["hbsag", "antigeno australia", "antigeno da hepatite b", "anti hbsag", "hepatite b hbsag"],
    labExamples: [
      { lab: "Fleury", label: "HEPATITE B - HBsAg" },
      { lab: "CDB", label: "ANTIGENO DE SUPERFICIE HEPATITE B (HBsAg)" }
    ]
  },
  {
    canonicalName: "Toxoplasmose IgG e IgM",
    category: "Infectologia",
    description: "Pesquisa de anticorpos das classes IgG (infecção antiga/imunidade) e IgM (sugestivo de infecção aguda ou recente) contra o parasita Toxoplasma gondii. De fundamental e obrigatório rastreamento pré-natal em gestantes susceptíveis devido ao risco de toxoplasmose congênita.",
    mostCommonBrazil: true,
    aliases: ["toxoplasmose", "toxo igg", "toxo igm", "sorologia toxoplasmose", "toxoplasmose igg e igm"],
    labExamples: [
      { lab: "Fleury", label: "TOXOPLASMOSE - ANTICORPOS IgG E IgM" },
      { lab: "Delboni", label: "TOXOPLASMOSE IgG / IgM COMPLETA" }
    ]
  },
  {
    canonicalName: "Eletroforese de Hemoglobina",
    category: "Sangue",
    description: "Método que separa e quantifica as diferentes frações de hemoglobina no sangue (Hb A1, Hb A2, Hb Fetal e formas anômalas como Hb S, Hb C, Hb D). Exame crucial para diagnóstico de hemoglobinopatias, anemias falciformes e traços talassêmicos.",
    mostCommonBrazil: true,
    aliases: ["eletroforese de hemoglobina", "eletroforese de hg", "hemoglobinopatias eletroforese", "hb eletroforese"],
    labExamples: [
      { lab: "Fleury", label: "ELETROFORESE DE HEMOGLOBINA, SELECAO" },
      { lab: "Delboni", label: "ELETROFORESE DE HEMOGLOBINA SANGUE" }
    ]
  },
  {
    canonicalName: "Subpopulações de Linfócitos T (CD3, CD4 e CD8)",
    category: "Sangue",
    description: "Quantificação e relação entre as subpopulações de linfócitos T auxiliares (CD4+) e citotóxicos (CD8+). Essencial para avaliar a integridade e status da imunidade celular de forma quantitativa, monitorar pacientes vivendo com HIV/AIDS e investigar imunodeficiências primárias.",
    mostCommonBrazil: true,
    aliases: ["cd4", "cd8", "cd3 cd4 cd8", "linfocitos t cd4 e cd8", "subpopulacao linfocitaria", "relacao cd4 cd8"],
    labExamples: [
      { lab: "Fleury", label: "SUBPOPULACOES DE LINFOCITOS T (CD3, CD4 E CD8)" },
      { lab: "Delboni", label: "CONTAGEM DE LINFOCITOS CD4+ E CD8+, SANGUE" }
    ]
  },
  {
    canonicalName: "Ácido Valproico Sérico",
    category: "Toxicologia",
    description: "Dosagem sérica do Ácido Valproico (ou Valproato de Sódio), um fármaco antiepiléptico e estabilizador de humor amplamente utilizado no transtorno bipolar e crises convulsivas. Permite o ajuste posológico milimétrico para manter o paciente no intervalo terapêutico eficaz (50 a 100 mcg/mL).",
    mostCommonBrazil: false,
    aliases: ["acido valproico", "valproato de sodio", "dosagem de acido valproico", "depakene", "depakote"],
    labExamples: [
      { lab: "Fleury", label: "ACIDO VALPROICO, DOSAGEM SERICA" },
      { lab: "Delboni", label: "ACIDO VALPROICO SANGUE" }
    ]
  },
  {
    canonicalName: "Carbamazepina Sérica",
    category: "Toxicologia",
    description: "Dosagem terapêutica de Carbamazepina no sangue. Utilizada como anticonvulsivante em crises e estresse neurálgico (como neuralgia do trigêmeo) e como estabilizador de humor. Janela terapêutica estrita de 4 a 12 mcg/mL.",
    mostCommonBrazil: false,
    aliases: ["carbamazepina", "dosagem de carbamazepina", "tegretol"],
    labExamples: [
      { lab: "Fleury", label: "CARBAMAZEPINA, DOSAGEM SERICA" }
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Peroxidase Tireoidiana (Anti-TPO)",
    category: "Tireoide",
    description: "Principal autoanticorpo direcionado contra a enzima peroxidase tireoidiana. É o marcador padrão e de altíssima relevância no diagnóstico de tireoidite autoimune (Tireoidite de Hashimoto) e na avaliação prévia de risco de progressão para hipotireoidismo clínico.",
    mostCommonBrazil: true,
    aliases: ["anti-tpo", "antitpo", "anti tpo", "anticorpos anti peroxidase", "anticorpo anti-peroxidase tireoidiana"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-PEROXIDASE TIREOIDIANA (ANTI-TPO)" },
      { lab: "Delboni", label: "ANTI-TPO ANTICORPOS SANGUE" }
    ],
    optimalRange: "Não Reagente (ou menor que 34 UI/mL)",
    symptomsHigh: "Fadiga inexplicável extrema, bócio (inchaço no pescoço), dores musculares, perda de memória recente, névoa mental (brain fog).",
    symptomsLow: "Resultados baixos ou indetectáveis são saudáveis e indicam ausência de ataque autoimune ativo contra o tecido da tireoide.",
    recommendations: [
      "Adotar estrategicamente uma dieta anti-inflamatória isenta de glúten e laticínios sob supervisão",
      "Controlar ativamente estressores físicos e emocionais cotidianos",
      "Suplementar sob prescrição médica antioxidantes como Selênio e Coenzima Q10 que diminuem a agressão imunológica"
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Tireoglobulina (Anti-Tg)",
    category: "Tireoide",
    description: "Autoanticorpo dirigido contra a tireoglobulina, principal glicoproteína de armazenamento de hormônios tireoidianos. Concomitante com o Anti-TPO na identificação de doenças autoimunes da tireoide e fundamental pós-tireoidectomia para validação da utilidade da dosagem de tireoglobulina como marcador tumoral.",
    mostCommonBrazil: true,
    aliases: ["anti-tg", "antitg", "anti tg", "anticorpos anti tireoglobulina"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-TIREOGLOBULINA (ANTI-TG)" },
      { lab: "Delboni", label: "ANTI-TIREOGLOBULINA COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "Albumina Sérica",
    category: "Metabolismo",
    description: "Proteína mais abundante do plasma, sintetizada unicamente pelo fígado. É primária no controle de carência nutricional, manutenção da pressão oncótica microvascular (evitando edemas) e atua no transporte plasmático de dezenas de hormônios e medicamentos.",
    mostCommonBrazil: true,
    aliases: ["albumina", "albumina serica", "dosagem de albumina", "albumina no sangue"],
    labExamples: [
      { lab: "Fleury", label: "ALBUMINA, DOSAGEM SERICA" },
      { lab: "Lavoisier", label: "ALBUMINA SANGUE" }
    ]
  },
  {
    canonicalName: "ASLO (Antiestreptolisina O)",
    category: "Autoimunidade",
    description: "Mede os anticorpos contra a estreptolisina O, toxina produzida pela bactéria Streptococcus pyogenes (Estreptococo do grupo A). Essencial no diagnóstico retrospectivo de infecções estreptocócicas recentes para monitoração de risco de Febre Reumática ou Glomerulonefrite Pós-Estreptocócica (GNPE).",
    mostCommonBrazil: true,
    aliases: ["aslo", "antiestreptolisina", "antiestreptolisina o", "aso", "anti-estreptolisina o"],
    labExamples: [
      { lab: "Fleury", label: "ANTIESTREPTOLISINA O (ASLO), DETERMINACAO" },
      { lab: "CDB", label: "ANTIESTREPTOLISINA O (ASLO) QUALITATIVA/QUANTITATIVA" }
    ]
  },
  {
    canonicalName: "Lactato Sérico (Ácido Lático)",
    category: "Metabolismo",
    description: "Subproduto do metabolismo anaeróbico da glicose. Níveis elevados de lactato indicam hipóxia tecidual (falta de oxigênio), sendo marcador fundamental em medicina de emergência, sepse, choque e desidratação celular grave.",
    mostCommonBrazil: false,
    aliases: ["lactato", "lactato serico", "acido latico", "lactate", "lactatemia"],
    labExamples: [
      { lab: "Fleury", label: "LACTATO (ACIDO LATICO), DOSAGEM SERICA" },
      { lab: "CDB", label: "LACTATO SANGUE ENZIMATICO" }
    ]
  },
  {
    canonicalName: "Sorologia para Hepatite C (Anti-HCV)",
    category: "Infectologia",
    description: "Pesquisa de anticorpos específicos da classe IgG dirigidos contra o vírus da Hepatite C (HCV). Sua positividade acusa contato prévio ou infecção ativa cronificada, exigindo confirmação por biologia molecular (carga viral HCV-RNA).",
    mostCommonBrazil: true,
    aliases: ["anti-hcv", "antihcv", "anti hcv", "sorologia hepatite c", "pesquisa de hepatite c"],
    labExamples: [
      { lab: "Fleury", label: "HEPATITE C - SOROLOGIA (ANTI-HCV)" },
      { lab: "Delboni", label: "ANTICORPOS ANTI-HCV COMPLETA SANGUE" }
    ]
  },
  {
    canonicalName: "Citopatológico Cérvico-Vaginal (Papanicolau)",
    category: "Saúde Feminina",
    description: "Exame citológico preventivo clássico de raspado cervical que rastreia alterações inflamatórias, microbiológicas (como Candida, Gardenella) e, primordialmente, displasias celulares e lesões pré-neoplásicas ligadas ao Papilomavírus Humano (HPV).",
    mostCommonBrazil: true,
    aliases: ["papanicolau", "preventivo cervical", "colpocitologia", "citopatologico cervico vaginal", "citopatologico", "exame preventivo"],
    labExamples: [
      { lab: "Fleury", label: "COLPOCITOLOGIA CLINICA GINECOLOGICA PREVENTIVA" },
      { lab: "Delboni", label: "CITOLOGIA ONCOTICA CERVICO VAGINAL - PAPANICOLAU" }
    ]
  },
  {
    canonicalName: "Fator Antinuclear (FAN) / Auto-anticorpos",
    category: "Autoimunidade",
    description: "Pesquisa de anticorpos voltados contra o núcleo das próprias células. Padrão-ouro para rastrear a presença de doenças reumatológicas e autoimunes sistêmicas, como o Lúpus Eritematoso Sistêmico (LES).",
    mostCommonBrazil: true,
    aliases: ["fan", "fator antinuclear", "pesquisa de autoanticorpos", "anticorpos antinucleares", "he2", "anticorpos contra nucleo", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "PESQUISA DE AUTO-ANTICORPOS (FAN)" },
      { lab: "CDB", label: "FATOR ANTINUCLEAR (FAN) HEp-2" }
    ],
    optimalRange: "Não Reagente (ou Reagente em títulos isolados baixos de 1:80 sem clínica ativa)",
    symptomsHigh: "Dores articulares migratórias, febre crônica baixa intermitente, rash cutâneo característico em asa de borboleta, fotossensibilidade severa, fadiga extrema.",
    symptomsLow: "Ausência completa de autoanticorpos circulantes induzindo imunocompetência básica.",
    recommendations: [
      "Consultar reumatologista de confiança para correlação sindrômica, pois o FAN isolado positivo não constitui diagnóstico clínico",
      "Evitar exposição solar excessiva ou desprotegida (a radiação ultravioleta pode induzir lise de queratinócitos e expor antígenos nucleares)",
      "Acompanhar periodicamente a estabilidade ou flutuação quantitativa do título de diluição"
    ]
  },
  {
    canonicalName: "FAN - Nuclear",
    category: "Autoimunidade",
    description: "Mede especificamente a presença e o padrão de anticorpos que atacam estruturas no núcleo das células (como DNA e proteínas solúveis). O achado Reagente pontilhado fino ou denso com titulação (ex: até 1/640) é clinicamente relevante.",
    mostCommonBrazil: true,
    aliases: ["fan nuclear", "fator antinuclear nuclear"],
    labExamples: [
      { lab: "Fleury", label: "FAN - Nuclear" }
    ],
    optimalRange: "Não Reagente",
    symptomsHigh: "Dores corporais, sensibilidade ao sol, fadiga e rigidez articular.",
    symptomsLow: "Não aplicável (Não Reagente é o padrão saudável)",
    recommendations: [
      "Se reagente em títulos altos (ex: ≥ 1/160), consulte um reumatologista para investigação clínica minuciosa",
      "Cruze o resultado com sintomas físicos específicos"
    ]
  },
  {
    canonicalName: "FAN - Nucleolar",
    category: "Autoimunidade",
    description: "Investiga anticorpos direcionados contra o nucléolo celular, responsável pela produção de ribossomos. Padrões reagentes aqui têm forte associação clássica com a Esclerodermia (Esclerose Sistêmica).",
    mostCommonBrazil: true,
    aliases: ["fan nucleolar", "fator antinuclear nucleolar"],
    labExamples: [
      { lab: "Fleury", label: "FAN - Nucleolar" }
    ],
    optimalRange: "Não Reagente",
    symptomsHigh: "Espessamento da pele das mãos/face, dificuldade de deglutição, fenômeno de Raynaud.",
    symptomsLow: "Não aplicável",
    recommendations: [
      "Acompanhe o fenômeno de Raynaud (mãos que mudam de cor com frio ou estresse)",
      "Realize exames capilaroscópicos se houver suspeita clínica"
    ]
  },
  {
    canonicalName: "FAN - Citoplasmático",
    category: "Autoimunidade",
    description: "Pesquisa reações autoimunes voltadas contra compostos e organelas suspensas no citoplasma celular, como as mitocôndrias ou os ribossomos. Associados a miopatias ou quadros biliares.",
    mostCommonBrazil: true,
    aliases: ["fan citoplasmatico", "fator antinuclear citoplasmatico"],
    labExamples: [
      { lab: "Fleury", label: "FAN - Citoplasmático" }
    ],
    optimalRange: "Não Reagente",
    symptomsHigh: "Fraqueza muscular proximal, elevação de enzimas do fígado ou das vias biliares.",
    symptomsLow: "Não aplicável",
    recommendations: [
      "Correlacionar com dosagens de Creatina Quinase (CPK) e enzimas hepáticas se reagente"
    ]
  },
  {
    canonicalName: "FAN - Aparelho Mitótico",
    category: "Autoimunidade",
    description: "Raríssima pesquisa de autoanticorpos que atacam as estruturas físicas e os microtúbulos envolvidos na divisão mitótica das células.",
    mostCommonBrazil: true,
    aliases: ["fan aparelho mitotico", "fator antinuclear aparelho mitotico"],
    labExamples: [
      { lab: "Fleury", label: "FAN - Aparelho Mitótico" }
    ],
    optimalRange: "Não Reagente",
    symptomsHigh: "Sintomatologia inespecífica de reumatologia ou do tecido conjuntivo.",
    symptomsLow: "Não aplicável",
    recommendations: [
      "Resultados isolados costumam ter baixa correlação patológica específica, necessitando avaliação de todo o painel de anticorpos"
    ]
  },
  {
    canonicalName: "FAN - Placa Cromossômica Metafásica",
    category: "Autoimunidade",
    description: "Identifica anticorpos direcionados contra cromossomos condensados na fase metafásica. Reagentes neste teste sugerem autoanticorpos anti-centrômero característicos ou anti-DNA.",
    mostCommonBrazil: true,
    aliases: ["fan placa cromossomica metafasica", "fator antinuclear placa cromossomica metafasica"],
    labExamples: [
      { lab: "Fleury", label: "FAN - Placa Cromossômica Metafásica" }
    ],
    optimalRange: "Não Reagente",
    symptomsHigh: "Calcinose, esclerodactilia, distúrbios de circulação distal periférica.",
    symptomsLow: "Não aplicável",
    recommendations: [
      "Complementar com a dosagem de anticorpo anti-centrômero se o resultado for reagente com padrão compatível"
    ]
  },
  {
    canonicalName: "Anticorpo Anti-DNA Dupla Hélice (dsDNA)",
    category: "Autoimunidade",
    description: "Marcador autoimune altamente específico para o Lúpus Eritematoso Sistêmico (LES). Fundamental para o diagnóstico e também para medir a atividade da doença inflamatória contínua, em especial o acometimento renal (nefrite lúpica).",
    mostCommonBrazil: false,
    aliases: ["anti dna", "anti-dna", "anti dna dupla helice", "dsdna", "anti-dsdna", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-DNA DUPLA HELICE" },
      { lab: "Delboni", label: "ANTI DNA NATIVO (DUPLA HELICE)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Sm",
    category: "Autoimunidade",
    description: "Anticorpo direcionado contra proteínas do núcleo. Apresenta elevadíssima especificidade para o Lúpus Eritematoso Sistêmico (LES), sendo um dos critérios diagnósticos fundamentais da doença.",
    mostCommonBrazil: false,
    aliases: ["anti sm", "anti-sm", "anti smith", "antism", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-SM" },
      { lab: "Lavoisier", label: "ANTI SM, SORO" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Ro (SSA)",
    category: "Autoimunidade",
    description: "Anticorpo comum em doenças reumatológicas. É classicamente associado à Síndrome de Sjögren e Lúpus (incluindo lúpus neonatal). Responsável, em gestantes, por bloqueio atrioventricular congênito no feto.",
    mostCommonBrazil: false,
    aliases: ["anti ro", "anti-ro", "anti ssa", "anti-ssa", "ssa", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-RO (SSA)" },
      { lab: "Delboni", label: "ANTI SSA / RO" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-La (SSB)",
    category: "Autoimunidade",
    description: "Anticorpo autoimune. Quase sempre encontrado de forma associada ao fator Anti-Ro. Auxilia o refinamento diagnóstico clínico de Lúpus e Síndrome de Sjögren primária.",
    mostCommonBrazil: false,
    aliases: ["anti la", "anti-la", "anti ssb", "anti-ssb", "ssb", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-LA (SSB)" },
      { lab: "Lavoisier", label: "ANTI SSB / LA" }
    ]
  },
  {
    canonicalName: "Anticoagulante Lúpico",
    category: "Sangue",
    description: "Imunoglobulina que interfere paradoxalmente na cascata de coagulação in vitro. Usado para o diagnóstico de Síndrome do Anticorpo Antifosfolípide (SAAF) e risco de tromboses, frequentemente ligado ao lúpus.",
    mostCommonBrazil: false,
    aliases: ["anticoagulante lupico", "lupico", "lupico anticoagulante", "saaf", "pesquisa de anticoagulante lupico", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "ANTICOAGULANTE LUPICO, PESQUISA" },
      { lab: "Delboni", label: "PESQUISA DE ANTICOAGULANTE LUPICO" }
    ]
  },
  {
    canonicalName: "Complemento C3",
    category: "Autoimunidade",
    description: "Fração mais abundante das proteínas do Sistema Complemento. No Lúpus (LES) em atividade e doenças vasculíticas, esses valores costumam cair acentuadamente, refletindo inflamação aguda (consumo rápido).",
    mostCommonBrazil: false,
    aliases: ["complemento c3", "c3", "fracao c3", "complemento", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "COMPLEMENTO C3, SORO" },
      { lab: "a+", label: "C3 (COMPLEMENTO)" }
    ]
  },
  {
    canonicalName: "Complemento C4",
    category: "Autoimunidade",
    description: "Fração do complemento avaliada em conjunto com a C3. Fica muito reduzido nas exacerbações clássicas de doenças por imunocomplexos sistêmicos, como a nefrite lúpica ativa e certas gamopatias.",
    mostCommonBrazil: false,
    aliases: ["complemento c4", "c4", "fracao c4", "complemento", "lupus"],
    labExamples: [
      { lab: "Fleury", label: "COMPLEMENTO C4, SORO" },
      { lab: "a+", label: "C4 (COMPLEMENTO)" }
    ]
  },
  {
    canonicalName: "Antígeno HLA-B27",
    category: "Autoimunidade",
    description: "Antígeno de histocompatibilidade leucocitária humana de classe I altamente associado a espondiloartropatias soronegativas, principalmente a Espondilite Anquilosante (associação > 90%), Artrite Reativa e Artrite Psoriásica.",
    mostCommonBrazil: false,
    aliases: ["hla b27", "hlab27", "hla-b27", "antigeno hla b27", "espondilite anquilosante"],
    labExamples: [
      { lab: "Fleury", label: "ANTIGENO HLA-B27, PESQUISA" },
      { lab: "Delboni", label: "HLA B27 (ANTIGENO DE HISTOCOMPATIBILIDADE)" }
    ]
  },
  {
    canonicalName: "ANCA (Anticorpos Anticitoplasma de Neutrófilos)",
    category: "Autoimunidade",
    description: "Dosagem de anticorpos direcionados a componentes citoplasmáticos de neutrófilos. Dividido classicamente em padrão peri-nuclear (p-ANCA, contra mieloperoxidase) e citoplasmático (c-ANCA, contra proteinase-3). Auxilia no diagnóstico de vasculites autoimunes sistêmicas profundas e colite ulcerativa.",
    mostCommonBrazil: false,
    aliases: ["anca", "p-anca", "c-anca", "anticorpos anticitoplasma de neutrofilos", "anticorpo anticitoplasma", "panca", "canca", "vasculite"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTICITOPLASMA DE NEUTROFILOS (ANCA)" },
      { lab: "CDB", label: "ANTICORPOS ANTICITOPLASMA DE NEUTROFILOS - ANCA C/P, SORO" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Scl-75 / Anti-Scl-70",
    category: "Autoimunidade",
    description: "Anticorpo autoimune voltado contra a enzima DNA topoisomerase I (Scl-70). Apresenta altíssima especificidade para a forma sistêmica e difusa da Esclerodermia (Esclerose Sistêmica), sendo também marcador de risco para fibrose pulmonar progressiva.",
    mostCommonBrazil: false,
    aliases: ["anti scl-70", "anti scl70", "anti-scl70", "anti-scl-70", "anti topoisomerase i", "anti sct70", "scl 70", "esclerodermia"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-SCL 70" },
      { lab: "CDB", label: "ANTI-SCL 70 (ANTICORPO ANTI-TOPOISOMERASE I), SORO" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Jo-1",
    category: "Autoimunidade",
    description: "Autoanticorpo direcionado contra a enzima histidil-tRNA sintetase. É o marcador imunológico chave de miopatias inflamatórias autoimunes primárias (como a Polimiosite e Dermatomiosite) associadas à Síndrome Antissintetase.",
    mostCommonBrazil: false,
    aliases: ["anti jo 1", "anti jo-1", "anti-jo1", "anti-jo-1", "jo-1", "jo1", "polimiosite", "dermatomiosite"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-JO-1" },
      { lab: "Delboni", label: "ANTI JO-1 ANTICORPOS" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Centrômero",
    category: "Autoimunidade",
    description: "Anticorpo autoimune voltado contra as proteínas centroméricas da divisão celular. Classicamente relacionado de maneira muito forte à Esclerose Sistêmica Limitada (Síndrome CREST - Calcinose, Raynaud, Esofagopatia, Esclerodactilia, Telangiectasia) e cirrose biliar primária.",
    mostCommonBrazil: false,
    aliases: ["anti centromero", "anticorpo anti centromero", "anti-centromero", "centromero", "crest"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-CENTROMERO, SORO" },
      { lab: "Lavoisier", label: "PESQUISA DE ANTICORPO ANTI CENTROMERO" }
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Cardiolipina (IgG / IgM)",
    category: "Autoimunidade",
    description: "Autoanticorpos da classe IgG e IgM voltados contra fosfolipídios de membrana. Componente fundamental dos critérios de classificação diagnóstica e monitoramento da Síndrome do Anticorpo Antifosfolípide (SAAF), fortemente vinculada com a trombofilia adquirida e abortamento de repetição.",
    mostCommonBrazil: false,
    aliases: ["anti cardiolipina", "anticardiolipina", "anti-cardiolipina", "cardiolipina", "cardiolipina igg igm", "saaf", "cardiolipina igg", "cardiolipina igm"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-CARDIOLIPINA (IGG E IGM)" },
      { lab: "Delboni", label: "ANTI CARDIOLIPINA IGG E IGM, SORO" }
    ]
  },
  {
    canonicalName: "Complemento Total (CH50)",
    category: "Autoimunidade",
    description: "Exame que mede a atividade funcional hemolítica global coordenada de todas as proteínas ligadas à via clássica de ativação do Sistema Complemento. É extremamente útil para o acompanhamento da atividade inflamatória sistemática do Lúpus e diagnósticos de deficiências imunitárias hereditárias.",
    mostCommonBrazil: false,
    aliases: ["ch50", "ch-50", "complemento ch50", "atividade do complemento total", "capacidade hemolitica total", "ch 50", "complementototal"],
    labExamples: [
      { lab: "Fleury", label: "COMPLEMENTO TOTAL (CH50), SORO" },
      { lab: "Lavoisier", label: "DOSAGEM DE COMPLEMENTO TOTAL (CH50)" }
    ]
  },
  {
    canonicalName: "Fator Reumatóide (FR)",
    category: "Autoimunidade",
    description: "Autoanticorpo direcionado contra a porção Fc da imunoglobulina humana. Amplamente utilizado como exame de triagem diagnóstica para a Artrite Reumatóide (AR) e Syndrome de Sjögren, além de outras nefropatias autoimunes e infecções crônicas.",
    mostCommonBrazil: true,
    aliases: ["fator reumatoide", "fr", "fator reumatoide quantitativo", "prova de waaler rose", "reumatoide", "fator latex", "latex"],
    labExamples: [
      { lab: "Fleury", label: "FATOR REUMATOIDE" },
      { lab: "Delboni", label: "FATOR REUMATOIDE (TESTE DO LATEX)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-CCP (Peptídeo Citrulinado Cíclico)",
    category: "Autoimunidade",
    description: "Autoanticorpo de altíssima especificidade (>95%) e alta sensibilidade para o diagnóstico precoce da Artrite Reumatóide. É um excelente preditor de evolução radiológica erosiva articular crônica.",
    mostCommonBrazil: false,
    aliases: ["anti ccp", "anti-ccp", "anticorpo anti peptideo citrulinado", "anticorpo anti ccp", "anticcp", "peptideo citrulinado"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-PEPTIDEO CITRULINADO CICLICO (ANTI-CCP)" },
      { lab: "Delboni", label: "ANTI CCP (ANTICORPO ANTI-PEPTIDEO CITRULINADO CICLICO)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-RNP (Ribonucleoproteína)",
    category: "Autoimunidade",
    description: "Autoanticorpo contra a proteína U1-RNP. É o marcador imunológico indispensável e definidor do diagnóstico de Doença Mista do Tecido Conjuntivo (DMTC). Também pode ser encontrado em títulos menores no Lúpus.",
    mostCommonBrazil: false,
    aliases: ["anti rnp", "anti-rnp", "anti u1 rnp", "u1rnp", "antirnp", "ribonucleoproteina"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-RIBONUCLEOPROTEINA (RNP)" },
      { lab: "Lavoisier", label: "ANTI RNP, SORO" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Histona",
    category: "Autoimunidade",
    description: "Anticorpo autoimune direcionado contra as proteínas histonas que envolvem o DNA celular. Encontra-se positivo em mais de 95% dos pacientes com Lúpus Induzido por Drogas (fármacos como hidralazina, procainamida, fenitoína).",
    mostCommonBrazil: false,
    aliases: ["anti histona", "anti-histona", "antihistona", "anticorpos anti-histonas"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-HISTONA, SORO" },
      { lab: "Delboni", label: "ANTI HISTONA" }
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Beta-2-Glicoproteína I (IgG / IgM)",
    category: "Autoimunidade",
    description: "Anticorpos direcionados contra o cofator beta-2-glicoproteína I. Trata-se de um marcador sorológico de alta relevância para fechar o diagnóstico de Síndrome do Anticorpo Antifosfolípide (SAAF) quando correlacionado a tromboses.",
    mostCommonBrazil: false,
    aliases: ["anti beta 2 glicoproteina i", "anti-beta 2 glicoproteina", "beta 2 glicoproteina", "anti beta2 glicoproteina i", "anti beta-2-glicoproteina i", "anti beta 2"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-BETA 2 GLICOPROTEINA I (IGG E IGM)" },
      { lab: "Delboni", label: "ANTI BETA-2-GLICOPROTEINA I (IGG/IGM)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Tireoperoxidase (Anti-TPO)",
    category: "Tireoide",
    description: "Autoanticorpo direcionado contra a principal enzima envolvida na síntese de hormônios tireoidianos. É o marcador mais sensível para o diagnóstico de Doenças Autoimunes da Tireoide, destacando-se na Tireoidite de Hashimoto.",
    mostCommonBrazil: true,
    aliases: ["anti tpo", "anti-tpo", "antitpo", "anti tireoperoxidase", "anticorpo anti peroxidase tireoidiana", "peroxidase tireoidiana"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-PEROXIDASE TIREOIDIANA (ANTI-TPO)" },
      { lab: "a+", label: "ANTI-TPO (ANTICORPOS ANTI-PEROXIDASE TIREOIDIANA)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Tireoglobulina (Anti-TG)",
    category: "Tireoide",
    description: "Autoanticorpo direcionado contra a proteína tireoglobulina, a reserva molecular de tireóide. Avaliado em conjunto com o anti-TPO no diagnóstico de Hashimoto e no pós-trataamento de neoplasia diferenciada de tireóide.",
    mostCommonBrazil: false,
    aliases: ["anti tg", "anti-tg", "antitg", "anti tireoglobulina", "anticorpo anti tireoglobulina"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-TIREOGLOBULINA" },
      { lab: "CDB", label: "ANTI-TIREOGLOBULINA, SORO" }
    ]
  },
  {
    canonicalName: "Antiestreptolisina O (ASLO)",
    category: "Autoimunidade",
    description: "Dosagem quantitativa de anticorpos contra a estreptolisina O, produzida pelo Estreptococo do grupo A. Níveis elevados identificam infecções estreptocócicas recentes que podem induzir complicações pós-infecciosas autoimunes, como Febre Reumática e Glomerulonefrite.",
    mostCommonBrazil: true,
    aliases: ["aslo", "aso", "antiestreptolisina", "antiestreptolisina o", "dosagem de aslo", "anti-estreptolisina"],
    labExamples: [
      { lab: "Fleury", label: "ANTIESTREPTOLISINA O (ASLO)" },
      { lab: "Delboni", label: "ASLO - DOSAGEM" }
    ]
  },
  {
    canonicalName: "Velocidade de Hemossedimentação (VHS)",
    category: "Autoimunidade",
    description: "Exame laboratorial cinético simples que mede a taxa de queda dos glóbulos vermelhos no tubo de ensaio em 1 hora. Reflete indiretamente o aumento de proteínas de fase aguda (fibrinogênio, imunoglobulinas) no plasma, denotando inflamação sistêmica em atividade.",
    mostCommonBrazil: true,
    aliases: ["vhs", "velocidade de hemossedimentacao", "velocidade de sedimentacao das hemacias", "vhs 1 hora"],
    labExamples: [
      { lab: "Fleury", label: "VELOCIDADE DE HEMOSSEDIMENTACAO (VHS)" },
      { lab: "Lavoisier", label: "VHS - VELOCIDADE DE HEMOSSEDIMENTACAO" }
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Transglutaminase Tecidual (tTG - IgA / IgG)",
    category: "Autoimunidade",
    description: "Exame sorológico de escolha e de altíssima cura e acurácia para triagem e acompanhamento de indivíduos suspeitos de Doença Celíaca (intolerância permanente ao glúten mediada por mecanismos imunológicos).",
    mostCommonBrazil: false,
    aliases: ["anti transglutaminase", "anti transglutaminase tecidual", "anti-transglutaminase", "anti ttg", "ttg iga", "ttg igg", "transglutaminase tecidual"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-TRANSGLUTAMINASE TECIDUAL (IGA / IGG)" },
      { lab: "Delboni", label: "ANTI-TRANSGLUTAMINASE TECIDUAL, SORO" }
    ]
  },
  {
    canonicalName: "Anticorpos Anti-Endomísio (EMA - IgA / IgG)",
    category: "Autoimunidade",
    description: "Anticorpos direcionados contra o endomísio (camada conectiva muscular). Apresenta quase 100% de especificidade diagnóstica para a Doença Celíaca, sendo utilizado em conjunto com o Anti-tTG para confirmação diagnóstica robusta sem biópsia.",
    mostCommonBrazil: false,
    aliases: ["anti endomisio", "anti-endomisio", "anti endomisio iga", "anti endomisio igg", "ema iga", "ema igg", "endomisio"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-ENDOMISIO IGA E IGG" },
      { lab: "CDB", label: "ANTI-ENDOMISIO - PESQUISA DE ANTICORPOS IGA / IGG" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-LKM1 (Microssoma de Fígado e Rim Tipo 1)",
    category: "Autoimunidade",
    description: "Marcador autoimune hepático de extrema importância. Característico e definidor no diagnóstico diferencial da Hepatite Autoimune do Tipo 2, manifestando-se predominantemente em crianças e mulheres jovens.",
    mostCommonBrazil: false,
    aliases: ["anti lkm1", "anti lkm-1", "anti-lkm1", "anti-lkm-1", "microssoma de figado e rim", "lkm1"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-MICROSSOMA DE FIGADO E RIM TIPO 1 (LKM-1)" },
      { lab: "Delboni", label: "ANTI-LKM-1 (ANTICORPO ANTI-MICROSSOMA DE FIGADO E RIM)" }
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Músculo Liso (ASMA)",
    category: "Autoimunidade",
    description: "Autoanticorpos da classe IgG direcionados aos filamentos contráteis celulares. É o marcador principal indireto no auxílio diagnóstico de Hepatite Autoimune Tipo 1, presente em cerca de 70-80% dos casos ativos.",
    mostCommonBrazil: false,
    aliases: ["anti musculo liso", "anti-musculo liso", "anticorpo antimúsculo liso", "asma", "musculo liso"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPOS ANTI-MUSCULO LISO (ASMA)" },
      { lab: "CDB", label: "ANTI-MUSCULO LISO (ASMA), PESQUISA" }
    ]
  },
  {
    canonicalName: "Cistatina C",
    category: "Rins",
    description: "Marcador proteico sérico altamente preciso para avaliação da taxa de filtração glomerular. Diferente da Creatinina, não sofre variação por massa muscular corporal, dieta ou gênero. Crucial no acompanhamento precoce e refinado de pacientes com Nefropatia por IgA ou outras nefropatias.",
    mostCommonBrazil: false,
    aliases: ["cistatina", "cistatina c", "cystatin c", "cystatin"],
    labExamples: [
      { lab: "Fleury", label: "CISTATINA C, DOSAGEM SERICA" },
      { lab: "Delboni", label: "CISTATINA C, SANGUE" }
    ],
    optimalRange: "0.53 a 0.95 mg/L",
    symptomsHigh: "Indica taxa de filtração glomerular reduzida, sobrecarga ou lesão renal, predisposição a edema, hipertensão e retenção azotêmica.",
    symptomsLow: "Excelente depuração glomerular ou reserva renal preservada. Valores muito baixos não possuem significado patológico.",
    recommendations: [
      "Manter hidratação rigorosa e controle estrito da pressão arterial.",
      "Monitorar em conjunto com a relação Albumina/Creatinina Urinária (RAC) e eGFR.",
      "Evitar anti-inflamatórios (AINEs) e outros nefrotóxicos."
    ]
  },
  {
    canonicalName: "Calprotectina Fecal",
    category: "Gastroenterologia",
    description: "Proteína ligadora de cálcio abundante no citoplasma dos neutrófilos, eliminada intacta nas fezes em caso de inflamação intestinal. Usada no diagnóstico diferencial entre Síndrome do Intestino Irritável (SII) e Doenças Inflamatórias Intestinais (DII - como Crohn e Retocolite), além de monitorar a cicatrização da mucosa intestinal.",
    mostCommonBrazil: false,
    aliases: ["calprotectina", "calprotectina fecal", "calprotectin", "fecal calprotectin"],
    labExamples: [
      { lab: "Fleury", label: "CALPROTECTINA FECAL, EXTRAÇÃO E DOSAGEM" },
      { lab: "Delboni", label: "CALPROTECTINA, FEZES" }
    ],
    optimalRange: "Menor que 50 µg/g",
    symptomsHigh: "Dor abdominal, diarreia crônica, sangramento oculto, fadiga sistêmica de causa absortiva, indicando inflamação ativa na mucosa intestinal.",
    symptomsLow: "Trato gastrointestinal saudável ou remissão mucosa consolidada.",
    recommendations: [
      "Se elevada acima de 150-250 µg/g, buscar avaliação colonoscópica com biópsias.",
      "Analisar possíveis intolerâncias alimentares ou hipocloridria.",
      "Adotar dieta de eliminação ou anti-inflamatória sob supervisão de nutricionista."
    ]
  },
  {
    canonicalName: "Sorologia para Dengue (NS1, IgG e IgM)",
    category: "Infectologia",
    description: "Conjunto de análises para detecção do vírus da Dengue. O antígeno NS1 é detectável nos primeiros dias de febre aguda, enquanto os anticorpos IgM indicam infecção recente ativa e IgG sinaliza imunidade adquirida após exposição prévia.",
    mostCommonBrazil: true,
    aliases: ["dengue", "sorologia dengue", "dengue igg", "dengue igm", "antigeno ns1", "dengue ns1", "pesquisa de dengue"],
    labExamples: [
      { lab: "Fleury", label: "DENGUE, ANTIGENO NS1 E ANTICORPOS IGG E IGM" },
      { lab: "Delboni", label: "SOROLOGIA PARA DENGUE" }
    ],
    optimalRange: "Não Reagente (NS1 e IgM) | Negativo ou Reagente para IgG conforme histórico de infecção",
    symptomsHigh: "Febre alta súbita, dores atrás dos olhos, prostração, dores articulares severas, cefaleia intensa e manchas vermelhas na pele.",
    symptomsLow: "Ausência de infecção ativa pelo vírus da dengue.",
    recommendations: [
      "Manter repouso absoluto e hidratação oral agressiva com água e soluções eletrolíticas (soro caseiro, água de coco).",
      "Evitar rigorosamente o uso de Ácido Acetilsalicílico (Aspirina) e anti-inflamatórios não esteroidais (AINEs - Ibuprofeno, Nimesulida, etc.) devido ao risco de sangramentos e complicações hemorrágicas.",
      "Controlar febre apenas com analgésicos permitidos (como Paracetamol ou Dipirona) respeitando as doses máximas diárias."
    ]
  },
  {
    canonicalName: "Coenzima Q10 (Ubiquinona)",
    category: "Nutrientes",
    description: "Mede os estoques circulantes da Coenzima Q10, uma benzoquinona lipossolúvel fundamental para o transporte de elétrons na cadeia respiratória mitocondrial e para a produção de ATP. Atua como potente antioxidante lipídico, protegendo as membranas contra estresse oxidativo. Crucial para prevenir mialgias causadas por estatinas, dar suporte a pacientes com fadiga mitocondrial crônica e auxiliar no manejo integrativo da dor na Fibromialgia.",
    mostCommonBrazil: false,
    aliases: ["coenzima q10", "coq10", "q10", "ubiquinona", "dosagem de coenzima q10"],
    labExamples: [
      { lab: "Fleury", label: "COENZIMA Q10, DOSAGEM SERICA" },
      { lab: "Alta", label: "DOSAGEM DE COENZIMA Q10" }
    ],
    optimalRange: "0.8 a 2.0 µg/mL (Níveis ótimos para suporte celular e mitocondrial)",
    symptomsHigh: "Valores espontaneamente elevados são raros e sem toxicidade estabelecida (geralmente ocorrem por suplementação ativa).",
    symptomsLow: "Suscetibilidade aumentada a dores musculares (mialgias por estatinas), fadiga física crônica, brain fog, baixa resiliência ao estresse oxidativo celular.",
    recommendations: [
      "Caso esteja fazendo uso de Estatinas para colesterol, avaliar co-suplementação de CoQ10.",
      "Ingerir fontes alimentares como sardinha, gergelim, espinafre e carnes orgânicas.",
      "Caso suplementada, preferir a forma reduzida ativa (Ubiquinol), ingerida junto a refeições gordurosas para máxima absorção."
    ]
  },
  {
    canonicalName: "Relação Proteína/Creatinina Urinária (RPC)",
    category: "Rins",
    description: "Método prático e extremamente confiável para estimar a perda de proteínas totais de 24 horas a partir de uma amostra isolada de urina. Expressa a quantidade de proteína eliminada por grama de creatinina excretada, contornando variações provocadas por taxas de fluxo urinário. Fundamental para triagem e acompanhamento rigoroso de nefropatias glomerulares (como a Nefropatia por IgA), permitindo intervir precocemente contra a progressão renal.",
    mostCommonBrazil: true,
    aliases: ["rpc", "relacao proteina creatinina", "proteina creatinina", "proteinuria isolada", "proteina/creatinina", "relação proteína creatinina para amostra isolada", "proteinuria de amostra isolada"],
    labExamples: [
      { lab: "Fleury", label: "RELAÇÃO PROTEÍNA/CREATININA EM AMOSTRA ISOLADA DE URINA" },
      { lab: "Delboni", label: "RELAÇAO PROTEINA/CREATININA" },
      { lab: "Lavoisier", label: "DETERMINAÇAO DA RELAÇAO PROTEINA / CREATININA URINARIA" }
    ],
    optimalRange: "Menor que 0.20 g/g (uRPC < 200 mg/g)",
    symptomsHigh: "Urina espumosa persistente, inchaço nas pálpebras, membros inferiores e tornozelos (edema), cansaço fácil por fadiga metabólica, hipertensão arterial de difícil controle.",
    symptomsLow: "Ausência de proteinúria clinicamente significativa ou integridade da barreira glomerular urinária preservada.",
    recommendations: [
      "Pacientes diagnosticados com Nefropatia por IgA devem visar manter a RPC persistentemente abaixo de 0.5 g/g para reduzir risco de declínio de longo prazo.",
      "Monitorar regularmente em conjunto com taxas estimadas de filtração glomerular (eGFR) e acompanhamento multidisciplinar com Nefrologista.",
      "Adotar dieta de controle proteico saudável e manter pressão arterial bem regulada."
    ]
  },
  {
    canonicalName: "Vitamina D (1,25-di-hidróxi)",
    category: "Nutrientes",
    description: "Representa a forma biologicamente ativa da vitamina D (calcitriol), produzida pelos rins a partir da hidroxilação secundária da 25-hidroxivitamina D. Estimula diretamente a absorção de cálcio e fósforo no intestino delgado. É útil no diagnóstico diferencial de hipercalcemia crônica, hipoparatiroidismo grave, raquitismo ou no acompanhamento de doença renal crônica avançada.",
    mostCommonBrazil: false,
    aliases: ["vitamina d3 125", "calcitriol", "1,25 dihydroxyvitamin d", "1 25 di-hidroxi vitamina d", "1 25-di-hidroxivitamina d", "125-di-hidroxi", "vitamina d ativa"],
    labExamples: [
      { lab: "Fleury", label: "1,25 DI-HIDROXI VITAMINA D, DOSAGEM SERICA" },
      { lab: "CDB", label: "1,25-DI-HIDROXI VITAMINA D, DOSAGEM" }
    ],
    optimalRange: "18 a 72 pg/mL",
    symptomsHigh: "Hipercalcemia, náuseas persistentes, constipação severa, confusão mental desidratativa e risco de nefrocalcinose renal secundária por cálcio elevado.",
    symptomsLow: "Má absorção de cálcio intestinal, osteomalácia ou falha de conversão renal.",
    recommendations: [
      "Avaliar em conjunto com a função renal (Creatinina/Cistatina C), Cálcio Iônico, Fósforo e Paratormônio (PTH).",
      "Não deve ser dosada como triagem de hipovitaminose D comum (para este fim, use sempre a 25-hidroxivitamina D, que reflete os estoques totais da substância)."
    ]
  },
  {
    canonicalName: "Lipoproteína (a) [Lp(a)]",
    category: "Coração",
    description: "Partícula semelhante ao LDL-colesterol, mas com uma apolipoproteína (a) adicional ligada covalentemente. Seus níveis circulantes são determinados geneticamente entre 70% e 90%, variando muito pouco com dieta e exercícios. É considerada um fator de risco independente e de longo prazo para infarto do miocárdio, derrame cerebral e estenose da válvula aórtica.",
    mostCommonBrazil: false,
    aliases: ["lipoproteina a", "lp a", "lpa", "lipoproteina(a)", "dosagem de lipoproteina a", "lp(a)", "lipoproteina a dosagem"],
    labExamples: [
      { lab: "Fleury", label: "LIPOPROTEINA (A), DOSAGEM" },
      { lab: "Delboni", label: "LIPOPROTEINA (A)" }
    ],
    optimalRange: "Menor que 30 mg/dL (ou menor que 75 nmol/L)",
    symptomsHigh: "Não gera sintomas imediatos, mas provoca predisposição acentuada à deposição de placas nas artérias coronárias e carótidas, elevando o risco de eventos cardiovasculares mesmo na presença de LDL controlado.",
    symptomsLow: "Valores baixos ou indetectáveis são saudáveis e indicam ausência de risco cardiovascular geneticamente aumentado por esta via.",
    recommendations: [
      "Por ter forte fator hereditário, deve ser dosada pelo menos uma vez na vida para mapear o risco intrínseco.",
      "Se elevada, recomenda-se controle muito mais rigoroso de outros fatores de risco tratáveis (como LDL-C, pressão arterial, homocisteína e índice glicêmico).",
      "Avaliar estratégias integrativas contra inflamação vascular ou agregação plaquetária sob orientação médica."
    ]
  },
  {
    canonicalName: "Zonulina Fecal",
    category: "Gastroenterologia",
    description: "Proteína que regula reversivelmente as junções de oclusão (tight junctions) entre as células epiteliais do intestino delgado. Sua elevação é considerada o principal biomarcador de perda da integridade da barreira intestinal (síndrome do intestino hiperpermeável ou 'leaky gut'), permitindo a passagem de macromoléculas na circulação que disparam reações imunológicas locais ou sistêmicas.",
    mostCommonBrazil: false,
    aliases: ["zonulina fecal", "zonulina", "zonulin", "fecal zonulin", "dosagem de zonulina"],
    labExamples: [
      { lab: "Fleury", label: "ZONULINA FECAL, DOSAGEM" },
      { lab: "Alta", label: "PESQUISA DE ZONULINA NAS FEZES" }
    ],
    optimalRange: "Menor que 100 ng/mL",
    symptomsHigh: "Estufamento persistente, distensão abdominal frequente, cansaço mental (brain fog), dores articulares difusas, cansaço inexplicável pós-refeição e manifestações alérgicas ou autoimunes recorrentes.",
    symptomsLow: "Barreira intestinal íntegra com boa coesão intercelular e permeabilidade fisiológica normal.",
    recommendations: [
      "Eliminar temporariamente potenciais gatilhos inflamatórios que estimulam a liberação de zonulina, como o glúten (contendo gliadina, um ativador direto) e laticínios industriais excessivos.",
      "Suplementar com L-Glutamina, extrato de alcaçuz (DGL) e fibras prebióticas para auxiliar na regeneração mucosa de suporte.",
      "Manter alimentação equilibrada rica em polifenóis, zinco e vitamina D."
    ]
  },
  {
    canonicalName: "Sorologia para Vírus Epstein-Barr (EBV IgG e IgM)",
    category: "Infectologia",
    description: "Painel sorológico para detectar anticorpos contra antígenos do vírus Epstein-Barr (EBV), membro da família dos herpesvírus causador da Mononucleose Infecciosa. É um vírus de latência crônica, frequentemente associado de forma integradora a episódios de fadiga crônica persistente e ativação de reações autoimunes latentes.",
    mostCommonBrazil: false,
    aliases: ["epstein barr", "ebv", "sorologia epstein barr", "epstein barr igg", "epstein barr igm", "anti vca igg", "anti vca igm", "pesquisa de epstein barr"],
    labExamples: [
      { lab: "Fleury", label: "EPSTEIN BARR VIRUS, ANTICORPOS IGG E IGM" },
      { lab: "Delboni", label: "SOROLOGIA PARA EPSTEIN-BARR" }
    ],
    optimalRange: "Não Reagente para IgM | IgG pode ser Reagente indicando imunidade/infecção de longa data sem reativação ativa",
    symptomsHigh: "Em infecção aguda ou reativação: fadiga extrema que não melhora com repouso, febre baixa, dor de garganta intensa, aumento de gânglios linfáticos (ínguas) cervicais e dores de cabeça persistentes.",
    symptomsLow: "Ausência de histórico imunológico ou infecção latente pelo vírus Epstein-Barr.",
    recommendations: [
      "Se o IgM for reagente ou houver suspeita de reativação clínica, priorizar repouso absoluto e modulação imunológica acompanhada.",
      "Suplementar com lisina, zinco, vitamina C e extrato de própolis para dar suporte ao controle antiviral natural de barreira celular.",
      "Evitar estresse físico excessivo ou treinos muito extenuantes que possam deprimir temporariamente a imunidade celular ativa."
    ]
  },
  {
    canonicalName: "Anticorpo Anti-Receptor de TSH (TRAB)",
    category: "Nutrientes",
    description: "Autoanticorpo direcionado ao receptor do hormônio estimulante da tireoide (TSH). Pode atuar como estimulador direto, levando à produção descontrolada de hormônios tireoidianos. É o marcador imunológico de escolha definitiva para o diagnóstico diferencial de Doença de Graves (principal causa de hipertireoidismo primário).",
    mostCommonBrazil: false,
    aliases: ["trab", "anti trab", "anticorpo anti trab", "receptor de tsh", "anticorpo anti receptor de tsh", "dosagem de trab", "anti-receptor de tsh"],
    labExamples: [
      { lab: "Fleury", label: "ANTICORPO ANTI RECEPTOR DE TSH (TRAB)" },
      { lab: "CDB", label: "ANTI-RECEPTOR DE TSH (TRAB), DOSAGEM" }
    ],
    optimalRange: "Menor que 1.75 UI/L (Indetectável ou Negativo)",
    symptomsHigh: "Ansiedade severa com agitação, tremores finos nas mãos, perda rápida de peso involuntária, palpitações cardíacas (taquicardia), calor excessivo e intolerância extrema ao calor, insônia e fadiga física secundária.",
    symptomsLow: "Ausência de autoagressão estimulatória ativa contra o tecido tireoidiano.",
    recommendations: [
      "Se elevado com hormônios livres altos (T4/T3) e TSH suprimido, requer acompanhamento imediato com Endocrinologista para prevenção de tempestade tireoidiana.",
      "Controlar estresse agudo e de longo prazo, considerado o principal gatilho ambiental para ativação secundária da Doença de Graves.",
      "Priorizar minerais antioxidantes como selênio, em equilíbrio, para diminuir os níveis inflamatórios locais."
    ]
  },
  {
    canonicalName: "Vitamina B12 Ativa (Holotranscobalamina)",
    category: "Nutrientes",
    description: "Representa a fração da vitamina B12 (cobalamina) acoplada à proteína transportadora transcobalamina II. É a única forma de B12 capaz de entrar ativamente nas células corporais para exercer suas funções metabólicas cruciais (como síntese de DNA e mielinização neurológica). É um marcador muito mais fiel de deficiência inicial de vitamina B12 do que a B12 sérica total, que inclui frações ligadas a proteínas inertes de transporte.",
    mostCommonBrazil: false,
    aliases: ["b12 ativa", "holotranscobalamina", "holotc", "b12 holotranscobalamina", "vitamina b12 ativa", "holotranscobalamina serica"],
    labExamples: [
      { lab: "Fleury", label: "HOLOTRANSCOBALAMINA (VITAMINA B12 ATIVA), DOSAGEM SERICA" },
      { lab: "Alta", label: "VITAMINA B12 ATIVA (HOLOTRANSCOBALAMINA)" }
    ],
    optimalRange: "Maior que 35 pmol/L (Níveis excelentes na faixa de 50 a 120 pmol/L)",
    symptomsHigh: "Valores excessivamente elevados não possuem toxicidade, ocorrendo quase exclusivamente secundários a injeções ou suplementação recente de metilcobalamina ativa de alta dose.",
    symptomsLow: "Fadiga matinal crônica, parestesias (sensação de formigamento nas mãos e pés), brain fog ou lapsos de memória sutis, estresse neurológico e fadiga celular geral.",
    recommendations: [
      "Excelente para vegetarianos, veganos, bariátricos, usuários de metformina de longa data e idosos para rastreio precoce de deficiência de B12 mesmo com B12 total normal.",
      "Caso esteja em níveis de alerta, avaliar uso de Metilcobalamina sublingual para contornar problemas de absorção mecânica ou ausência gástrica do fator intrínseco.",
      "Pode ser avaliado conjuntamente com a Homocisteína sérica e o Ácido Metilmalônico para um diagnóstico definitivo de disfunção mitocondrial."
    ]
  },
  {
    canonicalName: "Peptídeo Natriurético Tipo B (BNP)",
    category: "Coração",
    description: "Hormônio secretado predominantemente pelos ventrículos cardíacos em resposta ao aumento de pressão/estiramento da parede miocárdica. É o biomarcador padrão-ouro para triagem, diagnóstico e estratificação de gravidade na insuficiência cardíaca (IC).",
    mostCommonBrazil: true,
    aliases: ["bnp", "peptideo natriuretico", "dosagem de bnp", "nt probnp", "nt-probnp", "peptideo natriuretico tipo b", "dosagem de pro-bnp"],
    labExamples: [
      { lab: "Fleury", label: "PEPTIDEO NATRIURETICO TIPO B (BNP)" },
      { lab: "Delboni", label: "BNP - PEPTIDEO NATRIURETICO" }
    ],
    optimalRange: "Menor que 100 pg/mL (para BNP) ou Menor que 125 pg/mL (para NT-proBNP)",
    symptomsHigh: "Falta de ar progressiva ao deitar (ortopneia) ou ao esforço mínimo, cansaço extremo, inchaço nas pernas (edema de membros inferiores) e tosse seca noturna.",
    symptomsLow: "Concentrações normais ou baixas indicam excelente função ventricular com baixíssima probabilidade de insuficiência cardíaca hemodinamicamente ativa.",
    recommendations: [
      "Indicado primariamente no diagnóstico diferencial de dispneia aguda (falta de ar) na sala de emergência.",
      "Auxilia na titulação fina e acompanhamento da resposta terapêutica a medicamentos cardioprotetores.",
      "Associar os níveis à avaliação clínica, radiografia de tórax e ao ecocardiograma transtorácico."
    ]
  },
  {
    canonicalName: "Relação Albumina/Creatinina Urinária (RAC)",
    category: "Rins",
    description: "Forma diagnóstica preferencial para detectar e monitorar a presença de microalbuminúria (fração mínima de albumina na urina) de maneira precoce, evitando a necessidade de coleta de urina de 24 horas. Essencial na avaliação e prevenção de nefropatia em pacientes hipertensos ou diabéticos.",
    mostCommonBrazil: true,
    aliases: ["rac", "relacao albumina creatinina", "microalbuminuria isolada", "albumina creatinina urinaria", "albumina/creatinina", "relacao albumina/creatinina de amostra isolada"],
    labExamples: [
      { lab: "Fleury", label: "MICROALBUMINURIA EM AMOSTRA ISOLADA" },
      { lab: "Alta", label: "RELAÇÃO ALBUMINA/CREATININA EM URINA" }
    ],
    optimalRange: "Menor que 30 mg/g (Normal)",
    symptomsHigh: "Geralmente assintomático nas fases iniciais, progredindo para urina de aspecto espumoso ou edema corporal após longo prazo se os níveis excederem a nefropatia estabelecida.",
    symptomsLow: "Danos glomerulares ausentes ou controlados, refletindo boa integridade de filtração capilar renal.",
    recommendations: [
      "Diabéticos (Tipo 1 ou 2) e hipertensos devem dosar a RAC pelo menos uma vez por ano para proteção renal preventiva.",
      "Valores moderadamente aumentados (30-300 mg/g) podem regredir com otimização pressórica, restrição moderada de sódio e controle glicêmico perfeito.",
      "Evitar exercícios intensificados de corrida ou musculação de esforço nas 24h que antecedem o exame para evitar falso-positivo temporário."
    ]
  },
  {
    canonicalName: "Cobre Sérico",
    category: "Nutrientes",
    description: "Dosagem do cobre no sangue, elemento essencial na formação de hemoglobina, mielina, colágeno e no equilíbrio de neurotransmissores importantes no sistema nervoso central.",
    mostCommonBrazil: false,
    aliases: ["cobre serico", "dosagem de cobre", "cobre plasmatico", "copper", "cobre"],
    labExamples: [
      { lab: "Fleury", label: "COBRE SERICO, DOSAGEM" },
      { lab: "Lavoisier", label: "COBRE PLASMATICO" }
    ],
    optimalRange: "70 a 140 mcg/dL (ou 11 a 22 mcmol/L)",
    symptomsHigh: "Fadiga associada com manifestações autoimunes de desequilíbrios, alterações de humor marcantes e, em casos crônicos ocupacionais ou genéticos (como Doença de Wilson), lesão hepática e anel ocular de coloração marrom.",
    symptomsLow: "Anemia resistente à suplementação comum de ferro, leucopenia (leucócitos baixos), fadiga ou fraqueza musculoesquelética crônica e osteoporose precoce inexplicável.",
    recommendations: [
      "Sempre avaliar em conjunto com os níveis de Ceruloplasmina e Cobre Urinário para obter imagem fidedigna do estoque orgânico do metal.",
      "A suplementação crônica excessiva de Zinco (principalmente acima de 50mg ao dia) pode prejudicar gravemente a absorção do cobre e induzir deficiência secundária importante.",
      "Fontes ricas de cobre dietético incluem fígado bovino, cacau natural, nozes e sementes."
    ]
  },
  {
    canonicalName: "Ceruloplasmina",
    category: "Nutrientes",
    description: "Principal proteína transportadora de cobre no organismo humano, produzida no fígado. Atua também como enzima ferroxidase vital, oxidando o ferro para viabilizar seu transporte regular pela transferrina no sangue.",
    mostCommonBrazil: false,
    aliases: ["ceruloplasmina", "ceruloplasmina serica", "dosagem de ceruloplasmina"],
    labExamples: [
      { lab: "Fleury", label: "CERULOPLASMINA, DOSAGEM" },
      { lab: "Delboni", label: "CERULOPLASMINA" }
    ],
    optimalRange: "20 a 60 mg/dL",
    symptomsHigh: "Pode elevar-se por ser uma proteína reagente de fase aguda em infecções, inflamações crônicas, dores articulares persistentes, estresse físico prolongado ou uso contínuo de estrogênios.",
    symptomsLow: "Fadiga inexplicada associada a baixos teores de cobre corporal, além de alterações neurológicas de coordenação ou icterícia flutuante.",
    recommendations: [
      "Sua redução é a triagem de escolha para suspeita clínica da Doença de Wilson (distúrbio de excreção do cobre).",
      "Sempre interpretar em conjunto com Cobre Sérico e Ferro para identificar anemias refratárias por falta de transporte.",
      "Modulações dietéticas anti-inflamatórias auxiliam a normalizar valores desequilibrados secundariamente."
    ]
  },
  {
    canonicalName: "Vitamina A (Retinol)",
    category: "Nutrientes",
    description: "Dosagem dos níveis de Retinol, forma ativa sérica primária da Vitamina A. Essencial para a integridade celular do sistema visual, imunidade mucosa de barreira, renovação adequada dos tecidos e potente ação antioxidante geral.",
    mostCommonBrazil: false,
    aliases: ["vitamina a", "retinol serico", "retinol", "vitamina a dosagem", "dosagem de vitamina a", "vitamina a serica"],
    labExamples: [
      { lab: "Fleury", label: "VITAMINA A, DOSAGEM SERICA" },
      { lab: "Delboni", label: "VITAMINA A" }
    ],
    optimalRange: "0.30 a 0.70 mg/L (ou 1.05 a 2.44 mcmol/L)",
    symptomsHigh: "Pele com descamação acentuada, unhas excessivamente fracas, queda capilar de padrão difuso, dores de cabeça persistentes, tontura e, em casos graves, dores ósseas por toxicidade de superdosagem por suplementação incorreta.",
    symptomsLow: "Dificuldade visual noturna sutil (cegueira noturna), olhos secos frequentes, pele seca ou hiperqueratose folicular e infecções respiratórias recorrentes.",
    recommendations: [
      "A dosagem deve ser realizada em jejum adequado devido à influência imediata de gorduras alimentares no trânsito lipossolúvel.",
      "Priorizar fontes naturais de pró-vitamina A (alimentos cor de laranja como cenoura, abóbora, manga) e vitamina A ativa (gema de ovo, manteiga ghee, vísceras sob moderação).",
      "Evitar uso crônico de alta dosagem sintética sem acompanhamento médico especializado."
    ]
  },
  {
    canonicalName: "Vitamina E (Alfa-tocoferol)",
    category: "Nutrientes",
    description: "Mensuração sérica do alfa-tocoferol, vitamina lipossolúvel com poderosíssimo papel antioxidante na proteção do estresse oxidativo das membranas de gordura celular e prevenção de danos em bainha de mielina neurológica.",
    mostCommonBrazil: false,
    aliases: ["vitamina e", "alfa tocoferol", "alfa-tocoferol", "dosagem de vitamina e", "vitamina e serica"],
    labExamples: [
      { lab: "Fleury", label: "VITAMINA E, DOSAGEM SERICA" },
      { lab: "Delboni", label: "VITAMINA E" }
    ],
    optimalRange: "5.0 a 20.0 mg/L (ou 11.5 a 46.4 mcmol/L)",
    symptomsHigh: "Valores excessivos geralmente são inócuos, mas doses altíssimas via suplementares puras podem causar competição absortiva com outras vitaminas lipossolúveis (como a Vitamina K) e prolongar sutilmente o tempo de sangramento.",
    symptomsLow: "Fraqueza muscular progressiva sutil, formigamentos periféricos distais, alterações de equilíbrio ou perda de coordenação motora e envelhecimento celular celular precoce por radicais livres.",
    recommendations: [
      "Interessante no rastreamento de síndromes de má absorção de gorduras intestinais (como doença celíaca crônica ou doença de Crohn).",
      "Consumir sementes de girassol, amêndoas, nozes macadâmia, abacate e azeite de oliva extravirgem como excelentes fontes dietéticas seguras.",
      "Suplementações devem ser bem planejadas e preferenciar tocoferóis e tocotrienóis mistos para mimetizar a matriz alimentar natural."
    ]
  },
  {
    canonicalName: "Adiponectina",
    category: "Metabolismo",
    description: "Hormônio derivado dos adipócitos (adipocina) com potentes ações sensibilizadoras de insulina, anti-inflamatórias e antiatrogênicas. Ao contrário de outras substâncias produzidas pelo tecido adiposo, seus níveis circulantes são inversamente proporcionais ao índice de gordura visceral do indivíduo.",
    mostCommonBrazil: false,
    aliases: ["adiponectina", "adiponectina serica", "dosagem de adiponectina", "adiponectin"],
    labExamples: [
      { lab: "Fleury", label: "ADIPONECTINA, DOSAGEM SERICA" },
      { lab: "Sabin", label: "ADIPONECTINA" }
    ],
    optimalRange: "Maior que 10.0 mcg/mL (Homens) e Maior que 12.0 mcg/mL (Mulheres) - Valores ideais indicando alta sensibilidade à insulina.",
    symptomsHigh: "Valores fisiológicos elevados são altamente cardioprotetores e indicam excelente flexibilidade metabólica e baixo risco de esteatose hepática.",
    symptomsLow: "Resistência patológica à insulina, predisposição ao diabetes tipo 2, ganho facilitado de gordura visceral, fadiga por ineficiência energética mitocondrial e aumento do risco para síndrome metabólica.",
    recommendations: [
      "Excelente biomarcador para avaliar a eficiência metabólica celular de forma precoce, antes do aparecimento do diabetes franco.",
      "Para aumentar os níveis, recomenda-se a prática regular de treinos de força (musculação/HIIT), controle rigoroso do estresse crônico (redução do cortisol) e aumento da ingestão de polifenóis e ácidos graxos ômega-3.",
      "Sempre analisar os valores em conjunto com a relação Triglicérides/HDL e a Insulina em Jejum."
    ]
  },
  {
    canonicalName: "Leptina",
    category: "Metabolismo",
    description: "Hormônio proteico secretado pelos adipócitos responsável pela sinalização de saciedade a nível hipotalâmico e modulação da taxa metabólica basal. Na obesidade e em estados inflamatórios crônicos de longo prazo, observa-se frequentemente uma 'resistência à leptina', na qual o cérebro deixa de responder de forma ideal ao hormônio.",
    mostCommonBrazil: false,
    aliases: ["leptina", "leptina serica", "dosagem de leptina", "leptin"],
    labExamples: [
      { lab: "Fleury", label: "LEPTINA, DOSAGEM" },
      { lab: "Delboni", label: "LEPTINA SERICA" }
    ],
    optimalRange: "4.0 a 12.0 ng/mL para mulheres e 2.0 a 6.0 ng/mL para homens (Níveis regulados e sem resistência de barreira lipídica)",
    symptomsHigh: "Fome constante e incontrolável (compulsão alimentar secundária), cansaço crônico pós-refeição, taxa metabólica lenta, dificuldade acentuada para emagrecer e inflamação crônica subclínica associada.",
    symptomsLow: "Raro em adultos saudáveis (exceto em quadros de desnutrição severa ou anorexia nervosa), caracterizando exaustão de reservas lipídicas ou fadiga física crônica extrema por baixa sinalização energética.",
    recommendations: [
      "A resistência à leptina é o principal bloqueador biológico do emagrecimento sustentável. Deve ser combatida com foco na diminuição das citocinas inflamatórias.",
      "Evitar o consumo de xarope de milho ultraprocessado e frutose isolada industrial, que sabidamente rompem a sinalização de saciedade no hipotálamo.",
      "Garantir uma excelente higiene do sono, pois a privação de sono noturno diminui bruscamente a produção diurna fisiológica de leptina de controle."
    ]
  },
  {
    canonicalName: "Sorologia para Citomegalovírus (CMV IgG e IgM)",
    category: "Infectologia",
    description: "Painel sorológico para quantificação de anticorpos contra o Citomegalovírus (CMV), vírus comum da família dos herpesvírus. Após a infecção primária, o vírus permanece em estado de latência vitalícia no interior das células brancas do sangue, podendo reativar-se sob condições específicas de estresse celular ou imunossupressão.",
    mostCommonBrazil: true,
    aliases: ["citomegalovirus", "cmv", "sorologia citomegalovirus", "cmv igg", "cmv igm", "anti cmv", "anti-cmv igg", "anti-cmv igm"],
    labExamples: [
      { lab: "Fleury", label: "CITOMEGALOVIRUS ANTICORPOS IGG E IGM" },
      { lab: "Lavoisier", label: "SOROLOGIA PARA CITOMEGALOVIRUS (CMV)" }
    ],
    optimalRange: "Não Reagente para IgM | IgG pode ser reagente como cicatriz imunológica de infecção pregressa segura",
    symptomsHigh: "Em infecções agudas ou reativações: fadiga inexplicada e persistente, dores de cabeça intermitentes, febre recorrente moderada, inflamação hepática sutil e gânglios inchados cervicais.",
    symptomsLow: "Ausência de resposta imunológica ou de infecção latente pelo vírus.",
    recommendations: [
      "Altamente relevante para mulheres grávidas ou que planejam engravidar devido ao risco de transmissão congênita; nesses casos, o controle sorológico deve ser rigoroso.",
      "Se houver reativação recorrente de herpes/CMV, focar no fortalecimento da imunidade celular através de manejo de estresse, uso de antioxidantes (L-lisina, selênio, própolis verde e vitamina C).",
      "Qualquer alteração suspeita com IgM reagente forte em imunocomprometidos requer avaliação imediata de um Infectologista."
    ]
  },
  {
    canonicalName: "Interleucina-6 (IL-6)",
    category: "Autoimunidade",
    description: "Citocina multifuncional produzida por macrófagos, células endoteliais e adipócitos que desempenha um papel duplo: atua como sinalizadora pró-inflamatória em processos crônicos e como moduladora de sobrevivência em regeneração celular. É o principal estímulo hepático para a produção da Proteína C-Reativa (PCR).",
    mostCommonBrazil: false,
    aliases: ["il6", "il-6", "interleucina 6", "dosagem de interleucina 6", "interleucina-6"],
    labExamples: [
      { lab: "Fleury", label: "INTERLEUCINA 6 (IL-6), DOSAGEM" },
      { lab: "Alta", label: "IL-6 (INTERLEUCINA-6) SÉRICA" }
    ],
    optimalRange: "Menor que 3.0 pg/mL (Ausência ou níveis baixos de inflamação sistêmica ativa)",
    symptomsHigh: "Fadiga matinal severa, brain fog persistente, dores articulares sem causa aparente, dores de cabeça crônicas, distúrbios de sono e propensão a transtornos de humor induzidos por inflamação.",
    symptomsLow: "Nível fisiológico ótimo, correspondendo a um estado imunológico equilibrado e de baixo risco metabólico/cardiovascular por esta via.",
    recommendations: [
      "A IL-6 elevada serve como um alerta biológico de inflamação de baixo grau crônica que predispõe à aterosclerose e disfunção mitocondrial.",
      "Para modular os níveis para baixo, priorizar o controle da gordura abdominal (visceral), remoção de óleos vegetais industriais refinados, e investir em suplementações anti-inflamatórias como curcumina padronizada, resveratrol e quercetina.",
      "Importante analisar conjuntamente com a PCR Ultrassensível e Homocisteína."
    ]
  },
  {
    canonicalName: "Zinco Eritrocitário",
    category: "Nutrientes",
    description: "Quantificação do mineral zinco presente no interior das células vermelhas do sangue (eritrócitos). Trata-se de uma análise muito mais sensível e clinicamente relevante para o mapeamento dos estoques reais do organismo do que o zinco sérico tradicional, refletindo a reserva intracelular de longo prazo e o suporte a mais de 300 enzimas metalodependentes.",
    mostCommonBrazil: false,
    aliases: ["zinco eritrocitario", "zinco intracelular", "dosagem de zinco eritrocitario", "zinco eritrocito"],
    labExamples: [
      { lab: "Fleury", label: "ZINCO ERITROCITARIO, INTERIOR DAS HEMACIAS" },
      { lab: "Delboni", label: "ZINCO ERITROCITÁRIO, DOSAGEM" }
    ],
    optimalRange: "50 a 85 mcg/100 mL de hemácias empacotadas (Nível intracelular de excelência)",
    symptomsHigh: "Embora raro fadigante, níveis elevados por auto-suplementação excessiva sem monitoramento podem induzir deficiência severa e secundária de cobre e distúrbios digestivos agudos.",
    symptomsLow: "Queda de cabelo persistente, unhas quebradiças com manchas esbranquiçadas, cicatrização visivelmente lenta, imunidade fragilizada (resfriados constantes), baixa energia celular e diminuição de testosterona ou libido.",
    recommendations: [
      "Ideal para rastrear deficiência mineral real quando o zinco sérico comum oscila por conta de variações agudas do dia a dia (o zinco sérico cai facilmente em qualquer episódio inflamatório leve simulado).",
      "Caso esteja baixo, otimizar com alimentos ricos (sementes de abóbora, ostras, carne bovina orgânica) ou suplementar com Zinco Quelato (como Bisglicinato de Zinco) acompanhado de doses mínimas proporcionais de Cobre Quelato.",
      "Recomenda-se realizar a dosagem a cada 6 ou 12 meses sempre que estiver em protocolo de suplementação contínua de alta dose."
    ]
  }
];

export function normalizeAndMatchExam(rawName: string): string {
  if (!rawName) return "";
  const clean = rawName.trim().replace(/\s+/g, ' ');
  const norm = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const normClean = norm.replace(/[-_()/\\+,.:;]/g, ' ');

  // 1st Priority: Match exact dictionary items aliases
  for (const item of EXAM_GLOSSARY) {
    if (rawName.toLowerCase() === item.canonicalName.toLowerCase()) {
      return item.canonicalName;
    }
    for (const alias of item.aliases) {
      if (normClean === alias || normClean.includes(" " + alias + " ") || normClean.startsWith(alias + " ") || normClean.endsWith(" " + alias)) {
        return item.canonicalName;
      }
    }
  }

  // Fallback to simpler keyword checking to bypass specific structures
  const words = normClean.split(/\s+/).filter(Boolean);

  // Colesteróis Direct Matches
  if (words.includes('colesterol') || words.includes('cholesterol')) {
    if (words.includes('hdl')) return 'HDL - Colesterol';
    if (words.includes('ldl')) return 'LDL - Colesterol';
    if (words.includes('vldl')) return 'VLDL - Colesterol';
    if (words.includes('total') || words.includes('totais')) return 'Colesterol Total';
    return 'Colesterol Total';
  }
  if (words.includes('hdl')) return 'HDL - Colesterol';
  if (words.includes('ldl')) return 'LDL - Colesterol';
  if (words.includes('vldl')) return 'VLDL - Colesterol';

  // Triglicérides Direct Matches
  if (normClean.includes('triglicerid') || normClean.includes('trigliceri')) {
    return 'Triglicérides';
  }

  // Glicemias
  if (normClean.includes('glicose') || normClean.includes('glicemia')) {
    if (normClean.includes('pos prandial') || normClean.includes('posprandial')) {
      return 'Glicose Pós-Prandial';
    }
    return 'Glicose em Jejum';
  }

  // FAN checks
  const isFan = normClean.includes('fator antinuclear') || words.includes('fan');
  if (isFan) {
    if (normClean.includes('nucleolar')) {
      return 'FAN - Nucleolar';
    }
    if (normClean.includes('nuclear') && !normClean.includes('nucleolar')) {
      return 'FAN - Nuclear';
    }
    if (normClean.includes('mitotico') || normClean.includes('aparelho mitotico')) {
      return 'FAN - Aparelho Mitótico';
    }
    if (normClean.includes('citoplasmatico') || normClean.includes('citoplasma')) {
      return 'FAN - Citoplasmático';
    }
    if (normClean.includes('placa') || normClean.includes('cromossomica') || normClean.includes('metafasica')) {
      return 'FAN - Placa Cromossômica Metafásica';
    }
    return 'Fator Antinuclear (FAN) / Auto-anticorpos';
  }

  // Outros marcadores de lupus e autoimunidade
  if (normClean.includes('dupla helice') || normClean.includes('dsdna') || (normClean.includes('anti') && normClean.includes('dna')) || words.includes('dsdna')) {
    return 'Anticorpo Anti-DNA Dupla Hélice (dsDNA)';
  }
  if (normClean.includes('anti sm') || normClean.includes('anti smith') || words.includes('antism') || (words.includes('anti') && words.includes('sm'))) {
    return 'Anticorpo Anti-Sm';
  }
  if (normClean.includes('anti ro') || normClean.includes('anti ssa') || words.includes('ssa') || (words.includes('anti') && words.includes('ro'))) {
    return 'Anticorpo Anti-Ro (SSA)';
  }
  if (normClean.includes('anti la') || normClean.includes('anti ssb') || words.includes('ssb') || (words.includes('anti') && words.includes('la'))) {
    return 'Anticorpo Anti-La (SSB)';
  }
  if (normClean.includes('anticoagulante lupico') || words.includes('lupico')) {
    return 'Anticoagulante Lúpico';
  }
  if (normClean.includes('complemento c3') || (words.includes('c3') && normClean.includes('complemento'))) {
    return 'Complemento C3';
  }
  if (normClean.includes('complemento c4') || (words.includes('c4') && normClean.includes('complemento'))) {
    return 'Complemento C4';
  }
  if (normClean.includes('hla b27') || words.includes('hlab27') || normClean.includes('antigeno hla')) {
    return 'Antígeno HLA-B27';
  }
  if (normClean.includes('anca') || normClean.includes('anticitoplasma de neutrofilo') || words.includes('panca') || words.includes('canca')) {
    return 'ANCA (Anticorpos Anticitoplasma de Neutrófilos)';
  }
  if (normClean.includes('scl 70') || normClean.includes('scl70') || normClean.includes('topoisomerase')) {
    return 'Anticorpo Anti-Scl-75 / Anti-Scl-70';
  }
  if (normClean.includes('anti jo 1') || normClean.includes('jo 1') || normClean.includes('jo1')) {
    return 'Anticorpo Anti-Jo-1';
  }
  if (normClean.includes('anti centromero') || normClean.includes('centromero')) {
    return 'Anticorpo Anti-Centrômero';
  }
  if (normClean.includes('cardiolipina')) {
    return 'Anticorpos Anti-Cardiolipina (IgG / IgM)';
  }
  if (normClean.includes('ch50') || normClean.includes('ch 50') || normClean.includes('capacidade hemolitica total')) {
    return 'Complemento Total (CH50)';
  }

  // Vitamina D
  if (
    normClean.includes('vitamina d') || 
    normClean.includes('vit d') || 
    normClean.includes('25oh') || 
    normClean.includes('25-oh') || 
    normClean.includes('25 oh') || 
    normClean.includes('25 hidroxivitamina d')
  ) {
    if (normClean.includes('1 25') || normClean.includes('1,25') || normClean.includes('1.25')) {
      return 'Vitamina D (1,25-di-hidróxi)';
    }
    return 'Vitamina D (25-hidróxi)';
  }

  // Otimização para detecção de Vitaminas - Complexo B
  if (/\b(vitamina\s+b12|vit\s*b12|\bb-?12\b|\bb\s*12\b|cianocobalamina)\b/.test(normClean)) return 'Vitamina B12';
  if (/\b(vitamina\s+b1|vit\s*b1|tiamina|\bb-?1\b|\bb\s*1\b)\b/.test(normClean)) return 'Vitamina B1 (Tiamina)';
  if (/\b(vitamina\s+b2|vit\s*b2|riboflavina|\bb-?2\b|\bb\s*2\b)\b/.test(normClean)) return 'Vitamina B2 (Riboflavina)';
  if (/\b(vitamina\s+b3|vit\s*b3|niacina|nicotinamida|\bb-?3\b|\bb\s*3\b)\b/.test(normClean)) return 'Vitamina B3 (Niacina)';
  if (/\b(vitamina\s+b5|vit\s*b5|acido\s+pantotenico|\bb-?5\b|\bb\s*5\b)\b/.test(normClean)) return 'Vitamina B5 (Ácido Pantotênico)';
  if (/\b(vitamina\s+b6|vit\s*b6|piridoxina|\bb-?6\b|\bb\s*6\b)\b/.test(normClean)) return 'Vitamina B6 (Piridoxina)';
  if (/\b(vitamina\s+b7|vit\s*b7|biotina|vitamina\s+h|\bb-?7\b|\bb\s*7\b)\b/.test(normClean)) return 'Vitamina B7 (Biotina)';
  
  const isFolicAcid = /\b(acido\s+folico|vitamina\s+b9|vit\s*b9|folato|\bb-?9\b|\bb\s*9\b)\b/.test(normClean) && !normClean.includes('antagonista');
  if (isFolicAcid) return 'Ácido Fólico (Vitamina B9)';

  // Outras Vitaminas
  if (/\b(vitamina\s+a|vit\s+a|retinol)\b/.test(normClean)) return 'Vitamina A (Retinol)';
  if (/\b(vitamina\s+c|vit\s+c|acido\s+ascorbico)\b/.test(normClean)) return 'Vitamina C (Ácido Ascórbico)';
  if (/\b(vitamina\s+e|vit\s+e|tocoferol)\b/.test(normClean)) return 'Vitamina E (Tocoferol)';
  if (/\b(vitamina\s+k|vit\s+k\d?|filoquinona|menaquinona)\b/.test(normClean)) return 'Vitamina K';

  // TSH & T3/T4
  if (normClean.includes('t4 livre') || (normClean.includes('tiroxina') && normClean.includes('livre'))) {
    return 'Tiroxina (T4) Livre';
  }
  if (normClean.includes('t3 livre') || (normClean.includes('triiodotironina') && normClean.includes('livre'))) {
    return 'Triiodotironina (T3) Livre';
  }
  if (words.includes('tsh') || normClean.includes('hormonio estimulante da tireoide')) {
    return 'TSH';
  }

  // Liver Transaminases
  if (words.includes('tgp') || words.includes('alt') || normClean.includes('alanina aminotransferase')) {
    return 'TGP (ALT)';
  }
  if (words.includes('tgo') || words.includes('ast') || normClean.includes('aspartato aminotransferase')) {
    return 'TGO (AST)';
  }
  if (normClean.includes('gama gt') || words.includes('ggt') || normClean.includes('gama glutamil') || normClean.includes('gamagt')) {
    return 'Gama-Glutamil Transferase (Gama GT)';
  }

  // Kidneys
  if (normClean.includes('creatinina')) return 'Creatinina';
  if (normClean.includes('ureia')) return 'Ureia';

  // Inflammations
  if (normClean.includes('proteina c reativa') || words.includes('pcr')) {
    return 'Proteína C-Reativa (PCR)';
  }
  if (words.includes('vhs') || normClean.includes('hemossedimentacao') || normClean.includes('velocidade de sedimentacao')) {
    return 'VHS (Velocidade de Hemossedimentação)';
  }

  // Muscle & General Cell Injury
  if (words.includes('cpk') || words.includes('ck') || normClean.includes('creatinoquinase') || normClean.includes('creatinofosfoquinase')) {
    return 'CPK (Creatinoquinase)';
  }
  if (words.includes('ldh') || words.includes('dhl') || normClean.includes('desidrogenase lactica')) {
    return 'Desidrogenase Láctica (LDH/DHL)';
  }

  // Blood Cells
  if (words.includes('hemoglobina') || words.includes('hb')) return 'Hemoglobina';
  if (words.includes('hematocrito') || words.includes('ht')) return 'Hematócrito';
  if (normClean.includes('eritrocitos') || normClean.includes('hemacias') || words.includes('eritrocito') || words.includes('hemacia')) {
    if (words.includes('vcm')) return 'VCM';
    if (words.includes('hcm')) return 'HCM';
    if (words.includes('chcm')) return 'CHCM';
    return 'Eritrócitos (Hemácias)';
  }
  if (normClean.includes('leucocitos') || words.includes('leucocito')) return 'Leucócitos';
  if (normClean.includes('plaquetas') || words.includes('plaqueta')) return 'Plaquetas';

  // Ultrassonografia / USG / Diagnóstico por Imagem
  if (normClean.includes('ultrassonografia') || normClean.includes('ultrassom') || words.includes('usg') || words.includes('us')) {
    if (normClean.includes('transvaginal')) {
      return 'Ultrassonografia Pélvica Transvaginal';
    }
    if (normClean.includes('superior')) {
      return 'Ultrassonografia de Abdome Superior';
    }
    if (normClean.includes('abdome') || normClean.includes('abdominal')) {
      return 'Ultrassonografia de Abdome Total';
    }
    if (normClean.includes('tireoide') || normClean.includes('tiroide')) {
      return 'Ultrassonografia de Tireoide';
    }
    if (normClean.includes('carotida') || normClean.includes('carotidas')) {
      return 'USG de Carótidas e Vertebrais com Doppler';
    }
    if (normClean.includes('mama') || normClean.includes('mamas')) {
      return 'Ultrassonografia de Mamas';
    }
  }

  // Raio-X / RX
  if (normClean.includes('raio x') || words.includes('rx') || normClean.includes('radiografia') || normClean.includes('raio-x')) {
    if (normClean.includes('torax')) {
      return 'Raio-X de Tórax';
    }
    if (normClean.includes('coluna')) {
      return 'Radiografia de Coluna';
    }
  }

  // Tomografia Computadorizada
  if (normClean.includes('tomografia') || words.includes('tc')) {
    if (normClean.includes('torax') || normClean.includes('pulmao') || normClean.includes('pulmonar')) {
      return 'Tomografia Computadorizada de Tórax';
    }
    if (normClean.includes('abdome') || normClean.includes('abdominal')) {
      return 'Tomografia Computadorizada de Abdome Total';
    }
  }

  // Ressonância Magnética
  if (normClean.includes('ressonancia') || words.includes('rm') || words.includes('rmn')) {
    if (normClean.includes('cranio') || normClean.includes('encefalo') || normClean.includes('cerebro') || normClean.includes('cerebral')) {
      return 'Ressonância Magnética do Crânio';
    }
    if (normClean.includes('lombar') || normClean.includes('lombossacra')) {
      return 'Ressonância Magnética de Coluna Lombar';
    }
    if (normClean.includes('cervical')) {
      return 'Ressonância Magnética de Coluna Cervical';
    }
    if (normClean.includes('joelho')) {
      return 'Ressonância Magnética de Joelho';
    }
  }

  // Ecocardiograma & Eletrocardiograma
  if (normClean.includes('ecocardiograma') || normClean.includes('ecocardiografia') || words.includes('eco')) {
    return 'Ecocardiograma Transtorácico';
  }
  if (normClean.includes('eletrocardiograma') || words.includes('ecg')) {
    return 'Eletrocardiograma (ECG)';
  }

  // Cardiovascular ambulatorial / esforço
  if (normClean.includes('holter')) {
    return 'Holter 24 Horas';
  }
  if (words.includes('mapa') || normClean.includes('m.a.p.a') || normClean.includes('monitorizacao ambulatorial')) {
    return 'M.A.P.A. (Monitorização Ambulatorial da Pressão Arterial)';
  }
  if (normClean.includes('ergometrico') || normClean.includes('esforco') || normClean.includes('esteira')) {
    return 'Teste Ergométrico Computadorizado';
  }
  if (normClean.includes('doppler') && (normClean.includes('membro') || normClean.includes('perna') || normClean.includes('venoso') || normClean.includes('arterial'))) {
    return 'Doppler Colorido de Membros Inferiores';
  }

  // Outros Exames de Imagem / Endoscópicos
  if (normClean.includes('endoscopia')) return 'Endoscopia Digestiva Alta';
  if (normClean.includes('colonoscopia')) return 'Colonoscopia';
  if (normClean.includes('mamografia')) return 'Mamografia Digital';
  if (normClean.includes('densitometria')) return 'Densitometria Óssea';

  // Hormônios Sexuais, HOMA & Outros Otimizados
  if (normClean.includes('estradiol')) return 'Estradiol';
  if (normClean.includes('progesterona')) return 'Progesterona';
  if (words.includes('shbg')) return 'SHBG (Globulina Carreadora)';
  if (normClean.includes('homa ir') || normClean.includes('homa-ir') || normClean.includes('homa beta') || normClean.includes('homa-beta')) {
    return 'HOMA-IR & HOMA-Beta';
  }
  if (words.includes('eas') || normClean.includes('urina tipo 1') || normClean.includes('urina tipo i')) {
    return 'Urina Tipo I (EAS)';
  }
  if (normClean.includes('urocultura') || (normClean.includes('cultura') && normClean.includes('urina'))) {
    return 'Urocultura com Antibiograma';
  }
  if (normClean.includes('bilirrubina')) {
    return 'Bilirrubinas (Total e Frações)';
  }
  if (normClean.includes('beta hcg') || normClean.includes('betahcg') || words.includes('hcg') || normClean.includes('gravidez')) {
    return 'Beta HCG Quantitativo';
  }
  if (normClean.includes('saturacao') && normClean.includes('transferrina')) {
    return 'Saturação de Transferrina';
  }
  if (normClean.includes('tibc') || normClean.includes('ctlf') || (normClean.includes('capacidade') && normClean.includes('ferro'))) {
    return 'Capacidade Total de Ligação do Ferro (TIBC)';
  }
  if (normClean.includes('insulina')) {
    return 'Insulina Sérica';
  }
  if (normClean.includes('prolactina') || words.includes('prl')) {
    return 'Prolactina Sérica';
  }
  if (normClean.includes('dhea s') || normClean.includes('dheas') || normClean.includes('deidroepiandrosterona') || words.includes('sdhea')) {
    return 'DHEA-S (Sulfato de Deidroepiandrosterona)';
  }
  if (words.includes('pth') || normClean.includes('paratormonio')) {
    return 'PTH (Paratormônio Intacto)';
  }
  if (normClean.includes('homocisteina')) {
    return 'Homocisteína Plasmática';
  }
  if (normClean.includes('cortisol salivar') || (normClean.includes('cortisol') && normClean.includes('saliva'))) {
    return 'Cortisol Salivar';
  }
  if (normClean.includes('peptideo c') || normClean.includes('peptideo-c') || normClean.includes('c-peptide') || normClean.includes('c peptide')) {
    return 'Peptídeo C';
  }
  if (normClean.includes('igf 1') || normClean.includes('igf-1') || normClean.includes('somatomedina')) {
    return 'IGF-1 (Somatomedina C)';
  }
  if (normClean.includes('aldosterona')) {
    return 'Aldosterona Sérica';
  }
  if (normClean.includes('renina') || words.includes('arp')) {
    return 'Atividade de Renina Plasmática (ARP)';
  }
  if (normClean.includes('eletroforese') && (normClean.includes('proteina') || normClean.includes('proteinas'))) {
    return 'Eletroforese de Proteínas';
  }
  if (normClean.includes('gasometria arterial')) {
    return 'Gasometria Arterial';
  }
  if (normClean.includes('gasometria venosa')) {
    return 'Gasometria Venosa';
  }
  if (normClean.includes('fator reumatoide') || words.includes('fr')) {
    return 'Fator Reumatoide (FR)';
  }
  if (normClean.includes('anti ccp') || normClean.includes('anti-ccp')) {
    return 'Anti-CCP (Anticorpos Anti-Peptídeo Citrulinado Cíclico)';
  }
  if (normClean.includes('apo a1') || normClean.includes('apo a-1') || normClean.includes('apolipoproteina a')) {
    return 'Apolipoproteína A-1 (Apo A-1)';
  }
  if (normClean.includes('apo b') || normClean.includes('apolipoproteina b')) {
    return 'Apolipoproteína B (Apo B)';
  }
  if (normClean.includes('tempo de protrombina') || (normClean.includes('protrombina') && (normClean.includes('tempo') || normClean.includes('atividade') || normClean.includes('tap') || words.includes('tp')))) {
    return 'Tempo de Protrombina (TP / TAP)';
  }
  if (normClean.includes('tromboplastina') || normClean.includes('ttpa') || words.includes('ptt')) {
    return 'Tempo de Tromboplastina Parcial Ativada (TTPA)';
  }
  if (normClean.includes('sangue oculto') || (normClean.includes('oculto') && normClean.includes('fezes'))) {
    return 'Pesquisa de Sangue Oculto nas Fezes';
  }
  if (normClean.includes('parasitologico') || words.includes('epf')) {
    return 'Parasitológico de Fezes (EPF)';
  }
  if (normClean.includes('vdrl') || normClean.includes('sifilis')) {
    return 'VDRL (Sorologia para Sífilis)';
  }
  if (normClean.includes('anti hiv') || normClean.includes('antihiv') || words.includes('hiv')) {
    return 'Sorologia para HIV (HIV 1 e 2)';
  }
  if (normClean.includes('hbsag') || normClean.includes('antigeno australia') || (normClean.includes('hepatite b') && (normClean.includes('ag') || normClean.includes('antigeno') || normClean.includes('superficie')))) {
    return 'HBsAg (Antígeno de Superfície do Vírus da Hepatite B)';
  }
  if (normClean.includes('toxoplasmose') || normClean.includes('toxo IgG') || normClean.includes('toxo IgM') || normClean.includes('toxo')) {
    return 'Toxoplasmose IgG e IgM';
  }
  if (normClean.includes('eletroforese') && normClean.includes('hemoglobina')) {
    return 'Eletroforese de Hemoglobina';
  }
  if (words.includes('cd4') || words.includes('cd8') || words.includes('cd3') || normClean.includes('subpopulacao linfocitaria') || normClean.includes('linfocitos t cd4')) {
    return 'Subpopulações de Linfócitos T (CD3, CD4 e CD8)';
  }
  if (normClean.includes('valproico') || normClean.includes('valproato')) {
    return 'Ácido Valproico Sérico';
  }
  if (normClean.includes('carbamazepina')) {
    return 'Carbamazepina Sérica';
  }
  if (normClean.includes('anti tpo') || normClean.includes('antitpo') || normClean.includes('peroxidase tireoidiana')) {
    return 'Anticorpos Anti-Peroxidase Tireoidiana (Anti-TPO)';
  }
  if (normClean.includes('anti tg') || normClean.includes('antitg') || normClean.includes('anti tireoglobulina') || normClean.includes('antitireoglobulina')) {
    return 'Anticorpos Anti-Tireoglobulina (Anti-Tg)';
  }
  if (normClean.includes('albumina')) {
    return 'Albumina Sérica';
  }
  if (normClean.includes('aslo') || normClean.includes('aso') || normClean.includes('antiestreptolisina')) {
    return 'ASLO (Antiestreptolisina O)';
  }
  if (normClean.includes('lactato') || normClean.includes('latico')) {
    return 'Lactato Sérico (Ácido Lático)';
  }
  if (normClean.includes('anti hcv') || normClean.includes('antihcv') || (normClean.includes('hepatite c') && normClean.includes('sorologia'))) {
    return 'Sorologia para Hepatite C (Anti-HCV)';
  }
  if (normClean.includes('papanicolau') || normClean.includes('preventivo cervical') || normClean.includes('colpocitologia')) {
    return 'Citopatológico Cérvico-Vaginal (Papanicolau)';
  }
  if (normClean.includes('zinco')) return 'Zinco Sérico';
  if (normClean.includes('selenio')) return 'Selênio Sérico';

  return clean.split(' ').map(word => {
    const upper = word.toUpperCase();
    if (['FAN', 'PCR', 'ALT', 'AST', 'GGT', 'TSH', 'T3', 'T4', 'CPK', 'CK', 'DHL', 'LDH', 'ANCA', 'HIV', 'SSA', 'SSB', 'RNP', 'DHEA', 'FSH', 'PSA', 'ACTH', 'PTH', 'PRL', 'ARP', 'IGF1', 'FR', 'CCP', 'VDRL', 'HBSAG', 'HCV', 'TP', 'TAP', 'TTPA', 'PTT', 'TPO', 'TG', 'ASLO', 'ASO'].includes(upper)) {
      return upper;
    }
    return word;
  }).join(' ');
}
