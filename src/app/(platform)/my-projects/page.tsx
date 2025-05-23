"use server";

import React from "react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProjectMembershipStatus, Prisma } from "@prisma/client";
import {
  MyProjectsClient,
  type ProjectWithOwnerAndCount,
} from "@/components/projects/my-projects-client";
import { getProjectDetailsFromGitHub } from "@/app/actions/projects";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ProjectJoinRequestWithDetails } from "@/components/projects/project-join-requests";

export default async function MyProjectsPage(props: {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Please log in to view your projects.</p>
      </div>
    );
  }

  const userId = session.user.id;

  // Parse search params
  const searchParams = await props.searchParams;
  const selectedRoles =
    searchParams?.requiredRoles?.split(",").filter(Boolean) ?? [];

  // --- Fetch distinct roles for filter options ---
  const allProjectsForFilters = await prisma.project.findMany({
    select: {
      requiredRoles: true,
    },
  });

  // Aggregate unique roles
  const uniqueRoles = [
    ...new Set(allProjectsForFilters.flatMap((p) => p.requiredRoles || [])),
  ].sort();
  // --- End fetching distinct filters ---

  // --- Build the Prisma where clause based on filters ---
  const whereClause: Prisma.ProjectWhereInput = {};

  if (selectedRoles.length > 0) {
    whereClause.requiredRoles = { hasSome: selectedRoles };
  }
  // --- End building where clause ---

  // Fetch owned projects and their pending join requests
  const pendingJoinRequestsRaw = await prisma.projectMember.findMany({
    where: {
      project: {
        ownerId: userId, // Only requests for projects owned by the current user
      },
      status: ProjectMembershipStatus.PENDING, // Only pending requests
    },
    include: {
      user: {
        // Include details of the user requesting to join
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      project: {
        // Include minimal project details
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc", // Show oldest requests first
    },
  });

  // Map to the desired structure, ensuring username is available for linking
  const pendingJoinRequests: ProjectJoinRequestWithDetails[] =
    pendingJoinRequestsRaw.map((req) => ({
      id: req.id, // projectMemberId
      projectId: req.projectId,
      projectName: req.project.name,
      requesterId: req.user.id,
      requesterName: req.user.name ?? "Unknown User",
      requesterUsername: req.user.username ?? req.user.id, // Fallback to ID if username is null
      requesterImage: req.user.image,
      requestedAt: req.createdAt,
    }));

  const initialProjects = await prisma.project.findMany({
    where: {
      // Combine user-specific and filter conditions with AND
      AND: [
        {
          // User must own or be an accepted member
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
        whereClause, // Apply the role filters from searchParams
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
      <MyProjectsClient
        projects={projectsWithGithubData}
        userId={userId}
        pendingJoinRequests={pendingJoinRequests}
        availableRoles={uniqueRoles}
        currentRoles={selectedRoles}
        basePath="/my-projects"
      />
    </>
  );
}
