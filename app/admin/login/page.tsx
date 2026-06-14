'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Check if we are running in mock mode (Supabase keys not present)
      const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (isMock) {
        document.cookie = 'sb-mock-session=true; path=/; max-age=86400;'
        setMessage({
          type: 'success',
          text: 'Modo offline ativo: Login efetuado com sucesso! Redirecionando...',
        })
        setTimeout(() => {
          window.location.href = '/admin'
        }, 1000)
        return
      }

      const supabase = createClient()
      const redirectTo = `${window.location.origin}/api/auth/callback`

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (error) {
        throw error
      }

      setMessage({
        type: 'success',
        text: 'Link de login enviado! Verifique seu e-mail para acessar o painel.',
      })
    } catch (err: any) {
      console.error(err)
      setMessage({
        type: 'error',
        text: err.message || 'Ocorreu um erro ao tentar enviar o link.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-gold/5 to-transparent pointer-events-none blur-3xl rounded-full w-96 h-96 mx-auto top-1/4"></div>

      <div className="max-w-md w-full space-y-8 bg-zinc-900/40 p-10 rounded-2xl border border-zinc-900 shadow-2xl backdrop-blur-md relative z-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-serif tracking-wide">
            Guia<span className="text-brand-gold">SP</span> <span className="text-xs uppercase font-sans tracking-widest text-brand-gold/75 block mt-2">Painel</span>
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Entre com seu e-mail para receber um link de acesso ou logar localmente.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-sm ${
              message.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                : 'bg-red-950/40 text-red-400 border border-red-900/60'
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Endereço de E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-xl relative block w-full px-4 py-3 bg-zinc-950 border border-zinc-850 placeholder-zinc-600 text-white focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold sm:text-sm transition-all"
                placeholder="Ex: admin@guiasp.com.br"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-black bg-brand-gold hover:bg-brand-goldHover focus:outline-none transition-colors disabled:opacity-50 font-sans"
            >
              {loading ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
