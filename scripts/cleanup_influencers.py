import re

files = ["lib/supabase-mock.ts", "app/api/videos/import/route.ts"]

for file in files:
    print(f"Cleaning influencers in {file}...")
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the mockInfluencers array block
    match = re.search(r"const mockInfluencers = \[\s*(.*?)\s*\]", content, re.DOTALL)
    if match:
        block = match.group(1)
        # Remove the injected fields
        new_block = re.sub(r"\s*horario_abertura:\s*'[0-9:]+',", "", block)
        new_block = re.sub(r"\s*horario_fechamento:\s*'[0-9:]+',", "", new_block)
        new_block = re.sub(r"\s*distancia_km:\s*[0-9\.]+,", "", new_block)
        
        # Replace the block
        content = content.replace(block, new_block)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print("Done.")
    else:
        print("mockInfluencers array not found.")
