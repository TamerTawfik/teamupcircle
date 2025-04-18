/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileFilters } from "@/app/actions/profiles";
import { AvailabilityStatus, TeamSize } from "@prisma/client"; // Import enums
import MultipleSelector, {
  Option,
} from "@/components/profile/multiple-selector";
import {
  LookupItem,
  getTechOptions,
  getProjectDomainOptions,
  getTeamRoleOptions,
} from "@/app/actions/lookups";

// Helper function to get enum values (useful for dropdowns)
function getEnumValues<T extends object>(enumObject: T): string[] {
  // Filter out numeric keys if it's a numeric enum
  return Object.values(enumObject).filter((value) => typeof value === "string");
}

interface ProfileFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilters: ProfileFilters;
  onApplyFilters: (filters: ProfileFilters) => void;
}

export function ProfileFilterDrawer({
  open,
  onOpenChange,
  initialFilters,
  onApplyFilters,
}: ProfileFilterDrawerProps) {
  const [internalFilters, setInternalFilters] = useState<{
    location?: string;
    username?: string;
    techStack?: Option[]; // Use Option[] internally
    availabilityStatus?: AvailabilityStatus;
    teamSize?: TeamSize;
    projectDomains?: Option[]; // Use Option[] internally
    teamRoles?: Option[]; // Use Option[] internally
    hoursPerWeek?: number;
  }>({});

  const [techOptions, setTechOptions] = useState<Option[]>([]);
  const [domainOptions, setDomainOptions] = useState<Option[]>([]);
  const [roleOptions, setRoleOptions] = useState<Option[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    if (open && isLoadingOptions) {
      const fetchOptions = async () => {
        try {
          const [techs, domains, roles] = await Promise.all([
            getTechOptions(),
            getProjectDomainOptions(),
            getTeamRoleOptions(),
          ]);
          const mapToOptions = (items: LookupItem[]): Option[] =>
            items.map((item) => ({ value: item.name, label: item.name }));

          setTechOptions(mapToOptions(techs));
          setDomainOptions(mapToOptions(domains));
          setRoleOptions(mapToOptions(roles));
        } catch (error) {
          console.error("Failed to fetch filter options:", error);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open, isLoadingOptions]);

  useEffect(() => {
    const mapStringsToOptions = (
      values: string[] | undefined,
      availableOptions: Option[]
    ): Option[] => {
      if (!values) return [];
      return values
        .map((value) => {
          const foundOption = availableOptions.find(
            (opt) => opt.value === value
          );
          return foundOption ? foundOption : { value: value, label: value };
        })
        .filter((opt): opt is Option => opt !== null);
    };

    setInternalFilters({
      location: initialFilters.location,
      username: initialFilters.username,
      techStack: mapStringsToOptions(initialFilters.techStack, techOptions),
      availabilityStatus: initialFilters.availabilityStatus,
      teamSize: initialFilters.teamSize,
      projectDomains: mapStringsToOptions(
        initialFilters.projectDomains,
        domainOptions
      ),
      teamRoles: mapStringsToOptions(initialFilters.teamRoles, roleOptions),
      hoursPerWeek: initialFilters.hoursPerWeek,
    });
  }, [initialFilters, techOptions, domainOptions, roleOptions]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInternalFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? undefined : parseInt(value, 10);
    setInternalFilters((prev) => ({
      ...prev,
      [name]: isNaN(numValue as any) ? undefined : numValue,
    }));
  };

  const handleSelectChange = (name: keyof ProfileFilters, value: string) => {
    const key = name as keyof typeof internalFilters;
    setInternalFilters((prev) => ({
      ...prev,
      [key]: value === "ALL" || value === "" ? undefined : value,
    }));
  };

  const handleMultipleSelectorChange = (
    name: keyof Pick<
      typeof internalFilters,
      "techStack" | "projectDomains" | "teamRoles"
    >,
    selectedOptions: Option[]
  ) => {
    setInternalFilters((prev) => ({
      ...prev,
      [name]: selectedOptions,
    }));
  };

  const handleApply = () => {
    const filtersToApply: ProfileFilters = {
      location: internalFilters.location,
      username: internalFilters.username,
      availabilityStatus: internalFilters.availabilityStatus,
      teamSize: internalFilters.teamSize,
      hoursPerWeek: internalFilters.hoursPerWeek,
      techStack:
        internalFilters.techStack && internalFilters.techStack.length > 0
          ? internalFilters.techStack.map((opt) => opt.value)
          : undefined,
      projectDomains:
        internalFilters.projectDomains &&
        internalFilters.projectDomains.length > 0
          ? internalFilters.projectDomains.map((opt) => opt.value)
          : undefined,
      teamRoles:
        internalFilters.teamRoles && internalFilters.teamRoles.length > 0
          ? internalFilters.teamRoles.map((opt) => opt.value)
          : undefined,
    };

    onApplyFilters(filtersToApply);
    onOpenChange(false);
  };

  const handleClear = () => {
    setInternalFilters({
      techStack: [],
      projectDomains: [],
      teamRoles: [],
    });
    onApplyFilters({});
  };

  const availabilityStatuses = getEnumValues(AvailabilityStatus);
  const teamSizes = getEnumValues(TeamSize);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full max-w-sm ml-auto p-4">
        {" "}
        {/* Adjusted for right side */}
        <DrawerHeader>
          <DrawerTitle>Filter Profiles</DrawerTitle>
          <DrawerDescription>
            Refine the list of developer profiles.
          </DrawerDescription>
        </DrawerHeader>
        {isLoadingOptions ? (
          <div className="p-4 text-center">Loading options...</div>
        ) : (
          <div className="space-y-4 overflow-y-auto p-1 flex-grow">
            {" "}
            {/* Added padding, scroll, and flex-grow */}
            {/* User Filters */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={internalFilters.location || ""}
                onChange={handleInputChange}
                placeholder="Search by country or city..."
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={internalFilters.username || ""}
                onChange={handleInputChange}
                placeholder="Search by GitHub username..."
              />
            </div>
            {/* Collaboration Style Filters */}
            <div>
              <Label htmlFor="techStack">Tech Stack</Label>
              <MultipleSelector
                options={techOptions}
                value={internalFilters.techStack ?? []}
                onChange={(selected) =>
                  handleMultipleSelectorChange("techStack", selected)
                }
                placeholder="Select tech stack..."
                emptyIndicator="No tech found."
              />
            </div>
            <div>
              <Label htmlFor="projectDomains">Project Domains</Label>
              <MultipleSelector
                options={domainOptions}
                value={internalFilters.projectDomains ?? []}
                onChange={(selected) =>
                  handleMultipleSelectorChange("projectDomains", selected)
                }
                placeholder="Select domains..."
                emptyIndicator="No domains found."
              />
            </div>
            <div>
              <Label htmlFor="teamRoles">Team Roles</Label>
              <MultipleSelector
                options={roleOptions}
                value={internalFilters.teamRoles ?? []}
                onChange={(selected) =>
                  handleMultipleSelectorChange("teamRoles", selected)
                }
                placeholder="Select roles..."
                emptyIndicator="No roles found."
              />
            </div>
            <div>
              <Label htmlFor="hoursPerWeek">Min. Hours per Week</Label>
              <Input
                id="hoursPerWeek"
                name="hoursPerWeek"
                type="number"
                min="0"
                value={internalFilters.hoursPerWeek ?? ""}
                onChange={handleNumberInputChange}
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <Label htmlFor="availabilityStatus">Availability Status</Label>
              <Select
                name="availabilityStatus"
                value={internalFilters.availabilityStatus || ""}
                onValueChange={(value) =>
                  handleSelectChange("availabilityStatus", value)
                }
              >
                <SelectTrigger id="availabilityStatus">
                  <SelectValue placeholder="Any Status" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teamSize">Preferred Team Size</Label>
              <Select
                name="teamSize"
                value={internalFilters.teamSize || ""}
                onValueChange={(value) => handleSelectChange("teamSize", value)}
              >
                <SelectTrigger id="teamSize">
                  <SelectValue placeholder="Any Size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DrawerFooter className="mt-auto">
          {" "}
          {/* Push footer to bottom */}
          <Button onClick={handleApply}>Apply Filters</Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All Filters
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
