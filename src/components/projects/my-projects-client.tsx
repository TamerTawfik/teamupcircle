"use client";

import React, { useState, useTransition } from "react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ProjectDetailsDrawer } from "./project-details-drawer";
import { ProjectCard, type ProjectCardData } from "./project-card";
import {
  ProjectJoinRequests,
  type ProjectJoinRequestWithDetails,
} from "@/components/projects/project-join-requests";
import {
  acceptJoinRequest,
  declineJoinRequest,
} from "@/app/actions/collaboration";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { XIcon, FilterIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type ProjectWithOwnerAndCount = ProjectCardData;

export interface MyProjectsClientProps {
  projects: ProjectWithOwnerAndCount[];
  userId: string;
  pendingJoinRequests: ProjectJoinRequestWithDetails[];
  availableRoles: string[];
  currentRoles: string[];
  basePath: string;
}

// Mimic a single project card skeleton
const CardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex space-x-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-24" />
    </div>
  </div>
);

export function MyProjectsClient({
  projects: initialProjects,
  userId,
  pendingJoinRequests: initialPendingRequests,
  availableRoles,
  currentRoles,
  basePath,
}: MyProjectsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithOwnerAndCount | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState(initialProjects);
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests
  );

  const [isPending, startTransition] = useTransition();

  // State for currently selected filters in the UI before applying/navigating
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);
  const [showFilters, setShowFilters] = useState(false);

  const handleProjectClick = (project: ProjectWithOwnerAndCount) => {
    setSelectedProject(project);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  const onAcceptRequest = (projectMemberId: string) => {
    startTransition(async () => {
      const result = await acceptJoinRequest(projectMemberId);
      if (result.success) {
        toast.success(result.success);
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== projectMemberId)
        );
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const onDeclineRequest = (projectMemberId: string) => {
    startTransition(async () => {
      const result = await declineJoinRequest(projectMemberId);
      if (result.success) {
        toast.success(result.success);
        setPendingRequests((prev) =>
          prev.filter((req) => req.id !== projectMemberId)
        );
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setSelectedRoles((prev) =>
      checked ? [...prev, role] : prev.filter((r) => r !== role)
    );
  };

  // Function to apply filters and update URL
  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (selectedRoles.length > 0) {
        params.set("requiredRoles", selectedRoles.join(","));
      } else {
        params.delete("requiredRoles");
      }

      router.push(`${basePath}?${params.toString()}`, { scroll: false });
      setShowFilters(false);
    });
  };

  // Function to reset filters
  const resetFilters = () => {
    startTransition(() => {
      setSelectedRoles([]);
      const params = new URLSearchParams(searchParams);
      params.delete("requiredRoles");
      router.push(`${basePath}?${params.toString()}`, { scroll: false });
      setShowFilters(false);
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
        <div className="flex justify-end mb-4 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            disabled={isPending}
          >
            <FilterIcon className="mr-2 h-4 w-4" /> Filter{" "}
            {showFilters ? "Hide" : "Show"}
          </Button>
        </div>

        {showFilters && (
          <fieldset
            disabled={isPending}
            className="mb-8 p-6 border rounded-lg bg-card text-card-foreground shadow"
          >
            <legend className="sr-only">Project Filters</legend>
            <h3 className="text-lg font-semibold mb-4">Filter Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <Label className="font-medium mb-2 block">Required Roles</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                  {availableRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={(checked: CheckedState) =>
                          handleRoleChange(role, !!checked)
                        }
                      />
                      <Label
                        htmlFor={`role-${role}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {role}
                      </Label>
                    </div>
                  ))}
                  {availableRoles.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No roles specified in projects.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={resetFilters}
                disabled={isPending || selectedRoles.length === 0}
              >
                <XIcon className="mr-2 h-4 w-4" /> Reset
              </Button>
              <Button onClick={applyFilters} disabled={isPending}>
                Apply Filters
              </Button>
            </div>
          </fieldset>
        )}

        {pendingRequests && pendingRequests.length > 0 && (
          <div className="mb-8">
            <ProjectJoinRequests
              requests={pendingRequests}
              onAccept={onAcceptRequest}
              onDecline={onDeclineRequest}
              isProcessing={isPending}
            />
          </div>
        )}

        {isPending ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : initialProjects.length === 0 &&
          !searchParams.has("requiredRoles") ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h2 className="text-xl font-medium mb-2">No Projects Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a project to start collaborating with others.
            </p>
            <CreateProjectModal />
          </div>
        ) : initialProjects.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h2 className="text-xl font-medium mb-2">No Projects Found</h2>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialProjects.map((project) => {
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  userId={userId}
                  onClick={() => handleProjectClick(project)}
                />
              );
            })}
          </div>
        )}

        <ProjectDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          project={selectedProject}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
