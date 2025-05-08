"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateProjectForm from "./create-project-form";
import { PlusCircle } from "lucide-react";

export function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Share your project idea and find collaborators. Import from GitHub.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CreateProjectForm onFormSuccess={handleFormSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
