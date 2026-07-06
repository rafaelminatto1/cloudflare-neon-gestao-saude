import re

category_map = {
    # Metabolism & Glycemia
    "Bioquímica & Metabolismo": "Metabolismo",
    "Bioquímica & Nutrologia": "Nutrientes",
    "Endocrinologia / Metabolismo": "Metabolismo",
    
    # Heart & Lipids
    "Cardiologia": "Coração",
    "Cardiologia / Perfil Lipídico": "Coração",
    "Perfil Lipídico / Lipidograma": "Coração",
    "Marcadores Cardiovasculares": "Coração",
    "Marcadores Musculares e Cardíacos": "Coração",
    
    # Blood & Coagulation
    "Hematologia": "Sangue",
    "Coagulação & Hemostasia": "Sangue",
    "Fatores de Hemostasia & Coagulação": "Sangue",
    "Hematologia & Imunologia": "Sangue",
    
    # Nutrients
    "Nutrição e Estoque de Ferro": "Nutrientes",
    "Vitaminas e Minerais": "Nutrientes",
    "Vitaminas & Hormônios": "Nutrientes",
    "Nutrologia / Metais": "Nutrientes",
    
    # Thyroid
    "Hormônios Tireoidianos": "Tireoide",
    "Hormônios & Tireoide": "Tireoide",
    "Hormônios Tireoidianos & Autoimunidade": "Tireoide",
    
    # Hormones & Sex specific
    "Hormônios & Saúde Geral": "Hormônios",
    "Hormônios e Saúde Masculina": "Saúde Masculina",
    "Ginecologia & Citopatologia": "Saúde Feminina",
    
    # Organs
    "Função Hepática": "Fígado",
    "Função Renal/Urinário": "Rins",
    "Função Renal / Urinário": "Rins",
    "Marcadores Pancreáticos": "Pâncreas",
    
    # Immunity & Inflammation
    "Marcadores de Inflamação": "Autoimunidade",
    "Imunologia & Autoimunidade": "Autoimunidade",
    "Marcadores de Inflamação & Autoimunidade": "Autoimunidade",
    "Inflamação & Triagem": "Autoimunidade",
    "Imunologia / Citocinas": "Autoimunidade",
    
    # Infection
    "Infectologia / Sorologias": "Infectologia",
    
    # Minerals / Electrolytes
    "Eletrólitos & Minerais": "Eletrólitos",
    
    # GI
    "Gastroenterologia": "Gastroenterologia",
    "Gastroenterologia & Coprologia": "Gastroenterologia",
    
    # Drugs
    "Monitoramento Psiquiátrico e Terapêutico": "Toxicologia",
    
    # Other
    "Exames de Imagem & Diagnóstico": "Exames de Imagem"
}

with open("src/utils/examDictionary.ts", "r") as f:
    content = f.read()

def replace_category(match):
    original = match.group(1)
    new_category = category_map.get(original, original)
    return f'category: "{new_category}"'

# Find and replace all category fields
new_content = re.sub(r'category:\s*"([^"]+)"', replace_category, content)

with open("src/utils/examDictionary.ts", "w") as f:
    f.write(new_content)

print("Categories updated successfully.")
