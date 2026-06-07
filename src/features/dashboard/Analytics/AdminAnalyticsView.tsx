import type { ReactNode } from "react";
import {
  BarChart3,
  Eye,
  FileText,
  FolderGit2,
  TrendingUp,
} from "lucide-react";

import SEO from "@/components/shared/SEO";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { TableSkeleton } from "@/components/shared/skeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopItem } from "@/core/types/analytics.type";

import useAnalytics from "./useAnalytics";

/** Human-friendly labels for known summary keys; falls back to the raw key. */
const SUMMARY_LABELS: Record<string, string> = {
  totalVisits: "Total Visits",
  totalPosts: "Total Posts",
  totalProjects: "Total Projects",
  last30Days: "Last 30 Days",
  visitsLast30Days: "Visits (Last 30 Days)",
};

const formatLabel = (key: string): string =>
  SUMMARY_LABELS[key] ??
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

const formatValue = (value: number): string =>
  typeof value === "number" ? value.toLocaleString() : String(value);

/**
 * Authenticated analytics dashboard. Renders summary totals as cards (Req 12.1)
 * plus top posts / top projects aggregation sections (Req 12.2, 12.5). Shows
 * skeletons while loading (Req 12.3, 16.5), an ErrorState with retry on failure
 * (Req 12.4), and a per-section EmptyState when a section returns zero items
 * (Req 12.6). Mounts under DashboardLayout.
 */
export default function AdminAnalyticsView() {
  const { summary, aggregations, isLoading, isError, refetch } = useAnalytics();

  const header = (
    <div className="flex flex-col gap-2">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
        <BarChart3 className="h-7 w-7 text-primary" />
        Analytics
      </h1>
      <p className="text-muted-foreground">
        Traffic and content performance at a glance.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <SEO
        title="Analytics"
        description="Review traffic and content performance for your portfolio."
      />
      {header}

      {isLoading ? (
        <AnalyticsLoading />
      ) : isError ? (
        <ErrorState
          title="Couldn't load analytics"
          description="We couldn't load your analytics data. Please try again."
          onRetry={refetch}
        />
      ) : (
        <>
          <SummaryCards summary={summary} />
          <div className="grid gap-6 lg:grid-cols-2">
            <TopSection
              title="Top Posts"
              description="Most viewed blog posts"
              icon={<FileText className="h-5 w-5 text-indigo-500" />}
              items={aggregations?.topPosts ?? []}
              emptyTitle="No post data yet"
              emptyDescription="Top posts will appear here once visits are recorded."
            />
            <TopSection
              title="Top Projects"
              description="Most viewed portfolio projects"
              icon={<FolderGit2 className="h-5 w-5 text-emerald-500" />}
              items={aggregations?.topProjects ?? []}
              emptyTitle="No project data yet"
              emptyDescription="Top projects will appear here once visits are recorded."
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Loading placeholder mirroring the summary cards + two aggregation tables. */
function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TableSkeleton rows={5} columns={2} />
        <TableSkeleton rows={5} columns={2} />
      </div>
    </div>
  );
}

/** Renders each numeric total in the summary as its own stat card. (Req 12.1) */
function SummaryCards({
  summary,
}: {
  summary?: Record<string, number>;
}) {
  const entries = summary
    ? Object.entries(summary).filter(([, value]) => typeof value === "number")
    : [];

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={Eye}
            title="No summary data"
            description="Summary totals will appear here once data is available."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, value]) => (
        <Card
          key={key}
          className="shadow-sm transition-shadow hover:shadow-md"
        >
          <CardHeader className="pb-2">
            <CardDescription>{formatLabel(key)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">
              {formatValue(value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** A single aggregation section (top posts/projects) with empty handling. */
function TopSection({
  title,
  description,
  icon,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  items: TopItem[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <ol className="divide-y divide-border">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="truncate font-medium text-foreground/90">
                    {item.title}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {item.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
