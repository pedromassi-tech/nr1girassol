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
  password: "admin123",
  nome: "Administrador",
  createdAt: new Date().toISOString(),
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── ADMINS ───
export function getAdmins(): AdminUser[] {
  const admins = getItem<AdminUser[]>(ADMINS_KEY, []);
  if (admins.length === 0) {
    setItem(ADMINS_KEY, [DEFAULT_ADMIN]);
    return [DEFAULT_ADMIN];
  }
  return admins;
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
  return getItem(SESSION_KEY, null);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── LEADS ───
export function getLeads(): Lead[] {
  return getItem<Lead[]>(LEADS_KEY, []);
}

export function addLead(lead: Omit<Lead, "id" | "createdAt">) {
  const leads = getLeads();
  leads.unshift({
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  setItem(LEADS_KEY, leads);
}

// ─── QUIZ ───
export function getQuizCompletions(): QuizCompletion[] {
  return getItem<QuizCompletion[]>(QUIZ_KEY, []);
}

export function addQuizCompletion(score: number, level: string) {
  const completions = getQuizCompletions();
  completions.unshift({
    id: crypto.randomUUID(),
    score,
    level,
    createdAt: new Date().toISOString(),
  });
  setItem(QUIZ_KEY, completions);
}

// ─── PAGE VIEWS ───
export function getPageViews(): number {
  return getItem<number>(VIEWS_KEY, 0);
}

export function trackPageView() {
  setItem(VIEWS_KEY, getPageViews() + 1);
}
