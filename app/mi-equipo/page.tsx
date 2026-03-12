import { redirect } from "next/navigation"

export default function MiEquipoPage() {
  // Redirect to dashboard which contains the team view
  redirect("/dashboard")
}
