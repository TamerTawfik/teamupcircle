"use server";

import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectMembershipStatus } from "@prisma/client";
import {
  MyProjectsClient,
  type ProjectWithOwnerAndCount,
} from "@/components/projects/my-projects-client";
import { getProjectDetailsFromGitHub } from "@/app/actions/projects";
import { CreateProjectModal } from "@/components/projects/create-project-modal";

export default async function MyProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Please log in to view your projects.</p>
      </div>
    );
  }

  const userId = session.user.id;

  const initialProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
              status: ProjectMembershipStatus.ACCEPTED,
            },
          },
        },
      ],
    },
    include: {
      owner: {
        // Include owner details for display
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      _count: {
        select: {
          members: { where: { status: ProjectMembershipStatus.ACCEPTED } },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const projectsWithGithubData = await Promise.all(
    initialProjects.map(async (project) => {
      let githubDetails = null;
      if (project.githubRepoUrl) {
        try {
          githubDetails = await getProjectDetailsFromGitHub(
            project.githubRepoUrl
          );
          // Log errors from GitHub fetch, but don't block rendering
          if (githubDetails.error) {
            console.warn(
              `Could not fetch GitHub details for ${project.githubRepoUrl}: ${githubDetails.error}`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching GitHub details for ${project.githubRepoUrl}:`,
            error
          );
        }
      }

      // Merge GitHub data into the project object
      const enrichedProject: ProjectWithOwnerAndCount = {
        ...project,
        // Add GitHub fields, falling back to null if fetch failed or no URL
        stars: githubDetails?.stars ?? null,
        forks: githubDetails?.forksCount ?? null,
        openIssuesCount: githubDetails?.openIssuesCount ?? null,
        license: githubDetails?.license
          ? { name: githubDetails.license.name }
          : null,
      };
      return enrichedProject;
    })
  );

  return (
    <>
      <div className="flex justify-between items-center mb-8 mx-5 mt-4">
        <h1 className="text-xl font-bold">My Projects</h1>
        <CreateProjectModal />
      </div>
      <MyProjectsClient projects={projectsWithGithubData} userId={userId} />
    </>
  );
}
