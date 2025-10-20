"use client";

import * as React from "react";
import {
  type Icon,
  IconBuilding,
  IconCategory2,
  IconCurrencyDollar,
  IconInnerShadowTop,
  IconKey,
  IconTags,
  IconTrophy,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/lib/ui/admin/sidebar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/lib/ui/admin/dropdown-menu";
import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItemIconLink
              title="Genres"
              url="/admin/genres"
              icon={IconTags}
            />
            <SidebarMenuItemIconLink
              title="Organizations"
              url="/admin/organizations"
              icon={IconBuilding}
            />
            <SidebarMenuItemIconLink
              title="Competitions"
              url="/admin/competitions"
              icon={IconTrophy}
            />
            <SidebarMenuItemIconLink
              title="Currencies"
              url="/admin/currencies"
              icon={IconCurrencyDollar}
            />
            <SidebarMenuItemIconLink
              title="Types"
              url="/admin/types"
              icon={IconCategory2}
            />
            <SidebarMenuItemIconLink
              title="Users"
              url="/admin/users"
              icon={IconUsers}
            />
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItemThemeSwitcher />
            <SidebarMenuItemIconLink
              title="Change Password"
              url="/admin/change-password"
              icon={IconKey}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function SidebarMenuItemThemeSwitcher() {
  const { setTheme, theme } = useTheme();
  let label = "Auto"; // aka: System
  if (theme === "light") {
    label = "Light";
  } else if (theme === "dark") {
    label = "Dark";
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="cursor-pointer">
            <SunMoonIcon className="size-4" />
            <span>Theme: {label}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={(v) => setTheme(v)}
          >
            <DropdownMenuRadioItem value="light">
              <SunIcon className="size-4" /> Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <MoonIcon className="size-4" /> Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <SunMoonIcon className="size-4" /> Auto
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function SidebarMenuItemIconLink({
  title,
  url,
  icon: Icon,
}: {
  title: string;
  url: string;
  icon: Icon;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link href={url} prefetch>
          <Icon />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
