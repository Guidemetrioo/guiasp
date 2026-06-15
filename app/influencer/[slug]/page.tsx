import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase-server'
import InfluencerProfileView from '@/components/InfluencerProfileView'
import { Heart } from 'lucide-react'
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

export const revalidate = 60 // Cache for 60 seconds

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServer()
  const { data: influencer } = await supabase
    .from('influencers')
    .select('nome, bio, instagram_handle')
    .eq('slug', params.slug)
    .single()

  if (!influencer) {
    return {
      title: "Influenciador Não Encontrado | GuiaSP",
    }
  }

  return {
    title: `${influencer.nome} (@${influencer.instagram_handle}) - Curadoria de Restaurantes | GuiaSP`,
    description: influencer.bio || `Confira todos os restaurantes indicados e recomendados por ${influencer.nome} no GuiaSP.`,
  }
}

export default async function InfluencerPage({ params }: PageProps) {
  const supabase = createServer()

  // 1. Fetch Influencer details
  const { data: influencer } = await supabase
    .from('influencers')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!influencer) {
    return notFound()
  }

  // 2. Fetch Partner Restaurant records (planos + restaurantes joined)
  // Since supabase-js supports nested json joins:
  const { data: activePlans } = await supabase
    .from('planos')
    .select(`
      id,
      restaurante_id,
      status,
      restaurantes (
        id,
        nome,
        slug,
        descricao,
        bairro,
        cidade,
        tipo_cozinha,
        preco_medio,
        instagram_handle,
        foto_capa_url
      )
    `)
    .eq('influencer_id', influencer.id)
    .eq('status', 'ativo')

  // 3. Fetch all videos of this influencer
  const { data: videos } = await supabase
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
      restaurante_id,
      restaurantes (
        nome,
        slug
      )
    `)
    .eq('influencer_id', influencer.id)
    .order('criado_em', { ascending: false })

  // Format videos for presentation
  const formattedVideos = (videos || []).map((v: any) => ({
    id: v.id,
    titulo: v.titulo,
    url_original: v.url_original,
    transcricao: v.transcricao,
    resumo: v.resumo,
    palavras_chave: v.palavras_chave,
    prato_destaque: v.prato_destaque,
    thumbnail_url: v.thumbnail_url,
    restaurante_id: v.restaurante_id,
    restaurante_nome: v.restaurantes?.nome || '',
    restaurante_slug: v.restaurantes?.slug || '',
  }))

  // Formulate the partners array
  const formattedPartners = (activePlans || [])
    .filter((plan: any) => plan.restaurantes !== null)
    .map((plan: any) => {
      const rest = plan.restaurantes
      const matchingVideo = formattedVideos.find((v: any) => v.restaurante_id === rest.id)
      return {
        restaurant: {
          id: rest.id,
          nome: rest.nome,
          slug: rest.slug,
          descricao: rest.descricao || '',
          bairro: rest.bairro || '',
          tipo_cozinha: rest.tipo_cozinha || '',
          preco_medio: rest.preco_medio || '$$',
          instagram_handle: rest.instagram_handle || '',
          foto_capa_url: rest.foto_capa_url || '',
        },
        video: matchingVideo,
      }
    })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
      {/* Header Navigation */}
      <header className="backdrop-blur-md bg-black/60 border-b border-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-white tracking-wide">
            Guia<span className="text-brand-gold">SP</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/busca"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Explorar
            </Link>
            <Link
              href="/busca?saved=true"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold/10" />
              <span className="hidden sm:inline">Salvos</span>
            </Link>
            <Link
              href="/admin"
              className="text-xs font-semibold px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-brand-gold border border-zinc-800 rounded-full transition-all"
            >
              Painel Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Header Hero Section (Instagram Style) */}
      {(() => {
        const followersMap: Record<string, string> = {
          'navegando-sp': '342 mil',
          'perambulando-em-sp': '189 mil',
          'garfo': '95 mil',
        }
        const followersCount = followersMap[influencer.slug] || `${(influencer.nome.length * 12) % 400 + 40} mil`

        return (
          <section className="relative w-full overflow-hidden border-b border-zinc-900/80 bg-gradient-to-b from-zinc-950 via-zinc-900/10 to-[#0A0A0A] pt-10 pb-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Desktop & Tablet Layout (md and up) */}
              <div className="hidden md:flex items-start space-x-12">
                {/* Avatar Column */}
                <div className="w-40 h-40 rounded-full border border-zinc-850 p-1 shrink-0 flex items-center justify-center bg-zinc-950/80 shadow-2xl">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {renderAvatar(influencer.foto_url, influencer.nome, "text-4xl")}
                  </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 space-y-5">
                  {/* Row 1: Username & Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-light text-zinc-150 font-sans tracking-wide">
                      @{influencer.instagram_handle}
                    </h2>
                    <a
                      href={`https://instagram.com/${influencer.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-semibold rounded-lg border border-zinc-800 hover:border-zinc-750 transition-all flex items-center space-x-2"
                    >
                      <InstagramIcon className="w-4 h-4 text-brand-gold" />
                      <span>Seguir</span>
                    </a>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      Parceiro Oficial
                    </span>
                  </div>

                  {/* Row 2: Stats */}
                  <div className="flex items-center space-x-10 text-sm text-zinc-400">
                    <div>
                      <span className="font-bold text-white text-base mr-1">{formattedVideos.length}</span>
                      publicações
                    </div>
                    <div>
                      <span className="font-bold text-white text-base mr-1">{followersCount}</span>
                      seguidores
                    </div>
                    <div>
                      <span className="font-bold text-white text-base mr-1">{formattedPartners.length}</span>
                      parceiros
                    </div>
                  </div>

                  {/* Row 3: Name, Niche & Bio */}
                  <div className="space-y-1">
                    <h1 className="text-xl font-bold font-sans text-white">{influencer.nome}</h1>
                    <p className="text-xs text-zinc-500 font-medium">Guia Gastronômico & Influenciador</p>
                    {influencer.bio && (
                      <p className="text-zinc-400 text-sm leading-relaxed max-w-xl font-sans pt-1">
                        {influencer.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Layout (less than md) */}
              <div className="md:hidden space-y-5">
                {/* Top row: Avatar & Stats */}
                <div className="flex items-center justify-between space-x-6">
                  {/* Avatar circular */}
                  <div className="w-24 h-24 rounded-full border border-zinc-850 p-0.5 shrink-0 flex items-center justify-center bg-zinc-950/80 shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      {renderAvatar(influencer.foto_url, influencer.nome, "text-2xl")}
                    </div>
                  </div>

                  {/* Stats right side */}
                  <div className="flex-1 flex justify-around text-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg">{formattedVideos.length}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">publicações</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg">{followersCount}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">seguidores</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-lg">{formattedPartners.length}</span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">parceiros</span>
                    </div>
                  </div>
                </div>

                {/* Middle row: Name & Bio */}
                <div className="space-y-1 px-1">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-bold font-sans text-white">{influencer.nome}</h1>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                      Oficial
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Guia Gastronômico & Influenciador</p>
                  <div className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center space-x-1.5 py-0.5">
                    <InstagramIcon className="w-3.5 h-3.5 text-brand-gold" />
                    <a
                      href={`https://instagram.com/${influencer.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold"
                    >
                      @{influencer.instagram_handle}
                    </a>
                  </div>
                  {influencer.bio && (
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xl font-sans pt-1">
                      {influencer.bio}
                    </p>
                  )}
                </div>

                {/* Bottom row: Action Button */}
                <div className="px-1 pt-1">
                  <a
                    href={`https://instagram.com/${influencer.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-sm font-semibold rounded-lg border border-zinc-800 hover:border-zinc-750 transition-all flex items-center justify-center space-x-2"
                  >
                    <InstagramIcon className="w-4 h-4 text-brand-gold" />
                    <span>Ver no Instagram</span>
                  </a>
                </div>
              </div>

            </div>
          </section>
        )
      })()}

      {/* Main Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfluencerProfileView
          influencer={{
            id: influencer.id,
            nome: influencer.nome,
            slug: influencer.slug,
            bio: influencer.bio || '',
            foto_url: influencer.foto_url || '',
            instagram_handle: influencer.instagram_handle || '',
          }}
          partners={formattedPartners}
          allVideos={formattedVideos}
        />
      </div>
    </div>
  )
}
