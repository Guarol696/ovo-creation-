"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/features/trip-builder/components/field";
import { cn } from "@/lib/utils";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
}

export function TextField({ label, name, error, hint, className, ...props }: TextFieldProps) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(inputClassName, error && "ring-2 ring-red-400/80")}
        {...props}
      />
      <FieldFeedback id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label, name, error, hint, className, ...props }: TextFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-white/90">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClassName, "pr-14", error && "ring-2 ring-red-400/80")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1.5 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      <FieldFeedback id={id} error={error} hint={hint} />
    </div>
  );
}

function FieldFeedback({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  return (
    <>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-night-100/60">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </>
  );
}

export function SubmitButton({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending} aria-disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-5 animate-spin" /> {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Message global du formulaire (erreur ou confirmation), annoncé aux lecteurs d'écran. */
export function FormMessage({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1",
        tone === "error" && "bg-red-500/10 text-red-100 ring-red-400/30",
        tone === "success" && "bg-emerald-500/10 text-emerald-100 ring-emerald-400/30",
        tone === "info" && "bg-sun-400/10 text-white/90 ring-sun-400/30",
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
