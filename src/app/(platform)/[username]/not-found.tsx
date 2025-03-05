import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserX className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>
            The GitHub profile you&apos;re looking for doesn&apos;t exist or is
            not accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
