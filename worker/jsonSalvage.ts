// Resgata do texto de uma resposta de IA (possivelmente truncada por max_tokens)
// os objetos do array "exames"/"exams" que fecharam corretamente.
export function salvageExamsFromTruncatedJson(text: string): any[] {
  const keyMatch = text.match(/"(?:exames|exams)"\s*:\s*\[/);
  if (!keyMatch || keyMatch.index === undefined) return [];

  const start = keyMatch.index + keyMatch[0].length;
  const objects: any[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objStart = -1;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') { inString = true; continue; }

    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart >= 0) {
        try {
          objects.push(JSON.parse(text.slice(objStart, i + 1)));
        } catch {
          // objeto malformado no meio do array: ignora e segue
        }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break; // fim do array de exames
    }
  }

  return objects;
}
