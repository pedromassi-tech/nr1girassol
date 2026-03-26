import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    empresa: "",
    cargo: "",
    desafio: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
        <h4 className="text-xl font-bold text-primary mb-2">Recebemos seus dados!</h4>
        <p className="text-muted-foreground max-w-md mx-auto">
          A equipe do Instituto Girassol vai entrar em contato para entender melhor sua realidade e falar sobre os próximos passos.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
      <div>
        <Label htmlFor="nome" className="text-primary font-medium">Nome</Label>
        <Input id="nome" required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="email" className="text-primary font-medium">E-mail</Label>
        <Input id="email" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="empresa" className="text-primary font-medium">Empresa</Label>
          <Input id="empresa" required value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="cargo" className="text-primary font-medium">Cargo</Label>
          <Input id="cargo" required value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="desafio" className="text-primary font-medium">Qual é o principal desafio da sua empresa hoje em NR-1?</Label>
        <Textarea id="desafio" rows={4} value={form.desafio} onChange={e => setForm({ ...form, desafio: e.target.value })} className="mt-1" />
      </div>
      <Button type="submit" className="w-full bg-primary text-primary-foreground py-6 text-base font-semibold">
        Enviar
      </Button>
    </form>
  );
};

export default ContactForm;
