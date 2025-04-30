/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { z } from 'zod';
import { auth } from '@/auth'; 
import { prisma } from '@/lib/prisma'; 
import { revalidatePath } from 'next/cache'; 
import { Prisma, Project, ProjectMembershipStatus } from '@prisma/client'; 
import { Octokit } from "@octokit/rest"; 
import { redirect } from 'next/navigation'; 

// Define state shape for useFormState
export type CreateProjectState = {
  error?: string;
  success?: string;
  fieldErrors?: {
    name?: string[];
    githubRepoUrl?: string[];
    tags?: string[];
    isBeginnerFriendly?: string[];
    requiredRoles?: string[];
        _form?: string[]; // Add form-level errors
  };
  project?: Project; // Use the imported Project type
};

// Helper function to get GitHub access token for the user
async function getGitHubAccessToken(userId: string): Promise<string | null> {
    const account = await prisma.account.findFirst({
        where: {
            userId: userId,
            provider: 'github',
        },
    });
    return account?.access_token ?? null;
}

// Helper function to parse GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return null;
    }
    const pathParts = parsedUrl.pathname.split('/').filter(part => part.length > 0);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
    }
    return null;
  } catch (error) {
    console.error("Error parsing GitHub URL:", error);
    return null;
  }
}

// Define the expected shape of the detailed GitHub data
export type GitHubRepoDetails = {
    error?: string;
    description?: string | null;
    readmeContent?: string | null;
    stars?: number;
    languages?: string[];
    contributors?: any[];
    issues?: any[];
    createdAt?: string | null;
    updatedAt?: string | null;
    pushedAt?: string | null;
    homepage?: string | null;
    size?: number;
    watchersCount?: number;
    forksCount?: number;
    openIssuesCount?: number;
    license?: { name: string; spdx_id: string; url: string | null } | null;
    topics?: string[];
    hasIssues?: boolean;
    hasProjects?: boolean;
    htmlUrl?: string; // Add the repo URL itself
};

