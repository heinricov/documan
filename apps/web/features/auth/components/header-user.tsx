"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@packages/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu"

import { useAuth } from "@/features/auth/hooks"

/**
 * ============================================================
 *  HeaderUser — user info di header dengan dropdown logout
 * ============================================================
 */
export function HeaderUser() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const displayName = user?.username ?? "User"
  const initials = displayName.slice(0, 2).toUpperCase()

  function handleLogout() {
    logout()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-hidden">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg" side="bottom" align="end" sideOffset={4}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs">
                {user?.email ?? ""}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}