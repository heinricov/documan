import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@packages/ui/components/breadcrumb"
import { Separator } from "@packages/ui/components/separator"
import { NavUser } from "@packages/ui/layout/nav-user"

const defaultUser = {
  name: "User",
  email: "user@documan.id",
  avatar: "",
}

export function AppHeader({ UserContent }: { UserContent?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
      <div className="flex items-center gap-2 px-4">
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
      {UserContent ?? <NavUser user={defaultUser} />}
    </header>
  )
}
