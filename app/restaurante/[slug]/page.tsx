import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase-server'
import { MapPin, Utensils, Compass, Sparkles, Quote, ChevronRight } from 'lucide-react'

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

export const revalidate = 60 // Cache for 60 seconds

interface PageProps {
  params: {
    slug: string
  }
}

export default async function RestaurantePage({ params }: PageProps) {
  const supabase = createServer()

  // 1. Fetch restaurante
  const { data: restaurant } = await supabase
    .from('restaurantes')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!restaurant) {
    return notFound()
  }

  // 2. Fetch associated video and influencer details
  const { data: videoData } = await supabase
    .from('videos')
    .select(`
      id,
      titulo,
      url_original,
      transcricao,
      resumo,
      palavras_chave,
      prato_destaque,
      thumbnail_url,
      influencer_id,
      influencers (
        id,
        nome,
        slug,
        foto_url,
        instagram_handle
      )
    `)
    .eq('restaurante_id', restaurant.id)
    .limit(1)
    .maybeSingle()

  const video = videoData as any
  const influencer = video?.influencers

  // 3. Fetch other recommendations by the same influencer ("Mais de [Influencer]")
  let otherRecommendations: any[] = []
  if (influencer) {
    const { data: plans } = await supabase
      .from('planos')
      .select(`
        restaurantes (
          id,
          nome,
          slug,
          bairro,
          tipo_cozinha,
          preco_medio,
          foto_capa_url
        )
      `)
      .eq('influencer_id', influencer.id)
      .eq('status', 'ativo')
      .neq('restaurante_id', restaurant.id)
      .limit(6)

    if (plans) {
      otherRecommendations = plans
        .map((p: any) => p.restaurantes)
        .filter((r) => r !== null)
    }
  }

  const heroImage = video?.thumbnail_url || restaurant.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=600&q=80'
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${restaurant.bairro} São Paulo`)}`
  const instagramUrl = `https://instagram.com/${restaurant.instagram_handle}`

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
      {/* Header */}
      <header className="backdrop-blur-md bg-black/60 border-b border-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-white tracking-wide">
            eat<span className="text-brand-gold">.</span>hub
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/busca"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Explorar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Cover section */}
      <section className="relative h-[400px] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt={restaurant.nome}
            className="w-full h-full object-cover brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/20 to-black/30"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10 z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-gold text-black">
              {restaurant.preco_medio}
            </span>
            <span className="text-sm text-zinc-300 font-semibold uppercase tracking-wider capitalize">
              {restaurant.tipo_cozinha}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-sm text-zinc-300 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-zinc-400" />
              {restaurant.bairro}, {restaurant.cidade}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-white leading-tight">
            {restaurant.nome}
          </h1>
        </div>
      </section>

      {/* Profile & Main Content Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Indication section */}
        {influencer ? (
          <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
              <Link href={`/influencer/${influencer.slug}`} className="flex items-center space-x-3 group">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-brand-gold transition-colors">
                  <img
                    src={influencer.foto_url || '/placeholder-avatar.png'}
                    alt={influencer.nome}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-zinc-400 text-xs font-medium">Recomendação curada por</h3>
                  <h2 className="text-base font-bold text-white group-hover:text-brand-gold transition-colors font-serif">
                    {influencer.nome}
                  </h2>
                </div>
              </Link>

              {influencer.instagram_handle && (
                <a
                  href={`https://instagram.com/${influencer.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-brand-gold" />
                  <span>@{influencer.instagram_handle}</span>
                </a>
              )}
            </div>

            {/* Dish spotlight */}
            {video?.prato_destaque && (
              <div className="space-y-1.5">
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Prato Indicado</h4>
                <p className="text-2xl font-bold font-serif text-brand-gold flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {video.prato_destaque}
                </p>
              </div>
            )}

            {/* Quote of transcript */}
            {video?.transcricao && (
              <div className="relative pl-6 py-1 border-l-2 border-brand-gold space-y-2">
                <Quote className="absolute -left-1 -top-3 w-8 h-8 text-brand-gold/10 pointer-events-none rotate-180" />
                <p className="text-zinc-300 italic text-base leading-relaxed">
                  "{video.transcricao}"
                </p>
              </div>
            )}

            {/* Additional details */}
            {restaurant.descricao && (
              <div className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-900 pt-5 space-y-2">
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Sobre</h4>
                <p>{restaurant.descricao}</p>
              </div>
            )}
          </section>
        ) : (
          <section className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 text-center space-y-4">
            <h3 className="font-serif font-bold text-lg text-zinc-300">Sobre o Restaurante</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto">
              {restaurant.descricao || 'Nenhuma descrição detalhada disponível.'}
            </p>
          </section>
        )}

        {/* Action Buttons */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
          >
            <InstagramIcon className="w-4 h-4 text-zinc-400" />
            <span>Ver no Instagram</span>
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 py-3 bg-brand-gold hover:bg-brand-goldHover rounded-xl text-sm font-semibold text-black transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Como chegar</span>
          </a>
        </section>

        {/* Tags Section */}
        {video?.palavras_chave && video.palavras_chave.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-zinc-900">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Palavras-chave</h4>
            <div className="flex flex-wrap gap-2">
              {video.palavras_chave.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/busca?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-850 text-xs text-zinc-400 hover:text-white hover:border-brand-gold/40 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Carousel of same influencer items */}
        {influencer && otherRecommendations.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-zinc-900">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif">Mais indicações de {influencer.nome}</h3>
              <p className="text-xs text-zinc-500">Conheça outros restaurantes avaliados por este parceiro.</p>
            </div>

            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-thin">
              {otherRecommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/restaurante/${item.slug}`}
                  className="group flex-shrink-0 w-60 bg-zinc-900/30 border border-zinc-900 rounded-xl overflow-hidden hover:border-brand-gold/20 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={item.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&h=200&q=80'}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 capitalize">
                      <span>{item.tipo_cozinha}</span>
                      <span>{item.bairro}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-brand-gold transition-colors font-serif truncate">
                      {item.nome}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
