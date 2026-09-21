"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar"

import { useAuth } from "@/features/auth/hooks"

/**
 * ============================================================
 *  UserNav — tampilkan info user + tombol logout di sidebar
 * ============================================================
 */
export function UserNav() {
  const router = useRouter()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="size-4" />
          <span>Logout {user ? `(${user.username})` : ""}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}