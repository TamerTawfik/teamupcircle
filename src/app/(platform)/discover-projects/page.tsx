import React from "react";
import { Button } from "@/components/ui/button";

export default function DiscoverProjectspage() {
  return (
    <div className="absolute w-full h-[calc(100vh-300px)] top-10 left-0 flex items-center justify-center z-20">
      <div className="text-center max-w-sm mx-auto flex flex-col items-center justify-center">
        <h2 className="text-xl font-medium mb-2">Coming Soon</h2>
        <p className="text-sm text-[#878787] mb-6">
          Discover an open source project to collaborate with others, share your
          skills, and contribute to the community.
        </p>

        <Button disabled className="text-xs">
          {" "}
          Create Project{" "}
        </Button>
      </div>
    </div>
  );
}
