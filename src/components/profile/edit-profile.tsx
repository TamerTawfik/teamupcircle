"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormSchema } from "@/lib/validations/profile";
import { ProfileWithCollaboration } from "@/types/profile";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import tech from "@/data/tech.json";
import projectDomains from "@/data/project-domains.json";
import roles from "@/data/roles.json";

const inputSearch = async (
  value: string,
  options: Option[]
): Promise<Option[]> => {
  return new Promise((resolve) => {
    const res = options.filter((option) => option.value.includes(value));
    resolve(res);
  });
};

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: ProfileWithCollaboration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof ProfileFormSchema>>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      availabilityStatus:
        user.collaborationStyles?.availabilityStatus || "AVAILABLE",
      hoursPerWeek: user.collaborationStyles?.hoursPerWeek || 0,
      teamSize: user.collaborationStyles?.teamSize || "Less_Than_5",
      techStack:
        user.collaborationStyles?.techStack?.map((tech) => ({
          value: tech,
          label: tech,
        })) || [],
      teamRoles:
        user.collaborationStyles?.teamRoles?.map((role) => ({
          value: role,
          label: role,
        })) || [],
      projectDomains:
        user.collaborationStyles?.projectDomains?.map((domain) => ({
          value: domain,
          label: domain,
        })) || [],
    },
  });

  async function onSubmit(values: z.infer<typeof ProfileFormSchema>) {
    try {
      setIsSubmitting(true);
      const result = await updateProfile(user.id, values);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Update Error",
          description: result.error as string,
        });
        return;
      }

      toast({
        title: "Update Success",
        description: "Profile updated successfully",
      });
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="">
              {/* Technical Preferences */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold">Technical Preferences</h3>
                <FormField
                  control={form.control}
                  name="techStack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Tech Stack
                      </FormLabel>
                      <FormControl>
                        <MultipleSelector
                          {...field}
                          hidePlaceholderWhenSelected
                          hideClearAllButton
                          triggerSearchOnFocus
                          maxSelected={12}
                          onMaxSelected={(maxLimit) => {
                            toast({
                              variant: "destructive",
                              title: `You have reached max selected: ${maxLimit}`,
                            });
                          }}
                          onSearch={async (value) => {
                            const res = await inputSearch(value, tech);
                            return res;
                          }}
                          placeholder="trying to search 'a' to get more options..."
                          loadingIndicator={
                            <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                              loading...
                            </p>
                          }
                          emptyIndicator={
                            <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                              no results found.
                            </p>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Team Roles
                      </FormLabel>
                      <FormControl>
                        <MultipleSelector
                          {...field}
                          hidePlaceholderWhenSelected
                          hideClearAllButton
                          triggerSearchOnFocus
                          maxSelected={3}
                          onMaxSelected={(maxLimit) => {
                            toast({
                              variant: "destructive",
                              title: `You have reached max selected: ${maxLimit}`,
                            });
                          }}
                          onSearch={async (value) => {
                            const res = await inputSearch(value, roles);
                            return res;
                          }}
                          placeholder="trying to search 'a' to get more options..."
                          loadingIndicator={
                            <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                              loading...
                            </p>
                          }
                          emptyIndicator={
                            <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                              no results found.
                            </p>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectDomains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Project Domains
                      </FormLabel>
                      <FormControl>
                        <MultipleSelector
                          {...field}
                          hidePlaceholderWhenSelected
                          hideClearAllButton
                          triggerSearchOnFocus
                          maxSelected={12}
                          onMaxSelected={(maxLimit) => {
                            toast({
                              variant: "destructive",
                              title: `You have reached max selected: ${maxLimit}`,
                            });
                          }}
                          onSearch={async (value) => {
                            const res = await inputSearch(
                              value,
                              projectDomains
                            );
                            return res;
                          }}
                          placeholder="trying to search 'a' to get more options..."
                          loadingIndicator={
                            <p className="py-2 text-center text-lg leading-10 text-muted-foreground">
                              loading...
                            </p>
                          }
                          emptyIndicator={
                            <p className="w-full text-center text-lg leading-10 text-muted-foreground">
                              no results found.
                            </p>
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Collaboration Preferences */}
              <div className="space-y-6">
                <h3 className="text-md font-semibold pt-6">
                  Collaboration Preferences
                </h3>
                <FormField
                  control={form.control}
                  name="availabilityStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Availability Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="NOT_AVAILABLE">
                            Not Available
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="hoursPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Hours per Week
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Available hours per week"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-[#878787] font-normal">
                        Preferred Team Size
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Open_TO_ANY">
                            Open to Any
                          </SelectItem>
                          <SelectItem value="Less_Than_5">
                            Less than 5
                          </SelectItem>
                          <SelectItem value="Less_Than_10">
                            Less than 10
                          </SelectItem>
                          <SelectItem value="Less_Than_20">
                            Less than 20
                          </SelectItem>
                          <SelectItem value="More_Than_20">
                            More than 20
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
