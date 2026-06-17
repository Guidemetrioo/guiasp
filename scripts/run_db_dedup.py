import re
import os

mock_file = "lib/supabase-mock.ts"
seed_file = "scripts/seed.ts"

def clean_mock_db():
    print("Deduplicating lib/supabase-mock.ts...")
    with open(mock_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    moveis_from = "147f882d-601d-41c9-bba3-93dacb740b7c"
    moveis_to = "5025ea21-1eb6-4fb4-bac3-659c89cde7e4"
    
    uba_from = "3fb62a0c-a314-4261-94ba-503d457685db"
    uba_to = "6978dce4-4897-4574-b845-f2837ab2dacd"
    
    # Parse mockRestaurantes block
    idx_start = content.find("const mockRestaurantes =")
    idx_end = content.find("const mockVideos =")
    rest_block = content[idx_start:idx_end]
    
    # Simple curly-braces block parser
    objects = []
    brace_count = 0
    current_obj = []
    for char in rest_block:
        if char == '{':
            brace_count += 1
        if brace_count > 0:
            current_obj.append(char)
        if char == '}':
            brace_count -= 1
            if brace_count == 0:
                objects.append("".join(current_obj))
                current_obj = []
                
    # Filter out duplicate restaurants before replacing IDs!
    filtered_objects = []
    removed_count = 0
    for obj_str in objects:
        if moveis_from in obj_str:
            print("Removing duplicate Moveisjunco from mockRestaurantes list")
            removed_count += 1
            continue
        if uba_from in obj_str:
            print("Removing duplicate Temporadasubatuba-- from mockRestaurantes list")
            removed_count += 1
            continue
        filtered_objects.append(obj_str)
        
    first_brace = rest_block.find('{')
    last_brace = rest_block.rfind('}')
    
    prefix = rest_block[:first_brace]
    suffix = rest_block[last_brace+1:]
    
    new_rest_block = prefix + ",\n".join(filtered_objects) + suffix
    content = content[:idx_start] + new_rest_block + content[idx_end:]
    
    # NOW replace the ID references in videos and plans
    content = content.replace(f"'{moveis_from}'", f"'{moveis_to}'")
    content = content.replace(f"'{uba_from}'", f"'{uba_to}'")
    
    with open(mock_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Deduplication for mock database completed. Removed {removed_count} duplicate restaurants.")

def clean_seed_script():
    print("Deduplicating scripts/seed.ts...")
    with open(seed_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Parse mockRestaurantes array in seed.ts (named restaurantesData)
    match_arr = re.search(r"const\s+restaurantesData\s*=\s*\[", content)
    if not match_arr:
        print("Error: Could not locate const restaurantesData in seed.ts")
        return
        
    idx_start = match_arr.start()
    
    # Parse the list up to the next closing bracket matching the list
    bracket_count = 0
    idx_end = idx_start
    for i in range(idx_start, len(content)):
        if content[i] == '[':
            bracket_count += 1
        elif content[i] == ']':
            bracket_count -= 1
            if bracket_count == 0:
                idx_end = i + 1
                break
                
    list_block = content[idx_start:idx_end]
    
    # Parse curly braces objects within this list block
    objects = []
    brace_count = 0
    current_obj = []
    for char in list_block:
        if char == '{':
            brace_count += 1
        if brace_count > 0:
            current_obj.append(char)
        if char == '}':
            brace_count -= 1
            if brace_count == 0:
                objects.append("".join(current_obj))
                current_obj = []
                
    filtered_objects = []
    removed_count = 0
    for obj_str in objects:
        if "slug: 'moveisjunco'" in obj_str:
            print("Removing duplicate Moveisjunco from seed.ts restaurants list")
            removed_count += 1
            continue
        if "slug: 'temporadasubatuba--'" in obj_str:
            print("Removing duplicate Temporadasubatuba-- from seed.ts restaurants list")
            removed_count += 1
            continue
        filtered_objects.append(obj_str)
        
    first_brace = list_block.find('{')
    last_brace = list_block.rfind('}')
    
    prefix = list_block[:first_brace]
    suffix = list_block[last_brace+1:]
    
    new_list_block = prefix + ",\n".join(filtered_objects) + suffix
    content = content[:idx_start] + new_list_block + content[idx_end:]
    
    # Update mapRestaurante references
    content = content.replace("mapRestaurante('moveisjunco')", "mapRestaurante('moveis-junco')")
    content = content.replace("mapRestaurante('temporadasubatuba--')", "mapRestaurante('temporadasubatuba-')")
    
    with open(seed_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Deduplication for seed.ts completed. Removed {removed_count} duplicate restaurants.")

if __name__ == "__main__":
    clean_mock_db()
    clean_seed_script()
