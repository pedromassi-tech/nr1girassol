
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle, RotateCcw, Lock, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { copsoqQuestions, copsoqScale, calculateCopsoqScore } from "@/data/copsoqQuestions";
import { validateCopsoqToken, useCopsoqToken, addLead } from "@/lib/adminStore";
import { toast } from "@/hooks/use-toast";

const CopsoqQuizPage = () => {
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ empresa: "", cargo: "" });
  const [validatedToken, setValidatedToken] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCopsoqToken(token);
    if (result) {
      if (result.usado) {
        toast({ title: "Token já utilizado", description: "Este token já foi usado para realizar o quiz.", variant: "destructive" });
      } else {
        setValidatedToken(result);
        setCompanyInfo(prev => ({ ...prev, empresa: result.empresa }));
        setIsAuthenticated(true);
        setShowCompanyForm(true);
        toast({ title: "Acesso liberado", description: `Bem-vindo à análise da ${result.empresa}` });
      }
    } else {
      toast({ title: "Token inválido", description: "Verifique o código e tente novamente.", variant: "destructive" });
    }
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentStep + 1 < copsoqQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = async (finalAnswers: number[]) => {
    const { score, level } = calculateCopsoqScore(finalAnswers);
    
    // Marcar token como usado
    useCopsoqToken(validatedToken.id);
    
    // Salvar como lead no CRM
    await addLead({
      nome: `Colaborador (${companyInfo.empresa})`,
      email: "copsoq-anonimo@girassol.com",
      whatsapp: "",
      empresa: companyInfo.empresa,
      cargo: companyInfo.cargo || "Colaborador",
      desafio: `Quiz COPSOQ — Score: ${score}/100 — ${level}`,
    });
    
    setShowResult(true);
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo.empresa || !companyInfo.cargo) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha o nome da empresa e seu cargo.", variant: "destructive" });
      return;
    }
    setShowCompanyForm(false);
  };

  const progress = (currentStep / copsoqQuestions.length) * 100;
  const currentQuestion = copsoqQuestions[currentStep];
  const { score, level, text } = calculateCopsoqScore(answers);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="pt-24 pb-14 md:pt-32 md:pb-28 px-4 sm:px-8 bg-muted/30 min-h-screen flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto">
          {!isAuthenticated ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card p-8 rounded-3xl border shadow-xl max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md text-primary">
                  <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary">Acesso Restrito</h1>
                <p className="text-muted-foreground mt-2">Insira o token de acesso fornecido pela consultoria para iniciar o quiz COPSOQ.</p>
              </div>
              
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <Input 
                  placeholder="DIGITE SEU TOKEN (Ex: AB12CD)" 
                  value={token} 
                  onChange={(e) => setToken(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono py-6 tracking-widest uppercase"
                />
                <Button type="submit" className="w-full hero-gradient text-primary font-bold py-6">
                  Acessar Quiz
                </Button>
              </form>
            </motion.div>
          ) : showCompanyForm ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card p-8 rounded-3xl border shadow-xl max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-primary">Identificação</h1>
                <p className="text-muted-foreground mt-2">Para prosseguir, confirme os dados da empresa e seu cargo.</p>
              </div>
              
              <form onSubmit={handleCompanySubmit} className="space-y-4 text-left">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Empresa</label>
                  <Input 
                    placeholder="Nome da empresa" 
                    value={companyInfo.empresa} 
                    onChange={(e) => setCompanyInfo({ ...companyInfo, empresa: e.target.value })}
                    className="py-6"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Seu Cargo</label>
                  <Input 
                    placeholder="Ex: Gerente, Operador, Analista..." 
                    value={companyInfo.cargo} 
                    onChange={(e) => setCompanyInfo({ ...companyInfo, cargo: e.target.value })}
                    className="py-6"
                    required
                  />
                </div>
                <Button type="submit" className="w-full hero-gradient text-primary font-bold py-6 mt-4">
                  Iniciar Análise <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>
          ) : showResult ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-8 rounded-3xl border shadow-xl">
              <div className="text-center mb-8">
                <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-primary">Análise Concluída</h2>
                <p className="text-muted-foreground mt-2">{validatedToken.empresa}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-muted/50 p-6 rounded-2xl text-center flex flex-col justify-center border border-border/50">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Reputação Organizacional</span>
                  <div className="text-6xl font-black text-primary">
                    {score}<span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className={`mt-4 inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    score <= 33 ? "bg-red-100 text-red-700 border-red-200" : 
                    score <= 66 ? "bg-amber-100 text-amber-700 border-amber-200" : 
                    "bg-green-100 text-green-700 border-green-200"
                  }`}>
                    {level}
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-primary mb-3">O que este resultado diz:</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
                </div>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-2xl mb-8">
                <p className="text-xs text-secondary font-medium leading-relaxed">
                  A análise de reputação organizacional acima utiliza uma versão simplificada do COPSOQ (Copenhagen Psychosocial Questionnaire), referência internacional em avaliação de riscos psicossociais no trabalho, adaptada para a realidade da NR-1 e da sua empresa.
                </p>
              </div>

              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full py-6 gap-2 text-primary border-primary/20 hover:bg-primary/5"
              >
                <RotateCcw className="h-4 w-4" /> Voltar ao Início
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card p-6 sm:p-10 rounded-3xl border shadow-xl">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{validatedToken.empresa}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Análise do ambiente psicossocial (base COPSOQ)</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Pergunta {currentStep + 1} <span className="text-primary/40">/ {copsoqQuestions.length}</span>
                  </span>
                  <span className="text-xs font-bold text-secondary">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-muted border-none" />
              </div>

              <div className="min-h-[280px] flex flex-col">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider border border-primary/10">
                    {currentQuestion.block}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-primary mb-8 leading-tight">
                  {currentQuestion.question}
                </h2>
                
                <div className="grid grid-cols-1 gap-3 mt-auto">
                  {copsoqScale.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className="group flex items-center justify-between p-4 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all text-left"
                    >
                      <span className="font-medium text-foreground/80 group-hover:text-primary">{option.label}</span>
                      <div className="h-8 w-8 rounded-lg bg-muted group-hover:bg-secondary group-hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                        {option.value}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase font-medium tracking-tighter">
                As respostas ajudam a entender a segurança psicológica, liderança e organização do trabalho na sua empresa hoje.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CopsoqQuizPage;
