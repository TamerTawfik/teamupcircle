"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUserAccount } from "@/app/actions/auth";
import { toast } from "sonner";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount();

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Your account has been deleted");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete account");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Delete Account</h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => setOpen(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your
                account and remove all associated data from our servers.
              </p>
              <div className="space-y-2">
                <p className="font-medium">
                  The following data will be permanently deleted:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your profile information</li>
                  <li>All your messages and conversations</li>
                  <li>Your connections and connection requests</li>
                  <li>Your collaboration preferences</li>
                  <li>Your privacy settings</li>
                  <li>All notifications</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
