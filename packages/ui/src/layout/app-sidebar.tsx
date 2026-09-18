"use client"

import * as React from "react"

import { AppLogo } from "@packages/ui/layout/app-logo"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@packages/ui/components/sidebar"

import { NavBasic } from "@packages/ui/layout/nav-basic"
import { LifeBuoyIcon, SendIcon } from "lucide-react"

export const MenuFooter = [
  {
    title: "Support",
    url: "#",
    icon: <LifeBuoyIcon />,
  },
  {
    title: "Feedback",
    url: "#",
    icon: <SendIcon />,
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
        <NavBasic menus={MenuFooter} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{/* footer side */}</SidebarFooter>
    </Sidebar>
  )
}
