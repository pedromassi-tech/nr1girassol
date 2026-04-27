// Cruza o lead (e dados extraídos da transcrição) com quiz_completions
// e calculator_completions, gerando prefill mais assertivo + lista de matches.
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "./adminStore";
import type { ProposalDraft } from "./proposalsStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Normalização ──
const normStr = (s?: string | null) =>
  (s ?? "").toString().toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const normPhone = (s?: string | null) =>
  (s ?? "").toString().replace(/\D/g, "").replace(/^55/, "");

const normEmail = (s?: string | null) => (s ?? "").toString().toLowerCase().trim();

function tokenSim(a: string, b: string): number {
  const ta = new Set(normStr(a).split(" ").filter(t => t.length > 1));
  const tb = new Set(normStr(b).split(" ").filter(t => t.length > 1));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

interface MatchTarget {
  email?: string; whatsapp?: string; nome?: string; empresa?: string;
}
type Reason = "e-mail" | "telefone" | "nome+empresa" | "nome" | "empresa";

function scoreRow<T extends MatchTarget>(target: MatchTarget, row: T): { score: number; reason: Reason | null } {
  const te = normEmail(target.email), re = normEmail(row.email);
  if (te && re && te === re) return { score: 100, reason: "e-mail" };

  const tp = normPhone(target.whatsapp), rp = normPhone(row.whatsapp);
  if (tp.length >= 8 && rp.length >= 8 && tp.slice(-8) === rp.slice(-8)) {
    return { score: 90, reason: "telefone" };
  }

  const nomeSim = tokenSim(target.nome ?? "", row.nome ?? "");
  const empSim = tokenSim(target.empresa ?? "", row.empresa ?? "");
  if (nomeSim >= 0.5 && empSim >= 0.5) return { score: 70 + Math.round((nomeSim + empSim) * 10), reason: "nome+empresa" };
  if (nomeSim >= 0.7) return { score: 50 + Math.round(nomeSim * 10), reason: "nome" };
  if (empSim >= 0.7) return { score: 40 + Math.round(empSim * 10), reason: "empresa" };
  return { score: 0, reason: null };
}

function bestMatch<T extends MatchTarget>(target: MatchTarget, rows: T[], threshold = 40): { row: T; reason: Reason } | null {
  let best: { row: T; score: number; reason: Reason } | null = null;
  for (const r of rows) {
    const s = scoreRow(target, r);
    if (s.score >= threshold && s.reason && (!best || s.score > best.score)) {
      best = { row: r, score: s.score, reason: s.reason };
    }
  }
  return best ? { row: best.row, reason: best.reason } : null;
}

// ── Mapeamentos ──
const COLAB_MAP: Record<string, number> = {
  micro: 15, pequena: 75, media: 250, grande: 800,
};
const FATUR_MAP: Record<string, string> = {
  ate5m: "me_epp", "5a50m": "medio", "50a300m": "medio", acima300m: "grande",
};
const ESTRUTURA_LABEL: Record<string, string> = {
  enxuta: "estrutura enxuta",
  equilibrada: "estrutura equilibrada",
  sobrecarregada: "estrutura sobrecarregada",
};
const MOMENTO_LABEL: Record<string, string> = {
  crescimento: "em crescimento", reestruturacao: "em reestruturação",
  estavel: "em fase estável", crise: "em momento de crise",
};

const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export interface DiagnosticsEnrichment {
  prefill: Partial<ProposalDraft>;
  detectados: string[];
  matches: {
    quiz: { nome: string; email: string; score: number; level: string; reason: Reason } | null;
    calculadora: {
      nome: string; email: string; empresa: string;
      risk_score: number; risk_level: string;
      bloco_nr1: number; bloco_sinais: number; bloco_gestao: number;
      multa_min: number; multa_max: number;
      impacto_min: number; impacto_max: number;
      reason: Reason;
    } | null;
  };
}

export async function enrichFromDiagnostics(
  lead: Partial<Lead> | null,
  extra?: { nome?: string; empresa?: string; email?: string; whatsapp?: string },
): Promise<DiagnosticsEnrichment> {
  const target: MatchTarget = {
    email: extra?.email || lead?.email,
    whatsapp: extra?.whatsapp || lead?.whatsapp,
    nome: extra?.nome || lead?.nome,
    empresa: extra?.empresa || lead?.empresa,
  };

  const detectados: string[] = [];
  const prefill: Partial<ProposalDraft> = {};
  const matches: DiagnosticsEnrichment["matches"] = { quiz: null, calculadora: null };

  if (!target.email && !target.whatsapp && !target.nome && !target.empresa) {
    return { prefill, detectados, matches };
  }

  const [{ data: quizzes }, { data: calcs }] = await Promise.all([
    db.from("quiz_completions").select("*").order("created_at", { ascending: false }).limit(300),
    db.from("calculator_completions").select("*").order("created_at", { ascending: false }).limit(300),
  ]);

  const quizMatch = bestMatch(target, (quizzes ?? []) as MatchTarget[]);
  const calcMatch = bestMatch(target, (calcs ?? []) as MatchTarget[]);

  // ── QUIZ ──
  if (quizMatch) {
    const q = quizMatch.row as any;
    matches.quiz = {
      nome: q.nome ?? "", email: q.email ?? "",
      score: q.score ?? 0, level: q.level ?? "", reason: quizMatch.reason,
    };
    detectados.push(`Quiz NR-1: ${q.score}/100 — ${q.level} (match por ${quizMatch.reason})`);

    // Maturidade do PGR a partir do score
    if (typeof q.score === "number") {
      if (q.score < 40) prefill.maturidadePgr = "inexistente";
      else if (q.score < 70) prefill.maturidadePgr = "parcial";
      else prefill.maturidadePgr = "completo";
    }
    if (q.nome && !prefill.clienteNome) prefill.clienteNome = q.nome;
    if (q.email && !prefill.clienteEmail) prefill.clienteEmail = q.email;
  }

  // ── CALCULADORA ──
  if (calcMatch) {
    const c = calcMatch.row as any;
    matches.calculadora = {
      nome: c.nome ?? "", email: c.email ?? "", empresa: c.empresa ?? "",
      risk_score: c.risk_score ?? 0, risk_level: c.risk_level ?? "",
      bloco_nr1: c.bloco_nr1 ?? 0, bloco_sinais: c.bloco_sinais ?? 0, bloco_gestao: c.bloco_gestao ?? 0,
      multa_min: c.multa_min ?? 0, multa_max: c.multa_max ?? 0,
      impacto_min: c.impacto_min ?? 0, impacto_max: c.impacto_max ?? 0,
      reason: calcMatch.reason,
    };
    detectados.push(`Calculadora: ${c.risk_score}/100 — ${c.risk_level} (match por ${calcMatch.reason})`);

    if (c.nome && !prefill.clienteNome) prefill.clienteNome = c.nome;
    if (c.email && !prefill.clienteEmail) prefill.clienteEmail = c.email;
    if (c.empresa && !prefill.clienteEmpresa) prefill.clienteEmpresa = c.empresa;
    if (c.whatsapp && !prefill.clienteWhatsapp) prefill.clienteWhatsapp = c.whatsapp;

    // Tamanho de empresa
    if (c.num_colaboradores && COLAB_MAP[c.num_colaboradores]) {
      prefill.numColaboradores = COLAB_MAP[c.num_colaboradores];
      detectados.push(`Porte: ${c.num_colaboradores} (~${COLAB_MAP[c.num_colaboradores]} colaboradores)`);
    }
    if (c.faturamento && FATUR_MAP[c.faturamento]) {
      prefill.faturamentoAnual = FATUR_MAP[c.faturamento];
      detectados.push(`Faturamento: ${c.faturamento}`);
    }

    // Maturidade PGR — calculadora pesa mais que quiz se ambos existirem
    if (typeof c.bloco_nr1 === "number") {
      if (c.bloco_nr1 >= 50) prefill.maturidadePgr = "inexistente";
      else if (c.bloco_nr1 >= 25) prefill.maturidadePgr = "parcial";
      else prefill.maturidadePgr = "completo";
    }
  }

  // ── Construção de escopo / observações enriquecidas ──
  const partesResumo: string[] = [];
  const partesNotas: string[] = [];

  if (matches.calculadora) {
    const c = matches.calculadora;
    const estrutLabel = ESTRUTURA_LABEL[(calcMatch?.row as any).estrutura] ?? "";
    const momLabel = MOMENTO_LABEL[(calcMatch?.row as any).momento] ?? "";
    const contexto = [estrutLabel, momLabel].filter(Boolean).join(", ");

    partesResumo.push(
      `O diagnóstico do cliente aponta nível de risco "${c.risk_level}" (${c.risk_score}/100)${
        contexto ? `, em contexto de ${contexto}` : ""
      }, com exposição financeira estimada entre ${fmtBRL(c.impacto_min)} e ${fmtBRL(c.impacto_max)} caso não haja adequação à NR-1.`,
    );

    // Diferenciais e entregáveis sensíveis aos blocos
    const blocosAlto: string[] = [];
    if (c.bloco_nr1 >= 40) blocosAlto.push("conformidade documental NR-1");
    if (c.bloco_sinais >= 40) blocosAlto.push("sinais de adoecimento e clima");
    if (c.bloco_gestao >= 40) blocosAlto.push("governança e gestão de risco");

    if (blocosAlto.length) {
      partesResumo.push(`Os pontos mais críticos identificados estão em ${blocosAlto.join(", ")}.`);
    }

    partesNotas.push(
      "📊 CALCULADORA DE RISCO (cruzamento automático)",
      `• Score: ${c.risk_score}/100 — ${c.risk_level}`,
      `• Bloco NR-1 (conformidade): ${c.bloco_nr1}`,
      `• Bloco Sinais (adoecimento/clima): ${c.bloco_sinais}`,
      `• Bloco Gestão (governança): ${c.bloco_gestao}`,
      `• Multa estimada: ${fmtBRL(c.multa_min)} – ${fmtBRL(c.multa_max)}`,
      `• Impacto financeiro estimado: ${fmtBRL(c.impacto_min)} – ${fmtBRL(c.impacto_max)}`,
      `• Match com lead por: ${c.reason}`,
      "",
    );
  }

  if (matches.quiz) {
    const q = matches.quiz;
    if (!matches.calculadora) {
      partesResumo.push(
        `O cliente realizou o Quiz NR-1 e está classificado como "${q.level}" (${q.score}/100), o que indica o ponto de partida da maturidade atual em relação à norma.`,
      );
    }
    partesNotas.push(
      "🧭 QUIZ NR-1 (cruzamento automático)",
      `• Score: ${q.score}/100 — ${q.level}`,
      `• Match com lead por: ${q.reason}`,
      "",
    );
  }

  if (partesResumo.length) {
    prefill.escopoResumo = partesResumo.join(" ");
  }
  if (partesNotas.length) {
    prefill.observacoesInternas = partesNotas.join("\n");
  }

  // Diferenciais reforçados pelos blocos
  if (matches.calculadora) {
    const c = matches.calculadora;
    const dif: string[] = [];
    if (c.bloco_nr1 >= 40) dif.push("Estruturação documental NR-1 priorizada — fechar lacunas que mais expõem o cliente");
    if (c.bloco_sinais >= 40) dif.push("Plano específico para sinais de adoecimento, afastamento e clima identificados no diagnóstico");
    if (c.bloco_gestao >= 40) dif.push("Governança e rotina de gestão de risco — não só documento, mas operação");
    dif.push(`Conexão direta entre risco mapeado (${c.risk_score}/100) e plano de ação prático e auditável`);
    dif.push("Leitura combinada de exposição financeira, reputacional e operacional");
    if (dif.length) prefill.diferenciais = dif.slice(0, 6);
  }

  return { prefill, detectados, matches };
}

// Mescla dois prefills, dando prioridade ao primeiro (transcrição) quando preenchido
export function mergePrefill(
  a: Partial<ProposalDraft>,
  b: Partial<ProposalDraft>,
): Partial<ProposalDraft> {
  const out: Partial<ProposalDraft> = { ...b, ...a };

  // Listas: união sem duplicar
  const mergeList = (la?: string[], lb?: string[]) => {
    const set = new Set<string>();
    [...(la ?? []), ...(lb ?? [])].forEach(x => x && set.add(x.trim()));
    return [...set];
  };
  if (a.diferenciais || b.diferenciais) out.diferenciais = mergeList(a.diferenciais, b.diferenciais).slice(0, 6);
  if (a.entregaveis || b.entregaveis) out.entregaveis = mergeList(a.entregaveis, b.entregaveis).slice(0, 8);

  // Escopo: concatena se ambos existem
  if (a.escopoResumo && b.escopoResumo && a.escopoResumo !== b.escopoResumo) {
    out.escopoResumo = `${b.escopoResumo} ${a.escopoResumo}`;
  }

  // Observações internas: junta as duas seções
  if (a.observacoesInternas && b.observacoesInternas) {
    out.observacoesInternas = `${b.observacoesInternas}\n\n${a.observacoesInternas}`;
  }

  return out;
}
