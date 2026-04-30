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

// Lista de cargos reconhecidos (ordem importa: específicos antes de genéricos)
const CARGOS_LIST = [
  "CHRO", "CEO", "CFO", "COO", "CTO", "CMO",
  "diretora de RH", "diretor de RH", "diretora de pessoas", "diretor de pessoas",
  "diretora de gente", "diretor de gente", "diretora de SST", "diretor de SST",
  "diretora geral", "diretor geral", "diretora executiva", "diretor executivo",
  "diretora", "diretor",
  "gerente de RH", "gerente de pessoas", "gerente de SST", "gerente de gente",
  "gerente geral", "gerente",
  "head de RH", "head de pessoas", "head de gente", "head de people", "head",
  "coordenadora de RH", "coordenador de RH", "coordenadora de pessoas", "coordenador de pessoas",
  "coordenadora de SST", "coordenador de SST", "coordenadora", "coordenador",
  "supervisora de RH", "supervisor de RH", "supervisora", "supervisor",
  "presidente", "vice-presidente",
  "sócia-fundadora", "sócio-fundador", "sócia", "sócio",
  "fundadora", "fundador", "co-fundadora", "co-fundador",
  "people business partner", "business partner", "BP de RH", "HRBP",
  "analista de RH", "analista de pessoas",
  "owner", "proprietária", "proprietário", "dona", "dono",
  "sócia proprietária", "sócio proprietário", "sócia-proprietária", "sócio-proprietário",
  "sócia administradora", "sócio administrador", "sócia-administradora", "sócio-administrador",
];

// ─── Parsers de seções estruturadas ("🔹 DIFERENCIAIS", "FASES DO PROJETO", etc.) ───
// Detecta blocos rotulados e devolve as linhas-bullet para reuso direto na proposta,
// sem reescrever conteúdo que o usuário já curou.
function extractSection(text: string, headers: string[]): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  const headerRe = new RegExp(
    `^\\s*[🔹💰📌▪️•\\-\\*\\s]*(?:${headers.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "i"
  );
  // qualquer outra "seção" começando com emoji/título maiúsculo encerra a anterior
  const otherSectionRe = /^\s*[🔹💰📌▪️]\s*[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/;
  let inSection = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inSection && out.length) continue;
      continue;
    }
    if (headerRe.test(line)) { inSection = true; continue; }
    if (inSection && otherSectionRe.test(line)) break;
    if (inSection) {
      // pula sublinhas tipo "Fase X — título"; trata como bullet completo
      const cleaned = line
        .replace(/^[\s•\-\*\u2022\u25CF\u25E6\u00B7👉▪️]+/, "")
        .replace(/\s+/g, " ")
        .trim();
      if (cleaned.length > 4) out.push(cleaned);
    }
  }
  return out;
}

// Extrai fases no formato "Fase 1 — Diagnóstico ... 👉 Prazo: 2 semanas"
function extractFasesEstruturadas(text: string): ProposalFase[] {
  const re = /Fase\s*\d+\s*[—\-:]\s*([^\n]+)\n([\s\S]*?)(?=(?:\n\s*Fase\s*\d+\s*[—\-:])|(?:\n\s*[🔹💰📌])|$)/gi;
  const out: ProposalFase[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const titulo = `Fase ${out.length + 1} — ${m[1].trim()}`;
    const body = m[2].trim();
    // separa duração (👉 Prazo: ...) do restante
    const prazoMatch = body.match(/(?:👉)?\s*prazo[:\s]+([^\n]+)/i);
    const duracao = prazoMatch ? prazoMatch[1].trim().replace(/[.;]+$/, "") : "";
    const descricao = body
      .replace(/(?:👉)?\s*prazo[:\s]+[^\n]+/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (descricao || duracao) {
      out.push({ titulo, descricao: descricao || titulo, duracao: duracao || "2 a 4 semanas" });
    }
  }
  return out;
}

// "10 x 2.600", "10x R$ 2.600,00", "R$ 26.000 em 10 parcelas"
function extractInvestimento(text: string): { total?: number; parcelas?: number; observacao?: string } {
  // Padrão "Nx Y" ou "N x R$ Y"
  const reA = /(\d{1,3})\s*[x×]\s*(?:r?\$?\s*)?([\d.,]+)/i;
  const a = text.match(reA);
  if (a) {
    const parcelas = parseInt(a[1], 10);
    const valorParcela = parseBrazilianNumber(a[2]);
    if (parcelas > 0 && valorParcela > 0) {
      return {
        total: Math.round(parcelas * valorParcela),
        parcelas,
        observacao: `${parcelas}x de R$ ${valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      };
    }
  }
  // "R$ 26.000 em 10 parcelas" / "valor total R$ 26.000"
  const reB = /r\$\s*([\d.,]+)[^.\n]{0,40}?(\d{1,3})\s*parcela/i;
  const b = text.match(reB);
  if (b) {
    const total = parseBrazilianNumber(b[1]);
    const parcelas = parseInt(b[2], 10);
    if (total > 0 && parcelas > 0) return { total, parcelas };
  }
  return {};
}

