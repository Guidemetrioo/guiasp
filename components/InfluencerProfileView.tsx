'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Search, Compass } from 'lucide-react'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

interface Restaurant {
  id: string
  nome: string
  slug: string
  descricao: string
  bairro: string
  tipo_cozinha: string
  preco_medio: string
  instagram_handle: string
  foto_capa_url: string
}

interface Video {
  id: string
  titulo: string
  url_original: string
  transcricao: string
  resumo: string
  palavras_chave: string[]
  prato_destaque: string
  thumbnail_url: string
  restaurante_id: string
  restaurante_nome?: string
  restaurante_slug?: string
}

interface Influencer {
  id: string
  nome: string
  slug: string
  bio: string
  foto_url: string
  instagram_handle: string
}

interface InfluencerProfileViewProps {
  influencer: Influencer
  partners: {
    restaurant: Restaurant
    video?: Video
  }[]
  allVideos: Video[]
}

export default function InfluencerProfileView({
  influencer,
  partners,
  allVideos,
}: InfluencerProfileViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter partners based on search query (name, neighborhood, type of cuisine, or key tags)
  const filteredPartners = partners.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    
    const nameMatch = p.restaurant.nome.toLowerCase().includes(q)
    const neighborhoodMatch = p.restaurant.bairro.toLowerCase().includes(q)
    const cuisineMatch = p.restaurant.tipo_cozinha.toLowerCase().includes(q)
    const dishMatch = p.video?.prato_destaque?.toLowerCase().includes(q) || false
    const keywordMatch = p.video?.palavras_chave?.some(tag => tag.toLowerCase().includes(q)) || false

    return nameMatch || neighborhoodMatch || cuisineMatch || dishMatch || keywordMatch
  })

  // Filter all videos
  const filteredVideos = allVideos.filter((v) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true

    const titleMatch = v.titulo?.toLowerCase().includes(q) || false
    const dishMatch = v.prato_destaque?.toLowerCase().includes(q) || false
    const restaurantMatch = v.restaurante_nome?.toLowerCase().includes(q) || false
    const keywordMatch = v.palavras_chave?.some(tag => tag.toLowerCase().includes(q)) || false

    return titleMatch || dishMatch || restaurantMatch || keywordMatch
  })

  return (
    <div className="space-y-12">
      {/* Search Internal */}
      <div className="max-w-md mx-auto">
        <div className="relative flex items-center bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-brand-gold/60 transition-all px-3">
          <Search className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar nos restaurantes de ${influencer.nome}...`}
            className="w-full bg-transparent border-none outline-none py-3 text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Partner Restaurants */}
      <section className="space-y-6">
        <div className="border-b border-zinc-900 pb-4">
          <h2 className="text-2xl font-bold font-serif">Restaurantes Parceiros</h2>
          <p className="text-sm text-zinc-500">
            Estabelecimentos verificados vinculados ao perfil oficial de {influencer.nome}.
          </p>
        </div>

        {filteredPartners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPartners.map(({ restaurant, video }) => {
              const displayImage = restaurant.foto_capa_url || video?.thumbnail_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${restaurant.bairro} São Paulo`)}`
              const instagramUrl = `https://instagram.com/${restaurant.instagram_handle}`

              return (
                <div
                  key={restaurant.id}
                  className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-brand-gold/20 transition-all flex flex-col justify-between group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={displayImage}
                      alt={restaurant.nome}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-brand-gold text-black">
                      Parceiro
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold bg-black/70 border border-zinc-800 text-brand-gold backdrop-blur-sm">
                      {restaurant.preco_medio}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-zinc-400 capitalize">
                        <span className="font-semibold text-zinc-300">{restaurant.tipo_cozinha}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-zinc-500" />
                          {restaurant.bairro}
                        </span>
                      </div>

                      <Link href={`/restaurante/${restaurant.slug}`}>
                        <h3 className="text-xl font-bold font-serif text-white hover:text-brand-gold transition-colors">
                          {restaurant.nome}
                        </h3>
                      </Link>

                      {video?.prato_destaque && (
                        <p className="text-sm italic text-brand-gold flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          Destaque: {video.prato_destaque}
                        </p>
                      )}

                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 pt-1">
                        {restaurant.descricao || video?.resumo}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-900/60">
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 py-2 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold rounded-lg text-zinc-300 hover:text-white transition-colors"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center space-x-2 py-2 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold rounded-lg text-brand-gold border border-zinc-850 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Como chegar</span>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-zinc-500 text-sm text-center py-10 bg-zinc-950/20 border border-zinc-900 rounded-xl">
            Nenhum restaurante parceiro encontrado para a busca.
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section className="space-y-6">
        <div className="border-b border-zinc-900 pb-4">
          <h2 className="text-2xl font-bold font-serif">Todos os Vídeos</h2>
          <p className="text-sm text-zinc-500">
            Assista às avaliações e veja os pratos destaques recomendados por {influencer.nome}.
          </p>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => {
              const displayImage = video.thumbnail_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300&q=80'
              return (
                <Link
                  key={video.id}
                  href={`/restaurante/${video.restaurante_slug}`}
                  className="bg-zinc-900/20 border border-zinc-900 rounded-xl overflow-hidden hover:border-brand-gold/20 transition-all flex flex-col group"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={displayImage}
                      alt={video.titulo}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                        {video.restaurante_nome}
                      </h4>
                      <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug pt-1">
                        {video.titulo}
                      </h3>
                    </div>
                    {video.prato_destaque && (
                      <p className="text-xs italic text-zinc-400 pt-2 border-t border-zinc-900/60 truncate">
                        Destaque: {video.prato_destaque}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-zinc-500 text-sm text-center py-10 bg-zinc-950/20 border border-zinc-900 rounded-xl">
            Nenhum vídeo encontrado para a busca.
          </div>
        )}
      </section>
    </div>
  )
}
