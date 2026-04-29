"use client"

import { useEffect, useState } from "react"
import { useStore } from "@nanostores/react"
import { persistentAtom } from "@nanostores/persistent"

export type AccessMode = "local" | "auth-sync"

export type AccessConfig = {
  mode: AccessMode | null
  apiUrl: string
  apiKey: string
}

const ACCESS_CONFIG_KEY = "sese:access-config"

export const DEFAULT_ACCESS_CONFIG: AccessConfig = {
  mode: null,
  apiUrl: "",
  apiKey: "",
}

function sanitizeAccessConfig(value: Partial<AccessConfig> | null | undefined): AccessConfig {
  return {
    mode: value?.mode === "auth-sync" || value?.mode === "local" ? value.mode : null,
    apiUrl: value?.apiUrl?.trim() ?? "",
    apiKey: value?.apiKey?.trim() ?? "",
  }
}

export const accessConfig$ = persistentAtom<AccessConfig>(ACCESS_CONFIG_KEY, DEFAULT_ACCESS_CONFIG, {
  encode: JSON.stringify,
  decode: (raw) => {
    try {
      return sanitizeAccessConfig(JSON.parse(raw) as Partial<AccessConfig>)
    } catch {
      return DEFAULT_ACCESS_CONFIG
    }
  },
})

export function readAccessConfig(): AccessConfig {
  return accessConfig$.get()
}

export function writeAccessConfig(next: Partial<AccessConfig>) {
  const current = accessConfig$.get()
  accessConfig$.set(
    sanitizeAccessConfig({
      ...current,
      ...next,
      mode:
        next.mode === "auth-sync" || next.mode === "local"
          ? next.mode
          : current.mode,
    }),
  )
}

export function useHydratedAccessConfig(ssrFallback: AccessConfig = DEFAULT_ACCESS_CONFIG): {
  config: AccessConfig
  hydrated: boolean
} {
  const stored = useStore(accessConfig$)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return {
    config: hydrated ? stored : ssrFallback,
    hydrated,
  }
}
