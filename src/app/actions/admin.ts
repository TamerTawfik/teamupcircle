"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ConnectionStatus, ProjectMembershipStatus } from "@prisma/client";

export async function updateUserStatus(id: string, status: "ACTIVE" | "BLOCKED", reason?: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        status,
        blockedAt: status === "BLOCKED" ? new Date() : null,
        blockReason: status === "BLOCKED" ? reason : null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update user status");
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function updateFeedbackStatus(id: string, status: string) {
    try {
      await prisma.feedback.update({
        where: { id },
        data: {
          status: status as "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED",
        },
      });
  
      revalidatePath("/admin/feedback");
      return { success: true };
    } catch (error) {
      console.error("Error updating feedback status:", error);
      throw new Error("Failed to update feedback status");
    }
  }

export async function getDashboardStats() {
  try {
    const [
      totalUsers,
      blockedUsers,
      totalFeedback,
      totalProjects,
      totalConnections,
      multiMemberProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "BLOCKED" } }),
      prisma.feedback.count(),
      prisma.project.count(),
      prisma.connection.count({ where: { status: ConnectionStatus.ACCEPTED } }),
      prisma.project.count({
        where: {
          members: { some: { status: ProjectMembershipStatus.ACCEPTED } },
        },
      }),
    ]);

    return {
      totalUsers,
      blockedUsers,
      totalFeedback,
      totalProjects,
      totalConnections,
      multiMemberProjects,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

export async function getFeedback() {
  try {
    const [feedbacks, stats] = await Promise.all([
      prisma.feedback.findMany({
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.feedback.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const statusCounts = {
      PENDING: 0,
      REVIEWED: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat.status] = stat._count;
    });

    return { feedbacks, statusCounts };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error("Failed to fetch feedback");
  }
}

export async function getBlockedUsers() {
  try {
    const blockedUsers = await prisma.user.findMany({
      where: {
        status: "BLOCKED",
      },
      orderBy: {
        blockedAt: "desc",
      },
    });
    return blockedUsers;
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    throw new Error("Failed to fetch blocked users");
  }
}