// Helper function to fetch GitHub repo details
async function fetchGitHubRepoDetails(repoUrl: string, accessToken: string | null | undefined): Promise<GitHubRepoDetails> {
  if (!accessToken) {
    console.warn("No GitHub access token found. Cannot fetch private repo details or extended rate limits.");
    // Optionally proceed without auth for public data, or return error
    // return { error: "GitHub account not linked or token missing." };
  }

  const octokit = new Octokit({ auth: accessToken || undefined }); // Use token if available
  const repoInfo = parseGitHubUrl(repoUrl);

  if (!repoInfo) {
    return { error: "Invalid GitHub URL format." };
  }

  const { owner, repo } = repoInfo;

  // Initialize variables for fetched data
  let repoData: any = null; // Store the main repo data response
  let languages: string[] = [];
  let contributors: any[] = [];
  let issues: any[] = [];


  try {
    // Fetch repository details (includes most needed fields)
    const repoResponse = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    repoData = repoResponse.data;


   


    // Fetch languages separately
    try {
        const languagesResponse = await octokit.request('GET /repos/{owner}/{repo}/languages', {
          owner,
          repo,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        languages = Object.keys(languagesResponse.data);
    } catch (langError: any) {
         console.error(`Error fetching languages for ${owner}/${repo}:`, langError?.status, langError?.message);
    }


    // Fetch contributors separately
    try {
      const contributorsResponse = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
        owner,
        repo,
                per_page: 100, // Limit contributors fetched if needed
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
            contributors = contributorsResponse.data
                .filter((c: any) => c.type === 'User') // Filter out bots
                .map((c: any) => ({
          login: c.login,
          avatar_url: c.avatar_url,
          html_url: c.html_url,
          contributions: c.contributions
      }));
    } catch (contribError: any) {
        console.error(`Error fetching contributors for ${owner}/${repo}:`, contribError?.status, contribError?.message);
    }

    // Fetch open issues separately
    try {
        const issuesResponse = await octokit.request('GET /repos/{owner}/{repo}/issues', {
            owner,
            repo,
                state: 'open',
                per_page: 50, // Limit issues fetched if needed
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        issues = issuesResponse.data.map((i: any) => ({
            number: i.number,
            title: i.title,
            html_url: i.html_url,
            state: i.state,
            labels: (i.labels || []).map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean),
            created_at: i.created_at,
            updated_at: i.updated_at,
            user: {
                    login: i.user?.login,
                    avatar_url: i.user?.avatar_url,
                    html_url: i.user?.html_url
                }
        }));
    } catch (issueError: any) {
        console.error(`Error fetching issues for ${owner}/${repo}:`, issueError?.status, issueError?.message);
    }

        // Construct the result object from fetched data
    return {
            htmlUrl: repoData?.html_url,
            description: repoData?.description,
            createdAt: repoData?.created_at,
            updatedAt: repoData?.updated_at,
            pushedAt: repoData?.pushed_at,
            homepage: repoData?.homepage,
            size: repoData?.size,
            stars: repoData?.stargazers_count,
            watchersCount: repoData?.watchers_count,
            forksCount: repoData?.forks_count,
            openIssuesCount: repoData?.open_issues_count,
            license: repoData?.license ? { // Handle null license
                name: repoData.license.name,
                spdx_id: repoData.license.spdx_id,
                url: repoData.license.url,
             } : null,
            topics: repoData?.topics || [],
            hasIssues: repoData?.has_issues,
            hasProjects: repoData?.has_projects,
            languages,
            contributors,
            issues,
    };

  } catch (error: any) {
    const status = error?.status;
    const message = error?.message || 'Unknown error';
    console.error(`Error fetching GitHub data for ${owner}/${repo}:`, status, message);

        let specificError = "Failed to fetch repository details from GitHub.";
    if (status === 404) {
            specificError = "Repository not found or access denied.";
    } else if (status === 401 || status === 403) {
        specificError = "GitHub authentication failed or insufficient permissions.";
    }

        // Return an error object, including any partial data fetched before the main error
    return {
            error: specificError,
            // Include partial data if available
            htmlUrl: repoData?.html_url,
            description: repoData?.description,
            createdAt: repoData?.created_at,
            updatedAt: repoData?.updated_at,
            pushedAt: repoData?.pushed_at,
            homepage: repoData?.homepage,
            size: repoData?.size,
            stars: repoData?.stargazers_count,
            watchersCount: repoData?.watchers_count,
            forksCount: repoData?.forks_count,
            openIssuesCount: repoData?.open_issues_count,
            license: repoData?.license ? {
                name: repoData.license.name,
                spdx_id: repoData.license.spdx_id,
                url: repoData.license.url,
             } : null,
            topics: repoData?.topics || [],
            hasIssues: repoData?.has_issues,
            hasProjects: repoData?.has_projects,
            languages,
            contributors,
            issues,
         };
    }
}

//Fetch detailed GitHub project info for the drawer
export async function getProjectDetailsFromGitHub(
    githubRepoUrl: string | null | undefined
): Promise<GitHubRepoDetails> {
    if (!githubRepoUrl) {
        return { error: "GitHub repository URL is required." };
    }

    const session = await auth();
    const userId = session?.user?.id; // We need the user ID to get their token

    // Although the repo might be public, using the user's token
    // provides higher rate limits and access to private repos if they own/collaborate.
    // Handle cases where the user isn't logged in or hasn't linked GitHub gracefully.
    const accessToken = userId ? await getGitHubAccessToken(userId) : null;

    if (!accessToken && userId) {
        console.warn(`User ${userId} has not linked their GitHub account or the token is missing. Fetching public data only for ${githubRepoUrl}.`);
        // Optionally return an error or specific state if GitHub connection is mandatory
        // return { error: "GitHub account not linked. Cannot fetch details." };
    }

    const details = await fetchGitHubRepoDetails(githubRepoUrl, accessToken);

    // The fetchGitHubRepoDetails function now returns the GitHubRepoDetails structure directly
    return details;
}

// Fetch user's GitHub Repositories
export async function fetchUserRepos(): Promise<{ repos?: { name: string; url: string }[]; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
        return { error: 'GitHub account not linked or token unavailable.' };
    }

    const octokit = new Octokit({ auth: accessToken });

    try {
        // Fetch repositories for the authenticated user
        const reposResponse = await octokit.request('GET /user/repos', {
            type: 'owner', // Fetch repos owned by the user
            sort: 'updated', // Sort by last updated
            per_page: 100, // Fetch up to 100 repos
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        const repos = reposResponse.data.map(repo => ({
            name: repo.name,
            url: repo.html_url,
        }));

        return { repos };

    } catch (error: any) {
        console.error("Error fetching user repositories:", error);
        const status = error?.status;
        if (status === 401 || status === 403) {
             return { error: "GitHub token invalid or expired. Please reconnect your GitHub account." };
        }
        return { error: 'Failed to fetch repositories from GitHub.' };
    }
}

// Validation schema (allow empty arrays for tags/roles if not provided)
const CreateProjectSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters." }),
    githubRepoUrl: z.string().url({ message: "Please enter a valid GitHub repository URL." }).min(1, { message: "GitHub repository URL is required."}),
    tags: z.array(z.string()).optional().default([]), // Default to empty array
  isBeginnerFriendly: z.boolean().optional().default(false),
    requiredRoles: z.array(z.string()).optional().default([]), // Default to empty array
});

export async function createProject(
  prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
    return {
      error: 'Unauthorized: You must be logged in to create a project.',
    };
  }

  const tags = formData.getAll('tags').filter(tag => typeof tag === 'string' && tag.trim() !== '') as string[];
  const requiredRoles = formData.getAll('requiredRoles').filter(role => typeof role === 'string' && role.trim() !== '') as string[];

  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    githubRepoUrl: formData.get('githubRepoUrl'),
        tags: tags, // Pass the extracted tags
    isBeginnerFriendly: formData.get('isBeginnerFriendly') === 'on',
        requiredRoles: requiredRoles, // Pass the extracted roles
  });

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return {
            error: 'Invalid project data. Please check the fields.',
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    githubRepoUrl,
        tags: formTags,
    isBeginnerFriendly,
        requiredRoles: formRequiredRoles,
  } = validatedFields.data;

    let finalTags = [...formTags]; // Start with user-provided tags
    let projectData: Prisma.ProjectCreateInput = {
        name,
        isBeginnerFriendly,
        requiredRoles: formRequiredRoles,
        tags: finalTags, // Initialize with form tags
        owner: { connect: { id: userId } }, // Connect to the owner
        githubRepoUrl: githubRepoUrl || null, // Ensure null if empty string
    };

    let fetchError: string | undefined = undefined;

    // --- Fetch GitHub Data if URL is provided ---
    if (githubRepoUrl) {
        const accessToken = await getGitHubAccessToken(userId);
        const fetchedDetails = await fetchGitHubRepoDetails(githubRepoUrl, accessToken);

        if (fetchedDetails.error) {
            console.warn(`GitHub fetch warning for ${githubRepoUrl}: ${fetchedDetails.error}`);
            fetchError = fetchedDetails.error; // Store the error message
        }

        // Merge languages into tags (avoid duplicates, convert to lowercase for consistency)
        const fetchedLangsLower = (fetchedDetails.languages || []).map(lang => lang.toLowerCase());
        const formTagsLower = formTags.map(tag => tag.toLowerCase());
        const uniqueLangs = fetchedLangsLower.filter(lang => !formTagsLower.includes(lang));
        finalTags = [...formTags, ...uniqueLangs]; // Combine user tags and unique fetched languages

        // Update projectData with fetched details (even if there was a non-fatal error)
        projectData = {
            ...projectData,
            tags: finalTags,
        };
    }
    // --- End Fetch GitHub Data ---

    let newProject: Project | null = null; // Define newProject outside try block

    try {
         newProject = await prisma.project.create({ 
            data: projectData,
        });

        // Revalidate relevant paths after successful creation
        revalidatePath('/(platform)/my-projects', 'layout'); 
        

        // Redirect needs to be called outside the try/catch block after success
    } catch (e) {
        console.error("Error creating project:", e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // Example: Handle unique constraint violation (e.g., duplicate githubRepoUrl)
            if (e.code === 'P2002') {
                 const target = (e.meta?.target as string[])?.join(', ') || 'field';
                 return {
                    error: `Failed to create project. The ${target} already exists.`,
                    fieldErrors: { _form: [`The ${target} already exists.`] } // Form-level error
                 };
            }
        }
        return {
            error: 'Database error: Failed to create project.',
            fieldErrors: { _form: ['An unexpected database error occurred.'] }
        };
    }

     if (newProject) {
         redirect(`/my-projects/`);
     } else {
        console.error("Project created in DB, but redirect failed as newProject object is null.");
    return {
            success: 'Project created successfully, but redirection failed. Please find it manually.',
            // include fetchError as a non-fatal warning
            error: fetchError ? `Warning: ${fetchError}` : undefined,
        };
     }
}

