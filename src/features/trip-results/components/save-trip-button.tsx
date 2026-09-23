"use client";

import { Check, Link2, Loader2, Save } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { routes } from "@/config/site";
import { useAuth } from "@/features/auth/auth-provider";
import { saveTrip } from "@/features/saved-trips/actions";
import { tripPdfUrl } from "@/features/trip-export/pdf-url";
import { authUrl, SAVE_INTENT_PARAM, withSaveIntent } from "@/lib/auth/redirect";

/**
 * « 💾 Enregistrer mon voyage »
 *
 * - connecté : enregistrement direct → « Voyage enregistré ✓ » ;
 * - non connecté : proposition de compte (Se connecter / Créer un compte /
 *   Continuer sans enregistrer). Après connexion, retour sur ce voyage et
 *   enregistrement automatique (paramètre ?enregistrer=1) ;
 * - comptes non configurés : on propose de copier le lien du voyage.
 *
 * Le bouton apparaît deux fois sur la page : l'état est partagé par un contexte.
 */

export interface TripSharingState {
  isPublic: boolean;
  /** Chemin public (/voyage/partage/<jeton>) quand le partage est actif. */
  sharePath: string | null;
}

export type TripSaveConfig =
  /** Voyage tout juste généré (page de résultat). */
  | { mode: "result"; encodedRequest: string; savedTripId: string | null; destinationName: string }
  /** Voyage ouvert depuis « Mes voyages » par son propriétaire. */
  | { mode: "saved"; savedTripId: string; destinationName: string; sharing: TripSharingState }
  /** Voyage partagé, ouvert par un visiteur (lecture seule). */
  | { mode: "public"; destinationName: string; sharePath: string };

type Dialog = "prompt" | "unavailable" | null;

interface TripSaveContextValue {
  config: TripSaveConfig;
  savedId: string | null;
  saving: boolean;
  save: () => void;
  /** Partage du voyage enregistré (mode « saved »), mis à jour sans rechargement. */
  sharing: TripSharingState | null;
  setSharing: (sharing: TripSharingState) => void;
  /** Lien du PDF à télécharger. */
  pdfUrl: string;
}

const TripSaveContext = createContext<TripSaveContextValue | null>(null);

function currentPath() {
  const url = new URL(window.location.href);
  url.searchParams.delete(SAVE_INTENT_PARAM);
  return `${url.pathname}${url.search}`;
}

