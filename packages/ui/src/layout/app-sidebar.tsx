"use client"

import * as React from "react"

import { AppLogo } from "@packages/ui/layout/app-logo"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@packages/ui/components/sidebar"

import { NavMenu } from "@packages/ui/layout/nav-menu"
import { Settings } from "lucide-react"

export const MenuFooter = [
  {
    title: "Setting",
    url: "#",
    icon: <Settings />,
  },
]

export function AppSidebar({
  MenuContent,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  MenuContent?: React.ReactNode
}) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        {MenuContent}
        <NavMenu items={MenuFooter} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{/* footer side */}</SidebarFooter>
    </Sidebar>
  )
}
