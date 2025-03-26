"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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