'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Film, Sparkles, Link2, CheckCircle, AlertTriangle, Loader2, Utensils, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Restaurante {
  id: string
  nome: string
}

interface Influencer {
  id: string
  nome: string
}

export default function AutoLinkPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurante[]>([])
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  
  // Input states
  const [url, setUrl] = useState('')
  const [influencerId, setInfluencerId] = useState('')
  
  // UI states
  const [step, setStep] = useState(1) // 1 = input, 2 = review
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Extracted data states
  const [extractedTitle, setExtractedTitle] = useState('')
  const [extractedTranscript, setExtractedTranscript] = useState('')
  const [extractedDish, setExtractedDish] = useState('')
  const [extractedKeywords, setExtractedKeywords] = useState('')
  const [matchedRestaurantId, setMatchedRestaurantId] = useState('')
  const [confidence, setConfidence] = useState(0)

  // Fetch init data
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const [resRest, resInf] = await Promise.all([
          supabase.from('restaurantes').select('id, nome').eq('ativo', true).order('nome'),
          supabase.from('influencers').select('id, nome').order('nome')
        ])

        if (resRest.data) setRestaurants(resRest.data)
        if (resInf.data) setInfluencers(resInf.data)
      } catch (err) {
        console.error('Erro ao buscar dados do banco:', err)
      }
    }
    loadData()
  }, [])

  // Call API route to auto-link
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    setErrorMessage(null)
    
    // Simulate premium status updates
    const statuses = [
      'Conectando à API do Instagram...',
      'Baixando metadados do Reels...',
      'Processando áudio com Whisper...',
      'Extraindo legenda e áudio por IA...',
      'Calculando correlação de geolocalização e nomes...'
    ]
    
    let statusIdx = 0
    setStatusText(statuses[0])
    
    const interval = setInterval(() => {
      statusIdx++
      if (statusIdx < statuses.length) {
        setStatusText(statuses[statusIdx])
      }
    }, 2000)

    try {
      const response = await fetch('/api/admin/videos/auto-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, influencer_id: influencerId || null })
      })

      clearInterval(interval)

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Erro ao processar vídeo.')
      }

      const { video } = await response.json()
      
      // Load details into form fields
      setExtractedTitle(video.titulo || '')
      setExtractedTranscript(video.transcricao || '')
      setExtractedDish(video.prato_destaque || '')
      setExtractedKeywords(video.palavras_chave ? video.palavras_chave.join(', ') : '')
      setMatchedRestaurantId(video.restaurante_id || '')
      setConfidence(video.confidence || 0)
      
      setStep(2)
    } catch (err: any) {
      clearInterval(interval)
      console.error(err)
      setErrorMessage(err.message || 'Falha na extração de dados do vídeo.')
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  // Handle saving the approved video link
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatusText('Gravando vídeo no banco de dados...')
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      
      const tagsArray = extractedKeywords
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      // Add default mock video url if not present
      const { error } = await supabase.from('videos').insert({
        titulo: extractedTitle,
        url_original: url,
        video_url: '/videos/reel_mock.mp4', 
        transcricao: extractedTranscript,
        resumo: `Associação automática inteligente. ${extractedTitle}`,
        palavras_chave: tagsArray,
        prato_destaque: extractedDish,
        thumbnail_url: '/images/placeholder-restaurant.jpg', // Will fallback to restaurant photo if mock join is done
        restaurante_id: matchedRestaurantId,
        influencer_id: influencerId || null
      })

      if (error) throw error

      setSuccessMessage('Vídeo associado com sucesso!')
      setTimeout(() => {
        router.push('/admin/videos')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setErrorMessage(err.message || 'Erro ao cadastrar vídeo.')
      setLoading(false)
      setStatusText('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/videos"
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-850 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide flex items-center">
            Associação de Vídeos por IA <Sparkles className="w-6 h-6 ml-2.5 text-brand-gold animate-pulse" />
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Cole a URL de um Reel ou publicação para transcrever e associar automaticamente ao restaurante ideal.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center space-x-3 text-sm text-red-400">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/50 rounded-xl flex items-center space-x-3 text-sm text-emerald-400">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading && (
        <div className="bg-zinc-900/60 border border-zinc-900 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-t-brand-gold border-zinc-800 rounded-full animate-spin"></div>
            <Sparkles className="w-5 h-5 text-brand-gold absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-semibold text-base">Processando com Inteligência Artificial</h3>
            <p className="text-xs text-zinc-400 mt-1 animate-pulse">{statusText}</p>
          </div>
        </div>
      )}

      {!loading && step === 1 && (
        <form onSubmit={handleAnalyze} className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-6 max-w-2xl shadow-2xl backdrop-blur-md">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">URL do Vídeo (Legenda/Reels)</label>
              <div className="relative flex items-center">
                <Link2 className="w-5 h-5 text-zinc-500 absolute left-3.5" />
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="bg-zinc-900/60 border border-zinc-900 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full placeholder-zinc-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Copie o link público do Reels do Instagram. Exemplo: https://www.instagram.com/reel/C8_pantchoshouse/
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Influencer Autor do Vídeo (Opcional)</label>
              <select
                value={influencerId}
                onChange={(e) => setInfluencerId(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full placeholder-zinc-500 transition-all appearance-none"
              >
                <option value="" className="bg-zinc-950 text-zinc-400">Selecionar automaticamente por IA</option>
                {influencers.map((i) => (
                  <option key={i.id} value={i.id} className="bg-zinc-950 text-white">
                    {i.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-brand-gold hover:bg-brand-goldHover text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-gold/15"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analisar e Vincular com IA</span>
            </button>
          </div>
        </form>
      )}

      {!loading && step === 2 && (
        <form onSubmit={handleSaveVideo} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Fields */}
          <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-md">
            <h3 className="text-lg font-bold text-white font-serif tracking-wide border-b border-zinc-900 pb-3">Revisar Metadados Extraídos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">Título do Vídeo</label>
                <input
                  type="text"
                  required
                  value={extractedTitle}
                  onChange={(e) => setExtractedTitle(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-455 uppercase tracking-wider mb-1.5">Transcrição de Áudio (Whisper)</label>
                <textarea
                  required
                  rows={5}
                  value={extractedTranscript}
                  onChange={(e) => setExtractedTranscript(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">Prato em Destaque</label>
                  <input
                    type="text"
                    required
                    value={extractedDish}
                    onChange={(e) => setExtractedDish(e.target.value)}
                    className="bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-1.5">Palavras-chave (Separadas por Vírgula)</label>
                  <input
                    type="text"
                    required
                    value={extractedKeywords}
                    onChange={(e) => setExtractedKeywords(e.target.value)}
                    className="bg-zinc-900/60 border border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Match & Action Sidebar */}
          <div className="space-y-6">
            {/* Matching Result Box */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-white font-serif tracking-wide border-b border-zinc-900 pb-3">Análise de Vinculação</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-zinc-450">Grau de Confiança</span>
                    <span className={`text-xs font-bold ${confidence >= 90 ? 'text-emerald-450' : 'text-amber-450'}`}>{confidence}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-850">
                    <div
                      className={`h-full rounded-full transition-all ${confidence >= 90 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-amber-500 shadow-lg shadow-amber-500/20'}`}
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {confidence >= 90 
                      ? 'Correspondência de alta certeza obtida por slug ou nome exato na URL.' 
                      : 'Correspondência semântica aproximada por localização e palavras-chave.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Restaurante Correspondente</label>
                  <div className="relative">
                    <Utensils className="w-4 h-4 text-brand-gold absolute left-3 top-3.5" />
                    <select
                      required
                      value={matchedRestaurantId}
                      onChange={(e) => setMatchedRestaurantId(e.target.value)}
                      className="bg-zinc-900/60 border border-zinc-900 rounded-xl pl-9 pr-4 py-3 text-xs text-white focus:ring-1 focus:ring-brand-gold/45 focus:border-brand-gold/45 focus:outline-none w-full transition-all appearance-none"
                    >
                      <option value="">Selecionar restaurante...</option>
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[10px] text-zinc-550 mt-1">
                    Confirme se o restaurante acima corresponde de fato ao local indicado no vídeo.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Actions */}
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-3">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-brand-gold hover:bg-brand-goldHover text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-gold/15"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprovar e Vincular</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Analisar Outra URL</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
