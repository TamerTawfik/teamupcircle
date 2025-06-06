import { z } from "zod";

export async function getGithubRepoInfo() {
  try {
    const res = await fetch(
      'https://api.github.com/repos/TamerTawfik/teamupcircle',
    );
    return res.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
}

export const githubUserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatar_url: z.string().url(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  followers: z.number(),
  following: z.number(),
  public_repos: z.number(),
  created_at: z.string(),
  html_url: z.string().url(),
});



export type GithubUser = z.infer<typeof githubUserSchema>;

export async function getGithubUser(username: string): Promise<GithubUser> {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('User not found');
    }
    if (res.status === 403) {
      throw new Error('API rate limit exceeded');
    }
    throw new Error('Failed to fetch user data');
  }

  const data = await res.json();
  return githubUserSchema.parse(data);
}


