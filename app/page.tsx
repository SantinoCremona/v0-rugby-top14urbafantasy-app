"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  const handleGoogleLogin = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-2">
            GRAN DT
          </h1>
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            URBA Top 14 Fantasy
          </p>
        </div>

        {/* Form */}
        <div className="border border-border p-6 md:p-8 bg-background">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8 tracking-tight">
            {isLogin ? "ENTRA AL CLUB" : "UNITE AL CLUB"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-border bg-background text-sm tracking-wider placeholder:text-muted-foreground/60"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-border bg-background text-sm tracking-wider placeholder:text-muted-foreground/60"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="NOMBRE DE DT"
                  className="h-12 border-border bg-background text-sm tracking-wider placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-primary-foreground font-bold text-sm tracking-widest hover:bg-primary/90 transition-colors"
            >
              {isLogin ? "ENTRAR" : "REGISTRARSE"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground tracking-wider">
                o
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 border-border bg-background text-foreground font-medium text-sm tracking-wider hover:bg-muted transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            ENTRAR CON GOOGLE
          </Button>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {isLogin ? "No tenes cuenta?" : "Ya tenes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="underline underline-offset-2 text-foreground hover:no-underline"
            >
              {isLogin ? "Registrate" : "Entra"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
