"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/useAuthStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Lock, Delete, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function LockScreen() {
  const [pin, setPin] = useState("")
  const { login, isLoading } = useAuthStore()

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + num)
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (pin.length < 4) {
      toast.error("PIN must be at least 4 digits")
      return
    }
    
    try {
      await login(pin)
      toast.success("Database unlocked")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed")
      setPin("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-[350px] shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">POS Locked</CardTitle>
          <CardDescription>Enter your staff PIN to access the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={pin}
              readOnly
              className="text-center text-3xl tracking-[1em] h-16 font-mono"
              placeholder="••••"
            />
          </form>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                size="lg"
                className="h-16 text-2xl font-semibold hover:bg-primary/5 active:scale-95 transition-all"
                onClick={() => handleKeyPress(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="lg"
              className="h-16 text-destructive"
              onClick={handleDelete}
            >
              <Delete className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 text-2xl font-semibold"
              onClick={() => handleKeyPress("0")}
            >
              0
            </Button>
            <Button
              variant="default"
              size="lg"
              className="h-16"
              disabled={isLoading || pin.length < 4}
              onClick={() => handleSubmit()}
            >
              {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" /> : <ArrowRight className="w-6 h-6" />}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          Restaurant Management System v1.0 • AES-256 Encrypted
        </CardFooter>
      </Card>
    </div>
  )
}
