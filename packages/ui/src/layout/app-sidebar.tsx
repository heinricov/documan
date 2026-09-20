"use client"

import * as React from "react"

import { AppLogo } from "@packages/ui/layout/app-logo"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@packages/ui/components/sidebar"

import { NavMenu } from "@packages/ui/layout/nav-menu"
import { Settings } from "lucide-react"
import {
  BsLayoutSidebarInsetReverse,
  BsLayoutSidebarInset,
} from "react-icons/bs"

export const MenuFooter = [
  {
    title: "Setting",
    url: "#",
    icon: <Settings />,
  },
]

export function AppSidebar({
  MenuContent,
  FooterContent,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  MenuContent?: React.ReactNode
  FooterContent?: React.ReactNode
}) {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1">
            <SidebarTrigger icon={<BsLayoutSidebarInsetReverse />} />
            <AppLogo />
          </div>
        ) : (
          <div className="flex flex-row items-center gap-1">
            <AppLogo />
            <SidebarTrigger icon={<BsLayoutSidebarInset className="" />} />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {MenuContent}
        <NavMenu items={MenuFooter} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{FooterContent}</SidebarFooter>
    </Sidebar>
  )
}
