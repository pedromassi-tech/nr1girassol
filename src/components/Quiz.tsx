import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  quizQuestions,
  reputationQuestions,
  getScoreResult,
  getReputationResult,
  getFinancialImpact,
  formatBRL,
} from "@/data/quizQuestions";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  User,
  Mail,
  Sparkles,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { addQuizCompletion } from "@/lib/adminStore";

type Phase = "risk" | "reputation";

const Quiz = () => {
  const [phase, setPhase] = useState<Phase>("risk");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<number[]>([]);
  const [repAnswers, setRepAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [captureForm, setCaptureForm] = useState({ nome: "", email: "" });

  const activeQuestions = phase === "risk" ? quizQuestions : reputationQuestions;
  const totalQuestions = activeQuestions.length;
  const totalAll = quizQuestions.length + reputationQuestions.length;
  const answeredAll =
    (phase === "risk" ? currentQuestion : quizQuestions.length + currentQuestion);
  const progress = (answeredAll / totalAll) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;
    const points = activeQuestions[currentQuestion].options[selectedOption].points;

    if (phase === "risk") {
      const newAnswers = [...riskAnswers, points];
      setRiskAnswers(newAnswers);
      setSelectedOption(null);
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // move to reputation phase
        setPhase("reputation");
        setCurrentQuestion(0);
      }
    } else {
      const newAnswers = [...repAnswers, points];
      setRepAnswers(newAnswers);
      setSelectedOption(null);
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowCapture(true);
      }
    }
  };

  const totalScore = riskAnswers.reduce((a, b) => a + b, 0);
  const result = getScoreResult(totalScore);
  const reputation = getReputationResult(repAnswers);
  const impact = getFinancialImpact(totalScore, reputation.score);

  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addQuizCompletion(totalScore, result.level, captureForm.nome, captureForm.email);
    setShowCapture(false);
    setShowResult(true);
  };

  const handleRestart = () => {
    setPhase("risk");
    setCurrentQuestion(0);
    setRiskAnswers([]);
    setRepAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setShowCapture(false);
    setCaptureForm({ nome: "", email: "" });
  };

  const getResultIcon = () => {
    if (totalScore <= 30) return <AlertTriangle className="h-10 w-10 text-destructive" />;
    if (totalScore <= 60) return <ShieldCheck className="h-10 w-10 text-secondary" />;
    return <CheckCircle className="h-10 w-10 text-secondary" />;
  };

  // ===== Capture step =====
  if (showCapture) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">Quiz concluído!</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Preencha seus dados abaixo para ver seu diagnóstico completo: risco, reputação e impacto financeiro.
          </p>
        </div>

        <form onSubmit={handleCaptureSubmit} className="space-y-4 max-w-sm mx-auto">
          <div>
            <Label htmlFor="quiz-nome" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">
              Nome
            </Label>
            <div className="relative mt-1.5">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="quiz-nome"
                required
                value={captureForm.nome}
                onChange={e => setCaptureForm({ ...captureForm, nome: e.target.value })}
                className="pl-10 bg-background"
                placeholder="Seu nome completo"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="quiz-email" className="text-foreground/70 text-xs font-semibold tracking-wide uppercase">
              E-mail
            </Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="quiz-email"
                type="email"
                required
                value={captureForm.email}
                onChange={e => setCaptureForm({ ...captureForm, email: e.target.value })}
                className="pl-10 bg-background"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <Button type="submit" className="w-full hero-gradient border-0 text-primary-foreground py-5 text-sm font-semibold shadow-md gap-2">
            Ver meu resultado
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </motion.div>
    );
  }

  // ===== Result step =====
  if (showResult) {
    const riskColor =
      totalScore <= 30
        ? "from-destructive/15 to-destructive/5 border-destructive/30 text-destructive"
        : totalScore <= 60
        ? "from-amber-500/15 to-amber-500/5 border-amber-500/30 text-amber-600"
        : "from-secondary/15 to-secondary/5 border-secondary/30 text-secondary";

    const repColor =
      reputation.score <= 40
        ? "from-destructive/15 to-destructive/5 border-destructive/30 text-destructive"
        : reputation.score <= 70
        ? "from-blue-500/15 to-blue-500/5 border-blue-500/30 text-blue-600"
        : "from-secondary/15 to-secondary/5 border-secondary/30 text-secondary";

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">{getResultIcon()}</div>
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Seu diagnóstico NR-1</p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-primary mt-1">
            Três indicadores para sua empresa
          </h3>
        </div>

        {/* 3 indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Risk */}
          <div className={`rounded-2xl border bg-gradient-to-b ${riskColor} p-4 sm:p-5 text-center`}>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-[0.65rem] sm:text-xs font-bold tracking-wider uppercase">Risco Organizacional</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-primary">
              {totalScore}
              <span className="text-base font-semibold text-muted-foreground">/100</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm font-bold">{result.level}</p>
          </div>

          {/* Reputation */}
          <div className={`rounded-2xl border bg-gradient-to-b ${repColor} p-4 sm:p-5 text-center`}>
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-[0.65rem] sm:text-xs font-bold tracking-wider uppercase">Reputação</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-primary">
              {reputation.score}
              <span className="text-base font-semibold text-muted-foreground">/100</span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm font-bold">{reputation.level}</p>
          </div>

          {/* Financial impact */}
          <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-500/15 to-orange-500/5 p-4 sm:p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2 text-orange-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-[0.65rem] sm:text-xs font-bold tracking-wider uppercase">Impacto Financeiro</span>
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-orange-600 leading-tight">
              {formatBRL(impact.min)}
              <span className="text-muted-foreground font-semibold"> – </span>
              {formatBRL(impact.max)}
            </div>
            <p className="mt-1.5 text-[0.7rem] sm:text-xs text-muted-foreground">estimado por ano</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-orange-600">{impact.label}</p>
          </div>
        </div>

        {/* Explanations */}
        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Risco Organizacional
            </p>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed whitespace-pre-line">{result.text}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Reputação Organizacional
            </p>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">{reputation.text}</p>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Impacto Financeiro Estimado
            </p>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
              Faixa anual estimada de exposição combinando risco e reputação — considera perda de produtividade,
              rotatividade, risco trabalhista e potencial multa NR-1.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a href="https://chat.whatsapp.com/Dj8pvjQAaNJE06oqDzfeya?mode=gi_t" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button className="w-full gold-gradient border-0 text-primary font-semibold px-6 py-5 shadow-md">
              Entrar no grupo NR1 na Prática
            </Button>
          </a>
          <Button variant="outline" onClick={handleRestart} className="w-full sm:w-auto gap-2 py-5">
            <RotateCcw className="h-4 w-4" /> Refazer
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = activeQuestions[currentQuestion];
  const phaseLabel = phase === "risk" ? "Risco organizacional" : "Reputação organizacional";

  return (
    <div>
      {/* Progress */}
      <div className="mb-7">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>
            <span className="text-primary font-semibold">{phaseLabel}</span> · Pergunta {currentQuestion + 1} de {totalQuestions}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${phase}-${currentQuestion}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary mb-4 sm:mb-6 leading-relaxed">
            {question.question}
          </h3>

          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-xs sm:text-sm leading-relaxed ${
                  selectedOption === idx
                    ? "border-secondary bg-secondary/10 shadow-sm"
                    : "border-border hover:border-secondary/40 bg-background"
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      selectedOption === idx ? "border-secondary bg-secondary" : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedOption === idx && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <span className="text-foreground/80">{option.text}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-7 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="hero-gradient border-0 text-primary-foreground px-7 py-5 text-sm font-semibold gap-2 shadow-md disabled:opacity-40"
            >
              {phase === "reputation" && currentQuestion + 1 === totalQuestions ? "Ver resultado" : "Próxima"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
