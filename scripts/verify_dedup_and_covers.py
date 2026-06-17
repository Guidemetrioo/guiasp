import os
import hashlib
import re

mock_file = "lib/supabase-mock.ts"
seed_file = "scripts/seed.ts"
thumbnails_dir = "public/videos/thumbnails"

def verify_db_dedup():
    print("Verifying database deduplication...")
    with open(mock_file, "r", encoding="utf-8") as f:
        mock_content = f.read()
        
    with open(seed_file, "r", encoding="utf-8") as f:
        seed_content = f.read()
        
    moveis_dup_id = "147f882d-601d-41c9-bba3-93dacb740b7c"
    uba_dup_id = "3fb62a0c-a314-4261-94ba-503d457685db"
    
    # Check mock file
    assert moveis_dup_id not in mock_content, f"Error: duplicate Moveisjunco ID '{moveis_dup_id}' still present in mock db!"
    assert uba_dup_id not in mock_content, f"Error: duplicate Temporadasubatuba-- ID '{uba_dup_id}' still present in mock db!"
    
    # Check seed file
    assert "slug: 'moveisjunco'" not in seed_content, "Error: duplicate Moveisjunco slug still present in seed!"
    assert "slug: 'temporadasubatuba--'" not in seed_content, "Error: duplicate Temporadasubatuba-- slug still present in seed!"
    
    print("  [SUCCESS] Database deduplication verified!")

def verify_thumbnails():
    print("Verifying thumbnail image uniqueness on disk...")
    # List of Perambulando thumbnails we updated
    target_files = [
        "review-de-sushibar-sp-por-perambulandosp.jpg",
        "review-de-paleteriasp-por-perambulandosp.jpg",
        "review-de-hotel-fazenda-aurora-por-perambulandosp.jpg",
        "review-de-massaria-sp-por-perambulandosp.jpg",
        "review-de-pizzariabatepapo-por-perambulandosp.jpg",
        "review-de-casanostrapizzaria-por-perambulandosp.jpg",
        "review-de-cervejariadopaulo-por-perambulandosp.jpg",
        "review-de-hotelfazendariopretoe-por-perambulandosp.jpg",
        "review-de-resortvaledosol-por-perambulandosp.jpg",
        "review-de-point-do-gordao-por-perambulandoemsp.jpg",
        "review-de-recomendacao-perambulando-40-por-perambulandosp.jpg",
        "review-de-recomendacao-perambulando-42-por-perambulandosp.jpg",
        "review-de-recomendacao-perambulando-45-por-perambulandosp.jpg",
        "review-de-recomendacao-perambulando-49-por-perambulandosp.jpg",
        "review-de-recomendacao-perambulando-52-por-perambulandosp.jpg"
    ]
    
    placeholder_hash = "2381b81f05d3f96c844b2376d00d8fd8"
    hashes = {}
    
    for filename in target_files:
        fpath = os.path.join(thumbnails_dir, filename)
        assert os.path.exists(fpath), f"Error: thumbnail file {filename} does not exist!"
        
        with open(fpath, "rb") as f:
            data = f.read()
            fhash = hashlib.md5(data).hexdigest()
            hashes[filename] = fhash
            
    # Check that none of them match the placeholder hash
    for filename, fhash in hashes.items():
        assert fhash != placeholder_hash, f"Error: thumbnail {filename} is still the placeholder image!"
        
    # Check that they are not all copies of the exact same image
    unique_hashes = set(hashes.values())
    print(f"  Found {len(unique_hashes)} unique image hashes out of {len(target_files)} verified files.")
    assert len(unique_hashes) > 1, "Error: All downloaded thumbnails are identical!"
    
    print("  [SUCCESS] Thumbnail uniqueness verified!")

if __name__ == "__main__":
    verify_db_dedup()
    verify_thumbnails()
    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
