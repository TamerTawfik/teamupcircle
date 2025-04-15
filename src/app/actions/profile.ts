"use server";

import { prisma } from "@/lib/prisma";
import { ProfileFormSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ProfileData = z.infer<typeof ProfileFormSchema>;

export async function updateProfile(userId: string, data: ProfileData) {
  try {
    const validatedData = ProfileFormSchema.parse(data);

    // Prepare connect/create objects for relations
    const techConnectOrCreate = validatedData.techStack.map((tech) => ({
      where: { name: tech.value.toLowerCase() },
      create: { name: tech.value.toLowerCase() },
    }));
    const roleConnectOrCreate = validatedData.teamRoles.map((role) => ({
      where: { name: role.value.toLowerCase() },
      create: { name: role.value.toLowerCase() },
    }));
    const domainConnectOrCreate = validatedData.projectDomains.map((domain) => ({
      where: { name: domain.value.toLowerCase() },
      create: { name: domain.value.toLowerCase() },
    }));

    await prisma.user.update({
      where: { id: userId },
      data: {
        collaborationStyles: {
          upsert: {
            create: {
              availabilityStatus: validatedData.availabilityStatus,
              hoursPerWeek: validatedData.hoursPerWeek,
              teamSize: validatedData.teamSize,
              techs: { connectOrCreate: techConnectOrCreate },
              teamRoles: { connectOrCreate: roleConnectOrCreate },
              projectDomains: { connectOrCreate: domainConnectOrCreate },
            },
            update: {
              availabilityStatus: validatedData.availabilityStatus,
              hoursPerWeek: validatedData.hoursPerWeek,
              teamSize: validatedData.teamSize,
              // Use 'set' to replace existing relations entirely
              techs: { set: [], connectOrCreate: techConnectOrCreate },
              teamRoles: { set: [], connectOrCreate: roleConnectOrCreate },
              projectDomains: { set: [], connectOrCreate: domainConnectOrCreate },
            },
          },
        },
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    // Consider more specific error handling or logging
    if (error instanceof z.ZodError) {
        return { error: "Validation failed: " + error.errors.map(e => e.message).join(', ') };
    }
    return { error: "Failed to update profile" };
  }
}