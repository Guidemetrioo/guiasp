import os
import re
import shutil
import unicodedata

# Explicit mapping of downloaded filenames to mock database titles
MAPPING = {
    "5 lugares absurdos para você comer com menos de 💲50,00!!1º - @padariacarillooficial 2º - @padar.mp4": "Review de Padaria Carillo por @navegandosp",
    "A hamburgueria mais diferenciada de SP! 😍😱Fomos navegar na @99burgersp, que faz os lanches mai.mp4": "Review de 99burgersp por @navegandosp",
    "A MELHOR PIZZA QUE EXISTE SERIA ESSA  😱 (1).mp4": "Review de Recomendação Navegando 115 por @navegandosp",
    "A MELHOR PIZZA QUE EXISTE SERIA ESSA  😱.mp4": "Review de Recomendação Navegando 115 por @navegandosp",
    "A pizzaria mais premiada de Ubatuba! 😱😍Fomos navegar na @pizzaria_do_paulinho, que fica locali.mp4": "Review de Pizzaria Do Paulinho por @navegandosp",
    "A PRIMEIRA DISCO BURGER DO BRASIL! 🍔😍Fomos navegar na @pinkynaopink, que inaugurou recentement.mp4": "Review de Pinkynaopink por @navegandosp",
    "A PRIMEIRA E ÚNICA HAMBURGUERIA TEMÁTICA DE TERROR!! 😱🧟_♀️🍔Fomos navegar na @deadburgerlapa,.mp4": "Review de Dead Burger Lapa por @navegandosp",
    "As clássicas e tradicionas foccacias italianas em SP! 😋🤤A @figo.br fica aqui em SP e é extrema.mp4": "Review de Figo Br por @navegandosp",
    "BIFE À PARMEGIANA GIGANTE EM SP! 🧀😍Fomos navegar no @pointdogordaosp, que faz um dos melhores .mp4": "Review de Point do Gordão por @navegandosp",
    "Bora provar a nova piscininha de cheddar do Mc! 🧀😍E eu pedi tudo através do delivery da 99food.mp4": "Review de Recomendação Navegando 132 por @navegandosp",
    "CHURRASCO LIBERADO ÀVONTADE! 😱😍Fomos navegar no @ruazinhasp, que tem um buffet por apenas 💲70.mp4": "Review de Ruazinhasp por @navegandosp",
    "Combo cheddar mc melt por apenas R$14,00!! 🍔😍E eu pedi tudo através do delivery da 99food e co.mp4": "Review de Recomendação Navegando 55 por @navegandosp",
    "Essa hamburgueria fica dentro de uma prisão! 😱😳Fomos navegar na @killerburgerbr, uma hamburgue.mp4": "Review de Killerburgerbr por @navegandosp",
    "Essa hamburgueria foi um verdadeiro achado! 😱😍Fomos navegar na @sloopburger, uma hamburgueria .mp4": "Review de Sloopburger por @navegandosp",
    "Essa pizza de chocolate é absurda! 🍫Fomos navegar na @senhorapaulistanamoema, que está com uma .mp4": "Review de Senhorapaulistanamoema por @navegandosp",
    "Essa pizza viralizou nas redes sociais! 😍😱Fomos navegar na @tinapizzeriaoficial, uma pizzaria .mp4": "Review de Tinapizzeriaoficial por @navegandosp",
    "Esse hambúrguer foi eleito um dos melhores do Brasil!! 😱🇧🇷Fomos navegar no @pelotasfood, uma .mp4": "Review de Pelotasfood por @navegandosp",
    "Esse é um dos hambúrgueres mais absurdos de SP! 🍔Uma parceria entre @hellmannsbr + @stuntburger.mp4": "Review de Hellmannsbr por @navegandosp",
    "FESTIVAL DE COMIDAS GIGANTES AQUI EM SP! 😱😍O @festivalsaidera irá contar com comida coreana, j.mp4": "Review de Festivalsaidera por @navegandosp",
    "MENU P- 2 EM UMA CANTINA ITALIANA POR APENAS R$189,00! 😱😍Fomos navegar no @dueamicicantina, um.mp4": "Review de Dueamicicantina por @navegandosp",
    "Novo rodízio japa em um rooftop! 🍣😱Fomos navegar no @albakoasushi, que possui um rodízio japon.mp4": "Review de Albakoasushi por @navegandosp",
    "O date perfeito existe! 😍💘Fomos navegar no @jucabowling, tem boliche (consultar as unidades), .mp4": "Review de Jucabowling por @navegandosp",
    "O famoso molho cannes no 🇧🇷! Basta usar o cupom- Desconto70 no app da 99 Food! 💛O famoso molh.mp4": "Review de Hippos Burger por @navegandosp",
    "O ORIGINAL BURGER NA MASSA DE PIZZA!! 🍕😍Fomos navegar na @familiapresto, um restaurante super .mp4": "Review de Familiapresto por @navegandosp",
    "O RESTAURANTE MAIS ABSURDO DE SP!!! 😱😍Fomos navegar no @pecattosp, que além de fazer o melhor .mp4": "Review de Pecatto Tatuapé por @navegandosp",
    "Quanto custa comer no restaurante da campeã do Masterchef e indicado 3x ao Guia Michelin! ⭐️🍝Fo.mp4": "Review de Paparoto Cucina por @navegandosp",
    "RODÍZIO DE PIZZA COM +60 SABORES A PARTIR DE 💲59,90!!😱🍕Fomos navegar na @nestorpizzariagastro.mp4": "Review de Nestor Pizzaria por @navegandosp",
    "RODÍZIO JAPA MAIS BARATO DE SP!Fomos perambular no @hao.sushi.brooklin que além do rodizio compl.mp4": "Review de Hao Sushi Itaim por @perambulandosp",
    "Tivemos que vir até Brasília para provarmos esse peixe…😱🐟Fomos navegar no @tocadopeixedf, simp.mp4": "Review de Toca do Peixe por @navegandosp",
    "TOP 3 LUGARES VIRAIS PRA SE COMER MASSA EM SP! @helenadinapolipizzaria - que faz os deliciosos l.mp4": "Review de Helenadinapolipizzaria por @navegandosp",
    "Você sabia que o @gabrielbruno tem uma hamburgueria 🍔Fomos navegar na @gababurger, a mais nova .mp4": "Review de Gabrielbruno por @navegandosp"
}

