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
      <section className="relative min-h-[520px] flex flex-col items-center justify-center pt-28 pb-24 px-4 text-center border-b border-zinc-900 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.png"
            alt="Fundo Gastronômico Premium"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125"
          />
          {/* Subtle gradient overlay to blend with dark page background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0A0A0A]/80 to-[#0A0A0A]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 text-brand-gold">
              ✨ O guia dos seus criadores favoritos
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight text-white max-w-4xl mx-auto leading-tight drop-shadow-md">
              Achou no vídeo. <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-amber-300">
                Agora acha aqui.
              </span>
            </h1>
            <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto font-sans leading-relaxed drop-shadow">
              Busque qualquer restaurante que você viu com os seus influencers favoritos,
              pesquisando diretamente pelo que foi falado no vídeo.
            </p>
          </div>

          {/* Search Component */}
          <div className="relative pt-4 max-w-2xl mx-auto w-full">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Influencers Scroll Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-serif">Curado por quem você já segue</h2>
            <p className="text-xs sm:text-sm text-zinc-500">Restaurantes indicados pelos principais críticos de gastronomia.</p>
          </div>
        </div>

        <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent -mx-4 px-4 sm:-mx-6 sm:px-6">
          {influencers && influencers.length > 0 ? (
            influencers.map((inf) => (
              <Link
                key={inf.id}
                href={`/influencer/${inf.slug}`}
                className="group flex-shrink-0 w-36 text-center space-y-3 transition-transform hover:-translate-y-1"
              >
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-brand-gold transition-all shadow-lg flex items-center justify-center">
                  {renderAvatar(inf.foto_url, inf.nome, "text-3xl")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white truncate">
                    {inf.nome}
                  </h3>
                  <p className="text-xs text-brand-gold font-sans truncate">
                    @{inf.instagram_handle}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-zinc-500 text-sm py-4">Nenhum influencer cadastrado no momento.</div>
          )}
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
