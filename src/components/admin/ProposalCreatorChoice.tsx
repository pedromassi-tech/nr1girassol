import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, FilePlus2, Wand2, CheckCircle2, ClipboardCheck, Calculator, Loader2, Link2 } from "lucide-react";
import type { Lead } from "@/lib/adminStore";
import type { ProposalDraft } from "@/lib/proposalsStore";
import { parseTranscricao } from "@/lib/parseTranscricao";
import { enrichFromDiagnostics, mergePrefill, type DiagnosticsEnrichment } from "@/lib/enrichFromDiagnostics";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onPickBlank: () => void;
  onPickAI: (prefilled: Partial<ProposalDraft>) => void;
}

const ProposalCreatorChoice = ({ open, onOpenChange, lead, onPickBlank, onPickAI }: Props) => {
  const [mode, setMode] = useState<"choose" | "transcricao">("choose");
  const [transcricao, setTranscricao] = useState("");
  const [diag, setDiag] = useState<DiagnosticsEnrichment | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);

  const reset = () => {
    setMode("choose");
    setTranscricao("");
    setDiag(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  // Ao abrir o dialog (e tendo lead), já busca diagnósticos cruzados
  useEffect(() => {
    if (!open) return;
    setLoadingDiag(true);
    enrichFromDiagnostics(lead)
      .then(setDiag)
      .finally(() => setLoadingDiag(false));
  }, [open, lead]);

  // Re-cruza quando a transcrição altera dados de contato (e-mail/empresa novos)
  const transcParsed = transcricao.trim() ? parseTranscricao(transcricao) : null;

  const handlePickBlank = async () => {
    // Mesmo "do zero" aproveita o cruzamento dos diagnósticos
    if (diag && (diag.matches.quiz || diag.matches.calculadora)) {
      onPickAI(diag.prefill);
    } else {
      onPickBlank();
    }
    reset();
  };

  const handleAplicar = async () => {
    const transcPrefill = transcParsed?.prefill ?? {};
    // Re-busca diagnósticos com dados extraídos da transcrição (caso o lead seja "vazio")
    const extra = {
      nome: transcPrefill.clienteNome,
      empresa: transcPrefill.clienteEmpresa,
      email: transcPrefill.clienteEmail,
      whatsapp: transcPrefill.clienteWhatsapp,
    };
    const enriched = await enrichFromDiagnostics(lead, extra);
    // transcrição tem prioridade (é o mais recente), mas mantemos as listas/notas do diagnóstico
    const merged = mergePrefill(transcPrefill, enriched.prefill);
    onPickAI(merged);
    reset();
  };

  const matchesCount =
    (diag?.matches.quiz ? 1 : 0) + (diag?.matches.calculadora ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            {mode === "choose" ? "Como deseja criar a proposta?" : "Gerar a partir do resumo da reunião"}
          </DialogTitle>
          <DialogDescription>
            {mode === "choose"
              ? "Os diagnósticos do lead são cruzados automaticamente. Você pode também colar o resumo da reunião para enriquecer."
              : "Cole o resumo da reunião. O sistema cruza com Quiz + Calculadora e monta escopo, diferenciais, entregáveis, fases, prazo e notas internas."}
          </DialogDescription>
        </DialogHeader>

        {/* Painel de cruzamento — sempre visível quando há matches */}
        {open && (
          <div className="mt-2">
            {loadingDiag && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cruzando lead com Quiz e Calculadora...
              </div>
            )}

            {!loadingDiag && diag && matchesCount > 0 && (
              <div className="border-2 border-secondary/40 rounded-xl p-4 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent">
                <div className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-3">
                  <Link2 className="h-3 w-3" />
                  {matchesCount === 2 ? "2 diagnósticos cruzados" : "1 diagnóstico cruzado"} com este lead
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {diag.matches.quiz && (
                    <div className="bg-background border rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                        <ClipboardCheck className="h-3.5 w-3.5 text-secondary" /> Quiz NR-1
                      </div>
                      <div className="text-2xl font-extrabold text-primary tabular-nums">
                        {diag.matches.quiz.score}
                        <span className="text-sm text-muted-foreground font-medium">/100</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{diag.matches.quiz.level}</div>
                      <div className="text-[9px] text-muted-foreground/70 mt-1.5 uppercase tracking-wider">
                        match: {diag.matches.quiz.reason}
                      </div>
                    </div>
                  )}
                  {diag.matches.calculadora && (
                    <div className="bg-background border rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                        <Calculator className="h-3.5 w-3.5 text-secondary" /> Calculadora
                      </div>
                      <div className="text-2xl font-extrabold text-primary tabular-nums">
                        {diag.matches.calculadora.risk_score}
                        <span className="text-sm text-muted-foreground font-medium">/100</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{diag.matches.calculadora.risk_level}</div>
                      <div className="text-[9px] text-muted-foreground/70 mt-1.5 uppercase tracking-wider">
                        match: {diag.matches.calculadora.reason}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  ✨ Estes dados serão usados automaticamente para preencher escopo, maturidade do PGR, porte, diferenciais e notas internas.
                </p>
              </div>
            )}

            {!loadingDiag && diag && matchesCount === 0 && lead && (
              <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded border">
                Nenhum diagnóstico (Quiz/Calculadora) encontrado para este lead. Cole o resumo da reunião abaixo para gerar a proposta.
              </div>
            )}
          </div>
        )}

        {mode === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={handlePickBlank}
              className="border-2 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/5 transition"
            >
              <FilePlus2 className="h-7 w-7 text-primary mb-3" />
              <div className="font-bold text-primary mb-1">
                {matchesCount > 0 ? "Usar só os diagnósticos" : "Criar do zero"}
              </div>
              <p className="text-xs text-muted-foreground">
                {matchesCount > 0
                  ? "Pré-preenche com Quiz/Calculadora cruzados. Você ajusta o restante."
                  : "Preenchimento manual de todos os campos."}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("transcricao")}
              className="border-2 border-secondary/40 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/10 transition bg-secondary/5"
            >
              <Wand2 className="h-7 w-7 text-secondary mb-3" />
              <div className="font-bold text-primary mb-1 flex items-center gap-2">
                Colar resumo + diagnósticos
                <span className="text-[9px] bg-secondary text-primary px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Combina o resumo da reunião com Quiz e Calculadora para a proposta mais assertiva possível.
              </p>
            </button>
          </div>
        )}

        {mode === "transcricao" && (
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Resumo da reunião diagnóstico
              </Label>
              <Textarea
                rows={10}
                value={transcricao}
                onChange={e => setTranscricao(e.target.value)}
                placeholder={`Cole aqui o resumo da call. Ex.:\n\n"Cliente é diretor de RH de uma rede com 4 lojas e 180 colaboradores. Modelo presencial. Não tem PGR. Tem equipe de RH interna. Sem prestadores. 12 líderes no total. Grau de risco 3. Já teve afastamentos por burnout..."`}
                className="mt-2 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Dica: quanto mais explícito (números, palavras como "PGR", "remoto", "líderes"), melhor o preenchimento. O sistema também cruza com Quiz/Calculadora.
              </p>
            </div>

            {transcParsed && transcParsed.detectados.length > 0 && (
              <div className="border border-secondary/40 rounded-lg p-3 bg-secondary/5">
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-2">
                  Detectado na transcrição
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {transcParsed.detectados.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-background border border-secondary/30 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-secondary" /> {d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {transcParsed && transcParsed.detectados.length === 0 && transcricao.trim() && (
              <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded">
                Nada detectado na transcrição, mas ela será salva nas notas internas e os diagnósticos acima serão aplicados.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setMode("choose")}>
                Voltar
              </Button>
              <Button
                onClick={handleAplicar}
                disabled={!transcricao.trim() && matchesCount === 0}
                className="hero-gradient border-0 text-primary-foreground gap-1.5"
              >
                <Wand2 className="h-4 w-4" /> Preencher e abrir formulário
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProposalCreatorChoice;
