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
import { ProfileFilters } from "@/app/actions/profiles"; // Assuming the type is exported
import { AvailabilityStatus, TeamSize } from "@prisma/client"; // Import enums

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
  const [currentFilters, setCurrentFilters] =
    useState<ProfileFilters>(initialFilters);

  // Reset local state if initialFilters change (e.g., when URL params are cleared)
  useEffect(() => {
    setCurrentFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value, // Set to undefined if empty
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = value === "" ? undefined : parseInt(value, 10);
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: isNaN(numValue as any) ? undefined : numValue,
    }));
  };

  const handleSelectChange = (name: keyof ProfileFilters, value: string) => {
    setCurrentFilters((prev) => ({
      ...prev,
      [name]: value === "ALL" || value === "" ? undefined : value, // Handle 'ALL' or empty selection
    }));
  };

  // Handle array inputs (e.g., comma-separated strings)
  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only split by comma, don't trim or filter yet
    const arrayValue = value.split(",");

    setCurrentFilters((prev) => ({
      ...prev,
      // Store undefined if the raw input is empty, otherwise store the split array
      [name]: value === "" ? undefined : arrayValue,
    }));
  };

  const handleApply = () => {
    const cleanedFilters = { ...currentFilters };

    // Keys that represent comma-separated string arrays
    const arrayKeysToClean: Array<
      keyof Pick<ProfileFilters, "techStack" | "projectDomains" | "teamRoles">
    > = ["techStack", "projectDomains", "teamRoles"];

    arrayKeysToClean.forEach((key) => {
      const rawValue = cleanedFilters[key];

      if (Array.isArray(rawValue)) {
        // Ensure we only process strings, trim them, and filter empties
        const cleanedArray = rawValue
          .map((item) => (typeof item === "string" ? item.trim() : "")) // Trim strings, handle non-strings
          .filter((item) => item !== ""); // Remove empty strings

        // Update the filter value: set to undefined if empty, otherwise use the cleaned array
        cleanedFilters[key] =
          cleanedArray.length > 0 ? cleanedArray : undefined;
      } else {
        // If it's not an array (e.g., undefined initially or became non-array somehow),
        // ensure it's set to undefined for consistency.
        cleanedFilters[key] = undefined;
      }
    });

    onApplyFilters(cleanedFilters); // Apply the cleaned filters
    onOpenChange(false); // Close the drawer after applying
  };

  const handleClear = () => {
    const clearedFilters: ProfileFilters = {}; // Create an empty object
    setCurrentFilters(clearedFilters);
    onApplyFilters(clearedFilters); // Apply the cleared filters immediately
    // Keep the drawer open after clearing for potential new selections
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
        <div className="space-y-4 overflow-y-auto p-1">
          {" "}
          {/* Added padding and scroll */}
          {/* User Filters */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={currentFilters.name || ""}
              onChange={handleInputChange}
              placeholder="Search by name..."
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={currentFilters.location || ""}
              onChange={handleInputChange}
              placeholder="Search by location..."
            />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={currentFilters.username || ""}
              onChange={handleInputChange}
              placeholder="Search by username..."
            />
          </div>
          {/* Collaboration Style Filters */}
          <div>
            <Label htmlFor="techStack">Tech Stack (comma-separated)</Label>
            <Input
              id="techStack"
              name="techStack"
              value={currentFilters.techStack?.join(", ") || ""}
              onChange={handleArrayInputChange}
              placeholder="e.g., react, node, python"
            />
          </div>
          <div>
            <Label htmlFor="projectDomains">
              Project Domains (comma-separated)
            </Label>
            <Input
              id="projectDomains"
              name="projectDomains"
              value={currentFilters.projectDomains?.join(", ") || ""}
              onChange={handleArrayInputChange}
              placeholder="e.g., AI, webdev, mobile"
            />
          </div>
          <div>
            <Label htmlFor="teamRoles">Team Roles (comma-separated)</Label>
            <Input
              id="teamRoles"
              name="teamRoles"
              value={currentFilters.teamRoles?.join(", ") || ""}
              onChange={handleArrayInputChange}
              placeholder="e.g., frontend, backend, design"
            />
          </div>
          <div>
            <Label htmlFor="hoursPerWeek">Min. Hours per Week</Label>
            <Input
              id="hoursPerWeek"
              name="hoursPerWeek"
              type="number"
              min="0"
              value={currentFilters.hoursPerWeek ?? ""} // Use empty string for undefined
              onChange={handleNumberInputChange}
              placeholder="e.g., 10"
            />
          </div>
          <div>
            <Label htmlFor="availabilityStatus">Availability Status</Label>
            <Select
              name="availabilityStatus"
              value={currentFilters.availabilityStatus || ""}
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
                    {status.replace("_", " ")} {/* Nicer display */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teamSize">Preferred Team Size</Label>
            <Select
              name="teamSize"
              value={currentFilters.teamSize || ""}
              onValueChange={(value) => handleSelectChange("teamSize", value)}
            >
              <SelectTrigger id="teamSize">
                <SelectValue placeholder="Any Size" />
              </SelectTrigger>
              <SelectContent>
                {teamSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size.replace("_", " ")} {/* Nicer display */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter className="mt-auto flex-row gap-2 pt-4">
          {" "}
          {/* Adjusted for spacing */}
          <Button onClick={handleApply} className="flex-grow">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClear} className="flex-grow">
            Clear Filters
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
