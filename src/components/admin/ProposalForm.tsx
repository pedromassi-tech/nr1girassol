import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createProposal, updateProposal,
  DEFAULT_DIFERENCIAIS, DEFAULT_FASES, DEFAULT_ENTREGAVEIS,
  type Proposal, type ProposalDraft, type ProposalFase,
} from "@/lib/proposalsStore";
import { Plus, Trash2, Sparkles, Building2, Users, Briefcase, DollarSign, Save, X, Calculator, Wand2 } from "lucide-react";
import type { Lead } from "@/lib/adminStore";

interface ProposalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  proposal?: Proposal | null;
  prefill?: Partial<ProposalDraft> | null;
  onSaved: (p: Proposal) => void;
}

const emptyDraft = (lead?: Lead | null): ProposalDraft => ({
  leadId: lead?.id ?? null,
  clienteNome: lead?.nome ?? "",
  clienteEmpresa: lead?.empresa ?? "",
  clienteEmail: lead?.email ?? "",
  clienteWhatsapp: lead?.whatsapp ?? "",
  clienteCargo: lead?.cargo ?? "",
  numEstabelecimentos: 1,
  numFuncoes: 5,
  numColaboradores: 50,
  modeloTrabalho: "presencial",
  faturamentoAnual: "",
  maturidadePgr: "inexistente",
  grauRisco: "2",
  cnae: "",
  temPrestadores: false,
  numLideres: 5,
  temEquipeSst: false,
  escopoResumo: "",
  diferenciais: [...DEFAULT_DIFERENCIAIS],
  fases: DEFAULT_FASES.map(f => ({ ...f })),
  entregaveis: [...DEFAULT_ENTREGAVEIS],
  prazoMeses: 4,
  investimentoTotal: 0,
  investimentoParcelas: 4,
  investimentoObservacao: "Pagamento em até 4x sem juros via boleto ou PIX.",
  validadeDias: 15,
  observacoesInternas: "",
});

const proposalToDraft = (p: Proposal): ProposalDraft => ({
  leadId: p.leadId,
  clienteNome: p.clienteNome,
  clienteEmpresa: p.clienteEmpresa,
  clienteEmail: p.clienteEmail,
  clienteWhatsapp: p.clienteWhatsapp,
  clienteCargo: p.clienteCargo,
  numEstabelecimentos: p.numEstabelecimentos,
  numFuncoes: p.numFuncoes,
  numColaboradores: p.numColaboradores,
  modeloTrabalho: p.modeloTrabalho,
  faturamentoAnual: p.faturamentoAnual,
  maturidadePgr: p.maturidadePgr,
  grauRisco: p.grauRisco,
  cnae: p.cnae,
  temPrestadores: p.temPrestadores,
  numLideres: p.numLideres,
  temEquipeSst: p.temEquipeSst,
  escopoResumo: p.escopoResumo,
  diferenciais: [...p.diferenciais],
  fases: p.fases.map(f => ({ ...f })),
  entregaveis: [...p.entregaveis],
  prazoMeses: p.prazoMeses,
  investimentoTotal: p.investimentoTotal,
  investimentoParcelas: p.investimentoParcelas,
  investimentoObservacao: p.investimentoObservacao,
  validadeDias: p.validadeDias,
  observacoesInternas: p.observacoesInternas,
  status: p.status,
});

