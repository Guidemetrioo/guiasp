import os
import re
import shutil
import unicodedata
import sys

# Reconfigure stdout to use utf-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

mock_file = "lib/supabase-mock.ts"
seed_file = "scripts/seed.ts"
target_dir = "public/videos"

ORIGINAL_MAPPING = {
    "navegando videos/Essa hamburgueria foi eleita uma das melhores do Brasil!! 🇧🇷🍔Fomos navegar na @pantchoshouse,.mp4": "A hamburgueria eleita uma das melhores do Brasil! 🇧🇷🍔",
    "navegando videos/snapinsta.com.br-6a2e0cceb4359.mp4": "A sobremesa mais absurda de São Paulo! 🍰🍫",
    "navegando videos/snapinsta.com.br-6a2e0ca778abb.mp4": "O maior outlet de suplementos com preços incríveis! 💊💪",
    "navegando videos/Esse é um dos hambúrgueres mais absurdos de SP! 🍔Uma parceria entre @hellmannsbr + @stuntburger.mp4": "Hambúrguer de cheddar absurdo em collab especial! 🍔",
    "navegando videos/Gostarão do sacão de frutos do mar 🦞 Fomos conhecer o único restaurante de SP com o famoso Seaf.mp4": "O famoso Sacão de Frutos do Mar (Seafood Boil Bag) em SP! 🦞",
    "perambulando/RODÍZIO DE PIZZA COM TUDO QUE VOCÊ IMAGINAR INCLUSO! Fomos perambular na @pizzariaveroparadiso e.mp4": "O rodízio de pizza com melhor custo-benefício do Paraíso! 🍕😍",
    "perambulando/FESTIVAL DE CALDOS POR 💲49,90 🍲🤤Perambulamos no @casanapraiabar , pra conferir esse festival .mp4": "Festival de caldos completo por apenas R$ 49,90! 🍲🤤",
    "perambulando/RODÍZIO JAPONÊS COM MELHOR CUSTO BENEFÍCIO DE SP! 😋Fomos navegar no @hao.sushi.itaim, junto com.mp4": "MUITO BARATO: Rodízio Japonês com Bebidas e Sobremesas inclusas! 🍱🥤",
    "perambulando/A FONTE DOS PERFUMES ÁRABES EM SP 😍🔥Perambulamos na @arabianightpaulista uma loja com os perfu.mp4": "Encontramos a fonte dos Perfumes Árabes mais desejados em SP! 😍🔥",
    "perambulando/À PARMEGIANA GIGANTE EM SP! 🧀😍Perambulamos no @pointdogordaosp , que faz esse parmegiana gigan.mp4": "Review de Point do Gordão por @perambulandosp",
    "esquentasp/🍔🔥 O MAIOR E MAIS FAMOSO XIS PRENSADÃO DO BRASIL FICA EM SÃO PAULOA história começou lá em 201.mp4": "O maior e mais famoso Xis Prensadão do Brasil fica em São Paulo! 🍔🔥",
    "esquentasp/🐟🔥 A MAIOR CUBANA DE SÃO PAULOFomos até o @villaeprosa conhecer uma cubana gigantesca que impr.mp4": "A maior Cubana de peixe de São Paulo! 🐟🔥",
    "esquentasp/🐷🔥 JOELHO DE PORCO MAIS FAMOSO DE SPSe você curte carne bem feita, esse joelho de porco do @om.mp4": "O Joelho de Porco mais famoso e crocante de SP! 🐷🔥",
    "esquentasp/🔥🥩 COSTELA E PICANHA À VONTADE POR APENAS R$75,90Se você gosta de churrasco, esse lugar merece.mp4": "Costela e picanha à vontade por apenas R$ 75,90! 🥩🔥",
    "esquentasp/🧀🍝 O MACARRÃO MAIS FAMOSO DE SÃO PAULOFomos no @legadoparrilla provar os famosos pratos servid.mp4": "O macarrão flambado no queijo mais famoso de São Paulo! 🧀🍝"
}

