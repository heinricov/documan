import { AppLayout } from "@packages/ui/layout/app-layout"
import { NavCollaps } from "@packages/ui/layout/nav-collaps"

import { BiData } from "react-icons/bi"
import { MdDashboard } from "react-icons/md"

export const MenuCollaps = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <MdDashboard />,
  },
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout
        MenuContent={
          <>
            <NavCollaps lable="Menu" items={MenuCollaps} />
          </>
        }
      >
        {children}
      </AppLayout>
    </>
  )
}
