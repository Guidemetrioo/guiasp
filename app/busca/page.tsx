import React from 'react'
import Link from 'next/link'
import { createServer } from '@/lib/supabase-server'
import SearchFilters from '@/components/SearchFilters'
import SearchBar from '@/components/SearchBar'
import { Utensils, MapPin, Sparkles, AlertCircle } from 'lucide-react'

export const revalidate = 0 // Search is dynamic, do not cache

interface SearchPageProps {
  searchParams: {
    q?: string
    tipo?: string
    influencer?: string
    bairro?: string
    preco?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createServer()

  // Clean params
  const q = searchParams.q || ''
  const tipo = searchParams.tipo || null
  const influencer = searchParams.influencer || null
  const bairro = searchParams.bairro || null
  const preco = searchParams.preco || null

  // Fetch filter metadata in parallel
  const [
    { data: allInfluencers },
    { data: allRestaurantesBairros },
    { data: allRestaurantesCozinhas },
    { data: results, error: searchError }
  ] = await Promise.all([
    supabase.from('influencers').select('id, nome').order('nome'),
    supabase.from('restaurantes').select('bairro').eq('ativo', true),
    supabase.from('restaurantes').select('tipo_cozinha').eq('ativo', true),
    supabase.rpc('buscar_restaurantes', {
      p_q: q,
      p_tipo: tipo,
      p_influencer_id: influencer,
      p_bairro: bairro,
      p_preco: preco
    })
  ])

  // Log error if any
  if (searchError) {
    console.error('Database query error:', searchError.message)
  }

  // Extract unique filters
  const uniqueBairros = Array.from(
    new Set(allRestaurantesBairros?.map((r) => r.bairro).filter(Boolean))
  ).sort() as string[]

  const uniqueCozinhas = Array.from(
    new Set(allRestaurantesCozinhas?.map((r) => r.tipo_cozinha).filter(Boolean))
  ).sort() as string[]

  const influencersList = allInfluencers || []

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
      {/* Header */}
      <header className="backdrop-blur-md bg-black/60 border-b border-zinc-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-white tracking-wide">
            eat<span className="text-brand-gold">.</span>hub
          </Link>
          <Link
            href="/admin"
            className="text-xs font-semibold px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-brand-gold border border-zinc-800 rounded-full transition-all"
          >
            Painel Admin
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search Bar at the top */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-center">Explorar Restaurantes</h1>
          <SearchBar initialValue={q} />
        </div>

        {/* Layout: Sidebar filters + Grid results */}
        <div className="flex flex-col md:flex-row gap-8 pt-4">
          <SearchFilters
            influencers={influencersList}
            bairros={uniqueBairros}
            cozinhas={uniqueCozinhas}
          />

          {/* Results Grid */}
          <div className="flex-1">
            {results && results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {results.map((item: any, idx: number) => {
                  const displayImage = item.thumbnail_url || item.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="bg-zinc-900/40 border border-zinc-900 rounded-2xl overflow-hidden hover:border-brand-gold/30 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <Link href={`/restaurante/${item.slug}`} className="block overflow-hidden relative aspect-video">
                        <img
                          src={displayImage}
                          alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/70 border border-zinc-800 text-brand-gold backdrop-blur-sm">
                          {item.preco_medio}
                        </div>
                      </Link>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-xs text-zinc-400 capitalize">
                            <span className="font-semibold text-zinc-300">{item.tipo_cozinha}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1 text-zinc-500" />
                              {item.bairro}
                            </span>
                          </div>
                          
                          <Link href={`/restaurante/${item.slug}`} className="block">
                            <h2 className="text-xl font-bold font-serif text-white hover:text-brand-gold transition-colors">
                              {item.nome}
                            </h2>
                          </Link>

                          {item.prato_destaque && (
                            <p className="text-sm italic text-brand-gold flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                              Destaque: {item.prato_destaque}
                            </p>
                          )}
                        </div>

                        {/* Keyword pills */}
                        {item.palavras_chave && item.palavras_chave.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
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
                          <div className="border-t border-zinc-900 pt-3 mt-2 flex items-center justify-between">
                            <Link href={`/influencer/${item.influencer_slug}`} className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity">
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-800">
                                <img
                                  src={item.influencer_foto || '/placeholder-avatar.png'}
                                  alt={item.influencer_nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-xs text-zinc-400 font-medium">
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
                <AlertCircle className="w-12 h-12 text-zinc-650 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-zinc-200">Nenhum restaurante encontrado</h3>
                <p className="text-sm text-zinc-500">
                  Não encontramos nada para "{q || 'seus filtros'}". Tente buscar por termos mais genéricos como "hambúrguer" ou "japones".
                </p>
                <Link
                  href="/busca"
                  className="inline-block px-5 py-2 bg-brand-gold text-black font-semibold rounded-full text-xs hover:bg-brand-goldHover transition-colors mt-2"
                >
                  Limpar Todos os Filtros
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
