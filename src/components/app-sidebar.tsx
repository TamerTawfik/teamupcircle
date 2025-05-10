"use client";

import * as React from "react";
import { Binoculars, Code2, LayoutDashboard, Mail, Users } from "lucide-react";

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
import { Logo } from "./logo";
import { siteConfig } from "@/config/site";

const data = {
  navMain: [
    {
      title: "Explore Profiles",
      url: "/members",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Connections",
      url: "/connections",
      icon: Users,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: Mail,
    },
  ],
  projects: [
    {
      name: "Discover Projects",
      url: "/discover-projects",
      icon: Binoculars,
    },
    {
      name: "My Projects",
      url: "/my-projects",
      icon: Code2,
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
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg text-sidebar-primary-foreground ml-1">
                  <Logo />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold -ml-4">
                    {siteConfig.name}
                  </span>
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
