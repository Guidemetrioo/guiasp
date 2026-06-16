import re
import os

mock_file = "lib/supabase-mock.ts"

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

# Map restaurant ID -> has video
rest_videos = {}
for v_str in video_objects:
    rest_id_m = re.search(r"restaurante_id:\s*'([^']+)'", v_str)
    title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    if rest_id_m and title_m and "NO TITLE" not in title_m.group(1):
        rest_videos[rest_id_m.group(1)] = True

ready_count = 0
total_count = 0
for r_str in rest_objects:
    id_m = re.search(r"id:\s*'([^']+)'", r_str)
    name_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    desc_m = re.search(r"descricao:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    abertura_m = re.search(r"horario_abertura:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    fechamento_m = re.search(r"horario_fechamento:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    
    if id_m and name_m:
        total_count += 1
        rid = id_m.group(1)
        has_video = rid in rest_videos
        has_desc = desc_m and len(desc_m.group(1).strip()) > 0 and "placeholder" not in desc_m.group(1).lower()
        has_hours = abertura_m and fechamento_m
        
        is_ready = has_video and has_desc and has_hours
        if is_ready:
            ready_count += 1
            print(f"READY: {name_m.group(1)}")

print(f"Total: {total_count}, Ready: {ready_count}")
