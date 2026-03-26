import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Users, BarChart3, MessageCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "@/components/Quiz";
import ContactForm from "@/components/ContactForm";
import logoLight from "@/assets/logo-girassol-light.jpeg";
import logoDark from "@/assets/logo-girassol-dark.jpeg";
import mariaResende from "@/assets/maria-resende.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
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
          scrolled
            ? "bg-background/90 backdrop-blur-lg shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 md:h-20 flex items-center justify-between">
          <img
            src={scrolled ? logoLight : logoDark}
            alt="Instituto Girassol"
            className="h-9 md:h-11 object-contain mix-blend-normal"
          />

          {/* Desktop nav */}
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? "text-primary" : "text-primary-foreground"}`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
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
              <Button
                onClick={() => scrollTo("quiz")}
                className="gold-gradient border-0 text-primary font-semibold mt-2"
              >
                Fazer o teste
              </Button>
            </nav>
          </motion.div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="hero-gradient relative pt-28 pb-20 md:pt-40 md:pb-32 px-5 sm:px-8 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl lg:max-w-3xl"
          >
            <motion.p variants={fadeUp} className="text-secondary font-semibold text-sm md:text-base tracking-wider uppercase mb-4">
              Diagnóstico gratuito
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.15] tracking-tight text-balance"
            >
              Qual é o nível de maturidade da sua empresa na{" "}
              <span className="text-secondary">NR-1</span> na prática?
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-5 md:mt-7 text-primary-foreground/70 text-base md:text-lg leading-relaxed max-w-xl"
            >
              Responda 10 perguntas simples e descubra, em poucos minutos, se a sua gestão de riscos psicossociais está só no papel ou já virou governança de verdade.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 md:mt-10">
              <Button
                onClick={() => scrollTo("quiz")}
                className="gold-gradient border-0 text-primary px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all gap-2"
              >
                Começar meu diagnóstico
                <ArrowDown className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── SOBRE O TESTE ─── */}
      <section id="sobre-teste" className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="max-w-2xl">
              <span className="text-secondary font-semibold text-sm tracking-wider uppercase">Entenda</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-6 leading-tight">
                Sobre o teste
              </h2>
              <div className="text-foreground/75 text-base md:text-[1.05rem] leading-[1.8] space-y-4">
                <p>
                  A NR-1 mudou o jogo da responsabilidade empresarial.
                  Não é só atualizar o PGR e guardar numa pasta.
                  É integrar os riscos psicossociais à forma como o trabalho é organizado, liderado e monitorado no dia a dia.
                </p>
                <p>
                  Esse teste foi criado para ajudar você a enxergar, de forma rápida, se a sua empresa está realmente cuidando desse tema ou se ainda está correndo risco com desorganização, afastamentos, passivos trabalhistas e perda de produtividade invisível.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: MessageCircle, text: "10 perguntas objetivas, sem juridiquês." },
                { icon: BarChart3, text: "Resultado em score de 0 a 100, com um mini diagnóstico." },
                { icon: Users, text: 'Convite para continuar a conversa no grupo "NR1 na Prática".' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex gap-4 items-start p-6 rounded-2xl bg-card border border-border/60 hover:border-secondary/40 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80 leading-relaxed pt-1">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── PARA QUEM É ─── */}
      <section id="para-quem" className="py-20 md:py-28 px-5 sm:px-8 bg-card">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center">
              <span className="text-secondary font-semibold text-sm tracking-wider uppercase">Público</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-6 leading-tight">
                Para quem é esse teste
              </h2>
              <p className="text-foreground/70 text-base md:text-[1.05rem] leading-relaxed mb-8">
                Esse diagnóstico é para você que:
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="max-w-2xl mx-auto space-y-4">
              {[
                "Lidera pessoas ou áreas de Segurança, Saúde, RH ou Jurídico.",
                "Precisa adequar a empresa à NR-1.",
                "Sabe que saúde mental, hoje, é tema de governança – e não só de campanha de Setembro Amarelo.",
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start bg-background rounded-xl p-5 border border-border/60">
                  <div className="h-2.5 w-2.5 rounded-full gold-gradient flex-shrink-0 mt-1.5 shadow-sm" />
                  <span className="text-foreground/80 text-[0.95rem] leading-relaxed">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── QUIZ ─── */}
      <section id="quiz" className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-secondary font-semibold text-sm tracking-wider uppercase">Quiz</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-3 leading-tight">
                Seu diagnóstico de NR-1
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                Responda com honestidade – o resultado é só para você.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 md:p-10 shadow-sm">
              <Quiz />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── ESPECIALISTA ─── */}
      <section id="especialista" className="py-20 md:py-28 px-5 sm:px-8 bg-card">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-secondary font-semibold text-sm tracking-wider uppercase">Quem conduz</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 leading-tight">
                Sobre a especialista
              </h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 gold-gradient rounded-3xl rotate-3 opacity-20 scale-105" />
                  <img
                    src={mariaResende}
                    alt="Maria Resende – fundadora do Instituto Girassol"
                    className="relative w-72 md:w-full max-w-sm rounded-3xl object-cover shadow-xl"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-primary mb-1">Maria Resende</h3>
                <p className="text-secondary font-semibold text-sm mb-5">Fundadora · Instituto Girassol de Desenvolvimento Humano</p>
                <div className="text-foreground/75 text-[0.95rem] leading-[1.8] space-y-4">
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
      <section className="py-20 md:py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <span className="text-secondary font-semibold text-sm tracking-wider uppercase">Próximo passo</span>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mt-2 mb-3 leading-tight">
                Quero saber mais sobre a consultoria em NR-1
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
                Preencha o formulário abaixo e a equipe do Instituto Girassol entrará em contato.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card rounded-3xl border border-border/60 p-6 sm:p-8 md:p-10 shadow-sm">
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
            <p className="text-primary-foreground/50 text-sm text-center md:text-left max-w-sm leading-relaxed">
              Instituto Girassol de Desenvolvimento Humano – Implementação prática da NR-1 com foco em governança, produtividade e saúde.
            </p>
          </div>
          <div className="flex gap-6 text-primary-foreground/40 text-sm">
            <a href="#" className="hover:text-primary-foreground/70 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-primary-foreground/70 transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
