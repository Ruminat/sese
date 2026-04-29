"use client"

import { useState, useRef, useEffect } from "react"
import { Lock, Shield, Key, AlertTriangle, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { cn } from "@/lib/utils"

export function PinModal() {
  const { authenticate, encryptionStatus, generateClientKey } = useApp()
  const [pin, setPin] = useState<string[]>([])
  const [error, setError] = useState(false)
  const [isSetup, setIsSetup] = useState(false)
  const [confirmPin, setConfirmPin] = useState<string[]>([])
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const [showKeySetup, setShowKeySetup] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const maxDigits = 6
  const minDigits = 4

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [step])

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const currentPin = step === "enter" ? [...pin] : [...confirmPin]
    
    if (value === "") {
      currentPin[index] = ""
      if (step === "enter") {
        setPin(currentPin.filter(Boolean))
      } else {
        setConfirmPin(currentPin.filter(Boolean))
      }
      return
    }

    currentPin[index] = value.slice(-1)
    
    if (step === "enter") {
      setPin(currentPin)
    } else {
      setConfirmPin(currentPin)
    }
    
    setError(false)

    if (index < maxDigits - 1 && value) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      const currentPin = step === "enter" ? pin : confirmPin
      if (!currentPin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const currentPin = step === "enter" ? pin : confirmPin
    const pinString = currentPin.join("")

    if (pinString.length < minDigits) {
      setError(true)
      return
    }

    if (isSetup) {
      if (step === "enter") {
        setStep("confirm")
        setConfirmPin([])
      } else {
        if (pin.join("") === confirmPin.join("")) {
          authenticate(pinString)
        } else {
          setError(true)
          setConfirmPin([])
          inputRefs.current[0]?.focus()
        }
      }
    } else {
      const success = authenticate(pinString)
      if (!success) {
        setError(true)
        setPin([])
        inputRefs.current[0]?.focus()
      }
    }
  }

  const handleGenerateKey = () => {
    const key = generateClientKey()
    setGeneratedKey(key)
  }

  const handleDownloadKey = () => {
    if (!generatedKey) return
    const blob = new Blob([generatedKey], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "securevault-key.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (showKeySetup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-8">
          <div className="mb-6 flex items-center justify-center">
            <div className="rounded-full bg-primary/20 p-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">
            Generate Client Key
          </h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Your client key is used for the first layer of encryption. Store it safely.
          </p>

          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <p className="text-sm text-warning">
                If you lose this key, your data cannot be recovered. Download and store it securely.
              </p>
            </div>
          </div>

          {generatedKey ? (
            <div className="mb-6 space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-xs text-muted-foreground">Your Client Key:</p>
                <code className="break-all font-mono text-sm text-foreground">
                  {generatedKey}
                </code>
              </div>
              <Button
                onClick={handleDownloadKey}
                className="w-full gap-2"
                variant="secondary"
              >
                <Download className="h-4 w-4" />
                Download Key File
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGenerateKey}
              className="mb-6 w-full gap-2"
            >
              <Key className="h-4 w-4" />
              Generate New Key
            </Button>
          )}

          <Button
            onClick={() => setShowKeySetup(false)}
            variant="ghost"
            className="w-full"
          >
            {generatedKey ? "Continue to PIN Setup" : "Skip for Now"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="rounded-full bg-primary/20 p-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="mb-2 text-center text-2xl font-semibold text-foreground">
          {isSetup
            ? step === "enter"
              ? "Create Your PIN"
              : "Confirm Your PIN"
            : "Enter Your PIN"}
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {isSetup
            ? step === "enter"
              ? "Choose a 4-6 digit PIN to secure your vault"
              : "Enter your PIN again to confirm"
            : "Enter your PIN to unlock your secure vault"}
        </p>

        <div className="mb-6 flex justify-center gap-3">
          {Array.from({ length: maxDigits }).map((_, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={(step === "enter" ? pin : confirmPin)[index] || ""}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "h-14 w-10 rounded-lg border-2 bg-muted/30 text-center font-mono text-xl transition-all",
                "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                error && "border-destructive animate-shake"
              )}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-destructive">
            {isSetup && step === "confirm"
              ? "PINs do not match. Try again."
              : "Invalid PIN. Please try again."}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
        >
          {isSetup
            ? step === "enter"
              ? "Continue"
              : "Create PIN"
            : "Unlock"}
        </Button>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Client Key</span>
            </div>
            <div className="flex items-center gap-2">
              {encryptionStatus.clientKeyActive ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Active</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not Set</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">PIN</span>
            </div>
            <div className="flex items-center gap-2">
              {encryptionStatus.pinSet ? (
                <>
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Set</span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not Set</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {!isSetup && (
            <button
              onClick={() => setIsSetup(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Create New Account
            </button>
          )}
          {isSetup && (
            <button
              onClick={() => {
                setIsSetup(false)
                setStep("enter")
                setPin([])
                setConfirmPin([])
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Already have an account?
            </button>
          )}
          <button
            onClick={() => setShowKeySetup(true)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Manage Key
          </button>
        </div>
      </div>
    </div>
  )
}
