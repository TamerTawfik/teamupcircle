/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import { getPendingRequests, getConnections } from "@/app/actions/connections";
import { ConnectionsList } from "@/components/connections-list";
import { PendingRequests } from "@/components/pending-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/auth";

export default async function ConnectionsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [connections, pendingRequests] = await Promise.all([
    getConnections(userId || ""),
    getPendingRequests(),
  ]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 px-4">
        <div>
          <h1 className="text-xl font-bold mb-8">My Network</h1>

          <div className="grid gap-8 md:grid-cols-[300px,1fr]">
            <aside className="space-y-6">
              <Suspense fallback={<Skeleton className="h-[200px]" />}>
                <PendingRequests
                  sent={pendingRequests.sent}
                  received={pendingRequests.received}
                />
              </Suspense>
            </aside>

            <main>
              <Suspense fallback={<Skeleton className="h-[400px]" />}>
                <ConnectionsList connections={connections as any} />
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
