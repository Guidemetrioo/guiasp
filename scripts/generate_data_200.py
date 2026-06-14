import json
import re
import uuid

scratchpad_path = r"C:\Users\guide\.gemini\antigravity-ide\brain\eca577b3-ef68-4f9a-9a61-516e5505d13c\browser\scratchpad_7hquiebk.md"

category_mapping = {
    "hipposburger": ("hamburguer", "Vila Carrão", "São Paulo", "hipposburger", "hippos-burger", "Hippos Burger", "Croissant Burger"),
    "santomarestaurante": ("frutos do mar", "Tatuapé", "São Paulo", "santomarestaurante", "santomar-restaurante", "Santomar Restaurante", "Seafood Boil Bag"),
    "legadoparrilla": ("churrasco", "Anália Franco", "São Paulo", "legadoparrilla", "legado-parrilla", "Legado Parrilla", "Macarrão no Provolone"),
    "feiticobrasileiro": ("brasileira", "Consolação", "São Paulo", "feiticobrasileiro", "feitico-brasileiro", "Feitiço Brasileiro", "Rodízio de Massas / Salmão 2 Queijos"),
    "dolce011sp": ("sobremesa", "Tatuapé", "São Paulo", "dolce011sp", "dolce-011-doceria", "Dolce 011 Doceria", "Bolo Matilda e Pudim"),
    "somarcasoutletgru": ("utilidades", "Jardim Santa Francisca", "Guarulhos", "somarcasoutletgru", "so-marcas-outlet-guarulhos", "Só Marcas Outlet", "Outlet de Marcas Famosas"),
    "carola.restobar": ("brasileira", "Consolação", "São Paulo", "carola.restobar", "carola-restobar", "Carola Restobar", "Cumbuca de Moqueca"),
    "paparotocucina": ("italiano", "Pinheiros", "São Paulo", "paparotocucina", "paparoto-cucina", "Paparoto Cucina", "Linguini Al Tartufo Nero"),
    "omineiroprime": ("brasileira", "Consolação", "São Paulo", "omineiroprime", "o-mineiro-prime", "O Mineiro Prime", "Joelho de Porco Pururucado"),
    "padariacarillooficial": ("italiano", "Água Rasa", "São Paulo", "padariacarillooficial", "padaria-carillo", "Padaria Carillo", "Focaccia Italiana com Porchetta"),
    "sdesignparatyhotel": ("hotel", "Centro Histórico", "Paraty", "sdesignparatyhotel", "s-design-paraty-hotel", "S Design Paraty Hotel", "Hospedagem com Café da Manhã"),
    "hao.sushi.itaim": ("japones", "Vila Nova Conceição", "São Paulo", "hao.sushi.itaim", "hao-sushi-itaim", "Hao Sushi Itaim", "Rodízio Japonês"),
    "pointdogordaosp": ("italiano", "Mooca", "São Paulo", "pointdogordaosp", "point-do-gordao", "Point do Gordão", "Bife à Parmegiana Gigante"),
    "real.1937": ("brasileira", "Sumaré", "São Paulo", "real.1937", "real-1937-lanchonete", "Real 1937 Lanchonete", "Filé à Suíça / Parmegiana"),
    "newshoes.vilaromana": ("servico", "Vila Romana", "São Paulo", "newshoes.vilaromana", "new-shoes-lavanderia", "New Shoes Lavanderia", "Limpeza de Tênis"),
    "lkbeauty.shop": ("utilidades", "Brás", "São Paulo", "lkbeauty.shop", "lk-beauty-shop", "LK Beauty Shop", "Cosméticos e Produtos de Cabelo"),
    "vacapollochancho": ("mexicano", "Tatuapé", "São Paulo", "vacapollochancho", "vaca-pollo-chancho", "Vaca Pollo Chancho", "Rodízio Mexicano All Inclusive"),
    "flordoparaisooficial": ("brasileira", "Vila Mariana", "São Paulo", "flordoparaisooficial", "flor-do-paraiso", "Flor do Paraíso", "Carne Cubana Gigante"),
    "villaeprosa": ("brasileira", "Vila Mariana", "São Paulo", "villaeprosa", "villa-e-prosa", "Villa e Prosa", "Peixe Recheado com Camarão"),
    "pecattosp": ("italiano", "Tatuapé", "São Paulo", "pecattosp", "pecatto-tatuape", "Pecatto Tatuapé", "Parmegiana de Cupim com Cheddar & Bacon"),
    "omineirosp": ("brasileira", "Consolação", "São Paulo", "omineirosp", "o-mineiro", "O Mineiro", "Picanha Argentina na Chapa"),
    "carrorestaurante": ("passeio", "Guararema", "Guararema", "carrorestaurante", "carro-restaurante-trem", "Trem de Guararema Carro Restaurante", "Passeio de Trem All Inclusive"),
    "myjordoceria": ("sobremesa", "Tatuapé", "São Paulo", "myjordoceria", "my-jor-doceria", "My Jor Doceria", "Bolo de Morango com Chocolate Trufado"),
    "ahyprimesushi": ("japones", "Jardins", "São Paulo", "ahyprimesushi", "ahy-prime-sushi", "Ahy Prime Sushi", "Sushi à La Carte"),
    "cafepretoebranco2d": ("sobremesa", "Itaguá", "Ubatuba", "cafepretoebranco2d", "cafe-preto-e-branco-2d", "Café Preto e Branco 2D", "Croissant Especial e Café"),
    "restaurantemomo": ("japones", "Jardins", "São Paulo", "restaurantemomo", "restaurante-momozinho", "Restaurante Momozinho", "Temaki Gigante"),
    "sejatotalgalpao": ("saudavel", "Parque Mandaqui", "São Paulo", "sejatotalgalpao", "seja-total-galpao", "Seja Total Galpão", "Suplementos Alimentares"),
    "moveisdubaioficial": ("utilidades", "Mogi das Cruzes", "São Paulo", "moveisdubaioficial", "moveis-dubai", "Móveis Dubai", "Móveis a Preço de Fábrica"),
    "moveisjunco": ("utilidades", "Alphaville", "São Paulo", "moveisjunco", "moveis-junco", "Móveis Junco", "Feirão de Móveis Externos"),
    "nestorpizzariagastro": ("italiano", "Vila Prudente", "São Paulo", "nestorpizzariagastro", "nestor-pizzaria", "Nestor Pizzaria", "Rodízio de Pizza 60+ Sabores"),
    "pokesmomo": ("saudavel", "Pinheiros", "São Paulo", "pokesmomo", "pokes-momo", "Pokes Momo", "Poke com Pipoca de Lagosta"),
    "baixopinheirosbar": ("brasileira", "Pinheiros", "São Paulo", "baixopinheirosbar", "baixo-pinheiros-bar", "Baixo Pinheiros Bar", "Drinks e Balada Multilíngue"),
    "auraagastrobar": ("churrasco", "Bela Vista", "São Paulo", "auraagastrobar", "auraa-gastrobar", "Auraa Gastrobar", "Tomahawk para 2"),
    "kureijicandy": ("sobremesa", "Liberdade", "São Paulo", "kureijicandy", "kureiji-candy", "Kureiji Candy", "Ursinhos e Crocs Recheados"),
    "pantchoshouse": ("hamburguer", "Interlagos", "São Paulo", "pantchoshouse", "pantchos-house-burger", "Pantcho's House Burger", "Jack Ribs Burger"),
    "cadeirasinc": ("utilidades", "SBC", "São Bernardo do Campo", "cadeirasinc", "cadeiras-inc", "Cadeiras Inc", "Cadeiras a Preço de Custo"),
    "padariabellapaulista": ("brunch", "Cerqueira César", "São Paulo", "padariabellapaulista", "bella-paulista", "Bella Paulista", "Buffet de Sopas e Doces 24h"),
    "botequimpaulista": ("brasileira", "Moema", "São Paulo", "botequimpaulista", "botequim-paulista", "Botequim Paulista", "Cupim Casqueirado na Telha"),
    "kenichisushimooca": ("japones", "Mooca", "São Paulo", "kenichisushimooca", "kenichi-sushi-mooca", "Kenichi Sushi Mooca", "Rodízio Japonês Premium"),
    "estacaopraca": ("brasileira", "Centro", "São Bernardo do Campo", "estacaopraca", "estacao-praca-gastrobar", "Estação Praça Gastrobar", "Cortes de Carnes e Drinks"),
    "padariacasacunha": ("brunch", "Perdizes", "São Paulo", "padariacasacunha", "casa-cunha-padaria", "Casa Cunha Padaria", "Café da Manhã à Vontade"),
    "butecodeminassp": ("brasileira", "Consolação", "São Paulo", "butecodeminassp", "buteco-de-minas", "Buteco de Minas", "Picanha Argentina"),
    "quintalbarsp": ("brasileira", "Tatuapé", "São Paulo", "quintalbarsp", "quintal-bar", "Quintal Bar", "Festival de Caldos com Fondue"),
    "orbafbiergarden": ("churrasco", "Mairiporã", "Mairiporã", "orbafbiergarden", "orbaf-biergarten", "Orbaf Biergarten", "Fondue com Fogueira"),
    "recaantoo": ("brasileira", "Caieiras", "Caieiras", "recaantoo", "recanto-costela-de-chao", "Recanto Costela de Chão", "Churrasco à Vontade"),
    "deadburgerlapa": ("hamburguer", "Lapa", "São Paulo", "deadburgerlapa", "dead-burger-lapa", "Dead Burger Lapa", "Hamburgueria Temática de Terror"),
    "tocadopeixedf": ("frutos do mar", "Núcleo Bandeirante", "Brasília", "tocadopeixedf", "toca-do-peixe", "Toca do Peixe", "Tilápia Gigante"),
}

