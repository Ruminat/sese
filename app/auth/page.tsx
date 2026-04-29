"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useHydratedAccessConfig, writeAccessConfig } from "@/lib/access-mode"

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_DEFAULT_API_URL ?? ""

export default function AuthSetupPage() {
  const router = useRouter()
  const { config, hydrated } = useHydratedAccessConfig()
  const [apiUrl, setApiUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!hydrated) {
      return
    }

    setApiUrl(config.apiUrl || DEFAULT_API_URL)
    setApiKey(config.apiKey)
  }, [config.apiKey, config.apiUrl, hydrated])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!apiUrl.trim()) {
      setError("API base URL is required for auth/sync mode.")
      return
    }

    try {
      const parsed = new URL(apiUrl.trim())
      if (!parsed.protocol.startsWith("http")) {
        throw new Error("Invalid protocol")
      }
    } catch {
      setError("Enter a valid API base URL (for example: http://localhost:8787).")
      return
    }

    writeAccessConfig({
      mode: "auth-sync",
      apiUrl,
      apiKey,
    })
    router.push("/vault")
  }

  const handleBack = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6 py-12">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">SeSe Auth</p>
          <h1 className="text-3xl font-semibold">Auth / Sync Setup</h1>
          <p className="text-sm text-muted-foreground">
            Configure API-backed access. Your selection and credentials are saved locally for the
            next vault launch.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">API base URL</span>
              <input
                type="url"
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                placeholder="http://localhost:8787"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring-2"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium">API key (optional for now)</span>
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="Paste API key"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary transition focus:ring-2"
              />
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
            >
              Back
            </button>
            <button
              type="submit"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
