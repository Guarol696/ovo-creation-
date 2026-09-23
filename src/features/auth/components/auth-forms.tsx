"use client";

import Link from "next/link";
import { useActionState } from "react";
import { routes } from "@/config/site";
import { authUrl, NEXT_PARAM } from "@/lib/auth/redirect";
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthFormState } from "../actions";
import { PASSWORD_MIN_LENGTH } from "../schema";
import { FormMessage, PasswordField, SubmitButton, TextField } from "./form-controls";

const initialState: AuthFormState = { status: "idle" };
const passwordHint = `Au moins ${PASSWORD_MIN_LENGTH} caractères, avec des lettres et au moins un chiffre.`;

export function SignInForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, initialState);
  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name={NEXT_PARAM} value={next} />
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <div>
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
        <p className="mt-2 text-right">
          <Link
            href={authUrl(routes.forgotPassword, next)}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-sun-400 underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </p>
      </div>
      <SubmitButton pendingLabel="Connexion…">Se connecter</SubmitButton>
    </form>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, initialState);

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <FormMessage tone="success">{state.message}</FormMessage>
        <p className="text-sm text-night-100/70">
          Rien reçu ? Vérifie tes courriers indésirables. Le lien te ramènera directement sur OVO.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name={NEXT_PARAM} value={next} />
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <TextField
        label="Prénom ou pseudo"
        name="displayName"
        autoComplete="given-name"
        required
        maxLength={40}
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        label="Mot de passe"
        name="password"
        autoComplete="new-password"
        required
        hint={passwordHint}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        label="Confirme ton mot de passe"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Création du compte…">Créer mon compte gratuit</SubmitButton>
      <p className="text-xs leading-relaxed text-night-100/55">
        En créant un compte, tu acceptes les{" "}
        <Link href={routes.terms} className="underline underline-offset-2 hover:text-white">
          conditions d&apos;utilisation
        </Link>{" "}
        et la{" "}
        <Link href={routes.privacy} className="underline underline-offset-2 hover:text-white">
          politique de confidentialité
        </Link>
        . Pas de paiement, pas de spam.
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, initialState);

  if (state.status === "success") return <FormMessage tone="success">{state.message}</FormMessage>;

  return (
    <form action={action} noValidate className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <TextField
        label="Email de ton compte"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <SubmitButton pendingLabel="Envoi…">Recevoir un lien</SubmitButton>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, initialState);
  return (
    <form action={action} noValidate className="space-y-5">
      {state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      <PasswordField
        label="Nouveau mot de passe"
        name="password"
        autoComplete="new-password"
        required
        hint={passwordHint}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        label="Confirme ton nouveau mot de passe"
        name="confirmPassword"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <SubmitButton pendingLabel="Enregistrement…">Enregistrer mon mot de passe</SubmitButton>
    </form>
  );
}
