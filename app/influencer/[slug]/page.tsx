import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase-server'
import InfluencerProfileView from '@/components/InfluencerProfileView'
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
      const matchingVideo = formattedVideos.find((v) => v.restaurante_id === rest.id)
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
              href="/admin"
              className="text-xs font-semibold px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-brand-gold border border-zinc-800 rounded-full transition-all"
            >
              Painel Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Header Hero Section */}
      <section className="relative h-[320px] w-full overflow-hidden flex items-end">
        {/* Banner image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-zinc-900 to-[#1e1910] opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent"></div>
        </div>

        {/* Header Profile Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 z-10 flex flex-col md:flex-row items-center md:items-end md:space-x-6 space-y-4 md:space-y-0 text-center md:text-left">
          <div className="w-28 h-28 rounded-full border-4 border-zinc-900 overflow-hidden shadow-2xl shrink-0 flex items-center justify-center">
            {renderAvatar(influencer.foto_url, influencer.nome, "text-3xl")}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-col md:flex-row items-center md:space-x-3 space-y-2 md:space-y-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">{influencer.nome}</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-gold text-black">
                Parceiro Oficial GuiaSP
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start space-x-2 text-zinc-400 hover:text-white transition-colors">
              <InstagramIcon className="w-4 h-4 text-brand-gold" />
              <a
                href={`https://instagram.com/${influencer.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold"
              >
                @{influencer.instagram_handle}
              </a>
            </div>

            {influencer.bio && (
              <p className="text-zinc-400 text-sm max-w-xl leading-relaxed mx-auto md:mx-0">
                {influencer.bio}
              </p>
            )}
          </div>
        </div>
      </section>

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
