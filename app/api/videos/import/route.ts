import { NextResponse } from 'next/server'
import { createAdminServer } from '@/lib/supabase-server'

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
  {
    id: 'r7777777-7777-7777-7777-777777777777',
    nome: 'A Casa do Porco',
    slug: 'a-casa-do-porco',
    descricao: 'Um dos melhores restaurantes do mundo, focado em carne suína de excelência e cozinha autoral brasileira no Centro.',
    bairro: 'Centro',
    cidade: 'São Paulo',
    tipo_cozinha: 'brasileira',
    preco_medio: '$$$',
    instagram_handle: 'acasadoporcorodolfo',
    foto_capa_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r8888888-8888-8888-8888-888888888888',
    nome: 'Tan Tan',
    slug: 'tan-tan',
    descricao: 'Noodles, donburis e coquetelaria impecável em um ambiente moderno e intimista em Pinheiros.',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'japones',
    preco_medio: '$$$',
    instagram_handle: 'tantannb',
    foto_capa_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r9999999-9999-9999-9999-999999999999',
    nome: 'Z Deli Sandwiches',
    slug: 'z-deli-sandwiches',
    descricao: 'Hambúrgueres artesanais montados com precisão e batatas fritas famosas em toda a cidade paulista.',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'hamburguer',
    preco_medio: '$$',
    instagram_handle: 'zdeli',
    foto_capa_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1010101-1010-1010-1010-101010101010',
    nome: 'Mocotó',
    slug: 'mocoto',
    descricao: 'A clássica cozinha sertaneja do chef Rodrigo Oliveira na Vila Medeiros, famosa pelos dadinhos de tapioca e caldos.',
    bairro: 'Vila Medeiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'brasileira',
    preco_medio: '$$',
    instagram_handle: 'mocotorestaurante',
    foto_capa_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1212121-1212-1212-1212-121212121212',
    nome: 'Maní',
    slug: 'mani',
    descricao: 'Cozinha brasileira contemporânea e premiada pela chef Helena Rizzo no Jardim Paulista.',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    tipo_cozinha: 'brasileira',
    preco_medio: '$$$$',
    instagram_handle: 'manimanioca',
    foto_capa_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1313131-1313-1313-1313-131313131313',
    nome: 'Evvai',
    slug: 'evvai',
    descricao: 'Gastronomia italiana moderna orientada pela criatividade do chef Luiz Filipe Souza em Pinheiros.',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    tipo_cozinha: 'italiano',
    preco_medio: '$$$$',
    instagram_handle: 'evvai_sp',
    foto_capa_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1414141-1414-1414-1414-141414141414',
    nome: 'Fasano',
    slug: 'fasano',
    descricao: 'O restaurante italiano de maior prestígio e elegância do Brasil sob curadoria da família Fasano.',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    tipo_cozinha: 'italiano',
    preco_medio: '$$$$',
    instagram_handle: 'fasano',
    foto_capa_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1515151-1515-1515-1515-151515151515',
    nome: 'Bacio di Latte',
    slug: 'bacio-di-latte',
    descricao: 'Gelatos italianos super cremosos e doces refinados fabricados diariamente com ingredientes nobres.',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    tipo_cozinha: 'brunch',
    preco_medio: '$',
    instagram_handle: 'baciodilatte',
    foto_capa_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1616161-1616-1616-1616-161616161616',
    nome: 'D.O.M.',
    slug: 'dom-restaurante',
    descricao: 'O renomado templo gastronomico do chef Alex Atala focado em ingredientes raros da Amazônia e culinária contemporânea.',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    tipo_cozinha: 'brasileira',
    preco_medio: '$$$$',
    instagram_handle: 'domrestaurante',
    foto_capa_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&h=600&q=80',
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
  },
  {
    id: 'v5555555-5555-5555-5555-555555555555',
    restaurante_id: 'r5555555-5555-5555-5555-555555555555',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    titulo: 'Tacos de rua mexicanos autênticos e margaritas na Augusta',
    url_original: 'https://www.instagram.com/p/DF99999/',
    transcricao: 'A melhor taqueria de SP! Viemos na La Sabrosa provar os clássicos tacos al pastor com abacaxi e as margaritas geladas. Tempero autêntico do México no meio do agito da Augusta!',
    resumo: 'Clássica taqueria de rua com excelentes tacos al pastor temperados e drinks mexicanos vibrantes.',
    palavras_chave: ['mexicano', 'tacos', 'margarita', 'augusta', 'al pastor'],
    prato_destaque: 'Tacos al Pastor',
    thumbnail_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v6666666-6666-6666-6666-666666666666',
    restaurante_id: 'r6666666-6666-6666-6666-666666666666',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'Frutos do mar grelhados perfeitos no Itaim Bibi',
    url_original: 'https://www.instagram.com/p/DG88888/',
    transcricao: 'Se você ama peixes e frutos do mar frescos, o Rufinos no Itaim é imperdível. Grelhados perfeitos, camarão gigante e um serviço super tradicional e impecável.',
    resumo: 'Grelha tradicional de peixes finos e camarões com acompanhamentos clássicos no coração do Itaim.',
    palavras_chave: ['frutos do mar', 'camarao', 'peixe', 'itaim bibi'],
    prato_destaque: 'Grelhada de Frutos do Mar',
    thumbnail_url: 'https://images.unsplash.com/photo-1534080391025-097b03b7738c?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v7777777-7777-7777-7777-777777777777',
    restaurante_id: 'r7777777-7777-7777-7777-777777777777',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'Experiência única na Casa do Porco no Centro de SP',
    url_original: 'https://www.instagram.com/p/DH77777/',
    transcricao: 'Hoje o Navegando SP te leva à Casa do Porco! Menu degustação focado em aproveitar tudo do porco da melhor forma possível, com muito sabor, criatividade e preço justo.',
    resumo: 'Incrível menu degustação do chef focado na gastronomia brasileira e de carne suína autoral no centro da cidade.',
    palavras_chave: ['carne de porco', 'degustacao', 'centro', 'brasileira', 'autoral'],
    prato_destaque: 'Porco San Zé',
    thumbnail_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v8888888-8888-8888-8888-888888888888',
    restaurante_id: 'r8888888-8888-8888-8888-888888888888',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    titulo: 'Lamen e coquetéis espetaculares no Tan Tan',
    url_original: 'https://www.instagram.com/p/DI66666/',
    transcricao: 'Vem pro Tan Tan em Pinheiros. Pedimos o clássico Shoyu Ramen com caldo encorpado e massa artesanal perfeita. A coquetelaria da casa é premiada e espetacular.',
    resumo: 'Noodles ricos, petiscos orientais refinados e coquetelaria reconhecida internacionalmente em Pinheiros.',
    palavras_chave: ['ramen', 'lamen', 'japones', 'cocktail', 'pinheiros'],
    prato_destaque: 'Shoyu Ramen Tradicional',
    thumbnail_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v9999999-9999-9999-9999-999999999999',
    restaurante_id: 'r9999999-9999-9999-9999-999999999999',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'O clássico hambúrguer de pastrami da Z Deli',
    url_original: 'https://www.instagram.com/p/DJ55555/',
    transcricao: 'Z Deli nunca decepciona! Fomos provar o clássico sanduíche com fatias generosas de pastrami artesanal deles e o famoso burger com maionese caseira e batata com alecrim.',
    resumo: 'Famosa hamburgueria e deli servindo deliciosos burgers e clássicos de pastrami curado artesanalmente.',
    palavras_chave: ['hamburguer', 'pastrami', 'deli', 'batata frita', 'pinheiros'],
    prato_destaque: 'Sanduíche de Pastrami',
    thumbnail_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1010101-1010-1010-1010-101010101010',
    restaurante_id: 'r1010101-1010-1010-1010-101010101010',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'O clássico dadinho de tapioca no Mocotó!',
    url_original: 'https://www.instagram.com/p/DK44444/',
    transcricao: 'Hoje viemos au Mocotó provar a comida sertaneja do chef Rodrigo Oliveira. Os dadinhos de tapioca crocantes com geléia de pimenta e o baião de dois tradicional são lendários!',
    resumo: 'Deliciosa gastronomia nordestina e sertaneja tradicional servida em ambiente simples e acolhedor.',
    palavras_chave: ['nordestina', 'tapioca', 'baiao de dois', 'sertanejo', 'vila medeiros'],
    prato_destaque: 'Dadinhos de Tapioca com Geléia de Pimenta',
    thumbnail_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1212121-1212-1212-1212-121212121212',
    restaurante_id: 'r1212121-1212-1212-1212-121212121212',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'Manioca e a gastronomia refinada da chef Helena Rizzo',
    url_original: 'https://www.instagram.com/p/DL33333/',
    transcricao: 'Uma tarde perfeita no Maní. Provamos pratos contemporâneos incríveis como o peixe do dia com tucupi e coco fresco. Refinamento e sabor em cada detalhe.',
    resumo: 'Cozinha brasileira de altíssimo nível, estrelada no guia Michelin, no elegante Jardim Paulista.',
    palavras_chave: ['brasileira', 'michelin', 'contemporaneo', 'helena rizzo', 'jardins'],
    prato_destaque: 'Peixe com Tucupi e Coco',
    thumbnail_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1313131-1313-1313-1313-131313131313',
    restaurante_id: 'r1313131-1313-1313-1313-131313131313',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    titulo: 'Evvai: massas recheadas criativas e alta gastronomia',
    url_original: 'https://www.instagram.com/p/DM22222/',
    transcricao: 'A alta gastronomia italiana no Evvai vai explodir sua mente. O chef prepara um gnocchi soufflé com queijo e trufas inesquecível, além de sobremesas artísticas.',
    resumo: 'Criativas massas italianas contemporâneas preparadas com requinte e técnicas culinárias avançadas.',
    palavras_chave: ['italiano', 'massas', 'trufa', 'chef', 'pinheiros'],
    prato_destaque: 'Gnocchi Soufflé com Trufa',
    thumbnail_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1414141-1414-1414-1414-141414141414',
    restaurante_id: 'r1414141-1414-1414-1414-141414141414',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    titulo: 'O clássico filet mignon à parmegiana do Fasano',
    url_original: 'https://www.instagram.com/p/DN11111/',
    transcricao: 'O Fasano é sinônimo de luxo e tradição. Provamos o clássico carpaccio de carpaccio de entrada e a parmegiana clássica com batatas suflê. Serviço impecável e ambiente chique.',
    resumo: 'O mais elegante e refinado restaurante italiano tradicional de luxo localizado nos Jardins.',
    palavras_chave: ['italiano', 'luxo', 'parmegiana', 'carpaccio', 'jardins'],
    prato_destaque: 'Filet Mignon à Parmegiana Clássico',
    thumbnail_url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1515151-1515-1515-1515-151515151515',
    restaurante_id: 'r1515151-1515-1515-1515-151515151515',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'Gelatos italianos incríveis na Bacio di Latte',
    url_original: 'https://www.instagram.com/p/DO22222/',
    transcricao: 'Para fechar o dia, uma passada na Bacio di Latte para provar os sabores clássicos de pistache e doce de leite. Gelatos super aveludados e doces irresistíveis.',
    resumo: 'Deliciosos e cremosos gelatos artesanais produzidos no padrão de qualidade italiana nos Jardins.',
    palavras_chave: ['gelato', 'pistache', 'doce de leite', 'sobremesa', 'jardins'],
    prato_destaque: 'Gelato de Pistache e Bacio di Latte',
    thumbnail_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&h=300&q=80',
  },
  {
    id: 'v1616161-1616-1616-1616-161616161616',
    restaurante_id: 'r1616161-1616-1616-1616-161616161616',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'O menu contemporâneo amazônico do D.O.M. de Alex Atala',
    url_original: 'https://www.instagram.com/p/DP33333/',
    transcricao: 'Uma das noites mais marcantes da vida. Fomos ao D.O.M. do chef Alex Atala vivenciar o menu focado em ingredientes raros da Amazônia, com formiga e pirarucu grelhado.',
    resumo: 'Alta gastronomia contemporânea de renome mundial, exaltando ingredientes indígenas e amazônicos.',
    palavras_chave: ['amazonia', 'contemporaneo', 'alex atala', 'michelin', 'jardins'],
    prato_destaque: 'Pirarucu Grelhado com Tucupi',
    thumbnail_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&h=300&q=80',
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
  {
    id: 'p4',
    restaurante_id: 'r4444444-4444-4444-4444-444444444444',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 900.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p5',
    restaurante_id: 'r5555555-5555-5555-5555-555555555555',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    status: 'ativo',
    valor_mensal: 1000.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p6',
    restaurante_id: 'r6666666-6666-6666-6666-666666666666',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    status: 'ativo',
    valor_mensal: 1300.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p7',
    restaurante_id: 'r7777777-7777-7777-7777-777777777777',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 2000.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p8',
    restaurante_id: 'r8888888-8888-8888-8888-888888888888',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    status: 'ativo',
    valor_mensal: 1400.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p9',
    restaurante_id: 'r9999999-9999-9999-9999-999999999999',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 1100.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p10',
    restaurante_id: 'r1010101-1010-1010-1010-101010101010',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    status: 'ativo',
    valor_mensal: 1000.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p11',
    restaurante_id: 'r1212121-1212-1212-1212-121212121212',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    status: 'ativo',
    valor_mensal: 2500.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p12',
    restaurante_id: 'r1313131-1313-1313-1313-131313131313',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    status: 'ativo',
    valor_mensal: 2400.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p13',
    restaurante_id: 'r1414141-1414-1414-1414-141414141414',
    influencer_id: '22222222-2222-2222-2222-222222222222',
    status: 'ativo',
    valor_mensal: 3000.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p14',
    restaurante_id: 'r1515151-1515-1515-1515-151515151515',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 700.0,
    inicio_em: new Date().toISOString(),
  },
  {
    id: 'p15',
    restaurante_id: 'r1616161-1616-1616-1616-161616161616',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    status: 'ativo',
    valor_mensal: 3500.0,
    inicio_em: new Date().toISOString(),
  },
]

