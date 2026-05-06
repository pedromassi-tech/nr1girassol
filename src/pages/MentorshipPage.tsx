import { motion } from "framer-motion";
import { CheckCircle2, Star, Target, Users, Zap, Award, Calendar, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import logoDark from "@/assets/logo-girassol-dark.png";
import mariaResende from "@/assets/maria-resende.png";

const MentorshipPage = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Clareza Estratégica",
      description: "Defina objetivos claros e um plano de ação estruturado para sua carreira ou empresa."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Alta Performance",
      description: "Metodologias de gestão do tempo e produtividade para entregar mais com menos esforço."
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Saúde Mental",
      description: "Desenvolva resiliência e estratégias para evitar o burnout e manter o equilíbrio."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Liderança Humanizada",
      description: "Aprenda a gerir pessoas com foco em resultados e bem-estar organizacional."
    }
  ];

  const features = [
    "Sessões individuais e personalizadas",
    "Acompanhamento via WhatsApp",
    "Acesso a ferramentas exclusivas de gestão",
    "Plano de desenvolvimento individual (PDI)",
    "Networking com outros líderes",
    "Curadoria de conteúdos específicos"
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4 fill-primary" />
                <span>Mentoria Exclusiva</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary leading-tight mb-6">
                Desenvolva seu <span className="text-secondary">potencial máximo</span> sem abrir mão da sua saúde.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                A mentoria estratégica de Maria Resende é desenhada para líderes e profissionais que buscam excelência, produtividade sustentável e uma vida equilibrada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate("/contato")}
                  size="lg" 
                  className="gold-gradient text-primary font-bold h-14 px-8 shadow-xl"
                >
                  Quero saber mais
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14 px-8 border-primary text-primary font-bold"
                  onClick={() => {
                    const el = document.getElementById('benefits');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Ver benefícios
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10 border-4 border-white">
                <img 
                  src={mariaResende} 
                  alt="Maria Resende" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden sm:block">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-primary">+500 mentorados</span>
                </div>
                <div className="flex items-center gap-1 text-secondary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Por que escolher esta mentoria?</h2>
            <p className="text-muted-foreground">Unimos 20 anos de experiência corporativa com as mais modernas técnicas de desenvolvimento humano.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all"
              >
                <div className="mb-6 p-3 bg-white rounded-xl shadow-sm inline-block">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl md:text-4xl font-black mb-8">O que está incluso na Mentoria:</h2>
              <div className="space-y-4">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <CheckCircle2 className="h-6 w-6 text-secondary shrink-0" />
                    <span className="text-lg opacity-90">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12 grid sm:grid-cols-2 gap-6">
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-8 w-8 text-secondary mb-4" />
                  <h4 className="font-bold text-lg mb-2">Cronograma Flexível</h4>
                  <p className="text-sm opacity-80">Sessões quinzenais ou mensais de acordo com sua necessidade.</p>
                </div>
                <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                  <MessageSquare className="h-8 w-8 text-secondary mb-4" />
                  <h4 className="font-bold text-lg mb-2">Suporte Direto</h4>
                  <p className="text-sm opacity-80">Canal direto via WhatsApp para dúvidas e orientações rápidas.</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative p-1 bg-white/10 rounded-[2.5rem]">
                <div className="bg-white rounded-[2rem] p-8 md:p-12 text-primary">
                  <Award className="h-12 w-12 text-secondary mb-6" />
                  <h3 className="text-3xl font-black mb-4 leading-tight">Um investimento no seu maior ativo: VOCÊ.</h3>
                  <p className="text-muted-foreground mb-8">
                    "Meu objetivo é transformar sua relação com o trabalho e o tempo, para que os resultados fluam naturalmente através de uma mente saudável e estratégica."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                       <img 
                        src={mariaResende} 
                        alt="Maria Resende" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-primary">Maria Resende</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Especialista em Gestão do Tempo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-primary mb-6">Pronto para elevar seu nível?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            As vagas para mentoria individual são limitadas para garantir a máxima qualidade no acompanhamento. Reserve seu horário para uma conversa inicial gratuita.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate("/contato")}
              size="lg" 
              className="gold-gradient text-primary font-bold h-16 px-10 rounded-full shadow-2xl hover:scale-105 transition-transform"
            >
              Agendar Conversa Gratuita
            </Button>
            <Button 
              onClick={() => navigate("/contato")}
              size="lg" 
              variant="ghost" 
              className="h-16 px-10 rounded-full text-primary font-bold"
            >
              Falar com a equipe
            </Button>
          </div>
          <p className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Vagas abertas para o próximo trimestre
          </p>
        </div>
      </section>

      {/* Footer Copy */}
      <footer className="hero-gradient py-10 md:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <img src={logoDark} alt="Instituto Girassol" className="h-10" />
            <p className="text-primary-foreground/40 text-xs text-center md:text-left max-w-sm leading-relaxed">
              Instituto Girassol – Desenvolvimento humano estratégico para líderes e organizações.
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

export default MentorshipPage;
