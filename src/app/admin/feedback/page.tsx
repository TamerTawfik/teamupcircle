import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getFeedback } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function FeedbackPage() {
  const { feedbacks, statusCounts } = await getFeedback();

  const statCards = [
    {
      title: "Total Feedback",
      value: feedbacks.length,
      icon: MessageSquare,
      description: "Total feedback received",
    },
    {
      title: "Pending Review",
      value: statusCounts.PENDING,
      icon: Clock,
      description: "Awaiting review",
    },
    {
      title: "Resolved",
      value: statusCounts.RESOLVED,
      icon: CheckCircle,
      description: "Successfully resolved",
    },
    {
      title: "Rejected",
      value: statusCounts.REJECTED,
      icon: XCircle,
      description: "Marked as rejected",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Feedback Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
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

      <DataTable columns={columns} data={feedbacks} />
    </div>
  );
}