def get_instagram_handle(caption):
    # Find all handles
    handles = re.findall(r"@([a-zA-Z0-9_\.]+)", caption)
    for h in handles:
        h_lower = h.lower()
        if h_lower not in ["navegandosp", "99food", "colaemsampa", "perambulandoemsp", "99foodbrasil", "jornaloglobo", "cbnoficial", "itau", "gordaodaoutlet", "daysepaparoto_oficial", "ocasaldesp", "otaldodu", "amarantehoteis"]:
            return h_lower
    return None

def extract_location(caption):
    # Match Pin Emoji
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
    if any(k in caption_lower for k in ["sushi", "japa", "sashimi", "temaki"]):
        return "japones"
    if any(k in caption_lower for k in ["churrasco", "costela", "picanha", "grelhado", "carne", "parrilla"]):
        return "churrasco"
    if any(k in caption_lower for k in ["bolo", "chocolate", "doce", "sobremesa", "nutella", "sorvete", "pudim", "panetone", "croissant", "candy", "doceria"]):
        return "sobremesa"
    if any(k in caption_lower for k in ["saudável", "fit", "suplemento", "salada", "poke"]):
        return "saudavel"
    if any(k in caption_lower for k in ["café", "brunch", "padaria", "pão"]):
        return "brunch"
    if any(k in caption_lower for k in ["frutos do mar", "camarão", "lagosta", "peixe", "caranguejo", "moqueca", "seafood"]):
        return "frutos do mar"
    if any(k in caption_lower for k in ["mexicano", "taco", "nacho", "quesadilla"]):
        return "mexicano"
    if any(k in caption_lower for k in ["árabe", "kebab", "shawarma", "quibe", "esfiha"]):
        return "arabe"
    if any(k in caption_lower for k in ["hotel", "resort", "hospedagem", "viagem"]):
        return "hotel"
    if any(k in caption_lower for k in ["outlet", "loja", "móveis", "cadeiras", "utilidades", "cosméticos"]):
        return "utilidades"
    return "brasileira"

