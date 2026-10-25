"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { cn } from "@/lib/utils";
import type { ProgressMode } from "@/features/progress/types";
import { createProject, deleteProject, updateProjectStatus } from "./actions";
import { projectKinds, projectStatuses, type Project, type ProjectKind, type ProjectStatus } from "./types";

const LOCAL_KEY = "empire:projects";

function readLocalProjects(): Project[] {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? "[]") as Project[];
  } catch {
    return [];
  }
}
function writeLocalProjects(projects: Project[]) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(projects));
  } catch {
    // Stockage indisponible.
  }
}

/** Projets personnels : création, statut, suppression. Sobre et rapide. */
export function ProjectsPanel({ mode, initial = [] }: { mode: ProgressMode; initial?: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ProjectKind>("site");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mode === "local") setProjects(readLocalProjects());
  }, [mode]);

  const commitLocal = (next: Project[]) => {
    setProjects(next);
    writeLocalProjects(next);
  };

  const onCreate = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const name = title.trim();
    if (!name) return setError("Donne un nom au projet.");
    if (mode === "local") {
      commitLocal([{ id: crypto.randomUUID(), title: name.slice(0, 80), kind, status: "idee", createdAt: new Date().toISOString() }, ...projects]);
      setTitle("");
      return;
    }
    startTransition(async () => {
      const result = await createProject({ title: name, kind });
      if (!result.ok) return setError(result.error);
      if (result.data) setProjects((current) => [result.data!, ...current]);
      setTitle("");
    });
  };

  const onStatus = (id: string, status: ProjectStatus) => {
    const previous = projects;
    const next = projects.map((project) => (project.id === id ? { ...project, status } : project));
    if (mode === "local") return commitLocal(next);
    setProjects(next);
    startTransition(async () => {
      const result = await updateProjectStatus({ id, status });
      if (!result.ok) {
        setError(result.error);
        setProjects(previous);
      }
    });
  };

  const onDelete = (id: string) => {
    const previous = projects;
    const next = projects.filter((project) => project.id !== id);
    if (mode === "local") return commitLocal(next);
    setProjects(next);
    startTransition(async () => {
      const result = await deleteProject({ id });
      if (!result.ok) {
        setError(result.error);
        setProjects(previous);
      }
    });
  };

  return (
    <div className="grid gap-4" aria-busy={pending}>
      {error && <Notice tone="error" title="Projets">{error}</Notice>}
      <form onSubmit={onCreate} className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="sr-only" htmlFor="project-title">Nom du projet</label>
        <input
          id="project-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={80}
          placeholder="Nouveau projet : ex. Site du cabinet"
          className="min-h-12 border hairline bg-abyss px-4 text-paper placeholder:text-mist/70 focus:border-silver focus:outline-none"
        />
        <label className="sr-only" htmlFor="project-kind">Type</label>
        <select id="project-kind" value={kind} onChange={(event) => setKind(event.target.value as ProjectKind)} className="min-h-12 border hairline bg-abyss px-3 text-paper">
          {projectKinds.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <button type="submit" className="meta inline-flex min-h-12 items-center justify-center gap-2 bg-paper px-4 text-void hover:bg-volt">
          <Plus aria-hidden className="size-4" /> Ajouter
        </button>
      </form>
      {projects.length === 0 ? (
        <p className="border hairline border-dashed p-6 text-sm text-mist">Aucun projet pour l&apos;instant. Ajoute celui sur lequel tu travailles : il te suivra d&apos;une formation à l&apos;autre.</p>
      ) : (
        <ul className="grid gap-2">
          {projects.map((project) => (
            <li key={project.id} className="grid items-center gap-3 border hairline p-4 sm:grid-cols-[1fr_auto_auto]">
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="meta text-mist">{projectKinds.find((item) => item.value === project.kind)?.label}</p>
              </div>
              <div className="flex gap-1" role="group" aria-label={`Statut de ${project.title}`}>
                {projectStatuses.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    aria-pressed={project.status === status.value}
                    onClick={() => onStatus(project.id, status.value)}
                    className={cn(
                      "meta min-h-11 border px-3",
                      project.status === status.value ? (status.value === "lance" ? "border-volt bg-volt text-void" : "border-paper bg-paper text-void") : "hairline text-mist hover:text-paper",
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onDelete(project.id)} className="flex size-11 items-center justify-center text-mist hover:text-danger" aria-label={`Supprimer ${project.title}`}>
                <Trash2 aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
