import re
import unicodedata

# Paths to update
mock_file_path = "lib/supabase-mock.ts"
route_file_path = "app/api/videos/import/route.ts"
seed_file_path = "scripts/seed.ts"

def normalize_text(text):
    if not text:
        return ""
    # Normalize unicode to avoid differences like Aclimação vs Aclimação
    return unicodedata.normalize('NFC', text).strip()

def sanitize_bairro(nome, slug, desc, bairro):
    b = normalize_text(bairro)
    n = normalize_text(nome)
    d = normalize_text(desc).lower()
    
    # 1. Direct string mappings
    mappings = {
        '1290': 'Bela Vista',
        '131': 'Mooca',
        '1470': 'Tatuapé',
        '1613': 'Jardins',
        '281': 'Pinheiros',
        '394': 'Consolação',
        '951': 'Mooca',
        'Sala C.1': 'Tatuapé',
        'analia franco': 'Anália Franco',
        'Aclimação': 'Aclimação',
        'Consolação': 'Consolação',
    }
    
    if b in mappings:
        return mappings[b]
        
    # 2. Keyphrase substrings in neighborhood name
    if 'Largo da Batata' in b:
        return 'Pinheiros'
    if 'Azevedo Soares' in b or 'Tatuapé |' in b:
        return 'Tatuapé'
    if 'Santo Amaro (Boavista' in b or 'Santo Amaro (Boavista Shopping' in b:
        return 'Santo Amaro'
    if 'Av. Embaixador Macedo Soares' in b:
        return 'Vila Leopoldina'
    if 'Disneyland Paris' in b:
        return 'Paris'
    if 'Fiordo di Furore' in b:
        return 'Furore'
    if 'Kartódromo Aldeia da Serra' in b:
        return 'Barueri'
    if 'Lindt Home Of Chocolate' in b:
        return 'Suíça'
    if 'R. Isabel dias' in b:
        return 'Mooca'
    if 'Rod. Bunjiro Nakao' in b:
        return 'Ibiúna'
    if 'SBC' in b:
        return 'São Bernardo do Campo'
    if 'Shopping Tamboré' in b:
        return 'Barueri'
    if 'Jardim Analia Franco' in b:
        return 'Anália Franco'
    if 'Vila Olimpía' in b:
        return 'Vila Olímpia'

    # 3. Invalid/coupon/placeholder neighborhood indicators
    is_invalid = (
        b in ['Endereço:', 'Endereços:', 'Local:', 'ENDEREÇO:', 'Local'] or
        'Promo' in b or
        'Válido' in b or
        'Cupom' in b or
        (any(char.isdigit() for char in b) and not ('R.' in b or 'Av.' in b or 'Rod.' in b))
    )
    
    if is_invalid:
        # Check description keywords for context
        if 'thermas da mata' in d or 'parque aquático' in d:
            return 'Cotia'
        if 'rancho do ricardinho' in d:
            return 'Mairiporã'
        if 'gramado em sp' in d or 'vila de natal' in d or 'neve de verdade' in d:
            return 'Vila Mariana'
        if 'dopamineland' in d or 'dopamine land' in d:
            return 'Pinheiros'
        if 'vale do sol' in d:
            return 'Serra Negra'
        if 'pizzaria batepapo' in d or 'pizzaria bate papo' in d or 'batepapo' in d:
            return 'Guarujá'
        if 'pecatto' in d:
            return 'Mooca'
        if 'barakiah' in d or 'esfihas' in d:
            return 'Vila Guilherme'
        if 'santomar' in d or 'sacolada de frutos' in d or 'seafood' in d:
            return 'Tatuapé'
        if 'outback' in d:
            return 'Delivery'
        if 'bk' in d or 'burger king' in d or 'whopper' in d:
            return 'Delivery'
        if 'mc ' in d or 'mcdonald' in d or 'mcoferta' in d:
            return 'Delivery'
        if 'kfc' in d:
            return 'Delivery'
        if 'bolsas' in d or 'calçados' in d or 'outlet' in d:
            return 'Delivery'
        
        # Default fallback if it was a promo delivery post
        if '99 food' in d or '99food' in d or 'pedido' in d or 'desconto' in d:
            return 'Delivery'
            
        return 'Pinheiros' # General fallback
        
    return b

def sanitize_cozinha(tipo_cozinha):
    tc = normalize_text(tipo_cozinha).lower()
    if tc == 'servico':
        return 'utilidades'
    return tc

def process_file_content(content):
    # Match JS/TS object blocks inside array definitions
    # Matches { id: '...', nome: "...", ... } or without id { nome: "...", ... }
    # Look for patterns that contain slug and bairro keys
    def replace_block(match):
        block = match.group(0)
        
        # Parse fields using regex
        nome_m = re.search(r'nome:\s*["\'](.*?)["\']', block)
        slug_m = re.search(r'slug:\s*["\'](.*?)["\']', block)
        desc_m = re.search(r'descricao:\s*["\'](.*?)["\']', block)
        bairro_m = re.search(r'bairro:\s*["\'](.*?)["\']', block)
        cozinha_m = re.search(r'tipo_cozinha:\s*["\'](.*?)["\']', block)
        
        if not (slug_m and bairro_m):
            return block # Not a restaurant object block
            
        nome = nome_m.group(1) if nome_m else ""
        slug = slug_m.group(1)
        desc = desc_m.group(1) if desc_m else ""
        bairro = bairro_m.group(1)
        cozinha = cozinha_m.group(1) if cozinha_m else ""
        
        new_bairro = sanitize_bairro(nome, slug, desc, bairro)
        
        # Perform replacements on the block string
        new_block = block
        
        # 1. Replace bairro
        # Match exactly 'bairro: "..."' or 'bairro: \'...\''
        new_block = re.sub(
            r'(bairro:\s*)(["\'])(.*?)(["\'])',
            rf'\1\2{new_bairro}\4',
            new_block
        )
        
        # 2. Replace type of cuisine if needed
        if cozinha:
            new_cozinha = sanitize_cozinha(cozinha)
            new_block = re.sub(
                r'(tipo_cozinha:\s*)(["\'])(.*?)(["\'])',
                rf'\1\2{new_cozinha}\4',
                new_block
            )
            
        return new_block

    # Regex matching blocks of braces {} that contain "slug:" and "bairro:"
    # This matches braces without nested braces to be safe
    pattern = re.compile(r'\{[^{}]*?slug:\s*[\x27\x22][^\x27\x22]+?[\x27\x22][^{}]*?\}', re.DOTALL)
    new_content, count = pattern.subn(replace_block, content)
    return new_content, count

def clean_file(path):
    print(f"Cleaning {path}...")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_content, count = process_file_content(content)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
        
    print(f"Done cleaning {path}. Modified {count} blocks.")

if __name__ == "__main__":
    clean_file(mock_file_path)
    clean_file(route_file_path)
    clean_file(seed_file_path)
    print("All database files sanitized successfully!")
