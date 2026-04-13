// ─── CALCULATOR DATA & LOGIC ───

export interface CalcOption {
  text: string;
  points: number;
}

export interface CalcQuestion {
  id: string;
  question: string;
  options: CalcOption[];
}

// ─── STEP 1: Company basics (not scored, used for fine/impact calc) ───
export const companyFields = [
  {
    id: "num_colaboradores",
    label: "Número de colaboradores",
    options: [
      { value: "micro", label: "Até 19" },
      { value: "pequena", label: "20 a 99" },
      { value: "media", label: "100 a 499" },
      { value: "grande", label: "500+" },
    ],
  },
  {
    id: "faturamento",
    label: "Faturamento anual aproximado",
    options: [
      { value: "ate5m", label: "Até R$ 5 milhões" },
      { value: "5a50m", label: "R$ 5 a 50 milhões" },
      { value: "50a300m", label: "R$ 50 a 300 milhões" },
      { value: "mais300m", label: "Acima de R$ 300 milhões" },
    ],
  },
  {
    id: "momento",
    label: "Momento atual da empresa",
    options: [
      { value: "crescimento", label: "Crescimento" },
      { value: "estavel", label: "Estável" },
      { value: "reestruturacao", label: "Reestruturação" },
    ],
  },
  {
    id: "estrutura",
    label: "Estrutura da operação (autopercepção)",
    options: [
      { value: "enxuta", label: "Enxuta" },
      { value: "equilibrada", label: "Equilibrada" },
      { value: "sobrecarregada", label: "Sobrecarregada" },
    ],
  },
] as const;

