"use client";

import * as React from "react";

import { NavProjects } from "@/components/nav-projects";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
// import { NavMain } from "./nav-main";
import { data } from "@/core/utils/navigation";
import { NavMain } from "./nav-main";
import { useAuthStore } from "@/core/store/authStore";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="shadow-lg border-r border-neutral-border"
    >
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <div>Logo</div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user as any} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
