'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/loader'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'

const COMMON_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'live.com', 'rediffmail.com', 'ymail.com',
]

function suggestDomain(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at < 1) return null
  const typed = email.slice(at + 1).toLowerCase()
  if (!typed || COMMON_DOMAINS.includes(typed)) return null

  for (const domain of COMMON_DOMAINS) {
    if (typed === domain) return null
    // Levenshtein distance ≤ 2
    if (levenshtein(typed, domain) <= 2) return email.slice(0, at + 1) + domain
  }
  return null
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
  return dp[a.length][b.length]
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
  
  const { login, signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await login(email, password)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Welcome back!')
      } else {
        if (!name.trim()) {
          toast.error('Please enter your name')
          return
        }
        const { error } = await signup(email, password, name)
        if (error) {
          toast.error(error)
          return
        }
        toast.success('Account created successfully!')
      }
      router.push('/')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <Card className="relative w-full max-w-md glass-panel shadow-2xl border-border/50 rounded-2xl">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
            <ShoppingBag className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin 
              ? 'Sign in to continue ordering' 
              : 'Sign up to start ordering delicious food'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="h-12 rounded-xl bg-input border-border/60"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailSuggestion(null) }}
                onBlur={(e) => setEmailSuggestion(suggestDomain(e.target.value))}
                required
                className="h-12 rounded-xl bg-input border-border/60"
              />
              {emailSuggestion && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Did you mean{' '}
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-2 hover:text-yellow-700 dark:hover:text-yellow-300"
                    onClick={() => { setEmail(emailSuggestion); setEmailSuggestion(null) }}
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-10 rounded-xl bg-input border-border/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold mt-6 rounded-xl shadow-lg shadow-primary/25" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader size="sm" className="text-primary-foreground" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-primary">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
