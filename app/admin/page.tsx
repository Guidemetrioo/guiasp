import React from 'react'
import { createServer } from '@/lib/supabase-server'
import { Users, Utensils, Video, CreditCard } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = createServer()

  const [
    { count: influencersCount },
    { count: restaurantesCount },
    { count: videosCount },
    { count: planosCount },
  ] = await Promise.all([
    supabase.from('influencers').select('*', { count: 'exact', head: true }),
    supabase.from('restaurantes').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('planos').select('*', { count: 'exact', head: true }).eq('status', 'ativo'),
  ])

  const stats = [
    {
      name: 'Influencers',
      value: influencersCount || 0,
      icon: Users,
      color: 'bg-blue-500 text-white',
    },
    {
      name: 'Restaurantes',
      value: restaurantesCount || 0,
      icon: Utensils,
      color: 'bg-emerald-500 text-white',
    },
    {
      name: 'Vídeos Transcritos',
      value: videosCount || 0,
      icon: Video,
      color: 'bg-purple-500 text-white',
    },
    {
      name: 'Planos Ativos',
      value: planosCount || 0,
      icon: CreditCard,
      color: 'bg-amber-500 text-white',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral do crescimento e conteúdos cadastrados no eat.hub.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow rounded-lg border border-slate-200"
            >
              <div className="p-5 flex items-center">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center justify-center p-3 rounded-md shadow-sm ${item.color}`}>
                    <Icon className="h-6 h-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-3xl font-semibold text-slate-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 font-serif">
          Bem-vindo ao Painel de Controle!
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
          Use a barra lateral para cadastrar novos influencers embaixadores, adicionar
          restaurantes parceiros, carregar vídeos de indicações e vincular planos de assinatura.
          Dica: Ao carregar um vídeo na aba "Novo Vídeo", o sistema usará inteligência artificial
          para transcrever a indicação e extrair automaticamente tags e pratos principais.
        </p>
      </div>
    </div>
  )
}