DISH_MAPPING = {
    "Review de Padaria Carillo por @navegandosp": {
        "prato": "Focaccia Italiana com Porchetta*",
        "kws": ["padaria", "pao", "carillo", "mooca", "agua rasa", "italiana", "massas", "cannoli", "doce", "menos de 50", "barato", "porchetta", "focaccia", "antiga", "forno", "1912"]
    },
    "Review de 99burgersp por @navegandosp": {
        "prato": "Hambúrguer de Abacaxi com Mel e Cheddar*",
        "kws": ["99burger", "hamburguer", "cheddar", "fritas", "milkshake", "artesanal", "diferenciado", "barato", "abacaxi", "mel", "analia franco", "revolucionario"]
    },
    "Review de Recomendação Navegando 115 por @navegandosp": {
        "prato": "Pizza Artesanal no Forno a Lenha*",
        "kws": ["pizza", "melhor pizza", "recomendacao", "italiana", "pinheiros", "forno a lenha", "barato", "artesanal"]
    },
    "Review de Pizzaria Do Paulinho por @navegandosp": {
        "prato": "Pizza Suprema do Paulinho*",
        "kws": ["pizza", "paulinho", "ubatuba", "litoral", "recheada", "premium", "premiada", "campeao", "pizzaiolos", "itagua"]
    },
    "Review de Pinkynaopink por @navegandosp": {
        "prato": "Disco Burger Prensado (Hambúrguer no Disco)*",
        "kws": ["pinky naopink", "disco burger", "disco de carne", "hamburguer", "rosa", "instagramavel", "novidade", "mooca", "sem sujeira", "quentinho"]
    },
    "Review de Dead Burger Lapa por @navegandosp": {
        "prato": "Dead Burger (Burger de Terror)*",
        "kws": ["dead burger", "terror", "tematica", "hamburgueria", "lapa", "zumbi", "halloween", "sustos", "clelia", "fantasma", "monstro"]
    },
    "Review de Figo Br por @navegandosp": {
        "prato": "Focaccia Italiana Clássica com Figo*",
        "kws": ["figo", "focaccia", "italiana", "massas", "vinho", "classica", "tradicional", "artesanal", "pinheiros", "delivery", "99food", "descontinho"]
    },
    "Review de Point do Gordão por @navegandosp": {
        "prato": "Bife à Parmegiana Gigante*",
        "kws": ["point do gordao", "parmegiana", "gigante", "carne", "queijo", "familia", "almoco", "barato", "mogi mirim", "mooca", "babybeef", "gordao"]
    },
    "Review de Recomendação Navegando 132 por @navegandosp": {
        "prato": "Piscininha de Cheddar Cremoso*",
        "kws": ["piscininha", "cheddar", "mcdonalds", "mc", "delivery", "99food", "lanche", "fast food", "batata", "cupom"]
    },
    "Review de Ruazinhasp por @navegandosp": {
        "prato": "Churrasco no Bafo & Buffet Completo*",
        "kws": ["ruazinha", "churrasco", "buffet", "rodizio", "espetinho", "cerveja", "barato", "vontade", "gomes de carvalho", "vila olimpia", "domingo", "musica ao vivo"]
    },
    "Review de Recomendação Navegando 55 por @navegandosp": {
        "prato": "Cheddar Mc Melt & Batata Especial*",
        "kws": ["mc melt", "cheddar", "mcdonalds", "99food", "cupom", "barato", "fast food", "desconto", "refrigerante", "milkshake"]
    },
    "Review de Killerburgerbr por @navegandosp": {
        "prato": "Hambúrguer de Wagyu Temático*",
        "kws": ["killer burger", "prisao", "tematica", "terror", "hamburgueria", "cela", "algema", "diferente", "alphaville", "barueri", "wagyu"]
    },
    "Review de Sloopburger por @navegandosp": {
        "prato": "Sloop Smash Burger Barato*",
        "kws": ["sloop burger", "achado", "hamburguer", "barato", "maionese", "batata frita", "augusta", "rua augusta"]
    },
    "Review de Senhorapaulistanamoema por @navegandosp": {
        "prato": "Pizza de Chocolate Belga com Morango*",
        "kws": ["senhora paulistana", "pizza doce", "chocolate", "morango", "moema", "absurda", "sobremesa", "vinho", "rodizio de vinhos", "chopp", "juruce"]
    },
    "Review de Tinapizzeriaoficial por @navegandosp": {
        "prato": "Pizza com Borda Vulcão & Japa*",
        "kws": ["tina", "pizzeria", "pizza", "viralizou", "instagram", "napolitana", "borda recheada", "itaquera", "japonês", "sushi", "match perfeito"]
    },
    "Review de Pelotasfood por @navegandosp": {
        "prato": "Hambúrguer de Panceta Defumada*",
        "kws": ["pelotas", "hamburguer", "eleito melhor", "brasil", "gaucho", "premium", "artesanal", "panceta", "defumada", "mandaqui"]
    },
    "Review de Hellmannsbr por @navegandosp": {
        "prato": "Hambúrguer Supreme Collab Stunt*",
        "kws": ["hellmanns", "stunt burger", "hamburguer", "parceria", "maionese", "cheddar", "absurdo", "caze tv", "villa lobos", "parque"]
    },
    "Review de Festivalsaidera por @navegandosp": {
        "prato": "Festival de Comidas Gigantes*",
        "kws": ["festival", "saidera", "gigante", "comida gigante", "pastel gigante", "coxinha", "pastel", "evento", "largo da batata", "faria lima", "samba", "dudu nobre"]
    },
    "Review de Dueamicicantina por @navegandosp": {
        "prato": "Menu Due Amici (Entrada, Prato e Sobremesa)*",
        "kws": ["due amici", "cantina", "italiana", "massa", "parmegiana", "vinho", "jantar", "date", "romantico", "bela vista", "martiniano de carvalho"]
    },
    "Review de Albakoasushi por @navegandosp": {
        "prato": "Rodízio de Sushi no Rooftop*",
        "kws": ["albakoa", "sushi", "rodizio", "rooftop", "japa", "vista", "temaki", "salmao", "premium", "vargem grande paulista"]
    },
    "Review de Jucabowling por @navegandosp": {
        "prato": "Combo Burger & Porções de Boliche*",
        "kws": ["juca", "bowling", "boliche", "date", "perfeito", "diversao", "amigos", "porcoes", "chopp", "santo amaro", "guarulhos", "diadema", "shopping"]
    },
    "Review de Hippos Burger por @navegandosp": {
        "prato": "Croissant Burger de Nutella & Marshmallow*",
        "kws": ["hippos", "molho cannes", "hamburguer", "99food", "cupom", "barato", "desconto", "croissant", "croissant burger", "carrão", "vila carrão", "nutella", "milkshake"]
    },
    "Review de Familiapresto por @navegandosp": {
        "prato": "Original Burger na Massa de Pizza*",
        "kws": ["familia presto", "massa de pizza", "pizza burger", "hamburguer", "diferente", "queijo", "forno", "aclimação", "esmeralda", "chef", "surf and turf"]
    },
    "Review de Pecatto Tatuapé por @navegandosp": {
        "prato": "Parmegiana de Cupim com Cheddar & Bacon*",
        "kws": ["pecatto", "tatuape", "parmegiana", "absurdo", "gourmet", "luxo", "almoco", "premium", "cupim", "cheddar", "bacon", "raclette", "chocolate"]
    },
    "Review de Paparoto Cucina por @navegandosp": {
        "prato": "Linguini Al Tartufo Nero*",
        "kws": ["paparoto", "masterchef", "dayse paparoto", "michelin", "gourmet", "luxo", "massa", "italiano", "chique", "linguini", "tartufo nero", "trufas", "pinheiros", "joaquim antunes", "buffet"]
    },
    "Review de Nestor Pizzaria por @navegandosp": {
        "prato": "Rodízio de Pizza 60+ Sabores (Borda de Coxinha)*",
        "kws": ["nestor", "pizzaria", "rodizio", "60 sabores", "doce", "recheada", "barato", "festa", "borda", "coxinha", "vulcao", "vila prudente", "pizza de metro"]
    },
    "Review de Hao Sushi Itaim por @perambulandosp": {
        "prato": "Rodízio Japonês com Sodas e Petit Gateau*",
        "kws": ["hao sushi", "brooklin", "rodizio japa", "barato", "all inclusive", "bebida liberada", "sobremesa", "itaim bibi", "joao cachoeira", "soda italiana", "petit gateau", "hot roll"]
    },
    "Review de Toca do Peixe por @navegandosp": {
        "prato": "Tilápia Gigante com Baião de Dois*",
        "kws": ["toca do peixe", "brasilia", "peixe", "moqueca", "camarao", "viagem", "nordestino", "pirao", "tilapia", "baiao de dois", "farofa"]
    },
    "Review de Helenadinapolipizzaria por @navegandosp": {
        "prato": "Lanche Italiano na Massa de Focaccia*",
        "kws": ["helena di napoli", "calzone", "massa", "italiana", "recheada", "viral", "forno", "lanche italiano", "focaccia"]
    },
    "Review de Gabrielbruno por @navegandosp": {
        "prato": "Gaba Smash Burger Cheddar & Bacon*",
        "kws": ["gabriel bruno", "gaba burger", "influenciador", "hamburgueria", "artesanal", "novo", "cheddar", "mourato coelho", "pinheiros", "smash"]
    }
}

