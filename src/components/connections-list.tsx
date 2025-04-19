"use client";

import { useState } from "react";
import { Connection } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import Link from "next/link";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import teamRolesData from "@/data/teamRoles.json";

// Format team roles for the selector
const teamRoleOptions: Option[] = teamRolesData.map((role) => ({
  value: role.id,
  label: role.name,
}));

interface ConnectionsListProps {
  connections: Array<
    Connection & {
      otherUser: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
        githubId: string | null;
        location: string | null;
        collaborationStyles: {
          teamRoles: Array<{ id: string; name: string }> | null;
        } | null;
      };
    }
  >;
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<Option[]>([]);

  const filteredConnections = connections.filter((connection) => {
    const searchString = searchTerm.toLowerCase();
    const locationString = locationFilter.toLowerCase();

    const name = connection.otherUser.name?.toLowerCase() || "";
    const username = connection.otherUser.username?.toLowerCase() || "";
    const githubId = connection.otherUser.githubId?.toLowerCase() || "";
    const location = connection.otherUser.location?.toLowerCase() || "";
    const userRoles = connection.otherUser.collaborationStyles?.teamRoles || [];

    const matchesSearchTerm =
      name.includes(searchString) ||
      username.includes(searchString) ||
      githubId.includes(searchString);

    const matchesLocation = location.includes(locationString);

    const matchesRole =
      roleFilter.length === 0 ||
      userRoles.some((userRole) =>
        roleFilter.some((selectedRole) => selectedRole.value === userRole.id)
      );

    return matchesSearchTerm && matchesLocation && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by GitHub username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        <MultipleSelector
          options={teamRoleOptions}
          value={roleFilter}
          onChange={setRoleFilter}
          placeholder="Filter by team roles..."
          emptyIndicator="No roles found."
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
