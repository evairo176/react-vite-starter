import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Cpu,
  Eye,
  FileText,
  FolderGit2,
  Layers,
  MessageSquare,
  Tags,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import SEO from "@/components/shared/SEO";

import StatCard from "./StatCard";
import useDashboardHome from "./useDashboardHome";

const fmt = (n: number | undefined | null) => (n ?? 0).toLocaleString();

export default function Home() {
  const {
    analytics,
    analyticsError,
    summary,
    summaryError,
    commentCounts,
    commentCountsError,
    isLoading,
  } = useDashboardHome();

  const maxTechCount = analytics?.topTechStacks[0]?.count || 1;
  const maxCatCount = analytics?.topCategories[0]?.count || 1;
  const pending = commentCounts?.pending ?? 0;
  const showCommentCard = !commentCountsError;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO
        title="Dashboard"
        description="Overview of your portfolio traffic, content, and moderation queue."
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Traffic, most-viewed content, and your portfolio at a glance.
        </p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* ---------------------------------------------------------------- */}
          {/* a. Stat cards                                                     */}
          {/* ---------------------------------------------------------------- */}
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Key metrics"
          >
            <StatCard
              label="Total Visits"
              value={summaryError ? "—" : fmt(summary?.totalVisits)}
              icon={Eye}
              accent="indigo"
            />
            <StatCard
              label="Visits (Last 30 Days)"
              value={summaryError ? "—" : fmt(summary?.last30DaysVisits)}
              icon={TrendingUp}
              accent="emerald"
            />

            {showCommentCard ? (
              <Link
                to="/dashboard/comments"
                aria-label={
                  pending > 0
                    ? `${pending} comments pending moderation. Go to comment moderation.`
                    : "Go to comment moderation"
                }
                className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <StatCard
                  label="Pending Comments"
                  value={fmt(pending)}
                  icon={MessageSquare}
                  accent={pending > 0 ? "amber" : "default"}
                  highlight={pending > 0}
                  className="hover:border-primary/40"
                />
              </Link>
            ) : (
              <StatCard
                label="Pending Comments"
                value="—"
                icon={MessageSquare}
              />
            )}

            <StatCard
              label="Content Categories"
              value={
                analyticsError ? "—" : fmt(analytics?.topCategories.length)
              }
              icon={Layers}
              accent="indigo"
            />
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* b. Most-viewed lists                                              */}
          {/* ---------------------------------------------------------------- */}
          {!summaryError && (
            <section
              className="grid gap-6 lg:grid-cols-2"
              aria-label="Most viewed content"
            >
              {/* Top Posts */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    Top Posts
                  </CardTitle>
                  <CardDescription>Most viewed blog posts</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary?.topPosts && summary.topPosts.length > 0 ? (
                    <ol className="divide-y divide-border">
                      {summary.topPosts.map((post, index) => (
                        <li key={post.id}>
                          <Link
                            to="/blog/$slug"
                            params={{ slug: post.slug }}
                            aria-label={`${post.title} — ${post.totalViews.toLocaleString()} views`}
                            className="group flex items-center justify-between gap-3 rounded-md py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                {index + 1}
                              </span>
                              <span className="truncate font-medium text-foreground/90 transition group-hover:text-primary">
                                {post.title}
                              </span>
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-sm text-muted-foreground">
                              <Eye className="h-3.5 w-3.5" />
                              {post.totalViews.toLocaleString()}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="py-6 text-sm italic text-muted-foreground">
                      No post views recorded yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Top Projects */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <FolderGit2 className="h-5 w-5 text-emerald-500" />
                    Top Projects
                  </CardTitle>
                  <CardDescription>Most viewed portfolio projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary?.topProjects && summary.topProjects.length > 0 ? (
                    <ol className="divide-y divide-border">
                      {summary.topProjects.map((project, index) => {
                        const content = (
                          <>
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                                {index + 1}
                              </span>
                              <span className="truncate font-medium text-foreground/90 group-hover:text-primary">
                                {project.title ?? "Untitled project"}
                              </span>
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 font-mono text-sm text-muted-foreground">
                              <Eye className="h-3.5 w-3.5" />
                              {project.views.toLocaleString()}
                            </span>
                          </>
                        );
                        return (
                          <li key={project.id}>
                            {project.slug ? (
                              <Link
                                to="/projects/$slug"
                                params={{ slug: project.slug }}
                                aria-label={`${project.title ?? "Project"} — ${project.views.toLocaleString()} views`}
                                className="group flex items-center justify-between gap-3 rounded-md py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {content}
                              </Link>
                            ) : (
                              <div className="group flex items-center justify-between gap-3 py-3">
                                {content}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="py-6 text-sm italic text-muted-foreground">
                      No project views recorded yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* c. Content distribution (existing cards)                          */}
          {/* ---------------------------------------------------------------- */}
          {!analyticsError && (
            <section
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              aria-label="Content distribution"
            >
              {/* Favorite Categories */}
              <Card className="border-muted shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Layers className="h-5 w-5 text-indigo-500" />
                    Favorite Categories
                  </CardTitle>
                  <CardDescription>
                    Most assigned project categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {analytics?.topCategories.map((cat) => (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground/80">
                            {cat.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {cat.count} projects
                          </span>
                        </div>
                        <Progress
                          value={(cat.count / maxCatCount) * 100}
                          className="h-2"
                          indicatorClassName="bg-indigo-500"
                        />
                      </div>
                    ))}
                    {analytics?.topCategories.length === 0 && (
                      <p className="text-sm italic text-muted-foreground">
                        No category data available.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Tech Stacks */}
              <Card className="border-muted shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Cpu className="h-5 w-5 text-emerald-500" />
                    Top Tech Stacks
                  </CardTitle>
                  <CardDescription>
                    Most frequently used technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {analytics?.topTechStacks.map((tech) => (
                      <div key={tech.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground/80">
                            {tech.name}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {tech.count} uses
                          </span>
                        </div>
                        <Progress
                          value={(tech.count / maxTechCount) * 100}
                          className="h-2"
                          indicatorClassName="bg-emerald-500"
                        />
                      </div>
                    ))}
                    {analytics?.topTechStacks.length === 0 && (
                      <p className="text-sm italic text-muted-foreground">
                        No tech stack data available.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card className="border-muted shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Tags className="h-5 w-5 text-amber-500" />
                    Popular Tags
                  </CardTitle>
                  <CardDescription>Most common descriptive tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {analytics?.topTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {tag.name}
                        <span className="ml-2 rounded-full bg-background/60 px-1.5 py-0.5 text-xs text-muted-foreground">
                          {tag.count}
                        </span>
                      </Badge>
                    ))}
                    {analytics?.topTags.length === 0 && (
                      <p className="w-full text-sm italic text-muted-foreground">
                        No tag data available.
                      </p>
                    )}
                  </div>
                  {analytics?.topTags && analytics.topTags.length > 0 && (
                    <div className="mt-6 border-t border-border/50 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Based on your project metadata</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Footer hint linking to full analytics. */}
          {!summaryError && (
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              View full analytics
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      )}
    </div>
  );
}

/** Loading placeholder mirroring stat cards + the two top-content columns. */
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-5">
              <Skeleton className="size-11 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
