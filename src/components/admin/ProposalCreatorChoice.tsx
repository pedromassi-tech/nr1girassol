import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, FilePlus2, Wand2, CheckCircle2 } from "lucide-react";
import type { Lead } from "@/lib/adminStore";
import type { ProposalDraft } from "@/lib/proposalsStore";
import { parseTranscricao } from "@/lib/parseTranscricao";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onPickBlank: () => void;
  onPickAI: (prefilled: Partial<ProposalDraft>) => void;
}

const ProposalCreatorChoice = ({ open, onOpenChange, onPickBlank, onPickAI }: Props) => {
  const [mode, setMode] = useState<"choose" | "transcricao">("choose");
  const [transcricao, setTranscricao] = useState("");

  const reset = () => {
    setMode("choose");
    setTranscricao("");
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  // Preview ao vivo do que vai ser detectado
  const preview = transcricao.trim() ? parseTranscricao(transcricao) : null;

  const handleAplicar = () => {
    const { prefill } = parseTranscricao(transcricao);
    onPickAI(prefill);
    reset();
  };

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
              ? "Escolha começar do zero ou colar o resumo da reunião para preencher os campos automaticamente."
              : "Cole o resumo da reunião. O sistema identifica número de unidades, colaboradores, líderes, modelo de trabalho, status do PGR e mais — você só revisa."}
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <button
              type="button"
              onClick={onPickBlank}
              className="border-2 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/5 transition"
            >
              <FilePlus2 className="h-7 w-7 text-primary mb-3" />
              <div className="font-bold text-primary mb-1">Criar do zero</div>
              <p className="text-xs text-muted-foreground">
                Preenchimento manual de todos os campos.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("transcricao")}
              className="border-2 border-secondary/40 rounded-xl p-5 text-left hover:border-secondary hover:bg-secondary/10 transition bg-secondary/5"
            >
              <Wand2 className="h-7 w-7 text-secondary mb-3" />
              <div className="font-bold text-primary mb-1 flex items-center gap-2">
                Colar resumo da reunião
                <span className="text-[9px] bg-secondary text-primary px-1.5 py-0.5 rounded font-bold">RÁPIDO</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cole o resumo e o sistema preenche escopo, números e notas internas automaticamente.
              </p>
            </button>
          </div>
        )}

        {mode === "transcricao" && (
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Resumo da reunião diagnóstico
              </Label>
              <Textarea
                rows={10}
                value={transcricao}
                onChange={e => setTranscricao(e.target.value)}
                placeholder={`Cole aqui o resumo da call. Ex.:\n\n"Cliente é diretor de RH de uma rede com 4 lojas e 180 colaboradores. Modelo presencial. Não tem PGR. Tem equipe de RH interna. Sem prestadores. 12 líderes no total. Grau de risco 3. Quer fechar até o fim do mês."`}
                className="mt-2 text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Dica: quanto mais explícito (números, palavras como "PGR", "remoto", "líderes"), melhor o preenchimento.
              </p>
            </div>

            {preview && preview.detectados.length > 0 && (
              <div className="border border-secondary/40 rounded-lg p-3 bg-secondary/5">
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70 mb-2">
                  Detectado automaticamente
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {preview.detectados.map((d, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-background border border-secondary/30 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-secondary" /> {d}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Você poderá ajustar tudo no formulário em seguida. A transcrição completa fica salva nas notas internas.
                </p>
              </div>
            )}

            {preview && preview.detectados.length === 0 && transcricao.trim() && (
              <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded">
                Nada foi detectado automaticamente, mas a transcrição será salva nas notas internas.
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setMode("choose")}>
                Voltar
              </Button>
              <Button
                onClick={handleAplicar}
                disabled={!transcricao.trim()}
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
