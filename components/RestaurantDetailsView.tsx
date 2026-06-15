'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  MapPin, Compass, Sparkles, Clock, Phone, DollarSign, Calendar, 
  ShoppingBag, Film, Quote, ChevronDown, ChevronUp, Share2, Award, Heart, MessageSquare, CheckCircle2
} from 'lucide-react'
import { isRestaurantOpen, getLiveStatusMessage } from '@/lib/utils'
import seededContacts from '@/lib/restaurant-contacts-seeded.json'

// Icones Sociais
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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

// Dicionário de Contatos Reais por Slug (Manual Overrides)
const MANUAL_CONTACTS: Record<string, {
  endereco: string;
  telefone: string;
  whatsapp: string; // apenas numeros para links de wa.me
  deliveryUrl?: string;
}> = {
  'pantchos-house-burger': {
    endereco: 'Avenida Manuel Alves Soares, 404 - Parque Colonial, São Paulo - SP, 04821-270',
    telefone: '(11) 2589-0467',
    whatsapp: '551123656435',
    deliveryUrl: 'https://deliverydireto.com.br/pantchoshousehamburgueria'
  },
  'pecatto-bar-restaurante': {
    endereco: 'Rua Emília Marengo, 1286 - Tatuapé, São Paulo - SP, 03336-000',
    telefone: '(11) 2673-9193',
    whatsapp: '551126739193',
    deliveryUrl: 'https://pecatto.anota.ai'
  },
  'pecatto-tatuape': {
    endereco: 'Rua Emília Marengo, 1286 - Tatuapé, São Paulo - SP, 03336-000',
    telefone: '(11) 2673-9193',
    whatsapp: '551126739193',
    deliveryUrl: 'https://pecatto.anota.ai'
  },
  'outlet-do-suplemento': {
    endereco: 'Rua Ponta Grossa, 237 - Parque Mandaqui, São Paulo - SP, 02420-010',
    telefone: '(11) 2365-6435', // e-commerce/central
    whatsapp: '5511999999999',
    deliveryUrl: 'https://sejatotal.com'
  },
  'seja-total-galpao': {
    endereco: 'Rua Ponta Grossa, 237 - Parque Mandaqui, São Paulo - SP, 02420-010',
    telefone: 'N/A',
    whatsapp: '5511999999999',
    deliveryUrl: 'https://sejatotal.com'
  },
  'stunt-burger': {
    endereco: 'Rua José Jannarelli, 426 - Vila Progredior, São Paulo - SP, 05615-000',
    telefone: '(11) 3721-3538',
    whatsapp: '5511955206206',
    deliveryUrl: 'https://www.stuntburger.com.br'
  },
  'hellmannsbr': {
    endereco: 'Rua José Jannarelli, 426 - Vila Progredior, São Paulo - SP, 05615-000',
    telefone: '(11) 3721-3538',
    whatsapp: '5511955206206',
    deliveryUrl: 'https://www.stuntburger.com.br'
  },
  'santomar-restaurante': {
    endereco: 'Rua Francisco Marengo, 773 - Tatuapé, São Paulo - SP, 03313-000',
    telefone: '(11) 2942-7594',
    whatsapp: '5511944672523',
    deliveryUrl: 'https://santomar.anota.ai'
  },
  'pizzaria-vero-paradiso': {
    endereco: 'Rua Tutóia, 194 - Paraíso, São Paulo - SP, 04007-000',
    telefone: '(11) 3884-3646',
    whatsapp: '551138843646',
    deliveryUrl: 'https://veroparadiso.anota.ai'
  },
  'casa-na-praia-bar': {
    endereco: 'Rua Doutor Amâncio de Carvalho, 329 - Vila Mariana, São Paulo - SP, 04012-090',
    telefone: '(11) 5082-5002',
    whatsapp: '551150825002',
    deliveryUrl: 'https://www.ifood.com.br'
  },
  'hao-sushi-itaim': {
    endereco: 'Rua João Cachoeira, 1556 - Vila Nova Conceição, São Paulo - SP, 04535-007',
    telefone: '(11) 5536-0783',
    whatsapp: '551155360783',
    deliveryUrl: 'https://www.ifood.com.br'
  },
  'arabia-night-paulista': {
    endereco: 'Av. Paulista, 1941 (Shopping Market Paulista) - Bela Vista, São Paulo - SP, 01311-300',
    telefone: 'N/A',
    whatsapp: '5511999999999',
    deliveryUrl: 'https://www.marketpaulista.com.br'
  },
  'busger': {
    endereco: 'Av. Vereador José Diniz, 3700 - Campo Belo, São Paulo - SP, 04606-007',
    telefone: '(11) 2365-1695',
    whatsapp: '551123651695',
    deliveryUrl: 'https://www.ifood.com.br/delivery/sao-paulo-sp/busger---campo-belo-campo-belo'
  },
  'villa-e-prosa': {
    endereco: 'Rua Cubatão, 1116 - Vila Mariana, São Paulo - SP, 04013-004',
    telefone: 'N/A',
    whatsapp: '5511999999999',
    deliveryUrl: 'https://www.ifood.com.br'
  }
}