# Rich keywords maps based on actual video contents
ENRICHED_KEYWORDS = {
    "Review de Padaria Carillo por @navegandosp": ["padaria", "pao", "carillo", "mooca", "italiana", "massas", "cannoli", "doce", "menos de 50", "barato"],
    "Review de 99burgersp por @navegandosp": ["99burger", "hamburguer", "cheddar", "fritas", "milkshake", "artesanal", "diferenciado", "barato"],
    "Review de Recomendação Navegando 115 por @navegandosp": ["pizza", "melhor pizza", "recomendacao", "italiana", "pinheiros", "forno a lenha", "barato"],
    "Review de Pizzaria Do Paulinho por @navegandosp": ["pizza", "paulinho", "ubatuba", "litoral", "recheada", "premium", "premiada"],
    "Review de Pinkynaopink por @navegandosp": ["pinky naopink", "disco burger", "disco de carne", "hamburguer", "rosa", "instagramavel", "novidade"],
    "Review de Dead Burger Lapa por @navegandosp": ["dead burger", "terror", "tematica", "hamburgueria", "lapa", "zumbi", "halloween", "sustos"],
    "Review de Figo Br por @navegandosp": ["figo", "focaccia", "italiana", "massas", "vinho", "classica", "tradicional", "artesanal"],
    "Review de Point do Gordão por @navegandosp": ["point do gordao", "parmegiana", "gigante", "carne", "queijo", "familia", "almoco", "barato"],
    "Review de Recomendação Navegando 132 por @navegandosp": ["piscininha", "cheddar", "mcdonalds", "mc", "delivery", "99food", "lanche", "fast food"],
    "Review de Ruazinhasp por @navegandosp": ["ruazinha", "churrasco", "buffet", "rodizio", "espetinho", "cerveja", "barato", "vontade"],
    "Review de Recomendação Navegando 55 por @navegandosp": ["mc melt", "cheddar", "mcdonalds", "99food", "cupom", "barato", "fast food", "desconto"],
    "Review de Killerburgerbr por @navegandosp": ["killer burger", "prisao", "tematica", "terror", "hamburgueria", "cela", "algema", "diferente"],
    "Review de Sloopburger por @navegandosp": ["sloop burger", "achado", "hamburguer", "barato", "maionese", "batata frita"],
    "Review de Senhorapaulistanamoema por @navegandosp": ["senhora paulistana", "pizza doce", "chocolate", "morango", "moema", "absurda", "sobremesa"],
    "Review de Tinapizzeriaoficial por @navegandosp": ["tina", "pizzeria", "pizza", "viralizou", "instagram", "napolitana", "borda recheada"],
    "Review de Pelotasfood por @navegandosp": ["pelotas", "hamburguer", "eleito melhor", "brasil", "gaucho", "premium", "artesanal"],
    "Review de Hellmannsbr por @navegandosp": ["hellmanns", "stunt burger", "hamburguer", "parceria", "maionese", "cheddar", "absurdo"],
    "Review de Festivalsaidera por @navegandosp": ["festival", "saidera", "gigante", "comida gigante", "pastel gigante", "coxinha", "pastel", "evento"],
    "Review de Dueamicicantina por @navegandosp": ["due amici", "cantina", "italiana", "massa", "parmegiana", "vinho", "jantar", "date", "romantico"],
    "Review de Albakoasushi por @navegandosp": ["albakoa", "sushi", "rodizio", "rooftop", "japa", "vista", "temaki", "salmao", "premium"],
    "Review de Jucabowling por @navegandosp": ["juca", "bowling", "boliche", "date", "perfeito", "diversao", "amigos", "porcoes", "chopp"],
    "Review de Hippos Burger por @navegandosp": ["hippos", "molho cannes", "hamburguer", "99food", "cupom", "barato", "desconto"],
    "Review de Familiapresto por @navegandosp": ["familia presto", "massa de pizza", "pizza burger", "hamburguer", "diferente", "queijo", "forno"],
    "Review de Pecatto Tatuapé por @navegandosp": ["pecatto", "tatuape", "parmegiana", "absurdo", "gourmet", "luxo", "almoco", "premium"],
    "Review de Paparoto Cucina por @navegandosp": ["paparoto", "masterchef", "helena paparoto", "michelin", "gourmet", "luxo", "massa", "italiano", "chique"],
    "Review de Nestor Pizzaria por @navegandosp": ["nestor", "pizzaria", "rodizio", "60 sabores", "doce", "recheada", "barato", "festa"],
    "Review de Hao Sushi Itaim por @perambulandosp": ["hao sushi", "brooklin", "rodizio japa", "barato", "all inclusive", "bebida liberada", "sobremesa"],
    "Review de Toca do Peixe por @navegandosp": ["toca do peixe", "brasilia", "peixe", "moqueca", "camarao", "viagem", "nordestino", "pirao"],
    "Review de Helenadinapolipizzaria por @navegandosp": ["helena di napoli", "calzone", "massa", "italiana", "recheada", "viral", "forno"],
    "Review de Gabrielbruno por @navegandosp": ["gabriel bruno", "gaba burger", "influenciador", "hamburgueria", "artesanal", "novo", "cheddar"]
}

