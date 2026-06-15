import json
import re
import uuid

scratchpad_path = r"C:\Users\guide\.gemini\antigravity-ide\brain\139330f3-a724-4511-a3da-c6e253ee3cd0\browser\scratchpad_k1wu8wmw.md"
mock_file_path = "lib/supabase-mock.ts"
route_file_path = "app/api/videos/import/route.ts"
seed_file_path = "scripts/seed.ts"

category_mapping = {
    "padaria.novaimperio": ("brunch", "Cachoeirinha", "São Paulo", "padaria.novaimperio", "padaria-nova-imperio", "Padaria Nova Império", "Bolo Pudim"),
    "hotelvillacharmosa": ("hotel", "São Pedro", "São Pedro", "hotelvillacharmosa", "hotel-villa-charmosa", "Hotel Villa Charmosa", "Hospedagem Pensão Completa"),
    "kiyomisushimariana": ("japones", "Vila Clementino", "São Paulo", "kiyomisushimariana", "kiyomi-sushi", "Kiyomi Sushi", "Barca Navio de 1,5m"),
    "hotelfazendaaurora": ("hotel", "Santa Isabel", "Santa Isabel", "hotelfazendaaurora", "hotel-fazenda-aurora", "Hotel Fazenda Aurora", "Hospedagem All Inclusive"),
    "pointdogordaosp": ("italiano", "Mooca", "São Paulo", "pointdogordaosp", "point-do-gordao", "Point do Gordão", "Bife à Parmegiana Gigante"),
    "pizzariaveroparadiso": ("italiano", "Paraíso", "São Paulo", "pizzariaveroparadiso", "pizzaria-vero-paradiso", "Pizzaria Vero Paradiso", "Rodízio de Pizza 50+ Sabores"),
    "thesteakfactory": ("churrasco", "Tatuapé", "São Paulo", "thesteakfactory", "the-steak-factory", "The Steak Factory", "Fondue no Pão Australiano"),
    "espetinhodojuizpatriarca": ("churrasco", "Patriarca", "São Paulo", "espetinhodojuizpatriarca", "espetinho-do-juiz-patriarca", "Espetinho do Juiz Patriarca", "Espetinho de Churrasco"),
    "fazendavaledacostela_atibaia": ("churrasco", "Atibaia", "Atibaia", "fazendavaledacostela_atibaia", "fazenda-vale-da-costela", "Fazenda Vale da Costela", "Costela Fogo de Chão"),
    "arabianightpaulista": ("utilidades", "Bela Vista", "São Paulo", "arabianightpaulista", "arabia-night-paulista", "Arábia Night Paulista", "Perfumes Árabes Importados"),
    "restaurante.parmesano": ("italiano", "Consolação", "São Paulo", "restaurante.parmesano", "restaurante-parmesano", "Restaurante Parmesano", "Spaghetti no Parmesão"),
    "glowparkoficial": ("passeio", "Brooklin", "São Paulo", "glowparkoficial", "glow-park", "Glow Park", "Parque de Trampolins"),
    "voltclubsp": ("passeio", "Bela Vista", "São Paulo", "voltclubsp", "volt-club", "Volt Club", "Balada Neon"),
    "cavalopreto_restaurante": ("churrasco", "Atibaia", "Atibaia", "cavalopreto_restaurante", "cavalo-preto-restaurante", "Cavalo Preto Restaurante", "Costela e Camarão à Vontade"),
    "resortfazendasaojoao": ("hotel", "São Pedro", "São Pedro", "resortfazendasaojoao", "resort-fazenda-sao-joao", "Resort Fazenda São João", "Hospedagem de Férias"),
    "sdesignparatyhotel": ("hotel", "Centro Histórico", "Paraty", "sdesignparatyhotel", "s-design-paraty-hotel", "S Design Paraty Hotel", "Hospedagem Design em Paraty"),
    "segredosdasgerais_consolacao": ("brasileira", "Consolação", "São Paulo", "segredosdasgerais_consolacao", "segredos-das-gerais", "Segredos das Gerais", "Rodízio de Chopp e Petiscos"),
    "puntapiedrasparrilla": ("churrasco", "Itaim Bibi", "São Paulo", "puntapiedrasparrilla", "punta-piedras-parrilla", "Punta Piedras Parrilla", "Filé Mignon na Parrilla"),
    "snackbreakfood": ("sobremesa", "Tatuapé", "São Paulo", "snackbreakfood", "snack-break-food", "Snack Break Food", "Chocotone Saudável"),
    "redecapivara": ("brasileira", "Pinheiros", "São Paulo", "redecapivara", "rede-capivara", "Rede Capivara", "Porções de Boteco"),
    "ocdopadre": ("brasileira", "Pinheiros", "São Paulo", "ocdopadre", "o-c-do-padre", "O C do Padre", "Batidas e Porções"),
    "barakiah": ("arabe", "Vila Guilherme", "São Paulo", "barakiah", "barakiah-esfihas", "Barakiah Esfihas", "Esfihas Tradicionais"),
    "dolce011sp": ("sobremesa", "Tatuapé", "São Paulo", "dolce011sp", "dolce-011-doceria", "Dolce 011 Doceria", "Fatias e Tortas Doces")
}

