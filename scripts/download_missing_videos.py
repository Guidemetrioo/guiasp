import os
import sys
import re
import unicodedata
import subprocess
import time

# Force UTF-8 encoding for Windows console to prevent UnicodeEncodeError with emojis
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Verify dependencies
def ensure_dependencies():
    try:
        import yt_dlp
    except ImportError:
        print("Instalando a dependência necessária 'yt-dlp'...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
        except Exception as e:
            print(f"Erro ao instalar yt-dlp: {e}")
            sys.exit(1)

ensure_dependencies()
import yt_dlp

mock_file = "lib/supabase-mock.ts"
videos_dir = "public/videos"

def sanitize_filename(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

def parse_objects(array_str):
    objects = []
    brace_count = 0
    current_obj = []
    for char in array_str:
        if char == '{':
            brace_count += 1
        if brace_count > 0:
            current_obj.append(char)
        if char == '}':
            brace_count -= 1
            if brace_count == 0:
                objects.append("".join(current_obj))
                current_obj = []
    return objects

def is_real_instagram_url(url):
    parts = [p for p in url.split('/') if p]
    if not parts:
        return False
    shortcode = parts[-1]
    if 'reel' in parts:
        idx = parts.index('reel')
        if idx + 1 < len(parts):
            shortcode = parts[idx+1]
    elif 'p' in parts:
        idx = parts.index('p')
        if idx + 1 < len(parts):
            shortcode = parts[idx+1]
    shortcode = shortcode.split('?')[0]
    if len(shortcode) != 11:
        return False
    if shortcode.startswith('C-') or shortcode.startswith('C8_'):
        return False
    return True

def load_missing_videos():
    if not os.path.exists(mock_file):
        print(f"Erro: Arquivo {mock_file} não encontrado.")
        sys.exit(1)
        
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    video_block_start = content.find("const mockVideos =")
    if video_block_start == -1:
        print("Erro: Bloco 'mockVideos' não encontrado no mock database.")
        sys.exit(1)
        
    video_block_end = content.find("const mockReviews") if "const mockReviews" in content else len(content)
    video_objects = parse_objects(content[video_block_start:video_block_end])
    
    os.makedirs(videos_dir, exist_ok=True)
    local_files = {f[:-4] for f in os.listdir(videos_dir) if f.lower().endswith(".mp4")}
    
    missing_videos = []
    for v_str in video_objects:
        id_m = re.search(r"id:\s*'([^']+)'", v_str)
        title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
        url_m = re.search(r"url_original:\s*'([^']+)'", v_str)
        if not url_m:
            url_m = re.search(r"url_original:\s*\x22([^\x22]+)\x22", v_str)
            
        if id_m and title_m and url_m:
            title = title_m.group(1)
            sanitized = sanitize_filename(title)
            url = url_m.group(1)
            
            if sanitized not in local_files and is_real_instagram_url(url):
                missing_videos.append({
                    "title": title,
                    "filename": f"{sanitized}.mp4",
                    "url": url
                })
                
    return missing_videos

def main():
    browser_name = None
    limit = None
    cookies_path = None
    
    if "--browser" in sys.argv:
        try:
            b_idx = sys.argv.index("--browser")
            browser_name = sys.argv[b_idx + 1]
        except Exception:
            pass
            
    if "--limit" in sys.argv:
        try:
            l_idx = sys.argv.index("--limit")
            limit = int(sys.argv[l_idx + 1])
        except Exception:
            pass
            
    if "--cookies" in sys.argv:
        try:
            c_idx = sys.argv.index("--cookies")
            cookies_path = sys.argv[c_idx + 1]
        except Exception:
            pass
            
    missing = load_missing_videos()
    if limit:
        missing = missing[:limit]
        
    total = len(missing)
    
    if total == 0:
        print("🎉 Todos os vídeos da base de dados já estão salvos localmente em public/videos/!")
        sys.exit(0)
        
    print(f"📦 Encontrados {total} vídeos cadastrados no banco que não possuem arquivos MP4 locais.")
    print("Iniciando downloads em lote... Pressione Ctrl+C para parar a qualquer momento.\n")
    
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
    }
    
    # Priority for authentication:
    # 1. Parameter --cookies
    # 2. Root/scripts cookies.txt
    # 3. Parameter --browser
    if cookies_path:
        print(f"Utilizando arquivo de cookies especificado: '{cookies_path}' para autenticação...")
        ydl_opts['cookiefile'] = cookies_path
    elif os.path.exists("cookies.txt"):
        print("Utilizando arquivo 'cookies.txt' encontrado no diretório raiz para autenticação...")
        ydl_opts['cookiefile'] = "cookies.txt"
    elif os.path.exists("scripts/cookies.txt"):
        print("Utilizando arquivo 'cookies.txt' encontrado na pasta scripts para autenticação...")
        ydl_opts['cookiefile'] = "scripts/cookies.txt"
    elif browser_name:
        print(f"Utilizando cookies do navegador: '{browser_name}' para autenticação...")
        ydl_opts['cookiesfrombrowser'] = (browser_name,)
    else:
        print("DICA: Se os downloads falharem, feche o navegador e execute com '--browser chrome' ou exporte cookies para 'cookies.txt'.")
        
    success_count = 0
    fail_count = 0
    consecutive_auth_failures = 0
    
    start_time = time.time()
    
    try:
        for idx, item in enumerate(missing, 1):
            title = item["title"]
            filename = item["filename"]
            url = item["url"]
            output_path = os.path.join(videos_dir, filename)
            
            print(f"[{idx}/{total}] Baixando: '{title}'...")
            print(f"   URL: {url}")
            print(f"   Arquivo: {filename}")
            
            ydl_opts['outtmpl'] = output_path
            
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])
                print("   ✓ Download concluído com sucesso!")
                success_count += 1
                consecutive_auth_failures = 0
                
                # Sincronizar videos-list.json em tempo real
                json_path = os.path.join("lib", "videos-list.json")
                if os.path.exists(json_path):
                    import json
                    try:
                        with open(json_path, "r", encoding="utf-8") as f:
                            v_list = json.load(f)
                        if filename not in v_list:
                            v_list.append(filename)
                            with open(json_path, "w", encoding="utf-8") as f:
                                json.dump(v_list, f, indent=2)
                            print("   ✓ Sincronizado no videos-list.json!")
                    except Exception as je:
                        print(f"   ⚠️ Erro ao sincronizar JSON: {je}")
            except Exception as e:
                err_msg = str(e)
                print(f"   ❌ Erro ao baixar este vídeo: {e}")
                
                # Remove file if it was partially downloaded
                if os.path.exists(output_path):
                    try:
                        os.remove(output_path)
                    except Exception:
                        pass
                fail_count += 1
                
                # Check for common authentication / cookie errors to log helpful advice
                is_cookie_error = "cookie" in err_msg.lower() or "dpapi" in err_msg.lower()
                is_auth_error = "empty media response" in err_msg.lower() or "login" in err_msg.lower()
                
                if is_cookie_error or is_auth_error:
                    if "copy chrome cookie database" in err_msg.lower():
                        print("  👉 Dica: O Chrome pode estar aberto e bloqueando o acesso aos cookies.")
                    elif "dpapi" in err_msg.lower():
                        print("  👉 Dica: O Windows impede a descriptografia direta. Use o 'cookies.txt'.")
                    elif "empty media response" in err_msg.lower():
                        print("  👉 Dica: Este post específico pode ter sido deletado, arquivado, tornado privado ou exige login.")
                
            # Sleep slightly to prevent aggressive rate limiting
            time.sleep(1)
            print("-" * 50)
            
    except KeyboardInterrupt:
        print("\n⚠️ Download em lote interrompido pelo usuário.")
        
    elapsed = time.time() - start_time
    m, s = divmod(elapsed, 60)
    
    print("\n🏁 RESUMO DO DOWNLOAD EM LOTE:")
    print(f"  - Total de vídeos na fila: {total}")
    print(f"  - Baixados com sucesso: {success_count}")
    print(f"  - Falhas: {fail_count}")
    print(f"  - Tempo decorrido: {int(m)}m {int(s)}s")
    
    if success_count > 0:
        try:
            print("\n⚡ Gerando thumbnails automaticamente para os novos vídeos...")
            scripts_dir = os.path.dirname(os.path.abspath(__file__))
            if scripts_dir not in sys.path:
                sys.path.append(scripts_dir)
            from generate_video_thumbnails import main as generate_thumbs
            generate_thumbs()
        except Exception as e:
            print(f"⚠️ Não foi possível gerar thumbnails automaticamente: {e}")
            
if __name__ == "__main__":
    main()
