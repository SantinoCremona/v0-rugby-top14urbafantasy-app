"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Lock, Mail, User, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombreEquipo, setNombreEquipo] = useState("")
  const [error, setError] = useState<string | null>(null)

  // VALIDACIÓN DE CONTRASEÑA: 1 Mayúscula y 2 Números
  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass)
    const hasTwoNumbers = (pass.match(/\d/g) || []).length >= 2
    return hasUpperCase && hasTwoNumbers
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isRegister) {
      // 1. Validar que coincidan
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden")
        setLoading(false)
        return
      }
      // 2. Validar complejidad
      if (!validatePassword(password)) {
        setError("La contraseña debe tener al menos 1 mayúscula y 2 números")
        setLoading(false)
        return
      }
      // 3. Validar nombre de equipo no vacío
      if (!nombreEquipo.trim()) {
        setError("Elegí un nombre para tu equipo")
        setLoading(false)
        return
      }

      // REGISTRO EN SUPABASE
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_equipo: nombreEquipo.trim(),
          }
        }
      })

      if (signUpError) {
        // Capturamos el error de duplicado (si ya aplicaste el UNIQUE en SQL)
        if (signUpError.message.includes("unique_nombre_equipo")) {
          setError("Este nombre de equipo ya existe")
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }
    } else {
      // LOGIN
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError("Credenciales inválidas")
        setLoading(false)
        return
      }
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-[400px] space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* LOGO SECCIÓN */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4 shadow-2xl rotate-[-6deg]">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            GRAN<span className="text-white/20">DT</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">URBA TOP 12 • 2026</p>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[32px] backdrop-blur-md shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-5">
            
            {isRegister && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nombre de Equipo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <Input 
                    required
                    placeholder="PUMAS XV"
                    value={nombreEquipo}
                    onChange={(e) => setNombreEquipo(e.target.value)}
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-800 focus:border-white transition-all uppercase"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <Input 
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-800 focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-800 focus:border-white transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Confirmar Contraseña</label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 bg-white/5 border-white/10 rounded-2xl text-white font-bold placeholder:text-gray-800 focus:border-white transition-all"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[11px] font-bold uppercase italic">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white hover:bg-gray-200 text-black rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? "Crear Equipo" : "Entrar al Vestuario")}
            </Button>
          </form>

          <button 
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="w-full mt-6 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            {isRegister ? "¿Ya tenés cuenta? Iniciá Sesión" : "¿Sos nuevo? Registrate aquí"}
          </button>
        </div>

        <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-widest">
          Al entrar aceptás las reglas de la liga privada
        </p>
      </div>
    </div>
  )
}
