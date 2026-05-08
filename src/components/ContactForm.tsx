import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { addLead } from "@/lib/adminStore";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    empresa: "",
    cargo: "",
    desafio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLead(form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10"
      >
        <div className="h-14 w-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <h4 className="text-lg font-bold text-primary mb-2">Recebemos seus dados!</h4>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          A equipe do Instituto Girassol vai entrar em contato para entender melhor sua realidade e falar sobre os próximos passos.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">Nome</Label>
        <Input id="nome" name="nome" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="mt-1.5 bg-background" placeholder="Seu nome completo" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">E-mail</Label>
          <Input id="email" name="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-background" placeholder="seu@email.com" />
        </div>
        <div>
          <Label htmlFor="whatsapp" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" type="tel" required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="mt-1.5 bg-background" placeholder="(11) 99999-9999" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="empresa" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">Empresa</Label>
          <Input id="empresa" name="empresa" required value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} className="mt-1.5 bg-background" placeholder="Nome da empresa" />
        </div>
        <div>
          <Label htmlFor="cargo" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">Cargo</Label>
          <Input id="cargo" name="cargo" required value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="mt-1.5 bg-background" placeholder="Seu cargo" />
        </div>
      </div>
      <div>
        <Label htmlFor="desafio" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">Principal desafio em NR-1</Label>
        <Textarea id="desafio" name="desafio" rows={3} value={form.desafio} onChange={e => setForm({ ...form, desafio: e.target.value })} className="mt-1.5 bg-background" placeholder="Conte brevemente o cenário da sua empresa..." />
      </div>
      <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground py-5 text-sm font-semibold shadow-md">
        Enviar
      </Button>
    </form>
  );
};

export default ContactForm;
