import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackPageView } from "@/lib/adminStore";
import { motion } from "framer-motion";
import { 
  ArrowDown, Users, BarChart3, MessageCircle, Menu, X, 
  ClipboardCheck, Timer, Award, Calculator, ShieldAlert, 
  ArrowRight, CheckCircle, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import logoLight from "@/assets/logo-girassol-light.png";
import logoDark from "@/assets/logo-girassol-dark.png";
import mariaResende from "@/assets/maria-resende.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const calculatorPillars = [
  "Sem número genérico",
  "Respostas em etapas curtas",
  "Resultado imediato",
] as const;

const calculatorOutputs = [
  {
    icon: Award,
    eyebrow: "0–100",
    title: "Score de risco real",
    description: "Leitura objetiva do nível de exposição atual da empresa.",
  },
  {
    icon: ShieldAlert,
    eyebrow: "Fiscalização",
    title: "Faixa provável de multa",
    description: "Estimativa baseada no porte, estrutura e nível de não conformidade.",
  },
  {
    icon: BarChart3,
    eyebrow: "Por ano",
    title: "Impacto financeiro estimado",
    description: "Visão de perdas invisíveis, rotatividade e outros custos que pesam na operação.",
  },
] as const;

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/quiz") {
      scrollTo("quiz");
    } else if (path === "/mentoria") {
      scrollTo("mentoria");
    } else if (path === "/sobre") {
      scrollTo("especialista");
    } else if (path === "/contato") {
      scrollTo("contato");
    } else if (path === "/servicos") {
      scrollTo("sobre-teste");
    }
  }, [location]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />


      {/* ─── HERO ─── */}
      <section className="hero-gradient relative pt-24 pb-14 md:pt-36 md:pb-28 lg:pt-40 lg:pb-32 px-4 sm:px-8 overflow-hidden">
        <div className="absolute top-10 right-[-15%] w-[600px] h-[600px] rounded-full bg-secondary/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5 mb-6">
                <ClipboardCheck className="h-3.5 w-3.5 text-secondary" />
                <span className="text-primary-foreground/80 text-xs font-semibold tracking-wide uppercase">Diagnóstico Estratégico NR-1</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-extrabold text-primary-foreground leading-[1.15] tracking-tight text-balance"
              >
                Desenvolvimento humano estratégico para <span className="text-secondary">líderes, equipes e organizações</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-4 md:mt-7 text-primary-foreground/65 text-sm md:text-lg leading-relaxed max-w-lg"
              >
                Produtividade sustentável e resultados com saúde através do Método Gestão 360 e implementação estratégica da NR-1.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/quiz")}
                  className="gold-gradient border-0 text-primary px-6 py-5 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all gap-2"
                >
                  Começar meu diagnóstico
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate("/calculadora")}
                  variant="outline"
                  className="border-secondary bg-secondary/15 text-primary-foreground hover:bg-secondary/25 py-5 gap-2 font-bold"
                >
                  <Calculator className="h-4 w-4 text-secondary" />
                  Calculadora de risco
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 gold-gradient rounded-3xl opacity-10 blur-2xl" />
                <div className="relative bg-primary-foreground/[0.07] backdrop-blur-sm border border-primary-foreground/10 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
                    <span className="text-primary-foreground/50 text-sm font-medium">Foco em Governança</span>
                  </div>
                  {[
                    { icon: ClipboardCheck, label: "Quiz NR-1", value: "Diagnóstico", desc: "Acesse agora", path: "/quiz" },
                    { icon: Calculator, label: "Calculadora", value: "Risco Real", desc: "Simule o impacto", path: "/calculadora" },
                    { icon: Award, label: "Consultoria", value: "360°", desc: "Gestão estratégica", path: "/contato" },
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-4 bg-primary-foreground/5 rounded-2xl p-4 cursor-pointer hover:bg-primary-foreground/10 transition-colors"
                      onClick={() => navigate(stat.path)}
                    >
                      <div className="h-11 w-11 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-primary-foreground">{stat.value}</span>
                          <span className="text-primary-foreground/40 text-xs font-medium">{stat.label}</span>
                        </div>
                        <p className="text-primary-foreground/40 text-xs mt-0.5 truncate">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DOR / CONTEXTO ─── */}
      <section className="py-14 md:py-20 bg-background px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">NR-1 atualizada, riscos psicossociais obrigatórios, GRO/PGR… e a maior parte das empresas ainda está parada no documento.</h2>
           <p className="text-muted-foreground text-lg mb-10">Muitos PGRs são vendidos como "prateleira", mas não tratam o custo invisível: FAP, afastamentos e ações trabalhistas.</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border bg-card text-center">
                 <div className="text-3xl mb-3">📉</div>
                 <h4 className="font-bold text-primary mb-2">Custo Invisível</h4>
                 <p className="text-xs text-muted-foreground">O que não aparece no balanço mas pesa no lucro operacional.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card text-center">
                 <div className="text-3xl mb-3">⚖️</div>
                 <h4 className="font-bold text-primary mb-2">Segurança Jurídica</h4>
                 <p className="text-xs text-muted-foreground">Evidências que protegem a empresa de verdade.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-card text-center">
                 <div className="text-3xl mb-3">🚀</div>
                 <h4 className="font-bold text-primary mb-2">Governança</h4>
                 <p className="text-xs text-muted-foreground">Transformar obrigação em resultado financeiro.</p>
              </div>
           </div>
        </div>
      </section>

      {/* ─── FERRAMENTAS GRATUITAS ─── */}
      <section className="py-14 md:py-20 bg-muted/30 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card rounded-3xl p-8 border hover:shadow-xl transition-all group">
              <ClipboardCheck className="h-10 w-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-primary mb-3">Quiz NR-1 na Prática</h3>
              <p className="text-muted-foreground mb-6">Descubra em 10 perguntas se a sua gestão está no papel ou se já virou governança.</p>
              <Button onClick={() => navigate("/quiz")} className="gold-gradient border-0 text-primary w-full sm:w-auto px-8">Fazer Quiz</Button>
            </div>
            <div className="bg-card rounded-3xl p-8 border hover:shadow-xl transition-all group">
              <Calculator className="h-10 w-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-primary mb-3">Calculadora de Risco</h3>
              <p className="text-muted-foreground mb-6">Simule o impacto financeiro da não adequação e veja sua faixa de risco real.</p>
              <Button onClick={() => navigate("/calculadora")} className="gold-gradient border-0 text-primary w-full sm:w-auto px-8">Usar Calculadora</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOBRE O TESTE (SERVIÇOS) ─── */}
      <section id="sobre-teste" className="py-14 md:py-28 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Soluções</span>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-5 leading-tight">
                  Serviço NR-1: Governança e Riscos Psicossociais
                </h2>
                <div className="text-foreground/70 text-sm md:text-[0.95rem] leading-[1.75] md:leading-[1.85] space-y-4">
                  <p>Minha atuação em NR-1 foca no que realmente importa: a <strong>saúde mental</strong> e a <strong>segurança jurídica</strong> da sua empresa através do Método Gestão 360.</p>
                  <div className="space-y-6 mt-8">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-bold text-primary text-base">Diagnóstico de Campo (Escuta e Dados)</h4>
                        <p className="text-xs mt-1">Mapeamento qualitativo e quantitativo para identificar sobrecarga e riscos invisíveis.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-bold text-primary text-base">Estruturação e Governança</h4>
                        <p className="text-xs mt-1">Elaboração do PGR/GRO integrado à nova NR-1, com mapa de processos de risco claro.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-bold text-primary text-base">Consolidação e Liderança</h4>
                        <p className="text-xs mt-1">Mentoria para líderes e implementação de canais de escuta para sustentação dos resultados.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-3xl p-6 border border-secondary/20">
                  <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                    <Users className="h-5 w-5 text-secondary" />
                    Comunidade Girassol
                  </h3>
                  <p className="text-xs text-muted-foreground italic mb-3">"Produtividade sustentável nasce da forma como organizamos pessoas, tempo e decisões."</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Espaço de desenvolvimento exclusivo para mulheres, com foco em gestão do tempo, saúde mental e autocuidado.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA MENTORIA ─── */}
      <section id="mentoria" className="relative overflow-hidden bg-muted/20 py-14 md:py-28 px-4 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-secondary/10 to-transparent" />
        <div className="relative max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger} className="space-y-6 md:space-y-8">
            <motion.div variants={fadeUp} className="text-center mb-8">
               <h2 className="text-2xl md:text-4xl font-bold text-primary">Mentoria Executiva | Gestão 360</h2>
               <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Acompanhamento estratégico para líderes e empresários que precisam organizar rotina, fortalecer a liderança e sustentar resultados.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card rounded-3xl p-8 border shadow-sm">
                <h3 className="text-xl font-bold text-primary mb-4">Temas trabalhados:</h3>
                <ul className="space-y-3">
                  {[
                    "Clareza de prioridades e tomada de decisão",
                    "Organização da rotina estratégica do líder",
                    "Gestão da pressão e demandas constantes",
                    "Fortalecimento de competências comportamentais",
                    "Alinhamento entre vida profissional e resultados"
                  ].map((topic, i) => (
                    <li key={i} className="flex gap-2 items-center text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col justify-center">
                <p className="text-sm text-primary/80 leading-relaxed mb-6">
                  A Mentoria Gestão 360 não atua no campo motivacional, mas na construção consciente de decisões, rotinas e comportamentos que sustentam liderança e performance.
                </p>
                <Button onClick={() => navigate("/contato")} className="gold-gradient border-0 text-primary w-full font-bold py-6">
                  Saber mais sobre a mentoria
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOBRE A ESPECIALISTA ─── */}
      <section id="especialista" className="py-14 md:py-28 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Quem conduz</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 leading-tight">
                Maria Resende
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-14 items-center">
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 gold-gradient rounded-3xl opacity-15 blur-xl" />
                  <img src={mariaResende} alt="Maria Resende" className="relative w-48 sm:w-64 md:w-full max-w-xs rounded-3xl object-cover shadow-2xl" />
                </div>
              </div>
              <div className="md:col-span-3">
                <p className="text-secondary font-semibold text-sm mb-4 uppercase tracking-wider">Especialista em Desenvolvimento Humano e Gestão do Tempo</p>
                <div className="text-foreground/70 text-sm md:text-[0.93rem] leading-[1.75] md:leading-[1.85] space-y-3 md:space-y-4">
                  <p>Com mais de 20 anos de experiência corporativa, atuo com líderes e empresas que desejam fortalecer a liderança e promover saúde mental de forma estruturada.</p>
                  <p>Fundadora do Instituto Girassol, administradora e pós-graduada em Psicologia Organizacional, uno método, escuta qualificada e estratégia para transformar desafios humanos em resultados consistentes.</p>
                  <p>Autora do livro "Coragem para Ser Livre", obra que consolida o pensamento por trás do Método Gestão 360º.</p>
                </div>
                <div className="mt-8">
                  <Button onClick={() => navigate("/contato")} className="gold-gradient border-0 text-primary px-8 font-bold">Agendar diagnóstico estratégico</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CONTATO ─── */}
      <section id="contato" className="py-14 md:py-28 px-4 sm:px-8 bg-card">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-3 leading-tight">Agende um diagnóstico estratégico de NR-1</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">Preencha o formulário e nossa equipe entrará em contato para falar sobre o seu cenário.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-background rounded-2xl sm:rounded-3xl border border-border/60 p-4 sm:p-8 md:p-10 shadow-sm">
              <ContactForm />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hero-gradient py-10 md:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoDark} alt="Instituto Girassol" className="h-10" />
            <p className="text-primary-foreground/40 text-xs text-center md:text-left max-w-sm leading-relaxed">
              Instituto Girassol – Implementação estratégica da NR-1 com foco em governança e resultado.
            </p>
          </div>
          <div className="flex gap-6 text-primary-foreground/30 text-xs">
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
