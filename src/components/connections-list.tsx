"use client";

import { useState } from "react";
import { Connection } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import roles from "@/data/roles.json";
import { getLabel } from "@/lib/getLabel";
import Link from "next/link";

interface ConnectionsListProps {
  connections: Array<
    Connection & {
      otherUser: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        collaborationStyles: any | null;
      };
    }
  >;
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConnections = connections.filter((connection) => {
    const searchString = searchTerm.toLowerCase();
    const name = connection.otherUser.name?.toLowerCase() || "";
    const username = connection.otherUser.username?.toLowerCase() || "";
    const roles = connection.otherUser.collaborationStyles?.teamRoles || [];

    return (
      name.includes(searchString) ||
      username.includes(searchString) ||
      roles.some((role: string) => role.toLowerCase().includes(searchString))
    );
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          disabled
          placeholder="Search connections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredConnections.map((connection) => (
          <Card key={connection.id}>
            <Link
              href={`/${connection.otherUser.username}`}
              className="block transition-opacity hover:opacity-70"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={connection.otherUser.image || undefined}
                      alt={connection.otherUser.name || "User"}
                    />
                    <AvatarFallback>
                      {connection.otherUser.name?.[0] ||
                        connection.otherUser.username?.[0] ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">
                      {connection.otherUser.name ||
                        connection.otherUser.username}
                    </h3>

                    {connection.otherUser.collaborationStyles?.teamRoles && (
                      <div className="flex flex-wrap gap-1">
                        {connection.otherUser.collaborationStyles.teamRoles.map(
                          (role: string) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-xs"
                            >
                              {getLabel(role, roles)}
                            </Badge>
                          )
                        )}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Connected{" "}
                      {formatDistanceToNow(new Date(connection.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}

        {filteredConnections.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No connections found
          </div>
        )}
      </div>
    </div>
  );
}
