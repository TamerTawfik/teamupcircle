import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { FeedbackForm } from "@/components/feedback-form";
import { ModeToggle } from "./mode-toggle";

export function Header() {
  return (
    <div className="flex space-x-2 ml-auto mr-4 mt-2">
      <FeedbackForm />

      <NotificationsDropdown />

      <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
        <ModeToggle />
      </Suspense>
    </div>
  );
}
