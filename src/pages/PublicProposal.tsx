import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getProposalBySlug, type Proposal } from "@/lib/proposalsStore";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Sparkles, Calendar, Building2, Users, Briefcase,
  ShieldCheck, Target, Award, MessageCircle, Mail, Clock,
  TrendingUp, Layers, ArrowRight, AlertCircle, Download, Loader2,
} from "lucide-react";
import logoDark from "@/assets/logo-girassol-dark.png";
import logoLight from "@/assets/logo-girassol-light.png";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const PublicProposal = () => {
  const { slug } = useParams<{ slug: string }>();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!printRef.current || !proposal) return;
    setDownloading(true);

    // Clona o nó para fora da árvore visível, evitando que html2pdf
    // mexa no DOM original (que estava deixando a tela em branco).
    const original = printRef.current;
    const clone = original.cloneNode(true) as HTMLElement;
    clone.classList.add("pdf-rendering");

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.left = "-10000px";
    sandbox.style.top = "0";
    sandbox.style.width = "1100px";
    sandbox.style.background = "#ffffff";
    sandbox.style.zIndex = "-1";
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);

    await (document as any).fonts?.ready?.catch?.(() => {});
    await new Promise((r) => setTimeout(r, 250));

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = `Proposta-${proposal.clienteEmpresa.replace(/[^a-z0-9]+/gi, "-")}-${proposal.slug}.pdf`;
      await html2pdf()
        .set({
          margin: [8, 0, 8, 0],
          filename,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            windowWidth: 1100,
            scrollX: 0,
            scrollY: 0,
            letterRendering: true,
            imageTimeout: 15000,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
            putOnlyUsedFonts: true,
          },
          pagebreak: {
            mode: ["css", "legacy", "avoid-all"],
            avoid: [".pdf-avoid-break", "section", "header", "footer", "img"],
          },
        } as any)
        .from(clone)
        .save();
    } catch (e) {
      console.error("Erro ao gerar PDF:", e);
      alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      if (sandbox.parentNode) sandbox.parentNode.removeChild(sandbox);
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    getProposalBySlug(slug).then((p) => {
      setProposal(p);
      setLoading(false);
    });
    document.title = "Proposta Comercial — Instituto Girassol";
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <div className="text-center max-w-sm">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-primary mb-2">Proposta não encontrada</h1>
          <p className="text-muted-foreground text-sm mb-6">
            O link pode ter expirado ou estar incorreto. Entre em contato para receber uma nova proposta.
          </p>
          <Link to="/"><Button variant="outline">Voltar ao site</Button></Link>
        </div>
      </div>
    );
  }

  const dataExpiracao = new Date(new Date(proposal.createdAt).getTime() + proposal.validadeDias * 24 * 60 * 60 * 1000);
  const valorParcela = proposal.investimentoParcelas > 0
    ? proposal.investimentoTotal / proposal.investimentoParcelas
    : proposal.investimentoTotal;

  const whatsappLink = proposal.clienteWhatsapp
    ? `https://wa.me/55${proposal.clienteWhatsapp.replace(/\D/g, "")}`
    : "https://wa.me/553184346241";

  const aceitarMsg = encodeURIComponent(
    `Olá! Estou aceitando a proposta para ${proposal.clienteEmpresa}. Vamos avançar! (Proposta ${proposal.slug})`
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Botão flutuante de download (não entra no PDF) */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="hero-gradient border-0 text-primary-foreground gap-2 shadow-lg"
        >
          {downloading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Gerando PDF...</>
          ) : (
            <><Download className="h-4 w-4" /> Baixar PDF</>
          )}
        </Button>
      </div>

      <div ref={printRef} className="bg-background pdf-root">
      {/* HERO */}
      <header className="hero-gradient text-primary-foreground relative overflow-hidden pdf-avoid-break">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,_white_0,_transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 relative">
          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <img src={logoDark} alt="Instituto Girassol" className="h-10 sm:h-12" />
            {proposal.clienteLogoUrl && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider text-primary-foreground/60 font-semibold hidden sm:inline">
                  Proposta para
                </span>
                <div className="bg-white/95 rounded-xl p-2.5 sm:p-3 shadow-md">
                  <img
                    src={proposal.clienteLogoUrl}
                    alt={`Logo ${proposal.clienteEmpresa}`}
                    className="h-10 sm:h-12 max-w-[180px] object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-secondary/30">
              <Sparkles className="h-3 w-3" /> Proposta Comercial
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-primary-foreground/90 text-xs font-medium px-3 py-1 rounded-full">
              <Calendar className="h-3 w-3" /> Válida até {dataExpiracao.toLocaleDateString("pt-BR")}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
            Consultoria NR-1 e Riscos Psicossociais
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/85 max-w-2xl leading-relaxed">
            Proposta personalizada para <span className="font-bold text-secondary">{proposal.clienteEmpresa}</span>
          </p>
          <p className="text-sm text-primary-foreground/70 mt-2">
            Preparada para {proposal.clienteNome}{proposal.clienteCargo ? ` · ${proposal.clienteCargo}` : ""}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-20">
        {/* RESUMO DO ESCOPO */}
        {proposal.escopoResumo && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-l-4 border-secondary bg-secondary/5 rounded-r-2xl p-6 sm:p-8"
          >
            <h2 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Sobre esta proposta
            </h2>
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed whitespace-pre-line">
              {proposal.escopoResumo}
            </p>
          </motion.section>
        )}

        {/* CONTEXTO DO CLIENTE */}
        <Section
          eyebrow="Contexto"
          title="Estrutura considerada nesta proposta"
          subtitle="Dados informados pela empresa que orientam o dimensionamento técnico."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Stat icon={Building2} label="Estabelecimentos" value={String(proposal.numEstabelecimentos)} />
            <Stat icon={Briefcase} label="Funções distintas" value={String(proposal.numFuncoes)} />
            <Stat icon={Users} label="Colaboradores" value={String(proposal.numColaboradores)} />
            <Stat icon={ShieldCheck} label="Modelo" value={modeloLabel(proposal.modeloTrabalho)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs sm:text-sm">
            <Tag label="Maturidade PGR" value={maturidadeLabel(proposal.maturidadePgr)} />
            <Tag label="Grau de risco" value={`Grau ${proposal.grauRisco}`} />
            <Tag label="Lideranças" value={`${proposal.numLideres} pessoas`} />
            <Tag label="Equipe SST/RH" value={proposal.temEquipeSst ? "Sim" : "Não"} />
            <Tag label="Prestadores/PJ" value={proposal.temPrestadores ? "Sim" : "Não"} />
            {proposal.cnae && <Tag label="CNAE" value={proposal.cnae} />}
          </div>
        </Section>

        {/* DIFERENCIAIS */}
        {proposal.diferenciais.length > 0 && (
          <Section
            eyebrow="Por que Girassol"
            title="O que torna esta consultoria diferente"
            subtitle="Diferenciais que entregam valor real, não apenas conformidade."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {proposal.diferenciais.filter(Boolean).map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-secondary/40 hover:shadow-sm transition-all"
                >
                  <div className="h-9 w-9 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
                    <Award className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground/85 leading-relaxed pt-1">{d}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* FASES */}
        {proposal.fases.length > 0 && (
          <Section
            eyebrow="Metodologia"
            title="Como vamos executar"
            subtitle={`Projeto com prazo estimado de ${proposal.prazoMeses} ${proposal.prazoMeses === 1 ? "mês" : "meses"}.`}
          >
            <div className="space-y-3 sm:space-y-4">
              {proposal.fases.filter(f => f.titulo).map((fase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative pl-12 sm:pl-16 pb-4 border-l-2 border-secondary/30 ml-4"
                >
                  <div className="absolute -left-5 top-0 h-10 w-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold text-sm shadow-md">
                    {i + 1}
                  </div>
                  <div className="bg-card border rounded-xl p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-primary">{fase.titulo}</h3>
                      {fase.duracao && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">
                          <Clock className="h-3 w-3" /> {fase.duracao}
                        </span>
                      )}
                    </div>
                    {fase.descricao && (
                      <p className="text-sm text-foreground/75 leading-relaxed">{fase.descricao}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ENTREGÁVEIS */}
        {proposal.entregaveis.length > 0 && (
          <Section
            eyebrow="Entregáveis"
            title="O que sua empresa vai receber"
            subtitle="Documentação, evidências e ferramentas para sustentação contínua da NR-1."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {proposal.entregaveis.filter(Boolean).map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/85 leading-relaxed">{e}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* INVESTIMENTO */}
        {proposal.investimentoTotal > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="hero-gradient rounded-3xl p-6 sm:p-12 text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-40 w-40 bg-secondary/20 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> Investimento
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-6">
                Valor do projeto
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">Total</p>
                  <p className="text-3xl sm:text-5xl font-extrabold text-secondary">
                    {formatBRL(proposal.investimentoTotal)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 sm:p-6 border border-white/20">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 mb-1">
                    Em {proposal.investimentoParcelas}x
                  </p>
                  <p className="text-3xl sm:text-5xl font-extrabold">
                    {formatBRL(valorParcela)}
                    <span className="text-base font-semibold text-primary-foreground/70"> /mês</span>
                  </p>
                </div>
              </div>

              {proposal.investimentoObservacao && (
                <p className="text-sm text-primary-foreground/80 leading-relaxed bg-white/5 rounded-xl p-4 border border-white/10">
                  💳 {proposal.investimentoObservacao}
                </p>
              )}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <section className="text-center bg-card border rounded-3xl p-6 sm:p-12">
          <div className="h-14 w-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
            Vamos transformar a NR-1 em vantagem real?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-6">
            Esta proposta é válida até <strong className="text-foreground">{dataExpiracao.toLocaleDateString("pt-BR")}</strong>.
            Para aceitar ou tirar dúvidas, entre em contato:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`https://wa.me/553184346241?text=${aceitarMsg}`} target="_blank" rel="noopener noreferrer">
              <Button className="hero-gradient border-0 text-primary-foreground gap-2 px-6 py-6 text-base font-semibold w-full sm:w-auto">
                <MessageCircle className="h-5 w-5" /> Aceitar proposta no WhatsApp
                <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
            <a href="mailto:contato@mariaresende.com.br?subject=Proposta NR-1">
              <Button variant="outline" className="gap-2 px-6 py-6 text-base font-semibold w-full sm:w-auto">
                <Mail className="h-5 w-5" /> Enviar dúvida por e-mail
              </Button>
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center pt-8 border-t">
          <img src={logoLight} alt="Instituto Girassol" className="h-8 mx-auto mb-3 opacity-70" />
          <p className="text-xs text-muted-foreground">
            Proposta nº <span className="font-mono font-semibold">{proposal.slug.toUpperCase()}</span> ·
            Emitida em {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © Instituto Girassol — NR-1 com lastro técnico, governança e propósito.
          </p>
        </footer>
      </main>
      </div>
    </div>
  );
};

// ── Auxiliares ──
const Section = ({ eyebrow, title, subtitle, children }: {
  eyebrow: string; title: string; subtitle?: string; children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-5 sm:mb-7">
      <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5" /> {eyebrow}
      </p>
      <h2 className="text-xl sm:text-3xl font-bold text-primary leading-tight">{title}</h2>
      {subtitle && <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
    </div>
    {children}
  </motion.section>
);

const Stat = ({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) => (
  <div className="bg-card border rounded-xl p-3 sm:p-4 text-center">
    <div className="h-9 w-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2">
      <Icon className="h-4 w-4" />
    </div>
    <p className="text-lg sm:text-2xl font-bold text-primary leading-none">{value}</p>
    <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium mt-1">{label}</p>
  </div>
);

const Tag = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border">
    <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{label}</span>
    <span className="text-xs font-semibold text-foreground">{value}</span>
  </div>
);

const modeloLabel = (m: string) => ({
  presencial: "Presencial",
  hibrido: "Híbrido",
  remoto: "Remoto",
}[m] ?? m);

const maturidadeLabel = (m: string) => ({
  inexistente: "Inexistente",
  parcial: "Parcial",
  completo: "Completo",
}[m] ?? m);

export default PublicProposal;
