'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NovoVideo() {
  const router = useRouter()
  const [restaurantes, setRestaurantes] = useState<{ id: string; nome: string }[]>([])
  const [influencers, setInfluencers] = useState<{ id: string; nome: string }[]>([])
  
  // Form step 1
  const [restauranteId, setRestauranteId] = useState('')
  const [influencerId, setInfluencerId] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  
  // Processing state
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  
  // Form step 2 (review and edit)
  const [step, setStep] = useState(1)
  const [titulo, setTitulo] = useState('')
  const [transcricao, setTranscricao] = useState('')
  const [resumo, setResumo] = useState('')
  const [pratoDestaque, setPratoDestaque] = useState('')
  const [palavrasChaveRaw, setPalavrasChaveRaw] = useState('')
  
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
        console.error('Erro ao buscar dados iniciais:', err)
      }
    }
    fetchSelectData()
  }, [])

  const handleTranscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusText('Transcrevendo áudio com Whisper e processando com Claude...')
    setMessage(null)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl,
          restaurante_id: restauranteId,
          influencer_id: influencerId,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Erro na transcrição do vídeo.')
      }

      const video = await response.json()
      
      setVideoId(video.id)
      setTitulo(video.titulo || '')
      setTranscricao(video.transcricao || '')
      setResumo(video.resumo || '')
      setPratoDestaque(video.prato_destaque || '')
      setPalavrasChaveRaw(video.palavras_chave ? video.palavras_chave.join(', ') : '')
      
      setStep(2)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Ocorreu um erro no pipeline de transcrição.' })
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusText('Atualizando vídeo no banco de dados...')
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
          titulo,
          transcricao,
          resumo,
          prato_destaque: pratoDestaque,
          palavras_chave: tagsArray,
          thumbnail_url: thumbnailUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300&q=80`,
        })
        .eq('id', videoId)

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Vídeo salvo e publicado com sucesso!' })
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar alterações no vídeo.' })
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Registrar Vídeo</h1>
        <p className="mt-1 text-sm text-slate-500">
          Carregue um vídeo de indicação e gere dados de busca usando IA.
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

      {loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 flex items-center space-x-3 text-sm animate-pulse max-w-2xl">
          <div className="w-5 h-5 border-2 border-t-transparent border-amber-600 rounded-full animate-spin"></div>
          <div>{statusText}</div>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleTranscribe} className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6 max-w-2xl">
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

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">URL do Vídeo</label>
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
                placeholder="https://exemplo.com/video.mp4"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">URL da Thumbnail (Opcional)</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
                placeholder="https://exemplo.com/thumb.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processando...' : 'Transcrever e Extrair com IA'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleConfirmSave} className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6 max-w-2xl animate-fade-in">
          <div className="bg-green-50 text-green-800 p-4 rounded-md border border-green-100 text-xs mb-4">
            ✓ Transcrição e extração de dados concluídas. Por favor, valide e ajuste as informações geradas abaixo antes de salvar.
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Título do Vídeo</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Prato Destaque</label>
              <input
                type="text"
                required
                value={pratoDestaque}
                onChange={(e) => setPratoDestaque(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Palavras Chave (separadas por vírgula)</label>
              <input
                type="text"
                required
                value={palavrasChaveRaw}
                onChange={(e) => setPalavrasChaveRaw(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Resumo da Avaliação</label>
              <textarea
                required
                rows={2}
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Transcrição Completa</label>
              <textarea
                required
                rows={5}
                value={transcricao}
                onChange={(e) => setTranscricao(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900 text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-300 text-sm font-semibold rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Confirmando...' : 'Confirmar e Salvar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
