"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useFormState, useFormStatus } from "react-dom";
import {
  requestToJoinProject,
  JoinProjectState,
} from "@/app/actions/collaboration";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProjectMembershipStatus } from "@prisma/client";

interface JoinProjectButtonProps {
  projectId: string;
  ownerId: string;
  membershipStatus: ProjectMembershipStatus | null;
  isMembershipLoading: boolean;
  size?: ButtonProps["size"];
}

function SubmitButtonContent() {
  const { pending } = useFormStatus();
  return (
    <>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Sending Request..." : "Request to Join"}
    </>
  );
}

export function JoinProjectButton({
  projectId,
  ownerId,
  membershipStatus,
  isMembershipLoading,
  size,
}: JoinProjectButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const initialState: JoinProjectState = {
    error: undefined,
    success: undefined,
  };

  // Bind projectId to the action
  const requestToJoinProjectWithId = requestToJoinProject.bind(null, projectId);
  const [state, dispatch] = useFormState(
    requestToJoinProjectWithId,
    initialState
  );

  React.useEffect(() => {
    if (state?.error) {
      toast.error("something went wrong, please try again");
    }
    if (state?.success) {
      toast.success("Request sent successfully");
    }
  }, [state]);

  // Display loading state from parent first
  if (isMembershipLoading) {
    return (
      <Button disabled size={size}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking Status...
      </Button>
    );
  }

  // Then check session loading state
  if (sessionStatus === "loading") {
    return (
      <Button disabled size={size}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading Session...
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button disabled size={size}>
        Login to Join
      </Button>
    );
  }

  if (session.user.id === ownerId) {
    return (
      <Button disabled size={size}>
        You Own This Project
      </Button>
    );
  }

  // Check existing membership status passed from parent
  if (membershipStatus === ProjectMembershipStatus.PENDING) {
    return (
      <Button disabled size={size}>
        Request Pending
      </Button>
    );
  }

  if (membershipStatus === ProjectMembershipStatus.ACCEPTED) {
    return (
      <Button disabled size={size}>
        You are a Member
      </Button>
    );
  }

  const canRequest =
    !membershipStatus ||
    membershipStatus === ProjectMembershipStatus.REJECTED ||
    membershipStatus === ProjectMembershipStatus.REMOVED ||
    membershipStatus === ProjectMembershipStatus.LEFT;

  if (!canRequest || state?.success) {
    return (
      <Button disabled size={size}>
        {state?.success ? "Request Sent" : "Request to Join"}
      </Button>
    );
  }

  return (
    <form action={dispatch}>
      <Button
        type="submit"
        size={size}
        disabled={
          sessionStatus !== "authenticated" || state?.success !== undefined
        }
      >
        <SubmitButtonContent />
      </Button>
    </form>
  );
}
