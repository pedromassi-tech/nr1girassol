// Edge function: gera rascunho de proposta com IA a partir de
// transcrição da reunião + quiz + calculadora do lead.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transcricao, lead, quiz, calculadora } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

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
  "observacoesInternas": string (resumo p/ time comercial: principais dores, urgência, decisor, riscos identificados)
}
Se algum campo não estiver claro, infira valor razoável a partir do contexto. Nunca deixe campos vazios.`;

    const userContent = `## LEAD
${JSON.stringify(lead ?? {}, null, 2)}

## RESULTADO DO QUIZ NR-1
${quiz ? JSON.stringify(quiz, null, 2) : "Não realizado"}

## RESULTADO DA CALCULADORA DE RISCO
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

    return new Response(JSON.stringify({ proposal: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-proposal error:", e);
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
