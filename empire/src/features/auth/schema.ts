import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Adresse email invalide.").max(254);
const password = z
  .string()
  .min(8, "8 caractères minimum.")
  .max(72, "72 caractères maximum.")
  .regex(/[A-Za-z]/, "Au moins une lettre.")
  .regex(/\d/, "Au moins un chiffre.");

export const signInSchema = z.object({ email, password: z.string().min(1, "Mot de passe requis.") });

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, "2 caractères minimum.").max(60, "60 caractères maximum."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Les mots de passe ne correspondent pas." });

export const forgotPasswordSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Les mots de passe ne correspondent pas." });

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "2 caractères minimum.").max(60, "60 caractères maximum."),
});

export function fieldErrors(error: z.ZodError) {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
