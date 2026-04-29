import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type ProposalStatus = "rascunho" | "enviada" | "aceita" | "recusada";

export interface ProposalFase {
  titulo: string;
  descricao: string;
  duracao: string;
}

export interface Proposal {
  id: string;
  slug: string;
  leadId: string | null;

  // Cliente
  clienteNome: string;
  clienteEmpresa: string;
  clienteEmail: string;
  clienteWhatsapp: string;
  clienteCargo: string;

  // Escopo de campo (Fases 1-2)
  numEstabelecimentos: number;
  numFuncoes: number;
  numColaboradores: number;
  modeloTrabalho: "presencial" | "hibrido" | "remoto";
  faturamentoAnual: string;

  // Complexidade técnica (Fase 3)
  maturidadePgr: "inexistente" | "parcial" | "completo";
  grauRisco: "1" | "2" | "3" | "4";
  cnae: string;
  temPrestadores: boolean;

  // Liderança e sustentabilidade
  numLideres: number;
  temEquipeSst: boolean;

  // Conteúdo
  escopoResumo: string;
  diferenciais: string[];
  fases: ProposalFase[];
  entregaveis: string[];

  // Investimento
  prazoMeses: number;
  investimentoTotal: number;
  investimentoParcelas: number;
  investimentoObservacao: string;
  validadeDias: number;

  status: ProposalStatus;
  observacoesInternas: string;
  // Logo do cliente (data URL base64). Persistido embutido em observacoes_internas
  // com marcador [CLIENT_LOGO]...[/CLIENT_LOGO] para evitar migration de schema.
  clienteLogoUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Logo embed helpers (no-migration trick) ───
const LOGO_RE = /\[CLIENT_LOGO\]([\s\S]*?)\[\/CLIENT_LOGO\]\n?/;

function splitLogo(internas: string): { logo: string; rest: string } {
  if (!internas) return { logo: "", rest: "" };
  const m = internas.match(LOGO_RE);
  if (!m) return { logo: "", rest: internas };
  return { logo: m[1].trim(), rest: internas.replace(LOGO_RE, "").trim() };
}

function joinLogo(logo: string, rest: string): string {
  const cleanRest = rest.replace(LOGO_RE, "").trim();
  if (!logo) return cleanRest;
  return `[CLIENT_LOGO]${logo}[/CLIENT_LOGO]\n${cleanRest}`;
}

export type ProposalDraft = Omit<Proposal, "id" | "slug" | "createdAt" | "updatedAt" | "status"> & {
  status?: ProposalStatus;
};

// ─── Helpers ───
function generateSlug(): string {
  // 10 chars random base36 — link único e curto
  const part1 = Math.random().toString(36).slice(2, 8);
  const part2 = Math.random().toString(36).slice(2, 6);
  return `${part1}${part2}`;
}

function rowToProposal(row: any): Proposal {
  return {
    id: row.id,
    slug: row.slug,
    leadId: row.lead_id,
    clienteNome: row.cliente_nome ?? "",
    clienteEmpresa: row.cliente_empresa ?? "",
    clienteEmail: row.cliente_email ?? "",
    clienteWhatsapp: row.cliente_whatsapp ?? "",
    clienteCargo: row.cliente_cargo ?? "",
    numEstabelecimentos: row.num_estabelecimentos ?? 1,
    numFuncoes: row.num_funcoes ?? 1,
    numColaboradores: row.num_colaboradores ?? 0,
    modeloTrabalho: row.modelo_trabalho ?? "presencial",
    faturamentoAnual: row.faturamento_anual ?? "",
    maturidadePgr: row.maturidade_pgr ?? "inexistente",
    grauRisco: row.grau_risco ?? "",
    cnae: row.cnae ?? "",
    temPrestadores: row.tem_prestadores ?? false,
    numLideres: row.num_lideres ?? 0,
    temEquipeSst: row.tem_equipe_sst ?? false,
    escopoResumo: row.escopo_resumo ?? "",
    diferenciais: Array.isArray(row.diferenciais) ? row.diferenciais : [],
    fases: Array.isArray(row.fases) ? row.fases : [],
    entregaveis: Array.isArray(row.entregaveis) ? row.entregaveis : [],
    prazoMeses: row.prazo_meses ?? 3,
    investimentoTotal: Number(row.investimento_total) || 0,
    investimentoParcelas: row.investimento_parcelas ?? 1,
    investimentoObservacao: row.investimento_observacao ?? "",
    validadeDias: row.validade_dias ?? 15,
    status: (row.status as ProposalStatus) ?? "rascunho",
    observacoesInternas: splitLogo(row.observacoes_internas ?? "").rest,
    clienteLogoUrl: splitLogo(row.observacoes_internas ?? "").logo,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  };
}

function draftToRow(draft: ProposalDraft) {
  return {
    lead_id: draft.leadId,
    cliente_nome: draft.clienteNome,
    cliente_empresa: draft.clienteEmpresa,
    cliente_email: draft.clienteEmail,
    cliente_whatsapp: draft.clienteWhatsapp,
    cliente_cargo: draft.clienteCargo,
    num_estabelecimentos: draft.numEstabelecimentos,
    num_funcoes: draft.numFuncoes,
    num_colaboradores: draft.numColaboradores,
    modelo_trabalho: draft.modeloTrabalho,
    faturamento_anual: draft.faturamentoAnual,
    maturidade_pgr: draft.maturidadePgr,
    grau_risco: draft.grauRisco,
    cnae: draft.cnae,
    tem_prestadores: draft.temPrestadores,
    num_lideres: draft.numLideres,
    tem_equipe_sst: draft.temEquipeSst,
    escopo_resumo: draft.escopoResumo,
    diferenciais: draft.diferenciais,
    fases: draft.fases,
    entregaveis: draft.entregaveis,
    prazo_meses: draft.prazoMeses,
    investimento_total: draft.investimentoTotal,
    investimento_parcelas: draft.investimentoParcelas,
    investimento_observacao: draft.investimentoObservacao,
    validade_dias: draft.validadeDias,
    status: draft.status ?? "rascunho",
    observacoes_internas: draft.observacoesInternas,
  };
}

// ─── CRUD ───
export async function getProposals(): Promise<Proposal[]> {
  const { data, error } = await db
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
  return (data || []).map(rowToProposal);
}

export async function getProposalsByLead(leadId: string): Promise<Proposal[]> {
  const { data, error } = await db
    .from("proposals")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching proposals by lead:", error);
    return [];
  }
  return (data || []).map(rowToProposal);
}

