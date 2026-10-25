"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import type { VideoSource } from "@/config/media";
import { routes } from "@/config/site";
import { cn } from "@/lib/utils";
import { saveLessonNote, setLessonCompleted, touchLesson } from "@/features/progress/actions";
import { readLocal, writeLocal } from "@/features/progress/local-store";
import { emptyProgress, type CourseProgress, type ProgressMode } from "@/features/progress/types";
import { VideoPlayer } from "./video-player";

export interface OutlineLesson {
  slug: string;
  title: string;
  minutes: number;
  module: string;
  locked: boolean;
}

interface LessonWorkspaceProps {
  course: { slug: string; title: string };
  lesson: { slug: string; title: string };
  outline: OutlineLesson[];
  video?: VideoSource;
  mode: ProgressMode;
  initial?: CourseProgress;
  previous?: string | null;
  next?: string | null;
  children: ReactNode;
}

/**
 * Espace de travail d'une leçon : sobre, orienté tâche. Vidéo, contenu,
 * marquage « terminée », notes enregistrées automatiquement, programme
 * avec progression. Mode « remote » : Server Actions (compte) ; mode
 * « local » : stockage du navigateur (démonstration, signalé).
 */
export function LessonWorkspace({ course, lesson, outline, video, mode, initial, previous, next, children }: LessonWorkspaceProps) {
  const [progress, setProgress] = useState<CourseProgress>(initial ?? emptyProgress());
  const [note, setNote] = useState(initial?.notes[lesson.slug] ?? "");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const noteTimer = useRef<number>(0);

  const completed = progress.completed.includes(lesson.slug);
  const done = progress.completed.filter((slug) => outline.some((item) => item.slug === slug)).length;
  const ratio = outline.length ? done / outline.length : 0;

  const persistLocal = useCallback(
    (update: (current: CourseProgress) => CourseProgress) => {
      setProgress((current) => {
        const nextState = update(current);
        if (mode === "local") writeLocal(course.slug, nextState);
        return nextState;
      });
    },
    [course.slug, mode],
  );

  // Chargement (mode local) et mémorisation de la dernière leçon ouverte.
  useEffect(() => {
    if (mode === "local") {
      const stored = readLocal(course.slug);
      const updated = { ...stored, lastLesson: lesson.slug };
      writeLocal(course.slug, updated);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(updated);
      setNote(stored.notes[lesson.slug] ?? "");
    } else {
      void touchLesson({ course: course.slug, lesson: lesson.slug }).then((result) => {
        if (!result.ok) setError(result.error);
      });
    }
  }, [course.slug, lesson.slug, mode]);

  const toggleCompleted = async () => {
    const value = !completed;
    setError(null);
    persistLocal((current) => ({
      ...current,
      completed: value ? [...new Set([...current.completed, lesson.slug])] : current.completed.filter((slug) => slug !== lesson.slug),
    }));
    if (value) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 1400);
    }
    if (mode === "remote") {
      const result = await setLessonCompleted({ course: course.slug, lesson: lesson.slug, completed: value });
      if (!result.ok) {
        setError(result.error);
        // Annule l'état optimiste.
        setProgress((current) => ({
          ...current,
          completed: value ? current.completed.filter((slug) => slug !== lesson.slug) : [...current.completed, lesson.slug],
        }));
      }
    }
  };

  const onNote = (value: string) => {
    setNote(value);
    setNoteStatus("saving");
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(async () => {
      if (mode === "local") {
        persistLocal((current) => ({ ...current, notes: { ...current.notes, [lesson.slug]: value } }));
        setNoteStatus("saved");
        return;
      }
      const result = await saveLessonNote({ course: course.slug, lesson: lesson.slug, body: value });
      setNoteStatus(result.ok ? "saved" : "error");
    }, 800);
  };

  const onVideoProgress = (seconds: number) => {
    if (mode === "local") persistLocal((current) => ({ ...current, positions: { ...current.positions, [lesson.slug]: seconds } }));
    else void touchLesson({ course: course.slug, lesson: lesson.slug, position: seconds });
  };

  return (
    <div className="shell grid gap-10 pt-[calc(var(--header-h)+1.5rem)] pb-24 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <div className="min-w-0">
        <nav aria-label="Fil d'Ariane" className="meta flex flex-wrap items-center gap-2 text-mist">
          <Link href={routes.course(course.slug)} className="inline-flex min-h-11 items-center gap-1 hover:text-paper">
            <ChevronLeft aria-hidden className="size-4" /> {course.title}
          </Link>
        </nav>

        {mode === "local" && (
          <Notice tone="demo" title="Mode démonstration" className="mb-6">
            Ta progression et tes notes sont enregistrées dans ce navigateur uniquement.
          </Notice>
        )}
        {error && (
          <Notice tone="error" title="Action impossible" className="mb-6">
            {error}
          </Notice>
        )}

        {video ? (
          <VideoPlayer video={video} startAt={progress.positions[lesson.slug] ?? 0} onProgress={onVideoProgress} onEnded={() => !completed && void toggleCompleted()} />
        ) : (
          <div className="flex aspect-[21/9] items-center justify-center border hairline bg-abyss">
            <p className="meta text-mist">Leçon écrite — pas de vidéo</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display max-w-2xl text-[clamp(1.75rem,3.6vw,2.75rem)] leading-tight font-extrabold [font-stretch:115%]">{lesson.title}</h1>
          <button
            type="button"
            onClick={toggleCompleted}
            aria-pressed={completed}
            className={cn(
              "meta relative inline-flex min-h-12 items-center gap-2 border px-5 transition-colors duration-[var(--dur-quick)]",
              completed ? "border-volt bg-volt text-void" : "hairline hover:border-paper",
            )}
          >
            <Check aria-hidden className={cn("size-4 transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)]", completed ? "scale-100" : "scale-0")} />
            {completed ? "Leçon terminée" : "Marquer comme terminée"}
            {celebrate && <span aria-hidden className="absolute inset-0 animate-[ping_900ms_var(--ease-out)_1] border border-volt" />}
          </button>
        </div>

        <div className="mt-8">{children}</div>

        <section aria-labelledby="notes-title" className="mt-14 border-t hairline pt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id="notes-title" className="meta text-silver">
              Mes notes
            </h2>
            <p className="meta text-mist" role="status" aria-live="polite">
              {noteStatus === "saving" ? "Enregistrement…" : noteStatus === "saved" ? "Enregistré" : noteStatus === "error" ? "Échec de l'enregistrement" : ""}
            </p>
          </div>
          <label htmlFor="lesson-note" className="sr-only">
            Notes personnelles pour cette leçon
          </label>
          <textarea
            id="lesson-note"
            value={note}
            onChange={(event) => onNote(event.target.value)}
            maxLength={10000}
            placeholder="Ce que tu retiens, ce que tu vas appliquer à ton projet…"
            className="mt-4 min-h-40 w-full border hairline bg-abyss p-4 leading-relaxed text-paper placeholder:text-mist/70 focus:border-silver focus:outline-none"
          />
        </section>

        <nav aria-label="Leçons" className="mt-10 grid gap-3 sm:grid-cols-2">
          {previous ? (
            <Link href={routes.lesson(course.slug, previous)} className="meta flex min-h-14 items-center gap-2 border hairline px-4 hover:border-paper">
              <ChevronLeft aria-hidden className="size-4" /> Leçon précédente
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={routes.lesson(course.slug, next)} className="meta flex min-h-14 items-center justify-end gap-2 bg-paper px-4 text-void hover:bg-volt">
              Leçon suivante <ChevronRight aria-hidden className="size-4" />
            </Link>
          )}
        </nav>
      </div>

      <aside aria-label="Programme" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:max-h-[calc(100dvh-var(--header-h)-3rem)] lg:self-start lg:overflow-y-auto">
        <div className="border hairline">
          <div className="border-b hairline p-5">
            <p className="meta text-mist">Progression</p>
            <p className="mt-2 font-display text-3xl font-bold [font-stretch:115%]">{Math.round(ratio * 100)} %</p>
            <div className="mt-3 h-1 bg-graphite" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-label="Progression de la formation">
              <div className="h-full origin-left bg-volt transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${ratio})` }} />
            </div>
            <p className="mt-2 text-xs text-mist">
              {done} / {outline.length} leçons terminées
            </p>
          </div>
          <ol>
            {outline.map((item, index) => {
              const current = item.slug === lesson.slug;
              const isDone = progress.completed.includes(item.slug);
              const showModule = index === 0 || outline[index - 1].module !== item.module;
              return (
                <li key={item.slug}>
                  {showModule && <p className="meta border-b hairline bg-abyss px-5 py-2 text-mist">{item.module}</p>}
                  <Link
                    href={routes.lesson(course.slug, item.slug)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center gap-3 border-b hairline px-5 py-3 text-sm transition-colors last:border-b-0",
                      current ? "bg-graphite text-paper" : "text-silver hover:bg-abyss hover:text-paper",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn("flex size-5 shrink-0 items-center justify-center border", isDone ? "border-volt bg-volt text-void" : "border-iron")}
                    >
                      {isDone ? <Check className="size-3" /> : item.locked ? <Lock className="size-3 text-mist" /> : null}
                    </span>
                    <span className="flex-1">{item.title}</span>
                    <span className="meta text-mist">{item.minutes}′</span>
                    <span className="sr-only">{isDone ? "terminée" : item.locked ? "verrouillée" : ""}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </div>
  );
}
