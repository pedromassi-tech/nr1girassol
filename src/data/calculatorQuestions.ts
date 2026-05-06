export interface CalcOption {
  text: string;
  points: number;
}

export interface CalcQuestion {
  id: string;
  question: string;
  options: CalcOption[];
}

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
    label: "Estrutura da operação",
    options: [
      { value: "enxuta", label: "Enxuta" },
      { value: "equilibrada", label: "Equilibrada" },
      { value: "sobrecarregada", label: "Sobrecarregada" },
    ],
  },
] as const;

export const blocoNR1: CalcQuestion[] = [
  { id: "pgr", question: "PGR atualizado?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "pgr_psico", question: "PGR contempla riscos psicossociais?", options: [{ text: "Sim", points: 0 }, { text: "Parcial", points: 5 }, { text: "Não", points: 10 }] },
  { id: "assedio", question: "Canal formal para denúncias de assédio?", options: [{ text: "Sim", points: 0 }, { text: "Não", points: 10 }] },
];

export const blocoSinais: CalcQuestion[] = [
  { id: "afastamentos", question: "Afastamentos por saúde mental recentes?", options: [{ text: "Nenhum", points: 0 }, { text: "1 a 3", points: 5 }, { text: "Muitos", points: 10 }] },
  { id: "conflitos", question: "Ocorrência frequente de conflitos internos?", options: [{ text: "Raro", points: 0 }, { text: "Às vezes", points: 5 }, { text: "Sempre", points: 10 }] },
];

export const blocoGestao: CalcQuestion[] = [
  { id: "turnover", question: "Acompanha taxa de turnover?", options: [{ text: "Sim", points: 0 }, { text: "Não", points: 10 }] },
  { id: "lideranca", question: "Líderes treinados em riscos psicossociais?", options: [{ text: "Sim", points: 0 }, { text: "Não", points: 10 }] },
];

export const blocoReputacao: CalcQuestion[] = [
  { id: "seguranca_psicologica", question: "Existe segurança psicológica percebida?", options: [{ text: "Sim", points: 0 }, { text: "Não", points: 10 }] },
  { id: "qualidade_lideranca", question: "Como avalia a qualidade da liderança?", options: [{ text: "Boa", points: 0 }, { text: "Regular", points: 5 }, { text: "Ruim", points: 10 }] },
  { id: "organizacao_trabalho", question: "Trabalho é bem organizado?", options: [{ text: "Sim", points: 0 }, { text: "Não", points: 10 }] },
];

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

export function calculateResult(
  company: Record<string, string>,
  answers: Record<string, number>,
): CalculatorResult {
  const nr1Score = blocoNR1.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const sinaisScore = blocoSinais.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const gestaoScore = blocoGestao.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const reputacaoScore = blocoReputacao.reduce((s, q) => s + (answers[q.id] ?? 0), 0);

  const totalRiskRaw = nr1Score + sinaisScore + gestaoScore;
  const riskScore = Math.round((totalRiskRaw / 70) * 100);

  const reputationScore = 100 - Math.round((reputacaoScore / 30) * 100);

  let riskLevel = "Baixo";
  if (riskScore > 70) riskLevel = "Crítico";
  else if (riskScore > 30) riskLevel = "Significativo";

  const numColab = company.num_colaboradores === "grande" ? 1000 : company.num_colaboradores === "media" ? 250 : 50;
  const multaMin = (riskScore / 100) * 50000;
  const multaMax = (riskScore / 100) * 200000;
  
  const perdaProdMin = (riskScore / 100) * 100000;
  const perdaProdMax = (riskScore / 100) * 300000;
  const custoRotatividade = (riskScore / 100) * 80000;
  const riscoTrabMin = riskScore > 50 ? 50000 : 0;
  const riscoTrabMax = riskScore > 50 ? 200000 : 0;

  return {
    riskScore,
    riskLevel,
    riskColor: riskScore > 70 ? "destructive" : "warning",
    reputationScore,
    reputationLevel: reputationScore > 70 ? "Sólida" : reputationScore > 40 ? "Regular" : "Frágil",
    blocoNR1Score: nr1Score,
    blocoSinaisScore: sinaisScore,
    blocoGestaoScore: gestaoScore,
    blocoReputacaoScore: reputacaoScore,
    multaMin,
    multaMax,
    impactoMin: multaMin + perdaProdMin + custoRotatividade + riscoTrabMin,
    impactoMax: multaMax + perdaProdMax + custoRotatividade + riscoTrabMax,
    perdaProdMin,
    perdaProdMax,
    custoRotatividade,
    riscoTrabMin,
    riscoTrabMax
  };
}