def sanitize_filename(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

def main():
    import sys
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    source_dir = r"C:\Users\guide\Downloads\videos navegando"
    target_dir = "public/videos"
    
    if not os.path.exists(source_dir):
        print(f"Source directory '{source_dir}' does not exist.")
        return
        
    os.makedirs(target_dir, exist_ok=True)
    print("Checking files and applying database-safe mappings...")
    
    # 1. Copy and rename the downloaded files based on mapping
    copied_count = 0
    for filename, db_title in MAPPING.items():
        src_path = os.path.join(source_dir, filename)
        if os.path.exists(src_path):
            sanitized = sanitize_filename(db_title)
            dest_name = f"{sanitized}.mp4"
            dest_path = os.path.join(target_dir, dest_name)
            
            try:
                shutil.copy2(src_path, dest_path)
                copied_count += 1
            except Exception as e:
                print(f"Error copying {filename}: {e}")
        else:
            print(f"File not found in downloads: {filename}")
            
    print(f"Successfully copied/renamed {copied_count} files to '{target_dir}'.\n")
    
    # 2. Enrich keywords in lib/supabase-mock.ts
    mock_file = "lib/supabase-mock.ts"
    if not os.path.exists(mock_file):
        print("Error: lib/supabase-mock.ts not found.")
        return
        
    with open(mock_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    content = "".join(lines)
    
    # Let's perform precise replacements in mockVideos blocks
    # We will look for each video's keywords line and inject the enriched keywords
    updated_count = 0
    for db_title, keywords in ENRICHED_KEYWORDS.items():
        # Clean list of keywords to be injected
        # Format: palavras_chave: ['key1', 'key2', ...],
        # Let's find where the video block for this title is
        title_escaped = re.escape(db_title)
        # Search block matching the title and containing words: palavras_chave: [...]
        # Since the block spans multiple lines:
        pattern = rf"(titulo:\s*['\x22]{title_escaped}['\x22].*?palavras_chave:\s*\[)(.*?)(\])"
        
        def replace_kw(match):
            prefix = match.group(1)
            old_kws = match.group(2)
            suffix = match.group(3)
            
            # Parse existing keywords
            parsed_kws = [k.strip().replace("'", "").replace('"', '') for k in old_kws.split(",") if k.strip()]
            
            # Combine and remove duplicates
            combined = list(dict.fromkeys(parsed_kws + keywords))
            new_kw_str = ", ".join([f"'{k}'" for k in combined])
            
            return f"{prefix}{new_kw_str}{suffix}"
            
        new_content, count = re.subn(pattern, replace_kw, content, flags=re.DOTALL)
        if count > 0:
            content = new_content
            updated_count += count
            
    # Write the modified mock back to disk
    with open(mock_file, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Enriched keywords for {updated_count} mock videos in 'lib/supabase-mock.ts'.")

if __name__ == "__main__":
    main()