export function TripSaveProvider({ config, children }: { config: TripSaveConfig; children: ReactNode }) {
  const { status } = useAuth();
  const [savedId, setSavedId] = useState<string | null>(config.mode === "public" ? null : config.savedTripId);
  const [sharing, setSharing] = useState<TripSharingState | null>(
    config.mode === "saved" ? config.sharing : null,
  );
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [returnPath, setReturnPath] = useState<string>(routes.myTrips);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const autoSaveTried = useRef(false);

  const openPrompt = useCallback(() => {
    setReturnPath(withSaveIntent(currentPath()));
    setDialog("prompt");
  }, []);

  const persist = useCallback(async () => {
    if (config.mode !== "result") return;
    setSaving(true);
    try {
      const result = await saveTrip(config.encodedRequest);
      if (result.status === "saved") {
        setSavedId(result.id);
        setToast({
          message: result.alreadySaved ? "Ce voyage était déjà enregistré ✓" : "Voyage enregistré ✓",
          tone: "success",
        });
      } else if (result.status === "unauthenticated") {
        openPrompt();
      } else {
        setToast({ message: result.message, tone: "error" });
      }
    } catch {
      setToast({
        message: "Impossible d'enregistrer ton voyage pour le moment. Vérifie ta connexion.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [config, openPrompt]);

  const save = useCallback(() => {
    if (savedId || saving) return;
    if (status === "unavailable") setDialog("unavailable");
    else if (status === "anonymous") openPrompt();
    else void persist();
  }, [savedId, saving, status, openPrompt, persist]);

  // Retour après connexion / inscription : on enregistre le voyage automatiquement.
  useEffect(() => {
    if (autoSaveTried.current || status !== "authenticated" || config.mode !== "result") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get(SAVE_INTENT_PARAM) !== "1") return;
    autoSaveTried.current = true;
    url.searchParams.delete(SAVE_INTENT_PARAM);
    window.history.replaceState(window.history.state, "", url);
    if (!savedId) void Promise.resolve().then(persist);
    else queueMicrotask(() => setToast({ message: "Ce voyage était déjà enregistré ✓", tone: "success" }));
  }, [status, config.mode, savedId, persist]);

  const closeToast = useCallback(() => setToast(null), []);

  return (
    <TripSaveContext.Provider
      value={{ config, savedId, saving, save, sharing, setSharing, pdfUrl: tripPdfUrl(config) }}
    >
      {children}

      <Modal
        open={dialog === "prompt"}
        onClose={() => setDialog(null)}
        icon="💾"
        title="Enregistre ton voyage"
      >
        <p className="mt-3 leading-relaxed text-night-100/80">
          Crée un compte gratuitement pour sauvegarder tes voyages. Tu retrouveras ton voyage à{" "}
          {config.destinationName} sur tous tes appareils.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink href={authUrl(routes.signUp, returnPath)} size="lg" className="w-full">
            Créer un compte
          </ButtonLink>
          <ButtonLink
            href={authUrl(routes.login, returnPath)}
            size="lg"
            variant="outline-light"
            className="w-full"
          >
            Se connecter
          </ButtonLink>
          <Button size="lg" variant="ghost-light" className="w-full" onClick={() => setDialog(null)}>
            Continuer sans enregistrer
          </Button>
        </div>
      </Modal>

      <UnavailableDialog
        open={dialog === "unavailable"}
        onClose={() => setDialog(null)}
        destinationName={config.destinationName}
      />
      <Toast message={toast?.message ?? null} tone={toast?.tone} onClose={closeToast} />
    </TripSaveContext.Provider>
  );
}

interface SaveTripButtonProps {
  className?: string;
  variant?: "primary" | "outline-light";
}

/** Contexte de la page de voyage (enregistrement, partage, PDF). */
export function useTripPage() {
  const context = useContext(TripSaveContext);
  if (!context) throw new Error("Ce composant doit être placé dans un TripSaveProvider");
  return context;
}

export function SaveTripButton({ className, variant = "primary" }: SaveTripButtonProps) {
  const { config, savedId, saving, save } = useTripPage();
  // Voyage partagé par quelqu'un d'autre : rien à enregistrer ici.
  if (config.mode === "public") return null;

  if (savedId) {
    return (
      <ButtonLink
        href={routes.myTrips}
        size="lg"
        variant="outline-light"
        className={className}
        aria-label="Voyage enregistré ✓ — voir mes voyages"
      >
        <Check className="size-5 text-emerald-400" /> Voyage enregistré ✓
      </ButtonLink>
    );
  }
  return (
    <Button
      size="lg"
      variant={variant}
      className={className}
      onClick={save}
      disabled={saving}
      aria-busy={saving}
    >
      {saving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
      {saving ? "Enregistrement…" : "Enregistrer mon voyage"}
    </Button>
  );
}

/** Comptes non configurés : on garde la solution « copier le lien ». */
function UnavailableDialog({
  open,
  onClose,
  destinationName,
}: {
  open: boolean;
  onClose: () => void;
  destinationName: string;
}) {
  const [copied, setCopied] = useState(false);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <Modal open={open} onClose={onClose} icon="💾" title="Bientôt dans ton espace OVO">
      <p className="mt-3 leading-relaxed text-night-100/80">
        Les comptes OVO ne sont pas encore activés sur cette version. Garde le lien de cette page pour
        retrouver ton voyage à {destinationName} : il contient toutes tes réponses.
      </p>
      <div className="mt-6">
        <Button onClick={copyLink} className="w-full" size="lg">
          {copied ? <Check className="size-5" /> : <Link2 className="size-5" />}
          {copied ? "Lien copié !" : "Copier le lien du voyage"}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copied ? "Lien copié dans le presse-papiers" : ""}
      </p>
    </Modal>
  );
}
