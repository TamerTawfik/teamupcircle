/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NotificationType, ProjectMembershipStatus } from '@prisma/client';

// Define state shape for useFormState
export type JoinProjectState = {
  error?: string;
  success?: string;
};

export async function requestToJoinProject(
    projectId: string, 
    prevState: JoinProjectState, 
    formData: FormData 
): Promise<JoinProjectState> {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: 'Unauthorized: You must be logged in to request joining.' };
    }

    const userId = session.user.id;

    // Validate Project ID
    if (!projectId || typeof projectId !== 'string') {
        return { error: 'Invalid project ID.' };
    }

    try {
        // Find the project and its owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true, name: true }
        });

        if (!project) {
            return { error: 'Project not found.' };
        }

        const ownerId = project.ownerId;

        // Check if user is the owner
        if (userId === ownerId) {
            return { error: 'You cannot request to join your own project.' };
        }

        // Check if the user has already requested or is a member
        const existingMembership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: { userId, projectId }
            }
        });

        if (existingMembership) {
            switch (existingMembership.status) {
                case ProjectMembershipStatus.PENDING:
                    return { success: 'Your request to join is already pending approval.' };
                case ProjectMembershipStatus.ACCEPTED:
                    return { success: 'You are already a member of this project.' };
                case ProjectMembershipStatus.REJECTED:
                    
                    console.log(`User ${userId} re-requesting after being rejected from project ${projectId}`);
                    break;
                case ProjectMembershipStatus.REMOVED:
                case ProjectMembershipStatus.LEFT:
                     console.log(`User ${userId} re-requesting after being removed/left project ${projectId}`);
                     
                     break;
            }
        }

        // --- Create or Update Membership Request --- 
        // Upsert: Create if not exist, or update if previously REJECTED/REMOVED/LEFT
        // This ensures we don't create duplicate entries if they re-apply
        const membership = await prisma.projectMember.upsert({
             where: {
                userId_projectId: { userId, projectId }
             },
             update: {
                 status: ProjectMembershipStatus.PENDING // Update status if they re-apply
             },
             create: {
                 userId: userId,
                 projectId: projectId,
                 status: ProjectMembershipStatus.PENDING
             }
        });

        // Check if a notification needs to be sent (e.g., avoid sending if they just got accepted)
        //  send notification whenever upsert results in PENDING status
        if (membership.status === ProjectMembershipStatus.PENDING) {
            // Check if an active notification already exists for this specific request to avoid duplicates
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId: ownerId,
                    type: NotificationType.PROJECT_JOIN_REQUEST,
                    read: false, // Only consider unread notifications
                    metadata: {
                        path: ['projectId', 'senderId'],
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        equals: { projectId: projectId, senderId: userId } as any, 
                    },
                }
            });

            if (!existingNotification) {
                 // Create notification for the project owner
                await prisma.notification.create({
                    data: {
                        userId: ownerId, 
                        type: NotificationType.PROJECT_JOIN_REQUEST, 
                        message: `User ${session.user.name || session.user.username || userId} requested to join your project "${project.name}".`,
                        metadata: {
                            projectId: projectId,
                            projectMemberId: membership.id, 
                            senderId: userId,
                            senderName: session.user.name || session.user.username,
                            senderImage: session.user.image
                        }
                    }
                });
                
            } else {
                 console.log("Existing unread join request notification found, not sending another.");
            }
         }

        return { success: 'Your request to join has been sent to the project owner.' };

    } catch (error) {
        console.error("Error requesting to join project:", error);
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
 