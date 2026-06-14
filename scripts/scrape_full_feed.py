import sys
import os
import json
import instaloader
from datetime import datetime

OUTPUT_PATH = "scripts/all_scraped_posts.json"

def load_cookies_manual(L, browser_name):
    try:
        import browser_cookie3
    except ImportError:
        print("Biblioteca browser-cookie3 não está instalada. Tente rodar 'pip install browser-cookie3'.")
        return False

    supported_browsers = {
        "chrome": browser_cookie3.chrome,
        "edge": browser_cookie3.edge,
        "firefox": browser_cookie3.firefox,
        "opera": browser_cookie3.opera,
    }
    
    if browser_name not in supported_browsers:
        return False
        
    try:
        cookies = {}
        # Get cookies for browser
        print(f"Lendo cookies do {browser_name.capitalize()}...")
        cj = supported_browsers[browser_name]()
        for cookie in cj:
            if "instagram" in cookie.domain:
                cookies[cookie.name] = cookie.value
        
        if cookies:
            L.context.update_cookies(cookies)
            print(f"Sucesso! {len(cookies)} cookies importados do {browser_name.capitalize()}.")
            return True
        else:
            print(f"Nenhum cookie do Instagram encontrado no {browser_name.capitalize()}.")
            return False
    except Exception as e:
        print(f"Falha ao ler cookies do {browser_name.capitalize()}: {e}")
        return False

def main():
    print("Iniciando Instaloader...")
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False
    )

    # Try to load cookies from Chrome first, then Edge, Firefox, Opera
    cookies_loaded = False
    for browser in ['chrome', 'edge', 'firefox', 'opera']:
        if load_cookies_manual(L, browser):
            cookies_loaded = True
            break

    if not cookies_loaded:
        print("AVISO: Nenhum cookie de sessão do Instagram pôde ser carregado. Você pode ser bloqueado rapidamente pelo Instagram.")
    
    target_username = "navegandosp"
    print(f"Carregando perfil de @{target_username}...")
    
    try:
        profile = instaloader.Profile.from_username(L.context, target_username)
        print(f"Perfil carregado com sucesso. Total de publicações declaradas: {profile.mediacount}")
    except Exception as e:
        print(f"Erro fatal ao carregar perfil: {e}")
        print("Dica: Certifique-se de que você está logado no Instagram no navegador (Chrome/Edge) e feche o navegador antes de rodar o script se houver bloqueios de arquivo.")
        sys.exit(1)

    scraped_posts = []
    count = 0
    
    print("Iniciando extração de legendas... Pressione Ctrl+C a qualquer momento para salvar o progresso atual.")
    
    try:
        # get_posts() returns posts sorted by date descending (most recent first)
        for post in profile.get_posts():
            count += 1
            post_data = {
                "url": f"https://www.instagram.com/p/{post.shortcode}/",
                "caption": post.caption or "",
                "date": post.date_utc.isoformat() if post.date_utc else "",
                "shortcode": post.shortcode
            }
            scraped_posts.append(post_data)
            
            # Print progress
            if count % 10 == 0 or count == 1:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] Processadas {count}/{profile.mediacount} postagens...")
                
            # Periodically write to file to avoid losing data
            if count % 50 == 0:
                with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                    json.dump(scraped_posts, f, indent=2, ensure_ascii=False)
                    
    except KeyboardInterrupt:
        print("\nInterrupção manual detectada. Salvando progresso...")
    except instaloader.exceptions.ConnectionException as ce:
        print(f"\nErro de conexão/Limite do Instagram atingido: {ce}")
    except Exception as ex:
        print(f"\nErro inesperado durante a extração: {ex}")
        
    # Final save
    try:
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(scraped_posts, f, indent=2, ensure_ascii=False)
        print(f"\nConcluído! Total de {len(scraped_posts)} postagens salvas com sucesso em: {OUTPUT_PATH}")
    except Exception as e:
        print(f"Erro ao salvar arquivo final: {e}")

if __name__ == "__main__":
    main()
