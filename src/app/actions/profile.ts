"use server";

import { prisma } from "@/lib/prisma";
import { ProfileFormSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ProfileData = z.infer<typeof ProfileFormSchema>;

export async function updateProfile(userId: string, data: ProfileData) {
  try {
    const validatedData = ProfileFormSchema.parse(data);

    await prisma.user.update({
      where: { id: userId },
      data: {
        collaborationStyles: {
          upsert: {
            create: {
              ...validatedData,
              techStack: validatedData.techStack.map((tech) => tech.value),
              teamRoles: validatedData.teamRoles.map((role) => role.value),
              projectDomains: validatedData.projectDomains.map((domain) => domain.value),
            },
            update: {
              ...validatedData,
              techStack: validatedData.techStack.map((tech) => tech.value),
              teamRoles: validatedData.teamRoles.map((role) => role.value),
              projectDomains: validatedData.projectDomains.map((domain) => domain.value),
            },
          },
        },
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile" };
  }
}