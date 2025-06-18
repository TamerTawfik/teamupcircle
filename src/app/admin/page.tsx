import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/admin";
import {
  Users,
  Ban,
  MessageSquare,
  FolderGit2,
  UsersRound,
  Group,
} from "lucide-react";

export default async function AdminDashboard() {
  const {
    totalUsers,
    blockedUsers,
    totalFeedback,
    totalProjects,
    totalConnections,
    multiMemberProjects,
  } = await getDashboardStats();

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "Total registered users",
    },
    {
      title: "Blocked Users",
      value: blockedUsers,
      icon: Ban,
      description: "Currently blocked users",
    },
    {
      title: "Feedback Items",
      value: totalFeedback,
      icon: MessageSquare,
      description: "Total feedback received",
    },
    {
      title: "Total Projects",
      value: totalProjects,
      icon: FolderGit2,
      description: "Total projects created",
    },
    {
      title: "Active Connections",
      value: totalConnections,
      icon: UsersRound,
      description: "Total accepted user connections",
    },
    {
      title: "Multi-Member Projects",
      value: multiMemberProjects,
      icon: Group,
      description: "Projects with >1 accepted member",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
