import { MeneAIService } from "@mene/ai";
import { AIServiceConfig } from "@mene/types";

export interface Env {
  GROQ_API_KEY: string;
  ALLOWED_ORIGIN?: string;
  LIMITER_KV?: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      const { prompt, model, systemInstruction } = await request.json() as { prompt: string; model?: string; systemInstruction?: string };

      if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      if (prompt.length > 20000) {
        return new Response(JSON.stringify({ error: "Prompt payload exceeds maximum allowed size of 20,000 characters." }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }


      // --- SERVER-SIDE IP RATE LIMITING (KV-BASED) ---
      let limiterKey = "";
      let isRateLimited = false;
      let nextCount = 1;

      if (env.LIMITER_KV) {
        const ip = request.headers.get("CF-Connecting-IP") || "127.0.0.1";
        const today = new Date().toISOString().split("T")[0];
        limiterKey = `limit:${ip}:${today}`;

        const countStr = await env.LIMITER_KV.get(limiterKey);
        const count = countStr ? parseInt(countStr, 10) : 0;

        if (count >= 3) {
          isRateLimited = true;
        } else {
          nextCount = count + 1;
        }
      }

      if (isRateLimited) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Daily limit exceeded. You have used your 3 free generations for today. Please try again tomorrow!",
          }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const config: AIServiceConfig = {
        apiKey: env.GROQ_API_KEY,
        modelName: model || "llama-3.3-70b-versatile",
      };

      const aiService = new MeneAIService(config);
      const output = await aiService.generateText(prompt, systemInstruction);

      // Increment count on KV only if generation was successful
      if (output.success && env.LIMITER_KV && limiterKey) {
        await env.LIMITER_KV.put(limiterKey, nextCount.toString(), { expirationTtl: 86400 });
      }

      return new Response(JSON.stringify(output), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message || String(err) }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  },
};
