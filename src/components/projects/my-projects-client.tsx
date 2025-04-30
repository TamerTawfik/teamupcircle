"use client";

import React, { useState } from "react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ProjectDetailsDrawer } from "./project-details-drawer";
import { ProjectCard, type ProjectCardData } from "./project-card";

export type ProjectWithOwnerAndCount = ProjectCardData;

interface MyProjectsClientProps {
  projects: ProjectWithOwnerAndCount[];
  userId: string;
}

export function MyProjectsClient({ projects, userId }: MyProjectsClientProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithOwnerAndCount | null>(null);

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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
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
