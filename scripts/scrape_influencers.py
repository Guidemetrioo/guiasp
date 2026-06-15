import sys
import os
import json
import instaloader
from datetime import datetime

def load_cookies_manual(L, browser_name):
    try:
        import browser_cookie3
    except ImportError:
        print("browser-cookie3 is not installed.")
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
        cj = supported_browsers[browser_name]()
        for cookie in cj:
            if "instagram" in cookie.domain:
                cookies[cookie.name] = cookie.value
        
        if cookies:
            L.context.update_cookies(cookies)
            print(f"Sucesso! Cookies carregados de {browser_name.capitalize()}")
            return True
        else:
            return False
    except Exception as e:
        print(f"Erro ao ler cookies de {browser_name}: {e}")
        return False

def scrape_profile(L, username, output_path, max_posts=200):
    print(f"\nIniciando extração para @{username}...")
    try:
        profile = instaloader.Profile.from_username(L.context, username)
        print(f"Perfil carregado. Total de posts declarados: {profile.mediacount}")
    except Exception as e:
        print(f"Erro ao carregar perfil @{username}: {e}")
        return False

    scraped_posts = []
    count = 0
    
    try:
        for post in profile.get_posts():
            count += 1
            post_data = {
                "url": f"https://www.instagram.com/p/{post.shortcode}/",
                "caption": post.caption or "",
                "date": post.date_utc.isoformat() if post.date_utc else "",
                "shortcode": post.shortcode
            }
            scraped_posts.append(post_data)
            
            if count % 10 == 0 or count == 1:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] @{username}: Processados {count}/{max_posts}...")
                
            if count >= max_posts:
                break
                
    except Exception as ex:
        print(f"Erro durante extração de @{username}: {ex}")
        
    # Salvar resultados
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(scraped_posts, f, indent=2, ensure_ascii=False)
        print(f"Concluído! {len(scraped_posts)} posts salvos em {output_path}")
        return True
    except Exception as e:
        print(f"Erro ao salvar arquivo final: {e}")
        return False

def main():
    L = instaloader.Instaloader(
        download_pictures=False,
        download_videos=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False
    )
    
    # Configurar headers do Chrome para evitar 403 Forbidden
    L.context._session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
    })

    cookies_loaded = False
    for browser in ['chrome', 'edge', 'firefox', 'opera']:
        if load_cookies_manual(L, browser):
            cookies_loaded = True
            break

    if not cookies_loaded:
        print("AVISO: Nenhum cookie carregado. Risco alto de bloqueio.")

    # 1. Scrape perambulandoemsp
    scrape_profile(L, "perambulandoemsp", "scripts/scraped_perambulando.json", max_posts=200)

    # 2. Scrape esquentasp
    scrape_profile(L, "esquentasp", "scripts/scraped_esquenta.json", max_posts=200)

if __name__ == "__main__":
    main()
