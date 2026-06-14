// Mock Supabase Database Client for offline development
// This allows the entire website to function out-of-the-box without database credentials!

const mockInfluencers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Navegando SP',
    slug: 'navegando-sp',
    bio: 'Encontramos os melhores pontos gastronômicos e passeios de São Paulo. Dicas diárias e sinceras.',
    instagram_handle: 'navegandosp',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    nome: 'Guia por SP',
    slug: 'guia-por-sp',
    bio: 'O seu roteiro definitivo da capital paulista. De botecos clássicos a alta gastronomia refinada.',
    instagram_handle: 'guiaporsp',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    nome: 'São Paulo Dicas',
    slug: 'sp-dicas',
    bio: 'Descubra São Paulo com a gente. Restaurantes, cafeterias, rooftops e segredos escondidos pela cidade.',
    instagram_handle: 'spdicas',
    foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
  },
]

const mockRestaurantes = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    nome: 'Borger Hamburgueria',
    slug: 'borger-hamburgueria',
    descricao: 'Hamburgueria moderna em Pinheiros famosa pelos smash burgers fininhos, crocantes e muito cheddar.',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'hamburguer',
    preco_medio: '$$',
    instagram_handle: 'borger',
    foto_capa_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r2222222-2222-2222-2222-222222222222',
    nome: 'Shin-Zushi',
    slug: 'shin-zushi',
    descricao: 'Tradicional sushi-bar japonês no Paraíso, focado em omakase premium preparado por chefs renomados.',
    bairro: 'Paraíso',
    cidade: 'São Paulo',
    tipo_cozinha: 'japones',
    preco_medio: '$$$',
    instagram_handle: 'shinzushi',
    foto_capa_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r3333333-3333-3333-3333-333333333333',
    nome: 'Vicolo Nostro',
    slug: 'vicolo-nostro',
    descricao: 'Ambiente romântico de vila italiana no Brooklin servindo risotos trufados, gnocchi artesanal e vinhos.',
    bairro: 'Brooklin',
    cidade: 'São Paulo',
    tipo_cozinha: 'italiano',
    preco_medio: '$$$',
    instagram_handle: 'vicolonostro',
    foto_capa_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r4444444-4444-4444-4444-444444444444',
    nome: 'HM Food Cafe',
    slug: 'hm-food-cafe',
    descricao: 'Espaço descolado em Pinheiros perfeito para brunch no final de semana, com panquecas americanas e cafés especiais.',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'brunch',
    preco_medio: '$$',
    instagram_handle: 'hmfoodcafe',
    foto_capa_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r5555555-5555-5555-5555-555555555555',
    nome: 'Taqueria La Sabrosa',
    slug: 'taqueria-la-sabrosa',
    descricao: 'Autêntica taqueria mexicana de rua no Baixo Augusta com tacos econômicos e margaritas refrescantes.',
    bairro: 'Augusta',
    cidade: 'São Paulo',
    tipo_cozinha: 'mexicano',
    preco_medio: '$',
    instagram_handle: 'lasabrosataqueria',
    foto_capa_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r6666666-6666-6666-6666-666666666666',
    nome: 'Rufinos',
    slug: 'rufinos-restaurante',
    descricao: 'Tradicional especializado em frutos do mar e peixes grelhados, no Itaim Bibi.',
    bairro: 'Itaim Bibi',
    cidade: 'São Paulo',
    tipo_cozinha: 'frutos do mar',
    preco_medio: '$$$',
    instagram_handle: 'rufinos_restaurante',
    foto_capa_url: 'https://images.unsplash.com/photo-1534080391025-097b03b7738c?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
]

