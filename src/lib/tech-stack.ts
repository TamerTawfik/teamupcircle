/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { cache } from "react";

export const languageStatsSchema = z.object({
  name: z.string(),
  size: z.number(),
  color: z.string().nullable(),
  firstUsed: z.string(),
  lastUsed: z.string(),
  frameworks: z.array(z.string()),
});

export const repoLanguagesSchema = z.record(z.number());

export type LanguageStats = z.infer<typeof languageStatsSchema>;

const CACHE_TIME = 3600; // 1 hour in seconds

// Map of common file extensions and dependencies to frameworks/libraries
type TechMapping = {
  [language: string]: {
    frameworks: {
      [file: string]: {
        [dependency: string]: string;
      };
    };
  };
};

const TECH_MAPPING: TechMapping = {
  // Languages to Frameworks/Libraries
  JavaScript: {
    frameworks: {
      'package.json': {
        'react': 'React',
        'vue': 'Vue.js',
        'angular': 'Angular',
        'next': 'Next.js',
        'express': 'Express.js',
        'nest': 'NestJS'
      }
    }
  },
  TypeScript: {
    frameworks: {
      'package.json': {
        'react': 'React',
        'vue': 'Vue.js',
        'angular': 'Angular',
        'next': 'Next.js',
        '@nestjs': 'NestJS'
      }
    }
  },
  Python: {
    frameworks: {
      'requirements.txt': {
        'django': 'Django',
        'flask': 'Flask',
        'fastapi': 'FastAPI'
      }
    }
  },
  Ruby: {
    frameworks: {
      'Gemfile': {
        'rails': 'Ruby on Rails',
        'sinatra': 'Sinatra'
      }
    }
  }
};

export const getTechStack = cache(async (username: string) => {
  try {
    // Fetch user's repositories
    const repos = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: CACHE_TIME },
      }
    );

    if (!repos.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const reposData = await repos.json();
    
    // Track language usage and frameworks over time
    const languageData = new Map<string, {
      size: number,
      stars: number,
      firstUsed: string,
      lastUsed: string,
      frameworks: Set<string>
    }>();

    // Fetch languages and dependency files for each repository
    const repoAnalysisPromises = reposData.map(async (repo: any) => {
      const [languages, packageJson] = await Promise.all([
        fetch(repo.languages_url, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          next: { revalidate: CACHE_TIME },
        }).then(res => res.ok ? res.json() : null),
        fetch(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          next: { revalidate: CACHE_TIME },
        }).then(res => res.ok ? res.json() : null)
          .then(data => data ? JSON.parse(atob(data.content)) : null)
          .catch(() => null)
      ]);

      if (!languages) return null;

      // Process each language in the repository
      Object.entries(languages).forEach(([lang, bytes]) => {
        const existingData = languageData.get(lang) || {
          size: 0,
          stars: 0,
          firstUsed: repo.created_at,
          lastUsed: repo.pushed_at,
          frameworks: new Set<string>()
        };

        // Update language statistics
        existingData.size += bytes as number;
        existingData.stars += repo.stargazers_count;
        existingData.firstUsed = repo.created_at < existingData.firstUsed ? 
          repo.created_at : existingData.firstUsed;
        existingData.lastUsed = repo.pushed_at > existingData.lastUsed ?
          repo.pushed_at : existingData.lastUsed;

        // Detect frameworks from package.json
        if (packageJson && TECH_MAPPING[lang]?.frameworks['package.json']) {
          const frameworkMapping = TECH_MAPPING[lang].frameworks['package.json'];
          Object.entries(frameworkMapping).forEach(([dep, framework]) => {
            if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
              existingData.frameworks.add(framework as string);
            }
          });
        }

        languageData.set(lang, existingData);
      });
    });

    await Promise.all(repoAnalysisPromises);

    // Get language colors
    const colors = await fetch('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml')
      .then(res => res.text())
      .then(text => {
        const langs = text.split('\n').reduce((acc: Record<string, string>, line) => {
          const colorMatch = line.match(/^([^#]+).*?color: ("?)([^"]+)\2$/);
          if (colorMatch) {
            acc[colorMatch[1].trim()] = colorMatch[3];
          }
          return acc;
        }, {});
        return langs;
      });

    // Format data for charts
    const pieChartData = Array.from(languageData.entries())
      .map(([name, data]) => ({
        name,
        size: data.size,
        color: colors[name] || '#808080',
        firstUsed: data.firstUsed,
        lastUsed: data.lastUsed,
        frameworks: Array.from(data.frameworks)
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Calculate years of experience for each language
    const languageExperience = pieChartData.map(lang => {
      const firstUsed = new Date(lang.firstUsed);
      const lastUsed = new Date(lang.lastUsed);
      const yearsExp = ((lastUsed.getTime() - firstUsed.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
      return {
        ...lang,
        yearsOfExperience: Number(yearsExp)
      };
    });

    // Generate timeline data
    const timelineData = new Map<string, Record<string, number>>();
    languageData.forEach((data, lang) => {
      const startYear = new Date(data.firstUsed).getFullYear();
      const endYear = new Date(data.lastUsed).getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        const yearKey = year.toString();
        if (!timelineData.has(yearKey)) {
          timelineData.set(yearKey, {});
        }
        const yearData = timelineData.get(yearKey)!;
        yearData[lang] = data.size;
      }
    });

    const timelineChartData = Array.from(timelineData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, langs]) => ({
        year,
        ...langs
      }));

    return {
      pieChartData: languageExperience,
      timelineChartData,
      languageExperience,
      totalRepos: reposData.length,
      totalStars: reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0),
    };
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    throw error;
  }
});