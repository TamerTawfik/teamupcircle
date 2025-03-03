"use client";

import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteMessage } from "@/app/actions/messages";
import { MoreHorizontal, Trash } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
  isSender: boolean;
}

export function MessageItem({ message, isSender }: MessageItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(() => {
      deleteMessage(message.id);
    });
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {!isSender && (
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={message.sender?.image || ""}
            alt={message.sender?.name || ""}
          />
          <AvatarFallback>
            {message.sender?.name?.charAt(0) ||
              message.sender?.username?.charAt(0) ||
              "U"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {!isSender && (
            <span className="text-sm font-medium">
              {message.sender?.name || message.sender?.username || "User"}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created), {
              addSuffix: true,
            })}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSender ? "end" : "start"}>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isPending}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className={cn(
            "max-w-md rounded-lg p-3",
            isSender ? "bg-primary text-primary-foreground" : "bg-muted"
          )}
        >
          <p>{message.text}</p>
        </div>

        {message.dateRead && isSender && (
          <span className="text-xs text-muted-foreground self-end mt-1">
            Read
          </span>
        )}
      </div>
    </div>
  );
}
