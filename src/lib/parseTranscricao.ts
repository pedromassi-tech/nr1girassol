// Gerador simples de proposta a partir de transcrição/resumo de reunião.
// 100% client-side, sem IA. Usa heurísticas + templates consultivos em pt-BR.

import {
  DEFAULT_DIFERENCIAIS,
  DEFAULT_ENTREGAVEIS,
  type ProposalDraft,
  type ProposalFase,
} from "./proposalsStore";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const cleanSentence = (s: string) => s.trim().replace(/\s+/g, " ");

function hasAny(text: string, terms: string[]): boolean {
  const t = norm(text);
  return terms.some(term => t.includes(norm(term)));
}

function findNumberNear(text: string, terms: string[], windowChars = 55): number | null {
  const t = norm(text);

  for (const rawTerm of terms) {
    const term = norm(rawTerm);

    // Padrão principal: "4 lojas", "180 colaboradores", "12 líderes"
    const beforeRegex = new RegExp(`(\\d{1,6})\\s*(?:[a-zà-ú\\s]{0,18})?${term}`, "i");
    const beforeMatch = t.match(beforeRegex);
    if (beforeMatch) return parseInt(beforeMatch[1], 10);

    // Padrão alternativo: "colaboradores: 180", "lojas são 4"
    const idx = t.indexOf(term);
    if (idx === -1) continue;
    const slice = t.slice(Math.max(0, idx - windowChars), idx + term.length + windowChars);
    const allNums = [...slice.matchAll(/\d{1,6}/g)].map(m => parseInt(m[0], 10));
    if (allNums.length) {
      // prefere número mais perto do termo
      const termPos = slice.indexOf(term);
      let best = allNums[0];
      let bestDist = Infinity;
      for (const m of slice.matchAll(/\d{1,6}/g)) {
        const dist = Math.abs((m.index ?? 0) - termPos);
        if (dist < bestDist) {
          bestDist = dist;
          best = parseInt(m[0], 10);
        }
      }
      return best;
    }
  }

  return null;
}

function extractPainPoints(text: string): string[] {
  const t = norm(text);
  const pains: string[] = [];

  if (hasAny(t, ["burnout", "saude mental", "saúde mental", "ansiedade", "adoecimento", "afastamento", "afastamentos"])) {
    pains.push("sinais de adoecimento e afastamentos relacionados à saúde mental");
  }
  if (hasAny(t, ["sobrecarga", "carga alta", "excesso de demanda", "muita demanda", "pressao", "pressão", "metas"])) {
    pains.push("sobrecarga, pressão por metas e desgaste operacional");
  }
  if (hasAny(t, ["conflito", "conflitos", "denuncia", "denúncia", "assedio", "assédio", "clima ruim", "tensao", "tensão"])) {
    pains.push("conflitos internos, ruídos de comunicação e risco reputacional");
  }
  if (hasAny(t, ["fiscalizacao", "fiscalização", "notificacao", "notificação", "multa", "processo", "passivo"])) {
    pains.push("necessidade de reduzir exposição a fiscalização, passivos e questionamentos formais");
  }
  if (hasAny(t, ["lideranca", "liderança", "lideres", "líderes", "gestores", "gestao", "gestão"])) {
    pains.push("necessidade de orientar lideranças para sustentar a mudança no dia a dia");
  }
  if (hasAny(t, ["rotatividade", "turnover", "absenteismo", "absenteísmo", "faltas", "desligamentos"])) {
    pains.push("impactos em absenteísmo, rotatividade e produtividade");
  }

  return pains;
}

function extractUrgency(text: string): string | null {
  if (hasAny(text, ["este mes", "este mês", "fim do mes", "fim do mês", "urgente", "com urgencia", "com urgência"])) {
    return "há urgência comercial e operacional para iniciar ainda neste ciclo";
  }
  if (hasAny(text, ["fiscalizacao", "fiscalização", "notificacao", "notificação"])) {
    return "existe prioridade por exposição a fiscalização ou cobrança formal";
  }
  if (hasAny(text, ["2024", "2025", "prazo", "data limite"])) {
    return "existe um marco temporal relevante citado na reunião";
  }
  return null;
}

function inferPrazoMeses(colaboradores?: number, unidades?: number, maturidade?: ProposalDraft["maturidadePgr"]): number {
  let meses = 3;
  if ((colaboradores ?? 0) > 150) meses += 1;
  if ((colaboradores ?? 0) > 500) meses += 1;
  if ((unidades ?? 0) > 3) meses += 1;
  if (maturidade === "inexistente") meses += 1;
  return Math.min(Math.max(meses, 3), 6);
}

