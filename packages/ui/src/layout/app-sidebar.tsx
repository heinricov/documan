"use client"

import * as React from "react"

import { AppLogo } from "@packages/ui/layout/app-logo"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@packages/ui/components/sidebar"

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
      <SidebarContent>{MenuContent}</SidebarContent>
      <SidebarFooter>{/* footer side */}</SidebarFooter>
    </Sidebar>
  )
}
