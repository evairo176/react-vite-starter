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
    url?: string; // parent bisa punya url atau tidak
    icon?: LucideIcon;
    isActive?: boolean;
    option?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const location = useLocation(); // untuk mengetahui pathname saat ini
  const pathname = location.pathname;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // cek apakah parent item aktif:
          // - jika parent punya url: cocokkan langsung
          // - atau jika salah satu subItem cocok -> parent aktif
          const parentHasUrl = Boolean(item.url);
          const parentUrlMatches = parentHasUrl && pathname === item.url;
          const anySubMatches =
            item.items?.some((sub) => pathname === sub.url) ?? false;
          const isActiveParent = parentUrlMatches || anySubMatches;

          // jika tidak ada sub-items -> render single link
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActiveParent ? "bg-accent text-accent-foreground" : ""
                  }
                >
                  <Link to={item.url ?? "#"}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // jika ada sub-items -> render collapsible
          return (
            // gunakan key di root elemen yang dikembalikan
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
                    className={
                      "cursor-pointer " +
                      (isActiveParent ? "bg-accent text-accent-foreground" : "")
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item?.items && item.items.length > 0 && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isActiveSub = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              isActiveSub
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }
                          >
                            <Link to={subItem.url}>
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
