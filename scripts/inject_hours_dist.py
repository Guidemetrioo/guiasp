import re

# Paths to update
mock_file_path = "lib/supabase-mock.ts"
route_file_path = "app/api/videos/import/route.ts"
seed_file_path = "scripts/seed.ts"

def get_deterministic_data(slug):
    h = sum(ord(c) for c in slug)
    
    # Proximity distance between 0.2 and 9.8 km
    dist = round(0.2 + (h % 97) / 10.0, 1)
    
    # Opening schedules
    aberturas = ['12:00', '18:00', '08:00']
    fechamentos = ['23:00', '02:00', '18:00']
    idx = h % 3
    
    return aberturas[idx], fechamentos[idx], dist

def process_file_content(path):
    print(f"Reading {path}...")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Regex matching blocks of braces {} that contain "slug:" and "bairro:"
    pattern = re.compile(r'\{[^{}]*?slug:\s*[\x27\x22]([^\x27\x22]+?)[\x27\x22][^{}]*?\}', re.DOTALL)
    
    def replace_block(match):
        block = match.group(0)
        slug = match.group(1)
        
        # Check if fields are already injected
        if "horario_abertura" in block:
            return block
            
        abertura, fechamento, dist = get_deterministic_data(slug)
        
        # Match indentation and insertion point (after slug)
        # We find: indent + slug: '...'
        slug_pattern = re.compile(r'^(\s*)slug:\s*[\x27\x22](.*?)[\x27\x22],?', re.MULTILINE)
        
        def insert_fields(m):
            indent = m.group(1)
            original_slug_line = m.group(0)
            return (
                f"{original_slug_line}\n"
                f"{indent}horario_abertura: '{abertura}',\n"
                f"{indent}horario_fechamento: '{fechamento}',\n"
                f"{indent}distancia_km: {dist},"
            )
            
        new_block = slug_pattern.sub(insert_fields, block)
        return new_block

    new_content, count = pattern.subn(replace_block, content)
    
    # Save back
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Updated {path}. Modified {count} restaurant blocks.")

def update_rpc_returned_properties():
    print(f"Updating RPC return mapping in {mock_file_path}...")
    with open(mock_file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    target_content = """              foto_capa_url: r.foto_capa_url,
              prato_destaque: video?.prato_destaque || null,"""
              
    replacement_content = """              foto_capa_url: r.foto_capa_url,
              horario_abertura: r.horario_abertura,
              horario_fechamento: r.horario_fechamento,
              distancia_km: r.distancia_km,
              prato_destaque: video?.prato_destaque || null,"""
              
    if target_content in content:
        content = content.replace(target_content, replacement_content)
        with open(mock_file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("RPC mapping updated successfully.")
    else:
        print("RPC mapping was already updated or target content not found.")

if __name__ == "__main__":
    process_file_content(mock_file_path)
    process_file_content(route_file_path)
    process_file_content(seed_file_path)
    update_rpc_returned_properties()
    print("Injection finished successfully!")
