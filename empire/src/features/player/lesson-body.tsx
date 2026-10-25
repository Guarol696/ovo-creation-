import type { ReactNode } from "react";

/** Rend le contenu d'une leçon : paragraphes, et lignes « — » regroupées en listes. */
export function LessonBody({ body }: { body: string[] }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  for (const line of body) {
    if (line.startsWith("— ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    blocks.push(<p key={`p-${blocks.length}`}>{line}</p>);
  }
  flush();
  return <div className="prose-empire">{blocks}</div>;
}