// --- Update Project ---

export type UpdateProjectState = {
     error?: string;
     success?: string;
     fieldErrors?: {
         requiredRoles?: string[];
         // Add other editable fields here (we only have requiredRoles for now)
         _form?: string[];
     };
 };

 // Basic validation schema for update
const UpdateProjectSchema = z.object({
    projectId: z.string(),
    requiredRoles: z.array(z.string()).optional().default([]),
    // Add other editable fields here 
});


export async function updateProject(
    prevState: UpdateProjectState,
    formData: FormData
): Promise<UpdateProjectState> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { error: 'Unauthorized' };
    }

    const projectId = formData.get('projectId') as string;
    const requiredRoles = formData.getAll('requiredRoles').filter(role => typeof role === 'string' && role.trim() !== '') as string[];

     // Validate basic input presence
     if (!projectId) {
         return { error: 'Project ID is missing.', fieldErrors: { _form: ['Project ID is missing.'] } };
     }

     const validatedFields = UpdateProjectSchema.safeParse({
        projectId: projectId,
        requiredRoles: requiredRoles,
    });

     if (!validatedFields.success) {
        console.error("Update Validation Errors:", validatedFields.error.flatten().fieldErrors);
        return {
            error: 'Invalid project data for update.',
            fieldErrors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { requiredRoles: updatedRoles } = validatedFields.data;

    try {
        // Verify ownership before updating
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true }
        });

        if (!project) {
            return { error: 'Project not found.' };
        }

        if (project.ownerId !== userId) {
            return { error: 'Forbidden: You do not own this project.' };
        }

        // Perform the update
        await prisma.project.update({
            where: { id: projectId },
            data: {
                requiredRoles: updatedRoles,
                // Update other fields here
            },
        });

        // Revalidate the project page
        revalidatePath(`/(platform)/my-projects/`);

        return { success: 'Project updated successfully!' };

    } catch (e) {
        console.error("Error updating project:", e);
    return {
            error: 'Database error: Failed to update project.',
            fieldErrors: { _form: ['An unexpected database error occurred during update.'] }
        };
    }
}