def sanitize_filename(text):
    text = unicodedata.normalize("NFD", text)
    text = "".join([c for c in text if not unicodedata.combining(c)])
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = text.strip("-")
    return text

def copy_and_rename_originals():
    copied = 0
    for src_path, db_title in ORIGINAL_MAPPING.items():
        if os.path.exists(src_path):
            sanitized = sanitize_filename(db_title)
            dest_path = os.path.join(target_dir, f"{sanitized}.mp4")
            try:
                shutil.copy2(src_path, dest_path)
                copied += 1
            except Exception as e:
                # print error to stderr so it doesn't fail encoding on stdout print
                sys.stderr.write(f"Error copying {src_path}: {str(e)}\n")
        else:
            sys.stderr.write(f"Warning: original video not found: {src_path}\n")
    print(f"Successfully copied/updated {copied} original videos.")

def update_database_mock(filepath):
    print(f"Updating file {filepath}...")
    if not os.path.exists(filepath):
        print(f"Error: {filepath} not found.")
        return
        
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    updated_pratos = 0
    updated_kws = 0
    
    # Process each dish mapping
    for db_title, info in DISH_MAPPING.items():
        prato = info["prato"]
        keywords = info["kws"]
        
        # Match the block for the video with this title
        # Replace prato_destaque
        title_escaped = re.escape(db_title)
        prato_pattern = rf"(titulo:\s*['\x22]{title_escaped}['\x22].*?prato_destaque:\s*['\x22])(.*?)(['\x22])"
        
        def replace_prato(match):
            prefix = match.group(1)
            suffix = match.group(3)
            return f"{prefix}{prato}{suffix}"
            
        new_content, count = re.subn(prato_pattern, replace_prato, content, flags=re.DOTALL)
        if count > 0:
            content = new_content
            updated_pratos += count
            
        # Update palavras_chave
        kw_pattern = rf"(titulo:\s*['\x22]{title_escaped}['\x22].*?palavras_chave:\s*\[)(.*?)(\])"
        
        def replace_kw(match):
            prefix = match.group(1)
            old_kws = match.group(2)
            suffix = match.group(3)
            
            # Parse existing keywords
            parsed_kws = [k.strip().replace("'", "").replace('"', '') for k in old_kws.split(",") if k.strip()]
            combined = list(dict.fromkeys(parsed_kws + keywords))
            new_kw_str = ", ".join([f"'{k}'" for k in combined])
            
            return f"{prefix}{new_kw_str}{suffix}"
            
        new_content, count = re.subn(kw_pattern, replace_kw, content, flags=re.DOTALL)
        if count > 0:
            content = new_content
            updated_kws += count
            
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Updated {updated_pratos} pratos and {updated_kws} keyword blocks.")

def main():
    copy_and_rename_originals()
    update_database_mock(mock_file)
    update_database_mock(seed_file)

if __name__ == "__main__":
    main()
