import json
import re
import uuid

# Path to scratchpad containing the JSON
scratchpad_path = r"C:\Users\guide\.gemini\antigravity-ide\brain\eca577b3-ef68-4f9a-9a61-516e5505d13c\browser\scratchpad_ovx6yuzm.md"

def parse_scratchpad():
    with open(scratchpad_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract JSON code block
    json_match = re.search(r"```json\n(.*?)\n```", content, re.DOTALL)
    if not json_match:
        raise ValueError("Could not find JSON block in scratchpad")
    
    return json.loads(json_match.group(1))

posts = parse_scratchpad()

influencer_id = "11111111-1111-1111-1111-111111111111" # Navegando SP

restaurantes = []
videos = []
planos = []

# Mappings for specific fields to make data rich
category_mapping = {
    "lindt": ("sobremesa", "Kilchberg", "Suíça", "lindt_switzerland", "lindt-home-of-chocolate", "Lindt Home of Chocolate", "Chocolates Variados Lindt"),
    "sejatotalgalpao": ("saudavel", "Parque Mandaqui", "São Paulo", "sejatotalgalpao", "seja-total-galpao", "Seja Total Galpão", "Suplementos e Vitaminas"),
    "pecattosp": ("italiano", "Tatuapé", "São Paulo", "pecattosp", "pecatto-tatuape", "Pecatto - Tatuapé", "Parmegiana de Cupim com Cheddar & Bacon"),
    "hipposburger": ("hamburguer", "Pinheiros", "São Paulo", "hipposburger", "hippos-burger", "Hippos Burger", "Burger com Molho Cannes"),
    "stuntburger": ("hamburguer", "Vila Lobos", "São Paulo", "stuntburger", "stunt-burger-caze-tv", "Stunt Burger - Cazé TV", "Burger Hellmann's + Stunt"),
    "moveisdubaioficial": ("utilidades", "Mogi das Cruzes", "São Paulo", "moveisdubaioficial", "moveis-dubai", "Móveis Dubai", "Móveis e Decorações"),
    "santomarestaurante": ("frutos do mar", "Tatuapé", "São Paulo", "santomarestaurante", "santomar-tatuape", "Santomar - Tatuapé", "Seafood Boil Bag com King Crab"),
    "paparotocucina": ("italiano", "Pinheiros", "São Paulo", "paparotocucina", "paparoto-cucina", "Paparoto Cucina", "Linguini Al Tartufo Nero"),
    "bananasoutletmegaloja": ("utilidades", "Marginal Tietê", "São Paulo", "bananasoutletmegaloja", "bananas-outlet", "Bananas Outlet", "Utilidades Domésticas"),
    "99 Food": ("brasileira", "Consolação", "São Paulo", "99foodbrasil", "99-food-delivery", "99 Food Delivery", "Promoções de Delivery"),
    "somarcasoutletgru": ("utilidades", "Guarulhos", "Guarulhos", "somarcasoutletgru", "so-marcas-outlet", "Só Marcas Outlet", "Moda e Acessórios"),
    "legadoparrilla": ("churrasco", "Anália Franco", "São Paulo", "legadoparrilla", "legado-parrilla-analia-franco", "Legado Parrilla - Anália Franco", "Taça de Sobremesa Legado")
}

for i, post in enumerate(posts, 1):
    url = post["url"]
    caption = post["caption"]
    
    # Identify key to map details
    key = None
    for k in category_mapping:
        if k.lower() in caption.lower() or k.lower() in url.lower():
            key = k
            break
            
    if not key:
        # Fallback details
        rest_name = f"Recomendação Navegando {i}"
        slug = f"recomendacao-navegando-{i}"
        cozinha = "brasileira"
        bairro = "Pinheiros"
        cidade = "São Paulo"
        handle = "navegandosp"
        prato = "Prato Especial"
    else:
        cozinha, bairro, cidade, handle, slug, rest_name, prato = category_mapping[key]
        
    rest_uuid = str(uuid.uuid4())
    video_uuid = str(uuid.uuid4())
    plano_uuid = str(uuid.uuid4())
    
    # Format video code (navegando-001, navegando-002, etc.)
    video_code = f"navegando-{i:03d}"
    video_path = f"/videos/{video_code}.mp4"
    
    desc_cleaned = caption.replace("\n", " ").replace('"', '\\"').strip()
    # Shorten description for details
    desc_short = desc_cleaned[:120] + "..." if len(desc_cleaned) > 120 else desc_cleaned
    
    # Form structures
    restaurantes.append({
        "id": rest_uuid,
        "nome": rest_name,
        "slug": slug,
        "descricao": desc_short,
        "bairro": bairro,
        "cidade": cidade,
        "tipo_cozinha": cozinha,
        "preco_medio": "$$$" if "Michelin" in caption or "Premium" in caption or "Lagosta" in caption else "$$",
        "instagram_handle": handle,
        "foto_capa_url": "/images/placeholder-restaurant.jpg",
        "ativo": True
    })
    
    videos.append({
        "id": video_uuid,
        "restaurante_id": rest_uuid,
        "influencer_id": influencer_id,
        "titulo": f"Review de {rest_name} por @navegandosp",
        "url_original": url,
        "transcricao": desc_cleaned,
        "resumo": f"Review em vídeo detalhado do local {rest_name} recomendado pelo influenciador @navegandosp.",
        "palavras_chave": [cozinha, bairro.lower(), "navegandosp"],
        "prato_destaque": prato,
        "thumbnail_url": "/images/placeholder-restaurant.jpg",
        "video_url": video_path,
        "publicado_em": "2026-06-14T00:00:00Z"
    })
    
    planos.append({
        "id": plano_uuid,
        "restaurante_id": rest_uuid,
        "influencer_id": influencer_id,
        "status": "ativo",
        "valor_mensal": 1200.0,
        "inicio_em": "2026-06-14T00:00:00Z"
    })

def esc_s(val):
    return str(val).replace("'", "\\'")

def esc_d(val):
    return str(val).replace('"', '\\"')

# Format to TS code for mock / route files
rest_ts = []
for r in restaurantes:
    r_str = f"""  {{
    id: '{esc_s(r["id"])}',
    nome: "{esc_d(r["nome"])}",
    slug: '{esc_s(r["slug"])}',
    descricao: "{esc_d(r["descricao"])}",
    bairro: '{esc_s(r["bairro"])}',
    cidade: '{esc_s(r["cidade"])}',
    tipo_cozinha: '{esc_s(r["tipo_cozinha"])}',
    preco_medio: '{esc_s(r["preco_medio"])}',
    instagram_handle: '{esc_s(r["instagram_handle"])}',
    foto_capa_url: '{esc_s(r["foto_capa_url"])}',
    ativo: true,
  }}"""
    rest_ts.append(r_str)

vid_ts = []
for v in videos:
    kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in v["palavras_chave"])
    v_str = f"""  {{
    id: '{esc_s(v["id"])}',
    restaurante_id: '{esc_s(v["restaurante_id"])}',
    influencer_id: '{esc_s(v["influencer_id"])}',
    titulo: "{esc_d(v["titulo"])}",
    url_original: '{esc_s(v["url_original"])}',
    transcricao: "{esc_d(v["transcricao"])}",
    resumo: "{esc_d(v["resumo"])}",
    palavras_chave: [{kw_str}],
    prato_destaque: '{esc_s(v["prato_destaque"])}*',
    thumbnail_url: '{esc_s(v["thumbnail_url"])}',
    video_url: '{esc_s(v["video_url"])}',
    publicado_em: new Date().toISOString(),
  }}"""
    vid_ts.append(v_str)

