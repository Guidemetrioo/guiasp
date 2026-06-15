import os
import re
import json
import time
import sys
from duckduckgo_search import DDGS

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='replace')

# Paths
mock_file_path = "lib/supabase-mock.ts"
output_json_path = "lib/restaurant-contacts-seeded.json"

def parse_mock_restaurants():
    """Reads all restaurants and their hours/cuisine from supabase-mock.ts"""
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
        abertura_m = re.search(r"horario_abertura:\s*['\x22]([^'\x22]+)['\x22]", obj)
        fechamento_m = re.search(r"horario_fechamento:\s*['\x22]([^'\x22]+)['\x22]", obj)
        tipo_m = re.search(r"tipo_cozinha:\s*['\x22]([^'\x22]+)['\x22]", obj)
        
        if slug_m and nome_m:
            slug = slug_m.group(1)
            nome = nome_m.group(1)
            bairro = bairro_m.group(1) if bairro_m else ""
            cidade = cidade_m.group(1) if cidade_m else "São Paulo"
            abertura = abertura_m.group(1) if abertura_m else "12:00"
            fechamento = fechamento_m.group(1) if fechamento_m else "22:00"
            tipo_cozinha = tipo_m.group(1) if tipo_m else "restaurante"
            
            if "recomendacao" in slug.lower() or "placeholders" in slug.lower():
                continue
                
            restaurants.append({
                "slug": slug,
                "nome": nome,
                "bairro": bairro,
                "cidade": cidade,
                "abertura": abertura,
                "fechamento": fechamento,
                "tipo_cozinha": tipo_cozinha
            })

    print(f"Parsed {len(restaurants)} real restaurants/shops to process.")
    return restaurants

def infer_default_schedule(abertura, fechamento, tipo_cozinha):
    """Generates a highly realistic weekly schedule based on restaurant type and base hours"""
    schedule = {}
    days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
    
    # Heuristics: upscale/traditional cuisines are typically closed on Mondays in SP
    closed_on_mondays = tipo_cozinha.lower() in [
        "italiano", "frutos do mar", "japones", "churrasco", "bistrô", "árabe", "portuguesa"
    ]
    
    for day in days:
        if day == "segunda" and closed_on_mondays:
            schedule[day] = { "aberto": False }
        else:
            day_abertura = abertura
            day_fechamento = fechamento
            
            # Friday & Saturday closing times are often extended by 30-60 minutes
            if day in ["sexta", "sabado"]:
                try:
                    h, m = map(int, fechamento.split(":"))
                    if h < 23:
                        day_fechamento = f"{h+1:02d}:{m:02d}"
                    elif h == 23:
                        day_fechamento = "00:00"
                except Exception:
                    pass
            
            # Sunday closing times are often earlier (e.g. dinner closed or lunch only)
            if day == "domingo":
                try:
                    h, m = map(int, fechamento.split(":"))
                    # If it's a lunch-heavy place or closes late, pull it back
                    if h >= 22:
                        day_fechamento = "22:00"
                except Exception:
                    pass

            schedule[day] = {
                "aberto": True,
                "turnos": [{ "abertura": day_abertura, "fechamento": day_fechamento }]
            }
            
    return schedule

