import type { NextConfig } from "next"
import { loadEnv } from "@configs/environment"

loadEnv()

const nextConfig: NextConfig = {
  transpilePackages: [
    "@packages/ui",
    "@packages/client",
    "@packages/validator",
  ],
}

export default nextConfig
