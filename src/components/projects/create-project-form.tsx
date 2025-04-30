"use client";

import React, { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProject as actionCreateProject,
  CreateProjectState,
  fetchUserRepos,
} from "@/app/actions/projects";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2, Github } from "lucide-react";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import techOptionsData from "@/data/techs.json";
import roleOptionsData from "@/data/teamRoles.json";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
        </>
      ) : (
        "Create Project"
      )}
    </Button>
  );
}

// Map imported data to the format required by MultipleSelector
const techOptions: Option[] = techOptionsData.map((tech) => ({
  value: tech.id,
  label: tech.name,
}));

const roleOptions: Option[] = roleOptionsData.map((role) => ({
  value: role.id,
  label: role.name,
}));

interface CreateProjectFormProps {
  onFormSuccess?: () => void; // Optional callback for success
}

export default function CreateProjectForm({
  onFormSuccess,
}: CreateProjectFormProps) {
  const initialState: CreateProjectState = {
    error: undefined,
    fieldErrors: undefined,
    success: undefined,
    project: undefined,
  };
  const [state, dispatch] = useActionState(actionCreateProject, initialState);

  // State for multiple selectors
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Option[]>([]);

  // State for GitHub repos
  const [userRepos, setUserRepos] = useState<{ name: string; url: string }[]>(
    []
  );
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>("");

  // Fetch user repos on component mount
  useEffect(() => {
    setIsLoadingRepos(true);
    setRepoError(null);
    fetchUserRepos()
      .then((result) => {
        if (result.error) {
          setRepoError(result.error);
        } else if (result.repos) {
          setUserRepos(result.repos);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch repos:", err);
        setRepoError(
          "An unexpected error occurred while fetching repositories."
        );
      })
      .finally(() => {
        setIsLoadingRepos(false);
      });
  }, []);

  // Effect to handle successful submission
  useEffect(() => {
    if (state.success && state.project) {
      if (onFormSuccess) {
        onFormSuccess();
      }
    }
  }, [state.success, state.project, onFormSuccess]);

  // Handle repo selection change
  const handleRepoChange = (value: string) => {
    // Allow deselecting to 'none' or manual entry
    if (value === "none") {
      setSelectedRepoUrl("");
    } else {
      setSelectedRepoUrl(value);
    }
  };

  return (
    <form action={dispatch}>
      <div className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., Awesome Project"
            required
            aria-describedby="name-error"
          />
          {state?.fieldErrors?.name && (
            <p id="name-error" className="text-sm text-red-500">
              {state.fieldErrors.name.join(", ")}
            </p>
          )}
        </div>

        {/* GitHub Repository Selection */}
        <div className="space-y-2">
          <Label htmlFor="github-repo-select">
            Import from your GitHub Repository *
          </Label>
          {isLoadingRepos && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your
              repositories...
            </div>
          )}
          {repoError && (
            <Alert variant="destructive" className="text-xs">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Could not load repositories</AlertTitle>
              <AlertDescription>{repoError}</AlertDescription>
            </Alert>
          )}
          {!isLoadingRepos && !repoError && (
            <Select
              onValueChange={handleRepoChange}
              value={selectedRepoUrl || "none"} // Use 'none' if empty for placeholder logic
              required
            >
              <SelectTrigger id="github-repo-select">
                <SelectValue placeholder="Select a repository..." />
              </SelectTrigger>
              <SelectContent>
                {userRepos.map((repo) => (
                  <SelectItem key={repo.url} value={repo.url}>
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 opacity-70" /> {repo.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!isLoadingRepos && !repoError && userRepos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No repositories found or GitHub account not linked. Please try
              again later.
            </p>
          )}

          {/* Hidden input to store the actual URL for the form */}
          <input type="hidden" name="githubRepoUrl" value={selectedRepoUrl} />

          {/* Display field error for githubRepoUrl if any */}
          {state?.fieldErrors?.githubRepoUrl && (
            <p id="githubRepoUrl-error" className="text-sm text-red-500">
              {state.fieldErrors.githubRepoUrl.join(", ")}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            This field is required.
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags / Tech Stack</Label>
          <MultipleSelector
            value={selectedTags}
            onChange={setSelectedTags}
            defaultOptions={techOptions}
            placeholder="Select or create tags..."
            creatable
            emptyIndicator={
              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                No tags found / created.
              </p>
            }
            badgeClassName="text-xs"
            aria-describedby="tags-error"
          />
          <p className="text-sm text-muted-foreground">
            Helps others find your project. Enter custom tags if needed.
          </p>
          {/* Hidden inputs for tags */}
          {selectedTags.map((tag) => (
            <input
              key={`tag-${tag.value}`}
              type="hidden"
              name="tags"
              value={tag.value}
            />
          ))}
          {state?.fieldErrors?.tags && (
            <p id="tags-error" className="text-sm text-red-500">
              {state.fieldErrors.tags.join(", ")}
            </p>
          )}
        </div>

        {/* Required Roles */}
        <div className="space-y-2">
          <Label>Roles Needed</Label>
          <MultipleSelector
            value={selectedRoles}
            onChange={setSelectedRoles}
            defaultOptions={roleOptions}
            placeholder="Select or create roles..."
            creatable
            emptyIndicator={
              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                No roles found / created.
              </p>
            }
            badgeClassName="text-xs"
            aria-describedby="roles-error"
          />
          <p className="text-sm text-muted-foreground">
            What kind of collaborators are you looking for?
          </p>
          {/* Hidden inputs for roles */}
          {selectedRoles.map((role) => (
            <input
              key={`role-${role.value}`}
              type="hidden"
              name="requiredRoles"
              value={role.value}
            />
          ))}
          {state?.fieldErrors?.requiredRoles && (
            <p id="roles-error" className="text-sm text-red-500">
              {state.fieldErrors.requiredRoles.join(", ")}
            </p>
          )}
        </div>

        {/* Beginner Friendly Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox id="isBeginnerFriendly" name="isBeginnerFriendly" />
          <Label
            htmlFor="isBeginnerFriendly"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            This project is beginner-friendly
          </Label>
        </div>

        {/* Display Server Messages */}
        {state?.error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {/* Display form-level errors */}
        {state?.fieldErrors?._form && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Creation Failed</AlertTitle>
            <AlertDescription>
              {state.fieldErrors._form.join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </div>
      {/* Form Footer with Submit Button - Placed outside the scrolling div */}
      <div className="mt-6 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
