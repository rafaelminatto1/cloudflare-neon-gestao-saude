import re

with open("worker/index.ts", "r") as f:
    content = f.read()

# We need to replace the prompt string in worker/index.ts
old_prompt_segment = "Formato do array exames: [{ dataExame: string, categoria: string, nomeExame: string"
new_prompt_segment = "Formato do array exames: [{ dataExame: string, categoria: string (USE APENAS: Autoimunidade, Coração, Eletrólitos, Exames de Imagem, Fígado, Gastroenterologia, Hormônios, Infectologia, Marcadores Celulares Integrados, Metabolismo, Nutrientes, Pâncreas, Rins, Sangue, Saúde Feminina, Saúde Masculina, Tireoide, Toxicologia), nomeExame: string"

content = content.replace(old_prompt_segment, new_prompt_segment)

with open("worker/index.ts", "w") as f:
    f.write(content)

print("Prompt patched successfully.")
