import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Users, BarChart3, MessageCircle, Menu, X, ClipboardCheck, Timer, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "@/components/Quiz";
import ContactForm from "@/components/ContactForm";
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

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Sobre o teste", id: "sobre-teste" },
    { label: "Para quem é", id: "para-quem" },
    { label: "Especialista", id: "especialista" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-lg shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 md:h-20 flex items-center justify-between">
          <img
            src={scrolled ? logoLight : logoDark}
            alt="Instituto Girassol"
            className="h-9 md:h-11 object-contain"
          />
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-muted-foreground hover:text-primary" : "text-primary-foreground/70 hover:text-primary-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
            <Button
              onClick={() => scrollTo("quiz")}
              size="sm"
              className="gold-gradient border-0 text-primary font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              Fazer o teste
            </Button>
          </nav>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? "text-primary" : "text-primary-foreground"}`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background border-b shadow-lg"
          >
            <nav className="flex flex-col p-5 gap-4">
              {navLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-left text-sm font-medium text-foreground/80 hover:text-primary py-2"
                >
                  {l.label}
                </button>
              ))}
              <Button onClick={() => scrollTo("quiz")} className="gold-gradient border-0 text-primary font-semibold mt-2">
                Fazer o teste
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="hero-gradient relative pt-24 pb-14 md:pt-36 md:pb-28 lg:pt-40 lg:pb-32 px-4 sm:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-[-15%] w-[600px] h-[600px] rounded-full bg-secondary/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary-foreground/10 border border-primary-foreground/15 rounded-full px-4 py-1.5 mb-6">
                <ClipboardCheck className="h-3.5 w-3.5 text-secondary" />
                <span className="text-primary-foreground/80 text-xs font-semibold tracking-wide uppercase">Diagnóstico gratuito</span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-extrabold text-primary-foreground leading-[1.15] tracking-tight text-balance"
              >
                Qual é o nível de maturidade da sua empresa na{" "}
                <span className="text-secondary">NR-1</span> na prática?
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-4 md:mt-7 text-primary-foreground/65 text-sm md:text-lg leading-relaxed max-w-lg"
              >
                Responda 10 perguntas simples e descubra, em poucos minutos, se a sua gestão de riscos psicossociais está só no papel ou já virou governança de verdade.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => scrollTo("quiz")}
                  className="gold-gradient border-0 text-primary px-6 py-5 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all gap-2"
                >
                  Começar meu diagnóstico
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => scrollTo("sobre-teste")}
                  variant="ghost"
                  className="text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 py-6"
                >
                  Saiba mais
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Visual stats card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Glow behind */}
                <div className="absolute -inset-4 gold-gradient rounded-3xl opacity-10 blur-2xl" />
                <div className="relative bg-primary-foreground/[0.07] backdrop-blur-sm border border-primary-foreground/10 rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-3 w-3 rounded-full bg-secondary animate-pulse" />
                    <span className="text-primary-foreground/50 text-sm font-medium">Diagnóstico NR-1</span>
                  </div>
                  {/* Mini stat cards */}
                  {[
                    { icon: ClipboardCheck, label: "Perguntas", value: "10", desc: "Objetivas e diretas" },
                    { icon: Timer, label: "Tempo médio", value: "4 min", desc: "Rápido e prático" },
                    { icon: Award, label: "Score", value: "0–100", desc: "Com diagnóstico personalizado" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-4 bg-primary-foreground/5 rounded-2xl p-4">
                      <div className="h-11 w-11 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-primary-foreground">{stat.value}</span>
                          <span className="text-primary-foreground/40 text-xs font-medium">{stat.label}</span>
                        </div>
                        <p className="text-primary-foreground/40 text-xs mt-0.5">{stat.desc}</p>
                      </div>
                    </div>
                  ))}
                  {/* Fake progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-primary-foreground/30 mb-1.5">
                      <span>Progresso do teste</span>
                      <span>0%</span>
                    </div>
                    <div className="h-2 bg-primary-foreground/10 rounded-full overflow-hidden">
                      <div className="h-full w-0 gold-gradient rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP (mobile) ─── */}
      <section className="lg:hidden bg-card border-b">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "10", label: "Perguntas" },
              { value: "4 min", label: "Tempo médio" },
              { value: "0–100", label: "Score" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-xl sm:text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOBRE O TESTE ─── */}
      <section id="sobre-teste" className="py-14 md:py-28 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Entenda</span>
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-5 leading-tight">
                  Por que fazer esse teste?
                </h2>
                <div className="text-foreground/70 text-sm md:text-[0.95rem] leading-[1.75] md:leading-[1.85] space-y-3 md:space-y-4">
                  <p>
                    A NR-1 mudou o jogo da responsabilidade empresarial.
                    Não é só atualizar o PGR e guardar numa pasta.
                    É integrar os riscos psicossociais à forma como o trabalho é organizado, liderado e monitorado no dia a dia.
                  </p>
                  <p>
                    Esse teste foi criado para ajudar você a enxergar, de forma rápida, se a sua empresa está realmente cuidando desse tema ou se ainda está correndo risco com desorganização, afastamentos, passivos trabalhistas e perda de produtividade invisível.
                  </p>
                </div>
              </div>
              <div className="space-y-3 md:space-y-4 md:pt-14">
                {[
                  { icon: MessageCircle, title: "Sem juridiquês", text: "10 perguntas objetivas, em linguagem que todo gestor entende." },
                  { icon: BarChart3, title: "Score instantâneo", text: "Resultado de 0 a 100 com diagnóstico personalizado por faixa." },
                  { icon: Users, title: "Comunidade", text: 'Convite para o grupo "NR1 na Prática" com conteúdos e casos reais.' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex gap-3 md:gap-4 items-start p-4 md:p-5 rounded-2xl bg-card border border-border/60 hover:border-secondary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary mb-0.5">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── PARA QUEM É ─── */}
      <section id="para-quem" className="py-12 md:py-24 px-4 sm:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Público</span>
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 leading-tight">
                Para quem é esse teste
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
              {[
                { emoji: "👤", text: "Lidera pessoas ou áreas de Segurança, Saúde, RH ou Jurídico." },
                { emoji: "📋", text: "Precisa adequar a empresa à NR-1 de forma prática e estruturada." },
                { emoji: "🧠", text: "Sabe que saúde mental é tema de governança – e não só de campanha de Setembro Amarelo." },
              ].map((item, i) => (
                <div key={i} className="bg-background rounded-2xl p-6 border border-border/60 text-center hover:shadow-md transition-shadow">
                  <span className="text-3xl mb-3 block">{item.emoji}</span>
                  <p className="text-foreground/75 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── QUIZ CTA BANNER ─── */}
      <section className="hero-gradient py-12 md:py-16 px-5 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Pronto para descobrir onde sua empresa está?
            </h3>
            <p className="text-primary-foreground/60 text-sm md:text-base mb-6 max-w-lg mx-auto">
              O diagnóstico leva menos de 5 minutos e o resultado é imediato.
            </p>
            <Button
              onClick={() => scrollTo("quiz")}
              className="gold-gradient border-0 text-primary px-10 py-6 text-base font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all gap-2"
            >
              Fazer o diagnóstico agora
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── QUIZ ─── */}
      <section id="quiz" className="py-20 md:py-28 px-5 sm:px-8 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4">
                <ClipboardCheck className="h-3.5 w-3.5 text-secondary" />
                <span className="text-secondary text-xs font-bold tracking-wide uppercase">Quiz interativo</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                Seu diagnóstico de NR-1
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mt-2">
                Responda com honestidade – o resultado é só para você.
              </p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <div className="bg-card rounded-3xl border border-border/60 p-5 sm:p-8 md:p-10 shadow-lg shadow-primary/5">
                <Quiz />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── ESPECIALISTA ─── */}
      <section id="especialista" className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Quem conduz</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 leading-tight">
                Sobre a especialista
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-center">
              <div className="md:col-span-2 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-3 gold-gradient rounded-3xl opacity-15 blur-xl" />
                  <img
                    src={mariaResende}
                    alt="Maria Resende – fundadora do Instituto Girassol"
                    className="relative w-64 sm:w-72 md:w-full max-w-xs rounded-3xl object-cover shadow-2xl"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <h3 className="text-2xl font-bold text-primary mb-1">Maria Resende</h3>
                <p className="text-secondary font-semibold text-sm mb-6">Fundadora · Instituto Girassol de Desenvolvimento Humano</p>
                <div className="text-foreground/70 text-[0.93rem] leading-[1.85] space-y-4">
                  <p>
                    Administradora, especialista em gestão de projetos e processos, pós-graduada em Psicologia Organizacional e fundadora do Instituto Girassol de Desenvolvimento Humano.
                  </p>
                  <p>
                    Há mais de 20 anos atua com autogestão, liderança, organização do trabalho e produtividade saudável, integrando gestão, comportamento e estrutura organizacional com visão prática e executável.
                  </p>
                  <p>
                    Autora do livro <em className="text-secondary font-semibold not-italic">Coragem para Mudar</em>, Maria é referência em transformar a exigência legal da NR-1 em governança, produtividade e sustentabilidade organizacional.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CONSULTORIA CTA ─── */}
      <section className="py-20 md:py-28 px-5 sm:px-8 bg-card">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-secondary font-semibold text-xs tracking-widest uppercase">Próximo passo</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-3 leading-tight">
                Fale com a especialista
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
                Preencha o formulário e a equipe do Instituto Girassol entrará em contato para entender sua realidade.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-background rounded-3xl border border-border/60 p-6 sm:p-8 md:p-10 shadow-sm">
              <ContactForm />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="hero-gradient py-12 md:py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoDark} alt="Instituto Girassol" className="h-10" />
            <p className="text-primary-foreground/40 text-xs text-center md:text-left max-w-sm leading-relaxed">
              Instituto Girassol de Desenvolvimento Humano – Implementação prática da NR-1 com foco em governança, produtividade e saúde.
            </p>
          </div>
          <div className="flex gap-6 text-primary-foreground/30 text-xs">
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-primary-foreground/60 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
