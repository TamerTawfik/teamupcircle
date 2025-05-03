/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NotificationType, ProjectMembershipStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Define state shape for useFormState (Join Project)
export type JoinProjectState = {
  error?: string;
  success?: string;
};

// Define state shape for Accept/Decline actions
export type ManageJoinRequestState = {
  error?: string;
  success?: string;
  status?: ProjectMembershipStatus; // Optionally return the new status
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


// --- Action to Accept a Join Request ---
export async function acceptJoinRequest(
    projectMemberId: string
): Promise<ManageJoinRequestState> {
    const session = await auth();
    const ownerId = session?.user?.id;

    if (!ownerId) {
        return { error: 'Unauthorized: Must be logged in.' };
    }

    if (!projectMemberId) {
        return { error: 'Invalid request ID.' };
    }

    try {
        // 1. Find the membership request and verify the current user is the project owner
        const membership = await prisma.projectMember.findUnique({
            where: { id: projectMemberId },
            include: {
                project: { select: { ownerId: true, name: true } }, // Get project owner ID and name
                user: { select: { name: true, username: true, id: true } } // Get requester details
            }
        });

        if (!membership) {
            return { error: 'Join request not found.' };
        }

        if (membership.project.ownerId !== ownerId) {
            return { error: 'Forbidden: You are not the owner of this project.' };
        }

        if (membership.status !== ProjectMembershipStatus.PENDING) {
            return { error: `Request is no longer pending (current status: ${membership.status}).` };
        }

        // 2. Update the membership status to ACCEPTED
        const updatedMembership = await prisma.projectMember.update({
            where: { id: projectMemberId },
            data: { status: ProjectMembershipStatus.ACCEPTED },
        });

        // 3. Delete the pending notification for the owner
        // We  also send a notification to the *requester* that they've been accepted
        try {
            // Delete owner's notification
            await prisma.notification.deleteMany({
                where: {
                    type: NotificationType.PROJECT_JOIN_REQUEST,
                    userId: ownerId, // The project owner's notification
                    metadata: {
                        path: ['projectMemberId'],
                        equals: projectMemberId,
                    }
                }
            });

            // Send notification to the requester
            await prisma.notification.create({
                data: {
                    userId: membership.userId, // Send to the user who requested
                    type: NotificationType.PROJECT_JOIN_ACCEPTED,
                    message: `Your request to join project "${membership.project.name}" has been accepted.`,
                    metadata: {
                        projectId: membership.projectId,
                        projectName: membership.project.name,
                        // Add other relevant info if needed
                    }
                }
            });

        } catch (notificationError) {
            console.error("Failed to delete/create notification:", notificationError);
            // Don't fail the whole operation if notification handling fails
        }

        // 4. Revalidate the path to update the UI
        revalidatePath('/(platform)/my-projects');

        return {
            success: `Accepted join request for ${membership.user.name || membership.user.username}.`,
            status: updatedMembership.status
        };

    } catch (error) {
        console.error("Error accepting join request:", error);
        return { error: 'Database error: Failed to accept request.' };
    }
}

// --- Action to Decline a Join Request ---
export async function declineJoinRequest(
    projectMemberId: string
): Promise<ManageJoinRequestState> {
    const session = await auth();
    const ownerId = session?.user?.id;

    if (!ownerId) {
        return { error: 'Unauthorized: Must be logged in.' };
    }

    if (!projectMemberId) {
        return { error: 'Invalid request ID.' };
    }

    try {
        // 1. Find the membership request and verify ownership
        const membership = await prisma.projectMember.findUnique({
            where: { id: projectMemberId },
            include: {
                project: { select: { ownerId: true, name: true } }, // Get project owner ID and name
                user: { select: { name: true, username: true, id: true } } // Get requester details
            }
        });

        if (!membership) {
            return { error: 'Join request not found.' };
        }

        if (membership.project.ownerId !== ownerId) {
            return { error: 'Forbidden: You are not the owner of this project.' };
        }

        if (membership.status !== ProjectMembershipStatus.PENDING) {
            return { error: `Request is no longer pending (current status: ${membership.status}).` };
        }

        // 2. Update the membership status to REJECTED
        const updatedMembership = await prisma.projectMember.update({
            where: { id: projectMemberId },
            data: { status: ProjectMembershipStatus.REJECTED },
        });

        // 3. Delete the pending notification for the owner
        try {
             // Delete owner's notification
            await prisma.notification.deleteMany({
                where: {
                    type: NotificationType.PROJECT_JOIN_REQUEST,
                    userId: ownerId, // The project owner's notification
                    metadata: {
                        path: ['projectMemberId'],
                        equals: projectMemberId,
                    }
                }
            });

            // Send notification to the requester
            await prisma.notification.create({
                data: {
                    userId: membership.userId, // Send to the user who requested
                    type: NotificationType.PROJECT_JOIN_REJECTED,
                    message: `Your request to join project "${membership.project.name}" has been declined.`,
                    metadata: {
                        projectId: membership.projectId,
                        projectName: membership.project.name,
                        // Add other relevant info if needed
                    }
                }
            });

        } catch (notificationError) {
            console.error("Failed to delete/create notification:", notificationError);
        }

        // 4. Revalidate the path to update the UI
        revalidatePath('/(platform)/my-projects');

        return {
            success: `Declined join request for ${membership.user.name || membership.user.username}.`,
            status: updatedMembership.status
        };

    } catch (error) {
        console.error("Error declining join request:", error);
        return { error: 'Database error: Failed to decline request.' };
    }
}
 