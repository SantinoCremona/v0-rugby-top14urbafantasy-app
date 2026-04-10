"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2 } from "lucide-react"

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      alert("Error: " + error.message)
    } else {
      alert("¡Contraseña actualizada con éxito!")
      router.push("/login")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 p-10 rounded-[40px] shadow-2xl text-center">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-8">
          Nueva <span className="text-white/20">Clave</span>
        </h1>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
            <Input 
              type="password" 
              required
              placeholder="NUEVA CONTRASEÑA" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-16 bg-white/5 border-white/10 rounded-2xl pl-12 font-bold focus:border-emerald-500 transition-all uppercase"
            />
          </div>
          <Button disabled={loading} className="w-full h-16 rounded-2xl bg-emerald-500 text-black font-black italic uppercase text-lg hover:bg-emerald-400 transition-all shadow-xl">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "ACTUALIZAR Y ENTRAR"}
          </Button>
        </form>
      </div>
    </div>
  )
}
