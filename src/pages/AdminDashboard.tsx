import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getSession, logout, getLeads, getPageViews, getQuizCompletions,
  getAdmins, addAdmin, removeAdmin, updateLead, deleteLead, loginAdmin,
  getCalculatorCompletions,
  type Lead, type AdminUser, type QuizCompletion, type CalculatorCompletion, type LeadStatus,
} from "@/lib/adminStore";
import {
  Users, Eye, ClipboardCheck, LogOut, UserPlus, Trash2,
  ChevronDown, ChevronUp, MessageCircle, Mail, Building2,
  Phone, Search, AlertTriangle, TrendingUp, CheckCircle, XCircle,
  BarChart3, StickyNote, Lock, Calculator, FileText, Plus, Copy, ExternalLink, Sparkles,
} from "lucide-react";
import { getProposals, deleteProposal, type Proposal } from "@/lib/proposalsStore";
import ProposalForm from "@/components/admin/ProposalForm";
import { toast } from "@/hooks/use-toast";

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700 border-blue-200", icon: AlertTriangle },
  em_contato: { label: "Em contato", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Phone },
  negociando: { label: "Negociando", color: "bg-purple-100 text-purple-700 border-purple-200", icon: TrendingUp },
  fechado: { label: "Fechado", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

const STATUS_ORDER: LeadStatus[] = ["novo", "em_contato", "negociando", "fechado", "perdido"];

function formatWhatsAppLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${number}`;
}

const AdminDashboard = () => {
  const [session, setSession] = useState(getSession());
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"crm" | "metricas" | "calculadora" | "propostas" | "admins">("crm");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quizzes, setQuizzes] = useState<QuizCompletion[]>([]);
  const [calcResults, setCalcResults] = useState<CalculatorCompletion[]>([]);
  const [views, setViews] = useState(0);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ nome: "", email: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "todos">("todos");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalForm, setProposalForm] = useState<{ open: boolean; lead: Lead | null; proposal: Proposal | null }>({
    open: false, lead: null, proposal: null,
  });
  const [proposalsSearch, setProposalsSearch] = useState("");

  const refreshData = async () => {
    try {
      const [leadsData, quizzesData, viewsData, calcData, proposalsData] = await Promise.all([
        getLeads(),
        getQuizCompletions(),
        getPageViews(),
        getCalculatorCompletions(),
        getProposals(),
      ]);
      setLeads(leadsData);
      setQuizzes(quizzesData);
      setViews(viewsData);
      setCalcResults(calcData);
      setProposals(proposalsData);
      setAdmins(getAdmins());
    } catch {
      setLeads([]);
      setQuizzes([]);
      setViews(0);
      setProposals([]);
      setAdmins([]);
      setLoginError("Não foi possível carregar o painel. Recarregue a página.");
    }
  };

  useEffect(() => {
    setSession(getSession());
    refreshData();
  }, []);

  const handleLogout = () => { logout(); setSession(null); setLoginForm({ email: "", password: "" }); };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    await updateLead(id, { status });
    refreshData();
  };

  const handleSaveNotes = async (id: string) => {
    await updateLead(id, { notas: noteText });
    setEditingNotes(null);
    refreshData();
  };

  const handleDeleteLead = async (id: string) => {
    await deleteLead(id);
    setExpandedLead(null);
    refreshData();
  };

  const proposalLink = (slug: string) => `${window.location.origin}/proposta/${slug}`;

  const handleCopyProposalLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(proposalLink(slug));
      toast({ title: "Link copiado!", description: "Link da proposta copiado para a área de transferência." });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm("Excluir esta proposta? Essa ação não pode ser desfeita.")) return;
    await deleteProposal(id);
    refreshData();
  };

  const handleNewProposalForLead = (lead: Lead) => {
    setProposalForm({ open: true, lead, proposal: null });
  };

  const handleEditProposal = (proposal: Proposal) => {
    setProposalForm({ open: true, lead: null, proposal });
  };

  const handleProposalSaved = () => {
    refreshData();
  };

  const proposalsByLead = (leadId: string) => proposals.filter(p => p.leadId === leadId);

  const filteredProposals = proposals.filter(p => {
    if (!proposalsSearch) return true;
    const q = proposalsSearch.toLowerCase();
    return (
      p.clienteNome.toLowerCase().includes(q) ||
      p.clienteEmpresa.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    );
  });

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    if (!newAdmin.nome || !newAdmin.email || !newAdmin.password) {
      setAdminError("Preencha todos os campos."); return;
    }
    if (newAdmin.password.length < 6) {
      setAdminError("Senha deve ter pelo menos 6 caracteres."); return;
    }
    const ok = addAdmin(newAdmin);
    if (!ok) { setAdminError("E-mail já cadastrado."); return; }
    setNewAdmin({ nome: "", email: "", password: "" });
    setShowNewAdmin(false);
    refreshData();
  };

  const handleRemoveAdmin = (email: string) => {
    if (email === session?.email) return;
    removeAdmin(email);
    refreshData();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (loginAdmin(loginForm.email, loginForm.password)) {
      setSession(getSession());
      refreshData();
      return;
    }
    setLoginError("E-mail ou senha incorretos.");
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Painel Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">Instituto Girassol</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
            <div>
              <Label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-wide text-foreground/70">E-mail</Label>
              <Input id="admin-email" type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="mt-1.5" placeholder="admin@girassol.com" />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Senha</Label>
              <Input id="admin-password" type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="mt-1.5" placeholder="••••••••" />
            </div>
            {loginError && <p className="text-destructive text-sm font-medium">{loginError}</p>}
            <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground py-5 font-semibold">
              Entrar
            </Button>
          </form>
          <p className="text-center text-muted-foreground text-xs mt-6">
            Use <strong className="text-foreground">admin@girassol.com</strong> e <strong className="text-foreground">girassol2026</strong>
          </p>
        </div>
      </div>
    );
  }


  const filteredLeads = leads.filter((l) => {
    const matchSearch = !searchTerm || 
      l.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const quizScoreAvg = quizzes.length > 0
    ? Math.round(quizzes.reduce((a, q) => a + q.score, 0) / quizzes.length)
    : 0;

  const conversionRate = views > 0 ? ((leads.length / views) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-primary">CRM · Instituto Girassol</h1>
            <p className="text-[10px] text-muted-foreground">Olá, {session.nome}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { icon: Eye, label: "Acessos", value: views, color: "bg-blue-500/10 text-blue-600" },
            { icon: ClipboardCheck, label: "Testes", value: quizzes.length, color: "bg-secondary/10 text-secondary" },
            { icon: Calculator, label: "Simulações", value: calcResults.length, color: "bg-orange-500/10 text-orange-600" },
            { icon: Users, label: "Leads", value: leads.length, color: "bg-green-500/10 text-green-600" },
            { icon: TrendingUp, label: "Conversão", value: `${conversionRate}%`, color: "bg-purple-500/10 text-purple-600" },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-xl border p-3 sm:p-4 text-center">
              <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border rounded-lg p-1 mb-6">
          {[
            { key: "crm" as const, label: `CRM (${leads.length})` },
            { key: "metricas" as const, label: "Métricas" },
            { key: "calculadora" as const, label: `Calculadora (${calcResults.length})` },
            { key: "propostas" as const, label: `Propostas (${proposals.length})` },
            { key: "admins" as const, label: `Admins (${admins.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── CRM TAB ─── */}
        {tab === "crm" && (
          <div>
            {/* Pipeline summary */}
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => setFilterStatus("todos")}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${filterStatus === "todos" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40"}`}
              >
                Todos ({leads.length})
              </button>
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${filterStatus === s ? cfg.color + " border-current" : "bg-card text-muted-foreground border-border hover:border-primary/40"}`}
                  >
                    {cfg.label} ({statusCounts[s]})
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            {/* Lead cards */}
            <div className="space-y-3">
              {filteredLeads.length === 0 ? (
                <div className="bg-card rounded-xl border p-8 text-center">
                  <p className="text-muted-foreground text-sm">{leads.length === 0 ? "Nenhum lead ainda." : "Nenhum lead encontrado."}</p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const statusCfg = STATUS_CONFIG[lead.status];
                  const isExpanded = expandedLead === lead.id;
                  return (
                    <div key={lead.id} className="bg-card rounded-xl border overflow-hidden">
                      <button
                        onClick={() => setExpandedLead(isExpanded ? null : lead.id)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        {/* Status dot */}
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.color} flex-shrink-0`}>
                          {statusCfg.label}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">{lead.nome}</p>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                            {lead.desafio?.startsWith("Quiz NR-1") ? (
                              <>
                                <ClipboardCheck className="h-3 w-3 flex-shrink-0 text-secondary" />
                                <span className="text-secondary font-medium">{lead.desafio}</span>
                              </>
                            ) : lead.desafio?.startsWith("Calculadora NR-1") ? (
                              <>
                                <Calculator className="h-3 w-3 flex-shrink-0 text-secondary" />
                                <span className="text-secondary font-medium">{lead.desafio}</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3 flex-shrink-0" />{lead.empresa || "—"} {lead.cargo ? `· ${lead.cargo}` : ""}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lead.whatsapp && (
                            <a
                              href={formatWhatsAppLink(lead.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="h-8 w-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500/20 transition-colors"
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          <span className="text-[10px] text-muted-foreground hidden sm:block">
                            {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t pt-4 space-y-4">
                          {/* Contact info */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate text-foreground">{lead.email}</span>
                            </a>
                            {lead.whatsapp && (
                              <a href={formatWhatsAppLink(lead.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm">
                                <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-green-700">{lead.whatsapp}</span>
                              </a>
                            )}
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 text-sm">
                              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-foreground truncate">{lead.empresa} · {lead.cargo}</span>
                            </div>
                          </div>

                          {/* Desafio */}
                          {lead.desafio && (
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Desafio NR-1</p>
                              <p className="text-sm text-foreground leading-relaxed">{lead.desafio}</p>
                            </div>
                          )}

                          {/* Status changer */}
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status do lead</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {STATUS_ORDER.map((s) => {
                                const cfg = STATUS_CONFIG[s];
                                return (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(lead.id, s)}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${lead.status === s ? cfg.color + " border-current shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary/30"}`}
                                  >
                                    {cfg.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <StickyNote className="h-3 w-3" /> Anotações
                              </p>
                              {editingNotes !== lead.id && (
                                <button
                                  onClick={() => { setEditingNotes(lead.id); setNoteText(lead.notas || ""); }}
                                  className="text-[11px] text-primary font-medium hover:underline"
                                >
                                  {lead.notas ? "Editar" : "Adicionar"}
                                </button>
                              )}
                            </div>
                            {editingNotes === lead.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  rows={3}
                                  placeholder="Anotações sobre o lead..."
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveNotes(lead.id)} className="hero-gradient border-0 text-primary-foreground text-xs">Salvar</Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)} className="text-xs">Cancelar</Button>
                                </div>
                              </div>
                            ) : (
                              lead.notas && <p className="text-sm text-foreground/70 bg-muted/30 rounded-lg p-3 leading-relaxed">{lead.notas}</p>
                            )}
                          </div>

                          {/* Propostas do lead */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Propostas comerciais
                              </p>
                              <button
                                onClick={() => handleNewProposalForLead(lead)}
                                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" /> Nova proposta
                              </button>
                            </div>
                            {proposalsByLead(lead.id).length === 0 ? (
                              <p className="text-xs text-muted-foreground italic bg-muted/20 rounded-lg p-2.5">
                                Nenhuma proposta criada para este lead.
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                {proposalsByLead(lead.id).map(p => (
                                  <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
                                    <Sparkles className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-primary truncate">
                                        {p.clienteEmpresa} · {p.investimentoTotal > 0 ? `R$ ${(p.investimentoTotal / 1000).toFixed(0)}k` : "Sem valor"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {new Date(p.createdAt).toLocaleDateString("pt-BR")} · {p.status}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button onClick={() => handleCopyProposalLink(p.slug)} title="Copiar link" className="h-7 w-7 rounded-md bg-card border hover:bg-secondary/10 flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors">
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                      <a href={proposalLink(p.slug)} target="_blank" rel="noopener noreferrer" title="Abrir" className="h-7 w-7 rounded-md bg-card border hover:bg-secondary/10 flex items-center justify-center text-muted-foreground hover:text-secondary transition-colors">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </a>
                                      <button onClick={() => handleEditProposal(p)} title="Editar" className="text-[10px] font-semibold text-primary hover:underline px-2">
                                        Editar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Meta + Delete */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-[10px] text-muted-foreground">
                              Criado em {new Date(lead.createdAt).toLocaleString("pt-BR")}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(lead.id)} className="text-destructive hover:text-destructive text-xs gap-1 h-7">
                              <Trash2 className="h-3 w-3" /> Excluir
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── MÉTRICAS TAB ─── */}
        {tab === "metricas" && (
          <div className="space-y-6">
            {/* Quiz metrics */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Métricas do Quiz
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{quizzes.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total de testes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{quizScoreAvg}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Score médio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {quizzes.filter((q) => q.score <= 30).length}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Alerta vermelho</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {quizzes.filter((q) => q.score > 60).length}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Na governança</div>
                </div>
              </div>
            </div>

            {/* Funnel */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Funil
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Acessos à página", value: views, pct: 100 },
                  { label: "Fizeram o teste", value: quizzes.length, pct: views > 0 ? (quizzes.length / views) * 100 : 0 },
                  { label: "Preencheram formulário", value: leads.length, pct: views > 0 ? (leads.length / views) * 100 : 0 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.value} ({item.pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full hero-gradient rounded-full transition-all" style={{ width: `${Math.max(item.pct, 2)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Pipeline de leads
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STATUS_ORDER.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <div key={s} className={`rounded-xl border p-3 text-center ${cfg.color}`}>
                      <div className="text-xl font-bold">{statusCounts[s]}</div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent quiz completions */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4">Últimos testes realizados</h3>
              {quizzes.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nenhum teste realizado ainda.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {quizzes.slice(0, 30).map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 text-sm gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`font-bold text-base flex-shrink-0 ${q.score <= 30 ? "text-destructive" : q.score <= 60 ? "text-yellow-600" : "text-green-600"}`}>
                          {q.score}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">
                            {q.nome || <span className="text-muted-foreground italic">Sem nome</span>}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {q.email || "Sem e-mail"} · {q.level}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── CALCULADORA TAB ─── */}
        {tab === "calculadora" && (
          <div className="space-y-6">
            {/* Calc metrics */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Métricas da Calculadora
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{calcResults.length}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total simulações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {calcResults.length > 0 ? Math.round(calcResults.reduce((a, c) => a + c.risk_score, 0) / calcResults.length) : 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Score médio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {calcResults.filter(c => c.risk_score > 70).length}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Risco crítico</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {calcResults.filter(c => c.risk_score <= 30).length}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Risco baixo</div>
                </div>
              </div>
            </div>

            {/* Recent calculator completions */}
            <div className="bg-card rounded-xl border p-5">
              <h3 className="text-sm font-bold text-primary mb-4">Últimas simulações</h3>
              {calcResults.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">Nenhuma simulação realizada ainda.</p>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {calcResults.slice(0, 50).map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/30 text-sm">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className={`font-bold text-base flex-shrink-0 ${c.risk_score > 70 ? "text-destructive" : c.risk_score > 30 ? "text-secondary" : "text-primary"}`}>
                            {c.risk_score}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary truncate">{c.nome || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.email} · {c.empresa || "—"}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-background rounded p-1.5 text-center">
                          <span className="text-muted-foreground">NR-1: </span>
                          <span className="font-semibold text-foreground">{c.bloco_nr1}/70</span>
                        </div>
                        <div className="bg-background rounded p-1.5 text-center">
                          <span className="text-muted-foreground">Sinais: </span>
                          <span className="font-semibold text-foreground">{c.bloco_sinais}/70</span>
                        </div>
                        <div className="bg-background rounded p-1.5 text-center">
                          <span className="text-muted-foreground">Gestão: </span>
                          <span className="font-semibold text-foreground">{c.bloco_gestao}/60</span>
                        </div>
                        <div className="bg-background rounded p-1.5 text-center">
                          <span className="text-muted-foreground">Multa: </span>
                          <span className="font-semibold text-foreground">R${Math.round(c.multa_min/1000)}k–{Math.round(c.multa_max/1000)}k</span>
                        </div>
                      </div>
                      <div className="mt-1.5 text-xs text-center bg-secondary/5 rounded p-1.5">
                        <span className="text-muted-foreground">Impacto total: </span>
                        <span className="font-bold text-primary">R${Math.round(c.impacto_min/1000)}k – R${Math.round(c.impacto_max/1000)}k/ano</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── ADMINS TAB ─── */}
        {tab === "admins" && (
          <div className="space-y-3">
            <Button onClick={() => setShowNewAdmin(!showNewAdmin)} size="sm" className="gap-1.5 hero-gradient border-0 text-primary-foreground">
              <UserPlus className="h-4 w-4" /> Novo Admin
            </Button>

            {showNewAdmin && (
              <form onSubmit={handleAddAdmin} className="bg-card rounded-xl border p-4 space-y-3">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Nome</Label>
                  <Input value={newAdmin.nome} onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })} className="mt-1" placeholder="Nome do admin" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">E-mail</Label>
                  <Input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className="mt-1" placeholder="email@exemplo.com" />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Senha</Label>
                  <Input type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} className="mt-1" placeholder="Mínimo 6 caracteres" />
                </div>
                {adminError && <p className="text-destructive text-xs font-medium">{adminError}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="hero-gradient border-0 text-primary-foreground">Criar</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setShowNewAdmin(false)}>Cancelar</Button>
                </div>
              </form>
            )}

            {admins.map((admin) => (
              <div key={admin.email} className="bg-card rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary">{admin.nome}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
                {admin.email !== session.email && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveAdmin(admin.email)} className="text-destructive hover:text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
