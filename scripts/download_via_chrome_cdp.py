import os
import sys
import re
import unicodedata
import time
import json
import urllib.request
import urllib.parse
import websocket
import subprocess

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
        
    video_block_end = content.find("const mockPlanos =") if "const mockPlanos =" in content else (content.find("const mockReviews") if "const mockReviews" in content else len(content))
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


def is_chrome_debugging_active():
    try:
        urllib.request.urlopen("http://localhost:9222/json/list", timeout=2)
        return True
    except Exception:
        return False

def is_chrome_process_running():
    try:
        out = subprocess.check_output('tasklist /FI "IMAGENAME eq chrome.exe"', shell=True).decode('utf-8', errors='ignore')
        return "chrome.exe" in out.lower()
    except Exception:
        return False

def launch_chrome():
    chrome_cmd = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "--remote-debugging-port=9222",
        r"--user-data-dir=C:\Users\guide\AppData\Local\Google\Chrome\User Data",
        "--profile-directory=Default",
        "--remote-allow-origins=*"
    ]
    print("Iniciando o Google Chrome com o seu perfil padrão em modo de depuração (janela visível)...")
    try:
        # Launch Chrome.
        proc = subprocess.Popen(chrome_cmd)
        time.sleep(6)  # Wait for Chrome to initialize
        return proc
    except Exception as e:
        print(f"❌ Erro ao iniciar o Google Chrome: {e}")
        sys.exit(1)

def send_cmd(ws, cmd_id, method, params=None):
    payload = {"id": cmd_id, "method": method}
    if params:
        payload["params"] = params
    ws.send(json.dumps(payload))
    while True:
        resp = json.loads(ws.recv())
        if resp.get("id") == cmd_id:
            return resp

def main():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    limit = None
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
        print("🎉 Todos os vídeos da base de dados já estão salvos localmente!")
        sys.exit(0)
        
    print(f"📦 Encontrados {total} vídeos cadastrados no banco que não possuem arquivos MP4 locais.")
    
    chrome_proc = None
    
    # 1. Manage Chrome debug mode
    if is_chrome_debugging_active():
        print("✓ Conectado com sucesso ao Chrome depurador já em execução.")
    else:
        if is_chrome_process_running():
            print("\n❌ ERRO: O Google Chrome está aberto no modo padrão (sem depuração ativa).")
            print("Por favor, FECHE todas as janelas do Chrome por 5 segundos e execute este script novamente.")
            print("Assim que o script iniciar, o Chrome abrirá novamente e você poderá usá-lo normal.")
            sys.exit(1)
        else:
            # Launch Chrome under debug port using default profile
            chrome_proc = launch_chrome()
            if not is_chrome_debugging_active():
                print("❌ ERRO: Falha ao iniciar Chrome depurador na porta 9222.")
                sys.exit(1)
                
    success_count = 0
    fail_count = 0
    start_time = time.time()
    
    try:
        print("Iniciando downloads em lote... Pressione Ctrl+C para parar a qualquer momento.\n")
        
        for idx, item in enumerate(missing, 1):
            title = item["title"]
            filename = item["filename"]
            url = item["url"]
            output_path = os.path.join(videos_dir, filename)
            
            print(f"[{idx}/{total}] Processando: '{title}'...")
            print(f"   URL: {url}")
            print(f"   Arquivo: {filename}")
            
            tab_id = None
            try:
                # Create a new tab using PUT method
                req_obj = urllib.request.Request("http://localhost:9222/json/new", method="PUT")
                req = urllib.request.urlopen(req_obj)
                tab_info = json.loads(req.read().decode('utf-8'))
                tab_id = tab_info['id']
                ws_url = tab_info['webSocketDebuggerUrl']
                
                # Connect to tab WebSocket
                ws = websocket.create_connection(ws_url)
                
                # Enable Page
                send_cmd(ws, 1, "Page.enable")
                
                # Navigate to Instagram Reel
                send_cmd(ws, 2, "Page.navigate", {"url": url})
                
                # Wait for video src to appear in DOM
                video_src = None
                for attempt in range(25):
                    time.sleep(1)
                    eval_res = send_cmd(ws, 3 + attempt, "Runtime.evaluate", {
                        "expression": "(() => { const v = document.querySelector('video'); return { url: window.location.href, title: document.title, src: v ? v.src : null }; })()",
                        "returnByValue": True
                    })
                    result = eval_res.get('result', {}).get('result', {})
                    if result.get('type') == 'object' and result.get('value'):
                        val_dict = result['value']
                        val = val_dict.get('src')
                        # Print debug details
                        # print(f"   [Debug] URL: {val_dict.get('url')} | Title: {val_dict.get('title')} | Video Src: {val_dict.get('src')}")
                        if val and val.startswith('http'):
                            video_src = val
                            break
                
                ws.close()
                
                # Close the tab immediately
                try:
                    urllib.request.urlopen(f"http://localhost:9222/json/close/{tab_id}")
                except Exception:
                    pass
                tab_id = None
                
                if not video_src:
                    raise Exception("Não foi possível extrair a URL de vídeo direta (Instagram bloqueou ou tag <video> não carregou).")
                
                print(f"   ✓ URL direta de mídia encontrada: {video_src[:70]}...")
                
                # Download the file
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
                dl_req = urllib.request.Request(video_src, headers=headers)
                with urllib.request.urlopen(dl_req) as response, open(output_path, 'wb') as out_file:
                    out_file.write(response.read())
                    
                print("   ✓ Download concluído com sucesso!")
                success_count += 1
                
                # Sincronizar videos-list.json
                json_path = os.path.join("lib", "videos-list.json")
                if os.path.exists(json_path):
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
                print(f"   ❌ Erro ao baixar este vídeo: {e}")
                if tab_id:
                    try:
                        urllib.request.urlopen(f"http://localhost:9222/json/close/{tab_id}")
                    except Exception:
                        pass
                if os.path.exists(output_path):
                    try:
                        os.remove(output_path)
                    except Exception:
                        pass
                fail_count += 1
                
            time.sleep(1.5)
            print("-" * 50)
            
    except KeyboardInterrupt:
        print("\n⚠️ Processo interrompido pelo usuário.")
        
    finally:
        # Terminate Chrome process if we started it
        if chrome_proc:
            print("Finalizando Google Chrome...")
            try:
                chrome_proc.terminate()
                chrome_proc.wait(timeout=5)
            except Exception:
                pass
            print("Chrome finalizado.")
        
    elapsed = time.time() - start_time
    m, s = divmod(elapsed, 60)
    print("\n🏁 RESUMO DA OPERAÇÃO:")
    print(f"  - Total de vídeos na fila: {total}")
    print(f"  - Baixados com sucesso: {success_count}")
    print(f"  - Falhas: {fail_count}")
    print(f"  - Tempo decorrido: {int(m)}m {int(s)}s")

if __name__ == "__main__":
    main()
