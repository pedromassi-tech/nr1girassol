import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, FilePlus2, Wand2, Loader2, ClipboardCheck, Calculator, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/lib/adminStore";
import {
  DEFAULT_DIFERENCIAIS, DEFAULT_FASES, DEFAULT_ENTREGAVEIS,
  type ProposalDraft,
} from "@/lib/proposalsStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onPickBlank: () => void;
  onPickAI: (prefilled: Partial<ProposalDraft>) => void;
}

interface MatchInfo { reason: string; score: number }

const ProposalCreatorChoice = ({ open, onOpenChange, lead, onPickBlank, onPickAI }: Props) => {
  const [mode, setMode] = useState<"choose" | "ai">("choose");
  const [transcricao, setTranscricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizMatch, setQuizMatch] = useState<MatchInfo | null>(null);
  const [calcMatch, setCalcMatch] = useState<MatchInfo | null>(null);
  const [searched, setSearched] = useState(false);

  const reset = () => {
    setMode("choose");
    setTranscricao("");
    setLoading(false);
    setQuizMatch(null);
    setCalcMatch(null);
    setSearched(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSearched(false);
    try {
      const { data, error } = await supabase.functions.invoke("generate-proposal", {
        body: { transcricao, lead },
      });

      // Captura erro do gateway (créditos, rate limit, etc.)
      const errMsg = (error as { context?: { error?: string } })?.context?.error
        ?? data?.error
        ?? (error ? error.message : null);

      if (errMsg) {
        // Fallback: abre o formulário só com a transcrição nas notas internas
        const ok = confirm(
          `Não foi possível gerar com IA:\n\n${errMsg}\n\nQuer abrir o formulário em branco com a transcrição salva nas notas internas?`
        );
        if (ok) {
          onPickAI({
            observacoesInternas: `📝 Transcrição da reunião:\n\n${transcricao}`,
          });
          reset();
        }
        return;
      }

      setQuizMatch(data?.matches?.quiz ?? null);
      setCalcMatch(data?.matches?.calculadora ?? null);
      setSearched(true);

      const ai = data.proposal ?? {};
      const prefilled: Partial<ProposalDraft> = {
        escopoResumo: ai.escopoResumo ?? "",
        diferenciais: Array.isArray(ai.diferenciais) && ai.diferenciais.length ? ai.diferenciais : [...DEFAULT_DIFERENCIAIS],
        entregaveis: Array.isArray(ai.entregaveis) && ai.entregaveis.length ? ai.entregaveis : [...DEFAULT_ENTREGAVEIS],
        fases: Array.isArray(ai.fases) && ai.fases.length ? ai.fases : DEFAULT_FASES.map(f => ({ ...f })),
        numEstabelecimentos: ai.numEstabelecimentos ?? 1,
        numFuncoes: ai.numFuncoes ?? 5,
        numColaboradores: ai.numColaboradores ?? 50,
        modeloTrabalho: ai.modeloTrabalho ?? "presencial",
        maturidadePgr: ai.maturidadePgr ?? "inexistente",
        grauRisco: ai.grauRisco ?? "2",
        temPrestadores: !!ai.temPrestadores,
        numLideres: ai.numLideres ?? 5,
        temEquipeSst: !!ai.temEquipeSst,
        prazoMeses: ai.prazoMeses ?? 4,
        observacoesInternas: ai.observacoesInternas
          ? `${ai.observacoesInternas}\n\n---\n📝 Transcrição original:\n${transcricao}`
          : `📝 Transcrição da reunião:\n\n${transcricao}`,
      };

      onPickAI(prefilled);
      reset();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const ok = confirm(
        `Erro ao chamar IA: ${msg}\n\nQuer abrir o formulário em branco com a transcrição salva nas notas internas?`
      );
      if (ok) {
        onPickAI({
          observacoesInternas: `📝 Transcrição da reunião:\n\n${transcricao}`,
        });
        reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            {mode === "choose" ? "Como deseja criar a proposta?" : "Gerar proposta com IA"}
          </DialogTitle>
          <DialogDescription>
            {mode === "choose"
              ? "Escolha começar do zero ou deixar a IA preencher tudo a partir da reunião e dos diagnósticos."
              : "Cole o resumo/transcrição da reunião. A IA cruza automaticamente com o quiz e a calculadora deste lead (busca inteligente por e-mail, telefone, nome ou empresa)."}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={onPickBlank}
              className="border-2 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/5 transition group"
            >
              <FilePlus2 className="h-7 w-7 text-primary mb-3" />
              <div className="font-bold text-primary mb-1">Criar do zero</div>
              <p className="text-xs text-muted-foreground">
                Preencha manualmente todos os campos da proposta. Ideal quando você já tem tudo claro.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("ai")}
              className="border-2 border-secondary/40 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/10 transition group bg-secondary/5"
            >
              <Wand2 className="h-7 w-7 text-secondary mb-3" />
              <div className="font-bold text-primary mb-1 flex items-center gap-2">
                Gerar com IA
                <span className="text-[9px] bg-secondary text-primary px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
              </div>
              <p className="text-xs text-muted-foreground">
                A IA cruza a transcrição da reunião com o quiz e a calculadora deste lead e preenche tudo automaticamente.
              </p>
            </button>
          </div>
        )}

        {mode === "ai" && (
          <div className="space-y-4 mt-2">
            <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                Busca inteligente neste lead
              </div>
              <MatchRow icon={ClipboardCheck} label="Quiz NR-1" match={quizMatch} searched={searched} />
              <MatchRow icon={Calculator} label="Calculadora de risco" match={calcMatch} searched={searched} />
              <p className="text-[10px] text-muted-foreground">
                Cruzamos por e-mail, telefone, nome e empresa — pega mesmo com pequenas variações.
              </p>
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Resumo / transcrição da reunião diagnóstico
              </Label>
              <Textarea
                rows={10}
                value={transcricao}
                onChange={e => setTranscricao(e.target.value)}
                placeholder={`Cole aqui o resumo da call ou a transcrição. Ex.:\n\n"Cliente é diretor de RH de uma rede com 4 lojas e 180 colaboradores. Não tem PGR atualizado. Já teve 2 afastamentos por burnout em 2024. Quer fechar até o fim do mês para evitar fiscalização. Decisor é o CEO. Receio principal: imagem da marca caso vire processo público..."`}
                className="mt-2 font-mono text-xs"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setMode("choose")} disabled={loading}>
                Voltar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading || !transcricao.trim()}
                className="hero-gradient border-0 text-primary-foreground gap-1.5"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                {loading ? "Buscando dados e gerando..." : "Gerar e abrir formulário"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MatchRow = ({ icon: Icon, label, match, searched }: {
  icon: typeof ClipboardCheck; label: string; match: MatchInfo | null; searched: boolean;
}) => {
  const found = !!match;
  return (
    <div className="flex items-center gap-2 text-xs">
      {found ? (
        <CheckCircle2 className="h-4 w-4 text-secondary" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground" />
      )}
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-medium">{label}:</span>
      {!searched ? (
        <span className="text-muted-foreground">será buscado ao gerar</span>
      ) : found ? (
        <span className="text-secondary font-semibold">
          encontrado · match por {match!.reason}
        </span>
      ) : (
        <span className="text-muted-foreground">nenhum registro relacionado</span>
      )}
    </div>
  );
};

export default ProposalCreatorChoice;
