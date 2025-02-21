"use client";

import * as React from "react";
import {
  BookMarked,
  Bot,
  Command,
  Frame,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    username: "shadcn",
    email: "m@example.com",
    image: "/avatars/shadcn.jpg",
    role: "",
  },

  navMain: [
    {
      title: "Explore Profiles",
      url: "/members",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Connections",
      url: "/connections",
      icon: Bot,
    },
    {
      title: "Messages",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Bookmarks",
      url: "#",
      icon: BookMarked,
    },
  ],
  projects: [
    {
      name: "Discover Projects",
      url: "/discover-projects",
      icon: Frame,
    },
    {
      name: "My Projects",
      url: "/my-projects",
      icon: PieChart,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Teamup Circle</span>
                  {/* <span className="truncate text-xs">Enterprise</span> */}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
