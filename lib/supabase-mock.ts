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
    nome: "Pantcho's House Burger",
    slug: 'pantchos-house-burger',
    descricao: 'Hamburgueria artesanal em Interlagos famosa pelo burger Jack Ribs* e blends suculentos assados na grelha.',
    bairro: 'Interlagos',
    cidade: 'São Paulo',
    tipo_cozinha: 'hamburguer',
    preco_medio: '$$',
    instagram_handle: 'pantchoshouse',
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
    nome: 'Teg Restaurante',
    slug: 'teg-restaurante',
    descricao: 'Restaurante acolhedor na Mooca especializado em massas artesanais e no famoso rodízio de risotos cremosos.',
    bairro: 'Mooca',
    cidade: 'São Paulo',
    tipo_cozinha: 'italiano',
    preco_medio: '$$',
    instagram_handle: 'teg.restaurante',
    foto_capa_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&h=600&q=80',
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
    nome: 'Solar da República',
    slug: 'solar-da-republica',
    descricao: 'Restaurante elegante no centro de São Paulo focado em culinária de influência europeia e frutos do mar com aquário próprio.',
    bairro: 'Centro',
    cidade: 'São Paulo',
    tipo_cozinha: 'frutos do mar',
    preco_medio: '$$$$',
    instagram_handle: 'solardarepublica',
    foto_capa_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&h=600&q=80',
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
    nome: 'Stunt Burger',
    slug: 'stunt-burger',
    descricao: 'Hamburgueria temática geek no Morumbi famosa por hambúrgueres personalizados e collabs exclusivas de dar água na boca.',
    bairro: 'Morumbi',
    cidade: 'São Paulo',
    tipo_cozinha: 'hamburguer',
    preco_medio: '$$',
    instagram_handle: 'stuntburger',
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
    nome: 'Santomar Restaurante',
    slug: 'santomar-restaurante',
    descricao: 'Restaurante pioneiro em São Paulo a trazer o famoso sacão de frutos do mar (Seafood Boil) no estilo americano.',
    bairro: 'Tatuapé',
    cidade: 'São Paulo',
    tipo_cozinha: 'frutos do mar',
    preco_medio: '$$$',
    instagram_handle: 'santomarrestaurante',
    foto_capa_url: 'https://images.unsplash.com/photo-1534080391025-097b03b7738c?auto=format&fit=crop&w=800&h=600&q=80',
    ativo: true,
  },
  {
    id: 'r1616161-1616-1616-1616-161616161616',
    nome: 'D.O.M.',
    slug: 'dom-restaurante',
    descricao: 'O renomado templo gastronômico do chef Alex Atala focado em ingredientes raros da Amazônia e culinária contemporânea.',
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
    titulo: 'A hamburgueria eleita uma das melhores do Brasil! 🇧🇷🍔',
    url_original: 'https://www.instagram.com/reel/C8_pantchoshouse/',
    transcricao: "Galera, fomos navegar na Zona Sul de São Paulo para conhecer a Pantcho's House Burger! 🍔 Essa hamburgueria foi eleita uma das melhores do Brasil pelo Guia Comer & Beber*! Nós provamos o clássico e monstruoso Jack Ribs*, um hambúrguer com blend bovino grelhado de 180g*, muito cheddar inglês*, cebola caramelizada* e uma costela suína desfiada ao molho barbecue flambada no uísque Jack Daniel's* (R$ 44,00*). De acompanhamento, as batatas rústicas com tempero secreto de lemon pepper e páprica* são divinas. Tudo isso num ambiente super descolado e com temática industrial*. Endereço: Rua Inácio Cervantes, 90 - Parque Colonial, São Paulo - SP* | Tel / Reservas: (11) 98888-7777* | Funcionamento: Terça a Quinta das 18h às 23h, Sexta e Sábado das 18h às 00h, e Domingo das 17h às 22h*.",
    resumo: 'Avaliação da premiada hamburgueria Pantcho\'s House na Zona Sul, com destaque para o suculento hambúrguer Jack Ribs* com costela desfiada e molho barbecue.',
    palavras_chave: ['hamburguer', 'zona sul', 'costela', 'artesanal', 'jack ribs'],
    prato_destaque: 'Jack Ribs Burger*',
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
    titulo: 'O incrível Rodízio de Risotos na Mooca! 🇮🇹',
    url_original: 'https://www.instagram.com/reel/C8_tegrestaurante/',
    transcricao: 'Fomos navegar na Mooca para conhecer o Teg Restaurante e provar o famoso Rodízio de Risotos! 🇮🇹 São mais de 10 sabores de risotos artesanais servidos à vontade*, incluindo clássicos como risoto de funghi trufado*, filé mignon com gorgonzola*, camarão com limão siciliano* e até risotos doces como o de morango com chocolate branco*! O rodízio acompanha entradinhas deliciosas* como bruschettas* and arancini*. O ambiente é intimista e perfeito para datas comemorativas*. Um ótimo custo-benefício para quem ama comida italiana! Endereço: Rua Juventus, 322 - Mooca, São Paulo - SP* | Tel / Reservas: (11) 95555-4444* | Funcionamento: Terça a Sábado, das 19h às 23h30*.',
    resumo: 'Rodízio completo de risotos com mais de 10 sabores doces e salgados à vontade*, incluindo entradas italianas em ambiente intimista na Mooca.',
    palavras_chave: ['risoto', 'mooca', 'rodizio', 'italiano', 'massas'],
    prato_destaque: 'Rodízio de Risotos com Proteínas*',
    thumbnail_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v7777777-7777-7777-7777-777777777777',
    restaurante_id: 'r7777777-7777-7777-7777-777777777777',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'Lagosta fresca e culinária europeia de altíssimo nível no Centro 🦞',
    url_original: 'https://www.instagram.com/reel/C8_solardarepublica/',
    transcricao: 'Hoje a navegação foi histórica! Fomos ao Solar da República na Vila Buarque, um restaurante com forte influência europeia e frutos do mar fresquíssimos. Eles têm até um aquário de lagostas vivas! 🦞 Provamos as tradicionais Gambas al Ajillo (camarões no azeite e alho super aromáticos), fatias finíssimas de Jamón Ibérico curado* de entrada, e claro, a estrela da casa: lagosta grelhada na manteiga de ervas* acompanhada de arroz de açafrão*. Tudo simplesmente perfeito, harmonizado com uma bela carta de vinhos europeus*. Endereço: Rua General Jardim, 111 - Vila Buarque, São Paulo - SP* | Tel / Reservas: (11) 94444-3333* | Funcionamento: Terça a Sábado das 12h às 23h, e Domingo das 12h às 17h*.',
    resumo: 'Experiência sofisticada com lagosta grelhada tirada de aquário vivo, petiscos clássicos ibéricos (gambas, jamón)* e carta de vinhos no Centro.',
    palavras_chave: ['lagosta', 'frutos do mar', 'centro', 'espanhol', 'jamon', 'portugues'],
    prato_destaque: 'Lagosta Grelhada na Manteiga de Ervas*',
    thumbnail_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v9999999-9999-9999-9999-999999999999',
    restaurante_id: 'r9999999-9999-9999-9999-999999999999',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'Hambúrguer de cheddar absurdo em collab especial! 🍔',
    url_original: 'https://www.instagram.com/reel/C8_stuntburger/',
    transcricao: "Navegamos até o Morumbi para conhecer o Stunt Burger e provar um dos burgers mais absurdos de SP! 🍔 Uma collab especial com a Hellmann's que traz um hambúrguer monstruoso com muito cheddar derretido, bacon super crocante e a maionese Hellmann's Supreme*. Você também pode montar o seu hambúrguer escolhendo todos os ingredientes! Acompanhado de waffle fries sequinhas* e um milk shake de Nutella* que é de chorar de tão bom. O pico é todo decorado com quadrinhos e action figures geek*, vibe incrível! Endereço: Rua José Jannarelli, 426 - Vila Progredior, São Paulo - SP* | Tel / Reservas: (11) 97777-6666* | Funcionamento: Todos os dias das 12h às 23h30*.",
    resumo: 'Collab especial Hellmann\'s e hambúrgueres gigantes personalizáveis com batatas waffle em um ambiente geek super divertido no Morumbi.',
    palavras_chave: ['hamburguer', 'morumbi', 'collab', 'geek', 'waffle fries'],
    prato_destaque: 'Burger Personalizado com Cheddar & Bacon*',
    thumbnail_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v1010101-1010-1010-1010-101010101010',
    restaurante_id: 'r1010101-1010-1010-1010-101010101010',
    influencer_id: '33333333-3333-3333-3333-333333333333',
    titulo: 'O clássico dadinho de tapioca no Mocotó!',
    url_original: 'https://www.instagram.com/p/DK44444/',
    transcricao: 'Hoje viemos ao Mocotó provar a comida sertaneja do chef Rodrigo Oliveira. Os dadinhos de tapioca crocantes com geléia de pimenta e o baião de dois tradicional são lendários!',
    resumo: 'Deliciosa gastronomia nordestina e sertaneja tradicional servida em ambiente simples e acolhedor.',
    palavras_chave: ['nordestina', 'tapioca', 'baiao de dois', 'sertanejo', 'vila medeiros'],
    prato_destaque: 'Dadinhos de Tapioca com Geléia de Pimenta',
    thumbnail_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
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
    publicado_em: new Date().toISOString(),
  },
  {
    id: 'v1515151-1515-1515-1515-151515151515',
    restaurante_id: 'r1515151-1515-1515-1515-151515151515',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'O famoso Sacão de Frutos do Mar (Seafood Boil Bag) em SP! 🦞',
    url_original: 'https://www.instagram.com/reel/C8_santomar/',
    transcricao: 'Hoje a experiência foi única! Fomos conhecer o Santomar, o único lugar em SP que serve o verdadeiro Seafood Boil Bag: um sacão recheado de frutos do mar! 🦞 Vem com lagosta*, camarões gigantes*, lula*, mexilhões*, milho cozido* e batatas*, tudo temperado com um molho Cajun secreto* sensacional e picante na medida. Eles jogam tudo direto na mesa com papel acartonado e você come com as mãos usando luvas e babador! Uma bagunça deliciosa e muito saborosa. Vale a pena demais conhecer! Endereço: Rua Cantagalo, 1424 - Tatuapé, São Paulo - SP* | Tel / Reservas: (11) 96666-5555* | Funcionamento: Quarta a Sexta das 18h às 22h30, Sábado e Domingo das 12h às 22h*.',
    resumo: 'O famoso Seafood Boil Bag com lagosta, camarão, mexilhões e milho no molho cajun*, servido de forma rústica no Tatuapé.',
    palavras_chave: ['frutos do mar', 'seafood boil', 'lagosta', 'tatuape', 'camarao'],
    prato_destaque: 'Seafood Boil Bag (Sacão de Frutos do Mar)*',
    thumbnail_url: 'https://images.unsplash.com/photo-1534080391025-097b03b7738c?auto=format&fit=crop&w=400&h=300&q=80',
    publicado_em: new Date().toISOString(),
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