function buildResumo(params: {
  colaboradores?: number;
  unidades?: number;
  funcoes?: number;
  modelo?: ProposalDraft["modeloTrabalho"];
  maturidade?: ProposalDraft["maturidadePgr"];
  pains: string[];
  urgency: string | null;
  transcricao: string;
}): string {
  const escopo: string[] = [];
  if (params.unidades) escopo.push(`${params.unidades} unidade(s)`);
  if (params.colaboradores) escopo.push(`${params.colaboradores} colaboradores`);
  if (params.funcoes) escopo.push(`${params.funcoes} funções/cargos`);
  if (params.modelo) escopo.push(`modelo ${params.modelo}`);

  const pgrText = params.maturidade === "inexistente"
    ? "com estruturação do PGR/GRO a partir da base inicial"
    : params.maturidade === "parcial"
      ? "com revisão e complementação do PGR/GRO existente"
      : params.maturidade === "completo"
        ? "com adequação e integração dos riscos psicossociais ao PGR/GRO existente"
        : "com adequação do PGR/GRO aos riscos psicossociais";

  const dor = params.pains.length
    ? `A reunião indicou como pontos de atenção ${params.pains.slice(0, 3).join(", ")}.`
    : "A reunião indicou a necessidade de organizar os riscos psicossociais com clareza, método e evidências práticas.";

  const base = escopo.length
    ? `A proposta contempla um diagnóstico NR-1 para ${escopo.join(", ")}, ${pgrText}.`
    : `A proposta contempla um diagnóstico NR-1 ${pgrText}, com foco em riscos psicossociais, governança e produtividade.`;

  const fechamento = params.urgency
    ? `Como ${params.urgency}, o projeto prioriza diagnóstico objetivo, plano de ação aplicável e orientação para liderança.`
    : "O projeto prioriza diagnóstico objetivo, plano de ação aplicável e orientação para liderança, evitando um processo meramente documental.";

  return `${base} ${dor} ${fechamento}`;
}

function buildDiferenciais(params: {
  pains: string[];
  temEquipeSst?: boolean;
  temPrestadores?: boolean;
  modelo?: ProposalDraft["modeloTrabalho"];
  maturidade?: ProposalDraft["maturidadePgr"];
}): string[] {
  const items = [
    "Diagnóstico técnico conectado à realidade operacional, não apenas ao documento",
    "Leitura integrada entre riscos psicossociais, produtividade, liderança e reputação",
    "Plano de ação priorizado, com responsáveis, prazos e evidências de acompanhamento",
  ];

  if (params.maturidade === "inexistente") {
    items.push("Estruturação do PGR/GRO desde a base, com organização clara dos riscos psicossociais");
  } else if (params.maturidade === "parcial") {
    items.push("Revisão crítica do material existente para aproveitar o que já funciona e corrigir lacunas");
  } else {
    items.push("Integração dos riscos psicossociais ao PGR/GRO já existente, sem retrabalho desnecessário");
  }

  if (params.modelo === "hibrido" || params.modelo === "remoto") {
    items.push("Método adaptado para equipes híbridas/remotas, com evidências além da visita presencial");
  }
  if (params.temPrestadores) {
    items.push("Inclusão de prestadores e parceiros críticos na governança de prevenção");
  }
  if (params.temEquipeSst) {
    items.push("Trabalho em conjunto com RH/SST interno para acelerar implantação e transferência de método");
  } else {
    items.push("Apoio mais próximo na estruturação documental e na rotina de acompanhamento interno");
  }
  if (params.pains.some(p => p.includes("reputacional") || p.includes("conflitos"))) {
    items.push("Tratamento específico de comunicação, segurança psicológica e risco de exposição reputacional");
  }

  return [...new Set(items)].slice(0, 6);
}

function buildEntregaveis(params: {
  temPrestadores?: boolean;
  temEquipeSst?: boolean;
  pains: string[];
}): string[] {
  const items = [
    "Mapa de riscos psicossociais por função, área ou grupo exposto",
    "Diagnóstico executivo com principais achados, evidências e prioridades",
    "Inventário de riscos psicossociais integrado à lógica do PGR/GRO",
    "Plano de ação com medidas preventivas, responsáveis, prazos e indicadores de acompanhamento",
    "Relatório de governança para liderança com impactos em clima, produtividade e reputação",
    "Roteiro de comunicação interna para reduzir ruídos e fortalecer confiança",
  ];

  if (params.pains.some(p => p.includes("saúde mental") || p.includes("adoecimento"))) {
    items.push("Recomendações específicas para prevenção de adoecimento, afastamentos e desgaste emocional");
  }
  if (params.temPrestadores) {
    items.push("Diretrizes para integração de prestadores/PJ à governança de riscos psicossociais");
  }
  if (!params.temEquipeSst) {
    items.push("Modelo simples de rotina interna para acompanhar o plano de ação após a entrega");
  }

  return [...new Set(items)].slice(0, 8);
}

