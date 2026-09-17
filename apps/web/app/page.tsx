import { Button } from "@packages/ui/components/button"
import Link from "next/link"

export default function page() {
  return (
    <div className="w-full max-w-4xl">
      <Button>
        <Link href="/role">Role</Link>
      </Button>
    </div>
  )
}