const mockVideos = [
  {
    id: 'v1111111-1111-1111-1111-111111111111',
    restaurante_id: 'r1111111-1111-1111-1111-111111111111',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'O melhor smash burger com cheddar derretido!',
    url_original: 'https://www.instagram.com/p/DB12345/',
    transcricao: 'Gente, hoje eu vim no Borger Hamburgueria em Pinheiros provar o smash burger com queijo cheddar deles. É um smash duplo super crocante com piscina de queijo cheddar derretido por cima. É simplesmente sensacional!',
    resumo: 'Avaliação do incrível smash burger com queijo cheddar derretido, super crocante e saboroso.',
    palavras_chave: ['smash burger', 'cheddar', 'hamburguer', 'pinheiros'],
    prato_destaque: 'Smash Burger com Cheddar',
    thumbnail_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v2222222-2222-2222-2222-222222222222',
    restaurante_id: 'r2222222-2222-2222-2222-222222222222',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    titulo: 'Omakase tradicional e peixes frescos espetaculares no Paraíso',
    url_original: 'https://www.instagram.com/p/DC67890/',
    transcricao: 'Fala galera, hoje o Guia por SP está no Shin-Zushi no Paraíso para uma experiência de omakase tradicional espetacular. O sushiman prepara os nigiris na hora, o peixe é fresquíssimo e a qualidade é incomparável. Vale cada centavo!',
    resumo: 'Uma autêntica experiência de omakase tradicional no bairro do Paraíso com peixes frescos preparados na hora.',
    palavras_chave: ['omakase', 'sushi', 'japones', 'paraiso', 'nigiri'],
    prato_destaque: 'Omakase Tradicional',
    thumbnail_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v3333333-3333-3333-3333-333333333333',
    restaurante_id: 'r3333333-3333-3333-3333-333333333333',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'Vila italiana super romântica secreta no Brooklin',
    url_original: 'https://www.instagram.com/p/DD11121/',
    transcricao: 'Procurando um lugar romântico em SP? Hoje viemos no Vicolo Nostro no Brooklin. Uma vila italiana linda, super aconchegante. Pedimos o risoto de funghi trufado e o gnocchi que derrete na boca. É o lugar perfeito para um encontro!',
    resumo: 'Restaurante com ambiente charmoso de vila italiana servindo risotos trufados e massas artesanais impecáveis.',
    palavras_chave: ['italiano', 'risoto', 'trufado', 'romantico', 'brooklin'],
    prato_destaque: 'Risoto de Funghi Trufado',
    thumbnail_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v4444444-4444-4444-4444-444444444444',
    restaurante_id: 'r4444444-4444-4444-4444-444444444444',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'O brunch mais charmoso e completo de Pinheiros',
    url_original: 'https://www.instagram.com/p/DE31415/',
    transcricao: 'Bom dia pessoal! Hoje vim tomar brunch no HM Food Cafe em Pinheiros. Pedimos o combo de ovos mexidos com bacon no pão de fermentação natural e panquecas com calda de frutas vermelhas. O café coado deles também é sensacional.',
    resumo: 'Brunch de alta qualidade com panquecas americanas e ovos mexidos servidos em um espaço moderno e acolhedor.',
    palavras_chave: ['brunch', 'panqueca', 'ovos', 'cafe', 'pinheiros'],
    prato_destaque: 'Ovos Mexidos com Bacon e Panquecas',
    thumbnail_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
  },
]

const mockPlanos = [
  {
    id: 'p1',
    restaurante_id: 'r1111111-1111-1111-1111-111111111111',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 800.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p2',
    restaurante_id: 'r2222222-2222-2222-2222-222222222222',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    status: 'ativo',
    valor_mensal: 1500.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p3',
    restaurante_id: 'r3333333-3333-3333-3333-333333333333',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    status: 'ativo',
    valor_mensal: 1200.0,
    inicio_em: new Date().toISOString(),
  },
]