def format_title_from_handle(handle):
    # e.g. "hipposburger" -> "Hippos Burger"
    parts = re.findall(r"[a-zA-Z0-9]+", handle)
    capitalized = [p.capitalize() for p in parts]
    return " ".join(capitalized)

# 1. Parse scratchpad
with open(scratchpad_path, "r", encoding="utf-8") as f:
    content = f.read()

blocks = re.findall(r"```json\n(.*?)\n```", content, re.DOTALL)
all_posts = []
for block in blocks:
    all_posts.extend(json.loads(block.strip()))

# Remove duplicates based on URL
seen_urls = set()
unique_posts = []
for post in all_posts:
    if post["url"] not in seen_urls:
        seen_urls.add(post["url"])
        unique_posts.append(post)

print(f"Loaded {len(unique_posts)} unique posts.")

# 2. Map posts to restaurants and videos
influencer_id = "11111111-1111-1111-1111-111111111111" # Navegando SP

restaurantes_map = {} # handle -> restaurante dict
restaurantes_list = []
videos_list = []
planos_list = []

# To ensure unique restaurants, we keep tracks of handles or generated slugs
for idx, post in enumerate(unique_posts, 1):
    url = post["url"]
    caption = post["caption"]
    
    # Clean description
    desc_cleaned = caption.replace("\n", " ").replace('"', '\\"').strip()
    desc_short = desc_cleaned[:120] + "..." if len(desc_cleaned) > 120 else desc_cleaned
    
    # Try to get handle
    handle = get_instagram_handle(caption)
    
    # Check if handle matches any known mapping
    key = None
    if handle:
        for k in category_mapping:
            if k.lower() == handle or k.lower() in handle:
                key = k
                break
                
    if key:
        cozinha, bairro, cidade, inst_handle, slug, rest_name, prato = category_mapping[key]
    elif handle:
        # Generate details from handle
        cozinha = determine_cuisine(caption)
        bairro, cidade = extract_location(caption)
        inst_handle = handle
        slug = inst_handle.replace(".", "-").replace("_", "-")
        rest_name = format_title_from_handle(handle)
        prato = "Prato Especial"
    else:
        # Absolute fallback
        cozinha = determine_cuisine(caption)
        bairro, cidade = extract_location(caption)
        inst_handle = "navegandosp"
        slug = f"recomendacao-navegando-{idx}"
        rest_name = f"Recomendação Navegando {idx}"
        prato = "Prato Especial"
        
    # Check if restaurant already exists
    if slug in restaurantes_map:
        rest_uuid = restaurantes_map[slug]["id"]
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
        restaurantes_map[slug] = rest_data
        restaurantes_list.append(rest_data)
        
        # Add a partnership plan for each new restaurant
        plano_uuid = str(uuid.uuid4())
        planos_list.append({
            "id": plano_uuid,
            "restaurante_id": rest_uuid,
            "influencer_id": influencer_id,
            "status": "ativo",
            "valor_mensal": 1200.0,
            "inicio_em": "2026-06-14T00:00:00Z"
        })
        
    # Generate video
    video_uuid = str(uuid.uuid4())
    video_code = f"navegando-{idx:03d}"
    video_path = f"/videos/{video_code}.mp4"
    
    videos_list.append({
        "id": video_uuid,
        "restaurante_id": rest_uuid,
        "influencer_id": influencer_id,
        "titulo": f"Review de {rest_name} por @navegandosp",
        "url_original": url,
        "transcricao": desc_cleaned,
        "resumo": f"Review em vídeo detalhado de {rest_name} recomendado pelo influenciador @navegandosp.",
        "palavras_chave": [cozinha, bairro.lower(), "navegandosp"],
        "prato_destaque": prato,
        "thumbnail_url": "/images/placeholder-restaurant.jpg",
        "video_url": video_path,
        "publicado_em": "2026-06-14T00:00:00Z"
    })

