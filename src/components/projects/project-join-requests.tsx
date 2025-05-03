"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react"; // Import Loader icon

// Define the shape of a single join request passed from the server
export type ProjectJoinRequestWithDetails = {
  id: string; // This is the ProjectMember ID
  projectId: string;
  projectName: string;
  requesterId: string;
  requesterName: string;
  requesterUsername: string; // Ensure username is available for linking
  requesterImage: string | null;
  requestedAt: Date;
};

interface ProjectJoinRequestsProps {
  requests: ProjectJoinRequestWithDetails[];
  onAccept: (projectMemberId: string) => void; // Callback for accept
  onDecline: (projectMemberId: string) => void; // Callback for decline
  isProcessing: boolean; // Loading state for buttons
}

export function ProjectJoinRequests({
  requests,
  onAccept,
  onDecline,
  isProcessing,
}: ProjectJoinRequestsProps) {
  if (!requests || requests.length === 0) {
    return null; // Don't render anything if there are no requests
  }

  // No need for local handlers anymore, use props directly
  // const handleAccept = ...
  // const handleDecline = ...

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Join Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-3 border rounded-md bg-background"
          >
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={request.requesterImage ?? undefined}
                  alt={request.requesterName}
                />
                <AvatarFallback>
                  {request.requesterName?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  <Link
                    href={`/users/${request.requesterUsername}`}
                    className="hover:underline"
                  >
                    {request.requesterName} (@{request.requesterUsername})
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  Wants to join{" "}
                  <Badge variant="secondary">{request.projectName}</Badge>
                  {" - "}
                  {formatDistanceToNow(new Date(request.requestedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline(request.id)}
                disabled={isProcessing} // Disable if any action is processing
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(request.id)}
                disabled={isProcessing} // Disable if any action is processing
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Accept
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
