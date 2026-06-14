'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface OptionItem {
  id: string
  nome: string
}

export default function EditarVideo() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [restaurantes, setRestaurantes] = useState<OptionItem[]>([])
  const [influencers, setInfluencers] = useState<OptionItem[]>([])
  
  const [restauranteId, setRestauranteId] = useState('')
  const [influencerId, setInfluencerId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [transcricao, setTranscricao] = useState('')
  const [resumo, setResumo] = useState('')
  const [pratoDestaque, setPratoDestaque] = useState('')
  const [palavrasChaveRaw, setPalavrasChaveRaw] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const [resRestaurantes, resInfluencers, resVideo] = await Promise.all([
        supabase.from('restaurantes').select('id, nome').eq('ativo', true).order('nome'),
        supabase.from('influencers').select('id, nome').order('nome'),
        supabase.from('videos').select('*').eq('id', id).single()
      ])

      if (resRestaurantes.data) setRestaurantes(resRestaurantes.data)
      if (resInfluencers.data) setInfluencers(resInfluencers.data)
      
      if (resVideo.error) throw resVideo.error

      if (resVideo.data) {
        setRestauranteId(resVideo.data.restaurante_id || '')
        setInfluencerId(resVideo.data.influencer_id || '')
        setVideoUrl(resVideo.data.video_url || '')
        setThumbnailUrl(resVideo.data.thumbnail_url || '')
        setTitulo(resVideo.data.titulo || '')
        setTranscricao(resVideo.data.transcricao || '')
        setResumo(resVideo.data.resumo || '')
        setPratoDestaque(resVideo.data.prato_destaque || '')
        setPalavrasChaveRaw(resVideo.data.palavras_chave ? resVideo.data.palavras_chave.join(', ') : '')
      }
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao carregar dados do vídeo.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const tagsArray = palavrasChaveRaw
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const { error } = await supabase
        .from('videos')
        .update({
          restaurante_id: restauranteId,
          influencer_id: influencerId,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          titulo,
          transcricao,
          resumo,
          prato_destaque: pratoDestaque,
          palavras_chave: tagsArray,
        })
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Vídeo atualizado com sucesso!' })
      setTimeout(() => {
        router.push('/admin/videos')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar alterações.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <span className="text-zinc-500 text-sm animate-pulse">Carregando dados do vídeo...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/videos"
          className="p-2 bg-zinc-900/60 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Editar Vídeo</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Atualize a transcrição, palavras-chave e associações do review.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-950/20 text-green-400 border border-green-900/50'
              : 'bg-red-950/20 text-red-400 border border-red-900/50'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-950/40 border border-zinc-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl backdrop-blur-md">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Restaurante</label>
            <select
              required
              value={restauranteId}
              onChange={(e) => setRestauranteId(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Influencer</label>
            <select
              required
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm"
            >
              <option value="">Selecione um influencer...</option>
              {influencers.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Título do Vídeo</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">URL do Vídeo (Local/Remoto)</label>
            <input
              type="text"
              required
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
              placeholder="/videos/exemplo.mp4"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Prato Destaque</label>
            <input
              type="text"
              required
              value={pratoDestaque}
              onChange={(e) => setPratoDestaque(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Palavras Chave (separadas por vírgula)</label>
            <input
              type="text"
              required
              value={palavrasChaveRaw}
              onChange={(e) => setPalavrasChaveRaw(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">URL da Thumbnail (Poster)</label>
            <input
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Resumo da Avaliação</label>
            <textarea
              required
              rows={3}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Transcrição do Vídeo</label>
            <textarea
              required
              rows={6}
              value={transcricao}
              onChange={(e) => setTranscricao(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm text-xs leading-relaxed placeholder-zinc-650"
            />
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-zinc-900">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-gold hover:bg-brand-goldHover text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-brand-gold/10"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
