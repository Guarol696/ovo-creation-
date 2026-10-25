import "server-only";

/** L'assistant réel n'est actif que si une clé d'API est définie côté serveur. */
export const isAssistantConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY?.trim());

export const ASSISTANT_MODEL = process.env.ASSISTANT_MODEL?.trim() || "claude-opus-5-5";
