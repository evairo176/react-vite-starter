import {
  Award,
  BadgeCheck,
  ExternalLink,
  Milestone,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import SectionSubHeading from "@/components/shared/SectionSubHeading";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { FadeIn, MotionSection } from "@/components/shared/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "@/core/utils/date";
import type { Achievement } from "@/core/types/achievement.type";
import useAchievements from "./useAchievements";

/** Map an achievement category to its lucide icon + readable label. */
const categoryMeta: Record<string, { icon: LucideIcon; label: string }> = {
  award: { icon: Award, label: "Penghargaan" },
  certification: { icon: BadgeCheck, label: "Sertifikasi" },
  milestone: { icon: Milestone, label: "Milestone" },
};

const getCategoryMeta = (category?: string | null) =>
  (category && categoryMeta[category]) || { icon: Trophy, label: "Pencapaian" };

/** Content-shaped loading placeholder mirroring the achievement card grid. */
const AchievementSkeleton = () => (
  <div
    data-slot="achievement-skeleton"
    aria-hidden="true"
    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
  >
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col gap-4 rounded-lg border border-border p-6"
      >
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

const Achievements = () => {
  const { achievements, isLoading, isError, refetch } = useAchievements();

  const renderBody = () => {
    if (isLoading) {
      return <AchievementSkeleton />;
    }

    if (isError) {
      return (
        <ErrorState
          description="Kami tidak dapat memuat pencapaian. Silakan coba lagi."
          onRetry={() => refetch()}
        />
      );
    }

    if (!achievements || achievements.length === 0) {
      return (
        <EmptyState
          icon={Award}
          title="Belum ada pencapaian"
          description="Pencapaian akan tampil di sini setelah dipublikasikan."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((item: Achievement, index: number) => {
          const { icon: CategoryIcon, label } = getCategoryMeta(item.category);
          return (
            <FadeIn
              key={item.id}
              delay={index * 0.05}
              className="flex flex-col gap-3 rounded-lg border bg-background p-6 hover:shadow-md transition"
            >
              <Badge
                variant="secondary"
                className="w-fit gap-1.5"
                aria-label={`Kategori: ${label}`}
              >
                <CategoryIcon className="size-3.5" aria-hidden="true" />
                {label}
              </Badge>

              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                {item.issuer ? (
                  <p className="text-sm text-muted-foreground">{item.issuer}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {fmtDate(item.date)}
                </p>
              </div>

              {item.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              ) : null}

              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  aria-label={`Lihat kredensial untuk ${item.title}`}
                >
                  Lihat kredensial
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : null}
            </FadeIn>
          );
        })}
      </div>
    );
  };

  return (
    <MotionSection
      className="space-y-6 mt-3 p-4 sm:p-6 lg:p-8 rounded-md border bg-card text-card-foreground"
      id="achievements"
    >
      <div className="space-y-2">
        <SectionHeading title={"Pencapaian"} icon={<Award className="mr-2" />} />
        <SectionSubHeading>
          <p className="dark:text-neutral-400">
            Penghargaan, sertifikasi &amp; milestone
          </p>
        </SectionSubHeading>

        {renderBody()}
      </div>
    </MotionSection>
  );
};

export default Achievements;
