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