def extract_weekly_hours_from_text(text, base_schedule, abertura, fechamento):
    """Adjusts the base schedule if explicit closing rules or hours are detected in search text"""
    text = text.lower()
    
    # Check for Monday closure
    monday_closed_phrases = [
        "segunda fechada", "segunda-feira fechada", "fechado segunda", 
        "fechado às segundas", "não abre segunda", "segunda: fechado",
        "segunda-feira: fechado", "seg: fechado", "segunda feira fechado"
    ]
    for phrase in monday_closed_phrases:
        if phrase in text:
            base_schedule["segunda"] = { "aberto": False }
            break
            
    # Check for Monday open overrides (like open daily)
    monday_open_phrases = [
        "todos os dias", "diariamente", "segunda a domingo", "seg a dom",
        "aberto diariamente", "funciona todos os dias"
    ]
    for phrase in monday_open_phrases:
        if phrase in text:
            if not base_schedule["segunda"].get("aberto", True):
                base_schedule["segunda"] = {
                    "aberto": True,
                    "turnos": [{ "abertura": abertura, "fechamento": fechamento }]
                }
            break

    # Look for Friday/Saturday late closing
    if "sexta e sábado até" in text or "sex e sab até" in text or "sexta e sabado ate" in text:
        # Match something like "até as 00h" or "até 01h" or "até 23h30"
        match = re.search(r"até\s*(?:as|às)?\s*(\d{2})(?:h|:(\d{2}))", text)
        if match:
            h = int(match.group(1))
            m = int(match.group(2)) if match.group(2) else 0
            if h <= 4 or h >= 22:  # Safe range check
                new_close = f"{h:02d}:{m:02d}"
                base_schedule["sexta"]["turnos"][0]["fechamento"] = new_close
                base_schedule["sabado"]["turnos"][0]["fechamento"] = new_close

    return base_schedule

def main():
    restaurants = parse_mock_restaurants()
    if not restaurants:
        return

    # Load existing contacts file to preserve them
    contacts_database = {}
    if os.path.exists(output_json_path):
        try:
            with open(output_json_path, "r", encoding="utf-8") as f:
                contacts_database = json.load(f)
            print(f"Loaded {len(contacts_database)} existing contacts to merge with.")
        except Exception as e:
            print(f"Could not load existing contacts JSON: {e}")
            contacts_database = {}

    ddgs = DDGS()
    total = len(restaurants)
    scraped_count = 0
    inferred_count = 0

    print("Starting weekly operating hours scraping and inference...")
    
    for idx, rest in enumerate(restaurants):
        slug = rest["slug"]
        nome = rest["nome"]
        bairro = rest["bairro"]
        cidade = rest["cidade"]
        abertura = rest["abertura"]
        fechamento = rest["fechamento"]
        tipo_cozinha = rest["tipo_cozinha"]

        # Ensure restaurant entry exists in database
        if slug not in contacts_database:
            contacts_database[slug] = {
                "endereco": f"{bairro or 'São Paulo'} - São Paulo, SP",
                "telefone": "N/A",
                "whatsapp": "5511999999999",
                "deliveryUrl": "https://www.ifood.com.br"
            }

        # Initialize base schedule based on our high-quality defaults and heuristics
        schedule = infer_default_schedule(abertura, fechamento, tipo_cozinha)

        # Check if we should scrape to refine the schedule
        # Skip search queries for placeholder slugs to save API limit
        query = f'"{nome}" {bairro} São Paulo horario de funcionamento'
        print(f"[{idx+1}/{total}] Processing: {nome} ({bairro}) ...")
        
        snippets = []
        try:
            results = list(ddgs.text(query, max_results=3))
            if results:
                snippets = [r.get("body", "") for r in results]
                scraped_count += 1
            else:
                inferred_count += 1
        except Exception as e:
            print(f"  Search error for '{nome}': {e}. Using heuristics.")
            inferred_count += 1
            
        combined_text = " ".join(snippets)
        schedule = extract_weekly_hours_from_text(combined_text, schedule, abertura, fechamento)
        
        # Save to database
        contacts_database[slug]["horarios_semana"] = schedule

        # Save progress after every single item
        with open(output_json_path, "w", encoding="utf-8") as f:
            json.dump(contacts_database, f, indent=2, ensure_ascii=False)

        # Throttling to prevent IP block
        if snippets:
            time.sleep(2.0)

    print(f"\nProcessing complete! Total: {total}. Scraped: {scraped_count}, Inferred: {inferred_count}.")
    print(f"Results saved to: {output_json_path}")

if __name__ == "__main__":
    main()
