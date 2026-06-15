'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Search, Compass, Clock } from 'lucide-react'
import { sortRestaurants, isRestaurantOpen } from '@/lib/utils'

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
  horario_abertura?: string
  horario_fechamento?: string
  distancia_km?: number
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

interface CategoryDefinition {
  name: string
  emoji: string
  key: string
  order: number
}

function getRestaurantCategory(tipoCozinha?: string | null, nomeRestaurante?: string | null, descricao?: string | null): CategoryDefinition {
  const tc = (tipoCozinha || '').toLowerCase().trim();
  const name = (nomeRestaurante || '').toLowerCase();
  const desc = (descricao || '').toLowerCase();

  if (tc === 'hamburguer') {
    return { name: 'Hambúrgueres', emoji: '🍔', key: 'hamburguer', order: 1 };
  }
  if (tc === 'italiano' || tc === 'pizza') {
    return { name: 'Massas & Italiano', emoji: '🍝', key: 'italiano', order: 2 };
  }
  if (tc === 'japones' || tc === 'frutos do mar') {
    return { name: 'Japonês & Frutos do Mar', emoji: '🍣', key: 'peixe', order: 3 };
  }
  if (tc === 'saudavel' || name.includes('suplemento') || desc.includes('suplemento')) {
    return { name: 'Saudável & Suplementos', emoji: '🥗', key: 'saudavel', order: 4 };
  }
  if (tc === 'churrasco') {
    return { name: 'Churrasco & Grelhados', emoji: '🥩', key: 'churrasco', order: 5 };
  }
  if (tc === 'sobremesa') {
    return { name: 'Doces & Confeitaria', emoji: '🍰', key: 'doces', order: 6 };
  }
  return { name: 'Outras Dicas & Variados', emoji: '📍', key: 'outros', order: 7 };
}

