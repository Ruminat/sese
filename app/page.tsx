"use client"

import { useRouter } from "next/navigation"
import { useHydratedAccessConfig, writeAccessConfig } from "@/lib/access-mode"

export default function EntryPage() {
  const router = useRouter()
  const { config } = useHydratedAccessConfig()

  const handleLocalMode = () => {
    writeAccessConfig({ mode: "local" })
    router.push("/vault")
  }

  const handleAuthMode = () => {
    writeAccessConfig({ mode: "auth-sync" })
    router.push("/auth")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-6 py-12">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">SeSe</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Secure Markdown Vault
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Choose how you want to access your vault. You can run fully local with a PIN, or
            continue with authenticated server sync mode.
          </p>
          <p className="text-sm text-muted-foreground">
            Last selected mode:{" "}
            <span className="font-medium text-foreground">
              {config.mode ?? "not selected"}
            </span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-medium">Local Mode</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use local encryption and open your vault with PIN unlock.
            </p>
            <button
              type="button"
              onClick={handleLocalMode}
              className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Continue in Local Mode
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-medium">Auth / Sync Mode</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure API-backed access and server synchronization.
            </p>
            <button
              type="button"
              onClick={handleAuthMode}
              className="mt-5 inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
            >
              Open Auth Setup
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
