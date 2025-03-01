"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection,
} from "@/app/actions/connections";
import { Connection, ConnectionStatus } from "@prisma/client";
import { MoreHorizontal, UserPlus, UserMinus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ConnectButtonProps {
  targetUserId: string;
  connection: Connection | null;
  onUpdate?: () => void;
}

export function ConnectButton({
  targetUserId,
  connection,
  onUpdate,
}: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const result = await sendConnectionRequest(targetUserId);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Connect Error",
          description: result.error as string,
        });
      } else {
        toast({
          title: "Connect success",
          description: "Connection request sent",
        });
        onUpdate?.();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connect Error",
        description: "Failed to send connection request this error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (accept: boolean) => {
    if (!connection) return;

    setIsLoading(true);
    try {
      const result = await respondToConnectionRequest(connection.id, accept);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Connect Error",
          description: result.error as string,
        });
      } else if (accept) {
        toast({
          title: "Connect success",
          description: "Connection accepted",
        });
        onUpdate?.();
      } else {
        toast({
          variant: "destructive",
          title: "Connect Error",
          description: "Connection declined",
        });
        onUpdate?.();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connect Error",
        description: "Failed to respond to connection request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!connection) return;

    setIsLoading(true);
    try {
      const result = await removeConnection(connection.id);
      if (result.error) {
        toast({ title: "Error", description: result.error as string });
      } else {
        toast({ title: "success", description: "Connection removed" });
        onUpdate?.();
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove connection" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!connection) {
    return (
      <Button
        size="sm"
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Connect
      </Button>
    );
  }

  switch (connection.status) {
    case ConnectionStatus.PENDING:
      if (connection.receiverId === targetUserId) {
        return (
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
        );
      }
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleResponse(true)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Accept
          </Button>
          <Button
            size="sm"
            onClick={() => handleResponse(false)}
            variant="secondary"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Decline
          </Button>
        </div>
      );

    case ConnectionStatus.ACCEPTED:
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "w-full sm:w-auto",
                isLoading && "cursor-not-allowed opacity-50"
              )}
              disabled={isLoading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Connected
              <MoreHorizontal className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <UserMinus className="mr-2 h-4 w-4" />
              <Link href={`/messages/${targetUserId}`}>Message</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-destructive focus:text-destructive"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Connection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    default:
      return (
        <Button
          size="sm"
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Connect
        </Button>
      );
  }
}
