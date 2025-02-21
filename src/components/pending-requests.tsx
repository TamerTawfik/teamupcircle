"use client";

import { useState } from "react";
import { Connection } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { bulkRespondToRequests } from "@/app/actions/connections";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface PendingRequestsProps {
  sent: Array<
    Connection & {
      receiver: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
      };
    }
  >;
  received: Array<
    Connection & {
      sender: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
      };
    }
  >;
}

export function PendingRequests({ sent, received }: PendingRequestsProps) {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (accept: boolean) => {
    if (selectedRequests.length === 0) return;

    setIsProcessing(true);
    try {
      const result = await bulkRespondToRequests(selectedRequests, accept);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `${selectedRequests.length} request${
            selectedRequests.length === 1 ? "" : "s"
          } ${accept ? "accepted" : "declined"}`
        );
        setSelectedRequests([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to process requests");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {received.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedRequests.length > 0 && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => handleBulkAction(true)}
                  disabled={isProcessing}
                  size="sm"
                >
                  Accept Selected
                </Button>
                <Button
                  onClick={() => handleBulkAction(false)}
                  variant="secondary"
                  disabled={isProcessing}
                  size="sm"
                >
                  Decline Selected
                </Button>
              </div>
            )}

            {received.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <Checkbox
                  checked={selectedRequests.includes(request.id)}
                  onCheckedChange={(checked) => {
                    setSelectedRequests(
                      checked
                        ? [...selectedRequests, request.id]
                        : selectedRequests.filter((id) => id !== request.id)
                    );
                  }}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={request.sender.image || undefined}
                    alt={request.sender.name || "User"}
                  />
                  <AvatarFallback>
                    {request.sender.name?.[0] ||
                      request.sender.username?.[0] ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/${request.sender.username}`}>
                  <span className="flex-1 font-medium">
                    {request.sender.name || request.sender.username}
                  </span>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sent Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={request.receiver.image || undefined}
                    alt={request.receiver.name || "User"}
                  />
                  <AvatarFallback>
                    {request.receiver.name?.[0] ||
                      request.receiver.username?.[0] ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <Link href={`/${request.receiver.username}`}>
                  <span className="flex-1 font-medium">
                    {request.receiver.name || request.receiver.username}
                  </span>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {received.length === 0 && sent.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No pending requests
          </CardContent>
        </Card>
      )}
    </div>
  );
}
