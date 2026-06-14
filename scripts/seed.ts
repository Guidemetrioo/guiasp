import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach((line) => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const val = parts.slice(1).join('=').trim()
        if (key && val) {
          process.env[key] = val
        }
      }
    })
  }
}

async function runSeed() {
  console.log('🔄 Iniciando processo de seed do banco de dados eat.hub...')
  
  loadEnv()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for seed bypasses RLS

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // 1. Limpar dados anteriores para evitar duplicados
  console.log('🧹 Limpando dados antigos das tabelas...')
  await supabase.from('planos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('videos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('restaurantes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('influencers').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // 2. Criar Influencers
  console.log('👤 Criando influencers embaixadores...')
  const influencersData = [
    {
      nome: 'Navegando SP',
      slug: 'navegando-sp',
      bio: 'Encontramos os melhores pontos gastronômicos e passeios de São Paulo. Dicas diárias e sinceras.',
      instagram_handle: 'navegandosp',
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      nome: 'Guia por SP',
      slug: 'guia-por-sp',
      bio: 'O seu roteiro definitivo da capital paulista. De botecos clássicos a alta gastronomia refinada.',
      instagram_handle: 'guiaporsp',
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      nome: 'São Paulo Dicas',
      slug: 'sp-dicas',
      bio: 'Descubra São Paulo com a gente. Restaurantes, cafeterias, rooftops e segredos escondidos pela cidade.',
      instagram_handle: 'spdicas',
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
    },
    {
      nome: 'Perambulando em SP',
      slug: 'perambulando-em-sp',
      bio: 'Explorando as melhores dicas de gastronomia, passeios, viagens e achados imperdíveis em São Paulo. O seu guia para perambular pela capital!',
      instagram_handle: 'perambulandoemsp',
      foto_url: '/images/perambulando-em-sp-profile.jpg',
    },
    {
      nome: 'Esquenta SP',
      slug: 'esquenta-sp',
      bio: 'Dicas diárias das melhores experiências gastronômicas, rodízios, promoções e achados imperdíveis por toda São Paulo!',
      instagram_handle: 'esquentasp',
      foto_url: '/images/esquenta-sp-profile.jpg',
    },
  ]

  const { data: influencers, error: infError } = await supabase
    .from('influencers')
    .insert(influencersData)
    .select()

  if (infError || !influencers) {
    console.error('❌ Erro ao criar influencers:', infError?.message)
    process.exit(1)
  }
  console.log('✅ Influencers criados com sucesso!')

  // 3. Criar Restaurantes
  console.log('🍔 Criando restaurantes...')
  const restaurantesData = [
    {
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
    {
      nome: 'Pizzaria Vero Paradiso',
      slug: 'pizzaria-vero-paradiso',
      descricao: 'Tradicional pizzaria no Paraíso famosa pelo rodízio com mais de 50 sabores e um excelente custo-benefício, com opções de pacotes de bebidas à vontade.',
      bairro: 'Paraíso',
      cidade: 'São Paulo',
      tipo_cozinha: 'italiano',
      preco_medio: '$$',
      instagram_handle: 'pizzariaveroparadiso',
      foto_capa_url: '/images/pizzaria-vero-paradiso.jpg',
      ativo: true,
    },
    {
      nome: 'Casa na Praia Bar',
      slug: 'casa-na-praia-bar',
      descricao: 'Bar e restaurante aconchegante na Vila Mariana com ambiente descontraído, conhecido pelo tradicional festival de caldos servidos com diversos acompanhamentos e ótimas opções de porções.',
      bairro: 'Vila Mariana',
      cidade: 'São Paulo',
      tipo_cozinha: 'brunch',
      preco_medio: '$$',
      instagram_handle: 'casanapraiabar',
      foto_capa_url: '/images/casa-na-praia-bar.jpg',
      ativo: true,
    },
    {
      nome: 'Hao Sushi Itaim',
      slug: 'hao-sushi-itaim',
      descricao: 'Espaço moderno na Vila Nova Conceição/Itaim focado em buffet japonês completo com mais de 100 opções frias e quentes, com bebidas (sucos, refrigerantes, sodas italianas) e sobremesas inclusas no valor fixo.',
      bairro: 'Vila Nova Conceição',
      cidade: 'São Paulo',
      tipo_cozinha: 'japones',
      preco_medio: '$$$',
      instagram_handle: 'hao.sushi.itaim',
      foto_capa_url: '/images/hao-sushi-itaim.jpg',
      ativo: true,
    },
    {
      nome: 'Arábia Night Paulista',
      slug: 'arabia-night-paulista',
      descricao: 'Loja boutique e perfumaria no Market Paulista especializada nos perfumes árabes importados mais desejados e virais da internet, oferecendo fragrâncias exclusivas e preços imbatíveis.',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      tipo_cozinha: 'perfumaria',
      preco_medio: '$$',
      instagram_handle: 'arabianightpaulista',
      foto_capa_url: '/images/arabia-night-paulista.jpg',
      ativo: true,
    },
    {
      nome: 'Busger',
      slug: 'busger',
      descricao: 'Hamburgueria descolada operando de dentro de um ônibus americano antigo, famosa pelo xis prensadão gigante e lanches super recheados.',
      bairro: 'Santo Amaro',
      cidade: 'São Paulo',
      tipo_cozinha: 'hamburguer',
      preco_medio: '$$',
      instagram_handle: 'busger',
      foto_capa_url: '/images/busger.jpg',
      ativo: true,
    },
    {
      nome: 'Villa e Prosa',
      slug: 'villa-e-prosa',
      descricao: 'Restaurante acolhedor na Vila Mariana especializado em comida caseira brasileira, famoso pela gigantesca cubana de peixe que serve a família inteira.',
      bairro: 'Vila Mariana',
      cidade: 'São Paulo',
      tipo_cozinha: 'brasileira',
      preco_medio: '$$',
      instagram_handle: 'villaeprosa',
      foto_capa_url: '/images/villa-e-prosa.jpg',
      ativo: true,
    },
    {
      nome: 'O Mineiro Prime',
      slug: 'o-mineiro-prime',
      descricao: 'Restaurante de comida tipicamente mineira no centro de SP, célebre pelo joelho de porco crocante e pururucado servido com acompanhamentos tradicionais fartos.',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      tipo_cozinha: 'brasileira',
      preco_medio: '$$',
      instagram_handle: 'omineiroprime',
      foto_capa_url: '/images/o-mineiro-prime.jpg',
      ativo: true,
    },
    {
      nome: 'Costelão Atibaia',
      slug: 'costelao-atibaia',
      descricao: 'Churrascaria de estrada rústica imperdível conhecida pelo rodízio de costela fogo de chão e picanha fatiada servidos à vontade a um preço fixo imbatível.',
      bairro: 'Atibaia',
      cidade: 'Atibaia',
      tipo_cozinha: 'churrasco',
      preco_medio: '$$',
      instagram_handle: 'costelaoatibaia',
      foto_capa_url: '/images/costelao-atibaia.jpg',
      ativo: true,
    },
    {
      nome: 'Legado Parrilla',
      slug: 'legado-parrilla',
      descricao: 'Restaurante elegante de grelhados e massas no Anália Franco, famoso pelo espaguete flambado no conhaque e finalizado dentro de uma enorme peça de queijo provolone.',
      bairro: 'Anália Franco',
      cidade: 'São Paulo',
      tipo_cozinha: 'italiano',
      preco_medio: '$$$',
      instagram_handle: 'legadoparrilla',
      foto_capa_url: '/images/legado-parrilla.jpg',
      ativo: true,
    },
  ]

  const { data: restaurantes, error: restError } = await supabase
    .from('restaurantes')
    .insert(restaurantesData)
    .select()

  if (restError || !restaurantes) {
    console.error('❌ Erro ao criar restaurantes:', restError?.message)
    process.exit(1)
  }
  console.log('✅ Restaurantes criados com sucesso!')

  // Obter IDs criados
  const mapInfluencer = (slug: string) => influencers.find((i) => i.slug === slug)?.id
  const mapRestaurante = (slug: string) => restaurantes.find((r) => r.slug === slug)?.id

  // 4. Criar Planos de Assinatura (3 planos ativos)
  console.log('💳 Vinculando planos de parceria...')
  const planosData = [
    {
      restaurante_id: mapRestaurante('borger-hamburgueria'),
      influencer_id: mapInfluencer('navegando-sp'),
      status: 'ativo',
      valor_mensal: 800.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('shin-zushi'),
      influencer_id: mapInfluencer('guia-por-sp'),
      status: 'ativo',
      valor_mensal: 1500.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('vicolo-nostro'),
      influencer_id: mapInfluencer('sp-dicas'),
      status: 'ativo',
      valor_mensal: 1200.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('pizzaria-vero-paradiso'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      status: 'ativo',
      valor_mensal: 1000.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('casa-na-praia-bar'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      status: 'ativo',
      valor_mensal: 1200.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('hao-sushi-itaim'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      status: 'ativo',
      valor_mensal: 1500.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('arabia-night-paulista'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      status: 'ativo',
      valor_mensal: 800.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('busger'),
      influencer_id: mapInfluencer('esquenta-sp'),
      status: 'ativo',
      valor_mensal: 1000.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('villa-e-prosa'),
      influencer_id: mapInfluencer('esquenta-sp'),
      status: 'ativo',
      valor_mensal: 1200.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('o-mineiro-prime'),
      influencer_id: mapInfluencer('esquenta-sp'),
      status: 'ativo',
      valor_mensal: 1100.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('costelao-atibaia'),
      influencer_id: mapInfluencer('esquenta-sp'),
      status: 'ativo',
      valor_mensal: 1500.0,
      inicio_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('legado-parrilla'),
      influencer_id: mapInfluencer('esquenta-sp'),
      status: 'ativo',
      valor_mensal: 1300.0,
      inicio_em: new Date().toISOString(),
    },
  ]

  const { error: planError } = await supabase.from('planos').insert(planosData)
  if (planError) {
    console.error('❌ Erro ao criar planos:', planError.message)
    process.exit(1)
  }
  console.log('✅ Planos criados com sucesso!')

  // 5. Criar Vídeos com transcrições
  console.log('📹 Criando vídeos transcritos...')
  const videosData = [
    {
      restaurante_id: mapRestaurante('borger-hamburgueria'),
      influencer_id: mapInfluencer('navegando-sp'),
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
      restaurante_id: mapRestaurante('shin-zushi'),
      influencer_id: mapInfluencer('guia-por-sp'),
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
      restaurante_id: mapRestaurante('vicolo-nostro'),
      influencer_id: mapInfluencer('sp-dicas'),
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
      restaurante_id: mapRestaurante('hm-food-cafe'),
      influencer_id: mapInfluencer('navegando-sp'),
      titulo: 'O brunch mais charmoso e completo de Pinheiros',
      url_original: 'https://www.instagram.com/p/DE31415/',
      transcricao: 'Bom dia pessoal! Hoje vim tomar brunch no HM Food Cafe em Pinheiros. Pedimos o combo de ovos mexidos com bacon no pão de fermentação natural e panquecas com calda de frutas vermelhas. O café coado deles também é sensacional.',
      resumo: 'Brunch de alta qualidade com panquecas americanas e ovos mexidos servidos em um espaço moderno e acolhedor.',
      palavras_chave: ['brunch', 'panqueca', 'ovos', 'cafe', 'pinheiros'],
      prato_destaque: 'Ovos Mexidos com Bacon e Panquecas',
      thumbnail_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&h=300&q=80',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('pizzaria-vero-paradiso'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      titulo: 'O rodízio de pizza com melhor custo-benefício do Paraíso! 🍕😍',
      url_original: 'https://www.instagram.com/reel/DPUmuyOCYrt/',
      transcricao: 'RODÍZIO DE PIZZA MAIS BARATO DE SP! Fomos perambular na @pizzariaveroparadiso que além da qualidade tem mais de 50 sabores no seu rodízio! Valores: Domingo a quinta - R$49,90. Sexta e sábado - R$59,90. E por mais R$80 você pega pacote completo com cerveja e caipirinha à vontade! CURTIU? Já marca alguém pra ir com você! 🍕 @pizzariaveroparadiso 📍 Rua Tutóia, 194 - Paraíso, SP ☎️ (11) 3884-3646',
      resumo: 'Rodízio de pizza com mais de 50 sabores no bairro do Paraíso, com preços de R$49,90 (domingo a quinta) e R$59,90 (sexta e sábado), com opção de bebida à vontade.',
      palavras_chave: ['pizza', 'rodizio de pizza', 'paraiso', 'cerveja', 'caipirinha'],
      prato_destaque: 'Rodízio de Pizza (50+ sabores)',
      thumbnail_url: '/images/pizzaria-vero-paradiso.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('casa-na-praia-bar'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      titulo: 'Festival de caldos completo por apenas R$ 49,90! 🍲🤤',
      url_original: 'https://www.instagram.com/reel/DYVXBL4BTtF/',
      transcricao: 'FESTIVAL DE CALDOS POR 💲49,90 🍲🤤 Perambulamos no @casanapraiabar , pra conferir esse festival que por esse preço tá praticamente de graça ❤️ Além de ter várias opções de caldos tem diversos acompanhamentos, tudo completamente a vontade 🤩 ⏰HORÁRIOS - Todos os dias das 18h até 23h Curtiu ?? Marca alguém pra ir com você 🔥🔥 📍Rua Doutor Amâncio de Carvalho, 329 - Vila Mariana Sp',
      resumo: 'Festival de caldos completo por R$49,90 à vontade, com várias opções de sopas e caldos e acompanhamentos inclusos na Vila Mariana.',
      palavras_chave: ['festival de caldos', 'caldos', 'sopa', 'vila mariana', 'bar'],
      prato_destaque: 'Festival de Caldos',
      thumbnail_url: '/images/casa-na-praia-bar.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('hao-sushi-itaim'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      titulo: 'MUITO BARATO: Rodízio Japonês com Bebidas e Sobremesas inclusas! 🍱🥤',
      url_original: 'https://www.instagram.com/reel/DLyBK2iJo3-/',
      transcricao: 'MUITO BARATO @hao.sushi.itaim • 🍱 + de 100 opções entre pratos quentes e frios • 🥤 Bebidas inclusas: refrigerante, suco natural, água com e sem gás + sodas italianas • 🍨 Sobremesas inclusas: sorvetes variados, petit gateau (para o casal) e hot roll doce 💰 Valores: • Almoço (seg a sex): R$ 89,90 • Jantar / finais de semana e feriados: R$ 119,90 ⏰ Horários: • Seg a sex: 12h às 15h | após 19h • Sáb, dom e feriados: 12h às 16h | após 19h 📍 Unidade Itaim Rua João Cachoeira, 1556 – Vila Nova Conceição',
      resumo: 'Rodízio japonês com mais de 100 opções, refrigerantes, sucos e sodas italianas inclusos, além de sobremesas como petit gateau e hot roll doce no Itaim Bibi.',
      palavras_chave: ['rodizio japones', 'sushi', 'hao sushi', 'itaim bibi', 'bebida inclusa', 'sobremesa inclusa'],
      prato_destaque: 'Rodízio Japonês Premium',
      thumbnail_url: '/images/hao-sushi-itaim.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('arabia-night-paulista'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      titulo: 'Encontramos a fonte dos Perfumes Árabes mais desejados em SP! 😍🔥',
      url_original: 'https://www.instagram.com/p/DWCqu1REXDS/',
      transcricao: 'A FONTE DOS PERFUMES ÁRABES EM SP 😍🔥 Perambulamos na @arabianightpaulista uma loja com os perfumes importados mais hypados da internet! Com preços super competitivos e marcas famosas como Yara, Asad, Fakhar, Club de Nuit e Hawas. Se você quer fragrâncias árabes autênticas e exclusivas na Avenida Paulista, esse é o lugar certo! 📍 Av. Paulista, 1941 - Lojas 135/136 (dentro do Market Paulista) - Bela Vista, São Paulo - SP',
      resumo: 'Boutique especializada em perfumes árabes importados virais no Market Paulista, oferecendo fragrâncias originais como Yara e Asad a ótimos preços.',
      palavras_chave: ['perfumes arabes', 'perfumaria', 'avenida paulista', 'market paulista', 'yara', 'asad'],
      prato_destaque: 'Perfumes Árabes Importados',
      thumbnail_url: '/images/arabia-night-paulista.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('busger'),
      influencer_id: mapInfluencer('esquenta-sp'),
      titulo: 'O maior e mais famoso Xis Prensadão do Brasil fica em São Paulo! 🍔🔥',
      url_original: 'https://www.instagram.com/reel/C-busger/',
      transcricao: 'O MAIOR E MAIS FAMOSO XIS PRENSADÃO DO BRASIL FICA EM SÃO PAULO! 🍔🔥 Fomos no @busger provar essa delícia gigante. A história começou lá em 2015 e hoje eles fazem o autêntico Xis Gaúcho prensado de verdade! Ele vem super recheado com maionese caseira, milho, ervilha, ovo, bacon crocante, calabresa, alface, tomate e muito queijo derretido no pão gigante. Simplesmente espetacular e gigante!',
      resumo: 'Avaliação do monstruoso Xis Gaúcho prensado na hamburgueria Busger, feito em um ônibus antigo com recheio farto e sabor tradicional.',
      palavras_chave: ['xis gaucho', 'xis prensado', 'hamburguer', 'santo amaro', 'busger'],
      prato_destaque: 'Xis Tudão Prensado',
      thumbnail_url: '/images/busger.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('villa-e-prosa'),
      influencer_id: mapInfluencer('esquenta-sp'),
      titulo: 'A maior Cubana de peixe de São Paulo! 🐟🔥',
      url_original: 'https://www.instagram.com/reel/C-villaeprosa/',
      transcricao: 'A MAIOR CUBANA DE SÃO PAULO! 🐟🔥 Fomos até o @villaeprosa na Vila Mariana conhecer uma cubana gigantesca que impressiona pelo tamanho e pelo sabor! Vem com muito filé de peixe (linguado) super crocante, arroz soltinho, palmito de qualidade, banana à milanesa, fritas sequinhas e molho tártaro especial da casa. Serve tranquilamente 4 pessoas com muita fartura!',
      resumo: 'Prato comercial gigante Cubana de peixe linguado servido com acompanhamentos clássicos na Vila Mariana, ideal para compartilhar entre 4 pessoas.',
      palavras_chave: ['cubana', 'peixe', 'linguado', 'vila mariana', 'villa e prosa'],
      prato_destaque: 'Cubana de Peixe Gigante',
      thumbnail_url: '/images/villa-e-prosa.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('o-mineiro-prime'),
      influencer_id: mapInfluencer('esquenta-sp'),
      titulo: 'O Joelho de Porco mais famoso e crocante de SP! 🐷🔥',
      url_original: 'https://www.instagram.com/reel/C-omineiro/',
      transcricao: 'JOELHO DE PORCO MAIS FAMOSO DE SP! 🐷🔥 Se você curte carne bem feita, esse joelho de porco do @omineiroprime na Consolação é sensacional! Casquinha extremamente pururucada e crocante, carne desmanchando por dentro. Acompanha feijão tropeiro legítimo, couve refogada no alho, arroz e vinagrete. A vibe do lugar é de comida de verdade mineira!',
      resumo: 'Delicioso joelho de porco pururucado servido com feijão tropeiro e couve refogada no tradicional restaurante O Mineiro Prime.',
      palavras_chave: ['joelho de porco', 'pururuca', 'tropeiro', 'comida mineira', 'consolacao'],
      prato_destaque: 'Joelho de Porco Pururucado',
      thumbnail_url: '/images/o-mineiro-prime.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('costelao-atibaia'),
      influencer_id: mapInfluencer('esquenta-sp'),
      titulo: 'Costela e picanha à vontade por apenas R$ 75,90! 🥩🔥',
      url_original: 'https://www.instagram.com/reel/C-costelao/',
      transcricao: 'COSTELA E PICANHA À VONTADE POR APENAS R$75,90! 🥩🔥 Se você gosta de churrasco de verdade, o @costelaoatibaia é parada obrigatória! Uma costela assada no fogo de chão por mais de 8 horas que desmancha do osso, e picanha suculenta saindo a todo momento, tudo liberado e servido na mesa. E o buffet de acompanhamentos com saladas, pastéis quentinhos e fritas está tudo incluso!',
      resumo: 'Churrascaria Costelão Atibaia servindo rodízio de costela fogo de chão e picanha fatiada com acompanhamentos à vontade por preço fixo.',
      palavras_chave: ['costela fogo de chao', 'picanha', 'churrasco', 'rodizio', 'atibaia'],
      prato_destaque: 'Costela Fogo de Chão e Picanha',
      thumbnail_url: '/images/costelao-atibaia.jpg',
      publicado_em: new Date().toISOString(),
    },
    {
      restaurante_id: mapRestaurante('legado-parrilla'),
      influencer_id: mapInfluencer('esquenta-sp'),
      titulo: 'O macarrão flambado no queijo mais famoso de São Paulo! 🧀🍝',
      url_original: 'https://www.instagram.com/reel/C-legadoparrilla/',
      transcricao: 'O MACARRÃO MAIS FAMOSO DE SÃO PAULO! 🧀🍝 Fomos no @legadoparrilla no Anália Franco provar os famosos pratos servidos dentro do queijo! Pedimos o espaguete cremoso que é finalizado e flambado no conhaque direto dentro de uma peça gigante de queijo provolone derretido. Acompanha um bife ancho na parrilla no ponto perfeito. Uma das melhores experiências gastronômicas de SP!',
      resumo: 'Espaguete flambado no conhaque e servido dentro da roda de queijo provolone derretido na parrilla Legado Parrilla no Anália Franco.',
      palavras_chave: ['macarrao no queijo', 'provolone', 'massas', 'parrilla', 'analia franco', 'legado parrilla'],
      prato_destaque: 'Espaguete no Provolone Flambado',
      thumbnail_url: '/images/legado-parrilla.jpg',
      publicado_em: new Date().toISOString(),
    },
  ]

  const { error: videoError } = await supabase.from('videos').insert(videosData)
  if (videoError) {
    console.error('❌ Erro ao criar vídeos:', videoError.message)
    process.exit(1)
  }
  console.log('✅ Vídeos inseridos com sucesso!')

  console.log('🎉 Seed concluído com sucesso total! Banco pronto para uso.')
}

runSeed().catch((err) => {
  console.error('❌ Falha fatal no seed:', err)
  process.exit(1)
})
