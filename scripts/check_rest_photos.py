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

# Get first 30 restaurants mapping slug -> foto_capa_url
for r_str in rest_objects:
    name_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    slug_m = re.search(r"slug:\s*'([^']+)'", r_str)
    foto_m = re.search(r"foto_capa_url:\s*['\x22]([^'\x22]+)['\x22]", r_str)
    
    if name_m and slug_m and foto_m:
        if "placeholder" not in foto_m.group(1):
            print(f"- {name_m.group(1)}: {foto_m.group(1)}")
