import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface CopsoqToken {
  id: string;
  token: string;
  empresa: string;
  usado: boolean;
  usadoEm?: string;
  createdAt: string;
}

export type LeadStatus = "novo" | "em_contato" | "negociando" | "fechado" | "perdido";

export interface Lead {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  cargo: string;
  desafio: string;
  status: LeadStatus;
  notas: string;
  createdAt: string;
}

export interface QuizCompletion {
  id: string;
  nome: string;
  email: string;
  score: number;
  level: string;
  createdAt: string;
}

// ─── LEADS ───
export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    empresa: row.empresa ?? "",
    cargo: row.cargo ?? "",
    desafio: row.desafio ?? "",
    status: row.status ?? "novo",
    notas: row.notas ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export async function addLead(lead: Omit<Lead, "id" | "createdAt" | "status" | "notas">) {
  const { error } = await db.from("leads").insert({
    nome: lead.nome,
    email: lead.email,
    whatsapp: lead.whatsapp,
    empresa: lead.empresa,
    cargo: lead.cargo,
    desafio: lead.desafio,
  });
  if (error) console.error("Error adding lead:", error);
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const dbUpdates: any = {};
  if (updates.nome !== undefined) dbUpdates.nome = updates.nome;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp;
  if (updates.empresa !== undefined) dbUpdates.empresa = updates.empresa;
  if (updates.cargo !== undefined) dbUpdates.cargo = updates.cargo;
  if (updates.desafio !== undefined) dbUpdates.desafio = updates.desafio;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notas !== undefined) dbUpdates.notas = updates.notas;

  const { error } = await db.from("leads").update(dbUpdates).eq("id", id);
  if (error) console.error("Error updating lead:", error);
}

export async function deleteLead(id: string) {
  const { error } = await db.from("leads").delete().eq("id", id);
  if (error) console.error("Error deleting lead:", error);
}

// ─── QUIZ ───
export async function getQuizCompletions(): Promise<QuizCompletion[]> {
  const { data, error } = await db
    .from("quiz_completions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quiz completions:", error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome ?? "",
    email: row.email ?? "",
    score: row.score ?? 0,
    level: row.level ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export async function addQuizCompletion(score: number, level: string, nome: string = "", email: string = "") {
  const { error } = await db.from("quiz_completions").insert({
    nome,
    email,
    score,
    level,
  });
  if (error) console.error("Error adding quiz completion:", error);

  // Also add as a lead for CRM
  if (nome && email) {
    await addLead({
      nome,
      email,
      whatsapp: "",
      empresa: "",
      cargo: "",
      desafio: `Quiz NR-1 — Score: ${score}/100 — ${level}`,
    });
  }
}

// ─── CALCULATOR ───
export interface CalculatorCompletion {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  empresa: string;
  num_colaboradores: string;
  faturamento: string;
  momento: string;
  estrutura: string;
  risk_score: number;
  risk_level: string;
  bloco_nr1: number;
  bloco_sinais: number;
  bloco_gestao: number;
  multa_min: number;
  multa_max: number;
  impacto_min: number;
  impacto_max: number;
  respostas: any;
  createdAt: string;
}

export async function getCalculatorCompletions(): Promise<CalculatorCompletion[]> {
  const { data, error } = await db
    .from("calculator_completions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Error fetching calculator completions:", error); return []; }
  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    empresa: row.empresa ?? "",
    num_colaboradores: row.num_colaboradores ?? "",
    faturamento: row.faturamento ?? "",
    momento: row.momento ?? "",
    estrutura: row.estrutura ?? "",
    risk_score: row.risk_score ?? 0,
    risk_level: row.risk_level ?? "",
    bloco_nr1: row.bloco_nr1 ?? 0,
    bloco_sinais: row.bloco_sinais ?? 0,
    bloco_gestao: row.bloco_gestao ?? 0,
    multa_min: row.multa_min ?? 0,
    multa_max: row.multa_max ?? 0,
    impacto_min: row.impacto_min ?? 0,
    impacto_max: row.impacto_max ?? 0,
    respostas: row.respostas ?? {},
    createdAt: row.created_at ?? new Date().toISOString(),
  }));
}

