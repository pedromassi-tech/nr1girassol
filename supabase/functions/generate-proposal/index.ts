// Edge function: gera rascunho de proposta com IA a partir de
// transcrição da reunião + quiz + calculadora do lead (matching inteligente).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Normalização & similaridade ──
const normStr = (s: string | null | undefined) =>
  (s ?? "").toString().toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ");

const normPhone = (s: string | null | undefined) =>
  (s ?? "").toString().replace(/\D/g, "").replace(/^55/, ""); // só dígitos, sem DDI BR

const normEmail = (s: string | null | undefined) =>
  (s ?? "").toString().toLowerCase().trim();

// Jaccard de tokens — bom para nome/empresa
function tokenSim(a: string, b: string): number {
  const ta = new Set(normStr(a).split(" ").filter(t => t.length > 1));
  const tb = new Set(normStr(b).split(" ").filter(t => t.length > 1));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return inter / union;
}

interface MatchTarget {
  email?: string; whatsapp?: string; nome?: string; empresa?: string;
}

interface ScoredRow<T> {
  row: T; score: number; reason: string;
}

function scoreRow<T extends MatchTarget>(lead: MatchTarget, row: T): ScoredRow<T> {
  const leadEmail = normEmail(lead.email);
  const leadPhone = normPhone(lead.whatsapp);
  const rowEmail = normEmail(row.email);
  const rowPhone = normPhone(row.whatsapp);

  // E-mail exato — match forte
  if (leadEmail && rowEmail && leadEmail === rowEmail) {
    return { row, score: 100, reason: "e-mail exato" };
  }
  // Telefone (últimos 8 dígitos = núcleo do número)
  if (leadPhone.length >= 8 && rowPhone.length >= 8 &&
      leadPhone.slice(-8) === rowPhone.slice(-8)) {
    return { row, score: 90, reason: "telefone" };
  }
  // Nome + empresa
  const nomeSim = tokenSim(lead.nome ?? "", row.nome ?? "");
  const empresaSim = tokenSim(lead.empresa ?? "", row.empresa ?? "");
  if (nomeSim >= 0.5 && empresaSim >= 0.5) {
    return { row, score: 70 + Math.round((nomeSim + empresaSim) * 10), reason: "nome+empresa" };
  }
  if (nomeSim >= 0.7) {
    return { row, score: 50 + Math.round(nomeSim * 10), reason: "nome" };
  }
  if (empresaSim >= 0.7) {
    return { row, score: 40 + Math.round(empresaSim * 10), reason: "empresa" };
  }
  return { row, score: 0, reason: "" };
}

function bestMatch<T extends MatchTarget>(lead: MatchTarget, rows: T[], threshold = 40): ScoredRow<T> | null {
  if (!rows?.length) return null;
  let best: ScoredRow<T> | null = null;
  for (const r of rows) {
    const s = scoreRow(lead, r);
    if (s.score >= threshold && (!best || s.score > best.score)) best = s;
  }
  return best;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcricao, lead } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env ausente");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Busca completions recentes e faz matching inteligente no servidor
    const [{ data: quizzes }, { data: calcs }] = await Promise.all([
      supabase.from("quiz_completions").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("calculator_completions").select("*").order("created_at", { ascending: false }).limit(200),
    ]);

    const leadTarget: MatchTarget = {
      email: lead?.email, whatsapp: lead?.whatsapp,
      nome: lead?.nome, empresa: lead?.empresa,
    };
    // calculator_completions tem nome/email/empresa/whatsapp; quiz_completions tem só nome/email
    const quizMatch = bestMatch(leadTarget, quizzes ?? []);
    const calcMatch = bestMatch(leadTarget, calcs ?? []);

    const quiz = quizMatch?.row ?? null;
    const calculadora = calcMatch?.row ?? null;

    const systemPrompt = `Você é especialista em consultoria NR-1 / riscos psicossociais.
A partir das informações abaixo, gere um RASCUNHO DE PROPOSTA COMERCIAL no formato JSON estrito.
Tom: consultivo, prático, sem juridiquês. Foque em governança, produtividade e proteção reputacional.
Responda APENAS com JSON válido, sem markdown nem comentários, no schema:
{
  "escopoResumo": string (3-5 frases conectando dor do cliente, escopo e resultado esperado),
  "diferenciais": string[] (4-6 itens curtos e específicos ao caso),
  "entregaveis": string[] (5-8 itens objetivos),
  "fases": [{ "titulo": string, "descricao": string, "duracao": string }] (3-4 fases),
  "numEstabelecimentos": number,
  "numFuncoes": number,
  "numColaboradores": number,
  "modeloTrabalho": "presencial" | "hibrido" | "remoto",
  "maturidadePgr": "inexistente" | "parcial" | "completo",
  "grauRisco": "1" | "2" | "3" | "4",
  "temPrestadores": boolean,
  "numLideres": number,
  "temEquipeSst": boolean,
  "prazoMeses": number,
  "observacoesInternas": string (resumo p/ time comercial: principais dores, urgência, decisor, riscos)
}
Se algum campo não estiver claro, infira valor razoável a partir do contexto. Nunca deixe campos vazios.`;

    const userContent = `## LEAD
${JSON.stringify(lead ?? {}, null, 2)}

## RESULTADO DO QUIZ NR-1 ${quizMatch ? `(match por ${quizMatch.reason})` : "(não encontrado)"}
${quiz ? JSON.stringify(quiz, null, 2) : "Não realizado"}

## RESULTADO DA CALCULADORA DE RISCO ${calcMatch ? `(match por ${calcMatch.reason})` : "(não encontrado)"}
${calculadora ? JSON.stringify(calculadora, null, 2) : "Não realizada"}

## TRANSCRIÇÃO / RESUMO DA REUNIÃO DIAGNÓSTICO
${transcricao || "Não fornecida"}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no Lovable." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      throw new Error(`AI gateway: ${aiRes.status} ${txt}`);
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify({
      proposal: parsed,
      matches: {
        quiz: quizMatch ? { reason: quizMatch.reason, score: quizMatch.score } : null,
        calculadora: calcMatch ? { reason: calcMatch.reason, score: calcMatch.score } : null,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-proposal error:", e);
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
