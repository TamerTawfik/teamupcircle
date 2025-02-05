import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
export function Logout() {
  return (
    <DropdownMenuItem>
      <form
        action={async () => {
          await signOut();
        }}
      >
        <LogOut />
        Log out
      </form>
    </DropdownMenuItem>
  );
}
