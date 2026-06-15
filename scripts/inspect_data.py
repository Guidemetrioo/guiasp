import re
import os

mock_file = "lib/supabase-mock.ts"

with open(mock_file, "r", encoding="utf-8") as f:
    content = f.read()

# Let's write a simple python parser to extract objects from the array
def parse_objects(array_str):
    objects = []
    # Find all { ... } blocks
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

# Let's extract key fields from each restaurant
restaurants = []
for r_str in rest_objects:
    id_m = re.search(r"id:\s*'([^']+)'", r_str)
    name_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    slug_m = re.search(r"slug:\s*'([^']+)'", r_str)
    desc_m = re.search(r"descricao:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    
    if id_m and name_m:
        restaurants.append({
            "id": id_m.group(1),
            "nome": name_m.group(1),
            "slug": slug_m.group(1) if slug_m else "",
            "descricao": desc_m.group(1) if desc_m else ""
        })

videos = []
for v_str in video_objects:
    id_m = re.search(r"id:\s*'([^']+)'", v_str)
    rest_id_m = re.search(r"restaurante_id:\s*'([^']+)'", v_str)
    title_m = re.search(r"titulo:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    desc_m = re.search(r"prato_destaque:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    trans_m = re.search(r"transcricao:\s*['\x22]([^'\x22]+)['\x22]", v_str)
    
    if id_m:
        videos.append({
            "id": id_m.group(1),
            "restaurante_id": rest_id_m.group(1) if rest_id_m else "",
            "titulo": title_m.group(1) if title_m else "",
            "prato_destaque": desc_m.group(1) if desc_m else "",
            "transcricao": trans_m.group(1) if trans_m else ""
        })

out_lines = []
out_lines.append(f"Found {len(restaurants)} mock restaurants.")
out_lines.append(f"Found {len(videos)} mock videos.")

out_lines.append("\n--- Restaurant list in mock: ---")
for r in restaurants:
    out_lines.append(f"- {r['nome']} ({r['slug']}) | ID: {r['id']}")

out_lines.append("\n--- Video list in mock: ---")
for v in videos:
    r_name = next((r['nome'] for r in restaurants if r['id'] == v['restaurante_id']), "UNKNOWN")
    out_lines.append(f"- Video: '{v['titulo']}' -> Restaurant: {r_name} | Prato Destaque: {v['prato_destaque']}")

with open("scratch_inspect_output.txt", "w", encoding="utf-8") as f_out:
    f_out.write("\n".join(out_lines))

print("Done inspecting. Output written to scratch_inspect_output.txt")
