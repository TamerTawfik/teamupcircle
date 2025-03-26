import { DataTable } from "./data-table";
import { columns } from "./columns";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban, Clock } from "lucide-react";
import { formatDistance } from "date-fns";

export default async function BlockedUsersPage() {
  const blockedUsers = await prisma.user.findMany({
    where: {
      status: "BLOCKED",
    },
    orderBy: {
      blockedAt: "desc",
    },
  });

  const stats = [
    {
      title: "Total Blocked",
      value: blockedUsers.length,
      icon: Ban,
      description: "Currently blocked users",
    },
    {
      title: "Most Recent Block",
      value: blockedUsers[0]?.blockedAt
        ? formatDistance(new Date(blockedUsers[0].blockedAt), new Date(), {
            addSuffix: true,
          })
        : "N/A",
      icon: Clock,
      description: "Last user blocked",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Blocked Users</h1>

      <div className="grid gap-4 md:grid-cols-2">
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

      <DataTable columns={columns} data={blockedUsers} />
    </div>
  );
}
