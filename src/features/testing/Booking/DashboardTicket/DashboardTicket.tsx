import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";
import useDashboardTicket from "./useDashboardTicket";

type Props = {};

const DashboardTicket = (props: Props) => {
  const {
    dataDashboardTicket,
    isLoadingDashboardTicket,
    isRefetchingDashboardTicket,
    refetchDashboardTicket,
  } = useDashboardTicket();
  const ticketSummary = dataDashboardTicket?.ticketSummary;

  const categoryStats = dataDashboardTicket?.categoryStats;

  const picPerformance = dataDashboardTicket?.picPerformance;

  const stats = [
    {
      title: "Total Tickets",
      value: ticketSummary?.total || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Selesai",
      value: ticketSummary?.done || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: ticketSummary?.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Over 48 Jam",
      value: ticketSummary?.over48 || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  if (isLoadingDashboardTicket) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Ticket</h1>
          <p className="text-muted-foreground">
            Overview of ticket performance and PIC statistics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchDashboardTicket()}
          disabled={isRefetchingDashboardTicket}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefetchingDashboardTicket ? "animate-spin" : ""}`}
          />
          {isRefetchingDashboardTicket ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(categoryStats || []).map((category: any, index: number) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {category.requestType.replace("_", " ")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{category._count}</span>
                <Badge variant="outline">Tickets</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PIC Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            PIC Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">PIC Name</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Total Jobs
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Total Minutes
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Avg Minutes/Job
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Over 48h
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Unfinished
                  </th>
                </tr>
              </thead>
              <tbody>
                {(picPerformance || []).map((pic: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{pic.pic}</td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        variant={pic.totalJobs > 0 ? "default" : "outline"}
                      >
                        {pic.totalJobs}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      {pic.totalMinutes} min
                    </td>
                    <td className="text-center py-3 px-4">
                      {pic.avgMinutesPerJob} min
                    </td>
                    <td className="text-center py-3 px-4">
                      {pic.over48Hours > 0 ? (
                        <Badge variant="destructive">{pic.over48Hours}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      {pic.unfinishedJobs > 0 ? (
                        <Badge
                          variant="destructive"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          {pic.unfinishedJobs}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTicket;
