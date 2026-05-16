/**
 * Supabase Edge Function: ai-assistant
 * Proxies requests to the Gemma 4 (Google AI Studio) API
 *
 * Deployment:
 * 1. Set secret: supabase secrets set GEMMA_API_KEY=your_key_here
 * 2. Deploy: supabase functions deploy ai-assistant
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMMA_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-7b-it:generateContent"; // Example endpoint

serve(async (req) => {
  try {
    // 1. Validate Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 });
    }

    // Initialize Supabase Client with the user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), { status: 401 });
    }

    // 2. Parse Request Body
    const { prompt, context } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // 3. Construct Contextual Prompt (RAG-lite)
    // We combine the user's query with the CRM data provided by the frontend
    const systemInstruction = "You are an expert Sourcing AI assistant for ProSource CRM. You help users manage leads, products, and invoices. Be concise and professional.";
    const dataContext = context
      ? `\n\nContext from CRM:\nClients: ${JSON.stringify(context.clients || [])}\nLeads: ${JSON.stringify(context.leads || [])}\nProducts: ${JSON.stringify(context.products || [])}\nInvoices: ${JSON.stringify(context.invoices || [])}`
      : "";

    const finalPrompt = `${systemInstruction}\n\n${dataContext}\n\nUser Query: ${prompt}`;

    // 4. Call the Gemma API
    const apiKey = Deno.env.get('GEMMA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI API key not configured on server' }), { status: 500 });
    }

    const response = await fetch(`${GEMMA_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      }),
    });

    const result = await response.json();

    // Extract the text content from Gemini/Gemma response format
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ content: aiText }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal Server Error' }),
      { status: 500 }
    );
  }
})
