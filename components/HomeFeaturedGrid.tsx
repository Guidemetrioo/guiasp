'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Clock, Film } from 'lucide-react'
import { getLiveStatusMessage } from '@/lib/utils'
import seededContacts from '@/lib/restaurant-contacts-seeded.json'

interface HomeFeaturedGridProps {
  restaurants: any[]
}

export default function HomeFeaturedGrid({ restaurants }: HomeFeaturedGridProps) {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, { isOpen: boolean; message: string }>>({})

  // Compute status on the client side to match local timezone/time
  useEffect(() => {
    const updateStatuses = () => {
      const newStatuses: Record<string, { isOpen: boolean; message: string }> = {}
      restaurants.forEach((item) => {
        const contacts = (seededContacts as any)[item.slug]
        const status = getLiveStatusMessage(
          item.horario_abertura,
          item.horario_fechamento,
          contacts?.horarios_semana
        )
        newStatuses[item.id] = status
      })
      setStatusMap(newStatuses)
    }

    updateStatuses()
    const interval = setInterval(updateStatuses, 10000)
    return () => clearInterval(interval)
  }, [restaurants])

  if (!restaurants || restaurants.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((item) => {
          const status = statusMap[item.id] || { isOpen: false, message: 'Fechado' }
          const isOpen = status.isOpen
          const statusMessage = status.message
          
          const hasVideo = !!item.videoFile
          const videoFile = item.videoFile
          
          const displayImage = videoFile?.thumbnailUrl || item.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredCardId(item.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              className={`bg-zinc-900/30 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group h-full ${
                hasVideo
                  ? 'border-brand-gold/40 shadow-lg shadow-brand-gold/[0.04] bg-gradient-to-b from-zinc-900/40 to-zinc-950/20 ring-1 ring-brand-gold/15 hover:border-brand-gold hover:shadow-brand-gold/15'
                  : 'border-zinc-900 hover:border-zinc-800 hover:shadow-xl'
              }`}
            >
              <Link href={`/restaurante/${item.slug}`} className="block overflow-hidden relative aspect-video shrink-0 bg-zinc-950">
                {hasVideo && videoFile && hoveredCardId === item.id ? (
                  <video
                    src={`/videos/${videoFile.filename}`}
                    poster={displayImage}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !isOpen ? 'grayscale opacity-40' : ''
                    }`}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img
                    src={displayImage}
                    alt={item.nome}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                      !isOpen ? 'grayscale opacity-40' : ''
                    }`}
                    loading="lazy"
                  />
                )}
                
                {/* Closed overlay sign */}
                {!isOpen && (
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                    <span className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-zinc-950/95 text-zinc-400 border border-zinc-800 shadow-2xl">
                      Fechado
                    </span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/75 border border-zinc-800/40 text-brand-gold backdrop-blur-sm select-none">
                    {item.preco_medio}
                  </span>
                  {hasVideo && (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md flex items-center gap-1.5 select-none animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      🎥 Vídeo
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 capitalize">
                    <span className="font-semibold text-zinc-300">{item.tipo_cozinha}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-550" />
                      {item.bairro}
                    </span>
                  </div>
                  
                  <Link href={`/restaurante/${item.slug}`} className="block">
                    <h2 className={`text-lg font-bold font-serif hover:text-brand-gold transition-colors truncate ${
                      isOpen ? 'text-white' : 'text-zinc-350'
                    }`}>
                      {item.nome}
                    </h2>
                  </Link>

                  {/* Operating Status Block */}
                  <div className="flex items-center space-x-1.5 text-xs pt-0.5">
                    <Clock className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-500' : 'text-zinc-650'}`} />
                    <span className={`${isOpen ? 'text-emerald-500' : 'text-zinc-400'} font-medium`}>
                      {statusMessage}
                    </span>
                  </div>

                  {item.prato_destaque && (
                    <p className="text-sm italic text-brand-gold flex items-center pt-1 line-clamp-1">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      Indicação: {item.prato_destaque}
                    </p>
                  )}
                </div>

                {/* Influencer Badge if present */}
                {item.influencer && (
                  <div className="border-t border-zinc-900/60 pt-3 mt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-800 shrink-0 bg-zinc-950">
                        {item.influencer.foto_url ? (
                          <img src={item.influencer.foto_url} alt={item.influencer.nome} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[8px] text-brand-gold uppercase bg-zinc-900">
                            {item.influencer.nome.substring(0, 2)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 font-medium">
                        Por <span className="text-zinc-350 font-semibold">{item.influencer.nome}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
