import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSession, logout, getLeads, getPageViews, getQuizCompletions,
  getAdmins, addAdmin, removeAdmin,
  type Lead, type AdminUser, type QuizCompletion,
} from "@/lib/adminStore";
import {
  Users, Eye, ClipboardCheck, LogOut, UserPlus, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());
  const [tab, setTab] = useState<"leads" | "admins">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quizzes, setQuizzes] = useState<QuizCompletion[]>([]);
  const [views, setViews] = useState(0);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ nome: "", email: "", password: "" });
  const [adminError, setAdminError] = useState("");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  useEffect(() => {
    if (!session) { navigate("/admin/login"); return; }
    setLeads(getLeads());
    setQuizzes(getQuizCompletions());
    setViews(getPageViews());
    setAdmins(getAdmins());
  }, [session, navigate]);

  const handleLogout = () => { logout(); setSession(null); };

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
    setAdmins(getAdmins());
    setNewAdmin({ nome: "", email: "", password: "" });
    setShowNewAdmin(false);
  };

  const handleRemoveAdmin = (email: string) => {
    if (email === session?.email) return;
    removeAdmin(email);
    setAdmins(getAdmins());
  };

  if (!session) return null;

  const stats = [
    { icon: Eye, label: "Acessos", value: views, color: "bg-blue-500/10 text-blue-600" },
    { icon: ClipboardCheck, label: "Testes feitos", value: quizzes.length, color: "bg-secondary/10 text-secondary" },
    { icon: Users, label: "Leads", value: leads.length, color: "bg-green-500/10 text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-primary">Painel Admin</h1>
            <p className="text-[10px] text-muted-foreground">Olá, {session.nome}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-card rounded-xl border p-4 text-center">
              <div className={`h-9 w-9 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border rounded-lg p-1 mb-6">
          <button
            onClick={() => setTab("leads")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${tab === "leads" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setTab("admins")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${tab === "admins" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Admins ({admins.length})
          </button>
        </div>

        {/* Leads Tab */}
        {tab === "leads" && (
          <div className="space-y-3">
            {leads.length === 0 ? (
              <div className="bg-card rounded-xl border p-8 text-center">
                <p className="text-muted-foreground text-sm">Nenhum lead ainda.</p>
                <p className="text-muted-foreground text-xs mt-1">Os leads aparecerão aqui quando alguém preencher o formulário.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="bg-card rounded-xl border overflow-hidden">
                  <button
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">{lead.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      {expandedLead === lead.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedLead === lead.id && (
                    <div className="px-4 pb-4 border-t pt-3 space-y-2 text-sm">
                      <div><span className="text-muted-foreground text-xs">Empresa:</span> <span className="text-foreground">{lead.empresa}</span></div>
                      <div><span className="text-muted-foreground text-xs">Cargo:</span> <span className="text-foreground">{lead.cargo}</span></div>
                      {lead.desafio && (
                        <div><span className="text-muted-foreground text-xs">Desafio:</span> <span className="text-foreground">{lead.desafio}</span></div>
                      )}
                      <div><span className="text-muted-foreground text-xs">Data:</span> <span className="text-foreground">{new Date(lead.createdAt).toLocaleString("pt-BR")}</span></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Admins Tab */}
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
