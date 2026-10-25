import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full min-h-12 border hairline bg-abyss px-4 text-base text-paper placeholder:text-mist/70 transition-colors duration-[var(--dur-quick)] hover:border-iron focus:border-silver focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt aria-[invalid=true]:border-danger";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="meta text-silver">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-mist">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: ReactNode; error?: string };

export function TextField({ id, label, hint, error, className, ...props }: InputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, className)}
        {...props}
      />
    </FieldShell>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; hint?: ReactNode; error?: string };

export function TextArea({ id, label, hint, error, className, ...props }: TextareaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        name={props.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, "min-h-32 py-3 leading-relaxed", className)}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { id: string; label: string; children: ReactNode };

export function SelectField({ id, label, className, children, ...props }: SelectProps) {
  return (
    <FieldShell id={id} label={label}>
      <select id={id} name={props.name ?? id} className={cn(control, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
