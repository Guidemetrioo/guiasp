'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Plus, Search, Edit2, Trash2, MapPin, Utensils, AlertTriangle } from 'lucide-react'

interface Restaurant {
  id: string
  nome: string
  slug: string
  tipo_cozinha: string
  bairro: string
  preco_medio: string
  instagram_handle: string
  foto_capa_url: string
}

export default function ListRestaurantes() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .order('nome')

      if (error) throw error
      setRestaurants(data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao carregar restaurantes.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o restaurante "${name}"? Esta ação também removerá os vídeos e planos vinculados a ele.`)) {
      return
    }

    setActionLoading(id)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('restaurantes')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRestaurants(restaurants.filter((r) => r.id !== id))
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao excluir restaurante.')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = restaurants.filter((r) =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tipo_cozinha.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Restaurantes</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie, edite ou exclua restaurantes parceiros no GuiaSP.
          </p>
        </div>
        <Link
          href="/admin/restaurantes/novo"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-gold hover:bg-brand-goldHover text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-gold/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Restaurante</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center space-x-3 text-sm text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar Search */}
      <div className="flex items-center bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 max-w-md focus-within:border-brand-gold/45 transition-colors">
        <Search className="w-4 h-4 text-zinc-500 mr-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, bairro ou cozinha..."
          className="bg-transparent border-0 p-0 text-sm text-white focus:ring-0 focus:outline-none w-full placeholder-zinc-500"
        />
      </div>

      {loading ? (
        <div className="h-60 bg-zinc-950/25 border border-zinc-900/80 rounded-2xl flex items-center justify-center">
          <span className="text-zinc-500 text-sm animate-pulse">Carregando lista...</span>
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/20 text-xs text-zinc-400 uppercase font-semibold">
                <th className="px-6 py-4">Restaurante</th>
                <th className="px-6 py-4">Cozinha</th>
                <th className="px-6 py-4">Bairro</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm text-zinc-300">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950">
                        <img
                          src={r.foto_capa_url || '/images/placeholder-restaurant.jpg'}
                          alt={r.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{r.nome}</div>
                        <div className="text-xs text-zinc-500">@{r.instagram_handle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 text-xs text-zinc-400">
                      <Utensils className="w-3 h-3 mr-1 text-brand-gold/60" />
                      {r.tipo_cozinha}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    <span className="flex items-center text-xs">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                      {r.bairro}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-gold">{r.preco_medio}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        href={`/admin/restaurantes/editar/${r.id}`}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(r.id, r.nome)}
                        disabled={actionLoading === r.id}
                        className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl space-y-3">
          <p className="text-zinc-500 text-sm">Nenhum restaurante encontrado para a sua busca.</p>
        </div>
      )}
    </div>
  )
}
