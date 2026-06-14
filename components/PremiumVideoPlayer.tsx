'use client'

import React, { useState, useEffect } from 'react'
import { Film, Clock } from 'lucide-react'

interface PremiumVideoPlayerProps {
  src: string
  poster?: string
  restaurantName: string
}

export default function PremiumVideoPlayer({ src, poster, restaurantName }: PremiumVideoPlayerProps) {
  const [videoExists, setVideoExists] = useState<boolean>(false)
  const [checking, setChecking] = useState<boolean>(true)

  useEffect(() => {
    let active = true

    async function checkVideo() {
      try {
        const response = await fetch(src, { method: 'HEAD' })
        if (active) {
          setVideoExists(response.ok)
        }
      } catch (err) {
        if (active) {
          setVideoExists(false)
        }
      } finally {
        if (active) {
          setChecking(false)
        }
      }
    }

    checkVideo()

    return () => {
      active = false
    }
  }, [src])

  if (checking) {
    return (
      <div className="w-full aspect-[9/16] h-[480px] bg-zinc-950 animate-pulse rounded-2xl flex flex-col items-center justify-center border border-zinc-900 shadow-2xl">
        <Film className="w-8 h-8 text-brand-gold/40 animate-spin" />
        <span className="text-zinc-500 text-xs mt-3">Verificando vídeo...</span>
      </div>
    )
  }

  if (!videoExists) {
    return (
      <div className="w-full aspect-[9/16] h-[480px] bg-gradient-to-b from-zinc-900/60 to-zinc-950 rounded-2xl flex flex-col items-center justify-center border border-dashed border-brand-gold/20 p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-zinc-950/80 flex items-center justify-center border border-brand-gold/15 text-brand-gold shadow-lg animate-pulse">
          <Clock className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h5 className="font-serif font-bold text-white text-base tracking-wide">Vídeo em Breve</h5>
          <p className="text-zinc-400 text-xs max-w-[200px] leading-relaxed mx-auto">
            O review de **{restaurantName}** está em preparação e estará disponível em breve.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-brand-gold/40 font-semibold px-2.5 py-0.5 rounded-full bg-brand-gold/5 border border-brand-gold/10">
          Aguardando Upload
        </span>
      </div>
    )
  }

  return (
    <video
      src={src}
      poster={poster}
      controls
      playsInline
      className="w-full aspect-[9/16] object-cover h-[480px] rounded-2xl shadow-2xl hover:brightness-110 transition-all duration-300"
    />
  )
}