def get_instagram_handle(caption):
    handles = re.findall(r"@([a-zA-Z0-9_\.]+)", caption)
    for h in handles:
        h_lower = h.lower()
        if h_lower not in ["navegandosp", "perambulandoemsp", "esquentasp", "99food", "99brasil", "99foodbrasil", "jornaloglobo", "cbnoficial", "itau", "gordaodaoutlet", "daysepaparoto_oficial", "ocasaldesp", "otaldodu", "amarantehoteis", "juliocasalnascimento", "botecagem.sp", "undergroundsp", "sameculture.br"]:
            return h_lower
    return None

def extract_location(caption):
    match = re.search(r"📍([^\n]+)", caption)
    if match:
        location_line = match.group(1).strip()
        parts = re.split(r"[-–,]", location_line)
        if len(parts) >= 2:
            bairro = parts[-2].strip()
            cidade = parts[-1].strip()
            if "sp" in cidade.lower() or "são paulo" in cidade.lower():
                cidade = "São Paulo"
            if len(bairro) > 30:
                bairro = bairro[:30] + "..."
            return bairro, cidade
        else:
            loc = location_line.strip()
            if len(loc) > 30:
                loc = loc[:30]
            return loc, "São Paulo"
    return "Pinheiros", "São Paulo"

def determine_cuisine(caption):
    caption_lower = caption.lower()
    if any(k in caption_lower for k in ["pizza", "pizzaria", "massas", "parmegiana", "italiana", "dueamicicantina", "cucina"]):
        return "italiano"
    if any(k in caption_lower for k in ["burger", "hambúrguer", "cheddar", "pão com carne"]):
        return "hamburguer"
    if any(k in caption_lower for k in ["sushi", "japa", "sashimi", "temaki", "kiyomi", "hao"]):
        return "japones"
    if any(k in caption_lower for k in ["churrasco", "costela", "picanha", "grelhado", "carne", "parrilla", "babybeef", "ancho"]):
        return "churrasco"
    if any(k in caption_lower for k in ["bolo", "chocolate", "doce", "sobremesa", "nutella", "sorvete", "pudim", "panetone", "croissant", "candy", "doceria", "fondue", "chocotones"]):
        return "sobremesa"
    if any(k in caption_lower for k in ["saudável", "fit", "suplemento", "salada", "poke"]):
        return "saudavel"
    if any(k in caption_lower for k in ["café", "brunch", "padaria", "pão"]):
        return "brunch"
    if any(k in caption_lower for k in ["frutos do mar", "camarão", "lagosta", "peixe", "caranguejo", "moqueca", "seafood", "boil"]):
        return "frutos do mar"
    if any(k in caption_lower for k in ["mexicano", "taco", "nacho", "quesadilla"]):
        return "mexicano"
    if any(k in caption_lower for k in ["árabe", "kebab", "shawarma", "quibe", "esfiha"]):
        return "arabe"
    if any(k in caption_lower for k in ["hotel", "resort", "hospedagem", "viagem", "chalé"]):
        return "hotel"
    if any(k in caption_lower for k in ["outlet", "loja", "móveis", "cadeiras", "utilidades", "cosméticos"]):
        return "utilidades"
    return "brasileira"

def format_title_from_handle(handle):
    parts = re.findall(r"[a-zA-Z0-9]+", handle)
    capitalized = [p.capitalize() for p in parts]
    return " ".join(capitalized)

def esc_s(val):
    return str(val).replace("'", "\\'")

