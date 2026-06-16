import os
import sys
import re
import unicodedata
import subprocess
import time

def ensure_dependencies():
    try:
        import yt_dlp
    except ImportError:
        print("Instalando yt-dlp...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])

ensure_dependencies()
import yt_dlp

mock_file = "lib/supabase-mock.ts"
videos_dir = "public/videos"

INFLUENCERS = {
    "11111111-1111-1111-1111-111111111111": "Navegando SP",
    "44444444-4444-4444-4444-444444444444": "Perambulando em SP",
    "55555555-5555-5555-5555-555555555555": "Esquenta SP"
}

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

def load_grouped_missing():
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    video_block_start = content.find("const mockVideos =")
    video_block_end = content.find("const mockReviews") if "const mockReviews" in content else len(content)
    video_objects = parse_objects(content[video_block_start:video_block_end])
    
    local_files = {f[:-4] for f in os.listdir(videos_dir) if f.lower().endswith(".mp4")}
    
    grouped = {inf_id: [] for inf_id in INFLUENCERS}
    
    for v_str in video_objects:
        id_m = re.search(r"id:\s*'([^']+)'", v_str)
        inf_m = re.search(r"influencer_id:\s*'([^']+)'", v_str)
        title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
        url_m = re.search(r"url_original:\s*'([^']+)'", v_str)
        if not url_m:
            url_m = re.search(r"url_original:\s*\x22([^\x22]+)\x22", v_str)
            
        if id_m and inf_m and title_m and url_m:
            inf_id = inf_m.group(1)
            title = title_m.group(1)
            sanitized = sanitize_filename(title)
            url = url_m.group(1)
            
            if inf_id in grouped and sanitized not in local_files:
                grouped[inf_id].append({
                    "title": title,
                    "filename": f"{sanitized}.mp4",
                    "url": url
                })
                
    return grouped

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
            
    browser_name = None
    if "--browser" in sys.argv:
        try:
            b_idx = sys.argv.index("--browser")
            browser_name = sys.argv[b_idx + 1]
        except Exception:
            pass

    # Read mock database
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    video_block_start = content.find("const mockVideos =")
    video_block_end = content.find("const mockReviews") if "const mockReviews" in content else len(content)
    video_objects = parse_objects(content[video_block_start:video_block_end])
    
    local_files = {f[:-4] for f in os.listdir(videos_dir) if f.lower().endswith(".mp4")}
    
    # Analyze status
    downloaded_by_inf = {inf_id: [] for inf_id in INFLUENCERS}
    missing_by_inf = {inf_id: [] for inf_id in INFLUENCERS}
    
    for v_str in video_objects:
        id_m = re.search(r"id:\s*'([^']+)'", v_str)
        inf_m = re.search(r"influencer_id:\s*'([^']+)'", v_str)
        title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
        url_m = re.search(r"url_original:\s*'([^']+)'", v_str)
        if not url_m:
            url_m = re.search(r"url_original:\s*\x22([^\x22]+)\x22", v_str)
            
        if id_m and inf_m and title_m and url_m:
            inf_id = inf_m.group(1)
            title = title_m.group(1)
            sanitized = sanitize_filename(title)
            url = url_m.group(1)
            
            if inf_id in INFLUENCERS:
                item = {
                    "title": title,
                    "filename": f"{sanitized}.mp4",
                    "url": url
                }
                if sanitized in local_files:
                    downloaded_by_inf[inf_id].append(item)
                else:
                    missing_by_inf[inf_id].append(item)

    print("--- Estado Atual dos Vídeos por Influenciador ---")
    for inf_id, name in INFLUENCERS.items():
        print(f"  * {name}: {len(downloaded_by_inf[inf_id])} já baixados localmente, {len(missing_by_inf[inf_id])} restantes na base.")
    print("-" * 50)

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
    }
    
    if browser_name:
        print(f"Utilizando cookies do navegador '{browser_name}'...")
        ydl_opts['cookiesfrombrowser'] = (browser_name,)

    start_time = time.time()
    
    try:
        for inf_id, name in INFLUENCERS.items():
            current_downloaded = len(downloaded_by_inf[inf_id])
            if current_downloaded >= 10:
                print(f"\n[+] {name} já possui {current_downloaded} vídeos locais (meta de 10 atingida!).")
                continue
                
            needed = 10 - current_downloaded
            print(f"\n[+] {name}: {current_downloaded} vídeos locais. Tentando baixar mais {needed} para atingir a meta de 10...")
            
            success_this_run = 0
            for item in missing_by_inf[inf_id]:
                if current_downloaded + success_this_run >= 10:
                    break
                    
                title = item["title"]
                filename = item["filename"]
                url = item["url"]
                output_path = os.path.join(videos_dir, filename)
                
                print(f"    -> Tentando baixar: '{title}'...")
                ydl_opts['outtmpl'] = output_path
                
                try:
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([url])
                    print("       ✓ Sucesso!")
                    success_this_run += 1
                except Exception as e:
                    print(f"       ❌ Erro: {e}")
                    if os.path.exists(output_path):
                        try:
                            os.remove(output_path)
                        except Exception:
                            pass
                            
                time.sleep(1)
                
            print(f"    Resultados para {name}: Total local agora é {current_downloaded + success_this_run}/10.")

    except KeyboardInterrupt:
        print("\n[!] Interrompido pelo usuário.")
        
    elapsed = time.time() - start_time
    m, s = divmod(elapsed, 60)
    
    print(f"\n[Summary] RESUMO DA EXECUÇÃO:")
    print(f"  - Tempo decorrido: {int(m)}m {int(s)}s")
    
    # Print final counts
    print("\n--- Estado Final dos Vídeos por Influenciador ---")
    local_files_final = {f[:-4] for f in os.listdir(videos_dir) if f.lower().endswith(".mp4")}
    for inf_id, name in INFLUENCERS.items():
        count = 0
        for v_str in video_objects:
            inf_m = re.search(r"influencer_id:\s*'([^']+)'", v_str)
            title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
            if inf_m and title_m and inf_m.group(1) == inf_id:
                sanitized = sanitize_filename(title_m.group(1))
                if sanitized in local_files_final:
                    count += 1
        print(f"  * {name}: {count} vídeos locais.")

if __name__ == "__main__":
    main()
