import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@packages/ui/components/breadcrumb"
import { Separator } from "@packages/ui/components/separator"
import { SidebarTrigger } from "@packages/ui/components/sidebar"
import { NavUser } from "@packages/ui/layout/nav-user"

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppHeader() {
  return (
    <header className="sticky top-0 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-7" size="lg" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-14"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <NavUser user={user} />
    </header>
  )
}
