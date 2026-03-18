"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function JoinLeaguePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const leagueId = searchParams.get("leagueId")

  useEffect(() => {
    const joinProcess = async () => {
      if (!leagueId) return router.push("/dashboard")

      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. Si no está logueado, mandalo a registrarse
      if (!user) {
        return router.push(`/login?next=/join?leagueId=${leagueId}`)
      }

      // 2. Unirlo a la liga en la tabla 'miembros_ligas' (o como se llame la tuya)
      const { error } = await supabase
        .from('liga_miembros')
        .insert([{ 
          liga_id: leagueId, 
          user_id: user.id 
        }])

      if (error && error.code !== '23505') { // 23505 es "ya existe"
        console.error("Error uniéndose:", error)
        alert("No se pudo unir a la liga.")
      }

      // 3. Mandarlo al dashboard de esa liga
      router.push(`/ligas/${leagueId}`)
    }

    joinProcess()
  }, [leagueId])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white font-black animate-pulse uppercase tracking-widest">
        Procesando invitación...
      </p>
    </div>
  )
}