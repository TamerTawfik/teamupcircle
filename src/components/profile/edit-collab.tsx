"use client";

import React, { useState, useEffect, useTransition, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AvailabilityStatus, TeamSize } from "@prisma/client";
import {
  getCollaborationStyle,
  upsertCollaborationStyle,
  CollaborationStyleInput,
} from "@/app/actions/collab";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Kept ScrollArea
// Import data for multi-selects
import techOptionsData from "@/data/techs.json";
import domainOptionsData from "@/data/projectDomains.json";
import roleOptionsData from "@/data/teamRoles.json";

// Import the new MultipleSelector component and its Option type
import MultipleSelector, { Option } from "@/components/multiple-selector";

// Zod schema for form validation (client-side mirror of server action schema)
const FormSchema = z.object({
  availabilityStatus: z.nativeEnum(AvailabilityStatus),
  hoursPerWeek: z.preprocess(
    (val) => (val === "" || val === null ? null : Number(val)),
    z.number().int().min(0).max(168).nullable()
  ),
  teamSize: z.nativeEnum(TeamSize),
  techIds: z.array(z.string()).min(0), // Allow empty array
  projectDomainIds: z.array(z.string()).min(0),
  teamRoleIds: z.array(z.string()).min(0),
});

// Map imported data to the format required by MultipleSelector
const techOptions: Option[] = techOptionsData.map((tech) => ({
  value: tech.id,
  label: tech.name,
}));
const domainOptions: Option[] = domainOptionsData.map((domain) => ({
  value: domain.id,
  label: domain.name,
}));
const roleOptions: Option[] = roleOptionsData.map((role) => ({
  value: role.id,
  label: role.name,
}));

// The Form component itself
interface CollaborationFormProps {
  onSaveSuccess: () => void; // Callback to close dialog
}

function CollaborationStyleForm({ onSaveSuccess }: CollaborationFormProps) {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      availabilityStatus: AvailabilityStatus.AVAILABLE,
      hoursPerWeek: null,
      teamSize: TeamSize.Open_TO_ANY,
      techIds: [],
      projectDomainIds: [],
      teamRoleIds: [],
    },
  });

  // Fetch existing data when the form mounts (inside the dialog)
  useEffect(() => {
    let isMounted = true;
    setIsLoadingData(true);
    getCollaborationStyle(session?.user.id as string)
      .then((data) => {
        if (isMounted && data) {
          form.reset({
            availabilityStatus: data.availabilityStatus,
            hoursPerWeek: data.hoursPerWeek,
            teamSize: data.teamSize,
            techIds: data.techs.map((t) => t.id),
            projectDomainIds: data.projectDomains.map((d) => d.id),
            teamRoleIds: data.teamRoles.map((r) => r.id),
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load collaboration style:", err);
          toast.error("Failed to load existing preferences.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [form, session?.user.id]);

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      const result = await upsertCollaborationStyle(
        values as CollaborationStyleInput
      );
      if (result.success) {
        toast.success("Collaboration preferences updated!");
        onSaveSuccess(); // Call the callback to close the dialog
      } else {
        toast.error(`Update failed: ${result.error || "Unknown error"}`);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isLoadingData ? (
          <p>Loading existing preferences...</p>
        ) : (
          <>
            {/* Availability Status */}
            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(AvailabilityStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hours per Week */}
            <FormField
              control={form.control}
              name="hoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours per Week (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      min="0"
                      max="168"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    How many hours you&apos;re typically available to
                    collaborate per week.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Size */}
            <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Team Size</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred team size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TeamSize).map((size) => (
                        <SelectItem key={size} value={size}>
                          {size
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tech Stack */}
            <FormField
              control={form.control}
              name="techIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Tech Stack</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      defaultOptions={techOptions}
                      placeholder="Select technologies..."
                      value={techOptions.filter((option) =>
                        field.value?.includes(option.value)
                      )}
                      onChange={(options) =>
                        field.onChange(options.map((option) => option.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Technologies you enjoy or prefer working with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Domains */}
            <FormField
              control={form.control}
              name="projectDomainIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Project Domains</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      defaultOptions={domainOptions}
                      placeholder="Select domains..."
                      value={domainOptions.filter((option) =>
                        field.value?.includes(option.value)
                      )}
                      onChange={(options) =>
                        field.onChange(options.map((option) => option.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Areas or types of projects you&apos;re interested in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Roles */}
            <FormField
              control={form.control}
              name="teamRoleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Team Roles</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      defaultOptions={roleOptions}
                      placeholder="Select roles..."
                      value={roleOptions.filter((option) =>
                        field.value?.includes(option.value)
                      )}
                      onChange={(options) =>
                        field.onChange(options.map((option) => option.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Roles you prefer to take on within a team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Footer Buttons inside the form */}
        <DialogFooter className="pt-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending || isLoadingData}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending || isLoadingData}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// The main export - the Dialog component wrapper
interface EditCollabModalProps {
  children: ReactNode; // The trigger element
}

export function EditCollabModal({ children }: EditCollabModalProps) {
  const [open, setOpen] = useState(false);

  const handleSaveSuccess = () => {
    setOpen(false); // Close the dialog on successful save
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Collaboration Preferences</DialogTitle>
          <DialogDescription>
            Update your preferred way of working with others.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1 pr-5">
          {open && <CollaborationStyleForm onSaveSuccess={handleSaveSuccess} />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
