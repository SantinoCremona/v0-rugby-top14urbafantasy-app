"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client" 
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Loader2, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient() 

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nombreDT, setNombreDT] = useState("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // VALIDACIÓN: 1 Mayúscula y al menos 2 Números
  const validatePassword = (pass: string) => {
    const hasUpperCase = /[A-Z]/.test(pass)
    const hasTwoNumbers = (pass.match(/\d/g) || []).length >= 2
    return hasUpperCase && hasTwoNumbers
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (isLogin) {
        // --- INICIAR SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          // Traducción de errores comunes de login
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Credenciales inválidas. Revisá tu email o contraseña.")
          }
          throw error
        }
        router.push("/dashboard")
        router.refresh()
      } else {
        // --- REGISTRARSE ---
        
        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden")
        }

        if (!validatePassword(password)) {
          throw new Error("La contraseña requiere 1 mayúscula y 2 números")
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          // Traducción de error de usuario ya registrado
          if (signUpError.message.includes("User already registered")) {
            throw new Error("El usuario ya está registrado")
          }
          throw signUpError
        }

        if (data.user) {
          const { error: profileError } = await supabase
            .from('perfiles')
            .insert([{ 
              id: data.user.id, 
              email: email, 
              nombre_equipo: nombreDT.trim() 
            }])

          if (profileError) {
            if (profileError.code === '23505') {
              throw new Error("Ese nombre de equipo ya está registrado")
            }
            throw profileError
          }
          
          setIsLogin(true)
          alert("¡Cuenta creada con éxito! Ya podés ingresar.")
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      
      {/* Luces de Fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />

      {/* HEADER */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
          HEAD<span className="text-white/20">COACH</span>
        </h1>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mt-2">URBA TOP 14 • 2026</p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-white/[0.02] border border-white/10 p-8 md:p-10 rounded-[40px] backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in duration-500">
        <h2 className="text-xl font-black italic text-center mb-8 uppercase tracking-widest">
          {isLogin ? "Acceso / Vestuario" : "Nuevo / Manager"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="relative group animate-in slide-in-from-top-2 duration-300">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="NOMBRE DEL EQUIPO"
                value={nombreDT}
                onChange={(e) => setNombreDT(e.target.value)}
                required
                className="h-14 bg-white/5 border-white/10 pl-12 rounded-2xl font-bold text-white placeholder:text-gray-700 focus:border-white transition-all tracking-widest text-[11px]"
              />
            </div>
          )}

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors" />
            <Input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 bg-white/5 border-white/10 pl-12 rounded-2xl font-bold text-white placeholder:text-gray-700 focus:border-white transition-all tracking-widest text-[11px]"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="CONTRASEÑA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 bg-white/5 border-white/10 pl-12 rounded-2xl font-bold text-white placeholder:text-gray-700 focus:border-white transition-all tracking-widest text-[11px]"
            />
            <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
            >
                {/* Lógica de icono corregida: Tachado (EyeOff) oculta, Abierto (Eye) muestra */}
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {!isLogin && (
            <div className="relative group animate-in slide-in-from-top-2 duration-300">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-white transition-colors" />
              <Input
                type="password"
                placeholder="CONFIRMAR CONTRASEÑA"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-14 bg-white/5 border-white/10 pl-12 rounded-2xl font-bold text-white placeholder:text-gray-700 focus:border-white transition-all tracking-widest text-[11px]"
              />
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest italic animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-xl transition-all active:scale-[0.98] mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? "ENTRAR" : "REGISTRARSE"} <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-3">
            {isLogin ? "¿Aún no sos manager?" : "¿Ya tenés un equipo?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
            }}
            className="text-xs font-black text-white uppercase tracking-tighter hover:text-emerald-400 transition-colors italic border-b border-white/10 pb-1"
          >
            {isLogin ? "Crear cuenta de DT" : "Volver al login"}
          </button>
        </div>
      </div>

      <footer className="mt-12 text-[9px] text-gray-700 font-black uppercase tracking-[0.6em]">
        FANTASY TOP 14 2026
      </footer>
    </div>
  )
}
