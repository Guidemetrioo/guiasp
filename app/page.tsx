import React from 'react'
import Link from 'next/link'
import { createServer } from '@/lib/supabase-server'
import SearchBar from '@/components/SearchBar'
import { Film, Compass, MapPin } from 'lucide-react'

export const revalidate = 60 // Cache for 60 seconds

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

export default async function Home() {
  const supabase = createServer()

  // Fetch influencers
  const { data: influencers } = await supabase
    .from('influencers')
    .select('*')
    .order('nome')

  const categories = [
    { label: 'Hambúrguer', query: 'hamburguer' },
    { label: 'Japonês', query: 'japones' },
    { label: 'Italiano', query: 'italiano' },
    { label: 'Mexicano', query: 'mexicano' },
    { label: 'Brunch', query: 'brunch' },
    { label: 'Frutos do Mar', query: 'frutos do mar' },
    { label: 'Pizza', query: 'pizza' },
    { label: 'Vegano', query: 'vegano' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-white tracking-wide">
            Guia<span className="text-brand-gold">SP</span>
          </Link>
          <div className="flex items-center space-x-6">
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

      {/* Hero Section with food background photo */}
      <section className="relative min-h-[600px] flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center border-b border-zinc-900 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Fundo Gastronômico Premium"
            className="w-full h-full object-cover object-center opacity-15 filter brightness-50 contrast-125"
          />
          {/* Subtle gradient overlay to blend with dark page background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#0A0A0A]/90 to-[#0A0A0A]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center space-y-10 w-full">
          {/* 1. Perfil dos influenciadores */}
          <div className="space-y-4 w-full">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-950/80 backdrop-blur-sm border border-zinc-850 text-brand-gold animate-pulse">
              ✨ Selecione um criador para ver suas dicas
            </span>
            
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-2">
              {influencers && influencers.map((inf: any) => (
                <Link
                  key={inf.id}
                  href={`/influencer/${inf.slug}`}
                  className="group flex flex-col items-center space-y-2.5 transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden p-[3px] bg-gradient-to-tr from-brand-gold via-amber-500 to-amber-300 shadow-xl group-hover:shadow-brand-gold/15 transition-all">
                    <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                        {renderAvatar(inf.foto_url, inf.nome, "text-2xl")}
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-brand-gold transition-colors font-serif leading-tight">
                      {inf.nome}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-sans group-hover:text-zinc-400 transition-colors leading-none pt-0.5">
                      @{inf.instagram_handle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Aba de pesquisa */}
          <div className="w-full max-w-2xl pt-2">
            <SearchBar />
          </div>

          {/* 3. Texto */}
          <div className="space-y-4 max-w-3xl pt-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight text-white leading-tight drop-shadow-md">
              Achou no vídeo. <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-amber-300">
                Agora acha aqui.
              </span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-sans leading-relaxed drop-shadow">
              Busque qualquer restaurante ou prato que você viu nos stories, reels e posts de gastronomia,
              pesquisando diretamente pelo que foi falado ou indicado nos vídeos.
            </p>
          </div>
        </div>
      </section>

      {/* Cuisine Pills Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold font-serif">Navegue por Categoria</h2>
          <p className="text-xs sm:text-sm text-zinc-500">Explore culinárias específicas rapidamente.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.query}
              href={`/busca?tipo=${encodeURIComponent(cat.query)}`}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-black hover:bg-brand-gold hover:border-brand-gold transition-all duration-200"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-900 rounded-3xl p-8 md:p-12 space-y-10 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">Como funciona o GuiaSP?</h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Transformamos vídeos perdidos em dados pesquisáveis em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-brand-gold">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg">1. Viu no vídeo</h3>
              <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                Você vê a recomendação de um restaurante no story ou feed do influencer que confia.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-brand-gold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg">2. Busca aqui</h3>
              <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                Digita qualquer prato, ingrediente ou comentário falado no vídeo e encontra na hora.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-brand-gold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg">3. Vai ao restaurante</h3>
              <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
                Acessa a localização, o vídeo original e reservas com um clique para aproveitar.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
