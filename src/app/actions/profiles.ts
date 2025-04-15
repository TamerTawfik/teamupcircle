/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { auth } from "@/auth";
import { AvailabilityStatus, TeamSize, User, CollaborationStyle, Tech, ProjectDomain, TeamRole } from "@prisma/client";

// Define a type for the filters
export type ProfileFilters = {
  name?: string;
  location?: string;
  username?: string;
  techStack?: string[];
  availabilityStatus?: AvailabilityStatus;
  teamSize?: TeamSize;
  projectDomains?: string[];
  teamRoles?: string[];
  hoursPerWeek?: number;
};

// Default page size
const DEFAULT_PAGE_SIZE = 12; // Adjust as needed

// Define the type for the profile including the collaboration style with relations
export type ProfileWithCollaboration = User & {
  collaborationStyles: (CollaborationStyle & {
    techs: Tech[];
    projectDomains: ProjectDomain[];
    teamRoles: TeamRole[];
  }) | null; // Make sure this matches your data structure
};

export const getProfiles = cache(
  async ({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    filters = {},
  }: {
    page?: number;
    limit?: number;
    filters?: ProfileFilters;
  } = {}) => {
    const session = await auth();

    // Build the WHERE clause for Prisma based on filters
    const whereClause: any = {
      NOT: {
        id: session?.user?.id, // Exclude the current user
      },
    };

    // String filters remain case-insensitive via 'mode'
    if (filters.name) {
      whereClause.name = { contains: filters.name, mode: "insensitive" };
    }
    if (filters.location) {
      whereClause.location = { contains: filters.location, mode: "insensitive" };
    }
    if (filters.username) {
      whereClause.username = { contains: filters.username, mode: "insensitive" };
    }

    // --- Collaboration style filters ---
    const collaborationStyleWhere: any = {};

    // Filter by related Tech names (case-insensitive)
    if (filters.techStack && filters.techStack.length > 0) {
      collaborationStyleWhere.techs = {
        some: {
          name: {
            in: filters.techStack,
            mode: "insensitive", // Case-insensitive matching for tech names
          },
        },
      };
    }

    // Filter by related ProjectDomain names (case-insensitive)
    if (filters.projectDomains && filters.projectDomains.length > 0) {
      collaborationStyleWhere.projectDomains = {
        some: {
          name: {
            in: filters.projectDomains,
            mode: "insensitive", // Case-insensitive matching
          },
        },
      };
    }

     // Filter by related TeamRole names (case-insensitive)
    if (filters.teamRoles && filters.teamRoles.length > 0) {
      collaborationStyleWhere.teamRoles = {
        some: {
          name: {
            in: filters.teamRoles,
            mode: "insensitive", // Case-insensitive matching
          },
        },
      };
    }

    // Other collaboration filters
    if (filters.availabilityStatus) {
      collaborationStyleWhere.availabilityStatus = filters.availabilityStatus;
    }
    if (filters.teamSize) {
      collaborationStyleWhere.teamSize = filters.teamSize;
    }
    if (filters.hoursPerWeek !== undefined) {
      collaborationStyleWhere.hoursPerWeek = { gte: filters.hoursPerWeek };
    }

    // Add collaboration style filters only if they exist
    if (Object.keys(collaborationStyleWhere).length > 0) {
      whereClause.collaborationStyles = collaborationStyleWhere;
    }
    // --- End Collaboration style filters ---


    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch total count matching filters (before pagination)
    const totalCount = await prisma.user.count({ where: whereClause });

    // Fetch paginated and filtered users, ensuring all needed fields are selected
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        collaborationStyles: { // Include collaboration styles with their relations
            include: {
                techs: true,
                projectDomains: true,
                teamRoles: true,
            }
        },
        // Ensure all necessary fields like name, username, image, location etc. are included by default or explicitly selected if needed
      },

      orderBy: {
        createdAt: "desc", // Or any other desired sorting
      },
      skip: skip,
      take: limit,
    });


    // Cast the result to the more specific type
    return { profiles: users as ProfileWithCollaboration[], totalCount };
  }
);