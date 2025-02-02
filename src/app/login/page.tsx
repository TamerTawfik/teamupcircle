"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
