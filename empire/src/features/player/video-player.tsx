"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import type { VideoSource } from "@/config/media";

/**
 * Lecteur vidéo : contrôles natifs (clavier, sous-titres, plein écran
 * accessibles), chargement des seules métadonnées, reprise à la dernière
 * position, gestion d'erreur avec nouvel essai.
 */
export function VideoPlayer({
  video,
  startAt = 0,
  onProgress,
  onEnded,
}: {
  video: VideoSource;
  startAt?: number;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const lastSaved = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || !startAt) return;
    const seek = () => {
      if (startAt < element.duration - 5) element.currentTime = startAt;
    };
    if (element.readyState >= 1) seek();
    else element.addEventListener("loadedmetadata", seek, { once: true });
    return () => element.removeEventListener("loadedmetadata", seek);
  }, [startAt, attempt]);

  const report = (force = false) => {
    const element = ref.current;
    if (!element || !onProgress) return;
    const seconds = Math.floor(element.currentTime);
    if (force || Math.abs(seconds - lastSaved.current) >= 10) {
      lastSaved.current = seconds;
      onProgress(seconds);
    }
  };

  if (failed) {
    return (
      <div role="alert" className="flex aspect-video flex-col items-center justify-center gap-4 border hairline bg-abyss p-6 text-center">
        <TriangleAlert aria-hidden className="size-6 text-danger" />
        <p className="font-medium">La vidéo n&apos;a pas pu être chargée.</p>
        <p className="max-w-sm text-sm text-mist">Vérifie ta connexion. Le contenu écrit de la leçon reste disponible ci-dessous.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            setAttempt((value) => value + 1);
          }}
          className="meta inline-flex min-h-11 items-center gap-2 border hairline px-4 hover:border-paper"
        >
          <RotateCcw aria-hidden className="size-4" /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <figure className="grid gap-2">
      <video
        key={attempt}
        ref={ref}
        className="aspect-video w-full border hairline bg-black"
        src={video.src}
        controls
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        onTimeUpdate={() => report()}
        onPause={() => report(true)}
        onEnded={() => {
          report(true);
          onEnded?.();
        }}
      >
        Ton navigateur ne lit pas les vidéos intégrées.
      </video>
      <figcaption className="text-xs text-mist">
        Vidéo de démonstration (sans rapport avec la leçon) : {video.title} {video.credit}
      </figcaption>
    </figure>
  );
}
