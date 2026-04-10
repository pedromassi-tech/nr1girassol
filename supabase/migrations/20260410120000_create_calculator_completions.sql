CREATE TABLE IF NOT EXISTS public.calculator_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  empresa text NOT NULL DEFAULT '',
  num_colaboradores text NOT NULL DEFAULT '',
  faturamento text NOT NULL DEFAULT '',
  momento text NOT NULL DEFAULT '',
  estrutura text NOT NULL DEFAULT '',
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT '',
  bloco_nr1 integer NOT NULL DEFAULT 0,
  bloco_sinais integer NOT NULL DEFAULT 0,
  bloco_gestao integer NOT NULL DEFAULT 0,
  multa_min numeric NOT NULL DEFAULT 0,
  multa_max numeric NOT NULL DEFAULT 0,
  impacto_min numeric NOT NULL DEFAULT 0,
  impacto_max numeric NOT NULL DEFAULT 0,
  respostas jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert calculator completions"
  ON public.calculator_completions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can select calculator completions"
  ON public.calculator_completions FOR SELECT
  TO anon, authenticated
  USING (true);
