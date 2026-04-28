import { useQuery } from "@tanstack/react-query";
import dashboardService from "@/core/services/dashboard.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers, Tags, Cpu, Briefcase, TrendingUp } from "lucide-react";
import SEO from "@/components/shared/SEO";
import { useAuthStore } from "@/core/store/authStore";

export default function Home() {
  const { user } = useAuthStore();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await dashboardService.getAnalytics();
      return res.data.data;
    },
  });

 

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate generic totals for quick stats if needed, or just use the top lists
  const maxTechCount = analytics?.topTechStacks[0]?.count || 1;
  const maxCatCount = analytics?.topCategories[0]?.count || 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO
        title="Dashboard"
        description="Overview of your portfolio analytics and content distribution."
      />
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your portfolio analytics and content distribution.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Categories */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Favorite Categories
            </CardTitle>
            <CardDescription>Most assigned project categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {analytics?.topCategories.map((cat: any) => (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/80">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {cat.count} projects
                    </span>
                  </div>
                  <Progress
                    value={(cat.count / maxCatCount) * 100}
                    className="h-2 bg-indigo-100"
                    indicatorClassName="bg-indigo-500"
                  />
                </div>
              ))}
              {analytics?.topCategories.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No category data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Tech Stacks */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              Top Tech Stacks
            </CardTitle>
            <CardDescription>Most frequently used technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {analytics?.topTechStacks.map((tech: any) => (
                <div key={tech.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground/80">
                      {tech.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {tech.count} uses
                    </span>
                  </div>
                  <Progress
                    value={(tech.count / maxTechCount) * 100}
                    className="h-2 bg-emerald-100"
                    indicatorClassName="bg-emerald-500"
                  />
                </div>
              ))}
              {analytics?.topTechStacks.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No tech stack data available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card className="shadow-sm hover:shadow-md transition-shadow border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Tags className="w-5 h-5 text-amber-500" />
              Popular Tags
            </CardTitle>
            <CardDescription>Most common descriptive tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {analytics?.topTags.map((tag: any) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-3 py-1 text-sm bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                >
                  {tag.name}
                  <span className="ml-2 text-xs bg-white/50 px-1.5 py-0.5 rounded-full text-amber-800">
                    {tag.count}
                  </span>
                </Badge>
              ))}
              {analytics?.topTags.length === 0 && (
                <p className="text-sm text-muted-foreground italic w-full">
                  No tag data available.
                </p>
              )}
            </div>
            {analytics?.topTags && analytics.topTags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>Based on your project metadata</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-none">
          <CardContent className="flex items-center p-6 gap-4">
            <div className="p-3 bg-primary/20 rounded-full">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Portfolio Summary</h3>
              <p className="text-sm text-muted-foreground">
                You have effectively categorized your work across{" "}
                {analytics?.topCategories.length || 0} categories using{" "}
                {analytics?.topTechStacks.length || 0} unique technologies.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
