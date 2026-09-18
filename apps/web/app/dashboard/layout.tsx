"use client"

import { AppLayout } from "@packages/ui/layout/app-layout"
import { NavMenu } from "@packages/ui/layout/nav-menu"
import { AuthGuard, HeaderUser, UserNav } from "@/features/auth/components"

import { BiData } from "react-icons/bi"
import { FcDocument } from "react-icons/fc"
import { GrDocumentStore } from "react-icons/gr"
import { HiDocumentCheck } from "react-icons/hi2"
import { MdDashboard } from "react-icons/md"
import { TbCubeSend } from "react-icons/tb"

const MainMenu = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <MdDashboard />,
  },
]

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
      {
        title: "Subsidiary",
        url: "/dashboard/subsidiary",
      },
    ],
  },
]

export const MenuUser = [
  {
    title: "Document Receipt",
    url: "/dashboard/document-receipt",
    icon: <HiDocumentCheck />,
  },
  {
    title: "Send Document",
    url: "/dashboard/send-document",
    icon: <TbCubeSend />,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout
        MenuContent={
          <>
            <NavMenu lable="Menu" items={MainMenu} />
            <NavMenu lable="Admin" items={MenuAdmin} />
            <NavMenu lable="User" items={MenuUser} />
          </>
        }
        FooterContent={<UserNav />}
        UserContent={<HeaderUser />}
      >
        {children}
      </AppLayout>
    </AuthGuard>
  )
}
