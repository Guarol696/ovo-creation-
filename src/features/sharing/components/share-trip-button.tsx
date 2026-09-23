"use client";

import { Check, Copy, Globe, Link2, Loader2, Lock, Share2 } from "lucide-react";
import { useCallback, useId, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormMessage } from "@/features/auth/components/form-controls";
import { useTripPage } from "@/features/trip-results/components/save-trip-button";
import { SAVE_INTENT_PARAM } from "@/lib/auth/redirect";
import { cn } from "@/lib/utils";
import { setTripSharing } from "../actions";

/**
 * « Partager mon voyage »
 * - voyage généré : on partage le lien de la page de résultat ;
 * - voyage enregistré : privé par défaut, son propriétaire le rend partageable
 *   (lien public secret) ou désactive le partage ;
 * - voyage partagé : un visiteur peut le repartager.
 * Partage natif (Web Share API) quand le navigateur le permet, sinon « Copier le lien ».
 */

const noopSubscribe = () => () => {};
const canNativeShare = () => typeof navigator !== "undefined" && typeof navigator.share === "function";

interface ShareTripButtonProps {
  className?: string;
  label?: "short" | "long";
}

export function ShareTripButton({ className, label = "long" }: ShareTripButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="lg"
        variant="outline-light"
        className={className}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Share2 className="size-5" />
        {label === "short" ? (
          <>
            <span className="sm:hidden">Partager</span>
            <span className="hidden sm:inline">Partager mon voyage</span>
          </>
        ) : (
          "Partager mon voyage"
        )}
      </Button>
      <ShareDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { config, sharing, setSharing } = useTripPage();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const close = () => {
    setError(null);
    setNotice(null);
    onClose();
  };

  // Lien à partager selon le mode.
  let path: string | null = null;
  if (config.mode === "public") path = config.sharePath;
  if (config.mode === "saved") path = sharing?.isPublic ? sharing.sharePath : null;

  function toggleSharing(enabled: boolean) {
    if (config.mode !== "saved") return;
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await setTripSharing(config.savedTripId, enabled);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setSharing({ isPublic: result.isPublic, sharePath: result.sharePath });
      setNotice(
        result.isPublic
          ? "Ton voyage est maintenant partageable ✓"
          : "Partage désactivé ✓ L'ancien lien ne fonctionne plus.",
      );
    });
  }

  const title = `Mon voyage à ${config.destinationName}`;

  return (
    <Modal open={open} onClose={close} icon="📤" title="Partager mon voyage">
      {config.mode === "saved" && (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
            sharing?.isPublic
              ? "bg-emerald-500/10 text-emerald-200 ring-emerald-400/30"
              : "bg-white/5 text-white/75 ring-white/15",
          )}
        >
          {sharing?.isPublic ? <Globe className="size-3.5" /> : <Lock className="size-3.5" />}
          {sharing?.isPublic ? "Partageable par lien" : "Privé"}
        </p>
      )}

      {notice && (
        <div className="mt-4">
          <FormMessage tone="success">{notice}</FormMessage>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <FormMessage tone="error">{error}</FormMessage>
        </div>
      )}

      {config.mode === "saved" && !sharing?.isPublic ? (
        <>
          <p className="mt-4 leading-relaxed text-night-100/80">
            Ton voyage est privé : toi seul·e peux le voir. Rends-le partageable pour obtenir un lien. Les
            personnes qui ont ce lien verront le voyage (programme, carte, budget…), mais jamais ton nom, ton
            email ni tes autres voyages.
          </p>
          <Button size="lg" className="mt-6 w-full" onClick={() => toggleSharing(true)} disabled={pending}>
            {pending ? <Loader2 className="size-5 animate-spin" /> : <Link2 className="size-5" />}
            {pending ? "Activation…" : "Rendre partageable"}
          </Button>
        </>
      ) : (
        <>
          <p className="mt-4 leading-relaxed text-night-100/80">
            {config.mode === "result"
              ? "Envoie ce lien : tes proches découvriront la même proposition de voyage, sans compte."
              : config.mode === "public"
                ? "Fais découvrir ce voyage : le lien s'ouvre sans compte."
                : "Toute personne qui a ce lien peut voir ton voyage, sans compte et sans voir tes informations personnelles."}
          </p>
          <ShareLinkActions path={path} title={title} destinationName={config.destinationName} />
          {config.mode === "saved" && (
            <Button
              variant="ghost-light"
              className="mt-3 w-full text-red-200 hover:bg-red-500/15 hover:text-red-100"
              onClick={() => toggleSharing(false)}
              disabled={pending}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Désactiver le partage
            </Button>
          )}
        </>
      )}
    </Modal>
  );
}

/** Lien + « Partager… » (natif) + « Copier le lien ». `path` null = lien de la page actuelle. */
function ShareLinkActions({
  path,
  title,
  destinationName,
}: {
  path: string | null;
  title: string;
  destinationName: string;
}) {
  const nativeShare = useSyncExternalStore(noopSubscribe, canNativeShare, () => false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const timer = useRef<number | undefined>(undefined);

  const url = useSyncExternalStore(
    noopSubscribe,
    () => {
      const link = new URL(path ?? window.location.href, window.location.origin);
      link.searchParams.delete(SAVE_INTENT_PARAM);
      link.hash = "";
      return link.toString();
    },
    () => path ?? "",
  );

  const copy = useCallback(async () => {
    setCopyFailed(false);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Presse-papiers indisponible (navigateur ancien, contexte non sécurisé) : sélection manuelle.
      inputRef.current?.select();
      if (!document.execCommand?.("copy")) {
        setCopyFailed(true);
        return;
      }
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2500);
  }, [url]);

  async function share() {
    try {
      await navigator.share({
        title: `${title} — OVO`,
        text: `Regarde mon voyage à ${destinationName}, imaginé avec OVO ✈️`,
        url,
      });
    } catch (error) {
      // Partage annulé par l'utilisateur : rien à faire. Autre erreur : on copie le lien.
      if ((error as Error)?.name !== "AbortError") await copy();
    }
  }

  return (
    <div className="mt-5 space-y-3">
      <label htmlFor={inputId} className="sr-only">
        Lien du voyage
      </label>
      <input
        ref={inputRef}
        id={inputId}
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-h-12 w-full truncate rounded-2xl bg-white/[0.06] px-4 text-sm text-white/85 ring-1 ring-white/15 focus:ring-2 focus:ring-sun-400 focus:outline-none"
      />
      {nativeShare && (
        <Button size="lg" className="w-full" onClick={share}>
          <Share2 className="size-5" /> Partager…
        </Button>
      )}
      <Button size="lg" variant={nativeShare ? "outline-light" : "primary"} className="w-full" onClick={copy}>
        {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        {copied ? "Lien copié ✓" : "Copier le lien"}
      </Button>
      <p aria-live="polite" className="sr-only">
        {copied ? "Lien copié ✓" : ""}
      </p>
      {copyFailed && (
        <FormMessage tone="error">
          Copie automatique impossible : sélectionne le lien ci-dessus et copie-le manuellement.
        </FormMessage>
      )}
    </div>
  );
}
