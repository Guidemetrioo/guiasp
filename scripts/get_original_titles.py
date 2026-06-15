import re
import os
import json
import unicodedata

mock_file = "lib/supabase-mock.ts"

def sanitize_filename(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

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
    slug_m = re.search(r"slug:\s*'([^']+)'", r_str)
    
    if id_m and name_m:
        restaurants[id_m.group(1)] = {
            "nome": name_m.group(1),
            "slug": slug_m.group(1)
        }

first_15_slugs = [
    "pantchos-house-burger",
    "pecatto-bar-restaurante",
    "outlet-do-suplemento",
    "stunt-burger",
    "santomar-restaurante",
    "pizzaria-vero-paradiso",
    "casa-na-praia-bar",
    "hao-sushi-itaim",
    "arabia-night-paulista",
    "busger",
    "villa-e-prosa",
    "o-mineiro-prime",
    "costelao-atibaia",
    "legado-parrilla"
]

results = []
for slug in first_15_slugs:
    r_id = next((rid for rid, r in restaurants.items() if r["slug"] == slug), None)
    if r_id:
        r_videos = []
        for v_str in video_objects:
            v_rest_id_m = re.search(r"restaurante_id:\s*'([^']+)'", v_str)
            if v_rest_id_m and v_rest_id_m.group(1) == r_id:
                v_title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
                v_title = v_title_m.group(1) if v_title_m else "NO TITLE"
                r_videos.append(v_title)
        
        results.append({
            "slug": slug,
            "videos": r_videos
        })

with open("scratch_original_titles.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done. Written to scratch_original_titles.json")
