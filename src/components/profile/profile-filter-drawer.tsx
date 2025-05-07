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
import MultipleSelector, { Option } from "@/components/multiple-selector";

// Import JSON data directly
import techData from "@/data/techs.json";
import domainData from "@/data/projectDomains.json";
import roleData from "@/data/teamRoles.json";

// Define LookupItem locally as it's no longer imported
interface LookupItem {
  id: string;
  name: string;
}

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

// Helper function to map lookup items to selector options and sort them (defined outside component)
const mapToOptions = (items: LookupItem[]): Option[] =>
  items
    .map((item) => ({ value: item.name, label: item.name }))
    .sort((a, b) => a.label.localeCompare(b.label));

// Map imported data directly (constants defined outside component)
const techOptions = mapToOptions(techData as LookupItem[]);
const domainOptions = mapToOptions(domainData as LookupItem[]);
const roleOptions = mapToOptions(roleData as LookupItem[]);

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

  useEffect(() => {
    // Helper function to map initial string filter values back to Option objects
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
          // If the initial value isn't in our current options list, create a temporary option
          // This handles cases where filter values might persist from old/different option sets
          return foundOption ? foundOption : { value: value, label: value };
        })
        .filter((opt): opt is Option => opt !== null);
    };

    // Initialize internal state based on initialFilters prop
    setInternalFilters({
      location: initialFilters.location,
      username: initialFilters.username,
      // Use the constant, pre-processed options
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
    // Only depend on initialFilters, as options are now constant for the component instance
  }, [initialFilters]);

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
    // Transform internal Option[] state back to string[] for applying filters
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
    // Clear internal state for multi-selects and apply empty filters
    setInternalFilters({
      techStack: [],
      projectDomains: [],
      teamRoles: [],
    });
    onApplyFilters({}); // Apply empty filters object
    // Keep the drawer open after clearing, allowing users to apply the cleared state
    // onOpenChange(false); // Optionally close drawer after clearing
  };

  const availabilityStatuses = getEnumValues(AvailabilityStatus);
  const teamSizes = getEnumValues(TeamSize);

  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-full max-w-sm ml-auto p-3">
        <DrawerHeader className="p-4 pt-6">
          <DrawerTitle className="text-lg">Filter Profiles</DrawerTitle>
          <DrawerDescription className="text-sm">
            Refine the list of developer profiles.
          </DrawerDescription>
        </DrawerHeader>
        <div className="space-y-3 overflow-y-auto p-4 flex-grow">
          {/* User Filters */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={internalFilters.location || ""}
              onChange={handleInputChange}
              placeholder="Search by country or city..."
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={internalFilters.username || ""}
              onChange={handleInputChange}
              placeholder="Search by GitHub username..."
              className="h-9 text-sm mt-1"
            />
          </div>
          {/* Collaboration Style Filters */}
          <div>
            <Label htmlFor="techStack" className="text-sm font-medium">
              Tech Stack
            </Label>
            <MultipleSelector
              className="mt-1 text-sm" // Apply to wrapper for potential font inheritance
              options={techOptions} // Use constant options
              value={internalFilters.techStack ?? []}
              onChange={(selected) =>
                handleMultipleSelectorChange("techStack", selected)
              }
              placeholder="Select tech stack..."
              emptyIndicator="No tech found."
            />
          </div>
          <div>
            <Label htmlFor="projectDomains" className="text-sm font-medium">
              Project Domains
            </Label>
            <MultipleSelector
              className="mt-1 text-sm"
              options={domainOptions} // Use constant options
              value={internalFilters.projectDomains ?? []}
              onChange={(selected) =>
                handleMultipleSelectorChange("projectDomains", selected)
              }
              placeholder="Select domains..."
              emptyIndicator="No domains found."
            />
          </div>
          <div>
            <Label htmlFor="teamRoles" className="text-sm font-medium">
              Team Roles
            </Label>
            <MultipleSelector
              className="mt-1 text-sm"
              options={roleOptions} // Use constant options
              value={internalFilters.teamRoles ?? []}
              onChange={(selected) =>
                handleMultipleSelectorChange("teamRoles", selected)
              }
              placeholder="Select roles..."
              emptyIndicator="No roles found."
            />
          </div>
          <div>
            <Label htmlFor="hoursPerWeek" className="text-sm font-medium">
              Min. Hours per Week
            </Label>
            <Input
              id="hoursPerWeek"
              name="hoursPerWeek"
              type="number"
              min="0"
              value={internalFilters.hoursPerWeek ?? ""}
              onChange={handleNumberInputChange}
              placeholder="e.g., 10"
              className="h-9 text-sm mt-1"
            />
          </div>
          <div>
            <Label htmlFor="availabilityStatus" className="text-sm font-medium">
              Availability Status
            </Label>
            <Select
              name="availabilityStatus"
              value={internalFilters.availabilityStatus || ""}
              onValueChange={(value) =>
                handleSelectChange("availabilityStatus", value)
              }
            >
              <SelectTrigger
                id="availabilityStatus"
                className="h-9 text-sm mt-1"
              >
                <SelectValue placeholder="Any Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-sm">
                  Any Status
                </SelectItem>
                {availabilityStatuses.map((status) => (
                  <SelectItem key={status} value={status} className="text-sm">
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teamSize" className="text-sm font-medium">
              Preferred Team Size
            </Label>
            <Select
              name="teamSize"
              value={internalFilters.teamSize || ""}
              onValueChange={(value) => handleSelectChange("teamSize", value)}
            >
              <SelectTrigger id="teamSize" className="h-9 text-sm mt-1">
                <SelectValue placeholder="Any Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-sm">
                  Any Size
                </SelectItem>
                {teamSizes.map((size) => (
                  <SelectItem key={size} value={size} className="text-sm">
                    {size.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="mt-auto pt-4 pb-4 pr-4 pl-4 border-t">
          <Button onClick={handleApply} size="sm" className="text-sm">
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            size="sm"
            className="text-sm"
          >
            Clear All Filters
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="text-sm">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
