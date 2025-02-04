import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function MembersPage() {
  const session = await auth();

  return (
    <div>
      {session ? (
        <div>
          <pre>{JSON.stringify(session, null, 2)}</pre>
          <form
            action={async () => {
              "use server";

              await signOut();
            }}
          >
            <Button type="submit" color="primary">
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <div>Something wrong...</div>
      )}
    </div>
  );
}
