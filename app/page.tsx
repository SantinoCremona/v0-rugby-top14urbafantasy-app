"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// --- USAMOS LA FUNCIÓN QUE VISTE EN lib/supabase/client ---
import { createClient } from "@/lib/supabase/client" 

export default function LoginPage() {
  const router = useRouter()
  
  // --- ACTIVAMOS LA CONEXIÓN ---
  const supabase = createClient() 

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombreDT, setNombreDT] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // --- INICIAR SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/dashboard")
      } else {
        // --- REGISTRARSE ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          // --- GUARDAR NOMBRE EN LA TABLA PERFILES ---
          const { error: profileError } = await supabase
            .from('perfiles')
            .insert([{ 
              id: data.user.id, 
              email: email, 
              nombre_equipo: nombreDT 
            }])

          if (profileError) throw profileError
          
          alert("¡Cuenta creada! Ahora podés entrar con tu email.")
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl tracking-tight mb-2 uppercase">GRAN DT</h1>
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">URBA Top 14 Fantasy</p>
        </div>

        <div className="border border-black p-6 md:p-8 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-2xl md:text-3xl text-center mb-8 tracking-tight uppercase">
            {isLogin ? "ENTRA AL CLUB" : "UNITE AL CLUB"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-black rounded-none text-black"
              required
            />
            <Input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 border-black rounded-none text-black"
              required
            />

            {!isLogin && (
              <Input
                type="text"
                placeholder="NOMBRE DE DT"
                value={nombreDT}
                onChange={(e) => setNombreDT(e.target.value)}
                className="h-12 border-black rounded-none text-black"
                required
              />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-black text-white font-bold text-sm tracking-widest hover:bg-gray-800 rounded-none transition-colors"
            >
              {loading ? "CARGANDO..." : isLogin ? "ENTRAR" : "REGISTRARSE"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {isLogin ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold underline text-black uppercase"
            >
              {isLogin ? "Registrate" : "Entrá"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
