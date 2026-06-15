'use client'

import React, { useState, useEffect } from 'react'
import {
  Download,
  Link as LinkIcon,
  Film,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Loader2,
  Info,
  ListOrdered
} from 'lucide-react'

interface LocalVideo {
  filename: string
  title: string
  pratoDestaque: string | null
  restauranteId: string | null
  restauranteNome: string | null
  fotoCapaUrl: string | null
  influencerNome: string | null
  dbVideoId: string | null
}

interface QueueItem {
  id: number
  url: string
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  filename?: string
  matchedRestaurant?: string
  error?: string
}

export default function ReelsDownloader() {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk'>('individual')
  
  // Individual State
  const [url, setUrl] = useState('')
  const [browser, setBrowser] = useState('none')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string>('')
  
  // Bulk State
  const [bulkUrls, setBulkUrls] = useState('')
  const [bulkQueue, setBulkQueue] = useState<QueueItem[]>([])
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [bulkActive, setBulkActive] = useState(false)
  
  // Local files state
  const [localVideos, setLocalVideos] = useState<LocalVideo[]>([])
  const [fetchingVideos, setFetchingVideos] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  
  // Preview video modal
  const [previewFile, setPreviewFile] = useState<string | null>(null)
  const [isVercel, setIsVercel] = useState(false)

  useEffect(() => {
    fetchLocalVideos()
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      if (host !== 'localhost' && host !== '127.0.0.1') {
        setIsVercel(true)
      }
    }
  }, [])

  const fetchLocalVideos = async () => {
    setFetchingVideos(true)
    setVideoError(null)
    try {
      const response = await fetch('/api/videos')
      const data = await response.json()
      if (data.success) {
        setLocalVideos(data.videos || [])
      } else {
        setVideoError(data.error || 'Erro ao carregar lista de vídeos.')
      }
    } catch (err) {
      console.error(err)
      setVideoError('Falha de conexão ao carregar vídeos.')
    } finally {
      setFetchingVideos(false)
    }
  }

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setLoading(true)
    setStatus('Iniciando processo de download...')
    setError(null)
    setLogs('')
    
    try {
      const response = await fetch('/api/videos/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, browser })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.message || 'Download concluído com sucesso!')
        setLogs(data.logs || '')
        setUrl('')
        fetchLocalVideos() // Refresh list
      } else {
        setError(data.error || 'Falha ao baixar o Reel.')
        setLogs(data.details || '')
      }
    } catch (err: any) {
      console.error(err)
      setError('Falha de conexão com o servidor de download.')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Parse links, filter empty lines
    const lines = bulkUrls
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      
    if (lines.length === 0) return
    
    // Create queue
    const queueItems: QueueItem[] = lines.map((link, idx) => ({
      id: idx,
      url: link,
      status: 'pending'
    }))
    
    setBulkQueue(queueItems)
    setBulkProgress({ current: 0, total: queueItems.length })
    setBulkActive(true)
    setError(null)
    setStatus(null)
    setLogs('')
    
    // Process queue sequentially (one by one)
    for (let i = 0; i < queueItems.length; i++) {
      // Update item status in state to downloading
      setBulkQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'downloading' } : item))
      setBulkProgress(prev => ({ ...prev, current: i + 1 }))
      
      const currentUrl = queueItems[i].url
      
      try {
        const response = await fetch('/api/videos/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: currentUrl, browser })
        })
        
        const data = await response.json()
        
        if (data.success) {
          // Mark as completed
          setBulkQueue(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: 'completed',
            filename: data.filename || 'Sem nome',
            matchedRestaurant: data.dbCaption || 'Sem mapeamento'
          } : item))
          fetchLocalVideos() // Refresh list dynamically as we go
        } else {
          // Mark as failed
          setBulkQueue(prev => prev.map((item, idx) => idx === i ? {
            ...item,
            status: 'failed',
            error: data.error || 'Erro no processamento'
          } : item))
        }
      } catch (err: any) {
        console.error(err)
        // Mark as failed due to connection error
        setBulkQueue(prev => prev.map((item, idx) => idx === i ? {
          ...item,
          status: 'failed',
          error: 'Erro de rede ou conexão com o servidor'
        } : item))
      }
    }
    
    setBulkActive(false)
    setBulkUrls('') // Clear URL input
    setStatus('Download em massa finalizado! Verifique o status individual de cada link abaixo.')
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Tem certeza que deseja excluir o arquivo local "${filename}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/videos?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (data.success) {
        fetchLocalVideos() // Refresh list
      } else {
        alert(data.error || 'Erro ao excluir arquivo.')
      }
    } catch (err) {
      console.error(err)
      alert('Falha ao se comunicar com o servidor.')
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white font-serif tracking-wide flex items-center gap-3">
          <Download className="w-8 h-8 text-brand-gold" />
          Downloader de Reels do Instagram
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Insira o link ou uma lista de links de Reels do Instagram para salvá-los como MP4 localmente e associá-los ao restaurante automaticamente.
        </p>
      </div>

      {isVercel && (
        <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl flex items-start space-x-3 text-sm text-amber-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400 animate-pulse" />
          <div className="space-y-1">
            <span className="font-bold block text-white">⚠️ Executando no Servidor de Produção (Vercel)</span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              O Downloader de Reels é uma <strong>ferramenta administrativa local</strong>. Na nuvem do Vercel, o ambiente é <em>serverless</em> (sem o interpretador Python instalado por padrão) e o sistema de arquivos é **somente leitura** (read-only), o que impede salvar novos arquivos MP4 em <code>public/videos/</code>.
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Para baixar novos Reels e sincronizá-los, por favor, execute o projeto localmente e acesse: <a href="http://localhost:3000/admin/videos/downloader" className="text-brand-gold hover:underline font-semibold">http://localhost:3000/admin/videos/downloader</a>.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
            
            {/* Tabs header */}
            <div className="flex border-b border-zinc-900 bg-zinc-950/60">
              <button
                onClick={() => {
                  if (!bulkActive && !loading) setActiveTab('individual')
                }}
                disabled={loading || bulkActive}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'individual'
                    ? 'border-brand-gold text-brand-gold bg-zinc-900/10'
                    : 'border-transparent text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900/5'
                } disabled:opacity-50`}
              >
                <LinkIcon className="w-4 h-4" />
                Download Individual
              </button>
              
              <button
                onClick={() => {
                  if (!bulkActive && !loading) setActiveTab('bulk')
                }}
                disabled={loading || bulkActive}
                className={`flex-1 py-4 text-center text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'bulk'
                    ? 'border-brand-gold text-brand-gold bg-zinc-900/10'
                    : 'border-transparent text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900/5'
                } disabled:opacity-50`}
              >
                <ListOrdered className="w-4 h-4" />
                Download em Massa
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Common Parameter: Cookie authentication */}
              <div>
                <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-2">
                  Autenticação (Bypass de Cookies do Navegador)
                </label>
                <select
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  disabled={loading || bulkActive}
                  className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-brand-gold/45 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-0 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <option value="none">Sem cookies (Tentativa Anônima)</option>
                  <option value="chrome">Chrome (Recomendado se logado)</option>
                  <option value="firefox">Firefox</option>
                  <option value="edge">Microsoft Edge</option>
                  <option value="brave">Brave</option>
                  <option value="opera">Opera</option>
                  <option value="safari">Safari</option>
                </select>
                <p className="mt-2 text-[11px] text-zinc-500 leading-normal flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 text-zinc-450 mt-0.5" />
                  <span>
                    Se o download falhar por bloqueio do Instagram, selecione o navegador em que você está conectado à sua conta do Instagram neste computador.
                  </span>
                </p>
              </div>

              {/* Tab 1: Individual Downloader */}
              {activeTab === 'individual' && (
                <form onSubmit={handleDownload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-2">
                      URL do Post / Reel do Instagram
                    </label>
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.instagram.com/reel/C8_..."
                      disabled={loading}
                      className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-brand-gold/45 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-0 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand-gold hover:bg-brand-goldHover disabled:bg-zinc-800 text-black disabled:text-zinc-550 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-gold/5 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Processando e Baixando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-black" />
                        <span>Baixar para MP4</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Bulk Downloader */}
              {activeTab === 'bulk' && (
                <form onSubmit={handleBulkDownload} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-450 uppercase tracking-wider mb-2">
                      Lista de URLs do Instagram (um link por linha)
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                      placeholder="https://www.instagram.com/reel/C8_11111/&#10;https://www.instagram.com/reel/C8_22222/&#10;https://www.instagram.com/reel/C8_33333/"
                      disabled={bulkActive}
                      className="w-full bg-zinc-900/40 border border-zinc-900 focus:border-brand-gold/45 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-0 transition-colors font-mono leading-relaxed resize-y disabled:opacity-50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bulkActive || !bulkUrls.trim()}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-brand-gold hover:bg-brand-goldHover disabled:bg-zinc-800 text-black disabled:text-zinc-550 font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-gold/5 disabled:shadow-none"
                  >
                    {bulkActive ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Baixando Fila ({bulkProgress.current} de {bulkProgress.total})...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-black" />
                        <span>Iniciar Download em Massa</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Queue Progress panel (Bulk Download) */}
          {activeTab === 'bulk' && bulkQueue.length > 0 && (
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Progresso da Fila</h3>
                <span className="text-xs text-brand-gold font-semibold">
                  {bulkProgress.current} / {bulkProgress.total} processados
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold transition-all duration-500"
                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>

              {/* Queue table */}
              <div className="border border-zinc-900 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/20 text-zinc-450 font-semibold">
                      <th className="px-4 py-3">Link</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Arquivo / Mapeamento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50 text-zinc-300">
                    {bulkQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-900/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] truncate max-w-xs" title={item.url}>
                          {item.url}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                              Pendente
                            </span>
                          )}
                          {item.status === 'downloading' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/30 text-amber-400 border border-amber-900/30 gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Baixando
                            </span>
                          )}
                          {item.status === 'completed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/20 text-emerald-400 border border-emerald-900/20">
                              Concluído
                            </span>
                          )}
                          {item.status === 'failed' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/20 text-red-400 border border-red-900/20" title={item.error}>
                              Falhou
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'completed' && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono text-zinc-400 block">{item.filename}</span>
                              <span className="text-[10px] text-brand-gold italic block truncate max-w-[150px]">{item.matchedRestaurant}</span>
                            </div>
                          )}
                          {item.status === 'failed' && (
                            <span className="text-red-450 text-[10px] block truncate max-w-[180px]" title={item.error}>
                              {item.error}
                            </span>
                          )}
                          {item.status === 'pending' && <span className="text-zinc-600">-</span>}
                          {item.status === 'downloading' && <span className="text-zinc-500 animate-pulse">Consultando Instagram...</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status logs (Individual Download) */}
          {activeTab === 'individual' && (status || error || logs) && (
            <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Status & Console Logs</h3>
              
              {status && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-start space-x-3 text-sm text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <span className="font-semibold block">Sucesso</span>
                    <span className="text-zinc-350 text-xs">{status}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl flex items-start space-x-3 text-sm text-red-300">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <div>
                    <span className="font-semibold block">Erro</span>
                    <span className="text-zinc-350 text-xs">{error}</span>
                  </div>
                </div>
              )}

              {logs && (
                <div className="space-y-1">
                  <div className="text-[11px] text-zinc-500 uppercase font-semibold">Saída do Terminal:</div>
                  <pre className="bg-black/60 border border-zinc-900 rounded-xl p-4 text-[11px] text-zinc-400 font-mono overflow-x-auto max-h-60 overflow-y-auto leading-relaxed">
                    {logs}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* General Success feedback banner for bulk completions */}
          {activeTab === 'bulk' && status && !bulkActive && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-start space-x-3 text-sm text-emerald-300">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <span className="font-semibold block">Concluído</span>
                <span className="text-zinc-350 text-xs">{status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tips & Info */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-5 h-fit">
          <h3 className="font-serif font-bold text-white text-base">Instruções Importantes</h3>
          <div className="space-y-4 text-xs text-zinc-450 leading-relaxed">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <p>
                <strong>Download em Massa:</strong> Cole uma lista de URLs do Instagram, colocando <strong>uma URL por linha</strong>. O sistema processa um por um sequencialmente.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <p>
                <strong>Mapeamento Automático:</strong> Os vídeos baixados são automaticamente associados ao restaurante e influencer se o link original corresponder à legenda cadastrada.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <p>
                <strong>Tratamento de Erros:</strong> A fila de download é tolerante a falhas. Se um link falhar (ex: bloqueio do Instagram), o erro é registrado e o sistema avança para o próximo link.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0">4</span>
              <p>
                <strong>Uso de Cookies:</strong> Em caso de erro "Login Required", selecione a opção do navegador (ex: Chrome) onde você está logado no Instagram no PC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloader Section: Local Video List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-serif">Vídeos Salvos Localmente</h2>
            <p className="text-xs text-zinc-550">Lista de arquivos MP4 presentes em `public/videos/` e seus respectivos mapeamentos na base de dados.</p>
          </div>
          <button
            onClick={fetchLocalVideos}
            disabled={fetchingVideos}
            className="p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-450 hover:text-white rounded-xl transition-all disabled:opacity-50"
            title="Recarregar Lista"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingVideos ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {fetchingVideos ? (
          <div className="h-40 bg-zinc-950/25 border border-zinc-900/80 rounded-2xl flex items-center justify-center">
            <span className="text-zinc-500 text-xs animate-pulse">Carregando lista de arquivos locais...</span>
          </div>
        ) : videoError ? (
          <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-xl text-xs text-red-400">
            {videoError}
          </div>
        ) : localVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {localVideos.map((video) => (
              <div
                key={video.filename}
                className="bg-zinc-950/30 border border-zinc-900 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-zinc-800 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-brand-gold shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate" title={video.title}>
                        {video.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate" title={video.filename}>
                        {video.filename}
                      </p>
                    </div>
                  </div>

                  {/* Association feedback */}
                  <div className="p-3 bg-black/40 border border-zinc-900/50 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-550 uppercase tracking-wider font-semibold">
                      <span>Restaurante Vinculado</span>
                    </div>
                    {video.restauranteNome ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-200 block truncate">{video.restauranteNome}</span>
                        {video.influencerNome && (
                          <span className="text-[10px] text-brand-gold italic">por {video.influencerNome}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-650 italic">Nenhuma correspondência encontrada</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-900/70 pt-4 mt-4">
                  <button
                    onClick={() => setPreviewFile(video.filename)}
                    className="inline-flex items-center space-x-1.5 text-xs text-brand-gold hover:text-brand-goldHover font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Visualizar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(video.filename)}
                    className="p-2 bg-red-950/15 hover:bg-red-950/30 border border-red-900/20 hover:border-red-900/40 text-red-400 hover:text-red-350 rounded-lg transition-colors"
                    title="Excluir Arquivo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <Film className="w-8 h-8 text-zinc-650 mx-auto" />
            <p className="text-zinc-500 text-sm">Nenhum vídeo em MP4 salvo em `public/videos`.</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/80">
              <h3 className="font-bold text-sm text-white truncate max-w-xs">{previewFile}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-black flex items-center justify-center p-6 aspect-[9/16] max-h-[70vh]">
              <video
                src={`/videos/${previewFile}`}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
