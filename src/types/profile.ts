import { CollaborationStyle, User, Tech, TeamRole, ProjectDomain } from "@prisma/client";

export type CollaborationStyleWithRelations = CollaborationStyle & {
  techs: Tech[];
  projectDomains: ProjectDomain[];
  teamRoles: TeamRole[];
};

export type ProfileWithCollaboration = User & {
  collaborationStyles: CollaborationStyleWithRelations | null;
};

export type GitHubUserData = {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

export type ProfileWithGitHub = ProfileWithCollaboration & {
  githubData?: GitHubUserData | null;
};