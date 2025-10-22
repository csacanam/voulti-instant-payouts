"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Building2 } from "lucide-react"
import { useCommerce } from "@/components/providers/commerce-provider"

export function CommerceRegistrationModal() {
  const { needsRegistration, registerCommerce, loading, error } = useCommerce()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation
    if (!name.trim()) {
      setValidationError("Business name is required")
      return
    }

    if (!description.trim()) {
      setValidationError("Description is required")
      return
    }

    if (!email.trim()) {
      setValidationError("Email is required")
      return
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setValidationError("Please enter a valid email address")
      return
    }

    try {
      await registerCommerce({
        name: name.trim(),
        description_spanish: description.trim(), // Same description for both initially
        description_english: description.trim(),
        email: email.trim(),
      })
    } catch (err) {
      // Error is handled by context
    }
  }

  return (
    <Dialog open={needsRegistration} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Before you can use Voulti, we need some basic information about your business.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {(error || validationError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              placeholder="My Business Inc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">The name of your business or organization</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="Brief description of your business"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">A short description of what your business does</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@mybusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">We'll use this for important notifications</p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating Account..." : "Get Started"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This information is required to use Voulti's services
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}

