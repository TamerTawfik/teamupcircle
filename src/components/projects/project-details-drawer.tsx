"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getProjectDetailsFromGitHub,
  GitHubRepoDetails,
  getMembershipStatus,
  deleteProject,
  updateProject,
} from "@/app/actions/projects";
import {
  Github,
  Link as LinkIcon,
  Star,
  GitFork,
  AlertCircle,
  Calendar,
  History,
  FileText,
  BookOpen,
  Loader2,
  Trash2,
  Edit,
  Save,
  X,
  Users,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ProjectWithOwnerAndCount } from "./my-projects-client";
import { ProjectMembershipStatus } from "@prisma/client";

import { ContributorList } from "@/components/projects/contributor-list";
import { IssueBrowser } from "@/components/projects/issue-browser";
import { JoinProjectButton } from "@/components/projects/join-project-button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import { Label } from "@/components/ui/label";
import roleOptionsData from "@/data/teamRoles.json";

const roleOptions: Option[] = roleOptionsData.map((role) => ({
  value: role.id,
  label: role.name,
}));

interface ProjectDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithOwnerAndCount | null;
  currentUserId: string;
}

function renderDetailItem(
  IconComponent: React.ElementType,
  label: string,
  value: React.ReactNode | string | number | undefined | null,
  link?: string,
  className?: string
) {
  if (value === undefined || value === null || value === "") return null;

  const content = link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline break-all"
    >
      {value.toString()}
    </a>
  ) : (
    <span className="text-foreground break-words">{value.toString()}</span>
  );

  return (
    <div className={`flex items-start space-x-2 text-sm ${className}`}>
      <IconComponent className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-grow">
        <span className="font-medium text-muted-foreground">{label}:</span>{" "}
        {content}
      </div>
    </div>
  );
}