export async function addCalculatorCompletion(data: Omit<CalculatorCompletion, "id" | "createdAt">) {
  const { error } = await db.from("calculator_completions").insert({
    nome: data.nome,
    email: data.email,
    whatsapp: data.whatsapp,
    empresa: data.empresa,
    num_colaboradores: data.num_colaboradores,
    faturamento: data.faturamento,
    momento: data.momento,
    estrutura: data.estrutura,
    risk_score: data.risk_score,
    risk_level: data.risk_level,
    bloco_nr1: data.bloco_nr1,
    bloco_sinais: data.bloco_sinais,
    bloco_gestao: data.bloco_gestao,
    multa_min: data.multa_min,
    multa_max: data.multa_max,
    impacto_min: data.impacto_min,
    impacto_max: data.impacto_max,
    respostas: data.respostas,
  });
  if (error) console.error("Error adding calculator completion:", error);

  // Also add as lead
  if (data.nome && data.email) {
    await addLead({
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp || "",
      empresa: data.empresa || "",
      cargo: "",
      desafio: `Calculadora NR-1 — Score: ${data.risk_score}/100 — ${data.risk_level} — Impacto: R$${Math.round(data.impacto_min/1000)}k–R$${Math.round(data.impacto_max/1000)}k`,
    });
  }
}

// ─── PAGE VIEWS ───
export async function getPageViews(): Promise<number> {
  const { count, error } = await db
    .from("page_views")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching page views:", error);
    return 0;
  }
  return count ?? 0;
}

export async function trackPageView() {
  const { error } = await db.from("page_views").insert({});
  if (error) console.error("Error tracking page view:", error);
}

// ─── ADMIN AUTH (kept in localStorage - admin-only) ───
export interface AdminUser {
  email: string;
  password: string;
  nome: string;
  createdAt: string;
}

const ADMINS_KEY = "girassol_admins";
const SESSION_KEY = "girassol_admin_session";

const DEFAULT_ADMIN: AdminUser = {
  email: "admin@girassol.com",
  password: "girassol2026",
  nome: "Administrador",
  createdAt: new Date().toISOString(),
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) as T : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function removeItem(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

export function getAdmins(): AdminUser[] {
  const stored = getItem<AdminUser[]>(ADMINS_KEY, []);
  const admins = Array.isArray(stored) ? stored.filter(a => a?.email && a.email !== DEFAULT_ADMIN.email) : [];
  const result = [DEFAULT_ADMIN, ...admins];
  setItem(ADMINS_KEY, result);
  return result;
}

export function addAdmin(admin: Omit<AdminUser, "createdAt">): boolean {
  const admins = getAdmins();
  if (admins.find(a => a.email === admin.email)) return false;
  admins.push({ ...admin, createdAt: new Date().toISOString() });
  setItem(ADMINS_KEY, admins);
  return true;
}

export function removeAdmin(email: string): boolean {
  const admins = getAdmins();
  if (admins.length <= 1) return false;
  setItem(ADMINS_KEY, admins.filter(a => a.email !== email));
  return true;
}

export function loginAdmin(email: string, password: string): boolean {
  const admins = getAdmins();
  const found = admins.find(a => a.email === email && a.password === password);
  if (found) {
    setItem(SESSION_KEY, { email: found.email, nome: found.nome });
    return true;
  }
  return false;
}

export function getSession(): { email: string; nome: string } | null {
  const session = getItem<any>(SESSION_KEY, null);
  if (!session || typeof session.email !== "string") return null;
  return { email: session.email, nome: session.nome || "Administrador" };
}

export function logout() {
  removeItem(SESSION_KEY);
}

// ─── COPSOQ TOKENS ───
const TOKENS_KEY = "girassol_copsoq_tokens";

export function getCopsoqTokens(): CopsoqToken[] {
  return getItem<CopsoqToken[]>(TOKENS_KEY, []);
}

export function generateCopsoqToken(empresa: string): CopsoqToken {
  const tokens = getCopsoqTokens();
  const newToken: CopsoqToken = {
    id: crypto.randomUUID(),
    token: Math.random().toString(36).substring(2, 8).toUpperCase(),
    empresa,
    usado: false,
    createdAt: new Date().toISOString(),
  };
  tokens.push(newToken);
  setItem(TOKENS_KEY, tokens);
  return newToken;
}

export function validateCopsoqToken(tokenStr: string): CopsoqToken | null {
  const tokens = getCopsoqTokens();
  const found = tokens.find(t => t.token === tokenStr.toUpperCase());
  if (!found) return null;
  return found;
}

export function useCopsoqToken(tokenId: string) {
  const tokens = getCopsoqTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].usado = true;
    tokens[idx].usadoEm = new Date().toISOString();
    setItem(TOKENS_KEY, tokens);
  }
}

export function deleteCopsoqToken(tokenId: string) {
  const tokens = getCopsoqTokens();
  setItem(TOKENS_KEY, tokens.filter(t => t.id !== tokenId));
}
