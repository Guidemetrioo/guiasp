import React from 'react'
import { notFound } from 'next/navigation'
import { createServer } from '@/lib/supabase-server'
import RestaurantDetailsView from '@/components/RestaurantDetailsView'

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
      video_url,
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
  const details = getRestaurantExtraDetails(restaurant.tipo_cozinha, restaurant.preco_medio)

  return (
    <RestaurantDetailsView
      restaurant={restaurant}
      video={video}
      influencer={influencer}
      otherRecommendations={otherRecommendations}
      menuItems={details.menuItems}
      gallery={details.gallery}
      estimatedCost={details.estimatedCost}
    />
  )
}
