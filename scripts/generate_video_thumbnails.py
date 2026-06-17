import os
import cv2

def main():
    videos_dir = "public/videos"
    thumbnails_dir = os.path.join(videos_dir, "thumbnails")
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    # List all mp4 files
    files = [f for f in os.listdir(videos_dir) if f.endswith(".mp4")]
    print(f"Encontrados {len(files)} arquivos de video em {videos_dir}.")
    
    success_count = 0
    skipped_count = 0
    error_count = 0
    
    for f in files:
        base_name = os.path.splitext(f)[0]
        thumb_name = f"{base_name}.jpg"
        thumb_path = os.path.join(thumbnails_dir, thumb_name)
        
        # Skip if already exists and is not empty
        if os.path.exists(thumb_path) and os.path.getsize(thumb_path) > 0:
            skipped_count += 1
            continue
            
        video_path = os.path.join(videos_dir, f)
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"  [ERROR] Erro ao abrir o video: {f}")
            error_count += 1
            continue
            
        # Try to seek to 1 second (1000 ms) to get a good frame, otherwise first frame
        cap.set(cv2.CAP_PROP_POS_MSEC, 1000)
        ret, frame = cap.read()
        
        if not ret:
            # Fallback to the very first frame if 1 second doesn't work
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
            
        if ret:
            # Save frame
            cv2.imwrite(thumb_path, frame)
            success_count += 1
            if success_count % 10 == 0 or success_count == 1:
                print(f"   [INFO] Geradas {success_count} novas thumbnails...")
        else:
            print(f"  [ERROR] Falha ao ler frame do video: {f}")
            error_count += 1
            
        cap.release()
        
    print(f"\nConcluido!")
    print(f"  - Novas thumbnails geradas: {success_count}")
    print(f"  - Ignoradas (ja existentes): {skipped_count}")
    print(f"  - Erros: {error_count}")

if __name__ == "__main__":
    main()
