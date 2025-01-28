import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        action={async () => {
          "use server";
          await signIn("github");
        }}
      >
        <Button type="submit" variant="outline">
          Sign in with GitHub
        </Button>
      </form>
    </div>
  );
}
