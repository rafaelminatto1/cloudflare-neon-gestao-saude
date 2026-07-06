import re

category_map = {
    "Imunologia e Autoimune": "Autoimunidade",
    "Neurologia e Sono": "Hormônios",
    "Neurologia e Nutrição": "Nutrientes",
    "Inflamação": "Autoimunidade",
    "Tireoide": "Tireoide",
    "Glicemia": "Metabolismo",
    "Fígado": "Fígado",
    "Sorologia": "Infectologia",
    "Urinário": "Rins",
    "Coagulação": "Sangue",
    "Hormônios": "Hormônios",
    "Metabolismo": "Metabolismo",
    "Urologia": "Saúde Masculina",
    "Fezes": "Gastroenterologia",
}

with open("src/components/DictionaryView.tsx", "r") as f:
    content = f.read()

def replace_categoria(match):
    original = match.group(1)
    new_category = category_map.get(original, original)
    return f'categoria: "{new_category}"'

new_content = re.sub(r'categoria:\s*"([^"]+)"', replace_categoria, content)

with open("src/components/DictionaryView.tsx", "w") as f:
    f.write(new_content)

print("DictionaryView categories updated successfully.")
