import os
import sys
import re
import json
import uuid
import time
import random
import unicodedata
import subprocess

# Auto-install/check packages
def ensure_dependencies():
    packages = {
        "yt_dlp": "yt-dlp",
        "google.generativeai": "google-generativeai",
        "requests": "requests"
    }
    for imp_name, pkg_name in packages.items():
        try:
            if imp_name == "google.generativeai":
                import google.generativeai
            else:
                __import__(imp_name)
        except ImportError:
            print(f"Instalando dependência ausente: '{pkg_name}'...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", pkg_name])
            except Exception as e:
                print(f"Erro ao instalar {pkg_name}: {e}")
                print(f"Por favor, execute manualmente: pip install {pkg_name}")
                sys.exit(1)

ensure_dependencies()

import yt_dlp
import google.generativeai as genai
import requests

# Influencers mapping
INFLUENCERS = {
    "navegandosp": {
        "id": "11111111-1111-1111-1111-111111111111",
        "nome": "Navegando SP",
        "slug": "navegando-sp"
    },
    "perambulandoemsp": {
        "id": "44444444-4444-4444-4444-444444444444",
        "nome": "Perambulando em SP",
        "slug": "perambulando-em-sp"
    },
    "esquentasp": {
        "id": "55555555-5555-5555-5555-555555555555",
        "nome": "Esquenta SP",
        "slug": "esquenta-sp"
    }
}

