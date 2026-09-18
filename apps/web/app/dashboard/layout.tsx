import { AppLayout } from "@packages/ui/layout/app-layout"
import { NavCollaps } from "@packages/ui/layout/nav-collaps"
import { NavBasic } from "@packages/ui/layout/nav-basic"

import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
} from "lucide-react"

export const MenuCollaps = [
  {
    title: "Playground",
    url: "#",
    icon: <TerminalSquareIcon />,
    isActive: true,
    items: [
      {
        title: "History",
        url: "#",
      },
      {
        title: "Starred",
        url: "#",
      },
      {
        title: "Settings",
        url: "#",
      },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: <BotIcon />,
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: <BookOpenIcon />,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
  },
]

export const MenuBasic = [
  {
    title: "Design Engineering",
    url: "#",
    icon: <FrameIcon />,
  },
  {
    title: "Sales & Marketing",
    url: "#",
    icon: <PieChartIcon />,
  },
  {
    title: "Travel",
    url: "#",
    icon: <MapIcon />,
  },
]

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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppLayout
        MenuContent={
          <>
            <NavCollaps items={MenuCollaps} />
            <NavBasic menus={MenuBasic} />
            <NavBasic menus={MenuFooter} className="mt-auto" />
          </>
        }
      >
        {children}
      </AppLayout>
    </>
  )
}