function buildFases(params: {
  prazoMeses: number;
  modelo?: ProposalDraft["modeloTrabalho"];
  maturidade?: ProposalDraft["maturidadePgr"];
  colaboradores?: number;
  unidades?: number;
}): ProposalFase[] {
  const campo = params.modelo === "remoto"
    ? "Coleta remota estruturada, análise de rotinas digitais, entrevistas e levantamento documental."
    : params.modelo === "hibrido"
      ? "Coleta híbrida com leitura das rotinas presenciais e remotas, entrevistas e levantamento documental."
      : "Coleta de campo, observação de rotinas reais, entrevistas e levantamento documental.";

  const doc = params.maturidade === "inexistente"
    ? "Estruturação do PGR/GRO com inclusão dos riscos psicossociais, critérios de priorização e evidências mínimas."
    : "Revisão e adequação do PGR/GRO existente, integrando riscos psicossociais, lacunas e plano de ação.";

  return [
    {
      titulo: "Fase 1 — Diagnóstico e leitura do contexto",
      descricao: campo,
      duracao: params.unidades && params.unidades > 3 ? "3 a 4 semanas" : "2 a 3 semanas",
    },
    {
      titulo: "Fase 2 — Escuta, análise técnica e priorização",
      descricao: "Consolidação das evidências, identificação de grupos expostos, análise de fatores de risco e definição de prioridades.",
      duracao: params.colaboradores && params.colaboradores > 150 ? "3 a 5 semanas" : "2 a 4 semanas",
    },
    {
      titulo: "Fase 3 — Documentação, plano de ação e governança",
      descricao: doc,
      duracao: "3 a 5 semanas",
    },
    {
      titulo: "Fase 4 — Orientação da liderança e sustentação",
      descricao: "Alinhamento com líderes, recomendações práticas de rotina e transferência de critérios para acompanhamento contínuo.",
      duracao: params.prazoMeses >= 5 ? "4 a 6 semanas" : "2 a 4 semanas",
    },
  ];
}

export interface ParsedProposalData {
  prefill: Partial<ProposalDraft>;
  detectados: string[];
}