// Dicionário de Contatos Reais por Slug (Merged with Seeded Contacts)
export const RESTAURANT_CONTACTS: Record<string, {
  endereco: string;
  telefone: string;
  whatsapp: string;
  deliveryUrl?: string;
}> = {
  ...seededContacts,
  ...MANUAL_CONTACTS
}

// Dicionário de Dúvidas Frequentes por Culinária
const getFAQ = (tipoCozinha: string, name: string): { q: string; a: string }[] => {
  const normalized = (tipoCozinha || '').toLowerCase();
  const base = [
    { q: 'Quais são as formas de pagamento aceitas?', a: 'Aceitamos todos os principais cartões de crédito/débito, Pix e dinheiro. Alguns convênios ou vales sob consulta.' },
    { q: 'O local é pet friendly?', a: 'Sim! Animais de pequeno e médio porte são super bem-vindos na nossa área externa/varanda.' },
  ];

  if (normalized.includes('hamburguer') || normalized.includes('burguer')) {
    return [
      { q: 'Existem opções vegetarianas ou veganas no cardápio?', a: `Sim! O ${name} possui blends de burger vegetais excelentes e queijo vegano sob demanda.` },
      { q: 'Preciso reservar mesa para ir no final de semana?', a: 'Não é obrigatório, mas recomendamos chegar cedo ou colocar o nome na lista digital de espera para evitar filas nos horários de pico.' },
      ...base
    ];
  }
  if (normalized.includes('japones') || normalized.includes('sushi')) {
    return [
      { q: 'O buffet inclui bebidas e sobremesas?', a: 'Sim, o festival/buffet completo conta com refrigerantes, sodas italianas, sucos e sobremesas inclusas no valor fixo.' },
      { q: 'Trabalham com sistema à la carte ou apenas rodízio?', a: 'Temos ambas as opções: rodízio completo para uma experiência farta e pratos combinados à la carte.' },
      ...base
    ];
  }
  if (normalized.includes('italiano') || normalized.includes('pizza') || normalized.includes('sobremesa')) {
    return [
      { q: 'É possível fazer reservas para aniversários e grandes grupos?', a: `Sim! O ${name} aceita reservas de mesa e eventos. Entre em contato pelo WhatsApp com antecedência de pelo menos 48 horas.` },
      { q: 'Possuem opções sem glúten ou sem lactose?', a: 'Temos algumas opções naturalmente sem glúten/lactose. Por favor, avise o garçom para orientações detalhadas de contaminação cruzada.' },
      ...base
    ];
  }
  return [
    { q: 'Como funciona o sistema de reservas?', a: `As reservas podem ser solicitadas diretamente através do botão de WhatsApp na aba "Informações" ou por telefone.` },
    { q: 'Há estacionamento próprio ou valet no local?', a: 'O local possui serviço de valet conveniado nos finais de semana e vagas de rua com zona azul no entorno.' },
    ...base
  ];
};