export async function getProposalBySlug(slug: string): Promise<Proposal | null> {
  const { data, error } = await db
    .from("proposals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("Error fetching proposal by slug:", error);
    return null;
  }
  return data ? rowToProposal(data) : null;
}

export async function createProposal(draft: ProposalDraft): Promise<Proposal | null> {
  const slug = generateSlug();
  const row = { ...draftToRow(draft), slug };
  const { data, error } = await db.from("proposals").insert(row).select().single();
  if (error) {
    console.error("Error creating proposal:", error);
    return null;
  }
  return rowToProposal(data);
}

export async function updateProposal(id: string, draft: ProposalDraft): Promise<Proposal | null> {
  const row = { ...draftToRow(draft), updated_at: new Date().toISOString() };
  const { data, error } = await db.from("proposals").update(row).eq("id", id).select().single();
  if (error) {
    console.error("Error updating proposal:", error);
    return null;
  }
  return rowToProposal(data);
}

export async function deleteProposal(id: string): Promise<boolean> {
  const { error } = await db.from("proposals").delete().eq("id", id);
  if (error) {
    console.error("Error deleting proposal:", error);
    return false;
  }
  return true;
}

// ─── Defaults ───
export const DEFAULT_DIFERENCIAIS = [
  "Metodologia exclusiva alinhada à NR-1 e ESG",
  "Diagnóstico técnico com escuta qualitativa e quantitativa",
  "Mentoria contínua para a liderança durante toda a execução",
  "Documentação com lastro técnico e jurídico",
  "Plano de ação prático, mensurável e auditável",
];

export const DEFAULT_FASES: ProposalFase[] = [
  {
    titulo: "Fase 1 — Diagnóstico de Campo",
    descricao: "Coleta in loco/remota de dados, observação de rotinas reais e mapeamento por estabelecimento e função.",
    duracao: "3 a 4 semanas",
  },
  {
    titulo: "Fase 2 — Análise Técnica e Escuta",
    descricao: "Escuta qualitativa e quantitativa, identificação de grupos expostos e consolidação crítica dos achados.",
    duracao: "3 a 5 semanas",
  },
  {
    titulo: "Fase 3 — Estruturação Documental",
    descricao: "Elaboração do PGR/GRO com inclusão dos riscos psicossociais, plano de ação e governança integrada.",
    duracao: "4 a 6 semanas",
  },
  {
    titulo: "Fase 4 — Aculturamento e Liderança",
    descricao: "Mentoria estratégica, desenvolvimento de líderes e implementação de canais de escuta seguros.",
    duracao: "Contínua",
  },
];

export const DEFAULT_ENTREGAVEIS = [
  "Diagnóstico completo de riscos psicossociais por função",
  "PGR atualizado conforme NR-1 (versão 2024)",
  "Inventário de Riscos Psicossociais",
  "Plano de Ação priorizado e cronograma de execução",
  "Relatório executivo para liderança e conselho",
  "Material de comunicação e aculturamento interno",
  "Certificado de conformidade técnica",
];
