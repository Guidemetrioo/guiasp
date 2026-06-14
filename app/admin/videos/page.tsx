'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Plus, Search, Edit2, Trash2, Film, User, Utensils, AlertTriangle } from 'lucide-react'

interface VideoItem {
  id: string
  titulo: string
  url_original: string
  prato_destaque: string
  video_url: string
  restaurantes?: {
    nome: string
  }
  influencers?: {
    nome: string
  }
}

export default function ListVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          titulo,
          url_original,
          prato_destaque,
          video_url,
          restaurantes ( nome ),
          influencers ( nome )
        `)
        .order('criado_em', { ascending: False })

      if (error) throw error
      setVideos((data as any) || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao carregar vídeos.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o vídeo "${title}"?`)) {
      return
    }

    setActionLoading(id)
    setError(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVideos(videos.filter((v) => v.id !== id))
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erro ao excluir vídeo.')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = videos.filter((v) =>
    v.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.restaurantes?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.influencers?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.prato_destaque?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Vídeos de Reviews</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gerencie e edite os vídeos transcritos e associados aos estabelecimentos.
          </p>
        </div>
        <Link
          href="/admin/videos/novo"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-gold hover:bg-brand-goldHover text-black text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-gold/10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Vídeo</span>
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
          placeholder="Buscar por título, restaurante ou embaixador..."
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
                <th className="px-6 py-4">Vídeo</th>
                <th className="px-6 py-4">Restaurante</th>
                <th className="px-6 py-4">Influencer</th>
                <th className="px-6 py-4">Prato Destaque</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-sm text-zinc-300">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-zinc-900 border border-zinc-850 rounded-lg text-brand-gold shrink-0">
                        <Film className="w-5 h-5" />
                      </div>
                      <div className="max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-white truncate" title={v.titulo}>
                          {v.titulo || 'Sem título'}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate">
                          {v.video_url || 'Sem arquivo local'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <span className="flex items-center text-xs">
                      <Utensils className="w-3.5 h-3.5 mr-1.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{v.restaurantes?.nome || 'Não vinculado'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <span className="flex items-center text-xs">
                      <User className="w-3.5 h-3.5 mr-1.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{v.influencers?.nome || 'Desconhecido'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-gold italic text-xs">
                    {v.prato_destaque || 'Nenhum'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <Link
                        href={`/admin/videos/editar/${v.id}`}
                        className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id, v.titulo)}
                        disabled={actionLoading === v.id}
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
          <p className="text-zinc-500 text-sm">Nenhum vídeo cadastrado.</p>
        </div>
      )}
    </div>
  )
}
