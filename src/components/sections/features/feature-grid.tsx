import { cn } from "@/lib/utils";
import {
  Feature,
  FeatureContent,
  FeatureHeader,
  FeatureTitle,
} from "./feature";

import * as React from "react";

const FeatureGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className }, ref) => (
  <div ref={ref} className={cn(className)}>
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 xl:grid-cols-3 sm:px-0">
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Project Matchmaking</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Find teammates based on skills, interests, and project goals.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Skill-based Discovery</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Showcase your expertise and connect with complementary talents.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Hackathon Hub</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Stay updated on upcoming hackathons and form teams instantly.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Open-source Collaboration</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Discover open-source projects and make meaningful contributions.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Real-time Chat</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Communicate with your team seamlessly, all within the platform.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Idea Incubator</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Pitch ideas, get feedback, and gather a team to bring them to life.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>SaaS Project Boards</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Organize and manage tasks like a pro with intuitive project boards.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Portfolio Integration</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Sync your GitHub and showcase your collaborative work.
        </FeatureContent>
      </Feature>
      <Feature>
        <FeatureHeader>
          <FeatureTitle>Feedback and Endorsements</FeatureTitle>
        </FeatureHeader>
        <FeatureContent>
          Earn recognition for your contributions and build your reputation.
        </FeatureContent>
      </Feature>
    </div>
  </div>
));
FeatureGrid.displayName = "FeatureGrid";

export { FeatureGrid };
