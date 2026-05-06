export interface QuizOption {
  text: string;
  points: number;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Hoje, como a nova NR-1 (inclusão dos riscos psicossociais) está sendo tratada na sua empresa na prática?",
    options: [
      { text: "Ainda estamos tentando entender o que precisa ser feito.", points: 0 },
      { text: "Temos iniciativas, mas sem estrutura clara.", points: 5 },
      { text: "Já temos uma abordagem estruturada.", points: 10 },
    ],
  },
  {
    question: "Vocês já fizeram um diagnóstico estruturado de riscos psicossociais, olhando para contexto, cultura, liderança e modelo de trabalho?",
    options: [
      { text: "Ainda não, só percepções soltas.", points: 0 },
      { text: "Já fizemos algo pontual, mas sem método contínuo.", points: 5 },
      { text: "Sim, existe diagnóstico organizado e revisado periodicamente.", points: 10 },
    ],
  },
  {
    question: "Como os riscos psicossociais aparecem hoje na gestão da empresa?",
    options: [
      { text: "Aparecem só quando estoura um problema (processo, afastamento, conflito).", points: 0 },
      { text: "Aparecem em algumas iniciativas (palestras, campanhas), mas sem conexão clara com o PGR.", points: 5 },
      { text: "Estão integrados ao GRO/PGR e à governança do trabalho, com plano de ação contínuo.", points: 10 },
    ],
  },
  {
    question: "Sobre canais de escuta dos colaboradores, como está hoje?",
    options: [
      { text: "Não existe um canal estruturado e seguro, é tudo na base da conversa informal.", points: 0 },
      { text: "Temos canais, mas pouca confiança das pessoas em usar.", points: 5 },
      { text: "Há canal seguro, com processos claros de acolhimento, registro e resposta.", points: 10 },
    ],
  },
  {
    question: "Quando o assunto é liderança e saúde mental, o que mais se aproxima da sua realidade?",
    options: [
      { text: "A liderança é cobrada por resultado, mas quase não é preparada para lidar com riscos psicossociais.", points: 0 },
      { text: "Alguns líderes recebem orientação, mas não de forma estruturada.", points: 5 },
      { text: "Liderança é treinada e acompanha indicadores ligados ao ambiente de trabalho e saúde mental.", points: 10 },
    ],
  },
  {
    question: "O modelo de trabalho da sua empresa (carga, metas, ritmo, autonomia) é revisado considerando os riscos psicossociais?",
    options: [
      { text: "Não, o modelo é definido só por demanda de negócio.", points: 0 },
      { text: "Revisamos em alguns casos, quando o problema já ficou evidente.", points: 5 },
      { text: "Há análise prévia e ajustes estruturais para reduzir exposição a riscos.", points: 10 },
    ],
  },
  {
    question: "Como vocês lidam com evidências para proteção jurídica ligadas à NR-1?",
    options: [
      { text: "Praticamente não temos evidências organizadas.", points: 0 },
      { text: "Temos alguns registros, mas espalhados e difíceis de demonstrar.", points: 5 },
      { text: "Mantemos evidências técnicas organizadas, vinculadas às ações do GRO/PGR.", points: 10 },
    ],
  },
  {
    question: "A empresa acompanha afastamentos, turnover, presenteísmo e ações trabalhistas como indicadores de risco psicossocial?",
    options: [
      { text: "Não conectamos esses indicadores com riscos psicossociais.", points: 0 },
      { text: "Até olhamos alguns indicadores, mas sem análise aprofundada.", points: 5 },
      { text: "Monitoramos, cruzamos dados e usamos isso para ajustar o modelo de trabalho.", points: 10 },
    ],
  },
  {
    question: "Quando fala de NR-1, a sua empresa está mais focada em:",
    options: [
      { text: "Evitar multa e 'cumprir tabela' documental.", points: 0 },
      { text: "Equilibrar obrigações legais e algumas ações de ambiente de trabalho.", points: 5 },
      { text: "Transformar exigência legal em governança, produtividade e sustentabilidade organizacional.", points: 10 },
    ],
  },
  {
    question: "Qual é o próximo passo que você sente que a empresa está pronta para dar em NR-1 e riscos psicossociais?",
    options: [
      { text: "Começar a entender melhor o tema e organizar o básico.", points: 0 },
      { text: "Estruturar um diagnóstico sério e começar a organizar ações.", points: 5 },
      { text: "Integrar ou revisar o GRO/PGR com foco forte em riscos psicossociais, com apoio especializado.", points: 10 },
    ],
  },
];

// ============================================================
// Reputação Organizacional (0–100) — dimensão independente
// ============================================================
export const reputationQuestions: QuizQuestion[] = [
  {
    question: "As pessoas se sentem à vontade para reportar erros ou problemas sem medo de punição?",
    options: [
      { text: "Não", points: 0 },
      { text: "Parcialmente", points: 5 },
      { text: "Sim", points: 10 },
    ],
  },
  {
    question: "A liderança é vista como exemplo de coerência e equilíbrio emocional?",
    options: [
      { text: "Não", points: 0 },
      { text: "Parcialmente", points: 5 },
      { text: "Sim", points: 10 },
    ],
  },
  {
    question: "Os papéis e responsabilidades da equipe estão claros no dia a dia?",
    options: [
      { text: "Não", points: 0 },
      { text: "Parcialmente", points: 5 },
      { text: "Sim", points: 10 },
    ],
  },
  {
    question: "A comunicação entre áreas acontece sem ruído ou tensão frequente?",
    options: [
      { text: "Não", points: 0 },
      { text: "Parcialmente", points: 5 },
      { text: "Sim", points: 10 },
    ],
  },
  {
    question: "A empresa age com transparência frente a crises ou erros?",
    options: [
      { text: "Não", points: 0 },
      { text: "Parcialmente", points: 5 },
      { text: "Sim", points: 10 },
    ],
  },
];

