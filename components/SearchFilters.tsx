'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'

interface InfluencerFilterItem {
  id: string
  nome: string
}

interface SearchFiltersProps {
  influencers: InfluencerFilterItem[]
  bairros: string[]
  cozinhas: string[]
}

export default function SearchFilters({ influencers, bairros, cozinhas }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Current values from URL
  const currentTipo = searchParams.get('tipo') || ''
  const currentInfluencer = searchParams.get('influencer') || ''
  const currentBairro = searchParams.get('bairro') || ''
  const currentPreco = searchParams.get('preco') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/busca?${params.toString()}`)
  }

  const clearAll = () => {
    router.push('/busca')
  }

  const RenderFilters = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-gold">Filtros</h3>
        <button
          onClick={clearAll}
          className="text-xs text-zinc-400 hover:text-white transition-colors"
        >
          Limpar tudo
        </button>
      </div>

      {/* Influencer Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-200">Influencer</h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
          <label className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="influencer"
              checked={!currentInfluencer}
              onChange={() => updateFilter('influencer', '')}
              className="accent-brand-gold bg-zinc-900 border-zinc-800"
            />
            <span>Todos</span>
          </label>
          {influencers.map((inf) => (
            <label
              key={inf.id}
              className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer"
            >
              <input
                type="radio"
                name="influencer"
                checked={currentInfluencer === inf.id}
                onChange={() => updateFilter('influencer', inf.id)}
                className="accent-brand-gold bg-zinc-900 border-zinc-800"
              />
              <span className="truncate">{inf.nome}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cuisine Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-200">Tipo de Cozinha</h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
          <label className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="tipo"
              checked={!currentTipo}
              onChange={() => updateFilter('tipo', '')}
              className="accent-brand-gold bg-zinc-900 border-zinc-800"
            />
            <span>Todas</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-brand-gold hover:text-brand-gold/80 cursor-pointer font-medium">
            <input
              type="radio"
              name="tipo"
              checked={currentTipo === 'video'}
              onChange={() => updateFilter('tipo', 'video')}
              className="accent-brand-gold bg-zinc-900 border-zinc-800"
            />
            <span className="flex items-center gap-1">🎥 Com Vídeo</span>
          </label>
          {cozinhas.map((coz) => (
            <label
              key={coz}
              className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer capitalize"
            >
              <input
                type="radio"
                name="tipo"
                checked={currentTipo === coz}
                onChange={() => updateFilter('tipo', coz)}
                className="accent-brand-gold bg-zinc-900 border-zinc-800"
              />
              <span>{coz}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Neighborhood Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-200">Bairro</h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 scrollbar-thin">
          <label className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer">
            <input
              type="radio"
              name="bairro"
              checked={!currentBairro}
              onChange={() => updateFilter('bairro', '')}
              className="accent-brand-gold bg-zinc-900 border-zinc-800"
            />
            <span>Todos</span>
          </label>
          {bairros.map((b) => (
            <label
              key={b}
              className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white cursor-pointer"
            >
              <input
                type="radio"
                name="bairro"
                checked={currentBairro === b}
                onChange={() => updateFilter('bairro', b)}
                className="accent-brand-gold bg-zinc-900 border-zinc-800"
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-zinc-200">Preço</h4>
        <div className="grid grid-cols-4 gap-2">
          {['', '$', '$$', '$$$'].map((price) => (
            <button
              key={price}
              type="button"
              onClick={() => updateFilter('preco', price)}
              className={`py-1.5 text-xs font-semibold rounded-md border transition-all ${
                (price === '' && !currentPreco) || currentPreco === price
                  ? 'bg-brand-gold text-black border-brand-gold'
                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              {price === '' ? 'Todos' : price}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900 border border-zinc-850 rounded-xl p-3 mb-6">
        <span className="text-sm text-zinc-400">Filtrar resultados</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center space-x-2 bg-brand-gold hover:bg-brand-goldHover text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl h-fit">
        <RenderFilters />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm animate-fade-in flex justify-end">
          <div className="w-80 h-full bg-zinc-950 border-l border-zinc-900 p-6 overflow-y-auto space-y-6 animate-slide-in">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h2 className="font-serif font-bold text-lg text-white">Filtrar</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RenderFilters />
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-6"
            >
              Ver Resultados
            </button>
          </div>
        </div>
      )}
    </>
  )
}
