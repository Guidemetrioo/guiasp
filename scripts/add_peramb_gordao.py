import re

gordao_id = "c47d7cf1-b374-4825-8f17-f10c928e57fd"
peramb_id = "44444444-4444-4444-4444-444444444444"

video_str_mock = """  {
    id: 'v-gordao-perambulando',
    restaurante_id: 'c47d7cf1-b374-4825-8f17-f10c928e57fd',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    titulo: "Review de Point do Gordão por @perambulandoemsp",
    url_original: 'https://www.instagram.com/reel/C-pointdogordaosp/',
    transcricao: "À PARMEGIANA GIGANTE EM SP! 🧀😍 Perambulamos no @pointdogordaosp , que faz esse parmegiana gigante e sensacional! A carne é super macia, com muito queijo derretido e molho de tomate artesanal. Acompanha arroz e fritas sequinhas. Serve muito bem de 3 a 4 pessoas!",
    resumo: "Avaliação do bife à parmegiana gigante do Point do Gordão na Mooca, servido com arroz e batatas fritas.",
    palavras_chave: ['parmegiana', 'mooca', 'queijo', 'perambulandoemsp'],
    prato_destaque: 'Bife à Parmegiana Gigante*',
    thumbnail_url: '/images/placeholder-restaurant.jpg',
    video_url: '/videos/point-do-gordao.mp4',
    publicado_em: new Date().toISOString(),
  }"""

plano_str_mock = """  {
    id: 'p-gordao-perambulando',
    restaurante_id: 'c47d7cf1-b374-4825-8f17-f10c928e57fd',
    influencer_id: '44444444-4444-4444-4444-444444444444',
    status: 'ativo',
    valor_mensal: 1500.0,
    inicio_em: new Date().toISOString(),
  }"""

video_str_seed = """    {
      restaurante_id: mapRestaurante('point-do-gordao'),
      influencer_id: mapInfluencer('perambulando-em-sp'),
      titulo: "Review de Point do Gordão por @perambulandoemsp",
      url_original: 'https://www.instagram.com/reel/C-pointdogordaosp/',
      transcricao: "À PARMEGIANA GIGANTE EM SP! 🧀😍 Perambulamos no @pointdogordaosp , que faz esse parmegiana gigante e sensacional! A carne é super macia, com muito queijo derretido e molho de tomate artesanal. Acompanha arroz e fritas sequinhas. Serve muito bem de 3 a 4 pessoas!",
      resumo: "Avaliação do bife à parmegiana gigante do Point do Gordão na Mooca, servido com arroz e batatas fritas.",
      palavras_chave: ['parmegiana', 'mooca', 'queijo', 'perambulandoemsp'],
      prato_destaque: 'Bife à Parmegiana Gigante*',
      thumbnail_url: '/images/placeholder-restaurant.jpg',
      video_url: '/videos/point-do-gordao.mp4',
      publicado_em: new Date().toISOString(),
    }"""


# 1. Update lib/supabase-mock.ts
print("Updating lib/supabase-mock.ts...")
with open("lib/supabase-mock.ts", "r", encoding="utf-8") as f:
    mock_content = f.read()

# Find the end of mockVideos
mock_content = mock_content.replace(
    "video_url: '/videos/navegando-200.mp4',\n    publicado_em: new Date().toISOString(),\n  }\n]",
    "video_url: '/videos/navegando-200.mp4',\n    publicado_em: new Date().toISOString(),\n  },\n" + video_str_mock + "\n]"
)

# Find the end of mockPlanos
mock_content = mock_content.replace(
    "valor_mensal: 1200.0,\n    inicio_em: new Date().toISOString(),\n  }\n]",
    "valor_mensal: 1200.0,\n    inicio_em: new Date().toISOString(),\n  },\n" + plano_str_mock + "\n]"
)

with open("lib/supabase-mock.ts", "w", encoding="utf-8") as f:
    f.write(mock_content)


# 2. Update app/api/videos/import/route.ts
print("Updating app/api/videos/import/route.ts...")
with open("app/api/videos/import/route.ts", "r", encoding="utf-8") as f:
    route_content = f.read()

# Find the end of mockVideos
route_content = route_content.replace(
    "video_url: '/videos/navegando-200.mp4',\n    publicado_em: new Date().toISOString(),\n  }\n]",
    "video_url: '/videos/navegando-200.mp4',\n    publicado_em: new Date().toISOString(),\n  },\n" + video_str_mock + "\n]"
)

# Find the end of mockPlanos
route_content = route_content.replace(
    "valor_mensal: 1200.0,\n    inicio_em: new Date().toISOString(),\n  }\n]",
    "valor_mensal: 1200.0,\n    inicio_em: new Date().toISOString(),\n  },\n" + plano_str_mock + "\n]"
)

# Update route restaurant and video count displays
route_content = route_content.replace("Todos os 180 restaurantes", "Todos os 181 restaurantes")
route_content = route_content.replace("Os 225 vídeos", "Os 226 vídeos")

with open("app/api/videos/import/route.ts", "w", encoding="utf-8") as f:
    f.write(route_content)


# 3. Update scripts/seed.ts
print("Updating scripts/seed.ts...")
with open("scripts/seed.ts", "r", encoding="utf-8") as f:
    seed_content = f.read()

# Find the end of videosData
seed_content = seed_content.replace(
    "video_url: '/videos/navegando-200.mp4',\n      publicado_em: new Date().toISOString(),\n    }\n]",
    "video_url: '/videos/navegando-200.mp4',\n      publicado_em: new Date().toISOString(),\n    },\n" + video_str_seed + "\n]"
)

with open("scripts/seed.ts", "w", encoding="utf-8") as f:
    f.write(seed_content)

print("All modifications completed successfully!")
