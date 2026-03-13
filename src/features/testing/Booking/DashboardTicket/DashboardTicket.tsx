import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  Timer,
  TrendingUp,
} from "lucide-react";

type Props = {};

const DashboardTicket = (props: Props) => {
  const ticketSummary = {
    total: 9,
    done: 2,
    pending: 7,
    over48: 0,
  };

  const categoryStats = [
    { _count: 3, requestType: "DOXA_REVISION" },
    { _count: 5, requestType: "SOFTWARE" },
    { _count: 1, requestType: "OTHER" },
  ];

  const picPerformance = [
    {
      pic: "Andi Saputra",
      totalJobs: 1,
      totalMinutes: 36,
      avgMinutesPerJob: 36,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Budi Pratama",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Cahyo Nugroho",
      totalJobs: 1,
      totalMinutes: 16,
      avgMinutesPerJob: 16,
      over48Hours: 0,
      unfinishedJobs: 1,
    },
    {
      pic: "Dimas Setiawan",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Eko Prasetyo",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Fajar Hidayat",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Gilang Ramadhan",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Hendra Wijaya",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Indra Kurniawan",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
    {
      pic: "Joko Santoso",
      totalJobs: 0,
      totalMinutes: 0,
      avgMinutesPerJob: 0,
      over48Hours: 0,
      unfinishedJobs: 0,
    },
  ];

  const stats = [
    {
      title: "Total Tickets",
      value: ticketSummary.total,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Selesai",
      value: ticketSummary.done,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: ticketSummary.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Over 48 Jam",
      value: ticketSummary.over48,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Ticket</h1>
        <p className="text-muted-foreground">
          Overview of ticket performance and PIC statistics
        </p>
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
        {categoryStats.map((category, index) => (
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
                {picPerformance.map((pic, index) => (
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
