import { AppLayout } from "@packages/ui/layout/app-layout"
import { NavMenu } from "@packages/ui/layout/nav-menu"

import { BiData } from "react-icons/bi"
import { MdDashboard } from "react-icons/md"

export const MenuAdmin = [
  {
    title: "Data",
    url: "#",
    icon: <BiData />,
    items: [
      {
        title: "Role",
        url: "/dashboard/role",
      },
      {
        title: "User",
        url: "/dashboard/user",
      },
    ],
  },
]

const MainMenu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <MdDashboard />,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout
        MenuContent={
          <>
            <NavMenu lable="Menu" items={MainMenu} />
            <NavMenu lable="Admin" items={MenuAdmin} />
          </>
        }
      >
        {children}
      </AppLayout>
    </>
  )
}