def esc_d(val):
    return str(val).replace('"', '\\"')

# 1. Parse existing restaurants from lib/supabase-mock.ts to avoid duplicates
print("Parsing existing restaurants...")
with open(mock_file_path, "r", encoding="utf-8") as f:
    mock_content = f.read()

match = re.search(r"const mockRestaurantes = \[\s*(.*?)\s*\]\s*const", mock_content, re.DOTALL)
if not match:
    match = re.search(r"const mockRestaurantes = \[\s*(.*?)\s*\]", mock_content, re.DOTALL)

existing_restaurants = {} # slug -> id
if match:
    rests_block = match.group(1)
    obj_pattern = re.compile(r"\{\s*id:\s*'([^']*)'.*?slug:\s*'([^']*)'.*?\}", re.DOTALL)
    for r_id, r_slug in obj_pattern.findall(rests_block):
        existing_restaurants[r_slug] = r_id
print(f"Loaded {len(existing_restaurants)} existing restaurants.")

# Count existing videos/planos
match_v = re.search(r"const mockVideos = \[\s*(.*?)\s*\]\s*const", mock_content, re.DOTALL)
existing_videos_count = 0
if match_v:
    existing_videos_count = len(re.findall(r"id:\s*'([^']+)'", match_v.group(1)))
print(f"Loaded {existing_videos_count} existing videos.")

# 2. Parse scratchpad k1wu8wmw.md
print("Loading scraped posts...")
with open(scratchpad_path, "r", encoding="utf-8") as f:
    posts = json.load(f)

print(f"Loaded {len(posts)} posts to process.")

peramb_id = "44444444-4444-4444-4444-444444444444"
esquenta_id = "55555555-5555-5555-5555-555555555555"

new_restaurantes_map = {} # slug -> rest_dict
new_restaurantes_list = []
new_videos_list = []
new_planos_list = []

peramb_idx = 0
esquenta_idx = 0

for i, post in enumerate(posts):
    url = post["url"]
    caption = post["caption"]
    
    # Check if Perambulando (0-52) or Esquenta (53-176)
    if i <= 52:
        influencer_id = peramb_id
        influencer_slug = "perambulando-em-sp"
        peramb_idx += 1
        video_code = f"perambulando-{peramb_idx:03d}"
    else:
        influencer_id = esquenta_id
        influencer_slug = "esquenta-sp"
        esquenta_idx += 1
        video_code = f"esquenta-{esquenta_idx:03d}"
        
    desc_cleaned = caption.replace("\n", " ").replace('"', '\\"').strip()
    desc_short = desc_cleaned[:120] + "..." if len(desc_cleaned) > 120 else desc_cleaned
    
    # Try to get handle
    handle = get_instagram_handle(caption)
    
    # Check mapping
    key = None
    if handle:
        for k in category_mapping:
            if k.lower() == handle or k.lower() in handle:
                key = k
                break
                
    if key:
        cozinha, bairro, cidade, inst_handle, slug, rest_name, prato = category_mapping[key]
    elif handle:
        cozinha = determine_cuisine(caption)
        bairro, cidade = extract_location(caption)
        inst_handle = handle
        slug = inst_handle.replace(".", "-").replace("_", "-")
        rest_name = format_title_from_handle(handle)
        prato = "Prato Especial"
    else:
        cozinha = determine_cuisine(caption)
        bairro, cidade = extract_location(caption)
        inst_handle = influencer_slug
        slug = f"recomendacao-{influencer_slug}-{i}"
        rest_name = f"Recomendação {influencer_slug.split('-')[0].capitalize()} {i}"
        prato = "Prato Especial"

    # Check if pointdogordaosp to map its real video
    if "pointdogordaosp" in slug or "point-do-gordao" in slug:
        video_path = "/videos/point-do-gordao.mp4"
    else:
        video_path = f"/videos/{video_code}.mp4"

    # Check if already exists in main database
    if slug in existing_restaurants:
        rest_uuid = existing_restaurants[slug]
    elif slug in new_restaurantes_map:
        rest_uuid = new_restaurantes_map[slug]["id"]
    else:
        rest_uuid = str(uuid.uuid4())
        rest_data = {
            "id": rest_uuid,
            "nome": rest_name,
            "slug": slug,
            "descricao": desc_short,
            "bairro": bairro,
            "cidade": cidade,
            "tipo_cozinha": cozinha,
            "preco_medio": "$$$" if "Michelin" in caption or "Premium" in caption or "Lagosta" in caption or "Preço Alto" in caption else "$$",
            "instagram_handle": inst_handle,
            "foto_capa_url": "/images/placeholder-restaurant.jpg",
            "ativo": True
        }
        new_restaurantes_map[slug] = rest_data
        new_restaurantes_list.append(rest_data)
        
        # Create plan
        plano_uuid = str(uuid.uuid4())
        new_planos_list.append({
            "id": plano_uuid,
            "restaurante_id": rest_uuid,
            "influencer_id": influencer_id,
            "status": "ativo",
            "valor_mensal": 1500.0 if influencer_id == peramb_id else 1200.0,
            "inicio_em": "2026-06-14T00:00:00Z"
        })

    # Create video
    # If the video ID v-gordao-perambulando is already manually added, skip adding duplicate video for index 13
    if influencer_id == peramb_id and "pointdogordaosp" in slug and i == 13:
        # Check if v-gordao-perambulando is in the existing videos
        # It's already in the file, so we skip adding another video for this exact post
        print(f"Skipping duplicate video for Point do Gordão (index {i}).")
        continue

    video_uuid = str(uuid.uuid4())
    new_videos_list.append({
        "id": video_uuid,
        "restaurante_id": rest_uuid,
        "influencer_id": influencer_id,
        "titulo": f"Review de {rest_name} por @{influencer_slug.split('-')[0]}sp",
        "url_original": url,
        "transcricao": desc_cleaned,
        "resumo": f"Review em vídeo detalhado de {rest_name} recomendado pelo perfil @{influencer_slug.split('-')[0]}sp.",
        "palavras_chave": [cozinha, bairro.lower(), f"{influencer_slug.split('-')[0]}sp"],
        "prato_destaque": prato,
        "thumbnail_url": "/images/placeholder-restaurant.jpg",
        "video_url": video_path,
        "publicado_em": "2026-06-14T00:00:00Z"
    })

