/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProfileGrid } from "@/components/profile/profile-grid";
import { ProfileFilterDrawer } from "@/components/profile/profile-filter-drawer";
import { Button } from "@/components/ui/button";
import { getProfiles, ProfileFilters } from "@/app/actions/profiles";
import { ProfileWithGitHub } from "@/types/profile";
import { AvailabilityStatus, TeamSize } from "@prisma/client";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FilterIcon } from "lucide-react";

// Helper to parse filters from search params
const parseFiltersFromParams = (
  searchParams: URLSearchParams
): ProfileFilters => {
  const filters: ProfileFilters = {};
  if (searchParams.has("name")) filters.name = searchParams.get("name")!;
  if (searchParams.has("location"))
    filters.location = searchParams.get("location")!;
  if (searchParams.has("username"))
    filters.username = searchParams.get("username")!;
  if (searchParams.has("techStack"))
    filters.techStack = searchParams.getAll("techStack");
  if (searchParams.has("availabilityStatus"))
    filters.availabilityStatus = searchParams.get(
      "availabilityStatus"
    ) as AvailabilityStatus;
  if (searchParams.has("teamSize"))
    filters.teamSize = searchParams.get("teamSize") as TeamSize;
  if (searchParams.has("projectDomains"))
    filters.projectDomains = searchParams.getAll("projectDomains");
  if (searchParams.has("teamRoles"))
    filters.teamRoles = searchParams.getAll("teamRoles");
  if (searchParams.has("hoursPerWeek"))
    filters.hoursPerWeek = parseInt(searchParams.get("hoursPerWeek")!, 10);

  // Clean up NaN hoursPerWeek if parsing failed
  if (isNaN(filters.hoursPerWeek as any)) {
    delete filters.hoursPerWeek;
  }
  return filters;
};

// Default page size (should match backend)
const DEFAULT_PAGE_SIZE = 12;

interface ProfileListProps {
  initialProfiles: ProfileWithGitHub[];
  initialTotalCount: number;
}

export function ProfileList({
  initialProfiles,
  initialTotalCount,
}: ProfileListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [profiles, setProfiles] = useState(initialProfiles);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Read page and filters from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentFilters = parseFiltersFromParams(searchParams);

  // Fetch profiles when page or filters change
  useEffect(() => {
    // Only fetch if not the initial load (which uses initialProfiles)
    // Or if params actually changed
    const pageParam = searchParams.get("page") || "1";
    const existingParams = new URLSearchParams(searchParams.toString()); // copy

    // Don't refetch on initial render if params match initial state
    if (
      pageParam === "1" &&
      Object.keys(parseFiltersFromParams(existingParams)).length === 0 &&
      profiles === initialProfiles
    ) {
      return;
    }

    startTransition(async () => {
      const params = {
        page: parseInt(pageParam, 10),
        limit: DEFAULT_PAGE_SIZE,
        filters: parseFiltersFromParams(existingParams),
      };
      const { profiles: fetchedProfiles, totalCount: fetchedTotalCount } =
        await getProfiles(params);
      setProfiles(fetchedProfiles);
      setTotalCount(fetchedTotalCount);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, initialProfiles]); // Depend on searchParams

  const handleApplyFilters = (newFilters: ProfileFilters) => {
    const params = new URLSearchParams();
    // Set page to 1 when applying new filters
    params.set("page", "1");

    // Add filter values to params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => params.append(key, item));
        } else {
          params.set(key, String(value));
        }
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
    setIsFilterDrawerOpen(false); // Close drawer handled in drawer component now
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">Developer Profiles</h1>
        <Button variant="outline" onClick={() => setIsFilterDrawerOpen(true)}>
          <FilterIcon className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filter Drawer */}
      <ProfileFilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        initialFilters={currentFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* Loading Indicator */}
      {isPending && <div className="text-center p-4">Loading profiles...</div>}

      {/* Profile Grid */}
      {!isPending && profiles.length > 0 && <ProfileGrid profiles={profiles} />}
      {!isPending && profiles.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No profiles found matching your criteria.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isPending && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}
    </div>
  );
}
