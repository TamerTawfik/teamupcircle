import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle,
  Globe,
  Monitor,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { updateFeedbackStatus } from "@/app/actions/admin";

export default async function FeedbackDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const feedback = await prisma.feedback.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!feedback) {
    notFound();
  }

  const statusVariants = {
    PENDING: "default",
    REVIEWED: "secondary",
    RESOLVED: "success",
    REJECTED: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/feedback">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Feedback Details</h1>
        </div>
        <Badge
          variant={
            statusVariants[feedback.status] as
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
          }
        >
          {feedback.status}
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {feedback.user
                  ? feedback.user.email
                  : feedback.userEmail || "Anonymous"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Submitted{" "}
                {formatDistance(new Date(feedback.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Message</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {feedback.content}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.pageUrl && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Page URL:</span>
                <a
                  href={feedback.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {feedback.pageUrl}
                </a>
              </div>
            )}
            {feedback.userAgent && (
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">User Agent:</span>
                <span className="text-muted-foreground">
                  {feedback.userAgent}
                </span>
              </div>
            )}
            {feedback.ipAddress && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">IP Address:</span>
                <span className="text-muted-foreground">
                  {feedback.ipAddress}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-4">
            <form
              action={async () => {
                "use server";
                await updateFeedbackStatus(feedback.id, "REVIEWED");
              }}
            >
              <Button variant="outline">Mark as Reviewed</Button>
            </form>
            <form
              action={async () => {
                "use server";
                await updateFeedbackStatus(feedback.id, "RESOLVED");
              }}
            >
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Feedback
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