print(f"Generated {len(new_restaurantes_list)} new unique restaurants.")
print(f"Generated {len(new_videos_list)} new videos.")
print(f"Generated {len(new_planos_list)} new partnership plans.")

# Format as TS/JS code arrays
new_rest_ts = []
for r in new_restaurantes_list:
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
    new_rest_ts.append(r_str)

new_vid_ts = []
for v in new_videos_list:
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
    new_vid_ts.append(v_str)

new_pla_ts = []
for p in new_planos_list:
    p_str = f"""  {{
    id: '{esc_s(p["id"])}',
    restaurante_id: '{esc_s(p["restaurante_id"])}',
    influencer_id: '{esc_s(p["influencer_id"])}',
    status: 'ativo',
    valor_mensal: {p["valor_mensal"]},
    inicio_em: new Date().toISOString(),
  }}"""
    new_pla_ts.append(p_str)

rest_injected = ",\n".join(new_rest_ts)
videos_injected = ",\n".join(new_vid_ts)
planos_injected = ",\n".join(new_pla_ts)

# Format for seed.ts
seed_rest_ts = []
for r in new_restaurantes_list:
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
for v in new_videos_list:
    kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in v["palavras_chave"])
    # Find matching restaurant slug from new or existing
    r_slug = "recomendacao-indefinida"
    found = False
    for r in new_restaurantes_list:
        if r["id"] == v["restaurante_id"]:
            r_slug = r["slug"]
            found = True
            break
    if not found:
        # Check existing restaurants from mock database
        for eslug, e_id in existing_restaurants.items():
            if e_id == v["restaurante_id"]:
                r_slug = eslug
                break
                
    inf_slug = "perambulando-em-sp" if v["influencer_id"] == peramb_id else "esquenta-sp"
    v_str = f"""    {{
      restaurante_id: mapRestaurante('{esc_s(r_slug)}'),
      influencer_id: mapInfluencer('{inf_slug}'),
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
for p in new_planos_list:
    r_slug = "recomendacao-indefinida"
    found = False
    for r in new_restaurantes_list:
        if r["id"] == p["restaurante_id"]:
            r_slug = r["slug"]
            found = True
            break
    if not found:
        for eslug, e_id in existing_restaurants.items():
            if e_id == p["restaurante_id"]:
                r_slug = eslug
                break
    inf_slug = "perambulando-em-sp" if p["influencer_id"] == peramb_id else "esquenta-sp"
    p_str = f"""    {{
      restaurante_id: mapRestaurante('{esc_s(r_slug)}'),
      influencer_id: mapInfluencer('{inf_slug}'),
      status: 'ativo',
      valor_mensal: {p["valor_mensal"]},
      inicio_em: new Date().toISOString(),
    }}"""
    seed_pla_ts.append(p_str)

seed_rest_injected = ",\n".join(seed_rest_ts)
seed_vid_injected = ",\n".join(seed_vid_ts)
seed_pla_injected = ",\n".join(seed_pla_ts)

# 3. Injecting into lib/supabase-mock.ts
print("Injecting data into lib/supabase-mock.ts...")
mock_content = re.sub(
    r"\}\s*\]\s*const\s+mockVideos\s*=\s*\[",
    "},\n" + rest_injected + "\n]\n\nconst mockVideos = [",
    mock_content
)
mock_content = re.sub(
    r"\}\s*\]\s*const\s+mockPlanos\s*=\s*\[",
    "},\n" + videos_injected + "\n]\n\nconst mockPlanos = [",
    mock_content
)
mock_content = re.sub(
    r"\}\s*\]\s*export\s+function\s+createMockSupabaseClient\(\)",
    "},\n" + planos_injected + "\n]\n\nexport function createMockSupabaseClient()",
    mock_content
)
with open(mock_file_path, "w", encoding="utf-8") as f:
    f.write(mock_content)

# 4. Injecting into app/api/videos/import/route.ts
print("Injecting data into app/api/videos/import/route.ts...")
with open(route_file_path, "r", encoding="utf-8") as f:
    route_content = f.read()

route_content = re.sub(
    r"\}\s*\]\s*const\s+mockVideos\s*=\s*\[",
    "},\n" + rest_injected + "\n]\n\nconst mockVideos = [",
    route_content
)
route_content = re.sub(
    r"\}\s*\]\s*const\s+mockPlanos\s*=\s*\[",
    "},\n" + videos_injected + "\n]\n\nconst mockPlanos = [",
    route_content
)
route_content = re.sub(
    r"\}\s*\]\s*export\s+async\s+function\s+POST\(\)",
    "},\n" + planos_injected + "\n]\n\nexport async function POST()",
    route_content
)

# Calculate total numbers for route.ts response
total_restaurantes = len(existing_restaurants) + len(new_restaurantes_list)
total_videos = existing_videos_count + len(new_videos_list)

route_content = re.sub(r"Todos os \d+ restaurantes", f"Todos os {total_restaurantes} restaurantes", route_content)
route_content = re.sub(r"Os \d+ vídeos", f"Os {total_videos} vídeos", route_content)
route_content = re.sub(r"Os \d+ restaurantes", f"Os {total_restaurantes} restaurantes", route_content)

with open(route_file_path, "w", encoding="utf-8") as f:
    f.write(route_content)

# 5. Injecting into scripts/seed.ts
print("Injecting data into scripts/seed.ts...")
with open(seed_file_path, "r", encoding="utf-8") as f:
    seed_content = f.read()

seed_content = re.sub(
    r"\}\s*\]\s*const\s+\{\s*data:\s*restaurantes,\s*error:\s*restError\s*\}\s*=\s*await\s+supabase",
    "},\n" + seed_rest_injected + "\n]\n\n  const { data: restaurantes, error: restError } = await supabase",
    seed_content
)
seed_content = re.sub(
    r"\}\s*\]\s*const\s+\{\s*error:\s*planError\s*\}\s*=\s*await\s+supabase\.from\('planos'\)",
    "},\n" + seed_pla_injected + "\n]\n\n  const { error: planError } = await supabase.from('planos')",
    seed_content
)
seed_content = re.sub(
    r"\}\s*\]\s*const\s+\{\s*error:\s*videoError\s*\}\s*=\s*await\s+supabase\.from\('videos'\)",
    "},\n" + seed_vid_injected + "\n]\n\n  const { error: videoError } = await supabase.from('videos')",
    seed_content
)
with open(seed_file_path, "w", encoding="utf-8") as f:
    f.write(seed_content)

print(f"Data injection complete! Total Restaurants: {total_restaurantes}, Total Videos: {total_videos}.")