def load_env():
    env = {}
    if os.path.exists(".env.local"):
        with open(".env.local", "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        env[parts[0].strip()] = parts[1].strip()
    return env

def slugify(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

def esc_s(val):
    if val is None:
        return ""
    return str(val).replace("'", "\\'")

def esc_d(val):
    if val is None:
        return ""
    return str(val).replace('"', '\\"')

def insert_into_array_block(content, array_name, new_item_str):
    pattern = rf"(const|let|var)\s+{array_name}\s*(:\s*[^=]+)?\s*=\s*\["
    match = re.search(pattern, content)
    if not match:
        raise ValueError(f"Could not find start of array: {array_name}")
        
    start_idx = match.start()
    bracket_idx = content.find("[", start_idx)
    if bracket_idx == -1:
        raise ValueError(f"Could not find opening bracket for {array_name}")
        
    bracket_count = 1
    i = bracket_idx + 1
    while i < len(content) and bracket_count > 0:
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
        i += 1
        
    if bracket_count > 0:
        raise ValueError(f"Mismatched brackets for array {array_name}")
        
    insert_pos = i - 1
    before_bracket = content[bracket_idx+1:insert_pos].strip()
    
    prefix = content[:insert_pos].rstrip()
    if before_bracket and not before_bracket.endswith(",") and not prefix.endswith(",") and not prefix.endswith("["):
        prefix += ","
        
    suffix = content[insert_pos:]
    return prefix + "\n" + new_item_str + "\n" + suffix

def check_existing_restaurant_in_mock(mock_content, rest_name, rest_slug):
    # Search by slug or name
    slug_match = re.search(rf"slug:\s*'{re.escape(rest_slug)}'", mock_content)
    if slug_match:
        # Try to find ID of this restaurant entry
        # Let's search back from slug_match for id: '...'
        context = mock_content[max(0, slug_match.start() - 200):slug_match.start()]
        id_match = re.search(r"id:\s*'([^']+)'", context)
        if id_match:
            return id_match.group(1)
            
    name_clean = slugify(rest_name)
    # Search for matching name
    pattern = rf"nome:\s*['\x22]([^'\x22]+)['\x22]"
    for match in re.finditer(pattern, mock_content):
        found_name = match.group(1)
        if slugify(found_name) == name_clean:
            context = mock_content[max(0, match.start() - 200):match.start()]
            id_match = re.search(r"id:\s*'([^']+)'", context)
            if id_match:
                return id_match.group(1)
                
    return None

def main():
    if len(sys.argv) < 2:
        print("Uso: python scripts/import_instagram_ai.py <url_do_reel> [--browser <chrome|firefox|edge>] [--influencer <slug_do_influencer>]")
        sys.exit(1)
        
    url = sys.argv[1]
    browser_name = None
    cli_influencer = None
    
    if "--browser" in sys.argv:
        try:
            b_idx = sys.argv.index("--browser")
            browser_name = sys.argv[b_idx + 1]
        except Exception:
            pass
            
    if "--influencer" in sys.argv:
        try:
            i_idx = sys.argv.index("--influencer")
            cli_influencer = sys.argv[i_idx + 1]
        except Exception:
            pass

    env = load_env()
    gemini_key = env.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        print("❌ Erro: GEMINI_API_KEY não encontrada em .env.local ou nas variáveis de ambiente.")
        print("Por favor, adicione GEMINI_API_KEY=sua_chave no arquivo .env.local")
        sys.exit(1)
        
    genai.configure(api_key=gemini_key)
    
    # Ensure folders exist
    os.makedirs("public/videos", exist_ok=True)
    temp_video_path = os.path.join("public", "videos", "temp_import.mp4")
    
    # 1. Download Video and extract metadata
    print("🎬 Baixando vídeo do Instagram e metadados...")
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': temp_video_path,
        'quiet': True,
        'no_warnings': True,
    }
    
    if browser_name:
        print(f"Utilizando cookies do navegador: '{browser_name}' para autenticação...")
        ydl_opts['cookiesfrombrowser'] = (browser_name,)
        
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
        except Exception as e:
            print(f"❌ Erro ao baixar o Reel: {e}")
            sys.exit(1)
            
    caption = info.get("description") or info.get("title") or ""
    uploader = info.get("uploader") or ""
    print(f"✓ Vídeo baixado com sucesso. Uploader: @{uploader}")
    
    # 2. Determine Influencer
    influencer = None
    if cli_influencer and cli_influencer in INFLUENCERS:
        influencer = INFLUENCERS[cli_influencer]
    elif uploader.lower() in INFLUENCERS:
        influencer = INFLUENCERS[uploader.lower()]
    else:
        # Default to Navegando SP
        influencer = INFLUENCERS["navegandosp"]
        print(f"Aviso: Uploader @{uploader} não mapeado como influencer. Usando padrão: @{influencer['slug']}")
        
    print(f"👤 Associando ao Influencer: {influencer['nome']} (@{uploader if uploader else influencer['slug']})")

    # 3. Upload video to Gemini API
    print("☁️ Enviando vídeo para processamento na API do Gemini...")
    try:
        video_file = genai.upload_file(path=temp_video_path)
        print(f"✓ Upload concluído. File Name no Gemini: {video_file.name}")
        
        while video_file.state.name == "PROCESSING":
            print("⏳ Gemini está processando o vídeo...", end="\r")
            time.sleep(2)
            video_file = genai.get_file(video_file.name)
            
        print() # Newline
        if video_file.state.name == "FAILED":
            raise ValueError("O processamento do vídeo falhou nos servidores do Gemini.")
        print("✓ Vídeo processado e ativo no Gemini!")
    except Exception as e:
        print(f"❌ Erro no envio/processamento do Gemini: {e}")
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        sys.exit(1)

    # 4. Prompt Gemini for structured extraction
    print("🧠 Analisando vídeo e legenda com inteligência artificial...")
    prompt = f"""
Você é um extrator de dados especialista em gastronomia e mídias sociais.
Analise o vídeo do Instagram Reel fornecido e a legenda abaixo.
Sua tarefa é extrair e retornar um objeto JSON estruturado contendo informações sobre o restaurante avaliado e o conteúdo do vídeo.

Legenda do Post:
{caption}

O JSON retornado deve seguir exatamente esta estrutura:
{{
  "restaurante": {{
    "nome": "Nome oficial do restaurante",
    "tipo_cozinha": "Categoria de cozinha em letras minúsculas (ex: hamburguer, italiano, pizza, sobremesa, saudavel, churrasco, frutos do mar, japonesa, brunch, arabe)",
    "bairro": "Bairro do restaurante em São Paulo (ex: Pinheiros, Moema, Itaim Bibi, Centro)",
    "cidade": "São Paulo",
    "preco_medio": "Faixa de preço: $ (barato), $$ (médio) ou $$$ (caro/premium)",
    "instagram_handle": "handle do instagram do restaurante (sem o @)",
    "horario_abertura": "Horário estimado de abertura no formato HH:MM (ex: 12:00, 18:00)",
    "horario_fechamento": "Horário estimado de fechamento no formato HH:MM (ex: 23:00, 02:00)"
  }},
  "video": {{
    "titulo": "Título curto e atraente para o review (ex: Review de [Restaurante] por @[Influencer])",
    "transcricao": "Transcrição completa do áudio falado no vídeo em português",
    "resumo": "Um resumo curto (1 ou 2 frases) avaliando a experiência no restaurante",
    "prato_destaque": "Nome do prato principal que ganhou maior destaque ou elogio no vídeo",
    "palavras_chave": ["array com 3 a 5 palavras-chave em minúsculas (incluindo culinária, bairro, etc.)"]
  }}
}}

Retorne APENAS o JSON válido. Não inclua blocos de código markdown (como ```json) ou qualquer outro texto explicativo.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content([video_file, prompt])
        
        # Cleanup file from Gemini storage
        genai.delete_file(video_file.name)
        print("✓ Limpeza de arquivos temporários no Gemini concluída.")
    except Exception as e:
        print(f"❌ Erro ao interagir com o modelo Gemini: {e}")
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        sys.exit(1)

    # 5. Parse JSON results
    res_text = response.text.strip()
    if res_text.startswith("```"):
        res_text = re.sub(r"^```(json)?\s*", "", res_text, flags=re.IGNORECASE)
        res_text = re.sub(r"\s*```$", "", res_text)
    res_text = res_text.strip()
    
    try:
        data = json.loads(res_text)
    except Exception as e:
        print("❌ Erro ao parsear o JSON retornado pelo Gemini.")
        print(f"Retorno do Gemini:\n{response.text}")
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        sys.exit(1)
        
    rest_data = data.get("restaurante", {})
    vid_data = data.get("video", {})
    
    print("\n🔍 DADOS EXTRAÍDOS COM SUCESSO:")
    print(json.dumps(data, indent=2, ensure_ascii=False))
    
    rest_name = rest_data.get("nome", "Restaurante Desconhecido")
    rest_slug = slugify(rest_name)
    
    # 6. Rename video to final path
    final_video_name = f"{rest_slug}.mp4"
    final_video_path = os.path.join("public/videos", final_video_name)
    
    if os.path.exists(final_video_path):
        # Add a random suffix to avoid overwriting existing
        final_video_name = f"{rest_slug}-{random.randint(100, 999)}.mp4"
        final_video_path = os.path.join("public/videos", final_video_name)
        
    os.rename(temp_video_path, final_video_path)
    print(f"\n🎥 Vídeo salvo localmente em: {final_video_path}")

    # Generate UUIDs
    rest_id = str(uuid.uuid4())
    video_id = str(uuid.uuid4())
    plano_id = str(uuid.uuid4())
    distancia = round(random.uniform(0.5, 9.5), 1)
    
    # 7. Update Mock Databases and Seed
    mock_files = ["lib/supabase-mock.ts", "app/api/videos/import/route.ts"]
    for file_path in mock_files:
        if not os.path.exists(file_path):
            print(f"Aviso: {file_path} não encontrado.")
            continue
            
        print(f"💾 Atualizando mock em {file_path}...")
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check if restaurant already exists to reuse its ID
        existing_id = check_existing_restaurant_in_mock(content, rest_name, rest_slug)
        target_rest_id = existing_id if existing_id else rest_id
        
        # If new restaurant, insert it
        if not existing_id:
            rest_str = f"""  {{
    id: '{target_rest_id}',
    nome: "{esc_d(rest_name)}",
    slug: '{rest_slug}',
    descricao: "{esc_d(vid_data.get('resumo', ''))}",
    bairro: '{esc_s(rest_data.get('bairro', 'Centro'))}',
    cidade: '{esc_s(rest_data.get('cidade', 'São Paulo'))}',
    tipo_cozinha: '{esc_s(rest_data.get('tipo_cozinha', 'brasileira'))}',
    preco_medio: '{esc_s(rest_data.get('preco_medio', '$$'))}',
    instagram_handle: '{esc_s(rest_data.get('instagram_handle', ''))}',
    foto_capa_url: '/images/placeholder-restaurant.jpg',
    horario_abertura: '{esc_s(rest_data.get('horario_abertura', '12:00'))}',
    horario_fechamento: '{esc_s(rest_data.get('horario_fechamento', '23:00'))}',
    distancia_km: {distancia},
    ativo: true,
  }}"""
            content = insert_into_array_block(content, "mockRestaurantes", rest_str)
            
        # Insert video
        kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in vid_data.get("palavras_chave", []))
        video_str = f"""  {{
    id: '{video_id}',
    restaurante_id: '{target_rest_id}',
    influencer_id: '{influencer["id"]}',
    titulo: "{esc_d(vid_data.get('titulo', ''))}",
    url_original: '{url}',
    transcricao: "{esc_d(vid_data.get('transcricao', ''))}",
    resumo: "{esc_d(vid_data.get('resumo', ''))}",
    palavras_chave: [{kw_str}],
    prato_destaque: '{esc_s(vid_data.get('prato_destaque', ''))}',
    thumbnail_url: '/images/placeholder-restaurant.jpg',
    video_url: '/videos/{final_video_name}',
    publicado_em: new Date().toISOString(),
  }}"""
        content = insert_into_array_block(content, "mockVideos", video_str)
        
        # Insert plano if new restaurant
        if not existing_id:
            plano_str = f"""  {{
    id: '{plano_id}',
    restaurante_id: '{target_rest_id}',
    influencer_id: '{influencer["id"]}',
    status: 'ativo',
    valor_mensal: 1200.0,
    inicio_em: new Date().toISOString(),
  }}"""
            content = insert_into_array_block(content, "mockPlanos", plano_str)
            
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

    # Update scripts/seed.ts
    seed_path = "scripts/seed.ts"
    if os.path.exists(seed_path):
        print(f"💾 Atualizando seed em {seed_path}...")
        with open(seed_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # We need to map slug function to restaurants
        # seed.ts uses mapRestaurante and mapInfluencer helper functions
        # Check if restaurant exists in seed first
        existing_in_seed = f"slug: '{rest_slug}'" in content
        
        if not existing_in_seed:
            rest_seed_str = f"""    {{
      nome: "{esc_d(rest_name)}",
      slug: '{rest_slug}',
      descricao: "{esc_d(vid_data.get('resumo', ''))}",
      bairro: '{esc_s(rest_data.get('bairro', 'Centro'))}',
      cidade: '{esc_s(rest_data.get('cidade', 'São Paulo'))}',
      tipo_cozinha: '{esc_s(rest_data.get('tipo_cozinha', 'brasileira'))}',
      preco_medio: '{esc_s(rest_data.get('preco_medio', '$$'))}',
      instagram_handle: '{esc_s(rest_data.get('instagram_handle', ''))}',
      foto_capa_url: '/images/placeholder-restaurant.jpg',
      horario_abertura: '{esc_s(rest_data.get('horario_abertura', '12:00'))}',
      horario_fechamento: '{esc_s(rest_data.get('horario_fechamento', '23:00'))}',
      distancia_km: {distancia},
      ativo: true,
    }}"""
            content = insert_into_array_block(content, "restaurantesData", rest_seed_str)
            
        kw_str = ", ".join(f"'{esc_s(kw)}'" for kw in vid_data.get("palavras_chave", []))
        video_seed_str = f"""    {{
      restaurante_id: mapRestaurante('{rest_slug}'),
      influencer_id: mapInfluencer('{influencer["slug"]}'),
      titulo: "{esc_d(vid_data.get('titulo', ''))}",
      url_original: '{url}',
      transcricao: "{esc_d(vid_data.get('transcricao', ''))}",
      resumo: "{esc_d(vid_data.get('resumo', ''))}",
      palavras_chave: [{kw_str}],
      prato_destaque: '{esc_s(vid_data.get('prato_destaque', ''))}',
      thumbnail_url: '/images/placeholder-restaurant.jpg',
      video_url: '/videos/{final_video_name}',
      publicado_em: new Date().toISOString(),
    }}"""
        content = insert_into_array_block(content, "videosData", video_seed_str)
        
        if not existing_in_seed:
            plano_seed_str = f"""    {{
      restaurante_id: mapRestaurante('{rest_slug}'),
      influencer_id: mapInfluencer('{influencer["slug"]}'),
      status: 'ativo',
      valor_mensal: 1200.0,
      inicio_em: new Date().toISOString(),
    }}"""
            content = insert_into_array_block(content, "planosData", plano_seed_str)
            
        with open(seed_path, "w", encoding="utf-8") as f:
            f.write(content)

    # 8. Insert into real Supabase DB (if keys set)
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = env.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if supabase_url and supabase_key:
        print("⚡ Detectado chaves do Supabase. Inserindo no banco de dados real...")
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        try:
            # Check if restaurant exists in db
            rest_url = f"{supabase_url.rstrip('/')}/rest/v1/restaurantes?slug=eq.{rest_slug}"
            r_check = requests.get(rest_url, headers=headers)
            db_rest_id = None
            
            if r_check.ok and r_check.json():
                db_rest_id = r_check.json()[0]["id"]
                print(f"✓ Restaurante '{rest_name}' já existe no banco real (ID: {db_rest_id}). Reutilizando.")
            else:
                # Insert Restaurant
                r_payload = {
                    "nome": rest_name,
                    "slug": rest_slug,
                    "descricao": vid_data.get("resumo", "")[:120] + "...",
                    "bairro": rest_data.get("bairro", "Centro"),
                    "cidade": rest_data.get("cidade", "São Paulo"),
                    "tipo_cozinha": rest_data.get("tipo_cozinha", "brasileira"),
                    "preco_medio": rest_data.get("preco_medio", "$$"),
                    "instagram_handle": rest_data.get("instagram_handle", ""),
                    "horario_abertura": rest_data.get("horario_abertura", "12:00"),
                    "horario_fechamento": rest_data.get("horario_fechamento", "23:00"),
                    "distancia_km": distancia,
                    "ativo": True,
                    "foto_capa_url": "/images/placeholder-restaurant.jpg"
                }
                rest_ins_url = f"{supabase_url.rstrip('/')}/rest/v1/restaurantes"
                r_ins = requests.post(rest_ins_url, json=r_payload, headers=headers)
                if r_ins.ok:
                    db_rest_id = r_ins.json()[0]["id"]
                    print(f"✓ Restaurante '{rest_name}' criado no banco real com ID: {db_rest_id}")
                    
                    # Create Plan
                    p_payload = {
                        "restaurante_id": db_rest_id,
                        "influencer_id": influencer["id"],
                        "status": "ativo",
                        "valor_mensal": 1200.0
                    }
                    plan_ins_url = f"{supabase_url.rstrip('/')}/rest/v1/planos"
                    requests.post(plan_ins_url, json=p_payload, headers=headers)
                else:
                    print(f"❌ Erro ao criar restaurante no Supabase: {r_ins.text}")
                    
            if db_rest_id:
                # Insert Video
                v_payload = {
                    "restaurante_id": db_rest_id,
                    "influencer_id": influencer["id"],
                    "titulo": vid_data.get("titulo", ""),
                    "url_original": url,
                    "transcricao": vid_data.get("transcricao", ""),
                    "resumo": vid_data.get("resumo", ""),
                    "palavras_chave": vid_data.get("palavras_chave", []),
                    "prato_destaque": vid_data.get("prato_destaque", ""),
                    "thumbnail_url": "/images/placeholder-restaurant.jpg",
                    "publicado_em": "2026-06-16T00:00:00Z"
                }
                vid_ins_url = f"{supabase_url.rstrip('/')}/rest/v1/videos"
                v_ins = requests.post(vid_ins_url, json=v_payload, headers=headers)
                if v_ins.ok:
                    print("✓ Vídeo criado no banco real com sucesso!")
                else:
                    print(f"❌ Erro ao criar vídeo no Supabase: {v_ins.text}")
        except Exception as e:
            print(f"❌ Falha na sincronização direta com Supabase: {e}")
            
    print("\n✨ PIPELINE DE IMPORTAÇÃO CONCLUÍDO COM SUCESSO! ✨")
    print(f"  - Restaurante: {rest_name}")
    print(f"  - Vídeo: {vid_data.get('titulo')}")
    print(f"  - Prato Destaque: {vid_data.get('prato_destaque')}")
    print(f"  - Slug: {rest_slug}")
    print(f"  - Arquivo local: public/videos/{final_video_name}")

if __name__ == "__main__":
    main()
