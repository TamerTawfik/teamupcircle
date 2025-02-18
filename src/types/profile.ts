import { CollaborationStyle, User } from "@prisma/client";

export type ProfileWithCollaboration = User & {
  collaborationStyles: CollaborationStyle | null;
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