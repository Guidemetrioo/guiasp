import os
import sys
import re
import unicodedata

# Auto-install yt-dlp if not present
try:
    import yt_dlp
except ImportError:
    print("Installing required package 'yt-dlp'...")
    import subprocess
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "yt-dlp"])
        import yt_dlp
    except Exception as e:
        print(f"Error: Could not install yt-dlp automatically: {e}")
        print("Please run: pip install yt-dlp")
        sys.exit(1)

def sanitize_filename(text):
    """Sanitizes text to be used as a filename matching our frontend matching logic"""
    # Remove accents
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    
    # Lowercase
    text = text.lower()
    
    # Remove emojis and non-alphanumeric characters (except spaces and hyphens)
    text = re.sub(r"[^\w\s-]", "", text)
    
    # Replace spaces/underscores with hyphens
    text = re.sub(r"[\s_]+", "-", text)
    
    # Strip leading/trailing hyphens
    text = text.strip("-")
    
    return text

def find_video_by_url(url):
    """Finds the video title/caption in supabase-mock.ts by matching original Instagram URL"""
    mock_file_path = "lib/supabase-mock.ts"
    if not os.path.exists(mock_file_path):
        return None
        
    # Standardize url for matching (remove trailing slash, query params)
    clean_url = url.split("?")[0].rstrip("/")
    
    try:
        with open(mock_file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading mock file: {e}")
        return None
        
    # Match mockVideos array block
    match = re.search(r"const mockVideos = \[\s*(.*?)\s*\]\s*const", content, re.DOTALL)
    if not match:
        match = re.search(r"const mockVideos = \[\s*(.*?)\s*\]", content, re.DOTALL)
        
    if not match:
        return None
        
    videos_block = match.group(1)
    objects = videos_block.split("},")
    
    for obj in objects:
        url_m = re.search(r"url_original:\s*['\x22]([^'\x22]+)['\x22]", obj)
        titulo_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", obj)
        
        if url_m and titulo_m:
            obj_url = url_m.group(1).split("?")[0].rstrip("/")
            if obj_url == clean_url or clean_url in obj_url or obj_url in clean_url:
                return titulo_m.group(1)
                
    return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/download_reel.py <url> [--browser <chrome|firefox|edge>]")
        sys.exit(1)
        
    url = sys.argv[1]
    browser_name = None
    cookies_path = None
    
    # Parse optional --browser flag
    if "--browser" in sys.argv:
        try:
            b_idx = sys.argv.index("--browser")
            browser_name = sys.argv[b_idx + 1]
        except Exception:
            pass

    # Parse optional --cookies flag
    if "--cookies" in sys.argv:
        try:
            c_idx = sys.argv.index("--cookies")
            cookies_path = sys.argv[c_idx + 1]
        except Exception:
            pass

    # Ensure output directory exists
    os.makedirs("public/videos", exist_ok=True)
    
    # 1. Try to find the title from the mock database
    db_title = find_video_by_url(url)
    
    # 2. Configure yt-dlp options
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': False,
        'no_warnings': False,
    }
    
    # Priority for authentication:
    # 1. Parameter --cookies
    # 2. Root/scripts cookies.txt
    # 3. Parameter --browser
    if cookies_path:
        print(f"Using cookies from file: '{cookies_path}' to bypass login gates...")
        ydl_opts['cookiefile'] = cookies_path
    elif os.path.exists("cookies.txt"):
        print("Using 'cookies.txt' found in the root directory...")
        ydl_opts['cookiefile'] = "cookies.txt"
    elif os.path.exists("scripts/cookies.txt"):
        print("Using 'cookies.txt' found in the scripts directory...")
        ydl_opts['cookiefile'] = "scripts/cookies.txt"
    elif browser_name:
        print(f"Using cookies from browser: '{browser_name}' to bypass login gates...")
        ydl_opts['cookiesfrombrowser'] = (browser_name,)

    print(f"Fetching metadata for: {url} ...")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except Exception as e:
            print(f"\nError: Could not retrieve video info: {e}")
            print("\nTip: Instagram requires authentication for some reels. If you get a login error, try logged-in cookies:")
            print("  python scripts/download_reel.py <url> --browser chrome")
            print("  (supports: chrome, firefox, edge, safari, opera, brave)")
            sys.exit(1)
            
        # Determine target filename
        raw_title = db_title if db_title else info.get('title', 'instagram_reel')
        sanitized = sanitize_filename(raw_title)
        
        filename = f"{sanitized}.mp4"
        output_path = os.path.join("public/videos", filename)
        
        print(f"\nFound match:")
        print(f"  - Database Caption: {db_title if db_title else 'Not found (using Instagram metadata)'}")
        print(f"  - Target Filename:  {filename}")
        
        # Re-configure to download to targeted output path
        ydl_opts['outtmpl'] = output_path
        
        print("\nDownloading MP4 video...")
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl_down:
                ydl_down.download([url])
            print(f"\nSuccess! Video downloaded and saved to: {output_path}")
            
            # Update lib/videos-list.json if it exists
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
                        print(f"Added '{filename}' to {json_path}")
                except Exception as je:
                    print(f"Warning: Could not update {json_path}: {je}")
        except Exception as e:
            print(f"Error downloading video file: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