const ProposalForm = ({ open, onOpenChange, lead, proposal, prefill, onSaved }: ProposalFormProps) => {
  const [draft, setDraft] = useState<ProposalDraft>(() => proposal ? proposalToDraft(proposal) : { ...emptyDraft(lead), ...(prefill ?? {}) });
  const [saving, setSaving] = useState(false);
  const [valorHora, setValorHora] = useState<number>(350);
  const [horasManual, setHorasManual] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(proposal ? proposalToDraft(proposal) : { ...emptyDraft(lead), ...(prefill ?? {}) });
      setHorasManual(null);
    }
  }, [open, lead, proposal, prefill]);

  // ── Calculadora de horas baseada no escopo ──
  const horasEstimadas = (() => {
    let h = 40; // base de gestão/coordenação
    h += draft.numEstabelecimentos * 16;        // visitas/análise por unidade
    h += draft.numFuncoes * 4;                   // análise por função
    h += Math.ceil(draft.numColaboradores / 20) * 6; // escuta proporcional
    h += draft.numLideres * 2;                   // mentoria de liderança
    if (draft.maturidadePgr === "inexistente") h += 40;
    else if (draft.maturidadePgr === "parcial") h += 24;
    else h += 12;
    if (draft.modeloTrabalho === "hibrido") h += 16;
    if (draft.modeloTrabalho === "remoto") h += 24;
    if (draft.temPrestadores) h += 20;
    if (!draft.temEquipeSst) h += 30;            // mais documentação se não há SST interna
    if (draft.grauRisco === "3") h += 16;
    if (draft.grauRisco === "4") h += 32;
    return Math.round(h);
  })();

  const horasFinais = horasManual ?? horasEstimadas;
  const totalCalculado = horasFinais * valorHora;

  const aplicarCalculo = () => {
    update("investimentoTotal", totalCalculado);
  };

  // Auto-aplica o cálculo quando o investimento ainda está zerado (proposta nova)
  useEffect(() => {
    if (draft.investimentoTotal === 0 && totalCalculado > 0) {
      update("investimentoTotal", totalCalculado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCalculado, draft.investimentoTotal]);

  const update = <K extends keyof ProposalDraft>(key: K, value: ProposalDraft[K]) => {
    setDraft(d => ({ ...d, [key]: value }));
  };

  const updateList = (key: "diferenciais" | "entregaveis", idx: number, value: string) => {
    setDraft(d => {
      const list = [...d[key]];
      list[idx] = value;
      return { ...d, [key]: list };
    });
  };

  const addListItem = (key: "diferenciais" | "entregaveis") => {
    setDraft(d => ({ ...d, [key]: [...d[key], ""] }));
  };

  const removeListItem = (key: "diferenciais" | "entregaveis", idx: number) => {
    setDraft(d => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));
  };

  const updateFase = (idx: number, field: keyof ProposalFase, value: string) => {
    setDraft(d => {
      const fases = [...d.fases];
      fases[idx] = { ...fases[idx], [field]: value };
      return { ...d, fases };
    });
  };

  const addFase = () => {
    setDraft(d => ({ ...d, fases: [...d.fases, { titulo: "", descricao: "", duracao: "" }] }));
  };

  const removeFase = (idx: number) => {
    setDraft(d => ({ ...d, fases: d.fases.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!draft.clienteNome || !draft.clienteEmpresa) {
      alert("Preencha ao menos nome do cliente e empresa.");
      return;
    }
    setSaving(true);
    const result = proposal
      ? await updateProposal(proposal.id, draft)
      : await createProposal(draft);
    setSaving(false);
    if (result) {
      onSaved(result);
      onOpenChange(false);
    } else {
      alert("Erro ao salvar a proposta.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            {proposal ? "Editar proposta" : "Nova proposta comercial"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo. A proposta gera um link único para enviar ao cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* CLIENTE */}
          <Section icon={Building2} title="Dados do cliente">
            <Grid>
              <Field label="Nome do cliente *">
                <Input value={draft.clienteNome} onChange={e => update("clienteNome", e.target.value)} placeholder="Maria Silva" />
              </Field>
              <Field label="Empresa *">
                <Input value={draft.clienteEmpresa} onChange={e => update("clienteEmpresa", e.target.value)} placeholder="Empresa S.A." />
              </Field>
              <Field label="Cargo">
                <Input value={draft.clienteCargo} onChange={e => update("clienteCargo", e.target.value)} placeholder="Diretor de RH" />
              </Field>
              <Field label="E-mail">
                <Input type="email" value={draft.clienteEmail} onChange={e => update("clienteEmail", e.target.value)} placeholder="cliente@empresa.com" />
              </Field>
              <Field label="WhatsApp">
                <Input value={draft.clienteWhatsapp} onChange={e => update("clienteWhatsapp", e.target.value)} placeholder="(11) 99999-9999" />
              </Field>
              <Field label="Faturamento anual">
                <Select value={draft.faturamentoAnual} onValueChange={v => update("faturamentoAnual", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="me_epp">ME / EPP (até R$ 4,8M)</SelectItem>
                    <SelectItem value="medio">Médio (R$ 4,8M – R$ 300M)</SelectItem>
                    <SelectItem value="grande">Grande (acima de R$ 300M)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Grid>
          </Section>

          {/* ESCOPO DE CAMPO */}
          <Section icon={Users} title="Escopo de campo (Fases 1 e 2)">
            <Grid>
              <Field label="Estabelecimentos / unidades">
                <Input type="number" min={1} value={draft.numEstabelecimentos} onChange={e => update("numEstabelecimentos", +e.target.value || 1)} />
              </Field>
              <Field label="Funções / cargos distintos">
                <Input type="number" min={1} value={draft.numFuncoes} onChange={e => update("numFuncoes", +e.target.value || 1)} />
              </Field>
              <Field label="Total de colaboradores">
                <Input type="number" min={0} value={draft.numColaboradores} onChange={e => update("numColaboradores", +e.target.value || 0)} />
              </Field>
              <Field label="Modelo de trabalho">
                <Select value={draft.modeloTrabalho} onValueChange={v => update("modeloTrabalho", v as ProposalDraft["modeloTrabalho"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                    <SelectItem value="remoto">Remoto</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </Grid>
          </Section>

          {/* COMPLEXIDADE TÉCNICA */}
          <Section icon={Briefcase} title="Complexidade técnica (Fase 3)">
            <Grid>
              <Field label="Maturidade do PGR/GRO atual">
                <Select value={draft.maturidadePgr} onValueChange={v => update("maturidadePgr", v as ProposalDraft["maturidadePgr"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inexistente">Inexistente — criar do zero</SelectItem>
                    <SelectItem value="parcial">Parcial — revisar e completar</SelectItem>
                    <SelectItem value="completo">Completo — adequar à NR-1</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Grau de risco (CNAE)">
                <Select value={draft.grauRisco} onValueChange={v => update("grauRisco", v as ProposalDraft["grauRisco"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grau 1 — Baixo</SelectItem>
                    <SelectItem value="2">Grau 2 — Médio</SelectItem>
                    <SelectItem value="3">Grau 3 — Alto</SelectItem>
                    <SelectItem value="4">Grau 4 — Muito alto</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="CNAE principal">
                <Input value={draft.cnae} onChange={e => update("cnae", e.target.value)} placeholder="00.00-0/00" />
              </Field>
              <Field label="Tem prestadores/PJ no local?">
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={draft.temPrestadores} onCheckedChange={v => update("temPrestadores", v)} />
                  <span className="text-sm text-muted-foreground">{draft.temPrestadores ? "Sim" : "Não"}</span>
                </div>
              </Field>
              <Field label="Nº de gestores e líderes">
                <Input type="number" min={0} value={draft.numLideres} onChange={e => update("numLideres", +e.target.value || 0)} />
              </Field>
              <Field label="Possui equipe interna SST/RH?">
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={draft.temEquipeSst} onCheckedChange={v => update("temEquipeSst", v)} />
                  <span className="text-sm text-muted-foreground">{draft.temEquipeSst ? "Sim" : "Não"}</span>
                </div>
              </Field>
            </Grid>
          </Section>

          {/* CONTEÚDO DA PROPOSTA */}
          <Section icon={Sparkles} title="Conteúdo da proposta">
            <Field label="Resumo do escopo (visível ao cliente)">
              <Textarea
                rows={3}
                value={draft.escopoResumo}
                onChange={e => update("escopoResumo", e.target.value)}
                placeholder="Ex.: Implementação completa do PGR com inclusão de riscos psicossociais conforme NR-1, abrangendo 3 unidades e 120 colaboradores..."
              />
            </Field>

            <ListEditor
              label="Diferenciais"
              items={draft.diferenciais}
              onChange={(i, v) => updateList("diferenciais", i, v)}
              onAdd={() => addListItem("diferenciais")}
              onRemove={(i) => removeListItem("diferenciais", i)}
              placeholder="Ex.: Metodologia exclusiva..."
            />

            <ListEditor
              label="Entregáveis"
              items={draft.entregaveis}
              onChange={(i, v) => updateList("entregaveis", i, v)}
              onAdd={() => addListItem("entregaveis")}
              onRemove={(i) => removeListItem("entregaveis", i)}
              placeholder="Ex.: Diagnóstico completo..."
            />

            {/* Fases */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Fases do projeto</Label>
                <Button type="button" size="sm" variant="outline" onClick={addFase} className="gap-1 h-8 text-xs">
                  <Plus className="h-3 w-3" /> Adicionar fase
                </Button>
              </div>
              <div className="space-y-3">
                {draft.fases.map((f, i) => (
                  <div key={i} className="border rounded-lg p-3 bg-muted/20 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => removeFase(i)}
                      className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 rounded p-1"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Input
                      placeholder="Título da fase"
                      value={f.titulo}
                      onChange={e => updateFase(i, "titulo", e.target.value)}
                      className="font-semibold"
                    />
                    <Textarea
                      rows={2}
                      placeholder="Descrição"
                      value={f.descricao}
                      onChange={e => updateFase(i, "descricao", e.target.value)}
                    />
                    <Input
                      placeholder="Duração (ex.: 3 a 4 semanas)"
                      value={f.duracao}
                      onChange={e => updateFase(i, "duracao", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* INVESTIMENTO */}
          <Section icon={DollarSign} title="Investimento">
            {/* Hero do total */}
            <div className="rounded-xl border-2 border-secondary/40 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                    Investimento total sugerido
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary mt-1 tabular-nums">
                    {totalCalculado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {horasFinais}h × R$ {valorHora} •{" "}
                    {draft.investimentoParcelas}× de{" "}
                    <span className="font-semibold text-primary">
                      {(totalCalculado / Math.max(draft.investimentoParcelas, 1)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {draft.investimentoTotal !== totalCalculado && (
                    <span className="text-[10px] text-muted-foreground">
                      Salvo: {draft.investimentoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={aplicarCalculo}
                    disabled={draft.investimentoTotal === totalCalculado}
                    className="hero-gradient border-0 text-primary-foreground gap-1.5"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    {draft.investimentoTotal === totalCalculado ? "Aplicado" : "Usar este valor"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Controles de cálculo */}
            <div className="rounded-lg border bg-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-secondary" />
                <span className="text-sm font-bold text-primary">Como o valor é calculado</span>
                {horasManual !== null && (
                  <button
                    type="button"
                    onClick={() => setHorasManual(null)}
                    className="ml-auto text-[10px] text-secondary hover:underline"
                  >
                    ↺ Voltar para sugestão ({horasEstimadas}h)
                  </button>
                )}
              </div>

              {/* Horas */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                    Horas do projeto
                  </Label>
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {horasFinais}h
                    {horasManual === null && <span className="text-[10px] text-muted-foreground font-normal ml-1">(auto)</span>}
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={Math.max(horasEstimadas * 2, 400)}
                  step={5}
                  value={horasFinais}
                  onChange={e => setHorasManual(+e.target.value)}
                  className="w-full accent-secondary"
                />
              </div>

              {/* Valor da hora — presets */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <Label className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                    Valor da hora
                  </Label>
                  <span className="text-sm font-bold text-primary tabular-nums">R$ {valorHora}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[250, 350, 500, 750].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValorHora(v)}
                      className={`text-xs font-semibold py-2 rounded-md border transition ${
                        valorHora === v
                          ? "border-secondary bg-secondary/15 text-primary"
                          : "border-border hover:border-secondary/50 text-muted-foreground"
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={0}
                  value={valorHora}
                  onChange={e => setValorHora(+e.target.value || 0)}
                  className="h-9 text-sm"
                  placeholder="Outro valor"
                />
              </div>

              {/* Parcelas — chips */}
              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70 mb-1.5 block">
                  Parcelamento
                </Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 3, 4, 6, 12].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update("investimentoParcelas", n)}
                      className={`text-xs font-semibold py-2 rounded-md border transition ${
                        draft.investimentoParcelas === n
                          ? "border-secondary bg-secondary/15 text-primary"
                          : "border-border hover:border-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prazo + validade */}
            <Grid>
              <Field label="Prazo do projeto (meses)">
                <Input type="number" min={1} value={draft.prazoMeses} onChange={e => update("prazoMeses", +e.target.value || 1)} />
              </Field>
              <Field label="Validade da proposta (dias)">
                <Input type="number" min={1} value={draft.validadeDias} onChange={e => update("validadeDias", +e.target.value || 15)} />
              </Field>
            </Grid>

            {/* Avançado: ajuste manual do total */}
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-primary select-none">
                Ajustar valor manualmente (opcional)
              </summary>
              <div className="mt-2">
                <Field label="Investimento total (R$) — sobrescreve o cálculo">
                  <Input type="number" min={0} value={draft.investimentoTotal} onChange={e => update("investimentoTotal", +e.target.value || 0)} />
                </Field>
              </div>
            </details>

            <Field label="Observação sobre pagamento">
              <Textarea
                rows={2}
                value={draft.investimentoObservacao}
                onChange={e => update("investimentoObservacao", e.target.value)}
              />
            </Field>
          </Section>

          {/* INTERNO */}
          <Section icon={Briefcase} title="Notas internas (não visíveis ao cliente)">
            <Textarea
              rows={2}
              value={draft.observacoesInternas}
              onChange={e => update("observacoesInternas", e.target.value)}
              placeholder="Notas para o time comercial..."
            />
          </Section>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t mt-4 sticky bottom-0 bg-background pb-1">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-1.5">
            <X className="h-4 w-4" /> Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="hero-gradient border-0 text-primary-foreground gap-1.5">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : (proposal ? "Salvar alterações" : "Criar proposta")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Helpers de UI ──
const Section = ({ icon: Icon, title, children }: { icon: typeof Sparkles; title: string; children: React.ReactNode }) => (
  <div className="border rounded-xl p-4 bg-card space-y-3">
    <h3 className="text-sm font-bold text-primary flex items-center gap-2">
      <Icon className="h-4 w-4 text-secondary" /> {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">{label}</Label>
    <div className="mt-1">{children}</div>
  </div>
);

const ListEditor = ({
  label, items, onChange, onAdd, onRemove, placeholder,
}: {
  label: string;
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">{label}</Label>
      <Button type="button" size="sm" variant="outline" onClick={onAdd} className="gap-1 h-8 text-xs">
        <Plus className="h-3 w-3" /> Adicionar
      </Button>
    </div>
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={e => onChange(i, e.target.value)} placeholder={placeholder} />
          <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(i)} className="text-destructive hover:bg-destructive/10 flex-shrink-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default ProposalForm;
