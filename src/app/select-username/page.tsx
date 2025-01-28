import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UsernameForm from "./username-form";

export default async function SelectUsername() {
  const session = await auth();

  if (!session?.user || session.user.username) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4 p-4">
        <h1 className="text-2xl font-bold">Choose a Username</h1>
        <UsernameForm />
      </div>
    </div>
  );
}