function parseBrazilianNumber(s: string): number {
  // "2.600" → 2600 ; "2.600,00" → 2600 ; "26.000,50" → 26000.50
  const cleaned = s.replace(/\s/g, "");
  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  // sem vírgula: pontos são milhar
  return parseFloat(cleaned.replace(/\./g, ""));
}

// "Validade: 3 dias úteis", "validade da proposta: 15 dias"
function extractValidadeDias(text: string): number | null {
  const m = text.match(/valid(?:ade|a)[^.\n]{0,30}?(\d{1,3})\s*dia/i);
  return m ? parseInt(m[1], 10) : null;
}

// "Prazo: 4 meses", "prazo do projeto 3 meses"
function extractPrazoMesesExplicito(text: string): number | null {
  const m = text.match(/prazo[^.\n]{0,30}?(\d{1,2})\s*m(?:es|ês|eses)/i);
  return m ? parseInt(m[1], 10) : null;
}

// "Faturamento: Médio (R$ 33 milhões)" → "Médio (R$ 33 milhões)"
// também aceita só "R$ 33 milhões"
function normalizaFaturamento(raw: string): string {
  return raw.replace(/\s{2,}/g, " ").trim();
}

// "Tem mas precisa validar" / "Tem PGR mas desatualizado" → parcial
function detectMaturidadePgrFromLabel(text: string): ProposalDraft["maturidadePgr"] | null {
  const m = text.match(/maturidade\s+do\s+pgr[^:\n]*:\s*([^\n]+)/i);
  if (!m) return null;
  const v = norm(m[1]);
  if (/inexistente|n[aã]o (?:tem|possui)|do zero|nenhum/.test(v)) return "inexistente";
  if (/completo|atualizado|em dia|pronto|ok/.test(v)) return "completo";
  if (/parcial|desatualizado|mas|precisa|antigo|incompleto|valida/.test(v)) return "parcial";
  return null;
}

// "Grau de risco (CNAE): Grau 2 — médio" → "2"
function detectGrauRiscoFromLabel(text: string): ProposalDraft["grauRisco"] | null {
  const m = text.match(/grau\s+de\s+risco[^:\n]*:\s*[^\d\n]*([1-4])/i);
  return m ? (m[1] as ProposalDraft["grauRisco"]) : null;
}

// "Tem prestadores/PJ no local?: Não"
function detectBoolFromLabel(text: string, label: RegExp): boolean | null {
  const re = new RegExp(`${label.source}[^:\\n]*:\\s*([^\\n]+)`, "i");
  const m = text.match(re);
  if (!m) return null;
  const v = norm(m[1]);
  if (/^(n[aã]o|nao|none|nenhum|false|0)/.test(v)) return false;
  if (/^(sim|s|yes|true|1|tem|possui)/.test(v)) return true;
  return null;
}

