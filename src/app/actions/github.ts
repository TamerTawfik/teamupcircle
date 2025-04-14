 
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { Octokit } from '@octokit/rest';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { graphql } from "@octokit/graphql"; // Import GraphQL client

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize GraphQL client with the same token
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

// Define rate limiting constants
// const RATE_LIMIT_DURATION = 60 * 60 * 1000; // 1 hour - Keep commented out for now
const MAX_REPOS_TO_ANALYZE = 15; // Reduce slightly due to increased file checks

// Define cache duration (e.g., 1 hour in milliseconds)
const CACHE_DURATION_MS = 60 * 60 * 1000;

// Validation schema for username
const usernameSchema = z.string().min(1).max(39);

// Interfaces for type safety
interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  company: string;
  blog: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface CodeQualityMetrics {
  // Simplified: focuses on setup rather than deep analysis
  hasLinter: boolean;
  hasFormatter: boolean;
  hasTestingLibrary: boolean;
  hasCiCd: boolean;
  hasDependabot: boolean;
  hasTypeScript: boolean;
  hasReadme: boolean;
  hasLicense: boolean;
  hasContributing: boolean;
  // Aggregate score based on the above (heuristic)
  bestPracticesScore: number; // 0-100 score based on checks
  securityIssuesScore: number; // Simple score based on dependabot/scanning setup
  documentationScore: number; // Simple score based on file presence
  testSetupScore: number; // Simple score based on lib/config presence
}

interface AggregatedCodeQuality {
    avgBestPracticesScore: number;
    avgSecurityIssuesScore: number;
    avgDocumentationScore: number;
    avgTestSetupScore: number;
    commonSuggestions: string[]; // Aggregated suggestions
}

interface CommitActivity {
  // Focused on contribution calendar data
  totalContributionsLastYear: number;
  longestStreak: number;
  currentStreak: number;
  // Placeholder for detailed commit frequency as it's hard to get accurately
  // weekly: Array<{ week: string; commits: number }>; // Removed placeholder
  // totalCommits: number; // Removed placeholder
  // commitsPerMonth: Record<string, number>; // Removed placeholder
  // activeTime: string; // Removed placeholder
}

interface RepoDetail {
  name: string;
  description: string;
  stars: number;
  forks: number;
  languages: Record<string, number>; // Bytes per language
  primaryLanguage: string | null;
  codeQuality: CodeQualityMetrics; // Per-repo quality heuristics
  lastUpdated: string;
  hasPackageJson: boolean;
  dependencies: string[];
  devDependencies: string[];
  curismScore: number; // Overall score (previously calculated)
  // Added ACID breakdown scores
  acidScores: {
      architecture: number;
      crossDomain: number;
      innovation: number;
      documentation: number;
  };
}

interface RepositoryAnalysisResult {
  username: string;
  totalRepos: number;
  analyzedReposCount: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  languageDistribution: Record<string, number>;
  technologyUsage: Record<string, number>;
  commitActivity: CommitActivity;
  aggregatedCodeQuality: AggregatedCodeQuality;
  // Added acidScores to the Pick
  topRepositories: Array<Pick<RepoDetail, 'name' | 'description' | 'stars' | 'forks' | 'primaryLanguage' | 'lastUpdated' | 'curismScore' | 'acidScores'>>;
  contributionGraph: Array<{ date: string; count: number }>;
  recommendations: string[];
  analysisTimestamp: string;
  // Add average CURISM factors for the new radar
  averageCurismFactors: {
      contribution: number;
      reliability: number;
      influence: number;
      security: number;
      maintainability: number;
  };
}

/**
 * Get a GitHub user's profile information
 */
export async function getUserProfile(username: string): Promise<GitHubUser | null> {
  try {
    usernameSchema.parse(username);
    const { data } = await octokit.users.getByUsername({ username });
    return data as GitHubUser;
  } catch (error) {
    console.error(`Error fetching GitHub user '${username}':`, error);
    return null;
  }
}

/**
 * Fetch user contribution data using GraphQL API
 */
