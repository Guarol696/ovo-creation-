"use client";

import { useActionState, useEffect } from "react";
import { updateProfile, type AuthFormState } from "../actions";
import { useAuth } from "../auth-provider";
import { FormMessage, SubmitButton, TextField } from "./form-controls";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action] = useActionState(updateProfile, { status: "idle" } as AuthFormState);
  const { refresh } = useAuth();

  // Met à jour le prénom affiché dans l'en-tête.
  useEffect(() => {
    if (state.status === "success") void refresh();
  }, [state, refresh]);

  return (
    <form action={action} noValidate className="space-y-4">
      {state.status === "error" && state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state.status === "success" && <FormMessage tone="success">{state.message}</FormMessage>}
      <TextField
        label="Prénom ou pseudo"
        name="displayName"
        autoComplete="given-name"
        required
        maxLength={40}
        defaultValue={state.values?.displayName ?? displayName}
        error={state.fieldErrors?.displayName}
      />
      <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}
