import os
import sys
import re
import unicodedata
import subprocess
import time

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
            
            if sanitized not in local_files:
                missing_videos.append({
                    "title": title,
                    "filename": f"{sanitized}.mp4",
                    "url": url
                })
                
    return missing_videos

def main():
    browser_name = None
    limit = None
    
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
    
    if browser_name:
        print(f"Utilizando cookies do navegador: '{browser_name}' para autenticação...")
        ydl_opts['cookiesfrombrowser'] = (browser_name,)
        
    success_count = 0
    fail_count = 0
    
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
            except Exception as e:
                print(f"   ❌ Erro ao baixar este vídeo: {e}")
                # Remove file if it was partially downloaded
                if os.path.exists(output_path):
                    try:
                        os.remove(output_path)
                    except Exception:
                        pass
                fail_count += 1
                
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
    
if __name__ == "__main__":
    main()
