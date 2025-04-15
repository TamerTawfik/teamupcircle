import { getProfiles, ProfileFilters } from "@/app/actions/profiles";
import { ProfileList } from "@/components/profile/profile-list";
import { AvailabilityStatus, TeamSize } from "@prisma/client";

// Default page size (should match backend)
const DEFAULT_PAGE_SIZE = 12;

// Helper to parse filters from explicitly passed values
const parseFiltersFromValues = (
  searchParams: ProfilesPageProps["searchParams"]
): ProfileFilters => {
  const filters: ProfileFilters = {};
  if (searchParams.name) filters.name = String(searchParams.name);
  if (searchParams.location) filters.location = String(searchParams.location);
  if (searchParams.username) filters.username = String(searchParams.username);
  if (searchParams.techStack)
    filters.techStack = Array.isArray(searchParams.techStack)
      ? searchParams.techStack
      : [String(searchParams.techStack)];
  if (searchParams.availabilityStatus)
    filters.availabilityStatus = String(
      searchParams.availabilityStatus
    ) as AvailabilityStatus;
  if (searchParams.teamSize)
    filters.teamSize = String(searchParams.teamSize) as TeamSize;
  if (searchParams.projectDomains)
    filters.projectDomains = Array.isArray(searchParams.projectDomains)
      ? searchParams.projectDomains
      : [String(searchParams.projectDomains)];
  if (searchParams.teamRoles)
    filters.teamRoles = Array.isArray(searchParams.teamRoles)
      ? searchParams.teamRoles
      : [String(searchParams.teamRoles)];
  if (searchParams.hoursPerWeek)
    filters.hoursPerWeek = parseInt(String(searchParams.hoursPerWeek), 10);

  // Clean up NaN hoursPerWeek if parsing failed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isNaN(filters.hoursPerWeek as any)) {
    delete filters.hoursPerWeek;
  }

  return filters;
};

// Define the props for the page component including searchParams
interface ProfilesPageProps {
  searchParams: {
    page?: string;
    name?: string;
    location?: string;
    username?: string;
    techStack?: string | string[];
    availabilityStatus?: string;
    teamSize?: string;
    projectDomains?: string | string[];
    teamRoles?: string | string[];
    hoursPerWeek?: string;
  };
}

export default async function ProfilesPage({
  searchParams,
}: ProfilesPageProps) {
  // Extract page param explicitly
  const pageParam = searchParams.page;

  // Parse page and filters using extracted values
  const page = parseInt(pageParam || "1", 10);
  const filters = parseFiltersFromValues(searchParams);

  // Fetch initial data on the server
  const { profiles, totalCount } = await getProfiles({
    page,
    limit: DEFAULT_PAGE_SIZE,
    filters,
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
        {/* Render the Client Component with initial data */}
        <ProfileList
          initialProfiles={profiles}
          initialTotalCount={totalCount}
        />
      </div>
    </div>
  );
}
