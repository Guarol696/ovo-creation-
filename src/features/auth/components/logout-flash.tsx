"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Toast } from "@/components/ui/toast";

const subscribe = () => () => {};
const readFlag = () => new URLSearchParams(window.location.search).get("deconnexion") === "1";

/** Confirmation après déconnexion (paramètre ?deconnexion=1 ajouté par l'action). */
export function LogoutFlash() {
  const flagged = useSyncExternalStore(subscribe, readFlag, () => false);
  const [dismissed, setDismissed] = useState(false);
  const close = useCallback(() => {
    setDismissed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("deconnexion");
    window.history.replaceState(window.history.state, "", url);
  }, []);
  return (
    <Toast message={flagged && !dismissed ? "Tu es déconnecté·e. À bientôt ✈️" : null} onClose={close} />
  );
}
