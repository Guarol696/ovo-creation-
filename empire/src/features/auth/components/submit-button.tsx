"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children, pendingLabel = "Un instant…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" arrow={!pending} disabled={pending} aria-busy={pending} className="w-full">
      {pending ? pendingLabel : children}
    </Button>
  );
}
