import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight, ArrowLeft, AlertTriangle, ShieldCheck, ShieldAlert,
  User, Mail, Phone, Building2, Calculator,
} from "lucide-react";
import {
  companyFields, blocoNR1, blocoSinais, blocoGestao,
  calculateResult, type CalculatorResult,
} from "@/data/calculatorQuestions";
import { addCalculatorCompletion } from "@/lib/adminStore";

function formatBRL(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

const STEPS = [
  { label: "Dados da empresa", key: "company" },
  { label: "Estrutura NR-1", key: "nr1" },
  { label: "Sinais de risco", key: "sinais" },
  { label: "Gestão e performance", key: "gestao" },
  { label: "Seus dados", key: "capture" },
] as const;

const RiskCalculator = () => {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [captureForm, setCaptureForm] = useState({ nome: "", email: "", whatsapp: "", empresa: "" });
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const totalSteps = STEPS.length;
  const progress = (step / totalSteps) * 100;

  // Step validation
  const isStepComplete = () => {
    if (step === 0) return companyFields.every(f => company[f.id]);
    if (step === 1) return blocoNR1.every(q => answers[q.id] !== undefined);
    if (step === 2) return blocoSinais.every(q => answers[q.id] !== undefined);
    if (step === 3) return blocoGestao.every(q => answers[q.id] !== undefined);
    if (step === 4) return captureForm.nome.trim() !== "" && captureForm.email.trim() !== "";
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

  const handleRestart = () => {
    setStep(0);
    setCompany({});
    setAnswers({});
    setCaptureForm({ nome: "", email: "", whatsapp: "", empresa: "" });
    setResult(null);
  };

  // ─── RESULT SCREEN ───
  if (result) {
    const getIcon = () => {
      if (result.riskScore <= 30) return <ShieldCheck className="h-10 w-10 text-secondary" />;
      if (result.riskScore <= 70) return <ShieldAlert className="h-10 w-10 text-secondary" />;
      return <AlertTriangle className="h-10 w-10 text-destructive" />;
    };
    const getBg = () => {
      if (result.riskScore <= 30) return "from-secondary/10 to-secondary/5 border-secondary/20";
      if (result.riskScore <= 70) return "from-secondary/10 to-secondary/5 border-secondary/30";
      return "from-destructive/10 to-destructive/5 border-destructive/20";
    };

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Score */}
        <div className={`rounded-2xl border bg-gradient-to-b ${getBg()} p-5 sm:p-8 text-center`}>
          <div className="flex justify-center mb-3">{getIcon()}</div>
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">Score de risco</p>
          <div className="text-4xl sm:text-6xl font-extrabold text-primary">
            {result.riskScore}<span className="text-xl sm:text-2xl font-semibold text-muted-foreground">/100</span>
          </div>
          <p className="mt-2 font-bold text-lg" style={{ color: result.riskScore > 70 ? "hsl(var(--destructive))" : "hsl(var(--secondary))" }}>
            {result.riskLevel}
          </p>
        </div>

        {/* Financial impact breakdown */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-bold text-primary">Simulação de impacto financeiro anual</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Multa potencial (NR-1)</p>
              <p className="text-base font-bold text-primary">{formatBRL(result.multaMin)} – {formatBRL(result.multaMax)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Perda de produtividade</p>
              <p className="text-base font-bold text-primary">{formatBRL(result.perdaProdMin)} – {formatBRL(result.perdaProdMax)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">Custo com rotatividade</p>
              <p className="text-base font-bold text-primary">{formatBRL(result.custoRotatividade)}/ano</p>
            </div>
            {result.riscoTrabMax > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">Risco trabalhista</p>
                <p className="text-base font-bold text-primary">{formatBRL(result.riscoTrabMin)} – {formatBRL(result.riscoTrabMax)}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border-2 border-secondary/30 bg-secondary/5 p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Impacto financeiro total estimado</p>
            <p className="text-xl sm:text-2xl font-extrabold text-primary">
              {formatBRL(result.impactoMin)} – {formatBRL(result.impactoMax)}
              <span className="text-sm font-medium text-muted-foreground">/ano</span>
            </p>
          </div>

          <p className="text-[0.7rem] text-muted-foreground leading-relaxed italic">
            Faixas estimadas com base em porte da empresa, nível de não conformidade com NR-1 e parâmetros de multas praticadas no mercado atualmente. Os valores são uma ordem de grandeza e não constituem consultoria jurídica.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a href="https://chat.whatsapp.com/Dj8pvjQAaNJE06oqDzfeya?mode=gi_t" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button className="w-full gold-gradient border-0 text-primary font-semibold px-6 py-5 shadow-md">
              Entrar no grupo NR1 na Prática
            </Button>
          </a>
          <Button variant="outline" onClick={handleRestart} className="w-full sm:w-auto gap-2 py-5">
            Refazer simulação
          </Button>
        </div>
      </motion.div>
    );
  }

  // ─── QUESTIONS RENDERER ───
  const renderQuestions = (questions: typeof blocoNR1) => (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} className="rounded-xl border bg-card p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-primary mb-2">{q.question}</p>
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [q.id]: opt.points })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                  answers[q.id] === opt.points
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/40 text-muted-foreground"
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── COMPANY FIELDS ───
  const renderCompanyStep = () => (
    <div className="space-y-4">
      {companyFields.map((field) => (
        <div key={field.id}>
          <Label className="text-foreground/70 text-xs font-semibold tracking-wide uppercase mb-2 block">
            {field.label}
          </Label>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCompany({ ...company, [field.id]: opt.value })}
                className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                  company[field.id] === opt.value
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border hover:border-secondary/40 text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── CAPTURE FORM ───
  const renderCapture = () => (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="text-center mb-4">
        <Calculator className="h-10 w-10 text-secondary mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Preencha seus dados para ver a simulação completa.</p>
      </div>
      {[
        { id: "nome", label: "Nome", icon: User, type: "text", placeholder: "Seu nome", required: true },
        { id: "email", label: "E-mail", icon: Mail, type: "email", placeholder: "seu@email.com", required: true },
        { id: "whatsapp", label: "WhatsApp", icon: Phone, type: "tel", placeholder: "(11) 99999-0000", required: false },
        { id: "empresa", label: "Empresa", icon: Building2, type: "text", placeholder: "Nome da empresa", required: false },
      ].map((f) => (
        <div key={f.id}>
          <Label htmlFor={`calc-${f.id}`} className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">
            {f.label} {f.required && <span className="text-destructive">*</span>}
          </Label>
          <div className="relative mt-1.5">
            <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={`calc-${f.id}`}
              type={f.type}
              required={f.required}
              value={(captureForm as any)[f.id]}
              onChange={e => setCaptureForm({ ...captureForm, [f.id]: e.target.value })}
              className="pl-10 bg-background"
              placeholder={f.placeholder}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const stepContent = () => {
    switch (step) {
      case 0: return renderCompanyStep();
      case 1: return renderQuestions(blocoNR1);
      case 2: return renderQuestions(blocoSinais);
      case 3: return renderQuestions(blocoGestao);
      case 4: return renderCapture();
      default: return null;
    }
  };

  return (
    <div>
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>{STEPS[step].label}</span>
          <span>Etapa {step + 1} de {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {stepContent()}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2 py-5">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        ) : <div />}
        <Button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className="hero-gradient border-0 text-primary-foreground px-7 py-5 text-sm font-semibold gap-2 shadow-md disabled:opacity-40"
        >
          {step === totalSteps - 1 ? "Ver simulação" : "Próxima"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RiskCalculator;