export function createMockSupabaseClient() {
  const queryResult = (data: any) => ({
    data,
    error: null,
    count: data ? (Array.isArray(data) ? data.length : 1) : 0,
    select: () => queryResult(data),
    single: () => ({ data: Array.isArray(data) ? data[0] : data, error: null }),
    maybeSingle: () => ({ data: Array.isArray(data) ? data[0] || null : data, error: null }),
    eq: (col: string, val: any) => {
      let filtered = data
      if (Array.isArray(data)) {
        if (col === 'slug') {
          filtered = data.filter((x) => x.slug === val)
        } else if (col === 'id') {
          filtered = data.filter((x) => x.id === val)
        } else if (col === 'influencer_id') {
          filtered = data.filter((x) => x.influencer_id === val)
        } else if (col === 'restaurante_id') {
          filtered = data.filter((x) => x.restaurante_id === val)
        } else if (col === 'status') {
          filtered = data.filter((x) => x.status === val)
        }
      }
      return queryResult(filtered)
    },
    neq: (col: string, val: any) => {
      let filtered = data
      if (Array.isArray(data)) {
        if (col === 'restaurante_id') {
          filtered = data.filter((x) => x.restaurante_id !== val)
        }
      }
      return queryResult(filtered)
    },
    order: () => queryResult(data),
    limit: (l: number) => {
      const limited = Array.isArray(data) ? data.slice(0, l) : data
      return queryResult(limited)
    },
    insert: (insertData: any) => {
      return queryResult(insertData)
    },
    update: (updateData: any) => {
      return queryResult(updateData)
    },
  })

  return {
    from: (table: string) => {
      if (table === 'influencers') {
        return queryResult(mockInfluencers)
      }
      if (table === 'restaurantes') {
        return queryResult(mockRestaurantes)
      }
      if (table === 'videos') {
        // Mock join structures if loaded dynamically
        const enrichedVideos = mockVideos.map((v) => {
          const restObj = mockRestaurantes.find((r) => r.id === v.restaurante_id)
          const infObj = mockInfluencers.find((i) => i.id === v.influencer_id)
          return {
            ...v,
            restaurantes: restObj,
            influencers: infObj,
          }
        })
        return queryResult(enrichedVideos)
      }
      if (table === 'planos') {
        const enrichedPlans = mockPlanos.map((p) => {
          const restObj = mockRestaurantes.find((r) => r.id === p.restaurante_id)
          const infObj = mockInfluencers.find((i) => i.id === p.influencer_id)
          return {
            ...p,
            restaurantes: restObj,
            influencers: infObj,
          }
        })
        return queryResult(enrichedPlans)
      }
      return queryResult([])
    },
    rpc: (fn: string, args: any) => {
      if (fn === 'buscar_restaurantes') {
        const queryTerm = (args.p_q || '').toLowerCase().trim()
        const cuisineFilter = args.p_tipo
        const influencerFilter = args.p_influencer_id
        const neighborhoodFilter = args.p_bairro
        const priceFilter = args.p_preco

        const results = mockRestaurantes
          .filter((r) => {
            // Apply text query matching
            if (queryTerm) {
              const video = mockVideos.find((v) => v.restaurante_id === r.id)
              const nameMatch = r.nome.toLowerCase().includes(queryTerm)
              const descMatch = r.descricao.toLowerCase().includes(queryTerm)
              const neighborhoodMatch = r.bairro.toLowerCase().includes(queryTerm)
              const cuisineMatch = r.tipo_cozinha.toLowerCase().includes(queryTerm)
              const transcriptMatch = video?.transcricao?.toLowerCase().includes(queryTerm) || false
              const dishMatch = video?.prato_destaque?.toLowerCase().includes(queryTerm) || false
              const keywordMatch = video?.palavras_chave?.some((t) => t.toLowerCase().includes(queryTerm)) || false

              if (
                !nameMatch &&
                !descMatch &&
                !neighborhoodMatch &&
                !cuisineMatch &&
                !transcriptMatch &&
                !dishMatch &&
                !keywordMatch
              ) {
                return false
              }
            }

            // Apply specific filters
            if (cuisineFilter && r.tipo_cozinha !== cuisineFilter) return false
            if (neighborhoodFilter && r.bairro !== neighborhoodFilter) return false
            if (priceFilter && r.preco_medio !== priceFilter) return false

            if (influencerFilter) {
              const video = mockVideos.find((v) => v.restaurante_id === r.id)
              if (!video || video.influencer_id !== influencerFilter) return false
            }

            return true
          })
          .map((r) => {
            const video = mockVideos.find((v) => v.restaurante_id === r.id)
            const influencer = mockInfluencers.find((i) => i.id === video?.influencer_id)
            return {
              id: r.id,
              nome: r.nome,
              slug: r.slug,
              bairro: r.bairro,
              tipo_cozinha: r.tipo_cozinha,
              preco_medio: r.preco_medio,
              foto_capa_url: r.foto_capa_url,
              prato_destaque: video?.prato_destaque || null,
              palavras_chave: video?.palavras_chave || [],
              thumbnail_url: video?.thumbnail_url || null,
              influencer_nome: influencer?.nome || null,
              influencer_foto: influencer?.foto_url || null,
              influencer_slug: influencer?.slug || null,
            }
          })

        return { data: results, error: null }
      }
      return { data: [], error: null }
    },
    auth: {
      getUser: async () => {
        // Return dummy authenticated user in development
        return {
          data: {
            user: {
              id: 'admin-user-id',
              email: 'admin@eathub.com.br',
            },
          },
          error: null,
        }
      },
      signOut: async () => ({ error: null }),
      signInWithOtp: async () => ({ data: {}, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null }),
        getPublicUrl: (filePath: string) => ({
          data: {
            publicUrl: filePath.startsWith('restaurantes')
              ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&h=600&q=80'
              : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
          },
        }),
      }),
    },
  }
}
