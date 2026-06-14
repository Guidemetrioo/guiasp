import { NextResponse } from 'next/server'
import { createAdminServer } from '@/lib/supabase-server'

const mockInfluencers = [
{
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Navegando SP',
    slug: 'navegando-sp',
    bio: 'Encontramos os melhores pontos gastronomicos e passeios de Sao Paulo. Dicas diarias e sinceras.',
    instagram_handle: 'navegandosp',
    foto_url: '/images/navegando-sp-profile.jpg',
  },
{
    id: '44444444-4444-4444-4444-444444444444',
    nome: 'Perambulando em SP',
    slug: 'perambulando-em-sp',
    bio: 'Explorando as melhores dicas de gastronomia, passeios, viagens e achados imperdíveis em São Paulo. O seu guia para perambular pela capital!',
    instagram_handle: 'perambulandoemsp',
    foto_url: '/images/perambulando-em-sp-profile.jpg',
  },
{
    id: '55555555-5555-5555-5555-555555555555',
    nome: 'Esquenta SP',
    slug: 'esquenta-sp',
    bio: 'Dicas diárias das melhores experiências gastronômicas, rodízios, promoções e achados imperdíveis por toda São Paulo!',
    instagram_handle: 'esquentasp',
    foto_url: '/images/esquenta-sp-profile.jpg',
  }
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
    foto_capa_url: '/images/pantchos-house-burger.jpg',
    ativo: true,
  },
{
    id: 'r4444444-4444-4444-4444-444444444444',
    nome: 'Pecatto Bar & Restaurante',
    slug: 'pecatto-bar-restaurante',
    descricao: 'Famoso bar e restaurante em São Paulo especializado em pratos fartos, porções generosas e a icônica fatia gigante de bolo de chocolate Pecatto* com sorvete.',
    bairro: 'Mooca',
    cidade: 'São Paulo',
    tipo_cozinha: 'sobremesa',
    preco_medio: '$$',
    instagram_handle: 'pecattobar',
    foto_capa_url: '/images/pecatto-bar-restaurante.jpg',
    ativo: true,
  },
{
    id: 'r7777777-7777-7777-7777-777777777777',
    nome: 'Outlet do Suplemento',
    slug: 'outlet-do-suplemento',
    descricao: 'Mega loja e outlet em São Paulo especializada em suplementos alimentares, vitaminas e nutrição esportiva com os melhores preços do mercado*.',
    bairro: 'Mooca',
    cidade: 'São Paulo',
    tipo_cozinha: 'saudavel',
    preco_medio: '$$',
    instagram_handle: 'outletdosuplemento',
    foto_capa_url: '/images/outlet-do-suplemento.png',
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
    foto_capa_url: '/images/stunt-burger.jpg',
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
    foto_capa_url: '/images/santomar-restaurante.png',
    ativo: true,
  },
{
    id: 'r1717171-1717-1717-1717-171717171717',
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
    id: 'r1818181-1818-1818-1818-181818181818',
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
    id: 'r1919191-1919-1919-1919-191919191919',
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
    id: 'r2020202-2020-2020-2020-202020202020',
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
    id: 'r2121212-2121-2121-2121-212121212121',
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
    id: 'r2222222-2222-2222-2222-222222222222',
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
    id: 'r2323232-2323-2323-2323-232323232323',
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
    id: 'r2424242-2424-2424-2424-242424242424',
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
    id: 'r2525252-2525-2525-2525-252525252525',
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
  }
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
    thumbnail_url: '/images/pantchos-house-burger.jpg',
    publicado_em: new Date().toISOString(),
  },
{
    id: 'v4444444-4444-4444-4444-444444444444',
    restaurante_id: 'r4444444-4444-4444-4444-444444444444',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'A sobremesa mais absurda de São Paulo! 🍰🍫',
    url_original: 'https://www.instagram.com/reel/C8_pecattobar/',
    transcricao: 'Galera, fomos conhecer o Pecatto Bar & Restaurante para provar a famosa e gigantesca fatia de bolo de chocolate Pecatto* (R$ 38,00*) acompanhada de duas bolas de sorvete de baunilha e morangos frescos! O bolo é super molhadinho, com muito recheio cremoso e cobertura de chocolate belga de dar água na boca. Além disso, a casa serve risotos*, grelhados* e massas de altíssimo nível* num ambiente super aconchegante*. Uma experiência imperdível na Mooca! Endereço: Rua Juventus, 322 - Mooca, São Paulo - SP* | Tel / Reservas: (11) 95555-4444* | Funcionamento: Terça a Sábado das 12h às 23h30, e Domingo das 12h às 18h*.',
    resumo: 'Famoso e generoso bolo de chocolate Pecatto com calda quente, servido com sorvete e morangos frescos em ambiente intimista na Mooca.',
    palavras_chave: ['bolo de chocolate', 'sobremesa', 'mooca', 'doce', 'pecatto'],
    prato_destaque: 'Bolo de Chocolate Pecatto*',
    thumbnail_url: '/images/pecatto-bar-restaurante.jpg',
    publicado_em: new Date().toISOString(),
  },
{
    id: 'v7777777-7777-7777-7777-777777777777',
    restaurante_id: 'r7777777-7777-7777-7777-777777777777',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    titulo: 'O maior outlet de suplementos com preços incríveis! 💊💪',
    url_original: 'https://www.instagram.com/reel/C8_outletdosuplemento/',
    transcricao: 'Galera, fomos navegar na Mooca para conhecer o Outlet do Suplemento! 💊💪 Um galpão gigante com muita variedade e os melhores preços do mercado de São Paulo! Achamos albumina de alta qualidade a partir de R$ 34,90* e whey protein concentrado e isolado das principais marcas nacionais e importadas (Dux, IntegralMedica, Max Titanium) com descontos de outlet*! Além disso, eles contam com atendimento personalizado por nutricionistas na loja* para indicar os melhores produtos para o seu treino. Vale a pena demais passar lá para abastecer o estoque! Endereço: Rua General Jardim, 111 - Mooca, São Paulo - SP* | Tel / Reservas: (11) 94444-3333* | Funcionamento: Segunda a Sábado das 9h às 20h*.',
    resumo: 'Maior outlet de suplementos esportivos com enorme estoque, albumina barata, whey de grandes marcas e descontos na Mooca.',
    palavras_chave: ['suplemento', 'whey protein', 'saudavel', 'outlet', 'mooca', 'fitness'],
    prato_destaque: 'Suplementos e Whey Protein*',
    thumbnail_url: '/images/outlet-do-suplemento.png',
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
    thumbnail_url: '/images/stunt-burger.jpg',
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
    thumbnail_url: '/images/santomar-restaurante.png',
    publicado_em: new Date().toISOString(),
  },
{
    id: 'v1717171-1717-1717-1717-171717171717',
    restaurante_id: 'r1717171-1717-1717-1717-171717171717',
    influencer_id: '44444444-4444-4444-4444-444444444444',
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
    id: 'v1818181-1818-1818-1818-181818181818',
    restaurante_id: 'r1818181-1818-1818-1818-181818181818',
    influencer_id: '44444444-4444-4444-4444-444444444444',
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
    id: 'v1919191-1919-1919-1919-191919191919',
    restaurante_id: 'r1919191-1919-1919-1919-191919191919',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    titulo: 'MUITO BARATO: Rodízio Japonês com Bebidas e Sobremesas inclusas! 🍱🥤',
    url_original: 'https://www.instagram.com/reel/DLyBK2iJo3-/',
    transcricao: 'MUITO BARATO @hao.sushi.itaim • 🍱 + de 100 opções entre pratos quentes e frios • 🥤 Bebidas inclusas: refrigerante, suco natural, água com e sem gás + sodas italianas • 🍨 Sobremesas inclusas: sorvetes variados, petit gateau (para o casal) e hot roll doce 💰 Valores: • Almoço (seg a sex): R$ 89,90 • Jantar / finais de semana e feriados: R$ 119,90 ⏰ Horários: • Seg a sex: 12h às 15h | após 19h • Sáb, dom e feriados: 12h às 16h | após 19h 📍 Unidade Itaim Rua João Cachoeira, 1556 – Vila Nova Conceição',
    resumo: 'Rodízio japonês com mais de 100 opções, refrigerantes, sucos e sodas italianas inclusos, além de sobremesas como petit gateau and hot roll doce no Itaim Bibi.',
    palavras_chave: ['rodizio japones', 'sushi', 'hao sushi', 'itaim bibi', 'bebida inclusa', 'sobremesa inclusa'],
    prato_destaque: 'Rodízio Japonês Premium',
    thumbnail_url: '/images/hao-sushi-itaim.jpg',
    publicado_em: new Date().toISOString(),
  },
{
    id: 'v2020202-2020-2020-2020-202020202020',
    restaurante_id: 'r2020202-2020-2020-2020-202020202020',
    influencer_id: '44444444-4444-4444-4444-444444444444',
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
    id: 'v2121212-2121-2121-2121-212121212121',
    restaurante_id: 'r2121212-2121-2121-2121-212121212121',
    influencer_id: '55555555-5555-5555-5555-555555555555',
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
    id: 'v2222222-2222-2222-2222-222222222222',
    restaurante_id: 'r2222222-2222-2222-2222-222222222222',
    influencer_id: '55555555-5555-5555-5555-555555555555',
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
    id: 'v2323232-2323-2323-2323-232323232323',
    restaurante_id: 'r2323232-2323-2323-2323-232323232323',
    influencer_id: '55555555-5555-5555-5555-555555555555',
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
    id: 'v2424242-2424-2424-2424-242424242424',
    restaurante_id: 'r2424242-2424-2424-2424-242424242424',
    influencer_id: '55555555-5555-5555-5555-555555555555',
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
    id: 'v2525252-2525-2525-2525-252525252525',
    restaurante_id: 'r2525252-2525-2525-2525-252525252525',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    titulo: 'O macarrão flambado no queijo mais famoso de São Paulo! 🧀🍝',
    url_original: 'https://www.instagram.com/reel/C-legadoparrilla/',
    transcricao: 'O MACARRÃO MAIS FAMOSO DE SÃO PAULO! 🧀🍝 Fomos no @legadoparrilla no Anália Franco provar os famosos pratos servidos dentro do queijo! Pedimos o espaguete cremoso que é finalizado e flambado no conhaque direto dentro de uma peça gigante de queijo provolone derretido. Acompanha um bife ancho na parrilla no ponto perfeito. Uma das melhores experiências gastronômicas de SP!',
    resumo: 'Espaguete flambado no conhaque e servido dentro da roda de queijo provolone derretido na parrilla Legado Parrilla no Anália Franco.',
    palavras_chave: ['macarrao no queijo', 'provolone', 'massas', 'parrilla', 'analia franco', 'legado parrilla'],
    prato_destaque: 'Espaguete no Provolone Flambado',
    thumbnail_url: '/images/legado-parrilla.jpg',
    publicado_em: new Date().toISOString(),
  }
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
    id: 'p4',
    restaurante_id: 'r4444444-4444-4444-4444-444444444444',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 900.0,
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
    id: 'p9',
    restaurante_id: 'r9999999-9999-9999-9999-999999999999',
    influencer_id: '11111111-1111-1111-1111-111111111111',
    status: 'ativo',
    valor_mensal: 1100.0,
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
    id: 'p16',
    restaurante_id: 'r1717171-1717-1717-1717-171717171717',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    status: 'ativo',
    valor_mensal: 1000.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p17',
    restaurante_id: 'r1818181-1818-1818-1818-181818181818',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    status: 'ativo',
    valor_mensal: 1200.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p18',
    restaurante_id: 'r1919191-1919-1919-1919-191919191919',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    status: 'ativo',
    valor_mensal: 1500.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p19',
    restaurante_id: 'r2020202-2020-2020-2020-202020202020',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    status: 'ativo',
    valor_mensal: 800.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p20',
    restaurante_id: 'r2121212-2121-2121-2121-212121212121',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    status: 'ativo',
    valor_mensal: 1000.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p21',
    restaurante_id: 'r2222222-2222-2222-2222-222222222222',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    status: 'ativo',
    valor_mensal: 1200.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p22',
    restaurante_id: 'r2323232-2323-2323-2323-232323232323',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    status: 'ativo',
    valor_mensal: 1100.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p23',
    restaurante_id: 'r2424242-2424-2424-2424-242424242424',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    status: 'ativo',
    valor_mensal: 1500.0,
    inicio_em: new Date().toISOString(),
  },
{
    id: 'p24',
    restaurante_id: 'r2525252-2525-2525-2525-252525252525',
    influencer_id: '55555555-5555-5555-5555-555555555555',
    status: 'ativo',
    valor_mensal: 1300.0,
    inicio_em: new Date().toISOString(),
  }
]

export async function POST() {
  try {
    const supabase = createAdminServer()

    // 1. Check if mock mode is active (returns the mock client which won't perform actual inserts, but doesn't crash)
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY

    if (isMock) {
      return NextResponse.json({
        success: true,
        message: 'Modo simulado (offline) ativo. Os 14 vídeos de demonstração já estão disponíveis localmente no banco em memória!',
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
      message: 'Todos os 14 restaurantes, influencers e vídeos foram importados com sucesso para o banco de dados do Supabase!',
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