// Ensure Project type is exported if needed elsewhere
export type { Project };

// --- Get Membership Status Action ---
export async function getMembershipStatus(projectId: string): Promise<{
    status: ProjectMembershipStatus | null;
    isMember: boolean;
    error?: string;
}> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { error: 'Unauthorized', status: null, isMember: false };
    }
    if (!projectId) {
        return { error: 'Project ID is required.', status: null, isMember: false };
    }

    try {
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: userId,
                    projectId: projectId,
                },
            },
            select: { status: true },
        });

        const status = membership?.status ?? null;
        const isMember = status === ProjectMembershipStatus.ACCEPTED;

        return { status, isMember };
    } catch (e) {
        console.error("Error fetching membership status:", e);
        return {
            error: 'Database error: Failed to fetch membership status.',
            status: null,
            isMember: false,
        };
    }
}

// --- Delete Project Action ---
export async function deleteProject(projectId: string): Promise<{ success?: string; error?: string }> {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { error: 'Unauthorized' };
    }
    if (!projectId) {
        return { error: 'Project ID is required.' };
    }

    try {
        // Verify ownership before deleting
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true },
        });

        if (!project) {
            return { error: 'Project not found.' };
        }

        if (project.ownerId !== userId) {
            return { error: 'Forbidden: You do not own this project.' };
        }

        await prisma.projectMember.deleteMany({
            where: { projectId: projectId },
        });
        await prisma.project.delete({
            where: { id: projectId },
        });

        // Revalidate relevant paths
        revalidatePath('/(platform)/my-projects'); 

        return { success: 'Project deleted successfully.' };

    } catch (e) {
        console.error("Error deleting project:", e);
        return {
            error: 'Database error: Failed to delete project.',
        };
    }
}
