import { CollaborationStyle, User } from "@prisma/client";

export type ProfileWithCollaboration = User & {
  collaborationStyles: CollaborationStyle | null;
};