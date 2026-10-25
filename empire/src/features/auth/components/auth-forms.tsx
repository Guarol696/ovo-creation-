"use client";

import Link from "next/link";
import { useActionState } from "react";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { routes } from "@/config/site";
import { NEXT_PARAM } from "@/lib/auth/redirect";
import { requestPasswordReset, signIn, signUp, updatePassword, type FormState } from "../actions";
import { SubmitButton } from "./submit-button";

const initial: FormState = { status: "idle" };

function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <Notice tone={state.status === "success" ? "info" : "error"} title={state.status === "success" ? "C'est envoyé" : "Ça n'a pas fonctionné"}>
      {state.message}
    </Notice>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initial);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name={NEXT_PARAM} value={next} />
      <FormMessage state={state} />
      <TextField id="email" type="email" label="Email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <TextField id="password" type="password" label="Mot de passe" autoComplete="current-password" required error={state.fieldErrors?.password} />
      <div className="-mt-2 text-right">
        <Link href={routes.forgotPassword} className="inline-flex min-h-11 items-center text-sm text-silver underline-offset-4 hover:text-paper hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <SubmitButton pendingLabel="Connexion…">Se connecter</SubmitButton>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, initial);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name={NEXT_PARAM} value={next} />
      <FormMessage state={state} />
      <TextField id="displayName" label="Prénom ou pseudo" autoComplete="nickname" required defaultValue={state.values?.displayName} error={state.fieldErrors?.displayName} />
      <TextField id="email" type="email" label="Email" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <TextField
        id="password"
        type="password"
        label="Mot de passe"
        autoComplete="new-password"
        required
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
        error={state.fieldErrors?.password}
      />
      <TextField id="confirmPassword" type="password" label="Confirmer le mot de passe" autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <SubmitButton pendingLabel="Création du compte…">Créer mon compte</SubmitButton>
      <p className="text-xs text-mist">
        En créant un compte, tu acceptes les{" "}
        <Link href={routes.terms} className="underline underline-offset-2">
          conditions d&apos;utilisation
        </Link>{" "}
        et la{" "}
        <Link href={routes.privacy} className="underline underline-offset-2">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initial);
  if (state.status === "success") return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      <TextField id="email" type="email" label="Email du compte" autoComplete="email" required defaultValue={state.values?.email} error={state.fieldErrors?.email} />
      <SubmitButton pendingLabel="Envoi…">Recevoir un lien</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, initial);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormMessage state={state} />
      <TextField id="password" type="password" label="Nouveau mot de passe" autoComplete="new-password" required hint="8 caractères minimum, une lettre et un chiffre." error={state.fieldErrors?.password} />
      <TextField id="confirmPassword" type="password" label="Confirmer" autoComplete="new-password" required error={state.fieldErrors?.confirmPassword} />
      <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}
