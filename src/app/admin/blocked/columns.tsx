"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatDistance } from "date-fns";
import { updateUserStatus } from "@/app/actions/admin";
import { toast } from "sonner";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "blockReason",
    header: "Block Reason",
    cell: ({ row }) => {
      const reason = row.getValue("blockReason") as string;
      return reason || "No reason provided";
    },
  },
  {
    accessorKey: "blockedAt",
    header: "Blocked Date",
    cell: ({ row }) => {
      const date = row.getValue("blockedAt") as Date;
      return date
        ? formatDistance(new Date(date), new Date(), { addSuffix: true })
        : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      const handleUnblock = async () => {
        try {
          await updateUserStatus(user.id, "ACTIVE");
          toast.success("User has been unblocked");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          toast.error("Failed to unblock user");
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
            <DropdownMenuItem onClick={handleUnblock}>
              Unblock User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