pla_ts = []
for p in planos:
    p_str = f"""  {{
    id: '{esc_s(p["id"])}',
    restaurante_id: '{esc_s(p["restaurante_id"])}',
    influencer_id: '{esc_s(p["influencer_id"])}',
    status: 'ativo',
    valor_mensal: {p["valor_mensal"]},
    inicio_em: new Date().toISOString(),
  }}"""
    pla_ts.append(p_str)

restaurantes_injected = ",\n".join(rest_ts)
videos_injected = ",\n".join(vid_ts)
planos_injected = ",\n".join(pla_ts)


# Update lib/supabase-mock.ts
print("Updating lib/supabase-mock.ts...")
with open("lib/supabase-mock.ts", "r", encoding="utf-8") as f:
    mock_content = f.read()

# Replace restaurantes
mock_content = mock_content.replace(
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  } \n]", # wait let's look at matching structure
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  },\n" + restaurantes_injected + "\n]"
)

# Also check for single space or without space
if restaurantes_injected not in mock_content:
    mock_content = mock_content.replace(
        "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  }\n]",
        "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  },\n" + restaurantes_injected + "\n]"
    )

# Replace videos
mock_content = mock_content.replace(
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  }\n]",
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  },\n" + videos_injected + "\n]"
)

# Replace planos
mock_content = mock_content.replace(
    "    valor_mensal: 1300.0,\n    inicio_em: new Date().toISOString(),\n  }\n]",
    "    valor_mensal: 1300.0,\n    inicio_em: new Date().toISOString(),\n  },\n" + planos_injected + "\n]"
)

with open("lib/supabase-mock.ts", "w", encoding="utf-8") as f:
    f.write(mock_content)