export function parseTranscricao(transcricao: string): ParsedProposalData {
  const detectados: string[] = [];
  const prefill: Partial<ProposalDraft> = {};

  if (!transcricao.trim()) {
    return { prefill: { observacoesInternas: "" }, detectados };
  }

  const colaboradores = findNumberNear(transcricao, [
    "colaboradores", "colaborador", "funcionarios", "funcionário", "funcionários", "empregados", "pessoas",
    "quadro", "headcount", "time", "equipe",
  ]);
  if (colaboradores) {
    prefill.numColaboradores = colaboradores;
    detectados.push(`${colaboradores} colaboradores`);
  }

  const estabelecimentos = findNumberNear(transcricao, [
    "unidades", "unidade", "lojas", "loja", "filiais", "filial", "estabelecimentos", "fabrica", "fabricas", "fábrica", "fábricas",
    "operacoes", "operações", "plantas", "sites",
  ]);
  if (estabelecimentos) {
    prefill.numEstabelecimentos = estabelecimentos;
    detectados.push(`${estabelecimentos} unidade(s)`);
  }

  const funcoes = findNumberNear(transcricao, [
    "funcoes", "funções", "funcao", "função", "cargos", "cargo", "posicoes", "posições",
  ]);
  if (funcoes) {
    prefill.numFuncoes = funcoes;
    detectados.push(`${funcoes} função/cargos`);
  }

  const lideres = findNumberNear(transcricao, [
    "lideres", "líderes", "lider", "líder", "gestores", "gestor", "gerentes", "gerente", "supervisores", "supervisor", "lideranca", "liderança",
  ]);
  if (lideres) {
    prefill.numLideres = lideres;
    detectados.push(`${lideres} líder(es)`);
  }

  if (hasAny(transcricao, ["hibrido", "híbrido", "home office parcial", "parte remoto", "parte presencial"])) {
    prefill.modeloTrabalho = "hibrido";
    detectados.push("modelo híbrido");
  } else if (hasAny(transcricao, ["100% remoto", "totalmente remoto", "remoto", "home office"])) {
    prefill.modeloTrabalho = "remoto";
    detectados.push("modelo remoto");
  } else if (hasAny(transcricao, ["presencial", "no escritorio", "no escritório", "chao de fabrica", "chão de fábrica", "lojas fisicas", "lojas físicas"])) {
    prefill.modeloTrabalho = "presencial";
    detectados.push("modelo presencial");
  }

  if (hasAny(transcricao, [
    "sem pgr", "nao tem pgr", "não tem pgr", "nao possui pgr", "não possui pgr",
    "pgr inexistente", "pgr nao existe", "pgr não existe", "do zero",
  ])) {
    prefill.maturidadePgr = "inexistente";
    detectados.push("PGR inexistente");
  } else if (hasAny(transcricao, [
    "pgr atualizado", "pgr completo", "pgr ok", "pgr em dia", "pgr pronto",
  ])) {
    prefill.maturidadePgr = "completo";
    detectados.push("PGR completo");
  } else if (hasAny(transcricao, [
    "pgr parcial", "pgr desatualizado", "pgr antigo", "pgr incompleto",
    "tem pgr mas", "tem um pgr", "pgr precisa",
  ])) {
    prefill.maturidadePgr = "parcial";
    detectados.push("PGR parcial");
  }

  if (hasAny(transcricao, ["prestadores", "terceirizados", "terceiros", "pj no local", "pjs", "contratados"])) {
    prefill.temPrestadores = true;
    detectados.push("possui prestadores/PJ");
  } else if (hasAny(transcricao, ["sem prestadores", "sem terceiros", "nao tem prestadores", "não tem prestadores", "nao tem terceiros", "não tem terceiros"])) {
    prefill.temPrestadores = false;
    detectados.push("sem prestadores/PJ");
  }

  if (hasAny(transcricao, [
    "tem rh", "possui rh", "equipe de rh", "tem sst", "equipe sst",
    "tecnico de seguranca", "técnico de segurança", "engenheiro de seguranca", "engenheiro de segurança",
  ])) {
    prefill.temEquipeSst = true;
    detectados.push("equipe SST/RH interna");
  } else if (hasAny(transcricao, ["sem rh", "nao tem rh", "não tem rh", "sem sst", "nao tem sst", "não tem sst"])) {
    prefill.temEquipeSst = false;
    detectados.push("sem equipe SST/RH interna");
  }

  const grauMatch = norm(transcricao).match(/grau\s*(?:de\s*)?risco\s*([1-4])/i);
  if (grauMatch) {
    prefill.grauRisco = grauMatch[1] as ProposalDraft["grauRisco"];
    detectados.push(`grau de risco ${grauMatch[1]}`);
  }

  const pains = extractPainPoints(transcricao);
  const urgency = extractUrgency(transcricao);
  if (pains.length) detectados.push(`${pains.length} ponto(s) crítico(s) da reunião`);
  if (urgency) detectados.push("urgência identificada");

  const prazoMeses = inferPrazoMeses(colaboradores ?? undefined, estabelecimentos ?? undefined, prefill.maturidadePgr);
  prefill.prazoMeses = prazoMeses;
  detectados.push(`prazo sugerido: ${prazoMeses} meses`);

  prefill.escopoResumo = buildResumo({
    colaboradores: colaboradores ?? undefined,
    unidades: estabelecimentos ?? undefined,
    funcoes: funcoes ?? undefined,
    modelo: prefill.modeloTrabalho,
    maturidade: prefill.maturidadePgr,
    pains,
    urgency,
    transcricao,
  });

  prefill.diferenciais = buildDiferenciais({
    pains,
    temEquipeSst: prefill.temEquipeSst,
    temPrestadores: prefill.temPrestadores,
    modelo: prefill.modeloTrabalho,
    maturidade: prefill.maturidadePgr,
  });

  prefill.entregaveis = buildEntregaveis({
    pains,
    temEquipeSst: prefill.temEquipeSst,
    temPrestadores: prefill.temPrestadores,
  });

  // Mantém defaults caso algum cenário gere poucos itens.
  if (prefill.diferenciais.length < 4) {
    prefill.diferenciais = [...prefill.diferenciais, ...DEFAULT_DIFERENCIAIS].slice(0, 6);
  }
  if (prefill.entregaveis.length < 5) {
    prefill.entregaveis = [...prefill.entregaveis, ...DEFAULT_ENTREGAVEIS].slice(0, 8);
  }

  prefill.fases = buildFases({
    prazoMeses,
    modelo: prefill.modeloTrabalho,
    maturidade: prefill.maturidadePgr,
    colaboradores: colaboradores ?? undefined,
    unidades: estabelecimentos ?? undefined,
  });

  const frasesOriginais = transcricao
    .split(/(?<=[.!?])\s+/)
    .map(cleanSentence)
    .filter(f => f.length > 18)
    .slice(0, 8);

  prefill.observacoesInternas = [
    "📝 Resumo da reunião usado para gerar a proposta:",
    "",
    transcricao.trim(),
    "",
    "✅ Pontos reconhecidos automaticamente:",
    detectados.length ? detectados.map(d => `- ${d}`).join("\n") : "- Nenhum dado objetivo detectado; revisar manualmente.",
    frasesOriginais.length ? `\n📌 Frases-base consideradas:\n${frasesOriginais.map(f => `- ${f}`).join("\n")}` : "",
  ].join("\n");

  return { prefill, detectados };
}
