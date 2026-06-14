'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NovoPlano() {
  const router = useRouter()
  const [restaurantes, setRestaurantes] = useState<{ id: string; nome: string }[]>([])
  const [influencers, setInfluencers] = useState<{ id: string; nome: string }[]>([])
  
  const [restauranteId, setRestauranteId] = useState('')
  const [influencerId, setInfluencerId] = useState('')
  const [valorMensal, setValorMensal] = useState('')
  const [inicioEm, setInicioEm] = useState(new Date().toISOString().split('T')[0])
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const supabase = createClient()
        const [resRestaurantes, resInfluencers] = await Promise.all([
          supabase.from('restaurantes').select('id, nome').eq('ativo', true).order('nome'),
          supabase.from('influencers').select('id, nome').order('nome'),
        ])
        
        if (resRestaurantes.data) setRestaurantes(resRestaurantes.data)
        if (resInfluencers.data) setInfluencers(resInfluencers.data)
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      }
    }
    fetchSelectData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Calculate renewal date (30 days from start)
      const startDate = new Date(inicioEm)
      const renewalDate = new Date(startDate)
      renewalDate.setDate(startDate.getDate() + 30)

      const { error } = await supabase.from('planos').insert([
        {
          restaurante_id: restauranteId,
          influencer_id: influencerId,
          valor_mensal: parseFloat(valorMensal),
          inicio_em: startDate.toISOString(),
          renovacao_em: renewalDate.toISOString(),
          status: 'ativo',
        },
      ])

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Plano de parceria cadastrado com sucesso!' })
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao cadastrar plano.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Vincular Plano de Parceria</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vincule um restaurante parceiro a um influencer específico para exibição de conteúdos patrocinados.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Restaurante</label>
            <select
              required
              value={restauranteId}
              onChange={(e) => setRestauranteId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
            >
              <option value="">Selecione um restaurante...</option>
              {restaurantes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Influencer</label>
            <select
              required
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
            >
              <option value="">Selecione um influencer...</option>
              {influencers.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Valor Mensal (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              placeholder="Ex: 1200.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Data de Início</label>
            <input
              type="date"
              required
              value={inicioEm}
              onChange={(e) => setInicioEm(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Plano de Parceria'}
          </button>
        </div>
      </form>
    </div>
  )
}
