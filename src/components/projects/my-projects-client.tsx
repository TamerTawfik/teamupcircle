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

export type ProjectWithOwnerAndCount = ProjectCardData;

interface MyProjectsClientProps {
  projects: ProjectWithOwnerAndCount[];
  userId: string;
  pendingJoinRequests: ProjectJoinRequestWithDetails[];
}

export function MyProjectsClient({
  projects: initialProjects,
  userId,
  pendingJoinRequests: initialPendingRequests,
}: MyProjectsClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithOwnerAndCount | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projects, setProjects] = useState(initialProjects);
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests
  );

  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
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

        <h2 className="text-lg font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h2 className="text-xl font-medium mb-2">No Projects Yet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create a project to start collaborating with others.
            </p>
            <CreateProjectModal />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
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
