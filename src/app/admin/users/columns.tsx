/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@prisma/client";
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
import { updateUserStatus, deleteUser } from "@/app/actions/admin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

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
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={role === "ADMIN" ? "destructive" : "secondary"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "BLOCKED" ? "destructive" : "default"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Join Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return formatDistance(date, new Date(), { addSuffix: true });
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const [isOpen, setIsOpen] = useState(false);
      const [blockReason, setBlockReason] = useState("");

      const handleStatusUpdate = async (status: "ACTIVE" | "BLOCKED") => {
        try {
          if (status === "BLOCKED" && !blockReason.trim()) {
            toast.error("Please provide a reason for blocking the user");
            return;
          }

          await updateUserStatus(user.id, status, blockReason);
          toast.success(
            status === "BLOCKED"
              ? "User has been blocked"
              : "User has been unblocked"
          );
          setIsOpen(false);
          setBlockReason("");
        } catch (error) {
          toast.error("Failed to update user status");
        }
      };

      const handleDelete = async () => {
        try {
          await deleteUser(user.id);
          toast.success("User has been deleted");
        } catch (error) {
          toast.error("Failed to delete user");
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user.status === "BLOCKED" ? (
                <DropdownMenuItem onClick={() => handleStatusUpdate("ACTIVE")}>
                  Unblock User
                </DropdownMenuItem>
              ) : (
                <DialogTrigger asChild>
                  <DropdownMenuItem>Block User</DropdownMenuItem>
                </DialogTrigger>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block User</DialogTitle>
              <DialogDescription>
                Please provide a reason for blocking this user. This will be
                recorded for administrative purposes.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Enter the reason for blocking..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setBlockReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate("BLOCKED")}
              >
                Block User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
