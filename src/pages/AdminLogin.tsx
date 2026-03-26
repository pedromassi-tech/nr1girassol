import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/adminStore";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (loginAdmin(email, password)) {
      navigate("/admin");
    } else {
      setError("E-mail ou senha incorretos.");
    }
  };

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
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border p-6 space-y-4 shadow-sm">
          <div>
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-foreground/70">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="admin@girassol.com" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" placeholder="••••••••" />
          </div>
          {error && <p className="text-destructive text-sm font-medium">{error}</p>}
          <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground py-5 font-semibold">
            Entrar
          </Button>
        </form>
        <p className="text-center text-muted-foreground text-xs mt-6">
          Acesso restrito à equipe administrativa.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
