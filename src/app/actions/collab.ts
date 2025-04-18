'use server';

import { PrismaClient, CollaborationStyle, Prisma, AvailabilityStatus, TeamSize } from "@prisma/client";
// Assuming your auth setup is exported from `@/auth` as per common NextAuth.js v5 patterns
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const db = new PrismaClient();

// Define Zod schema for validation
const CollaborationStyleSchema = z.object({
    availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
    hoursPerWeek: z.number().int().min(0).max(168).nullable().optional(),
    teamSize: z.nativeEnum(TeamSize).optional(),
    techIds: z.array(z.string()).optional(),       // Array of Tech IDs
    projectDomainIds: z.array(z.string()).optional(), // Array of ProjectDomain IDs
    teamRoleIds: z.array(z.string()).optional(),    // Array of TeamRole IDs
});

export type CollaborationStyleInput = z.infer<typeof CollaborationStyleSchema>;

async function getCurrentUserId(): Promise<string> {
    const session = await auth(); // Use the imported auth handler
    if (!session?.user?.id) {
        throw new Error("User not authenticated");
    }
    return session.user.id;
}

// change this to get the current user's collaboration style by username instead of id ***important***
// Get the current user's collaboration style
export async function getCollaborationStyle(userId: string): Promise<(CollaborationStyle & { techs: { id: string, name: string }[], projectDomains: { id: string, name: string }[], teamRoles: { id: string, name: string }[] }) | null> {
    try {
        // const userId = await getCurrentUserId();
        const style = await db.collaborationStyle.findUnique({
            where: { userId },
            include: {
                techs: { select: { id: true, name: true } },
                projectDomains: { select: { id: true, name: true } },
                teamRoles: { select: { id: true, name: true } },
            },
        });
        // Type assertion might be needed if Prisma's inferred type isn't specific enough
        return style as (CollaborationStyle & { techs: { id: string, name: string }[], projectDomains: { id: string, name: string }[], teamRoles: { id: string, name: string }[] }) | null;
    } catch (error) {
        console.error("Failed to get collaboration style:", error);
        return null;
    }
}

// Create or update collaboration style
export async function upsertCollaborationStyle(
    data: CollaborationStyleInput
): Promise<{ success: boolean; data?: CollaborationStyle; error?: string }> {
    try {
        const userId = await getCurrentUserId();

        // Validate input data
        const validatedData = CollaborationStyleSchema.parse(data);

        const { techIds, projectDomainIds, teamRoleIds, ...restData } = validatedData;

        // Prepare data specifically for update and create operations
        const updateData: Prisma.CollaborationStyleUpdateInput = {
            ...restData,
            // Ensure relations are updated correctly, disconnecting all if array is empty or undefined
            techs: techIds ? { set: techIds.map(id => ({ id })) } : { set: [] },
            projectDomains: projectDomainIds ? { set: projectDomainIds.map(id => ({ id })) } : { set: [] },
            teamRoles: teamRoleIds ? { set: teamRoleIds.map(id => ({ id })) } : { set: [] },
        };

        const createData: Prisma.CollaborationStyleCreateInput = {
            ...restData,
            user: { connect: { id: userId } },
            // Connect relations for creation
            techs: techIds ? { connect: techIds.map(id => ({ id })) } : undefined,
            projectDomains: projectDomainIds ? { connect: projectDomainIds.map(id => ({ id })) } : undefined,
            teamRoles: teamRoleIds ? { connect: teamRoleIds.map(id => ({ id })) } : undefined,
        };

        const result = await db.collaborationStyle.upsert({
            where: { userId },
            create: createData,
            update: updateData,
            include: {
                techs: true,
                projectDomains: true,
                teamRoles: true,
            }
        });

        // Revalidate relevant paths
        revalidatePath("/profile"); // Adjust path as needed
        revalidatePath("/"); // Revalidate home page if needed

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to upsert collaboration style:", error);
        if (error instanceof z.ZodError) {
            return { success: false, error: `Validation failed: ${error.errors.map(e => e.message).join(", ")}` };
        }
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
}