const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lon: number }> = {
  'interlagos': { lat: -23.7013, lon: -46.6974 },
  'mooca': { lat: -23.5562, lon: -46.5982 },
  'morumbi': { lat: -23.6009, lon: -46.7201 },
  'tatuapé': { lat: -23.5407, lon: -46.5756 },
  'tatuape': { lat: -23.5407, lon: -46.5756 },
  'paraíso': { lat: -23.5701, lon: -46.6433 },
  'paraiso': { lat: -23.5701, lon: -46.6433 },
  'vila mariana': { lat: -23.5891, lon: -46.6343 },
  'itaim bibi': { lat: -23.5855, lon: -46.6789 },
  'pinheiros': { lat: -23.5621, lon: -46.7020 },
  'consolação': { lat: -23.5518, lon: -46.6526 },
  'consolacao': { lat: -23.5518, lon: -46.6526 },
  'jardins': { lat: -23.5625, lon: -46.6625 },
  'cerqueira césar': { lat: -23.5614, lon: -46.6620 },
  'cerqueira cesar': { lat: -23.5614, lon: -46.6620 },
  'perdizes': { lat: -23.5365, lon: -46.6732 },
  'vila madalena': { lat: -23.5463, lon: -46.6909 },
  'santana': { lat: -23.5015, lon: -46.6263 },
  'centro': { lat: -23.5489, lon: -46.6388 },
  'bela vista': { lat: -23.5583, lon: -46.6483 },
  'liberdade': { lat: -23.5617, lon: -46.6339 },
  'aclimação': { lat: -23.5728, lon: -46.6251 },
  'aclimacao': { lat: -23.5728, lon: -46.6251 },
  'ipiranga': { lat: -23.5888, lon: -46.6083 },
  'chácara klabin': { lat: -23.5939, lon: -46.6288 },
  'chacara klabin': { lat: -23.5939, lon: -46.6288 },
  'saúde': { lat: -23.6149, lon: -46.6329 },
  'saude': { lat: -23.6149, lon: -46.6329 },
  'moema': { lat: -23.6022, lon: -46.6621 },
  'brooklin': { lat: -23.6111, lon: -46.6836 },
  'campo belo': { lat: -23.6231, lon: -46.6728 },
  'santo amaro': { lat: -23.6494, lon: -46.7081 },
  'lapa': { lat: -23.5222, lon: -46.7029 },
  'barra funda': { lat: -23.5262, lon: -46.6669 },
  'higienópolis': { lat: -23.5461, lon: -46.6575 },
  'higienopolis': { lat: -23.5461, lon: -46.6575 },
  'santa cecília': { lat: -23.5398, lon: -46.6492 },
  'santa cecilia': { lat: -23.5398, lon: -46.6492 },
  'bom retiro': { lat: -23.5266, lon: -46.6366 },
  'brás': { lat: -23.5401, lon: -46.6139 },
  'bras': { lat: -23.5401, lon: -46.6139 },
  'pari': { lat: -23.5298, lon: -46.6163 },
  'belém': { lat: -23.5388, lon: -46.5931 },
  'belem': { lat: -23.5388, lon: -46.5931 },
  'penha': { lat: -23.5244, lon: -46.5492 },
  'carrão': { lat: -23.5486, lon: -46.5433 },
  'carrao': { lat: -23.5486, lon: -46.5433 },
  'analia franco': { lat: -23.5567, lon: -46.5611 },
  'anália franco': { lat: -23.5567, lon: -46.5611 },
  'vila prudente': { lat: -23.5781, lon: -46.5769 },
  'sacomã': { lat: -23.6067, lon: -46.5947 },
  'sacoma': { lat: -23.6067, lon: -46.5947 },
  'jabaquara': { lat: -23.6477, lon: -46.6429 },
  'indianópolis': { lat: -23.6083, lon: -46.6583 },
  'indianopolis': { lat: -23.6083, lon: -46.6583 },
  'alto de pinheiros': { lat: -23.5486, lon: -46.7122 },
  'butantã': { lat: -23.5714, lon: -46.7086 },
  'butanta': { lat: -23.5714, lon: -46.7086 },
  'vila leopoldina': { lat: -23.5303, lon: -46.7328 },
  'jaguaré': { lat: -23.5422, lon: -46.7533 },
  'jaguare': { lat: -23.5422, lon: -46.7533 },
  'pompeia': { lat: -23.5292, lon: -46.6833 },
  'pompéia': { lat: -23.5292, lon: -46.6833 },
  'sumaré': { lat: -23.5436, lon: -46.6781 },
  'sumare': { lat: -23.5436, lon: -46.6781 },
  'vila sônia': { lat: -23.6019, lon: -46.7419 },
  'vila sonia': { lat: -23.6019, lon: -46.7419 },
  'campo limpo': { lat: -23.6367, lon: -46.7597 },
  'capão redondo': { lat: -23.6601, lon: -46.7797 },
  'capao redondo': { lat: -23.6601, lon: -46.7797 },
}

const RESTAURANT_COORDS: Record<string, { lat: number; lon: number }> = {
  'pantchos-house-burger': { lat: -23.7315, lon: -46.6855 },
  'pecatto-bar-restaurante': { lat: -23.5435, lon: -46.5684 },
  'outlet-do-suplemento': { lat: -23.5786, lon: -46.5937 },
  'stunt-burger': { lat: -23.5976, lon: -46.7214 },
  'santomar-restaurante': { lat: -23.543, lon: -46.568 },
  'pizzaria-vero-paradiso': { lat: -23.5714, lon: -46.6433 },
  'casa-na-praia-bar': { lat: -23.5836, lon: -46.6472 },
  'hao-sushi-itaim': { lat: -23.5939, lon: -46.6789 },
  'seja-total-galpao': { lat: -23.4768, lon: -46.6329 },
  'pecatto-tatuape': { lat: -23.5435, lon: -46.5684 },
  'hellmannsbr': { lat: -23.5671, lon: -46.7002 },
  'arabia-night-paulista': { lat: -23.5594, lon: -46.6583 },
  'busger': { lat: -23.6268, lon: -46.6859 },
  'villa-e-prosa': { lat: -23.5781, lon: -46.6421 },
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Number(d.toFixed(1));
}

function supportsReservation(restaurant: Restaurant): boolean {
  const desc = (restaurant.descricao || '').toLowerCase();
  return (
    restaurant.preco_medio.length >= 2 || // $$ or $$$
    desc.includes('reserva') ||
    desc.includes('reservar')
  );
}

