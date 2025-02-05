"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function Signout() {
  const [isLoading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
  };

  return (
    <DropdownMenuItem>
      <span onClick={handleSignOut}>
        <LogOut size={16} className="display: inline -ml-1 mr-2" />

        {isLoading ? "Loading..." : "Sign out"}
      </span>
    </DropdownMenuItem>
  );
}