function sanitizeFilename(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric except spaces/hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading/trailing hyphens
}

interface RestaurantDetailsViewProps {
  restaurant: any
  video: any
  influencer: any
  otherRecommendations: any[]
  menuItems: any[]
  gallery: any[]
  estimatedCost: string
}

export default function RestaurantDetailsView({
  restaurant,
  video,
  influencer,
  otherRecommendations,
  menuItems,
  gallery,
  estimatedCost
}: RestaurantDetailsViewProps) {
  const [activeTab, setActiveTab] = useState<'indicacao' | 'menu' | 'informacoes' | 'galeria' | 'faq'>('indicacao')
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null)
  const [videoExists, setVideoExists] = useState<boolean>(false)
  const [checkingVideo, setCheckingVideo] = useState<boolean>(true)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  // Favorites & Share logic
  const [isFavorited, setIsFavorited] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('guiasp-favoritos')
    const favs = saved ? JSON.parse(saved) : []
    setIsFavorited(favs.includes(restaurant.slug))
  }, [restaurant.slug])

  const toggleFavorite = () => {
    const saved = localStorage.getItem('guiasp-favoritos')
    let favs = saved ? JSON.parse(saved) : []
    
    if (favs.includes(restaurant.slug)) {
      favs = favs.filter((s: string) => s !== restaurant.slug)
      setIsFavorited(false)
      showToast('Removido dos favoritos')
    } else {
      favs.push(restaurant.slug)
      setIsFavorited(true)
      showToast('Salvo nos seus favoritos! ❤️')
    }
    localStorage.setItem('guiasp-favoritos', JSON.stringify(favs))
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
  }

  // Clear toast automatically after 3s
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleShare = async () => {
    const shareData = {
      title: `GuiaSP - ${restaurant.nome}`,
      text: `Olha essa indicação do ${influencer?.nome || 'influencer'} no GuiaSP: ${restaurant.nome} (${restaurant.tipo_cozinha} no ${restaurant.bairro})!`,
      url: window.location.href
    }
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Link copiado para a área de transferência! 🔗')
      } catch (err) {
        showToast('Não foi possível copiar o link')
      }
    }
  }
  
  const videoRef = useRef<HTMLVideoElement>(null)

  const contacts = RESTAURANT_CONTACTS[restaurant.slug] || {
    endereco: `${restaurant.bairro || 'São Paulo'} - São Paulo, SP`,
    telefone: '(11) 99999-9999',
    whatsapp: '5511999999999'
  }

  const [status, setStatus] = useState(() => 
    getLiveStatusMessage(
      restaurant.horario_abertura,
      restaurant.horario_fechamento,
      (contacts as any)?.horarios_semana
    )
  )

  useEffect(() => {
    // Recalculate immediately on mount to ensure client time is accurate
    setStatus(
      getLiveStatusMessage(
        restaurant.horario_abertura,
        restaurant.horario_fechamento,
        (contacts as any)?.horarios_semana
      )
    )

    // Update the open status dynamically every 10 seconds
    const interval = setInterval(() => {
      setStatus(
        getLiveStatusMessage(
          restaurant.horario_abertura,
          restaurant.horario_fechamento,
          (contacts as any)?.horarios_semana
        )
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [restaurant.horario_abertura, restaurant.horario_fechamento, contacts])

  const isOpen = status.isOpen
  const statusMessage = status.message
  const faqs = getFAQ(restaurant.tipo_cozinha, restaurant.nome)

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${contacts.endereco}`)}`
  const instagramUrl = `https://instagram.com/${restaurant.instagram_handle || influencer?.instagram_handle}`
  
  // Custom WhatsApp message
  const waMessage = encodeURIComponent(`Olá! Vi a indicação do ${restaurant.nome} no GuiaSP e gostaria de saber mais informações sobre mesas e reservas.`)
  const waUrl = `https://wa.me/${contacts.whatsapp}?text=${waMessage}`

  // Check if video file exists and support local override
  useEffect(() => {
    if (!video) {
      setVideoExists(false)
      setCheckingVideo(false)
      return
    }

    let active = true
    async function checkVideo() {
      try {
        let resolvedUrl = video.video_url

        // Try to match local videos list first
        if (video.titulo) {
          try {
            const listRes = await fetch('/api/videos')
            const listData = await listRes.json()
            if (listData.success && listData.videos) {
              const sanitizedTitle = sanitizeFilename(video.titulo)
              const matched = listData.videos.find((v: any) => {
                const baseName = v.filename.substring(0, v.filename.lastIndexOf('.'))
                return baseName === sanitizedTitle
              })
              if (matched) {
                resolvedUrl = `/videos/${matched.filename}`
                console.log(`[Fuzzy Video Matcher]: Matched local video for restaurant ${restaurant.nome}: ${resolvedUrl}`)
              }
            }
          } catch (e) {
            console.error('Failed to query local videos API:', e)
          }
        }

        if (!active) return

        if (!resolvedUrl) {
          setVideoExists(false)
          setCheckingVideo(false)
          return
        }

        setCurrentVideoUrl(resolvedUrl)

        const response = await fetch(resolvedUrl, { method: 'HEAD' })
        if (active) {
          setVideoExists(response.ok)
        }
      } catch (err) {
        if (active) {
          setVideoExists(false)
        }
      } finally {
        if (active) {
          setCheckingVideo(false)
        }
      }
    }

    checkVideo()
    return () => {
      active = false
    }
  }, [video, restaurant.nome])

  // Fullscreen video control
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement === videoRef.current ||
                           (document as any).webkitFullscreenElement === videoRef.current
      if (!isFullscreen && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handlePlayVideo = () => {
    const videoEl = videoRef.current
    if (!videoEl) return

    videoEl.play().then(() => {
      setIsPlaying(true)
      if (videoEl.requestFullscreen) {
        videoEl.requestFullscreen()
      } else if ((videoEl as any).webkitRequestFullscreen) {
        (videoEl as any).webkitRequestFullscreen()
      } else if ((videoEl as any).msRequestFullscreen) {
        (videoEl as any).msRequestFullscreen()
      }
    }).catch(err => {
      console.error("Error playing video:", err)
    })
  }

  const toggleFaq = (idx: number) => {
    setFaqOpenIdx(faqOpenIdx === idx ? null : idx)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-24">
      {/* Header */}
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

      {/* Hero Section: Mobile-First Video Banner */}
      <section className="relative w-full bg-zinc-950 flex flex-col items-center justify-center py-6 md:py-10 border-b border-zinc-900 overflow-hidden">
        {/* Blurry Background */}
        <div className="absolute inset-0 z-0 opacity-20 filter blur-2xl scale-110 pointer-events-none">
          <img 
            src={video?.thumbnail_url || restaurant.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&h=600&q=80'} 
            className="w-full h-full object-cover" 
            alt="Blur bg" 
          />
        </div>

        {/* Video Player Container */}
        <div className="relative z-10 w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden border border-zinc-850 shadow-2xl bg-black/80">
          {checkingVideo ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
              <Film className="w-8 h-8 text-brand-gold animate-spin" />
              <span className="text-zinc-500 text-xs font-semibold">Carregando review...</span>
            </div>
          ) : videoExists ? (
            <div className="relative w-full h-full group">
              <video
                ref={videoRef}
                src={currentVideoUrl || video?.video_url || undefined}
                poster={video.thumbnail_url || restaurant.foto_capa_url}
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Play Overlay */}
              {!isPlaying && (
                <button 
                  onClick={handlePlayVideo}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black/40 hover:bg-black/20 transition-all duration-300 select-none group"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-gold text-black flex items-center justify-center shadow-2xl scale-95 group-hover:scale-105 transition-all duration-300 animate-pulse">
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-bold mt-4 tracking-wider uppercase drop-shadow-md bg-black/50 px-3 py-1 rounded-full border border-zinc-800">
                    Assistir Review 🎥
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img 
                src={restaurant.foto_capa_url || '/images/placeholder-restaurant.jpg'} 
                alt={restaurant.nome}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {/* Quick info over screen */}
        <div className="relative z-10 text-center mt-5 px-4 space-y-1.5">
          <div className="flex items-center justify-center space-x-2">
            <span className="px-2 py-0.5 bg-brand-gold text-black text-[10px] font-bold uppercase rounded tracking-wider">
              {restaurant.preco_medio}
            </span>
            <span className="text-xs text-zinc-300 font-semibold tracking-wider uppercase capitalize">
              {restaurant.tipo_cozinha}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif text-white tracking-tight leading-tight">
            {restaurant.nome}
          </h1>
          <p className="text-xs text-zinc-400 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-500" />
            {restaurant.bairro}, {restaurant.cidade}
          </p>
          <div className="pt-1.5 flex flex-col items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
              isOpen 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/25' 
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
            }`}>
              {isOpen ? '●' : '○'} {statusMessage}
            </span>
            
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-full border transition-all duration-300 ${
                  isFavorited
                    ? 'bg-brand-gold/20 border-brand-gold text-brand-gold scale-105 shadow-lg shadow-brand-gold/10'
                    : 'bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                title={isFavorited ? "Remover dos favoritos" : "Salvar nos favoritos"}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full border bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-300"
                title="Compartilhar indicação"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation (Sticky) */}
      <div className="sticky top-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 z-30">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none py-3.5 space-x-6">
          <button
            onClick={() => setActiveTab('indicacao')}
            className={`text-sm font-semibold tracking-wide shrink-0 pb-1 border-b-2 transition-all select-none ${
              activeTab === 'indicacao' 
                ? 'text-brand-gold border-brand-gold' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            ✨ Indicação
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`text-sm font-semibold tracking-wide shrink-0 pb-1 border-b-2 transition-all select-none ${
              activeTab === 'menu' 
                ? 'text-brand-gold border-brand-gold' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            📋 Cardápio
          </button>
          <button
            onClick={() => setActiveTab('informacoes')}
            className={`text-sm font-semibold tracking-wide shrink-0 pb-1 border-b-2 transition-all select-none ${
              activeTab === 'informacoes' 
                ? 'text-brand-gold border-brand-gold' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            📍 Info & Contato
          </button>
          <button
            onClick={() => setActiveTab('galeria')}
            className={`text-sm font-semibold tracking-wide shrink-0 pb-1 border-b-2 transition-all select-none ${
              activeTab === 'galeria' 
                ? 'text-brand-gold border-brand-gold' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            📸 Galeria
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`text-sm font-semibold tracking-wide shrink-0 pb-1 border-b-2 transition-all select-none ${
              activeTab === 'faq' 
                ? 'text-brand-gold border-brand-gold' 
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            ❓ Dúvidas
          </button>
        </div>
      </div>

      {/* Main Tabbed Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Tab 1: Indicação */}
        {activeTab === 'indicacao' && (
          <div className="space-y-6 animate-fadeIn">
            {influencer ? (
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
                {/* Influencer profile strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/80 pb-5">
                  <Link href={`/influencer/${influencer.slug}`} className="flex items-center space-x-3 group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-brand-gold transition-colors flex items-center justify-center">
                      {influencer.foto_url ? (
                        <img src={influencer.foto_url} alt={influencer.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-brand-gold uppercase font-serif">
                          {influencer.nome.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Curador do GuiaSP</h3>
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
                      className="inline-flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900"
                    >
                      <InstagramIcon className="w-4 h-4 text-brand-gold" />
                      <span>@{influencer.instagram_handle}</span>
                    </a>
                  )}
                </div>

                {/* Indicated Dish Spotlight */}
                {video?.prato_destaque && (
                  <div className="space-y-1">
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Prato Indicado</h4>
                    <p className="text-xl sm:text-2xl font-bold font-serif text-brand-gold flex items-center leading-snug">
                      <Sparkles className="w-5 h-5 mr-2 shrink-0 animate-pulse" />
                      {video.prato_destaque}
                    </p>
                  </div>
                )}

                {/* Transcript Quote */}
                {video?.transcricao && (
                  <div className="relative pl-6 py-2 border-l-2 border-brand-gold/60 space-y-4">
                    <Quote className="absolute -left-1 -top-3 w-8 h-8 text-brand-gold/10 pointer-events-none rotate-180" />
                    <p className="text-zinc-200 italic text-sm sm:text-base leading-relaxed">
                      &ldquo;{video.transcricao}&rdquo;
                    </p>
                    {video.url_original && (
                      <div className="pt-2">
                        <a
                          href={video.url_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-pink-700/20 hover:from-purple-800/80 hover:to-pink-800/80 rounded-full text-xs font-semibold text-white transition-all shadow-md"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                          <span>Ver Vídeo da Indicação</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Restaurant Description */}
                {restaurant.descricao && (
                  <div className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-900 pt-5 space-y-2">
                    <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Sobre a Experiência</h4>
                    <p>{restaurant.descricao}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-6 sm:p-8 text-center space-y-4">
                <h3 className="font-serif font-bold text-lg text-zinc-300">Sobre o Restaurante</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {restaurant.descricao || 'Nenhuma descrição detalhada disponível.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Menu */}
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Pratos Populares</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Itens altamente recomendados do cardápio oficial.</p>
              </div>
              <span className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-semibold font-serif">
                Média: {estimatedCost}
              </span>
            </div>

            <div className="space-y-4">
              {menuItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex space-x-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900 hover:border-brand-gold/10 transition-colors"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-900">
                    <img src={item.foto} alt={item.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-white font-serif">{item.nome}</h4>
                        <span className="text-sm font-extrabold text-brand-gold font-sans shrink-0">{item.preco}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-normal line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Informações */}
        {activeTab === 'informacoes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Actions Panel */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-serif font-bold text-white tracking-wide">Ações Rápidas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 bg-brand-gold hover:bg-brand-goldHover text-black text-sm font-bold rounded-xl transition-all shadow shadow-brand-gold/5"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Reservar Mesa via WhatsApp</span>
                </a>
                <a
                  href={contacts.deliveryUrl || "https://www.ifood.com.br"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:text-white text-sm font-semibold rounded-xl transition-all"
                >
                  <ShoppingBag className="w-4 h-4 shrink-0 text-brand-gold" />
                  <span>Pedir Delivery</span>
                </a>
              </div>
            </div>

            {/* Practical details list */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-bold font-serif text-white">Informações de Contato</h3>
              
              <div className="space-y-5 text-sm">
                {/* Horário */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-zinc-900 text-brand-gold shrink-0 border border-zinc-800">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold text-zinc-200">Horário de Funcionamento</p>
                    
                    {contacts.horarios_semana ? (
                      <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 mt-2 space-y-2 text-xs">
                        {(() => {
                          const daysMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
                          const daysPretty = {
                            segunda: "Segunda-feira",
                            terca: "Terça-feira",
                            quarta: "Quarta-feira",
                            quinta: "Quinta-feira",
                            sexta: "Sexta-feira",
                            sabado: "Sábado",
                            domingo: "Domingo"
                          };
                          const todayIndex = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })).getDay();
                          const todayName = daysMap[todayIndex];

                          return Object.keys(daysPretty).map((dayKey) => {
                            const config = (contacts as any).horarios_semana[dayKey];
                            const isToday = dayKey === todayName;
                            const label = (daysPretty as any)[dayKey];
                            
                            let hoursStr = "Fechado";
                            if (config?.aberto && config.turnos?.length > 0) {
                              hoursStr = config.turnos.map((t: any) => `${t.abertura} - ${t.fechamento}`).join(", ");
                            }

                            return (
                              <div
                                key={dayKey}
                                className={`flex justify-between items-center py-1 px-2 rounded-lg transition-colors ${
                                  isToday
                                    ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20 font-semibold"
                                    : "text-zinc-400 border border-transparent"
                                }`}
                              >
                                <span>{label}</span>
                                <span className={isToday ? "text-brand-gold font-bold" : config?.aberto ? "text-zinc-350" : "text-zinc-650"}>
                                  {hoursStr}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-xs">
                        Todos os dias: {restaurant.horario_abertura} - {restaurant.horario_fechamento}
                      </p>
                    )}

                    <p className="text-[10px] pt-1">
                      Status atual: <span className={isOpen ? 'text-emerald-400 font-bold' : 'text-zinc-500 font-bold'}>
                        {isOpen ? `● ${statusMessage}` : `○ ${statusMessage}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Telefone */}
                {contacts.telefone !== 'N/A' && (
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-zinc-900 text-brand-gold shrink-0 border border-zinc-800">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-zinc-200">Telefone / Fixo</p>
                      <a href={`tel:${contacts.telefone.replace(/\D/g, '')}`} className="text-zinc-450 hover:text-white transition-colors text-xs">
                        {contacts.telefone}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-zinc-900 text-brand-gold shrink-0 border border-zinc-800">
                    <WhatsAppIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-200">WhatsApp Oficial</p>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-450 hover:text-white transition-colors text-xs flex items-center">
                      Enviar Mensagem &rarr;
                    </a>
                  </div>
                </div>

                {/* Endereço */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-zinc-900 text-brand-gold shrink-0 border border-zinc-800">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-200">Localização</p>
                    <p className="text-zinc-400 text-xs leading-relaxed max-w-md">{contacts.endereco}</p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-gold hover:underline font-bold text-xs inline-block pt-1"
                    >
                      Abrir no Google Maps &rarr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Galeria */}
        {activeTab === 'galeria' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">Galeria de Fotos</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Conheça o salão e os pratos típicos da casa.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((img, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square rounded-2xl overflow-hidden border border-zinc-900 hover:border-brand-gold/20 transition-all duration-300 bg-zinc-950"
                >
                  <img 
                    src={img} 
                    alt={`Ambiente ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-103 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Dúvidas */}
        {activeTab === 'faq' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="text-xl font-bold font-serif text-white">Perguntas Frequentes</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Esclareça suas dúvidas rapidamente sobre o estabelecimento.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpenFaq = faqOpenIdx === idx
                return (
                  <div 
                    key={idx}
                    className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-serif font-bold text-zinc-200 hover:text-white transition-colors"
                    >
                      <span className="text-sm">{faq.q}</span>
                      {isOpenFaq ? (
                        <ChevronUp className="w-4 h-4 text-brand-gold shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 ml-2" />
                      )}
                    </button>
                    {isOpenFaq && (
                      <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/40 pt-3.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Carousel of same influencer items */}
        {influencer && otherRecommendations.length > 0 && (
          <section className="space-y-6 pt-10 border-t border-zinc-900 mt-12">
            <div className="space-y-1 flex justify-between items-baseline">
              <div>
                <h3 className="text-lg font-bold font-serif">Outras indicações de {influencer.nome}</h3>
                <p className="text-xs text-zinc-500">Mais restaurantes selecionados por este criador.</p>
              </div>
            </div>

            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-none">
              {otherRecommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/restaurante/${item.slug}`}
                  className="group flex-shrink-0 w-56 bg-zinc-900/20 border border-zinc-900/80 rounded-xl overflow-hidden hover:border-brand-gold/15 transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <img
                      src={item.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&h=200&q=80'}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>{item.tipo_cozinha}</span>
                      <span>{item.bairro}</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-300 group-hover:text-brand-gold transition-colors font-serif truncate">
                      {item.nome}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-gold text-black font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs border border-brand-gold/20 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 fill-current text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