export interface ReputationResult {
  score: number; // 0–100
  level: string;
  text: string;
}

export function getReputationResult(answers: number[]): ReputationResult {
  const total = answers.reduce((a, b) => a + b, 0);
  const max = reputationQuestions.length * 10;
  const score = Math.round((total / max) * 100);
  if (score <= 40) {
    return {
      score,
      level: "Reputação Frágil",
      text: "A percepção interna de segurança psicológica, liderança e clareza organizacional está baixa. Esse cenário enfraquece a marca empregadora e aumenta o risco de exposição pública.",
    };
  }
  if (score <= 70) {
    return {
      score,
      level: "Reputação em Construção",
      text: "Há sinais positivos em segurança psicológica e liderança, mas ainda existem inconsistências que afetam a percepção interna e externa da empresa.",
    };
  }
  return {
    score,
    level: "Reputação Sólida",
    text: "A empresa já demonstra ambiente psicologicamente seguro, liderança coerente e clareza organizacional — fatores que fortalecem reputação e atração de talentos.",
  };
}

// ============================================================
// Impacto Financeiro Estimado (faixa em R$)
// ============================================================
export interface FinancialImpact {
  min: number;
  max: number;
  label: string;
  perdaProdMin: number;
  perdaProdMax: number;
  custoRotatividade: number;
  riscoTrabMin: number;
  riscoTrabMax: number;
  multaMin: number;
  multaMax: number;
}

export function getFinancialImpact(riskScore: number, reputationScore: number): FinancialImpact {
  // Quanto pior risco (score menor) e reputação (score menor), maior o impacto estimado anual
  const riskSeverity = (100 - riskScore) / 100;
  const repSeverity = (100 - reputationScore) / 100;
  const severity = (riskSeverity * 0.6 + repSeverity * 0.4); // 0–1

  // Base values for estimation (avg company size assumed for quiz)
  const baseFat = 15000000; // 15M
  const numColab = 100;

  const perdaProdMin = Math.round(baseFat * (0.01 + severity * 0.04));
  const perdaProdMax = Math.round(baseFat * (0.03 + severity * 0.06));

  const custoRotatividade = Math.round(numColab * (0.1 + severity * 0.15) * 15000);

  const multaMin = Math.round(20000 + severity * 180000);
  const multaMax = Math.round(80000 + severity * 420000);

  const riscoTrabMin = severity > 0.5 ? Math.round(50000 + severity * 200000) : 0;
  const riscoTrabMax = severity > 0.5 ? Math.round(150000 + severity * 600000) : 0;

  const min = perdaProdMin + custoRotatividade + multaMin + riscoTrabMin;
  const max = perdaProdMax + custoRotatividade + multaMax + riscoTrabMax;

  let label = "Impacto contido";
  if (severity > 0.6) label = "Impacto crítico";
  else if (severity > 0.35) label = "Impacto relevante";

  return { min, max, label, perdaProdMin, perdaProdMax, custoRotatividade, riscoTrabMin, riscoTrabMax, multaMin, multaMax };
}

export function formatBRL(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000) return `R$ ${Math.round(value / 1_000)}k`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export interface ScoreResult {
  level: string;
  color: string;
  text: string;
}

export function getScoreResult(score: number): ScoreResult {
  if (score <= 30) {
    return {
      level: "Zona de Risco",
      color: "destructive",
      text: `Seu score em NR-1 na prática ficou em ${score} de 100.\nIsso mostra que hoje a sua empresa está bastante exposta – não só a multas, mas a um custo invisível de desorganização, conflitos, afastamentos e riscos jurídicos.\nA boa notícia é que, a partir daqui, qualquer passo já traz ganho: entender melhor a norma, mapear riscos psicossociais e começar um plano mínimo de ação.`,
    };
  }
  if (score <= 60) {
    return {
      level: "Em Construção",
      color: "warning",
      text: `Seu score em NR-1 na prática ficou em ${score} de 100.\nVocês já deram alguns passos importantes: existem iniciativas, algum nível de consciência e talvez até registros pontuais.\nO desafio agora é sair da ação isolada e ir para uma gestão estruturada, que conecte diagnóstico, GRO/PGR, liderança e modelo de trabalho.`,
    };
  }
  return {
    level: "Em Blindagem",
    color: "success",
    text: `Seu score em NR-1 na prática ficou em ${score} de 100.\nIsso indica que a sua empresa já enxerga riscos psicossociais como tema de governança, e não só como obrigação legal.\nAinda assim, sempre há espaço para refinar diagnóstico, fortalecer evidências e blindar a organização em termos de saúde, produtividade e proteção jurídica.`,
  };
}