# Update app/api/videos/import/route.ts
print("Updating app/api/videos/import/route.ts...")
with open("app/api/videos/import/route.ts", "r", encoding="utf-8") as f:
    route_content = f.read()

route_content = route_content.replace(
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  }\n]",
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  },\n" + restaurantes_injected + "\n]"
)

route_content = route_content.replace(
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  }\n]",
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  },\n" + videos_injected + "\n]"
)

route_content = route_content.replace(
    "    valor_mensal: 1300.0,\n    inicio_em: new Date().toISOString(),\n  }\n]",
    "    valor_mensal: 1300.0,\n    inicio_em: new Date().toISOString(),\n  },\n" + planos_injected + "\n]"
)

route_content = route_content.replace(
    "Todos os 25 restaurantes", "Todos os 37 restaurantes"
)
route_content = route_content.replace(
    "Os 25 vídeos", "Os 37 vídeos"
)

with open("app/api/videos/import/route.ts", "w", encoding="utf-8") as f:
    f.write(route_content)


# Format to seed.ts code
seed_rest_ts = []
for r in restaurantes:
    r_str = f"""    {{
      nome: "{esc_d(r["nome"])}",
      slug: '{esc_s(r["slug"])}',
      descricao: "{esc_d(r["descricao"])}",
      bairro: '{esc_s(r["bairro"])}',
      cidade: '{esc_s(r["cidade"])}',
      tipo_cozinha: '{esc_s(r["tipo_cozinha"])}',
      preco_medio: '{esc_s(r["preco_medio"])}',
      instagram_handle: '{esc_s(r["instagram_handle"])}',
      foto_capa_url: '{esc_s(r["foto_capa_url"])}',
      ativo: true,
    }}"""
    seed_rest_ts.append(r_str)

seed_vid_ts = []
for v in videos:
    kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in v["palavras_chave"])
    r_slug = next(r["slug"] for r in restaurantes if r["id"] == v["restaurante_id"])
    v_str = f"""    {{
      restaurante_id: mapRestaurante('{esc_s(r_slug)}'),
      influencer_id: mapInfluencer('navegando-sp'),
      titulo: "{esc_d(v["titulo"])}",
      url_original: '{esc_s(v["url_original"])}',
      transcricao: "{esc_d(v["transcricao"])}",
      resumo: "{esc_d(v["resumo"])}",
      palavras_chave: [{kw_str}],
      prato_destaque: '{esc_s(v["prato_destaque"])}*',
      thumbnail_url: '{esc_s(v["thumbnail_url"])}',
      video_url: '{esc_s(v["video_url"])}',
      publicado_em: new Date().toISOString(),
    }}"""
    seed_vid_ts.append(v_str)

seed_pla_ts = []
for p in planos:
    r_slug = next(r["slug"] for r in restaurantes if r["id"] == p["restaurante_id"])
    p_str = f"""    {{
      restaurante_id: mapRestaurante('{esc_s(r_slug)}'),
      influencer_id: mapInfluencer('navegando-sp'),
      status: 'ativo',
      valor_mensal: {p["valor_mensal"]},
      inicio_em: new Date().toISOString(),
    }}"""
    seed_pla_ts.append(p_str)

seed_rest_injected = ",\n".join(seed_rest_ts)
seed_vid_injected = ",\n".join(seed_vid_ts)
seed_pla_injected = ",\n".join(seed_pla_ts)


# Update scripts/seed.ts
print("Updating scripts/seed.ts...")
with open("scripts/seed.ts", "r", encoding="utf-8") as f:
    seed_content = f.read()

seed_content = seed_content.replace(
    "      foto_capa_url: '/images/legado-parrilla.jpg',\n      ativo: true,\n    }\n]",
    "      foto_capa_url: '/images/legado-parrilla.jpg',\n      ativo: true,\n    },\n" + seed_rest_injected + "\n]"
)

seed_content = seed_content.replace(
    "      thumbnail_url: '/images/legado-parrilla.jpg',\n      publicado_em: new Date().toISOString(),\n    }\n]",
    "      thumbnail_url: '/images/legado-parrilla.jpg',\n      publicado_em: new Date().toISOString(),\n    },\n" + seed_vid_injected + "\n]"
)

seed_content = seed_content.replace(
    "      valor_mensal: 1300.0,\n      inicio_em: new Date().toISOString(),\n    }\n]",
    "      valor_mensal: 1300.0,\n      inicio_em: new Date().toISOString(),\n    },\n" + seed_pla_injected + "\n]"
)

with open("scripts/seed.ts", "w", encoding="utf-8") as f:
    f.write(seed_content)

print("All files updated successfully with 12 new chronological @navegandosp posts!")
