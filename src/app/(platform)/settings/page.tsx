import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteAccountDialog } from "@/components/delete-account-dialog";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
        <div>
          <h1 className="text-xl font-bold mb-8">Settings</h1>

          <div className="space-y-8">
            <div className="border-t pt-8">
              <DeleteAccountDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
