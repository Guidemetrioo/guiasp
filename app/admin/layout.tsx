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
} from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Novo Influencer', href: '/admin/influencers/novo', icon: Users },
    { label: 'Novo Restaurante', href: '/admin/restaurantes/novo', icon: Utensils },
    { label: 'Novo Vídeo', href: '/admin/videos/novo', icon: Video },
    { label: 'Novo Plano', href: '/admin/planos/novo', icon: CreditCard },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-16 border-b border-slate-200 flex items-center px-6">
            <Link
              href="/admin"
              className="text-xl font-bold font-serif text-slate-900 tracking-wide"
            >
              eat.hub <span className="text-xs text-amber-500 font-sans uppercase">Painel</span>
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
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 text-slate-400" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link
            href="/"
            className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-3 text-slate-400" />
            Ver Site Público
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left font-sans"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
