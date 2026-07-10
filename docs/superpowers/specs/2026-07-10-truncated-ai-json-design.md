# Design: Recuperação de respostas de IA truncadas (JSON cortado)

**Data:** 2026-07-10
**Status:** Aprovado (Opção A — Reparo + divisão)

## Problema

No consumer da fila `gestao-saude-pdf-queue` (`worker/index.ts`), cada chunk de 10.000
caracteres do PDF é enviado ao `@cf/meta/llama-3.3-70b-instruct-fp8-fast` com
`max_tokens: 4096`. Para laudos com muitos exames, a resposta JSON excede esse limite e
chega cortada no meio do array `exames`, causando:

```
Failed to parse JSON for chunk: SyntaxError: Expected ',' or ']' after array element in JSON at position ~12005
```

Logs de produção confirmam ocorrências recorrentes (07–09/jul/2026). Após a correção de
09/07, a falha vira `status: error` visível ao usuário — mas os exames continuam não
sendo extraídos. Agravante: o AI Gateway cacheia a resposta truncada por 30 dias
(`cacheTtl: 86400 * 30`), então reenviar o mesmo chunk devolve o mesmo JSON cortado.

## Objetivo

Nenhum exame perdido por truncagem: recuperar o que veio completo e reprocessar o
restante, sem estourar custo de IA nos casos que hoje funcionam.

## Solução (Opção A)

Três camadas, da mais barata à mais cara:

### 1. Prevenção: `max_tokens` 4096 → 8192

O modelo tem janela de contexto de 24.000 tokens (entrada+saída). Um chunk de 10k
caracteres ≈ 4k tokens de entrada + ~1k de prompt, sobrando folga para 8192 de saída.
Aplica-se às duas chamadas de extração (70b e fallback 3b — o 3b tem janela menor,
manter 4096 no fallback se a doc do modelo indicar limite inferior; verificar na
implementação).

### 2. Reparo: salvamento de objetos completos do JSON truncado

Nova função pura `salvageExamsFromTruncatedJson(text: string): any[]`:

- Localiza o início do array `"exames"` (ou `"exams"`) no texto bruto.
- Percorre caractere a caractere rastreando profundidade de `{}`/`[]`, estado de string
  e escapes, coletando cada objeto de nível superior do array que fechou corretamente.
- Retorna os objetos completos; o objeto cortado no final é descartado.
- Função pura e isolada (exportada de `worker/jsonSalvage.ts`) para ser testável sem
  Workers runtime.

### 3. Divisão: retry do chunk em metades

No loop de chunks, quando o parse do JSON falhar (exceção atual):

1. Salvar o que der via `salvageExamsFromTruncatedJson` e somar a `allExams`.
2. Dividir o chunk em duas metades (~5k chars) e reprocessar cada metade com a mesma
   chamada de IA — **uma única vez, sem recursão** (metades usam prompt diferente, logo
   escapam do cache do gateway naturalmente).
3. Se uma metade também falhar no parse: aplicar o salvamento na resposta dela e seguir
   (sem nova divisão).
4. Duplicatas entre o material salvo e as metades reprocessadas são eliminadas pelo
   `dedupeExtractedExams` existente (chave nome|data|resultado|unidade).
5. `hasError`/`lastError` só são acionados se, após salvamento + divisão, o chunk não
   produziu exame algum.

## Fluxo por chunk (resumo)

```
chunk 10k → IA (max_tokens 8192)
  parse OK  → soma exames
  parse FAIL→ salvage(resposta) → soma
             metade A → IA → parse OK? soma : salvage(A) soma
             metade B → IA → parse OK? soma : salvage(B) soma
             nada extraído? → hasError = true
→ dedupeExtractedExams(allExams)
```

## Fora de escopo

- Mudar modelo, prompt ou estrutura de chunking (10k permanece).
- Mexer no cache global do AI Gateway.
- Streaming da resposta de extração.

## Testes e validação

1. **Unit (script de verificação):** `salvageExamsFromTruncatedJson` contra casos:
   JSON válido, array cortado no meio de um objeto, cortado no meio de uma string com
   escapes, resposta sem array, chave `exams` vs `exames`.
2. **Produção (fim a fim):** upload via `POST /api/parse-pdf` de um laudo laboratorial
   longo que hoje trunca; verificar `status: completed` com lista completa de exames e
   ausência do `SyntaxError` nos logs de observabilidade.

## Riscos

- Custo extra de IA limitado: 2 chamadas adicionais somente quando houver truncagem.
- Pior caso (metades também truncam): fica o material salvo — ainda estritamente melhor
  que hoje (zero exames).