print(f"Generated {len(restaurantes_list)} unique restaurants, {len(videos_list)} videos and {len(planos_list)} plans.")

# Helper to escape single/double quotes safely
def esc_s(val):
    return str(val).replace("'", "\\'")

def esc_d(val):
    return str(val).replace('"', '\\"')

# Format for Supabase-mock.ts and import/route.ts
rest_ts = []
for r in restaurantes_list:
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
for v in videos_list:
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
for p in planos_list:
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

# Format for seed.ts
seed_rest_ts = []
for r in restaurantes_list:
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
for v in videos_list:
    kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in v["palavras_chave"])
    # Find matching restaurant slug
    r_slug = "recomendacao-indefinida"
    for r in restaurantes_list:
        if r["id"] == v["restaurante_id"]:
            r_slug = r["slug"]
            break
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

seed_rest_injected = ",\n".join(seed_rest_ts)
seed_vid_injected = ",\n".join(seed_vid_ts)

# Update lib/supabase-mock.ts
print("Updating lib/supabase-mock.ts...")
with open("lib/supabase-mock.ts", "r", encoding="utf-8") as f:
    mock_content = f.read()

mock_content = mock_content.replace(
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  }\n]",
    "    foto_capa_url: '/images/legado-parrilla.jpg',\n    ativo: true,\n  },\n" + restaurantes_injected + "\n]"
)
mock_content = mock_content.replace(
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  }\n]",
    "    thumbnail_url: '/images/legado-parrilla.jpg',\n    publicado_em: new Date().toISOString(),\n  },\n" + videos_injected + "\n]"
)
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

# Replace count numbers in route string
route_content = re.sub(r"Todos os \d+ restaurantes", f"Todos os {25 + len(restaurantes_list)} restaurantes", route_content)
route_content = re.sub(r"Os \d+ vídeos", f"Os {25 + len(videos_list)} vídeos", route_content)
route_content = re.sub(r"Os \d+ restaurantes", f"Os {25 + len(restaurantes_list)} restaurantes", route_content)

with open("app/api/videos/import/route.ts", "w", encoding="utf-8") as f:
    f.write(route_content)

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

with open("scripts/seed.ts", "w", encoding="utf-8") as f:
    f.write(seed_content)

print(f"All files updated successfully with {len(videos_list)} new chronological @navegandosp posts!")
