/** Remonté à chaque navigation : entrée de page sobre (ou continuité d'une transition signature). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
