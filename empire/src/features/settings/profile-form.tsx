"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { updateProfile, type FormState } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/submit-button";

export function ProfileForm({ displayName, email }: { displayName: string; email: string }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, { status: "idle" });
  return (
    <form action={action} className="grid gap-5" noValidate>
      {state.message && (
        <Notice tone={state.status === "error" ? "error" : "info"} title={state.status === "error" ? "Erreur" : "Enregistré"}>
          {state.message}
        </Notice>
      )}
      <TextField id="displayName" label="Prénom ou pseudo" defaultValue={state.values?.displayName ?? displayName} error={state.fieldErrors?.displayName} autoComplete="nickname" />
      <TextField id="email" label="Email" value={email} readOnly disabled hint="L'email du compte ne se modifie pas ici." />
      <div className="sm:max-w-xs">
        <SubmitButton pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
