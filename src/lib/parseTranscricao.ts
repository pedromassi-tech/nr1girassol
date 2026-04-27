// Parser simples de transcrição/resumo de reunião → campos da proposta.
// 100% client-side, sem IA. Heurísticas em pt-BR.

import type { ProposalDraft } from "./proposalsStore";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Extrai primeiro número que aparece dentro de até `windowChars` chars
// depois de qualquer um dos termos.
function findNumberNear(text: string, terms: string[], windowChars = 60): number | null {
  const t = norm(text);
  for (const term of terms) {
    const idx = t.indexOf(norm(term));
    if (idx === -1) continue;
    const slice = t.slice(idx, idx + term.length + windowChars);
    const m = slice.match(/(\d{1,6})/);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function hasAny(text: string, terms: string[]): boolean {
  const t = norm(text);
  return terms.some(term => t.includes(norm(term)));
}

export interface ParsedProposalData {
  prefill: Partial<ProposalDraft>;
  detectados: string[]; // lista do que foi reconhecido (para exibir ao usuário)
}

export function parseTranscricao(transcricao: string): ParsedProposalData {
  const detectados: string[] = [];
  const prefill: Partial<ProposalDraft> = {};

  if (!transcricao.trim()) {
    return { prefill: { observacoesInternas: "" }, detectados };
  }

  // ── Números ──
  const colaboradores = findNumberNear(transcricao, [
    "colaboradores", "funcionarios", "funcionários", "empregados", "pessoas",
    "quadro de", "headcount", "time de", "equipe de",
  ]);
  if (colaboradores) {
    prefill.numColaboradores = colaboradores;
    detectados.push(`${colaboradores} colaboradores`);
  }

  const estabelecimentos = findNumberNear(transcricao, [
    "unidades", "lojas", "filiais", "estabelecimentos", "fabricas", "fábricas",
    "operacoes", "operações", "plantas", "sites",
  ]);
  if (estabelecimentos) {
    prefill.numEstabelecimentos = estabelecimentos;
    detectados.push(`${estabelecimentos} unidade(s)`);
  }

  const funcoes = findNumberNear(transcricao, [
    "funcoes", "funções", "cargos", "tipos de cargo", "posicoes", "posições",
  ]);
  if (funcoes) {
    prefill.numFuncoes = funcoes;
    detectados.push(`${funcoes} função/cargos`);
  }

  const lideres = findNumberNear(transcricao, [
    "lideres", "líderes", "gestores", "gerentes", "supervisores", "lideranca", "liderança",
  ]);
  if (lideres) {
    prefill.numLideres = lideres;
    detectados.push(`${lideres} líder(es)`);
  }

  // ── Modelo de trabalho ──
  if (hasAny(transcricao, ["hibrido", "híbrido", "home office parcial"])) {
    prefill.modeloTrabalho = "hibrido";
    detectados.push("modelo híbrido");
  } else if (hasAny(transcricao, ["100% remoto", "totalmente remoto", "remoto", "home office"])) {
    prefill.modeloTrabalho = "remoto";
    detectados.push("modelo remoto");
  } else if (hasAny(transcricao, ["presencial", "no escritorio", "no escritório", "no chao de fabrica", "no chão de fábrica"])) {
    prefill.modeloTrabalho = "presencial";
    detectados.push("modelo presencial");
  }

  // ── Maturidade do PGR ──
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

  // ── Prestadores / PJ ──
  if (hasAny(transcricao, [
    "prestadores", "terceirizados", "terceiros", "pj no local", "pjs ", "contratados",
  ])) {
    prefill.temPrestadores = true;
    detectados.push("possui prestadores/PJ");
  }

  // ── Equipe SST/RH ──
  if (hasAny(transcricao, [
    "tem rh", "possui rh", "equipe de rh", "tem sst", "equipe sst",
    "tecnico de seguranca", "técnico de segurança", "engenheiro de seguranca", "engenheiro de segurança",
  ])) {
    prefill.temEquipeSst = true;
    detectados.push("equipe SST/RH interna");
  } else if (hasAny(transcricao, [
    "sem rh", "nao tem rh", "não tem rh", "sem sst", "nao tem sst", "não tem sst",
  ])) {
    prefill.temEquipeSst = false;
    detectados.push("sem equipe SST/RH interna");
  }

  // ── Grau de risco (CNAE) ──
  const grauMatch = transcricao.match(/grau\s*(?:de\s*)?risco\s*([1-4])/i);
  if (grauMatch) {
    prefill.grauRisco = grauMatch[1] as ProposalDraft["grauRisco"];
    detectados.push(`grau de risco ${grauMatch[1]}`);
  }

  // ── Resumo do escopo (primeiras 2-3 frases relevantes) ──
  const frases = transcricao
    .split(/(?<=[.!?])\s+/)
    .map(f => f.trim())
    .filter(f => f.length > 20);
  if (frases.length > 0) {
    prefill.escopoResumo = frases.slice(0, 3).join(" ");
  }

  // ── Observações internas: transcrição completa ──
  prefill.observacoesInternas = `📝 Resumo da reunião:\n\n${transcricao.trim()}`;

  return { prefill, detectados };
}