function supportsDelivery(restaurant: Restaurant): boolean {
  const tc = (restaurant.tipo_cozinha || '').toLowerCase();
  const name = restaurant.nome.toLowerCase();
  const desc = (restaurant.descricao || '').toLowerCase();
  return (
    name.includes('suplemento') ||
    tc === 'hamburguer' ||
    tc === 'pizza' ||
    tc === 'sobremesa' ||
    desc.includes('entrega') ||
    desc.includes('delivery') ||
    desc.includes('ifood')
  );
}

export default function InfluencerProfileView({
  influencer,
  partners,
  allVideos,
}: InfluencerProfileViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('todos')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterDistance5km, setFilterDistance5km] = useState(false)
  const [filterReserva, setFilterReserva] = useState(false)
  const [filterEntrega, setFilterEntrega] = useState(false)

  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'prompting' | 'active' | 'denied' | 'error'>('idle')

  const handleToggleGeo = () => {
    if (geoStatus === 'active') {
      setUserCoords(null)
      setGeoStatus('idle')
      return
    }

    if (!navigator.geolocation) {
      setGeoStatus('error')
      alert('Seu navegador não suporta geolocalização.')
      return
    }

    setGeoStatus('prompting')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setGeoStatus('active')
      },
      (error) => {
        console.error("Erro ao obter geolocalização:", error)
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied')
          alert("Permissão de localização negada pelo usuário. Por favor, ative a permissão nas configurações do navegador.")
        } else {
          setGeoStatus('error')
          alert("Não foi possível obter a sua localização atual.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Dynamically map partners to calculate real distance if GPS is active
  const mappedPartners = useMemo(() => {
    if (geoStatus !== 'active' || !userCoords) {
      return partners;
    }

    return partners.map(p => {
      const bairroLower = (p.restaurant.bairro || '').toLowerCase().trim();
      const coords = RESTAURANT_COORDS[p.restaurant.slug] || NEIGHBORHOOD_COORDS[bairroLower];

      if (coords) {
        const dist = getDistanceFromLatLonInKm(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
        return {
          ...p,
          restaurant: {
            ...p.restaurant,
            distancia_km: dist,
          }
        };
      }

      return p;
    });
  }, [partners, geoStatus, userCoords]);

  // Filter partners based on search query (name, neighborhood, type of cuisine, or key tags)
  const filteredPartners = mappedPartners.filter((p) => {
    // 1. Search filter
    const q = searchQuery.toLowerCase().trim()
    if (q) {
      const nameMatch = p.restaurant.nome.toLowerCase().includes(q)
      const neighborhoodMatch = p.restaurant.bairro.toLowerCase().includes(q)
      const cuisineMatch = p.restaurant.tipo_cozinha.toLowerCase().includes(q)
      const dishMatch = p.video?.prato_destaque?.toLowerCase().includes(q) || false
      const keywordMatch = p.video?.palavras_chave?.some(tag => tag.toLowerCase().includes(q)) || false

      if (!(nameMatch || neighborhoodMatch || cuisineMatch || dishMatch || keywordMatch)) {
        return false
      }
    }

    // 2. Open now filter
    if (filterOpen) {
      const isOpen = isRestaurantOpen(p.restaurant.horario_abertura, p.restaurant.horario_fechamento)
      if (!isOpen) return false
    }

    // 3. Distance <= 5km filter
    if (filterDistance5km) {
      const dist = p.restaurant.distancia_km ? Number(p.restaurant.distancia_km) : null
      if (dist === null || dist > 5) return false
    }

    // 4. Reservation filter
    if (filterReserva) {
      if (!supportsReservation(p.restaurant)) return false
    }

    // 5. Delivery filter
    if (filterEntrega) {
      if (!supportsDelivery(p.restaurant)) return false
    }

    return true
  })

  // Sort partners: if GPS is active, strictly closest distance first. Else, open first, then closest distance.
  const sortedPartners = useMemo(() => {
    if (geoStatus === 'active') {
      return [...filteredPartners].sort((a, b) => {
        const distA = a.restaurant.distancia_km !== undefined && a.restaurant.distancia_km !== null ? Number(a.restaurant.distancia_km) : 999;
        const distB = b.restaurant.distancia_km !== undefined && b.restaurant.distancia_km !== null ? Number(b.restaurant.distancia_km) : 999;
        return distA - distB;
      });
    }
    return sortRestaurants(filteredPartners, (p) => ({
      horario_abertura: p.restaurant.horario_abertura,
      horario_fechamento: p.restaurant.horario_fechamento,
      distancia_km: p.restaurant.distancia_km ? Number(p.restaurant.distancia_km) : null,
    }));
  }, [filteredPartners, geoStatus]);

  // Filter for display flat list when GPS is active
  const displayPartners = useMemo(() => {
    if (activeCategory === 'todos') {
      return sortedPartners;
    }
    return sortedPartners.filter((p) => {
      const cat = getRestaurantCategory(
        p.restaurant.tipo_cozinha,
        p.restaurant.nome,
        p.restaurant.descricao || ''
      )
      return cat.key === activeCategory;
    });
  }, [sortedPartners, activeCategory]);

  // Group sorted partners into categories (for standard view)
  const groupedPartnersMap: { [key: string]: { category: CategoryDefinition; items: typeof sortedPartners } } = {}

  sortedPartners.forEach((p) => {
    const cat = getRestaurantCategory(
      p.restaurant.tipo_cozinha,
      p.restaurant.nome,
      p.restaurant.descricao || ''
    )

    // Active Category Filter
    if (activeCategory !== 'todos' && cat.key !== activeCategory) {
      return
    }

    if (!groupedPartnersMap[cat.key]) {
      groupedPartnersMap[cat.key] = { category: cat, items: [] }
    }
    groupedPartnersMap[cat.key].items.push(p)
  })

  // Get categories sorted by predefined order
  const sortedCategories = Object.values(groupedPartnersMap).sort(
    (a, b) => a.category.order - b.category.order
  )

  // Find available categories dynamically based on the current search text (so we don't show empty categories)
  const availableCategoriesMap: { [key: string]: CategoryDefinition } = {}
  mappedPartners.forEach((p) => {
    // Show categories based on base partners
    const cat = getRestaurantCategory(
      p.restaurant.tipo_cozinha,
      p.restaurant.nome,
      p.restaurant.descricao || ''
    )
    availableCategoriesMap[cat.key] = cat
  })
  const availableCategoriesList = Object.values(availableCategoriesMap).sort(
    (a, b) => a.order - b.order
  )

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
    <div className="space-y-10">
      {/* Search Internal */}
      <div className="max-w-md mx-auto">
        <div className="relative flex items-center bg-zinc-900/60 border border-zinc-850 rounded-xl overflow-hidden focus-within:border-brand-gold/60 transition-all px-3">
          <Search className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              // Reset category to "todos" when performing a fresh text search to show matching results
              setActiveCategory('todos')
            }}
            placeholder={`Buscar nos restaurantes de ${influencer.nome}...`}
            className="w-full bg-transparent border-none outline-none py-3 text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Quick Filters (GPS, Aberto-fechado, Distancia, Reserva, Entrega) */}
      <div 
        className="w-full overflow-x-auto py-1 flex items-center space-x-2.5 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={handleToggleGeo}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1.5 shrink-0 select-none ${
            geoStatus === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/5'
              : geoStatus === 'prompting'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : geoStatus === 'denied' || geoStatus === 'error'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>
            {geoStatus === 'active'
              ? '📍 Perto de mim'
              : geoStatus === 'prompting'
              ? '⏳ Perto de mim...'
              : geoStatus === 'denied'
              ? '🚫 Perto de mim'
              : geoStatus === 'error'
              ? '⚠️ Perto de mim'
              : '📍 Perto de mim'}
          </span>
        </button>

        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 shrink-0 select-none ${
            filterOpen
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-sm shadow-brand-gold/5'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>🕒 Aberto</span>
        </button>

        <button
          onClick={() => setFilterDistance5km(!filterDistance5km)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 shrink-0 select-none ${
            filterDistance5km
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-sm shadow-brand-gold/5'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>📍 Até 5 km</span>
        </button>

        <button
          onClick={() => setFilterReserva(!filterReserva)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 shrink-0 select-none ${
            filterReserva
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-sm shadow-brand-gold/5'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>📅 Aceita Reserva</span>
        </button>

        <button
          onClick={() => setFilterEntrega(!filterEntrega)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center space-x-1 shrink-0 select-none ${
            filterEntrega
              ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/40 shadow-sm shadow-brand-gold/5'
              : 'bg-zinc-900/40 text-zinc-400 border-zinc-850 hover:border-zinc-800 hover:text-zinc-300'
          }`}
        >
          <span>🛵 Entrega</span>
        </button>
      </div>

      {/* Categories Horizontal Carousel (iFood Style) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categorias</h4>
        <div 
          className="w-full overflow-x-auto py-2 flex items-center space-x-5 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => setActiveCategory('todos')}
            className="flex flex-col items-center space-y-1.5 focus:outline-none group shrink-0"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all border ${
              activeCategory === 'todos'
                ? 'bg-brand-gold text-black border-brand-gold scale-105 shadow-md shadow-brand-gold/10'
                : 'bg-zinc-900/40 hover:bg-zinc-850 border-zinc-850 text-zinc-350 hover:text-white'
            }`}>
              🍽️
            </div>
            <span className={`text-[11px] font-medium transition-colors ${
              activeCategory === 'todos' ? 'text-brand-gold font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
            }`}>
              Todos
            </span>
          </button>

          {availableCategoriesList.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex flex-col items-center space-y-1.5 focus:outline-none group shrink-0"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all border ${
                activeCategory === cat.key
                  ? 'bg-brand-gold text-black border-brand-gold scale-105 shadow-md shadow-brand-gold/10'
                  : 'bg-zinc-900/40 hover:bg-zinc-850 border-zinc-850 text-zinc-350 hover:text-white'
              }`}>
                {cat.emoji}
              </div>
              <span className={`text-[11px] font-medium transition-colors ${
                activeCategory === cat.key ? 'text-brand-gold font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
              }`}>
                {cat.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Partner Restaurants */}
      <section className="space-y-6">
        <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">Recomendações Curadas</h2>
            <p className="text-xs text-zinc-500">
              Restaurantes parceiros indicados por {influencer.nome}.
            </p>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-full">
            {displayPartners.length} {displayPartners.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {geoStatus === 'active' ? (
          displayPartners.length > 0 ? (
            <div className="space-y-4">
              {/* Single Flat List Header */}
              <h3 className="text-base font-bold font-serif flex items-center space-x-2 text-emerald-400 border-b border-zinc-900/30 pb-1.5">
                <span>📍</span>
                <span>
                  {activeCategory === 'todos' 
                    ? 'Mais Próximos de Você' 
                    : `${availableCategoriesList.find(c => c.key === activeCategory)?.emoji || ''} ${
                        availableCategoriesList.find(c => c.key === activeCategory)?.name || 'Mais Próximos'
                      }`
                  }
                </span>
                <span className="text-[10px] font-normal text-zinc-500 font-sans bg-zinc-900/50 px-1.5 py-0.5 rounded-md">
                  {displayPartners.length}
                </span>
              </h3>

              {/* Flat Card List Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeIn">
                {displayPartners.map(({ restaurant, video }) => {
                  const displayImage = restaurant.foto_capa_url || video?.thumbnail_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${restaurant.bairro} São Paulo`)}`
                  const instagramUrl = `https://instagram.com/${restaurant.instagram_handle}`
                  const isOpen = isRestaurantOpen(restaurant.horario_abertura, restaurant.horario_fechamento)

                  return (
                    <div
                      key={restaurant.id}
                      className={`bg-zinc-900/15 border rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-gold/20 transition-all flex flex-row p-3 md:p-4 gap-3 md:gap-5 group relative ${
                        isOpen ? 'border-zinc-900' : 'border-zinc-950/80 opacity-75'
                      }`}
                    >
                      {/* Image Section (Left) */}
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                        <img
                          src={displayImage}
                          alt={restaurant.nome}
                          className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ${
                            !isOpen ? 'grayscale opacity-30' : ''
                          }`}
                        />
                        {!isOpen && (
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center pointer-events-none">
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-zinc-950/90 text-zinc-400 border border-zinc-800 shadow">
                              Fechado
                            </span>
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-brand-gold text-black scale-90 origin-top-left shadow">
                          Parceiro
                        </div>
                      </div>

                      {/* Details Section (Right) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="space-y-1 md:space-y-1.5">
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-xs text-zinc-400 capitalize">
                            <span className="font-semibold text-zinc-350">{restaurant.tipo_cozinha}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-0.5 text-zinc-500" />
                              {restaurant.bairro}
                            </span>
                            {restaurant.distancia_km !== undefined && restaurant.distancia_km !== null && (
                              <>
                                <span>•</span>
                                <span className="text-zinc-350 font-medium">
                                  {typeof restaurant.distancia_km === 'number' 
                                    ? restaurant.distancia_km.toFixed(1) 
                                    : Number(restaurant.distancia_km).toFixed(1)
                                  } km
                                </span>
                              </>
                            )}
                          </div>

                          <Link href={`/restaurante/${restaurant.slug}`} className="block">
                            <h3 className={`text-base md:text-lg font-bold font-serif hover:text-brand-gold transition-colors truncate leading-tight ${
                              isOpen ? 'text-white' : 'text-zinc-350'
                            }`}>
                              {restaurant.nome}
                            </h3>
                          </Link>

                          <div className="flex items-center space-x-1.5 text-[10px] md:text-xs">
                            <Clock className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-500' : 'text-zinc-550'}`} />
                            {isOpen ? (
                              <span className="text-emerald-500 font-medium">
                                Aberto <span className="text-zinc-500 font-normal">• Fecha às {restaurant.horario_fechamento}</span>
                              </span>
                            ) : (
                              <span className="text-zinc-400 font-medium">
                                Fechado <span className="text-zinc-500 font-normal">• Abre às {restaurant.horario_abertura}</span>
                              </span>
                            )}
                          </div>

                          {video?.prato_destaque ? (
                            <p className="text-[11px] md:text-xs italic text-brand-gold flex items-center truncate">
                              <Sparkles className="w-3 h-3 mr-1 shrink-0" />
                              Destaque: {video.prato_destaque}
                            </p>
                          ) : (
                            restaurant.descricao && (
                              <p className="text-[11px] md:text-xs text-zinc-450 line-clamp-1">
                                {restaurant.descricao}
                              </p>
                            )
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900/40">
                          <div className="flex items-center space-x-1.5 select-none scale-90 md:scale-100 origin-left">
                            {supportsReservation(restaurant) && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-900/80 border border-zinc-800 text-zinc-400">
                                📅 Reserva
                              </span>
                            )}
                            {supportsDelivery(restaurant) && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-900/80 border border-zinc-800 text-zinc-400">
                                🛵 Entrega
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-zinc-900/60 border border-zinc-850 text-brand-gold">
                              {restaurant.preco_medio}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0 scale-90 md:scale-100 origin-right">
                            <a
                              href={instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-white transition-colors"
                              title="Instagram"
                            >
                              <InstagramIcon className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-brand-gold hover:text-white transition-colors"
                              title="Como chegar"
                            >
                              <Compass className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-zinc-550 text-sm text-center py-10 bg-zinc-950/20 border border-zinc-900 rounded-xl animate-fadeIn">
              Nenhum restaurante parceiro corresponde aos filtros selecionados.
            </div>
          )
        ) : sortedCategories.length > 0 ? (
          <div className="space-y-10">
            {sortedCategories.map(({ category, items }) => (
              <div key={category.key} className="space-y-4">
                {/* Category Section Header */}
                <h3 className="text-base font-bold font-serif flex items-center space-x-2 text-brand-gold border-b border-zinc-900/30 pb-1.5">
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                  <span className="text-[10px] font-normal text-zinc-500 font-sans bg-zinc-900/50 px-1.5 py-0.5 rounded-md">
                    {items.length}
                  </span>
                </h3>

                {/* Horizontal Card List Layout (iFood Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map(({ restaurant, video }) => {
                    const displayImage = restaurant.foto_capa_url || video?.thumbnail_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=450&q=80'
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${restaurant.bairro} São Paulo`)}`
                    const instagramUrl = `https://instagram.com/${restaurant.instagram_handle}`
                    const isOpen = isRestaurantOpen(restaurant.horaria_abertura || restaurant.horario_abertura, restaurant.horario_fechamento)

                    return (
                      <div
                        key={restaurant.id}
                        className={`bg-zinc-900/15 border rounded-2xl overflow-hidden hover:shadow-xl hover:border-brand-gold/20 transition-all flex flex-row p-3 md:p-4 gap-3 md:gap-5 group relative ${
                          isOpen ? 'border-zinc-900' : 'border-zinc-950/80 opacity-75'
                        }`}
                      >
                        {/* Image Section (Left) */}
                        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden shrink-0 bg-zinc-950">
                          <img
                            src={displayImage}
                            alt={restaurant.nome}
                            className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ${
                              !isOpen ? 'grayscale opacity-30' : ''
                            }`}
                          />
                          {/* Closed overlay sign */}
                          {!isOpen && (
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center pointer-events-none">
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-zinc-950/90 text-zinc-400 border border-zinc-800 shadow">
                                Fechado
                              </span>
                            </div>
                          )}
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase bg-brand-gold text-black scale-90 origin-top-left shadow">
                            Parceiro
                          </div>
                        </div>

                        {/* Details Section (Right) */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="space-y-1 md:space-y-1.5">
                            {/* Line 1: Cuisine & Bairro & Distance */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-xs text-zinc-400 capitalize">
                              <span className="font-semibold text-zinc-350">{restaurant.tipo_cozinha}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <MapPin className="w-3 h-3 mr-0.5 text-zinc-500" />
                                {restaurant.bairro}
                              </span>
                              {restaurant.distancia_km !== undefined && restaurant.distancia_km !== null && (
                                <>
                                  <span>•</span>
                                  <span className="text-zinc-350 font-medium">
                                    {typeof restaurant.distancia_km === 'number' 
                                      ? restaurant.distancia_km.toFixed(1) 
                                      : Number(restaurant.distancia_km).toFixed(1)
                                    } km
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Line 2: Name */}
                            <Link href={`/restaurante/${restaurant.slug}`} className="block">
                              <h3 className={`text-base md:text-lg font-bold font-serif hover:text-brand-gold transition-colors truncate leading-tight ${
                                isOpen ? 'text-white' : 'text-zinc-350'
                              }`}>
                                {restaurant.nome}
                              </h3>
                            </Link>

                            {/* Line 3: Horários */}
                            <div className="flex items-center space-x-1.5 text-[10px] md:text-xs">
                              <Clock className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-500' : 'text-zinc-550'}`} />
                              {isOpen ? (
                                <span className="text-emerald-500 font-medium">
                                  Aberto <span className="text-zinc-500 font-normal">• Fecha às {restaurant.horario_fechamento}</span>
                                </span>
                              ) : (
                                <span className="text-zinc-400 font-medium">
                                  Fechado <span className="text-zinc-500 font-normal">• Abre às {restaurant.horario_abertura}</span>
                                </span>
                              )}
                            </div>

                            {/* Line 4: Destaque or description */}
                            {video?.prato_destaque ? (
                              <p className="text-[11px] md:text-xs italic text-brand-gold flex items-center truncate">
                                <Sparkles className="w-3 h-3 mr-1 shrink-0" />
                                Destaque: {video.prato_destaque}
                              </p>
                            ) : (
                              restaurant.descricao && (
                                <p className="text-[11px] md:text-xs text-zinc-450 line-clamp-1">
                                  {restaurant.descricao}
                                </p>
                              )
                            )}
                          </div>

                          {/* Line 5: Badges / Tags & Action buttons */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-900/40">
                            {/* Badges for filters */}
                            <div className="flex items-center space-x-1.5 select-none scale-90 md:scale-100 origin-left">
                              {supportsReservation(restaurant) && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-900/80 border border-zinc-800 text-zinc-400">
                                  📅 Reserva
                                </span>
                              )}
                              {supportsDelivery(restaurant) && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-900/80 border border-zinc-800 text-zinc-400">
                                  🛵 Entrega
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-zinc-900/60 border border-zinc-850 text-brand-gold">
                                {restaurant.preco_medio}
                              </span>
                            </div>

                            {/* Action Buttons compact */}
                            <div className="flex items-center space-x-1.5 shrink-0 scale-90 md:scale-100 origin-right">
                              <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-white transition-colors"
                                title="Instagram"
                              >
                                <InstagramIcon className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-brand-gold hover:text-white transition-colors"
                                title="Como chegar"
                              >
                                <Compass className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-550 text-sm text-center py-10 bg-zinc-950/20 border border-zinc-900 rounded-xl animate-fadeIn">
            Nenhum restaurante parceiro corresponde aos filtros selecionados.
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section className="space-y-6">
        <div className="border-b border-zinc-900 pb-3">
          <h2 className="text-xl font-bold font-serif text-white">Todos os Vídeos</h2>
          <p className="text-xs text-zinc-500">
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
                      <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">
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
