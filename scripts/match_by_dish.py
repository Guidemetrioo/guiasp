import re
import os
import json
import unicodedata

source_dir = r"C:\Users\guide\Downloads\videos navegando"
mock_file = "lib/supabase-mock.ts"

# Read file names from source_dir
if not os.path.exists(source_dir):
    print(f"Directory {source_dir} not found.")
    exit(1)

video_files = [f for f in os.listdir(source_dir) if f.lower().endswith(".mp4")]

with open(mock_file, "r", encoding="utf-8") as f:
    content = f.read()

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

rest_objects = parse_objects(content[content.find("const mockRestaurantes ="):content.find("const mockVideos")])
video_objects = parse_objects(content[content.find("const mockVideos ="):content.find("const mockReviews") if "const mockReviews" in content else len(content)])

restaurants = {}
for r_str in rest_objects:
    id_m = re.search(r"id:\s*'([^']+)'", r_str)
    name_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    desc_m = re.search(r"descricao:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    slug_m = re.search(r"slug:\s*'([^']+)'", r_str)
    
    if id_m and name_m:
        restaurants[id_m.group(1)] = {
            "id": id_m.group(1),
            "nome": name_m.group(1),
            "descricao": desc_m.group(1) if desc_m else "",
            "slug": slug_m.group(1) if slug_m else ""
        }

videos = []
for v_str in video_objects:
    id_m = re.search(r"id:\s*'([^']+)'", v_str)
    rest_id_m = re.search(r"restaurante_id:\s*'([^']+)'", v_str)
    title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    prato_m = re.search(r"prato_destaque:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    transcricao_m = re.search(r"transcricao:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    
    if id_m:
        videos.append({
            "id": id_m.group(1),
            "restaurante_id": rest_id_m.group(1) if rest_id_m else "",
            "titulo": title_m.group(1) if title_m else "",
            "prato_destaque": prato_m.group(1) if prato_m else "",
            "transcricao": transcricao_m.group(1) if transcricao_m else ""
        })

# Now let's try to match each video_file to a restaurant/video in the DB by comparing the filename with:
# 1. The restaurant description or name
# 2. The video title or transcript or prato_destaque
# We'll calculate a match score or do simple keyword matching.
# We normalize strings to remove accents and emojis.

def clean_str(s):
    if not s: return ""
    s = unicodedata.normalize("NFD", s)
    s = "".join([c for c in s if not unicodedata.combining(c)])
    return s.lower()

results = []
for filename in video_files:
    fn_clean = clean_str(filename)
    # Find matching restaurant/video
    # Let's search all mock videos and mock restaurants
    matches = []
    for v in videos:
        r = restaurants.get(v["restaurante_id"], None)
        r_name = r["nome"] if r else ""
        r_desc = r["descricao"] if r else ""
        r_slug = r["slug"] if r else ""
        
        # Check if restaurant name or slug is in the filename
        score = 0
        r_name_clean = clean_str(r_name)
        r_slug_clean = clean_str(r_slug)
        v_title_clean = clean_str(v["titulo"])
        v_prato_clean = clean_str(v["prato_destaque"])
        v_trans_clean = clean_str(v["transcricao"])
        
        # Match instagram handle if present in filename
        # e.g. @padariacarillooficial
        handle_match = False
        if r:
            # Let's extract instagram handle from raw restaurant str
            # Let's see if instagram_handle is in restaurant raw text
            pass
            
        # Check matching words
        # Split filename into words (alphanumeric only)
        words = re.findall(r"\w+", fn_clean)
        matching_words_r_name = [w for w in words if w in r_name_clean]
        matching_words_r_desc = [w for w in words if w in clean_str(r_desc)]
        matching_words_v_title = [w for w in words if w in v_title_clean]
        matching_words_v_prato = [w for w in words if w in v_prato_clean]
        matching_words_v_trans = [w for w in words if w in v_trans_clean]
        
        score += len(matching_words_r_name) * 5
        score += len(matching_words_v_prato) * 4
        score += len(matching_words_r_desc) * 2
        score += len(matching_words_v_title) * 3
        score += len(matching_words_v_trans) * 1
        
        # Boost if slug matches exactly
        if r_slug_clean in fn_clean:
            score += 20
        # Boost if name matches exactly
        if r_name_clean in fn_clean and len(r_name_clean) > 3:
            score += 25
            
        if score > 5:
            matches.append({
                "video_id": v["id"],
                "restaurante_id": v["restaurante_id"],
                "restaurant_name": r_name,
                "restaurant_slug": r_slug,
                "restaurant_desc": r_desc,
                "video_title": v["titulo"],
                "video_prato_destaque": v["prato_destaque"],
                "video_transcricao": v["transcricao"],
                "score": score
            })
            
    # Sort matches by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)
    best_match = matches[0] if matches else None
    
    results.append({
        "filename": filename,
        "best_match_restaurant": best_match["restaurant_name"] if best_match else "UNKNOWN",
        "best_match_slug": best_match["restaurant_slug"] if best_match else "UNKNOWN",
        "best_match_title": best_match["video_title"] if best_match else "UNKNOWN",
        "best_prato_destaque": best_match["video_prato_destaque"] if best_match else "UNKNOWN",
        "best_video_transcricao": best_match["video_transcricao"] if best_match else "UNKNOWN",
        "all_matches": [{"name": m["restaurant_name"], "score": m["score"], "prato": m["video_prato_destaque"]} for m in matches[:3]]
    })

with open("scratch_match_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done. Results written to scratch_match_results.json")
