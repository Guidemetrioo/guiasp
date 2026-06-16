'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MapPin, Sparkles, Clock, Heart } from 'lucide-react'
import { getLiveStatusMessage, isCadastroPronto } from '@/lib/utils'
import seededContacts from '@/lib/restaurant-contacts-seeded.json'

const isRealPhoto = (url: string | null | undefined) => {
  if (!url) return false;
  if (url.includes('unsplash.com')) return false;
  if (url.includes('placeholder-avatar.png')) return false;
  return true;
};

const getInitials = (name: string) => {
  if (!name) return "";
  const parts = name.split(" ").filter(p => p);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const renderAvatar = (url: string | null | undefined, name: string, sizeTextClass = "text-xl") => {
  if (url && isRealPhoto(url)) {
    return (
      <img
        src={url}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }
  const initials = getInitials(name);
  return (
    <div className={`w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center font-serif text-brand-gold border border-brand-gold/30 font-bold ${sizeTextClass} uppercase`}>
      {initials}
    </div>
  );
};

interface SearchResultsListProps {
  initialResults: any[]
}

export default function SearchResultsList({ initialResults }: SearchResultsListProps) {
  const searchParams = useSearchParams()
  const savedParam = searchParams ? searchParams.get('saved') === 'true' : false

  const [savedSlugs, setSavedSlugs] = useState<string[]>([])
  const [showOnlySaved, setShowOnlySaved] = useState(false)
  const [downloadedRestIds, setDownloadedRestIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem('guiasp-favoritos')
    setSavedSlugs(saved ? JSON.parse(saved) : [])
  }, [])

  useEffect(() => {
    async function fetchDownloadedVideos() {
      try {
        const res = await fetch('/api/videos')
        const data = await res.json()
        if (data.success && data.videos) {
          const ids = new Set<string>()
          data.videos.forEach((v: any) => {
            if (v.restauranteId) {
              ids.add(v.restauranteId)
            }
          })
          setDownloadedRestIds(ids)
        }
      } catch (err) {
        console.error('Error fetching downloaded videos:', err)
      }
    }
    fetchDownloadedVideos()
  }, [])

  useEffect(() => {
    if (savedParam) {
      setShowOnlySaved(true)
    }
  }, [savedParam])

  const handleToggleFavorite = (slug: string) => {
    const saved = localStorage.getItem('guiasp-favoritos')
    let favs = saved ? JSON.parse(saved) : []
    if (favs.includes(slug)) {
      favs = favs.filter((s: string) => s !== slug)
    } else {
      favs.push(slug)
    }
    localStorage.setItem('guiasp-favoritos', JSON.stringify(favs))
    setSavedSlugs(favs)
  }

  // Filter results
  const filteredResults = initialResults.filter(item => {
    if (showOnlySaved && !savedSlugs.includes(item.slug)) {
      return false
    }
    return true
  })

  // Sort: downloaded videos first
  const sortedResults = React.useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      const hasVideoA = downloadedRestIds.has(a.id) ? 1 : 0
      const hasVideoB = downloadedRestIds.has(b.id) ? 1 : 0
      if (hasVideoA !== hasVideoB) return hasVideoB - hasVideoA
      return 0 // Keep original order
    })
  }, [filteredResults, downloadedRestIds])

  return (
    <div className="space-y-6">
      {/* List Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/80 pb-4">
        <div>
          <span className="text-xs font-semibold text-zinc-550 uppercase tracking-wider">
            Resultados da busca
          </span>
          <p className="text-xs text-zinc-400 mt-0.5">
            Encontramos {filteredResults.length} {filteredResults.length === 1 ? 'estabelecimento' : 'estabelecimentos'}
          </p>
        </div>

        <button
          onClick={() => setShowOnlySaved(!showOnlySaved)}
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1.5 shrink-0 select-none ${
            showOnlySaved
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-sm shadow-brand-gold/5'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showOnlySaved ? 'fill-current' : ''}`} />
          <span>{showOnlySaved ? 'Mostrando Salvos' : 'Filtrar Salvos'}</span>
        </button>
      </div>

      {sortedResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fadeIn">
          {sortedResults.map((item: any, idx: number) => {
            const contacts = (seededContacts as any)[item.slug]
            const status = getLiveStatusMessage(item.horario_abertura, item.horario_fechamento, contacts?.horarios_semana)
            const isOpen = status.isOpen
            const statusMessage = status.message
            const displayImage = item.thumbnail_url || item.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'
            const isReady = isCadastroPronto({
              horario_abertura: item.horario_abertura,
              horario_fechamento: item.horario_fechamento,
              descricao: item.descricao,
              thumbnail_url: item.thumbnail_url
            })
            const isSaved = savedSlugs.includes(item.slug)
            const hasVideo = downloadedRestIds.has(item.id)

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`bg-zinc-900/40 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                  hasVideo
                    ? 'border-brand-gold/45 shadow-lg shadow-brand-gold/[0.04] bg-gradient-to-b from-zinc-900/40 to-zinc-950/20 ring-1 ring-brand-gold/15 hover:border-brand-gold hover:shadow-brand-gold/15'
                    : isReady
                    ? 'border-brand-gold/30 shadow-md shadow-brand-gold/[0.03] hover:border-brand-gold hover:shadow-brand-gold/15'
                    : isOpen
                    ? 'border-zinc-900 hover:border-brand-gold/30 hover:shadow-xl'
                    : 'border-zinc-950/80 opacity-75 hover:shadow-xl'
                }`}
              >
                <Link href={`/restaurante/${item.slug}`} className="block overflow-hidden relative aspect-video">
                  <img
                    src={displayImage}
                    alt={item.nome}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !isOpen ? 'grayscale opacity-40' : ''
                    }`}
                    loading="lazy"
                  />
                  {/* Closed overlay sign */}
                  {!isOpen && (
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-950/95 text-zinc-400 border border-zinc-800 shadow-2xl">
                        Fechado
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 border border-zinc-800/40 text-brand-gold backdrop-blur-sm select-none">
                      {item.preco_medio}
                    </span>
                    {hasVideo && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md flex items-center gap-1.5 select-none animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        🎥 Vídeo
                      </span>
                    )}
                    {isReady && !hasVideo && (
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-brand-gold via-amber-500 to-amber-300 text-black shadow-md flex items-center gap-0.5 select-none animate-pulse">
                        ✨ Destaque
                      </span>
                    )}
                  </div>
                  
                  {/* Heart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleToggleFavorite(item.slug)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 border border-zinc-800/40 text-zinc-400 hover:text-white transition-all scale-95 z-20"
                    title={isSaved ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'text-brand-gold fill-current' : ''}`} />
                  </button>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-405 capitalize">
                      <span className="font-semibold text-zinc-300">{item.tipo_cozinha}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-500" />
                        {item.bairro}
                      </span>
                      {item.distancia_km !== undefined && item.distancia_km !== null && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-300 font-medium">
                            {typeof item.distancia_km === 'number'
                              ? item.distancia_km.toFixed(1)
                              : Number(item.distancia_km).toFixed(1)
                            } km
                          </span>
                        </>
                      )}
                    </div>
                    
                    <Link href={`/restaurante/${item.slug}`} className="block">
                      <h2 className={`text-xl font-bold font-serif hover:text-brand-gold transition-colors truncate ${
                        isOpen ? 'text-white' : 'text-zinc-350'
                      }`}>
                        {item.nome}
                      </h2>
                    </Link>

                    {/* Operating Status Block */}
                    <div className="flex items-center space-x-1.5 text-xs pt-0.5">
                      <Clock className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-500' : 'text-zinc-550'}`} />
                      <span className={`${isOpen ? 'text-emerald-500' : 'text-zinc-400'} font-medium`}>
                        {statusMessage}
                      </span>
                    </div>

                    {item.prato_destaque && (
                      <p className="text-sm italic text-brand-gold flex items-center pt-1">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                        Destaque: {item.prato_destaque}
                      </p>
                    )}
                  </div>

                  {/* Keyword pills */}
                  {item.palavras_chave && item.palavras_chave.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.palavras_chave.slice(0, 3).map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/busca?q=${encodeURIComponent(tag)}`}
                          className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850 text-[10px] text-zinc-400 hover:text-white hover:border-brand-gold/40 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Influencer tag bottom */}
                  {item.influencer_nome && (
                    <div className="border-t border-zinc-900/60 pt-3 mt-2 flex items-center justify-between">
                      <Link href={`/influencer/${item.influencer_slug}`} className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-800">
                          {renderAvatar(item.influencer_foto, item.influencer_nome, "text-[9px]")}
                        </div>
                        <span className="text-xs text-zinc-450 font-medium font-sans">
                          Indicado por <span className="text-zinc-200 font-semibold">{item.influencer_nome}</span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <Heart className="w-12 h-12 text-zinc-650 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-zinc-200">
            {showOnlySaved ? 'Nenhum favorito salvo' : 'Nenhum restaurante encontrado'}
          </h3>
          <p className="text-sm text-zinc-500">
            {showOnlySaved 
              ? 'Você ainda não salvou nenhum restaurante. Clique no coração para adicionar aos favoritos!'
              : 'Não encontramos nada para seus filtros.'
            }
          </p>
          {showOnlySaved ? (
            <button
              onClick={() => setShowOnlySaved(false)}
              className="inline-block px-5 py-2 bg-brand-gold text-black font-semibold rounded-full text-xs hover:bg-brand-goldHover transition-colors mt-2"
            >
              Mostrar Todos os Restaurantes
            </button>
          ) : (
            <Link
              href="/busca"
              className="inline-block px-5 py-2 bg-brand-gold text-black font-semibold rounded-full text-xs hover:bg-brand-goldHover transition-colors mt-2"
            >
              Limpar Filtros
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
