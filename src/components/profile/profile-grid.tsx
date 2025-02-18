"use client";

import { ProfileCard } from "./profile-card";
import { ProfileWithGitHub } from "@/types/profile";

export function ProfileGrid({ profiles }: { profiles: ProfileWithGitHub[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
