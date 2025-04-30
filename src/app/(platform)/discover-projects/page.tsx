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
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";

export default async function DiscoverProjectsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const initialProjects = await prisma.project.findMany({
    include: {
      owner: {
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
      {/* Add Header section */}
      <div className="flex justify-between items-center mb-8 mx-5 mt-4">
        <h1 className="text-xl font-bold">Discover Projects</h1>
        <Button disabled variant="outline">
          <FilterIcon className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
      <MyProjectsClient
        projects={projectsWithGithubData}
        userId={userId || ""}
      />
    </>
  );
}
