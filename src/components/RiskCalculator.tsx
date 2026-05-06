import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight, ArrowLeft, AlertTriangle, ShieldCheck,
  Building2, Calculator, User, Mail, Phone, CheckCircle, Eye, Star, BarChart3, TrendingUp, FileWarning
} from "lucide-react";
import {
  companyFields, blocoNR1, blocoSinais, blocoGestao, blocoReputacao,
  calculateResult, type CalculatorResult, type CalcQuestion,
} from "@/data/calculatorQuestions";
import { addCalculatorCompletion } from "@/lib/adminStore";

function formatBRL(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1000) return `R$ ${Math.round(value / 1000)}k`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

const STEPS = [
  { label: "Empresa", icon: Building2 },
  { label: "Estrutura", icon: FileWarning },
  { label: "Sinais", icon: AlertTriangle },
  { label: "Gestão", icon: BarChart3 },
  { label: "Reputação", icon: Star },
  { label: "Identificação", icon: User },
] as const;

const RiskCalculator = () => {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [captureForm, setCaptureForm] = useState({ nome: "", email: "", whatsapp: "", empresa: "" });
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const totalSteps = STEPS.length;

  const isStepComplete = () => {
    if (step === 0) return companyFields.every(f => company[f.id]);
    if (step === 1) return blocoNR1.every(q => answers[q.id] !== undefined);
    if (step === 2) return blocoSinais.every(q => answers[q.id] !== undefined);
    if (step === 3) return blocoGestao.every(q => answers[q.id] !== undefined);
    if (step === 4) return blocoReputacao.every(q => answers[q.id] !== undefined);
    if (step === 5) return captureForm.nome.trim() !== "" && captureForm.email.trim() !== "";
    return false;
  };

  const handleNext = () => {
    if (!isStepComplete()) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const res = calculateResult(company, answers);
    setResult(res);
    await addCalculatorCompletion({
      nome: captureForm.nome,
      email: captureForm.email,
      whatsapp: captureForm.whatsapp,
      empresa: captureForm.empresa,
      num_colaboradores: company.num_colaboradores || "",
      faturamento: company.faturamento || "",
      momento: company.momento || "",
      estrutura: company.estrutura || "",
      risk_score: res.riskScore,
      risk_level: res.riskLevel,
      bloco_nr1: res.blocoNR1Score,
      bloco_sinais: res.blocoSinaisScore,
      bloco_gestao: res.blocoGestaoScore,
      multa_min: res.multaMin,
      multa_max: res.multaMax,
      impacto_min: res.impactoMin,
      impacto_max: res.impactoMax,
      respostas: { company, answers },
    });
  };

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="bg-card rounded-2xl border p-6 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Risco Organizacional</p>
              <div className="text-4xl font-extrabold text-primary">{result.riskScore}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
              <p className={`mt-2 text-sm font-bold ${result.riskScore > 70 ? 'text-destructive' : 'text-amber-600'}`}>{result.riskLevel}</p>
           </div>
           <div className="bg-card rounded-2xl border p-6 text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Reputação</p>
              <div className="text-4xl font-extrabold text-primary">{result.reputationScore}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
              <p className="mt-2 text-sm font-bold text-secondary">{result.reputationLevel}</p>
           </div>
        </div>

        <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-6 text-center">
           <p className="text-xs font-bold text-destructive uppercase tracking-widest mb-2">Impacto Financeiro Estimado</p>
           <div className="text-2xl sm:text-3xl font-extrabold text-destructive">
             {formatBRL(result.impactoMin)} – {formatBRL(result.impactoMax)}
             <span className="text-sm font-medium ml-1">/ano</span>
           </div>
        </div>

        <div className="space-y-3">
           {[
             { label: "Perda de produtividade", val: `${formatBRL(result.perdaProdMin)} – ${formatBRL(result.perdaProdMax)}` },
             { label: "Custo com rotatividade", val: formatBRL(result.custoRotatividade) },
             { label: "Risco trabalhista + multas", val: `${formatBRL(result.riscoTrabMin + result.multaMin)} – ${formatBRL(result.riscoTrabMax + result.multaMax)}` },
           ].map((item, i) => (
             <div key={i} className="flex justify-between items-center bg-card border rounded-xl px-4 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-primary">{item.val}</span>
             </div>
           ))}
        </div>

        <div className="pt-6">
           <Button onClick={() => window.open("https://chat.whatsapp.com/Dj8pvjQAaNJE06oqDzfeya", "_blank")} className="w-full gold-gradient border-0 text-primary font-bold py-6 shadow-lg">
              Agendar conversa sobre o seu risco NR-1
           </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 overflow-x-auto pb-2">
         {STEPS.map((s, i) => (
           <div key={i} className="flex flex-col items-center min-w-[60px]">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${step >= i ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground'}`}>
                 <s.icon className="h-4 w-4" />
              </div>
              <span className={`text-[10px] font-bold uppercase ${step >= i ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
           </div>
         ))}
      </div>

      <div className="min-h-[300px]">
        {step === 0 && (
          <div className="space-y-4">
            {companyFields.map(f => (
              <div key={f.id} className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">{f.label}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {f.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCompany({...company, [f.id]: opt.value})}
                      className={`py-2 px-3 rounded-lg border-2 text-xs font-bold transition-all ${company[f.id] === opt.value ? 'border-secondary bg-secondary/10 text-primary' : 'border-border'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(step >= 1 && step <= 4) && (
          <div className="space-y-6">
             {(step === 1 ? blocoNR1 : step === 2 ? blocoSinais : step === 3 ? blocoGestao : blocoReputacao).map(q => (
               <div key={q.id} className="space-y-3">
                  <p className="text-sm font-bold text-primary">{q.question}</p>
                  <div className="flex flex-wrap gap-2">
                     {q.options.map((opt, idx) => (
                       <button
                         key={idx}
                         onClick={() => setAnswers({...answers, [q.id]: opt.points})}
                         className={`py-2 px-4 rounded-full border-2 text-xs font-bold transition-all ${answers[q.id] === opt.points ? 'border-secondary bg-secondary/10 text-primary' : 'border-border'}`}
                       >
                         {opt.text}
                       </button>
                     ))}
                  </div>
               </div>
             ))}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 max-w-sm mx-auto">
             <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-primary">Simulação concluída!</h3>
                <p className="text-sm text-muted-foreground">Preencha seus dados para acessar o resultado completo.</p>
             </div>
             <div>
                <Label>Nome</Label>
                <Input value={captureForm.nome} onChange={e => setCaptureForm({...captureForm, nome: e.target.value})} placeholder="Seu nome" className="mt-1" />
             </div>
             <div>
                <Label>E-mail</Label>
                <Input type="email" value={captureForm.email} onChange={e => setCaptureForm({...captureForm, email: e.target.value})} placeholder="seu@email.com" className="mt-1" />
             </div>
             <div>
                <Label>WhatsApp</Label>
                <Input value={captureForm.whatsapp} onChange={e => setCaptureForm({...captureForm, whatsapp: e.target.value})} placeholder="(00) 00000-0000" className="mt-1" />
             </div>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-between">
         {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Voltar</Button>}
         <div className="flex-1" />
         <Button onClick={handleNext} disabled={!isStepComplete()} className="gold-gradient border-0 text-primary font-bold px-8">
            {step === totalSteps - 1 ? "Ver Resultado" : "Próxima"}
         </Button>
      </div>
    </div>
  );
};

export default RiskCalculator;
