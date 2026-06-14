'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import {
  LayoutDashboard,
  Users,
  Utensils,
  Video,
  CreditCard,
  ExternalLink,
  LogOut,
  Download,
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (isMock) {
      document.cookie = 'sb-mock-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/admin/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Novo Influencer', href: '/admin/influencers/novo', icon: Users },
    { label: 'Novo Restaurante', href: '/admin/restaurantes/novo', icon: Utensils },
    { label: 'Novo Vídeo', href: '/admin/videos/novo', icon: Video },
    { label: 'Novo Plano', href: '/admin/planos/novo', icon: CreditCard },
    { label: 'Importar Vídeos', href: '/admin/videos/importar', icon: Download },
  ]

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-zinc-200 font-sans admin-container">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-zinc-900 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 border-b border-zinc-900 flex items-center px-6">
            <Link
              href="/admin"
              className="text-xl font-bold font-serif text-white tracking-wide"
            >
              GuiaSP <span className="text-xs text-brand-gold font-sans uppercase">Painel</span>
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-brand-gold font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-950/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 text-zinc-500" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-zinc-900 space-y-1">
          <Link
            href="/"
            className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-450 hover:bg-zinc-950/40 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-3 text-zinc-500" />
            Ver Site Público
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors text-left font-sans"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500/80" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-[#0C0C0C]">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
