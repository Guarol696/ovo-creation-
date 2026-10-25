import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ASSISTANT_MODEL, isAssistantConfigured } from "@/features/assistant/config";
import { SYSTEM_PROMPT } from "@/features/assistant/prompt";
import { allowRequest } from "@/features/assistant/rate-limit";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

const body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(4000) }))
    .min(1)
    .max(24)
    .refine((messages) => messages[0].role === "user" && messages[messages.length - 1].role === "user", "Conversation invalide."),
});

const json = (status: number, error: string) => Response.json({ error }, { status });

/**
 * Assistant : la clé d'API ne quitte jamais le serveur. Chaque requête est
 * validée, authentifiée (si les comptes sont actifs) et limitée en débit.
 * Réponse diffusée en texte brut au fil de la génération.
 */
export async function POST(request: NextRequest) {
  if (!isAssistantConfigured()) return json(503, "L'assistant n'est pas activé sur ce déploiement.");

  let identity = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonyme";
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) return json(401, "Connecte-toi pour utiliser l'assistant.");
    identity = user.id;
  }
  if (!allowRequest(identity)) return json(429, "Beaucoup de messages en peu de temps : patiente quelques minutes.");

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json(400, "Message invalide (4000 caractères maximum).");

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.beta.messages.stream(
          {
            model: ASSISTANT_MODEL,
            max_tokens: 4000,
            system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
            messages: parsed.data.messages,
            output_config: { effort: "low" },
            // Si la requête est déclinée par les garde-fous, l'API la relance sur un modèle de repli adapté.
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
          },
          { signal: request.signal },
        );
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await response.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nJe ne peux pas répondre à cette demande. Essaie de la reformuler autour de ton projet."));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n(Réponse tronquée : demande-moi la suite.)"));
        }
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) {
          controller.enqueue(encoder.encode("\n\nL'assistant est très sollicité. Réessaie dans un instant."));
        } else if (error instanceof Anthropic.AuthenticationError) {
          console.error("[assistant] clé d'API invalide");
          controller.enqueue(encoder.encode("\n\nL'assistant est mal configuré côté serveur."));
        } else if (error instanceof Anthropic.APIError) {
          console.error("[assistant] erreur API", error.status, error.message);
          controller.enqueue(encoder.encode("\n\nL'assistant ne répond pas pour le moment. Réessaie plus tard."));
        } else if (!request.signal.aborted) {
          console.error("[assistant] erreur", error);
          controller.enqueue(encoder.encode("\n\nConnexion interrompue."));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
