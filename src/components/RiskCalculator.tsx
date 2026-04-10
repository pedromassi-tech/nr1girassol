import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight, ArrowLeft, AlertTriangle, ShieldCheck, ShieldAlert,
  User, Mail, Phone, Building2, Calculator, Users, TrendingUp,
  FileWarning, BarChart3, CheckCircle, Star, Eye,
} from "lucide-react";
import {
  companyFields, blocoNR1, blocoSinais, blocoGestao, blocoReputacao,
  calculateResult, type CalculatorResult, type CalcQuestion,
} from "@/data/calculatorQuestions";
import { addCalculatorCompletion } from "@/lib/adminStore";

function formatBRL(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

const STEPS = [
  { label: "Sua empresa", icon: Building2, desc: "Dados básicos" },
  { label: "Estrutura NR-1", icon: FileWarning, desc: "Conformidade" },
  { label: "Sinais de risco", icon: AlertTriangle, desc: "Operação" },
  { label: "Gestão", icon: BarChart3, desc: "Performance" },
  { label: "Reputação", icon: Star, desc: "Imagem & talentos" },
  { label: "Seus dados", icon: User, desc: "Resultado" },
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

  const handleRestart = () => {
    setStep(0);
    setCompany({});
    setAnswers({});
    setCaptureForm({ nome: "", email: "", whatsapp: "", empresa: "" });
    setResult(null);
  };

  // ─── SCORE GAUGE ───
  const ScoreGauge = ({ score, label, sublabel, color }: { score: number; label: string; sublabel: string; color: "risk" | "reputation" }) => {
    const getColor = () => {
      if (color === "risk") {
        if (score <= 30) return { ring: "text-green-500", bg: "bg-green-500/10", text: "text-green-600" };
        if (score <= 70) return { ring: "text-amber-500", bg: "bg-amber-500/10", text: "text-amber-600" };
        return { ring: "text-red-500", bg: "bg-red-500/10", text: "text-red-600" };
      }
      if (score <= 30) return { ring: "text-green-500", bg: "bg-green-500/10", text: "text-green-600" };
      if (score <= 60) return { ring: "text-amber-500", bg: "bg-amber-500/10", text: "text-amber-600" };
      return { ring: "text-red-500", bg: "bg-red-500/10", text: "text-red-600" };
    };
    const c = getColor();
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
            <circle
              cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
              className={c.ring}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl sm:text-3xl font-extrabold ${c.text}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground font-medium">/100</span>
          </div>
        </div>
        <p className={`mt-2 text-sm font-bold ${c.text}`}>{sublabel}</p>
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{label}</p>
      </div>
    );
  };

  // ─── RESULT SCREEN ───
  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
        {/* Two score gauges */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-card p-4 sm:p-6 flex justify-center">
            <ScoreGauge score={result.riskScore} label="Score de Risco" sublabel={result.riskLevel} color="risk" />
          </div>
          <div className="rounded-2xl border bg-card p-4 sm:p-6 flex justify-center">
            <ScoreGauge score={result.reputationScore} label="Score de Reputação" sublabel={result.reputationLevel} color="reputation" />
          </div>
        </div>

        {/* Financial breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-4 w-4 text-secondary" />
            <h4 className="text-sm font-bold text-primary">Exposição financeira estimada</h4>
          </div>

          <div className="space-y-2">
            {[
              { label: "Perda estimada de produtividade", value: `${formatBRL(result.perdaProdMin)} – ${formatBRL(result.perdaProdMax)}`, suffix: "/ano", icon: "📉" },
              { label: "Custo estimado com rotatividade", value: `${formatBRL(result.custoRotatividade)}`, suffix: "/ano", icon: "🔄" },
              ...(result.riscoTrabMax > 0 ? [{ label: "Risco trabalhista estimado", value: `${formatBRL(result.riscoTrabMin)} – ${formatBRL(result.riscoTrabMax)}`, suffix: "", icon: "⚖️" }] : []),
              { label: "Multa potencial NR-1", value: `${formatBRL(result.multaMin)} – ${formatBRL(result.multaMax)}`, suffix: "", icon: "🚨" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">{item.label}</span>
                </div>
                <span className="text-sm sm:text-base font-bold text-primary whitespace-nowrap">
                  {item.value}{item.suffix && <span className="text-xs text-muted-foreground font-normal">{item.suffix}</span>}
                </span>
              </div>
            ))}
          </div>

          {/* Total impact - highlighted */}
          <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5 text-center">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
              Impacto financeiro total estimado
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-destructive">
              {formatBRL(result.impactoMin)} – {formatBRL(result.impactoMax)}
              <span className="text-sm font-medium text-muted-foreground ml-1">/ano</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-md mx-auto">
              Esse é o custo estimado de não estruturar a gestão de riscos psicossociais hoje.
            </p>
          </div>

          <p className="text-[0.65rem] text-muted-foreground leading-relaxed italic">
            Faixas estimadas com base em porte da empresa, nível de não conformidade com NR-1 e parâmetros de multas praticadas no mercado. Os valores são uma ordem de grandeza e não constituem consultoria jurídica.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
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

  // ─── STEP INDICATOR ───
  const renderStepIndicator = () => (
    <div className="mb-6 sm:mb-8">
      <div className="hidden sm:flex items-center justify-between mb-2">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <div key={i} className="flex flex-col items-center flex-1 relative">
              {i > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  isDone ? "bg-secondary" : "bg-border"
                }`} />
              )}
              <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                isCurrent
                  ? "bg-secondary text-primary shadow-md shadow-secondary/30 scale-110"
                  : isDone
                    ? "bg-secondary/20 text-secondary"
                    : "bg-muted text-muted-foreground"
              }`}>
                {isDone ? <CheckCircle className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
              </div>
              <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${
                isCurrent ? "text-secondary" : isDone ? "text-foreground/60" : "text-muted-foreground/50"
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-4 w-4 text-secondary" />; })()}
            <span className="text-sm font-bold text-primary">{STEPS[step].label}</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{step + 1}/{totalSteps}</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
              i <= step ? "bg-secondary" : "bg-border"
            }`} />
          ))}
        </div>
      </div>
    </div>
  );

  // ─── QUESTIONS RENDERER ───
  const renderQuestions = (questions: CalcQuestion[]) => {
    const answeredCount = questions.filter(q => answers[q.id] !== undefined).length;
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-secondary font-bold">{answeredCount}</span> de {questions.length} respondidas
          </p>
        </div>
        <div className="space-y-2.5 sm:space-y-3">
          {questions.map((q, qIdx) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <div
                key={q.id}
                className={`rounded-xl border-2 p-3.5 sm:p-4 transition-all ${
                  isAnswered ? "border-secondary/20 bg-secondary/[0.03]" : "border-border bg-card"
                }`}
              >
                <div className="flex gap-2.5 items-start mb-3">
                  <span className={`flex-shrink-0 h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 ${
                    isAnswered ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                  }`}>
                    {isAnswered ? "✓" : qIdx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-primary leading-snug">{q.question}</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pl-7">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.points })}
                      className={`py-2 sm:py-2.5 px-2 rounded-lg text-[11px] sm:text-xs font-semibold border-2 transition-all text-center leading-tight ${
                        answers[q.id] === opt.points
                          ? "border-secondary bg-secondary/15 text-secondary shadow-sm"
                          : "border-border hover:border-secondary/30 text-muted-foreground hover:text-foreground bg-background"
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── COMPANY FIELDS ───
  const renderCompanyStep = () => (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-md mx-auto">
        Comece informando o perfil da sua empresa para uma simulação precisa.
      </p>
      {companyFields.map((field, fIdx) => {
        const icons = [Users, TrendingUp, BarChart3, Building2];
        const FieldIcon = icons[fIdx] || Building2;
        return (
          <div key={field.id} className="rounded-xl border-2 border-border bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <FieldIcon className="h-3.5 w-3.5 text-secondary" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-primary">{field.label}</span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {field.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCompany({ ...company, [field.id]: opt.value })}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-[13px] font-semibold border-2 transition-all text-center ${
                    company[field.id] === opt.value
                      ? "border-secondary bg-secondary/15 text-secondary shadow-sm"
                      : "border-border hover:border-secondary/30 text-muted-foreground hover:text-foreground bg-background"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── CAPTURE FORM ───
  const renderCapture = () => (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <div className="h-14 w-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
          <Calculator className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-primary mb-1">Simulação pronta!</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Preencha seus dados para ver o resultado completo com score de risco, reputação e impacto financeiro.
        </p>
      </div>
      <div className="space-y-3.5">
        {[
          { id: "nome", label: "Nome", icon: User, type: "text", placeholder: "Seu nome completo", required: true },
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
    </div>
  );

  const stepContent = () => {
    switch (step) {
      case 0: return renderCompanyStep();
      case 1: return renderQuestions(blocoNR1);
      case 2: return renderQuestions(blocoSinais);
      case 3: return renderQuestions(blocoGestao);
      case 4: return renderQuestions(blocoReputacao);
      case 5: return renderCapture();
      default: return null;
    }
  };

  return (
    <div>
      {renderStepIndicator()}

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

      <div className="mt-6 sm:mt-8 flex justify-between items-center">
        {step > 0 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2 py-5 text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        ) : <div />}
        <Button
          onClick={handleNext}
          disabled={!isStepComplete()}
          className="hero-gradient border-0 text-primary-foreground px-7 py-5 text-sm font-semibold gap-2 shadow-md disabled:opacity-40"
        >
          {step === totalSteps - 1 ? "Ver simulação" : "Próxima etapa"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default RiskCalculator;
