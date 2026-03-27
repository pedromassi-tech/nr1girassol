import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions, getScoreResult } from "@/data/quizQuestions";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle, User, Mail } from "lucide-react";
import { addQuizCompletion } from "@/lib/adminStore";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [captureForm, setCaptureForm] = useState({ nome: "", email: "" });

  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestion) / totalQuestions) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;
    const points = quizQuestions[currentQuestion].options[selectedOption].points;
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show capture form instead of results
      setShowCapture(true);
    }
  };

  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = answers.reduce((a, b) => a + b, 0);
    const res = getScoreResult(total);
    await addQuizCompletion(total, res.level, captureForm.nome, captureForm.email);
    setShowCapture(false);
    setShowResult(true);
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = getScoreResult(totalScore);

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
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

  const getScoreBg = () => {
    if (totalScore <= 30) return "from-destructive/10 to-destructive/5 border-destructive/20";
    if (totalScore <= 60) return "from-secondary/10 to-secondary/5 border-secondary/20";
    return "from-secondary/15 to-secondary/5 border-secondary/30";
  };

  // Data capture step
  if (showCapture) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <div className="h-14 w-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
            Quiz concluído!
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Preencha seus dados abaixo para ver o resultado do seu diagnóstico NR-1.
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

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Score card */}
        <div className={`rounded-2xl border bg-gradient-to-b ${getScoreBg()} p-5 sm:p-8 text-center`}>
          <div className="flex justify-center mb-3">{getResultIcon()}</div>
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-1">Sua nota</p>
          <div className="text-4xl sm:text-6xl font-extrabold text-primary">
            {totalScore}<span className="text-xl sm:text-2xl font-semibold text-muted-foreground">/100</span>
          </div>
          <p className="mt-2 text-secondary font-bold text-lg">{result.level}</p>
        </div>

        <div className="mt-5 sm:mt-6 text-foreground/75 text-xs sm:text-[0.92rem] leading-[1.7] sm:leading-[1.8] whitespace-pre-line">
          {result.text}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a href="https://chat.whatsapp.com/IPEUy34T4r68ZDUUuBAzyi?mode=gi_t" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
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

  const question = quizQuestions[currentQuestion];

  return (
    <div>
      {/* Progress */}
      <div className="mb-7">
        <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
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
              {currentQuestion + 1 === totalQuestions ? "Ver resultado" : "Próxima"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
