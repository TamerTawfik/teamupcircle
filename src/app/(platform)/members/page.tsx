import { getProfiles } from "@/app/actions/profiles";
import { ProfileGrid } from "@/components/profile/profile-grid";

export default async function ProfilesPage() {
  const profiles = await getProfiles();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
        <div className="">
          <h1 className="text-xl font-bold mb-8">Developer Profiles</h1>
          <ProfileGrid profiles={profiles} />
        </div>
      </div>
    </div>
  );
}
