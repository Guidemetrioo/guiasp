import os
import urllib.request
import sys

# Reconfigure stdout to use utf-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

thumbnails_dir = "public/videos/thumbnails"

MAPPINGS = {
    # --- PERAMBULANDO EM SP THUMBNAILS ---
    "review-de-sushibar-sp-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-paleteriasp-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-hotel-fazenda-aurora-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-massaria-sp-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-pizzariabatepapo-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-casanostrapizzaria-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-cervejariadopaulo-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-hotelfazendariopretoe-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-resortvaledosol-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-point-do-gordao-por-perambulandoemsp.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-recomendacao-perambulando-40-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-recomendacao-perambulando-42-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-recomendacao-perambulando-45-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1560180474-e8563fd75bab?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-recomendacao-perambulando-49-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-recomendacao-perambulando-52-por-perambulandosp.jpg": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&h=600&q=80",

    # --- ESQUENTA SP THUMBNAILS ---
    "review-de-barakiah-esfihas-por-esquentasp.jpg": "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-casanostrapizzaria-por-esquentasp.jpg": "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-cervejariadopaulo-por-esquentasp.jpg": "https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-circensebr-por-esquentasp.jpg": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-glow-park-por-esquentasp.jpg": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-hotel-fazenda-aurora-por-esquentasp.jpg": "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-hotelfazendariopretoe-por-esquentasp.jpg": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-omineirosp-por-esquentasp.jpg": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-residencialmaia-por-esquentasp.jpg": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-resort-fazenda-sao-joao-por-esquentasp.jpg": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-resorthotelfazenda-sp-por-esquentasp.jpg": "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-restaurante-rancho-por-esquentasp.jpg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-s-design-paraty-hotel-por-esquentasp.jpg": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-seafood-sp-por-esquentasp.jpg": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-secretbar-sp-por-esquentasp.jpg": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-sushibar-sp-por-esquentasp.jpg": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80",
    "review-de-volt-club-por-esquentasp.jpg": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&h=600&q=80",
}

def download_images():
    print(f"Downloading unique images to replace duplicate placeholders in {thumbnails_dir}...")
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    success = 0
    failed = 0
    
    for filename, url in MAPPINGS.items():
        dest_path = os.path.join(thumbnails_dir, filename)
        print(f"Downloading: {filename} from {url[:50]}...")
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                with open(dest_path, "wb") as f_out:
                    f_out.write(response.read())
            success += 1
        except Exception as e:
            print(f"  [ERROR] Failed to download {filename}: {str(e)}")
            failed += 1
            
    print(f"\nDone! Successful: {success}, Failed: {failed}")

if __name__ == "__main__":
    download_images()
