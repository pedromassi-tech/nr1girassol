// Simple localStorage-based store for admin panel

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

export interface AdminUser {
  email: string;
  password: string;
  nome: string;
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

const LEADS_KEY = "girassol_leads";
const ADMINS_KEY = "girassol_admins";
const QUIZ_KEY = "girassol_quiz_completions";
const VIEWS_KEY = "girassol_page_views";
const SESSION_KEY = "girassol_admin_session";

// Default admin account
const DEFAULT_ADMIN: AdminUser = {
  email: "admin@girassol.com",
  password: "girassol2026",
  nome: "Administrador",
  createdAt: new Date().toISOString(),
};

function getItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const data = window.localStorage.getItem(key);
    return data ? JSON.parse(data) as T : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora falhas de storage para não quebrar a UI
  }
}

function removeItem(key: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  } catch {
    // ignora falhas de storage para não quebrar a UI
  }
}

function getArray<T>(key: string): T[] {
  const value = getItem<unknown>(key, []);
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

// ─── ADMINS ───
export function getAdmins(): AdminUser[] {
  const admins = getArray<Partial<AdminUser>>(ADMINS_KEY)
    .filter((admin): admin is Partial<AdminUser> => typeof admin?.email === "string")
    .filter((admin) => admin.email !== DEFAULT_ADMIN.email)
    .map((admin) => ({
      email: admin.email!,
      password: typeof admin.password === "string" && admin.password ? admin.password : "",
      nome: typeof admin.nome === "string" && admin.nome ? admin.nome : "Administrador",
      createdAt: typeof admin.createdAt === "string" ? admin.createdAt : new Date().toISOString(),
    }));

  const nextAdmins = [DEFAULT_ADMIN, ...admins];
  setItem(ADMINS_KEY, nextAdmins);
  return nextAdmins;
}

export function addAdmin(admin: Omit<AdminUser, "createdAt">): boolean {
  const admins = getAdmins();
  if (admins.find((a) => a.email === admin.email)) return false;
  admins.push({ ...admin, createdAt: new Date().toISOString() });
  setItem(ADMINS_KEY, admins);
  return true;
}

export function removeAdmin(email: string): boolean {
  const admins = getAdmins();
  if (admins.length <= 1) return false;
  setItem(ADMINS_KEY, admins.filter((a) => a.email !== email));
  return true;
}

export function loginAdmin(email: string, password: string): boolean {
  const admins = getAdmins();
  const found = admins.find((a) => a.email === email && a.password === password);
  if (found) {
    setItem(SESSION_KEY, { email: found.email, nome: found.nome });
    return true;
  }
  return false;
}

export function getSession(): { email: string; nome: string } | null {
  const session = getItem<unknown>(SESSION_KEY, null);
  if (!session || typeof session !== "object") return null;

  const parsed = session as { email?: string; nome?: string };
  if (typeof parsed.email !== "string" || !parsed.email) return null;

  return {
    email: parsed.email,
    nome: typeof parsed.nome === "string" && parsed.nome ? parsed.nome : "Administrador",
  };
}

export function logout() {
  removeItem(SESSION_KEY);
}

// ─── LEADS ───
export function getLeads(): Lead[] {
  return getArray<Partial<Lead>>(LEADS_KEY)
    .filter((lead): lead is Partial<Lead> => typeof lead?.id === "string")
    .map((lead) => ({
      id: lead.id!,
      nome: typeof lead.nome === "string" ? lead.nome : "",
      email: typeof lead.email === "string" ? lead.email : "",
      whatsapp: typeof lead.whatsapp === "string" ? lead.whatsapp : "",
      empresa: typeof lead.empresa === "string" ? lead.empresa : "",
      cargo: typeof lead.cargo === "string" ? lead.cargo : "",
      desafio: typeof lead.desafio === "string" ? lead.desafio : "",
      status: lead.status === "novo" || lead.status === "em_contato" || lead.status === "negociando" || lead.status === "fechado" || lead.status === "perdido" ? lead.status : "novo",
      notas: typeof lead.notas === "string" ? lead.notas : "",
      createdAt: typeof lead.createdAt === "string" ? lead.createdAt : new Date().toISOString(),
    }));
}

export function addLead(lead: Omit<Lead, "id" | "createdAt" | "status" | "notas">) {
  const leads = getLeads();
  leads.unshift({
    ...lead,
    id: crypto.randomUUID(),
    status: "novo",
    notas: "",
    createdAt: new Date().toISOString(),
  });
  setItem(LEADS_KEY, leads);
}

export function updateLead(id: string, updates: Partial<Lead>) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...updates };
    setItem(LEADS_KEY, leads);
  }
}

export function deleteLead(id: string) {
  setItem(LEADS_KEY, getLeads().filter((l) => l.id !== id));
}

// ─── QUIZ ───
export function getQuizCompletions(): QuizCompletion[] {
  return getArray<Partial<QuizCompletion>>(QUIZ_KEY)
    .filter((item): item is Partial<QuizCompletion> => typeof item?.id === "string")
    .map((item) => ({
      id: item.id!,
      nome: typeof item.nome === "string" ? item.nome : "",
      email: typeof item.email === "string" ? item.email : "",
      score: typeof item.score === "number" ? item.score : 0,
      level: typeof item.level === "string" ? item.level : "",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }));
}

export function addQuizCompletion(score: number, level: string, nome: string = "", email: string = "") {
  const completions = getQuizCompletions();
  completions.unshift({
    id: crypto.randomUUID(),
    nome,
    email,
    score,
    level,
    createdAt: new Date().toISOString(),
  });
  setItem(QUIZ_KEY, completions);

  // Also add as a lead for CRM
  if (nome && email) {
    addLead({
      nome,
      email,
      whatsapp: "",
      empresa: "",
      cargo: "",
      desafio: `Quiz NR-1 — Score: ${score}/100 — ${level}`,
    });
  }
}

// ─── PAGE VIEWS ───
export function getPageViews(): number {
  const views = getItem<unknown>(VIEWS_KEY, 0);
  return typeof views === "number" && Number.isFinite(views) ? views : 0;
}

export function trackPageView() {
  setItem(VIEWS_KEY, getPageViews() + 1);
}