// ─── STEP 2: NR-1 structure (max 70 pts risk) ───
export const blocoNR1: CalcQuestion[] = [
  { id: "pgr", question: "PGR atualizado?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "pgr_psico", question: "PGR contempla riscos psicossociais?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "inventario", question: "Inventário de riscos por função/setor?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "plano_acao", question: "Plano de ação com responsáveis definidos?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "consulta", question: "Registro de consulta aos trabalhadores?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "comunicacao", question: "Comunicação estruturada dos riscos?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "assedio", question: "Política/canal formal para assédio e comportamento inadequado?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
];

// ─── STEP 3: Real risk signals (max 70 pts risk) ───
export const blocoSinais: CalcQuestion[] = [
  { id: "afastamentos", question: "Afastamentos por saúde mental no último ano?", options: [{ text: "Nenhum ou 1", points: 0 }, { text: "2 a 5", points: 5 }, { text: "Mais de 5", points: 10 }] },
  { id: "sobrecarga", question: "Frequência de sobrecarga na equipe?", options: [{ text: "Baixa", points: 0 }, { text: "Média", points: 5 }, { text: "Alta", points: 10 }] },
  { id: "pressao_metas", question: "Nível de pressão por metas e prazos?", options: [{ text: "Adequado", points: 0 }, { text: "Alto porém manejável", points: 5 }, { text: "Excessivo / frequente", points: 10 }] },
  { id: "clareza_papeis", question: "Clareza de papéis e responsabilidades?", options: [{ text: "Clara", points: 0 }, { text: "Confusa em alguns times", points: 5 }, { text: "Geralmente confusa", points: 10 }] },
  { id: "conflitos", question: "Ocorrência de conflitos internos ou denúncias?", options: [{ text: "Raro", points: 0 }, { text: "Ocasional", points: 5 }, { text: "Frequente / já virou processo", points: 10 }] },
  { id: "urgencia", question: "Sensação de urgência constante?", options: [{ text: "Não", points: 0 }, { text: "Às vezes", points: 5 }, { text: "Quase sempre", points: 10 }] },
  { id: "desgaste", question: "Percepção de desgaste emocional da equipe?", options: [{ text: "Baixo", points: 0 }, { text: "Médio", points: 5 }, { text: "Alto", points: 10 }] },
];

// ─── STEP 4: Management & performance (max 60 pts risk) ───
export const blocoGestao: CalcQuestion[] = [
  { id: "jornada", question: "Controle de jornada?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "absenteismo", question: "Acompanha absenteísmo?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "turnover", question: "Acompanha turnover?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "desligamentos", question: "Número de desligamentos no último ano?", options: [{ text: "Até 10% do quadro", points: 0 }, { text: "10–20%", points: 5 }, { text: "Mais de 20%", points: 10 }] },
  { id: "reposicao", question: "Tempo médio para repor uma vaga?", options: [{ text: "Até 30 dias", points: 0 }, { text: "30–60 dias", points: 5 }, { text: "Mais de 60 dias", points: 10 }] },
  { id: "lideranca", question: "Rotina estruturada de liderança?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
];

// ─── STEP 5: Reputation (max 50 pts) ───
export const blocoReputacao: CalcQuestion[] = [
  { id: "lideranca_percebida", question: "Como a liderança é percebida internamente?", options: [{ text: "Positivamente", points: 0 }, { text: "Neutra", points: 5 }, { text: "Negativamente", points: 10 }] },
  { id: "canal_escuta", question: "Existe canal de escuta seguro e confiável?", options: [{ text: "Sim, funciona bem", points: 0 }, { text: "Existe mas pouco usado", points: 5 }, { text: "Não existe", points: 10 }] },
  { id: "seguranca_psicologica", question: "Colaboradores sentem segurança psicológica para falar?", options: [{ text: "Sim", points: 0 }, { text: "Parcialmente", points: 5 }, { text: "Não", points: 10 }] },
  { id: "exposicao_publica", question: "Risco de exposição pública (denúncia, processo, afastamento notório)?", options: [{ text: "Nunca ocorreu", points: 0 }, { text: "Já houve caso isolado", points: 5 }, { text: "Recorrente ou em andamento", points: 10 }] },
  { id: "employer_branding", question: "A empresa atrai ou repele talentos hoje?", options: [{ text: "Atrai bem", points: 0 }, { text: "Neutro / não se destaca", points: 5 }, { text: "Dificuldade em atrair", points: 10 }] },
];

// ─── SCORING ───
export interface CalculatorResult {
  riskScore: number;
  riskLevel: string;
  riskColor: string;
  reputationScore: number;
  reputationLevel: string;
  blocoNR1Score: number;
  blocoSinaisScore: number;
  blocoGestaoScore: number;
  blocoReputacaoScore: number;
  multaMin: number;
  multaMax: number;
  impactoMin: number;
  impactoMax: number;
  perdaProdMin: number;
  perdaProdMax: number;
  custoRotatividade: number;
  riscoTrabMin: number;
  riscoTrabMax: number;
}

type Porte = "micro" | "pequena" | "media" | "grande";

function getPorte(numColab: string): Porte {
  if (numColab === "micro") return "micro";
  if (numColab === "pequena") return "pequena";
  if (numColab === "media") return "media";
  return "grande";
}

function countNaoNR1(answers: Record<string, number>): number {
  return blocoNR1.filter(q => answers[q.id] === 10).length;
}

function getMultaRange(porte: Porte, naoCount: number): [number, number] {
  const table: Record<Porte, [number, number][]> = {
    micro:   [[3000, 15000], [15000, 40000], [40000, 50000]],
    pequena: [[5000, 20000], [20000, 60000], [60000, 120000]],
    media:   [[20000, 80000], [80000, 200000], [200000, 400000]],
    grande:  [[50000, 200000], [200000, 500000], [500000, 1000000]],
  };
  const idx = naoCount <= 2 ? 0 : naoCount <= 4 ? 1 : 2;
  return table[porte][idx];
}

function getFaturamentoMid(fat: string): number {
  switch (fat) {
    case "ate5m": return 3000000;
    case "5a50m": return 25000000;
    case "50a300m": return 150000000;
    case "mais300m": return 500000000;
    default: return 10000000;
  }
}

function getCustoDesligamento(porte: Porte): number {
  switch (porte) {
    case "micro": return 8000;
    case "pequena": return 8000;
    case "media": return 15000;
    case "grande": return 25000;
  }
}

function getDesligamentosPct(answers: Record<string, number>): number {
  const pts = answers["desligamentos"] ?? 0;
  if (pts === 0) return 0.05;
  if (pts === 5) return 0.15;
  return 0.25;
}

function getNumColabMid(numColab: string): number {
  switch (numColab) {
    case "micro": return 10;
    case "pequena": return 50;
    case "media": return 250;
    case "grande": return 750;
    default: return 50;
  }
}

export function calculateResult(
  company: Record<string, string>,
  answers: Record<string, number>,
): CalculatorResult {
  const nr1Score = blocoNR1.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const sinaisScore = blocoSinais.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const gestaoScore = blocoGestao.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const reputacaoScore = blocoReputacao.reduce((s, q) => s + (answers[q.id] ?? 0), 0);

  // Risk score: based on NR1 + sinais + gestao (max 200)
  const totalRiskRaw = nr1Score + sinaisScore + gestaoScore;
  const riskScore = Math.round((totalRiskRaw / 200) * 100);

  // Reputation score: hybrid — blocoReputacao (independente) + sinais derivados de risco
  // Perguntas derivadas que impactam reputação: liderança, clareza de papéis, desgaste, conflitos, canal assédio
  const derivedRepPoints =
    (answers["lideranca"] ?? 0) +       // gestão: rotina de liderança
    (answers["clareza_papeis"] ?? 0) +   // sinais: papéis confusos = reputação fraca
    (answers["desgaste"] ?? 0) +         // sinais: desgaste emocional percebido
    (answers["conflitos"] ?? 0) +        // sinais: conflitos/denúncias
    (answers["assedio"] ?? 0);           // NR1: canal formal assédio
  // blocoReputacao max = 50, derived max = 50 → total max = 100
  const reputationRaw = reputacaoScore + derivedRepPoints;
  const reputationScore = Math.round((reputationRaw / 100) * 100);

  let riskLevel: string;
  let riskColor: string;
  if (riskScore <= 30) {
    riskLevel = "Risco Baixo";
    riskColor = "warning";
  } else if (riskScore <= 70) {
    riskLevel = "Risco Significativo";
    riskColor = "warning";
  } else {
    riskLevel = "Risco Crítico";
    riskColor = "destructive";
  }

  let reputationLevel: string;
  if (reputationScore <= 30) {
    reputationLevel = "Reputação Protegida";
  } else if (reputationScore <= 60) {
    reputationLevel = "Reputação em Alerta";
  } else {
    reputationLevel = "Reputação em Risco";
  }

  const porte = getPorte(company.num_colaboradores);
  const naoCount = countNaoNR1(answers);
  const [multaMin, multaMax] = getMultaRange(porte, naoCount);

  const fatMid = getFaturamentoMid(company.faturamento);
  let perdaProdPctMin: number, perdaProdPctMax: number;
  if (riskScore <= 30) { perdaProdPctMin = 0.005; perdaProdPctMax = 0.01; }
  else if (riskScore <= 70) { perdaProdPctMin = 0.01; perdaProdPctMax = 0.03; }
  else { perdaProdPctMin = 0.03; perdaProdPctMax = 0.06; }
  const perdaProdMin = Math.round(fatMid * perdaProdPctMin);
  const perdaProdMax = Math.round(fatMid * perdaProdPctMax);

  const numColab = getNumColabMid(company.num_colaboradores);
  const desligPct = getDesligamentosPct(answers);
  const custoDeslig = getCustoDesligamento(porte);
  const custoRotatividade = Math.round(numColab * desligPct * custoDeslig);

  let riscoTrabMin: number, riscoTrabMax: number;
  const hasConflicts = (answers["conflitos"] ?? 0) >= 5 || (answers["afastamentos"] ?? 0) >= 5;
  if (!hasConflicts) {
    riscoTrabMin = 0; riscoTrabMax = 0;
  } else {
    switch (porte) {
      case "micro": riscoTrabMin = 20000; riscoTrabMax = 100000; break;
      case "pequena": riscoTrabMin = 50000; riscoTrabMax = 200000; break;
      case "media": riscoTrabMin = 200000; riscoTrabMax = 800000; break;
      case "grande": riscoTrabMin = 500000; riscoTrabMax = 2000000; break;
    }
  }

  const impactoMin = perdaProdMin + custoRotatividade + riscoTrabMin + multaMin;
  const impactoMax = perdaProdMax + custoRotatividade + riscoTrabMax + multaMax;

  return {
    riskScore, riskLevel, riskColor,
    reputationScore, reputationLevel,
    blocoNR1Score: nr1Score, blocoSinaisScore: sinaisScore, blocoGestaoScore: gestaoScore,
    blocoReputacaoScore: reputacaoScore,
    multaMin, multaMax,
    impactoMin, impactoMax,
    perdaProdMin, perdaProdMax,
    custoRotatividade,
    riscoTrabMin, riscoTrabMax,
  };
}
