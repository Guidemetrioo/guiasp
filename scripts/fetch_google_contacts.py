import os
import re
import json
import time
import urllib.parse
import sys
from duckduckgo_search import DDGS

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='replace')

# Paths
mock_file_path = "lib/supabase-mock.ts"
output_json_path = "lib/restaurant-contacts-seeded.json"

def parse_mock_restaurants():
    """Reads all restaurants and their boroughs from supabase-mock.ts"""
    print("Reading supabase-mock.ts...")
    with open(mock_file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Match mockRestaurantes array block
    match = re.search(r"const mockRestaurantes = \[\s*(.*?)\s*\]\s*const", content, re.DOTALL)
    if not match:
        match = re.search(r"const mockRestaurantes = \[\s*(.*?)\s*\]", content, re.DOTALL)

    if not match:
        print("Error: Could not parse mockRestaurantes block!")
        return []

    rests_block = match.group(1)
    objects = rests_block.split("},")
    restaurants = []

    for obj in objects:
        slug_m = re.search(r"slug:\s*['\x22]([^'\x22]+)['\x22]", obj)
        nome_m = re.search(r"nome:\s*['\x22]([^'\x22]+)['\x22]", obj)
        bairro_m = re.search(r"bairro:\s*['\x22]([^'\x22]+)['\x22]", obj)
        cidade_m = re.search(r"cidade:\s*['\x22]([^'\x22]+)['\x22]", obj)
        
        if slug_m and nome_m:
            slug = slug_m.group(1)
            nome = nome_m.group(1)
            bairro = bairro_m.group(1) if bairro_m else ""
            cidade = cidade_m.group(1) if cidade_m else "São Paulo"
            
            # Skip placeholder recommendation templates if they aren't real food spots
            if "recomendacao" in slug.lower() or "placeholders" in slug.lower():
                continue
                
            restaurants.append({
                "slug": slug,
                "nome": nome,
                "bairro": bairro,
                "cidade": cidade
            })

    print(f"Parsed {len(restaurants)} real restaurants/shops to lookup.")
    return restaurants

def clean_extracted_phone(text):
    """Cleans phone numbers into a standard format and whatsapp-compatible number"""
    # Look for standard BR phone numbers (mobile or landline)
    # Ex: (11) 98765-4321, 11987654321, 2365-6435
    digits = re.sub(r"\D", "", text)
    if len(digits) == 8:
        # Landline without DDD, default to 11
        digits = "11" + digits
    elif len(digits) == 9:
        # Mobile without DDD, default to 11
        digits = "11" + digits
    
    # Prefix with 55 for WhatsApp if not present
    if len(digits) in (10, 11) and not digits.startswith("55"):
        wa_num = "55" + digits
    else:
        wa_num = digits if digits.startswith("55") else "5511" + digits
        
    # Standard format: (XX) XXXX-XXXX or (XX) XXXXX-XXXX
    if len(digits) == 10:
        formatted = f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    elif len(digits) == 11:
        formatted = f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    else:
        formatted = text
        
    return formatted, wa_num

def extract_contacts_from_results(nome, results):
    """Extracts address, phone, and delivery/social links from search results"""
    address = ""
    phone = ""
    delivery_url = ""
    
    # BR Zip Code Regex
    cep_pattern = re.compile(r"\b\d{5}-\d{3}\b")
    # Phone number regex (flexible BR format)
    phone_pattern = re.compile(r"\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}")
    
    # Specific delivery platforms
    delivery_patterns = [
        re.compile(r"https?://(?:www\.)?ifood\.com\.br/[^\s\x22\x27\)]+"),
        re.compile(r"[^\s\x22\x27\)]+\.anota\.ai[^\s\x22\x27\)]*"),
        re.compile(r"https?://(?:www\.)?deliverydireto\.com\.br/[^\s\x22\x27\)]+"),
        re.compile(r"https?://(?:www\.)?linktr\.ee/[^\s\x22\x27\)]+"),
        re.compile(r"[^\s\x22\x27\)]+\.saipos\.com[^\s\x22\x27\)]*"),
        re.compile(r"[^\s\x22\x27\)]+\.instadelivery\.com[^\s\x22\x27\)]*")
    ]

    combined_text = " ".join([f"{r.get('title', '')} {r.get('body', '')} {r.get('href', '')}" for r in results])
    
    # 1. Search for Delivery Link in results
    for pattern in delivery_patterns:
        m = pattern.search(combined_text)
        if m:
            delivery_url = m.group(0).rstrip(".,;)-")
            break
            
    if not delivery_url:
        # Fallback: search for any web link that might be the official site
        for r in results:
            href = r.get("href", "")
            if href and not any(domain in href for domain in ("google.com", "instagram.com", "facebook.com", "youtube.com", "tripadvisor.com", "guiamais.com", "yelp.com", "wikipedia.org")):
                delivery_url = href
                break

    # 2. Search for Phone Number
    phone_match = phone_pattern.search(combined_text)
    if phone_match:
        phone = phone_match.group(0)

    # 3. Search for Address (CEP or Street identifiers)
    # If we find a CEP, grab the sentence around it.
    cep_match = cep_pattern.search(combined_text)
    if cep_match:
        idx = cep_match.start()
        # Grab around 80 characters before and after CEP
        snippet = combined_text[max(0, idx - 100):min(len(combined_text), idx + 20)]
        # Look for street keywords in the snippet
        street_m = re.search(r"(?:Rua|Av\.|Avenida|Alameda|Al\.|Praça|Pça|Travessa|Rodovia|Estrada)\s+[A-Z][a-zA-Z0-9\s,.-]+", snippet, re.IGNORECASE)
        if street_m:
            address = f"{street_m.group(0).strip()}, São Paulo - SP, {cep_match.group(0)}"
        else:
            address = f"São Paulo - SP, {cep_match.group(0)}"
    else:
        # Fallback street address match
        street_m = re.search(r"(?:Rua|Av\.|Avenida|Alameda|Al\.|Praça|Pça|Travessa|Rodovia|Estrada)\s+[A-Z][A-Za-z0-9\s,.-]+\d+", combined_text)
        if street_m:
            address = f"{street_m.group(0).strip()}, São Paulo - SP"

    return address, phone, delivery_url

def lookup_restaurant(ddgs, name, borough, city):
    """Performs search lookup on DDG and extracts data"""
    query = f'"{name}" {borough} {city} contato telefone endereco'
    print(f"Searching: {query} ...")
    try:
        results = list(ddgs.text(query, max_results=4))
        if not results:
            # Try a broader search query
            results = list(ddgs.text(f"{name} {borough} {city} restaurante", max_results=3))
        return results
    except Exception as e:
        print(f"Error querying DDG for '{name}': {e}")
        return []

def main():
    restaurants = parse_mock_restaurants()
    if not restaurants:
        return

    # Load existing contacts if any, to preserve manual mappings (like Pantcho's, Pecatto, etc.)
    contacts_database = {}
    
    # Try to load existing progress
    if os.path.exists(output_json_path):
        try:
            with open(output_json_path, "r", encoding="utf-8") as f:
                contacts_database = json.load(f)
            print(f"Loaded {len(contacts_database)} existing contacts from {output_json_path}")
        except Exception as e:
            print(f"Could not load existing progress JSON: {e}")
            contacts_database = {}

    # We define the core high-quality manual contacts we already verified
    verified_contacts = {
        "pantchos-house-burger": {
            "endereco": "Avenida Manuel Alves Soares, 404 - Parque Colonial, São Paulo - SP, 04821-270",
            "telefone": "(11) 2589-0467",
            "whatsapp": "551123656435",
            "deliveryUrl": "https://deliverydireto.com.br/pantchoshousehamburgueria"
        },
        "pecatto-bar-restaurante": {
            "endereco": "Rua Emília Marengo, 1286 - Tatuapé, São Paulo - SP, 03336-000",
            "telefone": "(11) 2673-9193",
            "whatsapp": "551126739193",
            "deliveryUrl": "https://pecatto.anota.ai"
        },
        "pecatto-tatuape": {
            "endereco": "Rua Emília Marengo, 1286 - Tatuapé, São Paulo - SP, 03336-000",
            "telefone": "(11) 2673-9193",
            "whatsapp": "551126739193",
            "deliveryUrl": "https://pecatto.anota.ai"
        },
        "outlet-do-suplemento": {
            "endereco": "Rua Ponta Grossa, 237 - Parque Mandaqui, São Paulo - SP, 02420-010",
            "telefone": "(11) 2365-6435",
            "whatsapp": "5511999999999",
            "deliveryUrl": "https://sejatotal.com"
        },
        "seja-total-galpao": {
            "endereco": "Rua Ponta Grossa, 237 - Parque Mandaqui, São Paulo - SP, 02420-010",
            "telefone": "N/A",
            "whatsapp": "5511999999999",
            "deliveryUrl": "https://sejatotal.com"
        },
        "stunt-burger": {
            "endereco": "Rua José Jannarelli, 426 - Vila Progredior, São Paulo - SP, 05615-000",
            "telefone": "(11) 3721-3538",
            "whatsapp": "5511955206206",
            "deliveryUrl": "https://www.stuntburger.com.br"
        },
        "hellmannsbr": {
            "endereco": "Rua José Jannarelli, 426 - Vila Progredior, São Paulo - SP, 05615-000",
            "telefone": "(11) 3721-3538",
            "whatsapp": "5511955206206",
            "deliveryUrl": "https://www.stuntburger.com.br"
        },
        "santomar-restaurante": {
            "endereco": "Rua Francisco Marengo, 773 - Tatuapé, São Paulo - SP, 03313-000",
            "telefone": "(11) 2942-7594",
            "whatsapp": "5511944672523",
            "deliveryUrl": "https://santomar.anota.ai"
        },
        "pizzaria-vero-paradiso": {
            "endereco": "Rua Tutóia, 194 - Paraíso, São Paulo - SP, 04007-000",
            "telefone": "(11) 3884-3646",
            "whatsapp": "551138843646",
            "deliveryUrl": "https://veroparadiso.anota.ai"
        },
        "casa-na-praia-bar": {
            "endereco": "Rua Doutor Amâncio de Carvalho, 329 - Vila Mariana, São Paulo - SP, 04012-090",
            "telefone": "(11) 5082-5002",
            "whatsapp": "551150825002",
            "deliveryUrl": "https://www.ifood.com.br"
        },
        "hao-sushi-itaim": {
            "endereco": "Rua João Cachoeira, 1556 - Vila Nova Conceição, São Paulo - SP, 04535-007",
            "telefone": "(11) 5536-0783",
            "whatsapp": "551155360783",
            "deliveryUrl": "https://www.ifood.com.br"
        },
        "arabia-night-paulista": {
            "endereco": "Av. Paulista, 1941 (Shopping Market Paulista) - Bela Vista, São Paulo - SP, 01311-300",
            "telefone": "N/A",
            "whatsapp": "5511999999999",
            "deliveryUrl": "https://www.marketpaulista.com.br"
        },
        "busger": {
            "endereco": "Av. Vereador José Diniz, 3700 - Campo Belo, São Paulo - SP, 04606-007",
            "telefone": "(11) 2365-1695",
            "whatsapp": "551123651695",
            "deliveryUrl": "https://www.ifood.com.br/delivery/sao-paulo-sp/busger---campo-belo-campo-belo"
        },
        "villa-e-prosa": {
            "endereco": "Rua Cubatão, 1116 - Vila Mariana, São Paulo - SP, 04013-004",
            "telefone": "N/A",
            "whatsapp": "5511999999999",
            "deliveryUrl": "https://www.ifood.com.br"
        }
    }
    
    # Always ensure verified ones are set correctly
    contacts_database.update(verified_contacts)

    # We perform the search with throttled API calls
    # Filter out verified ones AND those that are already in our loaded json database to prevent duplicate search!
    lookup_list = [
        r for r in restaurants 
        if r["slug"] not in verified_contacts and r["slug"] not in contacts_database
    ]
    
    print(f"Need to lookup {len(lookup_list)} remaining restaurants.")
    
    # We group by unique slugs to avoid double-searching
    unique_lookups = {}
    for r in lookup_list:
        unique_lookups[r["slug"]] = r

    print(f"Unique lookup list size: {len(unique_lookups)}")

    if len(unique_lookups) > 0:
        count = 0
        with DDGS() as ddgs:
            for slug, r in unique_lookups.items():
                count += 1
                print(f"[{count}/{len(unique_lookups)}] Looking up '{r['nome']}' ({slug})...")
                
                results = lookup_restaurant(ddgs, r["nome"], r["bairro"], r["cidade"])
                
                if results:
                    addr, tel, d_url = extract_contacts_from_results(r["nome"], results)
                    
                    # Format phone and whatsapp number
                    if tel:
                        formatted_tel, wa_num = clean_extracted_phone(tel)
                    else:
                        formatted_tel = "N/A"
                        wa_num = "5511999999999" # Default fallback wa
                        
                    # Use bairro as default address if parsing failed
                    if not addr:
                        addr = f"{r['bairro'] or r['cidade'] or 'São Paulo'} - São Paulo, SP"
                        
                    if not d_url:
                        d_url = "https://www.ifood.com.br" # Default fallback delivery
                        
                    contacts_database[slug] = {
                        "endereco": addr,
                        "telefone": formatted_tel,
                        "whatsapp": wa_num,
                        "deliveryUrl": d_url
                    }
                    print(f"   Mapped: Address='{addr}' | Tel='{formatted_tel}' | Delivery='{d_url}'")
                else:
                    # Default fallback mapping
                    contacts_database[slug] = {
                        "endereco": f"{r['bairro'] or 'São Paulo'} - São Paulo, SP",
                        "telefone": "N/A",
                        "whatsapp": "5511999999999",
                        "deliveryUrl": "https://www.ifood.com.br"
                    }
                    print("   No search results. Used fallback placeholders.")
                    
                # Write progress periodically (after every lookup) to save state
                try:
                    with open(output_json_path, "w", encoding="utf-8") as f:
                        json.dump(contacts_database, f, indent=2, ensure_ascii=False)
                except Exception as e:
                    print(f"Error saving progress JSON: {e}")
                    
                # Throttle requests
                time.sleep(2)

    # Save to JSON file final write
    try:
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(contacts_database, f, indent=2, ensure_ascii=False)
        print(f"Done! Seeded contact details for {len(contacts_database)} unique restaurants.")
        print(f"Results written to: {output_json_path}")
    except Exception as e:
        print(f"Error writing final JSON: {e}")

if __name__ == "__main__":
    main()
