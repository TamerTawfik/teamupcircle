"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Feedback, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatDistance } from "date-fns";
import { updateFeedbackStatus } from "@/app/actions/admin";
import { toast } from "sonner";
import Link from "next/link";
type FeedbackWithUser = Feedback & {
  user: User | null;
};

export const columns: ColumnDef<FeedbackWithUser>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.getValue("user") as User | null;
      return user ? user.email : row.original.userEmail || "Anonymous";
    },
  },
  {
    accessorKey: "content",
    header: "Feedback",
    cell: ({ row }) => {
      const content = row.getValue("content") as string;
      return <div className="max-w-[500px] truncate">{content}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        PENDING: "default",
        REVIEWED: "secondary",
        RESOLVED: "success",
        REJECTED: "destructive",
      };
      return (
        <Badge
          variant={
            variants[status as keyof typeof variants] as
              | "destructive"
              | "default"
              | "secondary"
              | "outline"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return formatDistance(date, new Date(), { addSuffix: true });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const feedback = row.original;

      const handleStatusUpdate = async (status: string) => {
        try {
          await updateFeedbackStatus(feedback.id, status);
          toast.success("Feedback status updated successfully");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("Failed to update feedback status");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href={`/admin/feedback/${feedback.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("REVIEWED")}>
              Mark as Reviewed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("RESOLVED")}>
              Mark as Resolved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate("REJECTED")}>
              Reject Feedback
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
