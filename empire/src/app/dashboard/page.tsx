import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Notice } from "@/components/ui/notice";
import { planById } from "@/config/plans";
import { routes } from "@/config/site";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { LocalDashboard } from "@/features/dashboard/local-dashboard";
import { getRemoteProgress } from "@/features/progress/server";
import { getProjects } from "@/features/projects/server";
import { displayName, getCurrentUser, getUserPlan } from "@/lib/auth/session";
import { loginUrl } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Mon espace", robots: { index: false } };

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) return <LocalDashboard />;

  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(routes.dashboard));

  const [plan, data] = await Promise.all([
    getUserPlan(user.id),
    Promise.all([getRemoteProgress(user.id), getProjects(user.id)]).catch((error) => {
      console.error("[dashboard] lecture impossible", error);
      return null;
    }),
  ]);

  if (!data) {
    return (
      <div className="shell pt-[calc(var(--header-h)+3rem)] pb-24">
        <Notice tone="error" title="Tableau de bord indisponible">
          Tes données n&apos;ont pas pu être chargées. Réessaie dans un instant.
        </Notice>
      </div>
    );
  }
  return <DashboardView name={displayName(user)} mode="remote" progress={data[0]} projects={data[1]} planLabel={planById(plan).name} />;
}
