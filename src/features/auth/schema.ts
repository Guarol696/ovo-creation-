import { z } from "zod";

/** Règles partagées entre les formulaires (navigateur) et les Server Actions (serveur). */

export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt (Supabase Auth) ignore au-delà de 72 octets. */
const PASSWORD_MAX_LENGTH = 72;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Indique ton adresse email.")
  .max(254, "Cette adresse email est trop longue.")
  .pipe(z.email("Cette adresse email n'est pas valide."));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Ton mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères.`)
  .max(PASSWORD_MAX_LENGTH, "Ton mot de passe est trop long (72 caractères maximum).")
  .regex(/\p{L}/u, "Ajoute au moins une lettre à ton mot de passe.")
  .regex(/\d/, "Ajoute au moins un chiffre à ton mot de passe.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Ton prénom ou pseudo doit contenir au moins 2 caractères.")
  .max(40, "Ton prénom ou pseudo doit faire 40 caractères maximum.")
  .regex(/^[^<>{}]+$/, "Évite les caractères spéciaux < > { }.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Indique ton mot de passe.").max(PASSWORD_MAX_LENGTH),
});

export const signUpSchema = z
  .object({
    displayName: displayNameSchema,
    email,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirme ton mot de passe."),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

export const forgotPasswordSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string().min(1, "Confirme ton mot de passe.") })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

export const profileSchema = z.object({ displayName: displayNameSchema });

/** Premier message d'erreur par champ (pour l'affichage sous chaque champ). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