// "Total de colaboradores: 17 (+1 afastado)" → 17
// "Estabelecimentos / Unidades: 1" → 1
// "Nº de gestores: 2" → 2
function extractNumberFromLabel(text: string, labels: string[]): number | null {
  for (const l of labels) {
    const re = new RegExp(`${l}[^:\\n]*:\\s*(\\d{1,6})`, "i");
    const m = text.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// "Modelo de trabalho: Presencial" / "Híbrido" / "Remoto"
function extractModeloFromLabel(text: string): ProposalDraft["modeloTrabalho"] | null {
  const m = text.match(/modelo\s+de\s+trabalho[^:\n]*:\s*([^\n]+)/i);
  if (!m) return null;
  const v = norm(m[1]);
  if (/h[ií]brid/.test(v)) return "hibrido";
  if (/remot|home/.test(v)) return "remoto";
  if (/presenci/.test(v)) return "presencial";
  return null;
}

const STOP_WORDS_NOME = new Set([
  "Cliente","Empresa","Reunião","Reuniao","Call","Diagnóstico","Diagnostico","Resumo",
  "Modelo","Grau","Risco","PGR","RH","SST","CNAE","Não","Nao","Sim","Tem","Sem",
  "Já","Ja","Quer","Precisa","Hoje","Ontem","Amanhã","Amanha",
  "Janeiro","Fevereiro","Março","Marco","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  "Segunda","Terça","Terca","Quarta","Quinta","Sexta","Sábado","Sabado","Domingo",
  "São","Sao","Rio","Brasil","Brasília","Brasilia",
]);

function isPlausibleName(s: string): boolean {
  const parts = s.trim().split(/\s+/);
  if (parts.length < 1 || parts.length > 5) return false;
  for (const p of parts) {
    if (STOP_WORDS_NOME.has(p)) return false;
    if (!/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-ÿ'’-]+$/.test(p) && !/^(de|da|do|das|dos|e)$/i.test(p)) return false;
  }
  // pelo menos uma palavra capitalizada com 3+ letras
  return parts.some(p => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-ÿ]{2,}/.test(p));
}

// Extrai dados de contato do cliente a partir do texto livre
function extractClienteData(text: string): {
  clienteNome?: string;
  clienteEmpresa?: string;
  clienteEmail?: string;
  clienteWhatsapp?: string;
  clienteCargo?: string;
  faturamentoAnual?: string;
  cnae?: string;
} {
  const out: ReturnType<typeof extractClienteData> = {};

  // ─── Campos rotulados explicitamente: "Nome: João Silva", "Empresa - Acme" ───
  const labelPatterns: Array<[RegExp, keyof typeof out]> = [
    [/(?:^|\n)\s*(?:nome|cliente|respons[áa]vel|contato|interlocutor)\s*[:\-–]\s*([^\n,;]{2,80})/i, "clienteNome"],
    [/(?:^|\n)\s*(?:empresa|raz[ãa]o social|companhia|organiza[çc][ãa]o)\s*[:\-–]\s*([^\n,;]{2,80})/i, "clienteEmpresa"],
    [/(?:^|\n)\s*(?:cargo|fun[çc][ãa]o|posi[çc][ãa]o)\s*[:\-–]\s*([^\n,;]{2,80})/i, "clienteCargo"],
    [/(?:^|\n)\s*(?:e-?mail|email)\s*[:\-–]\s*([^\s,;]+@[^\s,;]+)/i, "clienteEmail"],
    [/(?:^|\n)\s*(?:whats(?:app)?|telefone|tel|celular|fone|contato telef[oô]nico)\s*[:\-–]\s*([+\d\s().-]{8,25})/i, "clienteWhatsapp"],
    [/(?:^|\n)\s*(?:faturamento(?:\s*anual)?|receita)\s*[:\-–]\s*([^\n,;]{2,60})/i, "faturamentoAnual"],
    [/(?:^|\n)\s*cnae\s*[:\-–]\s*([\d.\-/\s]{4,20})/i, "cnae"],
  ];
  for (const [re, key] of labelPatterns) {
    const m = text.match(re);
    if (m && m[1]) (out as Record<string, string>)[key] = m[1].trim().replace(/\s{2,}/g, " ");
  }

  // ─── Email ───
  if (!out.clienteEmail) {
    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) out.clienteEmail = emailMatch[0];
  }

  // ─── Telefone / WhatsApp ───
  if (!out.clienteWhatsapp) {
    const phoneMatch = text.match(/(?:\+?55[\s.-]?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/);
    if (phoneMatch) out.clienteWhatsapp = phoneMatch[0].trim();
  }

  // ─── Faturamento ───
  if (!out.faturamentoAnual) {
    const fatMatch = text.match(/fatura(?:mento|m)?[^.\n]{0,40}?(r?\$?\s*[\d.,]+\s*(?:mi|mil|milh[õo]es?|bi|bilh[õo]es?|k|m)?)/i);
    if (fatMatch) out.faturamentoAnual = fatMatch[1].trim();
  }

  // ─── CNAE ───
  if (!out.cnae) {
    const cnaeMatch = text.match(/cnae[^\d]{0,8}([\d.\-/]{4,})/i);
    if (cnaeMatch) out.cnae = cnaeMatch[1];
  }

  // ─── Empresa ───
  if (!out.clienteEmpresa) {
    const empresaPatterns = [
      // "empresa chamada Acme", "rede X", "grupo Y", "cliente é a Z"
      /(?:empresa|cliente|raz[ãa]o social|companhia|grupo|rede|holding|franquia|loja|marca|neg[oó]cio)\s*(?:é|e|:|chama(?:da|do)?|chamad[ao]|denominad[ao])?\s*(?:a |o |as |os |um[a]? )?["“]([^"”\n]{2,60})["”]/i,
      /(?:empresa|cliente|grupo|rede|holding|marca|neg[oó]cio)\s+(?:é|e)\s+(?:a |o )?([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ&.\- ]{2,50}?)(?=[.,;\n]| (?:com|que|tem|possui|atua|opera|emprega|de R\$|\d))/,
      /(?:trabalha(?:mos)?\s+(?:com|para|junto\s+(?:à|a|ao)))\s+(?:a |o )?([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ&.\- ]{2,50}?)(?=[.,;\n])/,
      // "Acme Ltda", "Beta S.A."
      /\b([A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ&.\- ]{2,40}?)\s+(?:Ltda|S\.?A\.?|ME|EIRELI|S\/A|EPP)\b/,
    ];
    for (const re of empresaPatterns) {
      const m = text.match(re);
      if (m && m[1]) {
        out.clienteEmpresa = m[1].trim().replace(/\s{2,}/g, " ").replace(/[.,;]+$/, "");
        break;
      }
    }
  }

  // ─── Cargo ───
  if (!out.clienteCargo) {
    for (const cargo of CARGOS_LIST) {
      const escaped = cargo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      if (re.test(text)) {
        out.clienteCargo = cargo;
        break;
      }
    }
  }

  // ─── Nome do responsável ───
  if (!out.clienteNome) {
    const nomeRe = "([A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-ÿ'’-]+(?:\\s+(?:de|da|do|das|dos|e|[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-ÿ'’-]+)){0,4})";
    const cargosRe = CARGOS_LIST.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

    const nomePatterns: RegExp[] = [
      // "responsável é a Maria Silva", "falamos com João Pedro"
      new RegExp(`(?:respons[áa]vel|contato|interlocutor[a]?|ponto focal|decisor[a]?|sponsor|falamos com|reuni[ãa]o com|call com|conversamos com|reunido com|atendido por|cliente é|cliente:|nome:|chama(?:-se|do|da)|se chama|atende(?:mos)? a|atendemos o)[\\s,:]*\\s*(?:a |o |sra\\.?\\s*|sr\\.?\\s*|dra?\\.?\\s*)?${nomeRe}`, "i"),
      // "Maria, diretora de RH", "João (CEO)", "Pedro - gerente"
      new RegExp(`\\b${nomeRe}\\s*(?:,|\\(|\\s[-–]\\s)\\s*(?:é\\s*)?(?:a\\s+|o\\s+)?(?:${cargosRe})`, "i"),
      // "diretora Maria Silva", "CEO João da Silva"
      new RegExp(`\\b(?:${cargosRe})\\s+${nomeRe}\\b`, "i"),
      // "(nome) da Empresa X" — nome seguido de "da/do" + capitalizada
      new RegExp(`\\b${nomeRe}\\s+(?:da|do)\\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]`, ""),
    ];

    for (const re of nomePatterns) {
      const m = text.match(re);
      if (m && m[1]) {
        const candidate = m[1].trim().replace(/\s{2,}/g, " ");
        if (!isPlausibleName(candidate)) continue;
        if (out.clienteEmpresa && out.clienteEmpresa.toLowerCase().includes(candidate.toLowerCase())) continue;
        // não confundir cargo com nome
        if (CARGOS_LIST.some(c => c.toLowerCase() === candidate.toLowerCase())) continue;
        out.clienteNome = candidate;
        break;
      }
    }
  }

  // ─── Limpeza final: nome não pode ser igual à empresa ───
  if (out.clienteNome && out.clienteEmpresa &&
      out.clienteNome.toLowerCase() === out.clienteEmpresa.toLowerCase()) {
    delete out.clienteNome;
  }

  return out;
}

export function parseTranscricao(transcricao: string): ParsedProposalData {
  const detectados: string[] = [];
  const prefill: Partial<ProposalDraft> = {};

  if (!transcricao.trim()) {
    return { prefill: { observacoesInternas: "" }, detectados };
  }

  // Dados do cliente
  const cliente = extractClienteData(transcricao);
  if (cliente.clienteNome) {
    prefill.clienteNome = cliente.clienteNome;
    detectados.push(`responsável: ${cliente.clienteNome}`);
  }
  if (cliente.clienteEmpresa) {
    prefill.clienteEmpresa = cliente.clienteEmpresa;
    detectados.push(`empresa: ${cliente.clienteEmpresa}`);
  }
  if (cliente.clienteEmail) {
    prefill.clienteEmail = cliente.clienteEmail;
    detectados.push(`email: ${cliente.clienteEmail}`);
  }
  if (cliente.clienteWhatsapp) {
    prefill.clienteWhatsapp = cliente.clienteWhatsapp;
    detectados.push(`telefone: ${cliente.clienteWhatsapp}`);
  }
  if (cliente.clienteCargo) {
    prefill.clienteCargo = cliente.clienteCargo;
    detectados.push(`cargo: ${cliente.clienteCargo}`);
  }
  if (cliente.faturamentoAnual) {
    prefill.faturamentoAnual = cliente.faturamentoAnual;
    detectados.push(`faturamento: ${cliente.faturamentoAnual}`);
  }
  if (cliente.cnae) {
    prefill.cnae = cliente.cnae;
    detectados.push(`CNAE ${cliente.cnae}`);
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
