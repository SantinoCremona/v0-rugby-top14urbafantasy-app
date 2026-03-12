import Link from "next/link"

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border md:hidden">
      <div className="flex items-center justify-center h-14 px-4">
        <Link href="/dashboard" className="block text-center">
          <h1 className="font-display text-xl tracking-tight">GRAN DT URBA</h1>
        </Link>
      </div>
    </header>
  )
}