export async function POST() {
  try {
    const supabase = createAdminServer()

    // 1. Check if mock mode is active (returns the mock client which won't perform actual inserts, but doesn't crash)
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

    if (isMock) {
      return NextResponse.json({
        success: true,
        message: 'Modo simulado (offline) ativo. Os 15 vídeos de demonstração já estão disponíveis localmente no banco em memória!',
        details: {
          influencers: mockInfluencers.length,
          restaurantes: mockRestaurantes.length,
          videos: mockVideos.length,
          planos: mockPlanos.length
        }
      })
    }

    // 2. Perform real database upserts
    console.log('🔄 Iniciando importação em massa para Supabase...')

    // A. Upsert Influencers
    const { error: infError } = await supabase
      .from('influencers')
      .upsert(mockInfluencers, { onConflict: 'id' })

    if (infError) {
      throw new Error(`Erro ao importar influencers: ${infError.message}`)
    }

    // B. Upsert Restaurantes
    const { error: restError } = await supabase
      .from('restaurantes')
      .upsert(mockRestaurantes, { onConflict: 'id' })

    if (restError) {
      throw new Error(`Erro ao importar restaurantes: ${restError.message}`)
    }

    // C. Upsert Planos de Parceria
    const { error: planError } = await supabase
      .from('planos')
      .upsert(mockPlanos, { onConflict: 'id' })

    if (planError) {
      throw new Error(`Erro ao importar planos: ${planError.message}`)
    }

    // D. Upsert Vídeos
    const { error: vidError } = await supabase
      .from('videos')
      .upsert(mockVideos, { onConflict: 'id' })

    if (vidError) {
      throw new Error(`Erro ao importar vídeos: ${vidError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Todos os 15 restaurantes, influencers e vídeos foram importados com sucesso para o banco de dados do Supabase!',
      details: {
        influencers: mockInfluencers.length,
        restaurantes: mockRestaurantes.length,
        videos: mockVideos.length,
        planos: mockPlanos.length
      }
    })
  } catch (err: any) {
    console.error('❌ Erro na importação:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Erro interno na importação' },
      { status: 500 }
    )
  }
}