export function ProjectDetailsDrawer({
  isOpen,
  onClose,
  project,
  currentUserId,
}: ProjectDetailsDrawerProps) {
  const [details, setDetails] = useState<GitHubRepoDetails | null>(null);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const [membership, setMembership] = useState<{
    status: ProjectMembershipStatus | null;
    isMember: boolean;
    error?: string;
    loading: boolean;
  }>({ status: null, isMember: false, loading: false });

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editRoles, setEditRoles] = useState<Option[]>([]);

  const githubRepoUrl = project?.githubRepoUrl;
  const projectName = project?.name;
  const isOwner = project?.ownerId === currentUserId;

  useEffect(() => {
    if (isOpen && githubRepoUrl) {
      const fetchDetails = async () => {
        setLoadingGitHub(true);
        setGithubError(null);
        setDetails(null);
        try {
          const result = await getProjectDetailsFromGitHub(githubRepoUrl);
          if (result.error) {
            setGithubError(result.error);
          } else {
            setDetails(result);
          }
        } catch (err) {
          console.error("Failed to fetch project details:", err);
          setGithubError("An unexpected error occurred fetching GitHub data.");
        } finally {
          setLoadingGitHub(false);
        }
      };
      fetchDetails();
    } else {
      setDetails(null);
      setGithubError(null);
      setLoadingGitHub(false);
    }
  }, [isOpen, githubRepoUrl]);

  useEffect(() => {
    if (isOpen && project?.id && !isOwner) {
      setMembership((prev) => ({ ...prev, loading: true }));
      getMembershipStatus(project.id)
        .then((result) => {
          setMembership({
            status: result.status,
            isMember: result.isMember,
            error: result.error,
            loading: false,
          });
        })
        .catch((err) => {
          console.error("Failed to fetch membership status:", err);
          setMembership({
            status: null,
            isMember: false,
            error: "Failed to load membership status.",
            loading: false,
          });
        });
    } else {
      setMembership({ status: null, isMember: false, loading: false });
    }
  }, [isOpen, project?.id, isOwner]);

  useEffect(() => {
    if (!isOpen || !project) {
      setIsEditing(false);
    } else {
      setEditRoles(
        project.requiredRoles.map((role) => ({ value: role, label: role }))
      );
    }
  }, [isOpen, project]);

  const handleEditToggle = () => {
    if (isOwner) {
      setIsEditing(!isEditing);
      if (!isEditing && project) {
        setEditRoles(
          project.requiredRoles.map((role) => ({ value: role, label: role }))
        );
      }
    }
  };

  const handleSaveChanges = (formData: FormData) => {
    if (!project || !isOwner) return;

    startTransition(async () => {
      const updateResult = await updateProject(
        {
          /* prevState */
        },
        formData
      );
      if (updateResult.error) {
        toast.error(updateResult.error || "Failed to save changes.", {
          description: updateResult.fieldErrors?._form?.join(", "),
        });
      } else {
        toast.success("Project updated successfully!");
        setIsEditing(false);
        onClose();
      }
    });
  };

  const handleDeleteProject = () => {
    if (!project || !isOwner) return;

    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result.error) {
        toast.error(result.error || "Failed to delete project.");
      } else {
        toast.success("Project deleted successfully!");
        onClose();
      }
    });
  };

  const renderContent = () => {
    if (!project) {
      return (
        <p className="text-center py-8 text-muted-foreground">
          Loading project...
        </p>
      );
    }

    const formattedCreatedAt = details?.createdAt
      ? formatDistanceToNow(new Date(details.createdAt), { addSuffix: true })
      : "N/A";
    const formattedUpdatedAt = details?.updatedAt
      ? formatDistanceToNow(new Date(details.updatedAt), { addSuffix: true })
      : "N/A";
    const formattedPushedAt = details?.pushedAt
      ? formatDistanceToNow(new Date(details.pushedAt), { addSuffix: true })
      : "N/A";

    return (
      <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-14rem)]">
        <div className="space-y-6 p-4 md:p-6">
          {loadingGitHub && (
            <p className="text-sm text-muted-foreground text-center py-4">
              <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
              Loading GitHub details...
            </p>
          )}
          {githubError && (
            <p className="text-sm text-destructive text-center py-4">
              Error loading GitHub data: {githubError}
            </p>
          )}

          {renderDetailItem(
            FileText,
            "Description",
            details?.description || "No description provided."
          )}
          {renderDetailItem(
            LinkIcon,
            "Homepage",
            details?.homepage,
            details?.homepage ?? undefined
          )}
          {renderDetailItem(
            Github,
            "GitHub Repo",
            details?.htmlUrl,
            details?.htmlUrl
          )}

          <Separator />

          <div className="space-y-3">
            {renderDetailItem(
              Flag,
              "Beginner Friendly",
              project.isBeginnerFriendly ? "Yes" : "No"
            )}
            <div>
              <Label className="text-sm font-medium text-muted-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Roles Needed
              </Label>
              {project.requiredRoles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {project.requiredRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  None specified
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {renderDetailItem(Star, "Stars", details?.stars)}
            {renderDetailItem(GitFork, "Forks", details?.forksCount)}
            {renderDetailItem(
              AlertCircle,
              "Open Issues",
              details?.openIssuesCount
            )}

            {renderDetailItem(
              BookOpen,
              "License",
              details?.license?.name || "N/A"
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3">
            {renderDetailItem(Calendar, "Created", formattedCreatedAt)}
            {renderDetailItem(History, "Last Update", formattedUpdatedAt)}
            {renderDetailItem(History, "Last Push", formattedPushedAt)}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Tech Stack
            </h4>
          </div>

          {details?.topics && details.topics.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                GitHub Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {details.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {details?.languages && details.languages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                Languages
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {details.languages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {details?.contributors && details.contributors.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Contributors
                </h4>
                <ContributorList contributors={details.contributors} />
              </div>
            </>
          )}

          {/* Issues Section */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Open Issues (
              {details?.openIssuesCount ?? "N/A"})
            </h3>
            {loadingGitHub ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : githubError ? (
              <p className="text-sm text-destructive">{githubError}</p>
            ) : details?.issues && details.issues.length > 0 ? (
              <IssueBrowser issues={details.issues} repoUrl={details.htmlUrl} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No open issues found or unable to load issues.
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    );
  };

  const renderEditForm = () => {
    if (!project || !isOwner || !isEditing) return null;

    return (
      <form
        action={handleSaveChanges}
        className="p-4 md:p-6 border-t space-y-4"
      >
        <input type="hidden" name="projectId" value={project.id} />
        <h3 className="text-lg font-semibold">Edit Project Settings</h3>
        <div className="space-y-2">
          <Label>Roles Needed</Label>
          <MultipleSelector
            value={editRoles}
            onChange={setEditRoles}
            defaultOptions={roleOptions}
            placeholder="Select or create roles..."
            creatable
            emptyIndicator={
              <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                No roles specified.
              </p>
            }
            badgeClassName="text-xs"
          />
          {editRoles.map((role) => (
            <input
              key={`edit-role-${role.value}`}
              type="hidden"
              name="requiredRoles"
              value={role.value}
            />
          ))}
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleEditToggle}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}{" "}
            Save Changes
          </Button>
        </div>
      </form>
    );
  };

  return (
    <Drawer direction="right" open={isOpen} onClose={onClose}>
      <DrawerContent className="h-full w-full max-w-2xl ml-auto flex flex-col">
        <DrawerHeader className="p-4 md:p-6 border-b flex-shrink-0">
          <DrawerTitle className="text-xl">
            {projectName || "Project Details"}
          </DrawerTitle>
        </DrawerHeader>

        {isEditing ? renderEditForm() : renderContent()}

        {!isEditing && (
          <DrawerFooter className="p-4 md:p-6 border-t mt-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <div className="flex gap-2">
                {details?.htmlUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={details.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" /> GitHub
                    </a>
                  </Button>
                )}
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditToggle}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                )}
                {!isOwner && project && (
                  <JoinProjectButton
                    projectId={project.id}
                    ownerId={project.ownerId}
                    membershipStatus={membership.status}
                    isMembershipLoading={membership.loading}
                    size="sm"
                  />
                )}
              </div>

              <div className="flex gap-2">
                {isOwner && project && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          <AlertTriangle className="inline mr-2 h-5 w-5 text-destructive" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the project `{project.name}` and all associated
                          membership data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDeleteProject}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}{" "}
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <DrawerClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </div>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
