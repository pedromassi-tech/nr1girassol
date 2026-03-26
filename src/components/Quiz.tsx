import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quizQuestions, getScoreResult } from "@/data/quizQuestions";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalQuestions = quizQuestions.length;
  const progress = ((currentQuestion) / totalQuestions) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;
    const points = quizQuestions[currentQuestion].options[parseInt(selectedOption)].points;
    const newAnswers = [...answers, points];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const result = getScoreResult(totalScore);

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
  };

  const getResultIcon = () => {
    if (totalScore <= 30) return <AlertTriangle className="h-12 w-12 text-destructive" />;
    if (totalScore <= 60) return <ShieldCheck className="h-12 w-12 text-secondary" />;
    return <CheckCircle className="h-12 w-12 text-secondary" />;
  };

  const getResultBorderColor = () => {
    if (totalScore <= 30) return "border-destructive/30 bg-destructive/5";
    if (totalScore <= 60) return "border-secondary/30 bg-secondary/5";
    return "border-secondary/40 bg-secondary/10";
  };

  const getScoreColor = () => {
    if (totalScore <= 30) return "text-destructive";
    if (totalScore <= 60) return "text-secondary";
    return "text-secondary";
  };

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className={`rounded-2xl border-2 p-8 md:p-12 ${getResultBorderColor()}`}>
          <div className="flex flex-col items-center text-center mb-8">
            {getResultIcon()}
            <h3 className="text-2xl md:text-3xl font-bold text-primary mt-4">
              {result.level}
            </h3>
            <div className={`text-5xl md:text-6xl font-extrabold mt-4 ${getScoreColor()}`}>
              {totalScore}<span className="text-2xl md:text-3xl font-semibold text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="text-foreground/80 text-base md:text-lg leading-relaxed whitespace-pre-line">
            {result.text}
          </div>
          <div className="mt-8 flex justify-center">
            <Button variant="outline" onClick={handleRestart} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Refazer o teste
            </Button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 space-y-8">
          {/* Grupo NR1 na Prática */}
          <div className="rounded-2xl bg-card border p-8 text-center">
            <h4 className="text-xl font-bold text-primary mb-3">
              Quer continuar essa conversa com quem vive NR-1 no dia a dia?
            </h4>
            <p className="text-muted-foreground mb-6">
              Entre para o grupo oficial "NR1 na Prática" e acompanhe conteúdos, casos reais e orientações sobre como tirar a norma do papel.
            </p>
            <a href="https://seulinkdogrupo.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base px-8 py-6 font-semibold">
                Entrar no grupo NR1 na Prática
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pergunta {currentQuestion + 1} de {totalQuestions}</span>
          <span>{Math.round(showResult ? 100 : progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
        >
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-6 leading-relaxed">
            {question.question}
          </h3>

          <RadioGroup
            value={selectedOption ?? ""}
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {question.options.map((option, idx) => (
              <Label
                key={idx}
                htmlFor={`option-${idx}`}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedOption === String(idx)
                    ? "border-secondary bg-secondary/10"
                    : "border-border hover:border-secondary/50"
                }`}
              >
                <RadioGroupItem value={String(idx)} id={`option-${idx}`} className="mt-0.5" />
                <span className="text-sm md:text-base leading-relaxed">{option.text}</span>
              </Label>
            ))}
          </RadioGroup>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="bg-primary text-primary-foreground px-8 py-6 text-base font-semibold gap-2"
            >
              {currentQuestion + 1 === totalQuestions ? "Ver meu resultado" : "Próxima"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Quiz;
