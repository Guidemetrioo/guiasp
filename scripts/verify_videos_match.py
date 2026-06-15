import re
import os
import json
import unicodedata

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
    
    if id_m and name_m:
        restaurants[id_m.group(1)] = name_m.group(1)

videos = []
for v_str in video_objects:
    id_m = re.search(r"id:\s*'([^']+)'", v_str)
    rest_id_m = re.search(r"restaurante_id:\s*'([^']+)'", v_str)
    title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    
    if id_m:
        videos.append({
            "id": id_m.group(1),
            "restaurante_id": rest_id_m.group(1) if rest_id_m else "",
            "titulo": title_m.group(1) if title_m else ""
        })

# Check files in public/videos
local_files = [f for f in os.listdir(videos_dir) if f.lower().endswith(".mp4")]

print(f"Total local video files: {len(local_files)}")
print(f"Total mock videos: {len(videos)}")

matched_count = 0
unmatched_files = []

for filename in local_files:
    base_name = filename[:-4]
    # Find in DB
    found = False
    for v in videos:
        if sanitize_filename(v["titulo"]) == base_name:
            found = True
            r_name = restaurants.get(v["restaurante_id"], "UNKNOWN")
            # print(f"File {filename} matches video: '{v['titulo']}' (Restaurant: {r_name})")
            matched_count += 1
            break
    if not found:
        unmatched_files.append(filename)

print(f"\nMatched: {matched_count} files.")
print(f"Unmatched local files: {len(unmatched_files)}")
for uf in unmatched_files:
    print(f"- {uf}")
