import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar"
import { TooltipProvider } from "@packages/ui/components/tooltip"

import { AppSidebar } from "@packages/ui/layout/app-sidebar"
import { AppHeader } from "@packages/ui/layout/app-header"

export function AppLayout({
  MenuContent,
  FooterContent,
  UserContent,
  children,
}: {
  children: React.ReactNode
  MenuContent?: React.ReactNode
  FooterContent?: React.ReactNode
  UserContent?: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar MenuContent={MenuContent} FooterContent={FooterContent} />
        <SidebarInset>
          <AppHeader UserContent={UserContent} />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
