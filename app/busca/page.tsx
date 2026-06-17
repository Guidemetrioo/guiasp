import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { createServer } from '@/lib/supabase-server'
import SearchFilters from '@/components/SearchFilters'
import SearchBar from '@/components/SearchBar'
import SearchResultsList from '@/components/SearchResultsList'
import { MapPin, Sparkles, AlertCircle, Clock, Heart } from 'lucide-react'
import { sortRestaurants, isRestaurantOpen, getLiveStatusMessage } from '@/lib/utils'
import seededContacts from '@/lib/restaurant-contacts-seeded.json'
import { promises as fs } from 'fs'
import path from 'path'

export const revalidate = 0 // Search is dynamic, do not cache

export const metadata: Metadata = {
  title: "Explorar Restaurantes | GuiaSP",
  description: "Busque e filtre os melhores restaurantes de São Paulo recomendados pelos maiores influenciadores de gastronomia.",
}

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
    { data: dbVideos },
    { data: results, error: searchError }
  ] = await Promise.all([
    supabase.from('influencers').select('id, nome').order('nome'),
    supabase.from('restaurantes').select('bairro').eq('ativo', true),
    supabase.from('restaurantes').select('tipo_cozinha').eq('ativo', true),
    supabase.from('videos').select('id, titulo, restaurante_id'),
    supabase.rpc('buscar_restaurantes', {
      p_q: q,
      p_tipo: tipo === 'video' ? null : tipo,
      p_influencer_id: influencer,
      p_bairro: bairro,
      p_preco: preco
    })
  ])

  // Log error if any
  if (searchError) {
    console.error('Database query error:', searchError.message)
  }

  // Read local video files to cross-reference
  const listPath = path.join(process.cwd(), 'lib', 'videos-list.json')
  let localVideosList: string[] = []
  try {
    const fileContent = await fs.readFile(listPath, 'utf-8')
    localVideosList = JSON.parse(fileContent)
  } catch (e) {
    console.error('Error reading videos-list.json:', e)
  }

  const sanitizeFilename = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const videoRestauranteIds: string[] = []
  localVideosList.forEach((filename: string) => {
    const baseName = filename.substring(0, filename.lastIndexOf('.'))
    const dbVideo = dbVideos?.find((v: any) => {
      if (!v.titulo) return false
      return sanitizeFilename(v.titulo) === baseName
    })
    if (dbVideo?.restaurante_id) {
      videoRestauranteIds.push(dbVideo.restaurante_id)
    }
  })

  // Extract unique filters
  const uniqueBairros = Array.from(
    new Set(allRestaurantesBairros?.map((r: any) => r.bairro).filter(Boolean))
  ).sort() as string[]

  const uniqueCozinhas = Array.from(
    new Set(allRestaurantesCozinhas?.map((r: any) => r.tipo_cozinha).filter(Boolean))
  ).sort() as string[]

  const influencersList = allInfluencers || []

  // Dynamic sorting: Open first, then closest distance
  const sortedResults = results
    ? sortRestaurants(results, (r: any) => {
        const contacts = (seededContacts as any)[r.slug]
        return {
          horario_abertura: r.horario_abertura,
          horario_fechamento: r.horario_fechamento,
          distancia_km: r.distancia_km ? Number(r.distancia_km) : null,
          horarios_semana: contacts?.horarios_semana,
          descricao: r.descricao,
          thumbnail_url: r.thumbnail_url,
        }
      })
    : []

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 premium-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-serif text-white tracking-wide">
            Guia<span className="text-brand-gold">SP</span>
          </Link>
          <div className="flex items-center space-x-4">
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
            <SearchResultsList 
              initialResults={sortedResults} 
              videoRestauranteIds={videoRestauranteIds}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
