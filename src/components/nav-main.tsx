"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    option?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase mb-2 px-4">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const parentHasUrl = Boolean(item.url);
          const parentUrlMatches = parentHasUrl && pathname === item.url;
          const anySubMatches =
            item.items?.some((sub) => pathname === sub.url) ?? false;
          const isActiveParent = parentUrlMatches || anySubMatches;

          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  size={"lg"}
                  isActive={isActiveParent}
                  className={`
                    transition-all duration-200 ease-in-out
                    hover:translate-x-1 hover:bg-sidebar-accent/50
                    rounded-none
                    ${
                      isActiveParent
                        ? "font-semibold bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border-r-2 border-[var(--sidebar-accent-foreground)]"
                        : "text-muted-foreground"
                    }
                  `}
                >
                  <Link to={item.url ?? "#"}>
                    {item.icon && (
                      <item.icon
                        className={`w-4 h-4 ${
                          isActiveParent ? "text-primary" : ""
                        }`}
                      />
                    )}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={Boolean(item.isActive) || isActiveParent}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActiveParent}
                    size={"lg"}
                    className={`
                      cursor-pointer transition-all duration-200 ease-in-out
                      hover:translate-x-1 hover:bg-sidebar-accent/50
                      ${
                        isActiveParent
                          ? "font-semibold bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-[var(--sidebar-accent-foreground)]"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    {item.icon && (
                      <item.icon
                        className={`w-4 h-4 ${
                          isActiveParent ? "text-primary" : ""
                        }`}
                      />
                    )}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-2 border-sidebar-border/50 ml-4 pl-2 space-y-1 my-1">
                    {item.items.map((subItem) => {
                      const isActiveSub = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveSub}
                            size="md"
                            className={`
                              transition-colors duration-200 h-9 rounded-md
                              ${
                                isActiveSub
                                  ? "bg-sidebar-accent/50 text-primary font-medium border-r-2 border-[var(--sidebar-accent-foreground)]"
                                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30"
                              }
                            `}
                          >
                            <Link
                              to={subItem.url}
                              className="flex items-center gap-2"
                            >
                              {isActiveSub && (
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              )}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
