// Normaliza um resultado de exame para uso em chave de deduplicação, de modo que
// variantes de formato geradas por execuções diferentes da IA colidam na mesma chave:
// "2,5" / "2.5" / "2,50", "1.100" / "1100", "Superior a 90" / ">90".
const textFallback = (value: string) => value
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export function normalizeResultForKey(value: unknown): string {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  // Comparadores textuais viram símbolo (antes da extração numérica)
  let s = raw
    .replace(/^(superior|maior)(\s+(a|que|de))?\s*/i, '>')
    .replace(/^(inferior|menor)(\s+(a|que|de))?\s*/i, '<')
    .trim();

  const m = s.match(/^([<>]?)\s*(-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:[.,]\d+)?)$/);
  if (m) {
    const prefix = m[1];
    let num = m[2];
    if (num.includes(',')) {
      // formato pt-BR: ponto é milhar, vírgula é decimal
      num = num.replace(/\./g, '').replace(',', '.');
    } else if (/\d\.\d{3}(?:\.\d{3})*$/.test(num)) {
      // só pontos em grupos de 3: separador de milhar pt-BR
      num = num.replace(/\./g, '');
    }
    const n = Number(num);
    if (Number.isFinite(n)) return prefix + String(n);
  }

  return textFallback(raw);
}