async function fetchContributionData(username: string): Promise<{
  contributionGraph: Array<{ date: string; count: number }>,
  totalContributionsLastYear: number,
  longestStreak: number,
  currentStreak: number
}> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        # Additional fields for streak (might need separate calculation if not direct)
      }
    }
  `;

  try {
    const response: any = await graphqlWithAuth(query, { username });
    const calendar = response?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      console.error("Could not fetch contribution calendar data for", username);
      return { contributionGraph: [], totalContributionsLastYear: 0, longestStreak: 0, currentStreak: 0 };
    }

    const contributionGraph: Array<{ date: string; count: number }> = [];
    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        contributionGraph.push({ date: day.date, count: day.contributionCount });
      });
    });

    // Basic streak calculation (can be improved)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 864e5).toISOString().split('T')[0];

    // Iterate backwards to calculate streaks easily
    for (let i = contributionGraph.length - 1; i >= 0; i--) {
        const day = contributionGraph[i];
        if (day.count > 0) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 0; // Reset streak
        }
         // Check for current streak ending today or yesterday
        if (i === contributionGraph.length - 1 && (day.date === today || day.date === yesterday) && day.count > 0) {
             currentStreak = tempStreak;
         } else if (i === contributionGraph.length - 1 && (day.date !== today && day.date !== yesterday)) {
             currentStreak = 0; // Streak broken if last entry isn't today/yesterday
         } else if (i < contributionGraph.length - 1 && day.count === 0 && contributionGraph[i+1].date === yesterday && currentStreak === 0) {
             currentStreak = tempStreak // Handle case where today has 0 but yesterday had > 0
         }

    }
    longestStreak = Math.max(longestStreak, tempStreak); // Final check for streak ending at the beginning


    return {
      contributionGraph,
      totalContributionsLastYear: calendar.totalContributions || 0,
      longestStreak,
      currentStreak
    };
  } catch (error) {
    console.error('Error fetching contribution data via GraphQL:', error);
    return { contributionGraph: [], totalContributionsLastYear: 0, longestStreak: 0, currentStreak: 0 };
  }
}

/**
 * Detect technologies based on dependencies and config files
 */
async function detectTechnologies(
    owner: string,
    repo: string,
    dependencies: string[],
    devDependencies: string[]
): Promise<Record<string, number>> {
  const usage: Record<string, number> = {};
  const allDeps = new Set([...dependencies, ...devDependencies]);

  const techMapping: Record<string, { packages?: string[], files?: string[] }> = {
    'Next.js':      { packages: ['next'], files: ['next.config.js', 'next.config.mjs'] },
    'React':        { packages: ['react', 'react-dom'] },
    'Vue.js':       { packages: ['vue'], files: ['vue.config.js'] },
    'Nuxt.js':      { packages: ['nuxt'], files: ['nuxt.config.js', 'nuxt.config.ts'] },
    'Angular':      { packages: ['@angular/core'], files: ['angular.json'] },
    'Svelte':       { packages: ['svelte'], files: ['svelte.config.js'] },
    'SvelteKit':    { packages: ['@sveltejs/kit'], files: ['svelte.config.js'] }, // Often uses svelte.config.js too
    'Astro':        { packages: ['astro'], files: ['astro.config.mjs', 'astro.config.js', 'astro.config.ts'] },
    'Vite':         { packages: ['vite'], files: ['vite.config.js', 'vite.config.ts'] },
    'Node.js':      { packages: ['express', 'koa', 'hapi', 'fastify', 'nest', '@nestjs/core'] }, // Check package first
    'Tailwind CSS': { packages: ['tailwindcss'], files: ['tailwind.config.js', 'tailwind.config.ts'] },
    'Bootstrap':    { packages: ['bootstrap', 'react-bootstrap', '@ng-bootstrap/ng-bootstrap'] },
    'TypeScript':   { packages: ['typescript'], files: ['tsconfig.json'] },
    'Jest':         { packages: ['jest'], files: ['jest.config.js', 'jest.config.ts'] },
    'Vitest':       { packages: ['vitest'], files: ['vitest.config.js', 'vitest.config.ts'] },
    'Cypress':      { packages: ['cypress'], files: ['cypress.config.js', 'cypress.json', 'cypress.config.ts'] },
    'Playwright':   { packages: ['playwright', '@playwright/test'] },
    'ESLint':       { packages: ['eslint'], files: ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml'] },
    'Prettier':     { packages: ['prettier'], files: ['.prettierrc', '.prettierrc.js', '.prettierrc.json', 'prettier.config.js'] },
    'Docker':       { files: ['Dockerfile', 'docker-compose.yml'] },
    'GitHub Actions':{ files: ['.github/workflows/'] }, // Check directory presence implicitly via fileExists logic below
    'Dependabot':   { files: ['.github/dependabot.yml'] },
  };

  const fileCheckPromises: Promise<{ tech: string, exists: boolean }>[] = [];

  for (const [tech, criteria] of Object.entries(techMapping)) {
    let detected = false;
    // Check packages first (faster)
    if (criteria.packages) {
      if (criteria.packages.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
         usage[tech] = (usage[tech] || 0) + 1;
         detected = true;
      }
    }
    // If not detected by package, prepare file checks (slower)
    if (!detected && criteria.files) {
       for(const file of criteria.files) {
           // Special case for directory check
           if (file.endsWith('/')) {
               // We approximate directory check by checking for a common file within it
               // e.g., check for any .yml or .yaml file in .github/workflows/
               // This is still imperfect but avoids listing all contents.
               // For now, just check the base path existence - fileExists handles 404s.
               // A more robust check would list dir contents.
               fileCheckPromises.push(fileExists(owner, repo, file).then(exists => ({ tech, exists })));
           } else {
               fileCheckPromises.push(fileExists(owner, repo, file).then(exists => ({ tech, exists })));
           }
       }
    }
  }

  // Execute all file checks in parallel
  const fileResults = await Promise.all(fileCheckPromises);
  for (const result of fileResults) {
      // Increment count only if the tech wasn't already detected by package name
      // and the file exists. Only count the first file found for a tech.
      if (result.exists && !usage[result.tech]) {
          usage[result.tech] = (usage[result.tech] || 0) + 1;
      }
  }


  return usage;
}

/**
 * Analyze code quality heuristics for a repository
 */
async function analyzeCodeQualityHeuristics(
  owner: string,
  repo: string,
  dependencies: string[],
  devDependencies: string[]
): Promise<CodeQualityMetrics> {

  const allDeps = new Set([...dependencies, ...devDependencies]);

  const checks = {
      hasLinter: allDeps.has('eslint') || await fileExists(owner, repo, '.eslintrc.js') || await fileExists(owner, repo, '.eslintrc.json'),
      hasFormatter: allDeps.has('prettier') || await fileExists(owner, repo, '.prettierrc.js') || await fileExists(owner, repo, '.prettierrc.json') || await fileExists(owner, repo, 'prettier.config.js'),
      hasTestingLibrary: ['jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', '@testing-library/react'].some(lib => allDeps.has(lib)),
      hasCiCd: await fileExists(owner, repo, '.github/workflows/'), // Approximate check
      hasDependabot: await fileExists(owner, repo, '.github/dependabot.yml'),
      hasTypeScript: allDeps.has('typescript') || await fileExists(owner, repo, 'tsconfig.json'),
      hasReadme: await fileExists(owner, repo, 'README.md'),
      hasLicense: await fileExists(owner, repo, 'LICENSE') || await fileExists(owner, repo, 'LICENSE.md'),
      hasContributing: await fileExists(owner, repo, 'CONTRIBUTING.md'),
      hasLockfile: await fileExists(owner, repo, 'package-lock.json') || await fileExists(owner, repo, 'yarn.lock') || await fileExists(owner, repo, 'pnpm-lock.yaml')
  };

  const qualityMetrics: CodeQualityMetrics = {
      ...checks,
      bestPracticesScore: calculateScore([checks.hasLinter, checks.hasFormatter, checks.hasCiCd, checks.hasLockfile]),
      securityIssuesScore: calculateScore([checks.hasDependabot]), // Very basic security score
      documentationScore: calculateScore([checks.hasReadme, checks.hasLicense, checks.hasContributing]),
      testSetupScore: calculateScore([checks.hasTestingLibrary]),
  };

  return qualityMetrics;
}

/**
 * Calculate Contribution Score based on update recency
 */
function calculateContributionScore(lastUpdated: string): number {
    const updatedAt = new Date(lastUpdated);
    const now = new Date();
    const diffMonths = (now.getFullYear() - updatedAt.getFullYear()) * 12 + (now.getMonth() - updatedAt.getMonth());

    if (diffMonths < 1) return 100;
    if (diffMonths < 3) return 80;
    if (diffMonths < 6) return 60;
    if (diffMonths < 12) return 40;
    return 20;
}

/**
 * Calculate Influence Score based on stars and forks
 */
function calculateInfluenceScore(stars: number, forks: number): number {
    const score = Math.log10(stars + 1) * 20 + Math.log10(forks + 1) * 10;
    return Math.min(Math.round(score), 100); // Cap at 100
}

/**
 * Check if a file exists in a repository using REST API (can be slow)
 */
async function fileExists(owner: string, repo: string, path: string): Promise<boolean> {
  try {
    // Use HEAD request for efficiency if possible, though Octokit might default to GET
    await octokit.repos.getContent({ owner, repo, path, request: { method: 'HEAD' } });
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    // Log other errors but treat as non-existent for simplicity
    console.warn(`Error checking file ${path} in ${owner}/${repo}: ${error.status}`);
    return false;
  }
}

/**
 * Calculate a simple score (0-100) based on boolean checks
 */
function calculateScore(checks: boolean[]): number {
    if (checks.length === 0) return 0;
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
}

/**
 * Generate recommendations based on aggregated analysis
 */
function generateRecommendations(analysis: RepositoryAnalysisResult): string[] {
  const recommendations: string[] = [];
  const quality = analysis.aggregatedCodeQuality;

  if (quality.avgTestSetupScore < 50) {
    recommendations.push("Enhance test coverage: Add testing libraries (Jest, Vitest, Cypress) and write more tests.");
  }
  if (quality.avgDocumentationScore < 60) {
    recommendations.push("Improve documentation: Ensure key repos have README.md, LICENSE, and consider CONTRIBUTING.md.");
  }
  if (quality.avgBestPracticesScore < 70) {
    recommendations.push("Adopt more best practices: Set up linters (ESLint), formatters (Prettier), and CI/CD pipelines (GitHub Actions).");
  }
   if (quality.avgSecurityIssuesScore < 80) { // Adjusted threshold
    recommendations.push("Boost security posture: Enable Dependabot for automated dependency updates and consider CodeQL scanning.");
  }
  if (analysis.commitActivity.totalContributionsLastYear < 100) { // Example threshold
      recommendations.push("Increase contribution activity to build a stronger public profile.");
  }

   // Add common suggestions from quality analysis if available
   recommendations.push(...quality.commonSuggestions);


  // General suggestions
  recommendations.push("Keep dependencies up-to-date to avoid security vulnerabilities.");
  if (analysis.topRepositories.length < 5 && analysis.totalRepos > 5) {
      recommendations.push("Showcase your best work: Ensure your top projects have clear READMEs and are well-maintained.");
  }


  // Limit recommendations
  return recommendations.slice(0, 6);
}

// --- Technology Categories for Cross-Domain Score ---
const techCategories: Record<string, { packages?: string[], files?: string[] }> = {
    'Frontend Framework': { packages: ['react', 'vue', 'angular', 'svelte', '@sveltejs/kit', 'next', 'nuxt', 'astro', 'solid-js', 'qwik', '@builder.io/qwik'] },
    'Backend Framework':  { packages: ['express', 'koa', 'hapi', 'fastify', 'nest', '@nestjs/core'] }, // Limited to Node.js for now
    'CSS Framework':      { packages: ['tailwindcss', 'bootstrap', '@chakra-ui/react', 'material-ui', '@mui/material'] },
    'Testing Framework':  { packages: ['jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', '@testing-library/react'] },
    'Build Tool':         { packages: ['vite', 'webpack', 'rollup', 'esbuild', 'parcel', 'bun', 'deno'] },
    'Database Client/ORM':{ packages: ['prisma', 'typeorm', 'mongoose', 'sequelize', 'drizzle-orm', '@planetscale/database'] },
    'Cloud SDK':          { packages: ['aws-sdk', '@aws-sdk', 'google-cloud', '@google-cloud', 'azure', '@azure'] },
    'IaC/Containerization': { files: ['Dockerfile', 'docker-compose.yml', '.tf', 'terraform/', 'serverless.yml', 'Pulumi.yaml'] }, // Primarily file-based
    'Linter':             { packages: ['eslint'], files: ['.eslintrc', '.eslintrc.js', '.eslintrc.json'] },
    'Formatter':          { packages: ['prettier'], files: ['.prettierrc', '.prettierrc.js', 'prettier.config.js'] },
     // Add more categories as needed
};

// --- Innovative Technologies for Innovation Score ---
const innovativeTech: { packages?: string[], files?: string[], keywords?: string[] } = {
    packages: [
        'bun', 'deno', '@deno/kv', // Runtimes
        'astro', 'htmx', 'solid-js', 'qwik', '@builder.io/qwik', // Frameworks
        'tauri', '@tauri-apps/api', // Desktop Apps
        'langchain', 'tensorflow', 'pytorch', 'transformers', '@huggingface/hub', // AI/ML
        'wasm-pack', 'wasmer', 'wasmtime', // Wasm
        'drizzle-orm', '@planetscale/database', // Modern DB tools
        'temporalio', // Workflow engines
        'polars' // Data manipulation
        // Add more emerging/niche tech
    ],
    files: [
        'deno.json', 'bun.lockb', 'bunfig.toml', 'tauri.conf.json',
        // Check for Wasm files? Maybe too broad.
    ],
    // Keywords could check repo description or topics in the future, but skip for now
};


// --- ACID Score Calculation Helpers ---

async function calculateArchitectureScore(owner: string, repo: string, dependencies: string[], devDependencies: string[]): Promise<number> {
    let score = 0;
    const pointsPerCheck = 20; // Max 100
    const allDeps = new Set([...dependencies, ...devDependencies]);

    // 1. Containerization Check
    if (await fileExists(owner, repo, 'Dockerfile') || await fileExists(owner, repo, 'docker-compose.yml')) {
        score += pointsPerCheck;
    }

    // 2. IaC Check
    const iacFiles = techCategories['IaC/Containerization'].files ?? [];
    const iacChecks = await Promise.all(iacFiles.map(file => fileExists(owner, repo, file)));
    if (iacChecks.some(exists => exists)) {
        score += pointsPerCheck;
    }

    // 3. Monorepo Check
    const monorepoFiles = ['lerna.json', 'nx.json', 'turbo.json', 'pnpm-workspace.yaml'];
    const monorepoChecks = await Promise.all(monorepoFiles.map(file => fileExists(owner, repo, file)));
    if (await fileExists(owner, repo, 'packages/') || monorepoChecks.some(exists => exists)) {
        score += pointsPerCheck;
    }

    // 4. Backend Framework Check
    const backendPkgs = techCategories['Backend Framework'].packages ?? [];
    if (backendPkgs.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
        score += pointsPerCheck;
    }

    // 5. Frontend Framework Check
    const frontendPkgs = techCategories['Frontend Framework'].packages ?? [];
     if (frontendPkgs.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
        score += pointsPerCheck;
    }

    return Math.min(score, 100);
}

async function calculateCrossDomainScore(owner: string, repo: string, dependencies: string[], devDependencies: string[]): Promise<number> {
    const detectedCategories = new Set<string>();
    const allDeps = new Set([...dependencies, ...devDependencies]);

    for (const [category, criteria] of Object.entries(techCategories)) {
        let detected = false;
        // Check packages
        if (criteria.packages?.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
            detected = true;
        }
        // Check files (primarily for IaC, Linter, Formatter)
        if (!detected && criteria.files) {
            const fileChecks = await Promise.all(criteria.files.map(file => fileExists(owner, repo, file)));
            if(fileChecks.some(exists => exists)) {
                detected = true;
            }
        }

        if (detected) {
            detectedCategories.add(category);
        }
    }

    const categoryCount = detectedCategories.size;
    if (categoryCount >= 5) return 100;
    if (categoryCount >= 4) return 80;
    if (categoryCount >= 3) return 60;
    if (categoryCount >= 2) return 40;
    if (categoryCount >= 1) return 20;
    return 0;
}

async function calculateInnovationScore(owner: string, repo: string, dependencies: string[], devDependencies: string[]): Promise<number> {
    let score = 0;
    const pointsPerCheck = 34; // Max ~100
    const allDeps = new Set([...dependencies, ...devDependencies]);

    // 1. Check Innovative Packages
    if (innovativeTech.packages?.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
        score += pointsPerCheck;
    }

    // 2. Check Innovative Config Files
    if (innovativeTech.files) {
        const fileChecks = await Promise.all(innovativeTech.files.map(file => fileExists(owner, repo, file)));
        if (fileChecks.some(exists => exists)) {
             score += pointsPerCheck;
        }
    }

    // 3. Check for specific combos or indicators (e.g., AI/ML libraries present)
    const aiMlPackages = ['langchain', 'tensorflow', 'pytorch', 'transformers', '@huggingface/hub'];
    if (aiMlPackages.some(pkg => allDeps.has(pkg) || Array.from(allDeps).some(dep => dep.startsWith(pkg + '/')))) {
        score += pointsPerCheck; // Give points specifically for AI/ML presence
    }

    return Math.min(Math.round(score), 100);
}

/**
 * Analyze a single repository in depth
 */
async function analyzeRepositoryDetail(owner: string, repoName: string): Promise<RepoDetail | null> {
    try {
        const { data: repoData } = await octokit.repos.get({ owner, repo: repoName });

        let dependencies: string[] = [];
        let devDependencies: string[] = [];
        let hasPackageJson = false;

        try {
            const { data: packageJsonContent } = await octokit.repos.getContent({
            owner,
            repo: repoName,
            path: 'package.json',
            });

            if ('content' in packageJsonContent) {
                hasPackageJson = true;
                const content = Buffer.from(packageJsonContent.content, 'base64').toString();
                const pkg = JSON.parse(content);
                dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
                devDependencies = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
            }
        } catch (error: any) {
            if (error.status !== 404) {
                 console.warn(`Could not fetch package.json for ${owner}/${repoName}: ${error.message}`);
            }
        }


        // Run primary analysis in parallel
        const [languages, codeQuality] = await Promise.all([
             octokit.repos.listLanguages({ owner, repo: repoName }).then(res => res.data).catch(err => { console.error(`Failed language fetch: ${err.message}`); return {}; }),
             analyzeCodeQualityHeuristics(owner, repoName, dependencies, devDependencies)
        ]);

        // --- Calculate CURISM Score Components ---
        const contributionScore = calculateContributionScore(repoData.updated_at); // C
        const reliabilityScore = codeQuality.testSetupScore; // R
        const influenceScore = calculateInfluenceScore(repoData.stargazers_count || 0, repoData.forks_count || 0); // I
        const securityScore = codeQuality.securityIssuesScore; // S
        const maintainabilityScore = Math.round((codeQuality.bestPracticesScore + codeQuality.documentationScore) / 2); // M

        const curismScore = Math.round(
            (contributionScore + reliabilityScore + influenceScore + securityScore + maintainabilityScore) / 5
        );

        // --- Calculate ACID Score Components (Run these in parallel) ---
        const [architectureScore, crossDomainScore, innovationScore] = await Promise.all([
             calculateArchitectureScore(owner, repoName, dependencies, devDependencies), // A
             calculateCrossDomainScore(owner, repoName, dependencies, devDependencies), // C
             calculateInnovationScore(owner, repoName, dependencies, devDependencies), // I
        ]);
        const documentationScore = codeQuality.documentationScore; // D

        const acidScores = {
            architecture: architectureScore,
            crossDomain: crossDomainScore,
            innovation: innovationScore,
            documentation: documentationScore,
        };

        const repoDetail: RepoDetail = {
            name: repoData.name,
            description: repoData.description || '',
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            primaryLanguage: repoData.language,
            languages,
            dependencies,
            devDependencies,
            hasPackageJson,
            codeQuality,
            lastUpdated: repoData.updated_at,
            curismScore: curismScore,
            acidScores: acidScores, // Assign calculated ACID scores
        };

        return repoDetail;

    } catch (error: any) {
        console.error(`Error analyzing repository ${owner}/${repoName}:`, error.message);
        return null;
  }
}

/**
 * Main analysis function
 */
export async function analyzeRepositories(username: string): Promise<RepositoryAnalysisResult> {
  console.log(`Starting analysis request for ${username}...`);
  usernameSchema.parse(username);

  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }
  const userId = session.user.id;

  // --- Check for cached data ---
  try {
    const existingAnalysis = await prisma.repositoryAnalysis.findFirst({
      where: {
        userId: userId,
        username: username,
      },
      orderBy: {
        updatedAt: 'desc', // Get the most recent analysis
      },
    });

    if (existingAnalysis && existingAnalysis.data) {
      const analysisAge = Date.now() - existingAnalysis.updatedAt.getTime();
      if (analysisAge < CACHE_DURATION_MS) {
        console.log(`Returning cached analysis for ${username} (updated ${Math.round(analysisAge / 60000)} mins ago).`);
        // Ensure the stored data conforms to the expected type
        // Prisma stores JSON as `JsonValue`, need to cast appropriately
        // Add validation here if necessary (e.g., using Zod)
        return existingAnalysis.data as unknown as RepositoryAnalysisResult;
      } else {
        console.log(`Cached analysis for ${username} is stale (updated ${Math.round(analysisAge / 60000)} mins ago). Re-analyzing.`);
      }
    } else {
        console.log(`No cached analysis found for ${username}. Performing fresh analysis.`);
    }
  } catch (dbError) {
    console.error("Error checking cache for repository analysis:", dbError);
    // Decide whether to proceed without cache or throw error
    // For now, proceed with analysis
  }

  console.log(`Performing full GitHub analysis for ${username}...`);

  try {
    const startTime = Date.now();
    const [{ data: userRepos }, { data: userData }, contributionData] = await Promise.all([
      octokit.repos.listForUser({ username, sort: 'pushed', per_page: 100 }),
      octokit.users.getByUsername({ username }),
      fetchContributionData(username),
    ]);

    const totalRepos = userData.public_repos;
    let totalStars = 0;
    let totalForks = 0;
    let totalWatchers = 0;

    const reposForAnalysis = userRepos.slice(0, MAX_REPOS_TO_ANALYZE);
    const analyzedReposCount = reposForAnalysis.length;
    console.log(`Fetched ${userRepos.length} repos, analyzing ${analyzedReposCount} in detail.`);

    const analysisPromises = reposForAnalysis.map(repo => analyzeRepositoryDetail(username, repo.name));
    const analyzedRepoDetails = (await Promise.all(analysisPromises)).filter(details => details !== null) as RepoDetail[];
    console.log(`Detailed analysis completed for ${analyzedRepoDetails.length} repos.`);

    // --- Aggregation ---
    const languageDistribution: Record<string, number> = {};
    const technologyUsage: Record<string, number> = {};
    const aggregatedQuality: Omit<AggregatedCodeQuality, 'commonSuggestions'> = {
         avgBestPracticesScore: 0, avgSecurityIssuesScore: 0, avgDocumentationScore: 0, avgTestSetupScore: 0,
     };
    // --- Initialize Aggregated CURISM Factors ---
    const aggregatedCurismFactors = {
        contribution: 0, reliability: 0, influence: 0, security: 0, maintainability: 0,
    };
    let qualityScoresCount = 0;

    userRepos.forEach(repo => {
         totalStars += repo.stargazers_count || 0;
         totalForks += repo.forks_count || 0;
         totalWatchers += repo.watchers_count || 0;
    });

    const techDetectionPromises: Promise<Record<string, number>>[] = [];

    for (const repoDetail of analyzedRepoDetails) {
      // Languages
      Object.entries(repoDetail.languages).forEach(([lang, bytes]) => {
        languageDistribution[lang] = (languageDistribution[lang] || 0) + bytes;
      });

      // Aggregated Quality (Old metrics, keep for now if needed elsewhere)
      aggregatedQuality.avgBestPracticesScore += repoDetail.codeQuality.bestPracticesScore;
      aggregatedQuality.avgSecurityIssuesScore += repoDetail.codeQuality.securityIssuesScore;
      aggregatedQuality.avgDocumentationScore += repoDetail.codeQuality.documentationScore;
      aggregatedQuality.avgTestSetupScore += repoDetail.codeQuality.testSetupScore;

      // --- Aggregate CURISM Factors ---
      aggregatedCurismFactors.contribution += calculateContributionScore(repoDetail.lastUpdated);
      aggregatedCurismFactors.reliability += repoDetail.codeQuality.testSetupScore;
      aggregatedCurismFactors.influence += calculateInfluenceScore(repoDetail.stars, repoDetail.forks);
      aggregatedCurismFactors.security += repoDetail.codeQuality.securityIssuesScore;
      aggregatedCurismFactors.maintainability += Math.round((repoDetail.codeQuality.bestPracticesScore + repoDetail.codeQuality.documentationScore) / 2);

      qualityScoresCount++;

      // Technology Detection
      if(repoDetail.hasPackageJson) {
          techDetectionPromises.push(detectTechnologies(username, repoDetail.name, repoDetail.dependencies, repoDetail.devDependencies));
      }
    }

    // --- Calculate Average CURISM Factors ---
    const finalAverageCurismFactors = { ...aggregatedCurismFactors };
    if (qualityScoresCount > 0) {
        finalAverageCurismFactors.contribution = Math.round(aggregatedCurismFactors.contribution / qualityScoresCount);
        finalAverageCurismFactors.reliability = Math.round(aggregatedCurismFactors.reliability / qualityScoresCount);
        finalAverageCurismFactors.influence = Math.round(aggregatedCurismFactors.influence / qualityScoresCount);
        finalAverageCurismFactors.security = Math.round(aggregatedCurismFactors.security / qualityScoresCount);
        finalAverageCurismFactors.maintainability = Math.round(aggregatedCurismFactors.maintainability / qualityScoresCount);
    } else {
         Object.keys(finalAverageCurismFactors).forEach(key => finalAverageCurismFactors[key as keyof typeof finalAverageCurismFactors] = 0);
    }


     // Run technology detection in parallel
     const techResults = await Promise.all(techDetectionPromises);
     techResults.forEach(usage => {
         for (const [tech, count] of Object.entries(usage)) {
             technologyUsage[tech] = (technologyUsage[tech] || 0) + count;
         }
     });


    // Finalize Aggregated Quality (Old metrics)
    const finalAggregatedQuality: AggregatedCodeQuality = {
         avgBestPracticesScore: qualityScoresCount > 0 ? Math.round(aggregatedQuality.avgBestPracticesScore / qualityScoresCount) : 0,
         avgSecurityIssuesScore: qualityScoresCount > 0 ? Math.round(aggregatedQuality.avgSecurityIssuesScore / qualityScoresCount) : 0,
         avgDocumentationScore: qualityScoresCount > 0 ? Math.round(aggregatedQuality.avgDocumentationScore / qualityScoresCount) : 0,
         avgTestSetupScore: qualityScoresCount > 0 ? Math.round(aggregatedQuality.avgTestSetupScore / qualityScoresCount) : 0,
         commonSuggestions: [], // Generate these based on final averages
     };


    // --- Prepare Final Result ---
    const analysisResult: RepositoryAnalysisResult = {
      username,
      totalRepos,
      analyzedReposCount,
      totalStars,
      totalForks,
      totalWatchers,
      languageDistribution,
      technologyUsage,
      commitActivity: {
        totalContributionsLastYear: contributionData.totalContributionsLastYear,
        longestStreak: contributionData.longestStreak,
        currentStreak: contributionData.currentStreak,
      },
      aggregatedCodeQuality: finalAggregatedQuality, // Keep old quality aggregation for now
      averageCurismFactors: finalAverageCurismFactors, // Add the new average factors for the radar
      topRepositories: analyzedRepoDetails
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 5)
        .map(repo => ({ // Select needed fields, INCLUDING acidScores
            name: repo.name,
            description: repo.description,
            stars: repo.stars,
            forks: repo.forks,
            primaryLanguage: repo.primaryLanguage,
            lastUpdated: repo.lastUpdated,
            curismScore: repo.curismScore,
            acidScores: repo.acidScores, // Pass ACID scores to frontend
         })),
      contributionGraph: contributionData.contributionGraph,
      recommendations: [], // Initialize
      analysisTimestamp: new Date().toISOString(),
    };

    analysisResult.recommendations = generateRecommendations(analysisResult); // Generate recommendations based on the final result

    const endTime = Date.now();
    console.log(`Analysis for ${username} completed in ${(endTime - startTime) / 1000} seconds.`);

    // --- Save analysis result to database ---
    try {
      // Prisma expects the JSON data to be compatible with `Prisma.InputJsonValue`
      // Our `analysisResult` object should be compatible.
      await prisma.repositoryAnalysis.upsert({
        where: {
          userId_username: {
            userId: userId,
            username: username
          }
        },
        create: {
          userId: userId,
          username: username,
          data: JSON.parse(JSON.stringify(analysisResult)) // Convert to plain JSON object
        },
        update: {
          data: JSON.parse(JSON.stringify(analysisResult)),
          updatedAt: new Date(), // Explicitly update the timestamp
        },
      });
      console.log(`Saved analysis result for ${username} to database.`);
    } catch (dbSaveError) {
      console.error(`Error saving analysis result for ${username} to database:`, dbSaveError);
      // Decide how to handle this: maybe return the result anyway but log the error?
      // Returning the result allows the UI to update even if DB save fails.
    }

    return analysisResult;

  } catch (error) {
    console.error(`Error analyzing repositories for ${username}:`, error);
    if (error instanceof z.ZodError) {
        throw new Error(`Invalid username: ${error.errors.map(e => e.message).join(', ')}`);
    }
    // Add more specific error handling if needed
    throw new Error(`Failed to analyze repositories for ${username}. GitHub API limit might be reached or the user may not exist.`);
  }
}