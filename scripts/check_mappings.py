import re
import os
import json

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

restaurants = {}
for r_str in rest_objects:
    id_m = re.search(r"id:\s*'([^']+)'", r_str)
    name_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    desc_m = re.search(r"descricao:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    slug_m = re.search(r"slug:\s*'([^']+)'", r_str)
    
    if id_m and name_m:
        restaurants[id_m.group(1)] = {
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

TARGET_TITLES = [
    "Review de Padaria Carillo por @navegandosp",
    "Review de 99burgersp por @navegandosp",
    "Review de Recomendação Navegando 115 por @navegandosp",
    "Review de Pizzaria Do Paulinho por @navegandosp",
    "Review de Pinkynaopink por @navegandosp",
    "Review de Dead Burger Lapa por @navegandosp",
    "Review de Figo Br por @navegandosp",
    "Review de Point do Gordão por @navegandosp",
    "Review de Recomendação Navegando 132 por @navegandosp",
    "Review de Ruazinhasp por @navegandosp",
    "Review de Recomendação Navegando 55 por @navegandosp",
    "Review de Killerburgerbr por @navegandosp",
    "Review de Sloopburger por @navegandosp",
    "Review de Senhorapaulistanamoema por @navegandosp",
    "Review de Tinapizzeriaoficial por @navegandosp",
    "Review de Pelotasfood por @navegandosp",
    "Review de Hellmannsbr por @navegandosp",
    "Review de Festivalsaidera por @navegandosp",
    "Review de Dueamicicantina por @navegandosp",
    "Review de Albakoasushi por @navegandosp",
    "Review de Jucabowling por @navegandosp",
    "Review de Hippos Burger por @navegandosp",
    "Review de Familiapresto por @navegandosp",
    "Review de Pecatto Tatuapé por @navegandosp",
    "Review de Paparoto Cucina por @navegandosp",
    "Review de Nestor Pizzaria por @navegandosp",
    "Review de Hao Sushi Itaim por @perambulandosp",
    "Review de Toca do Peixe por @navegandosp",
    "Review de Helenadinapolipizzaria por @navegandosp",
    "Review de Gabrielbruno por @navegandosp"
]

matched_videos = []

for title in TARGET_TITLES:
    found_v = [v for v in videos if v["titulo"] == title]
    if not found_v:
        found_v = [v for v in videos if title.lower() in v["titulo"].lower()]
    
    for fv in found_v:
        r_info = restaurants.get(fv["restaurante_id"], {"nome": "NOT FOUND", "descricao": "", "slug": ""})
        matched_videos.append({
            "target_title": title,
            "db_title": fv["titulo"],
            "restaurant_id": fv["restaurante_id"],
            "restaurant_name": r_info["nome"],
            "restaurant_desc": r_info["descricao"],
            "restaurant_slug": r_info["slug"],
            "prato_destaque": fv["prato_destaque"],
            "transcricao": fv["transcricao"]
        })

# Write reports to json
with open("scratch_matched_report.json", "w", encoding="utf-8") as f:
    json.dump(matched_videos, f, ensure_ascii=False, indent=2)

print("Done. Matched report written to scratch_matched_report.json")
