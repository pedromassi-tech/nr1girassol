import { motion } from "framer-motion";
import { ArrowDown, Users, BarChart3, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "@/components/Quiz";
import ContactForm from "@/components/ContactForm";
import logoLight from "@/assets/logo-girassol-light.jpeg";
import mariaResende from "@/assets/maria-resende.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Index = () => {
  const scrollToQuiz = () => {
    document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <img src={logoLight} alt="Instituto Girassol" className="h-10 sm:h-12 object-contain" />
          <nav className="hidden sm:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#sobre-teste" className="hover:text-primary transition-colors">Sobre o teste</a>
            <a href="#para-quem" className="hover:text-primary transition-colors">Para quem é</a>
            <a href="#especialista" className="hover:text-primary transition-colors">Sobre a especialista</a>
          </nav>
          <Button onClick={scrollToQuiz} size="sm" className="sm:hidden bg-primary text-primary-foreground text-xs">
            Fazer o teste
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary leading-tight tracking-tight">
              Qual é o nível de maturidade da sua empresa na{" "}
              <span className="text-secondary">NR-1</span> na prática?
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Responda 10 perguntas simples e descubra, em poucos minutos, se a sua gestão de riscos psicossociais está só no papel ou já virou governança de verdade.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={scrollToQuiz}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-6 text-base font-semibold gap-2"
              >
                Começar meu diagnóstico de NR-1
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre o teste */}
      <section id="sobre-teste" className="py-16 md:py-24 px-4 sm:px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Sobre o teste</h2>
            <div className="text-base md:text-lg text-foreground/80 leading-relaxed space-y-4">
              <p>
                A NR-1 mudou o jogo da responsabilidade empresarial.
                Não é só atualizar o PGR e guardar numa pasta.
                É integrar os riscos psicossociais à forma como o trabalho é organizado, liderado e monitorado no dia a dia.
              </p>
              <p>
                Esse teste foi criado para ajudar você a enxergar, de forma rápida, se a sua empresa está realmente cuidando desse tema ou se ainda está correndo risco com desorganização, afastamentos, passivos trabalhistas e perda de produtividade invisível.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: MessageCircle, text: "10 perguntas objetivas, sem juridiquês." },
                { icon: BarChart3, text: "Resultado em score de 0 a 100, com um mini diagnóstico." },
                { icon: Users, text: 'Convite para continuar a conversa no grupo "NR1 na Prática".' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start p-4 rounded-xl bg-muted/50">
                  <item.icon className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Para quem é */}
      <section id="para-quem" className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">Para quem é esse teste</h2>
            <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-4">
              Esse diagnóstico é para você que:
            </p>
            <ul className="space-y-3">
              {[
                "Lidera pessoas ou áreas de Segurança, Saúde, RH ou Jurídico.",
                "Precisa adequar a empresa à NR-1.",
                "Sabe que saúde mental, hoje, é tema de governança – e não só de campanha de Setembro Amarelo.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="h-2 w-2 rounded-full bg-secondary flex-shrink-0 mt-2.5" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Quiz */}
      <section id="quiz" className="py-16 md:py-24 px-4 sm:px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2 text-center">
              Seu diagnóstico de NR-1
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Responda com honestidade – o resultado é só para você.
            </p>
            <Quiz />
          </motion.div>
        </div>
      </section>

      {/* Especialista */}
      <section id="especialista" className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-10 text-center">Sobre a especialista</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-2 flex justify-center">
                <img
                  src={mariaResende}
                  alt="Maria Resende"
                  className="w-64 md:w-full max-w-sm rounded-2xl object-cover shadow-lg"
                />
              </div>
              <div className="md:col-span-3">
                <h3 className="text-xl font-bold text-primary mb-3">Maria Resende</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Administradora, especialista em gestão de projetos e processos, pós-graduada em Psicologia Organizacional e fundadora do Instituto Girassol de Desenvolvimento Humano.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Há mais de 20 anos atua com autogestão, liderança, organização do trabalho e produtividade saudável, integrando gestão, comportamento e estrutura organizacional com visão prática e executável.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Autora do livro <em className="text-secondary font-semibold">Coragem para Mudar</em>, Maria é referência em transformar a exigência legal da NR-1 em governança, produtividade e sustentabilidade organizacional.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Consultoria CTA */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3 text-center">
              Quero saber mais sobre a consultoria em NR-1
            </h2>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Preencha o formulário abaixo e a equipe do Instituto Girassol entrará em contato.
            </p>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src={logoLight} alt="Instituto Girassol" className="h-10 brightness-0 invert" />
            <p className="text-primary-foreground/70 text-sm text-center md:text-left max-w-md">
              Instituto Girassol de Desenvolvimento Humano – Implementação prática da NR-1 com foco em governança, produtividade e saúde.
            </p>
          </div>
          <div className="flex gap-6 text-primary-foreground/60 text-sm">
            <a href="#" className="hover:text-primary-foreground transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Termos de Uso</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
