import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase-server'
import { MapPin, Compass, Sparkles, Quote, Clock, Phone, DollarSign, Calendar, ShoppingBag, Film } from 'lucide-react'

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

const getRestaurantExtraDetails = (tipoCozinha: string | null | undefined, precoMedio: string | null | undefined) => {
  const normalized = (tipoCozinha || '').toLowerCase().trim();
  
  // Base details based on category
  let menuItems = [
    { nome: 'Prato Especial da Casa', desc: 'Ingredientes selecionados sob a receita tradicional do chef.', preco: 'R$ 68,00', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=300&q=80' },
    { nome: 'Entrada Clássica', desc: 'Combinação perfeita para abrir o apetite e compartilhar.', preco: 'R$ 32,00', foto: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&h=300&q=80' },
    { nome: 'Sobremesa Gourmet', desc: 'O toque doce ideal preparado na confeitaria própria.', preco: 'R$ 24,00', foto: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=300&q=80' }
  ];
  
  let gallery = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&h=400&q=80'
  ];

  let estimatedCost = 'R$ 80 - R$ 120 por pessoa';
  if (precoMedio === '$') estimatedCost = 'R$ 35 - R$ 60 por pessoa';
  else if (precoMedio === '$$') estimatedCost = 'R$ 70 - R$ 110 por pessoa';
  else if (precoMedio === '$$$') estimatedCost = 'R$ 125 - R$ 190 por pessoa';
  else if (precoMedio === '$$$$') estimatedCost = 'R$ 250 - R$ 380 por pessoa';

  if (normalized.includes('hamburguer') || normalized.includes('burguer')) {
    menuItems = [
      { nome: 'Premium Cheeseburger', desc: 'Blend bovino 150g, muito cheddar derretido e maionese especial da casa no pão brioche.', preco: 'R$ 39,00', foto: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Batatas Crocantes com Alecrim', desc: 'Porção individual de batatas rústicas com flor de sal e alecrim fresco.', preco: 'R$ 18,00', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Milkshake Double Chocolate', desc: 'Sorvete artesanal batido com calda trufada belga e chantilly.', preco: 'R$ 26,00', foto: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  } else if (normalized.includes('japones') || normalized.includes('sushi') || normalized.includes('ramen')) {
    menuItems = [
      { nome: 'Combo Premium (16 Peças)', desc: 'Seleção do sushiman contendo sushis de salmão, atum, polvo e ovas trufadas.', preco: 'R$ 98,00', foto: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Shoyu Ramen Especial', desc: 'Caldo de porco cozido por 12 horas, noodles artesanais, porchetta e ovo marinado.', preco: 'R$ 55,00', foto: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Ceviche Clássico', desc: 'Cubos de peixe branco marinados no limão siciliano com cebola roxa e coentro.', preco: 'R$ 42,00', foto: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  } else if (normalized.includes('italiano') || normalized.includes('pizza') || normalized.includes('massa')) {
    menuItems = [
      { nome: 'Gnocchi Trufado', desc: 'Massa artesanal recheada ao molho de queijos finos e raspas de trufas negras.', preco: 'R$ 72,00', foto: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Risotto al Limone e Camarão', desc: 'Risoto de limão siciliano perfeitamente cremoso com camarões grelhados.', preco: 'R$ 84,00', foto: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Bruschetta de Pomodoro', desc: 'Tomates frescos marinados no azeite de oliva e manjericão sobre focaccia tostada.', preco: 'R$ 29,00', foto: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1516100882582-76c9a886062e?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  } else if (normalized.includes('sobremesa') || normalized.includes('doce')) {
    menuItems = [
      { nome: 'Bolo de Chocolate Pecatto*', desc: 'A famosa fatia gigante de bolo de chocolate super molhadinho com calda e morangos.', preco: 'R$ 38,00', foto: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Taça Pecatto Supremo*', desc: 'Mix de sorvete de creme, creme de avelã, morangos frescos e raspas de chocolate belga.', preco: 'R$ 28,00', foto: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Waffle com Nutella e Ninho*', desc: 'Waffle quentinho crocante coberto com generosa camada de Nutella e leite em pó Ninho.', preco: 'R$ 26,00', foto: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  } else if (normalized.includes('saudavel') || normalized.includes('suplemento')) {
    menuItems = [
      { nome: 'Albumina Pura (420g)*', desc: 'Albumina premium de alta pureza ideal para recuperação e ganho muscular.', preco: 'R$ 34,90', foto: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Whey Protein Concentrado Dux (900g)*', desc: 'Whey protein com excelente perfil de aminoácidos e sabores deliciosos.', preco: 'R$ 149,00', foto: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Creatina Monohidratada Creapure (300g)*', desc: 'Creatina de alto rendimento para força e explosão muscular nos treinos.', preco: 'R$ 89,00', foto: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  } else if (normalized.includes('brunch') || normalized.includes('cafe')) {
    menuItems = [
      { nome: 'Eggs Benedict do Chef', desc: 'Ovos pochê perfeitos, presunto parma e molho holandês sobre brioche tostado.', preco: 'R$ 38,00', foto: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Panquecas Americanas com Redução', desc: 'Panquecas fofinhas servidas com calda de frutas vermelhas e chantilly fresco.', preco: 'R$ 32,00', foto: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=300&h=300&q=80' },
      { nome: 'Cold Brew Macchiato', desc: 'Café extraído a frio batido com leite cremoso e um toque sutil de caramelo.', preco: 'R$ 16,00', foto: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&h=300&q=80' }
    ];
    gallery = [
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&h=400&q=80'
    ];
  }

  return { menuItems, gallery, estimatedCost };
}

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
        .filter((r: any) => r !== null)
    }
  }

  const heroImage = video?.thumbnail_url || restaurant.foto_capa_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&h=600&q=80'
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.nome} ${restaurant.bairro} São Paulo`)}`
  const instagramUrl = `https://instagram.com/${restaurant.instagram_handle}`

  const details = getRestaurantExtraDetails(restaurant.tipo_cozinha, restaurant.preco_medio)

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-brand-gold selection:text-black font-sans pb-20">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10 z-10 space-y-4">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-12 animate-fadeIn">
          {/* Indication section */}
          {influencer ? (
            <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
                <Link href={`/influencer/${influencer.slug}`} className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-brand-gold transition-colors flex items-center justify-center">
                    {renderAvatar(influencer.foto_url, influencer.nome, "text-sm")}
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
                <div className="relative pl-6 py-1 border-l-2 border-brand-gold space-y-4">
                  <Quote className="absolute -left-1 -top-3 w-8 h-8 text-brand-gold/10 pointer-events-none rotate-180" />
                  <p className="text-zinc-300 italic text-base leading-relaxed">
                    &ldquo;{video.transcricao}&rdquo;
                  </p>
                  {video.url_original && (
                    <div className="pt-2">
                      <a
                        href={video.url_original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-900 to-pink-900 border border-pink-700/30 hover:from-purple-800 hover:to-pink-800 rounded-full text-xs font-semibold text-white transition-all shadow-md"
                      >
                        <InstagramIcon className="w-4 h-4 text-white" />
                        <span>Ver Vídeo Original da Indicação</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Local Video player for Navegando SP reviews */}
              {['pantchos-house-burger', 'stunt-burger', 'santomar-restaurante', 'outlet-do-suplemento', 'pecatto-bar-restaurante', 'pizzaria-vero-paradiso', 'casa-na-praia-bar', 'hao-sushi-itaim', 'arabia-night-paulista', 'busger', 'villa-e-prosa', 'o-mineiro-prime', 'costelao-atibaia', 'legado-parrilla'].includes(restaurant.slug) && (
                <div className="mt-6 border border-zinc-850 rounded-2xl overflow-hidden bg-black/50 backdrop-blur-md max-w-xs mx-auto shadow-2xl border-brand-gold/10">
                  <div className="px-4 py-2 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 flex items-center">
                      <Film className="w-3.5 h-3.5 mr-1.5 text-brand-gold" />
                      Review em Vídeo
                    </span>
                  </div>
                  <video
                    src={`/videos/${restaurant.slug}.mp4`}
                    poster={restaurant.foto_capa_url || `/images/${restaurant.slug}.jpg`}
                    controls
                    playsInline
                    className="w-full aspect-[9/16] object-cover h-[480px]"
                  />
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

          {/* Cardápio de Destaques */}
          <section className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 space-y-6">
            <div className="border-b border-zinc-900/80 pb-4">
              <h3 className="text-2xl font-bold font-serif text-white">Cardápio de Destaques</h3>
              <p className="text-xs text-zinc-500 mt-1">Pratos populares e recomendados pela curadoria da casa.</p>
            </div>
            <div className="space-y-4">
              {details.menuItems.map((item, idx) => (
                <div key={idx} className="flex space-x-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-900/60 hover:border-brand-gold/15 transition-colors">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-zinc-900">
                    <img src={item.foto} alt={item.nome} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-white font-serif">{item.nome}</h4>
                        <span className="text-sm font-bold text-brand-gold font-sans shrink-0">{item.preco}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Galeria de Fotos */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-white">Galeria do Restaurante</h3>
              <p className="text-xs text-zinc-500">Conheça o salão e a atmosfera da casa.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {details.gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-zinc-900/80 hover:border-brand-gold/20 transition-all duration-300">
                  <img src={img} alt={`Ambiente ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
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

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Action CTAs */}
          <section className="bg-zinc-900/40 border border-zinc-900/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-serif font-bold text-white tracking-wide">Ações Rápidas</h3>
            <a
              href={`https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20reservar%20uma%20mesa%20no%20${encodeURIComponent(restaurant.nome)}%20indicado%20pelo%20GuiaSP.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 bg-brand-gold hover:bg-brand-goldHover text-black text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-gold/10 w-full"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Mesa</span>
            </a>
            <a
              href="https://www.ifood.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:text-white text-sm font-semibold rounded-xl transition-all w-full"
            >
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <span>Pedir Delivery</span>
            </a>
          </section>

          {/* Média de Gastos Card */}
          <section className="bg-zinc-900/40 border border-zinc-900/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center">
              <DollarSign className="w-4.5 h-4.5 mr-1 text-brand-gold" />
              Média de Gastos
            </h3>
            <div className="space-y-2">
              <p className="text-xl font-bold font-serif text-white">{details.estimatedCost}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Estimativa calculada com base na categoria e faixa de preço indicada pelo influencer parceiro.
              </p>
            </div>
          </section>

          {/* Informações Práticas Card */}
          <section className="bg-zinc-900/40 border border-zinc-900/80 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Informações Práticas</h3>
            <div className="space-y-4 text-xs text-zinc-350">
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Horário de Funcionamento</p>
                  <p className="text-zinc-400">Terça a Quinta: 12h - 23h</p>
                  <p className="text-zinc-400">Sexta e Sábado: 12h - 00h</p>
                  <p className="text-zinc-400">Domingo: 12h - 22h</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Contato / WhatsApp</p>
                  <a href="tel:+5511999999999" className="text-zinc-400 hover:text-white transition-colors">(11) 99999-9999</a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-brand-gold mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Localização</p>
                  <p className="text-zinc-400">{restaurant.bairro}, {restaurant.cidade}</p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold hover:underline font-semibold inline-block pt-1"
                  >
                    Abrir no Google Maps &rarr;
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
