/* eslint-disable @typescript-eslint/no-unused-vars */

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
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the shape of our project data, including the nested owner
export type ProjectAdminView = {
  id: string;
  name: string;
  githubRepoUrl: string | null;
  isBeginnerFriendly: boolean;
  createdAt: Date;
  owner: {
    name: string | null;
    email: string | null;
  };
  // Add other fields as needed, like tags, requiredRoles etc.
};

export const columns: ColumnDef<ProjectAdminView>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "owner.name", // Access nested data
    header: "Owner Name",
  },
  {
    accessorKey: "owner.email", // Access nested data
    header: "Owner Email",
  },
  {
    accessorKey: "githubRepoUrl",
    header: "GitHub URL",
    cell: ({ row }) => {
      const url = row.getValue("githubRepoUrl") as string | null;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {url}
        </a>
      ) : (
        <span>Not Provided</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString(); // Format date as needed
      return <div className="font-medium">{formatted}</div>;
    },
  },
  // Add more columns as needed (e.g., isBeginnerFriendly, Actions)
];
