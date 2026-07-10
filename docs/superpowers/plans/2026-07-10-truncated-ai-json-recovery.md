# Recuperação de Respostas de IA Truncadas — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nenhum exame perdido quando a resposta JSON do Workers AI é cortada por `max_tokens`: resgatar os objetos completos do JSON truncado e reprocessar o chunk em metades.

**Architecture:** Uma função pura de salvamento (`worker/jsonSalvage.ts`) percorre o JSON truncado e resgata objetos completos do array `exames`. O consumer da fila em `worker/index.ts` ganha dois helpers (`buildExtractionMessages`, `runExtractionAi`) e, em falha de parse, salva o que der e reprocessa o chunk em duas metades (uma única vez, sem recursão). `max_tokens` do modelo 70b sobe para 8192.

**Tech Stack:** Cloudflare Workers (Hono), Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`, fallback `@cf/meta/llama-3.2-3b-instruct`), TypeScript. Testes: script Node 24 (type stripping nativo, sem framework).

**Spec:** `docs/superpowers/specs/2026-07-10-truncated-ai-json-design.md`

## Global Constraints

- `max_tokens: 8192` apenas no modelo 70b (janela 24k); o fallback 3b permanece com `max_tokens: 4096`.
- Divisão em metades acontece **uma única vez** por chunk — metades que também falharem só passam pelo salvamento, sem nova divisão.
- Não mexer no cache do AI Gateway (`skipCache: false, cacheTtl: 86400 * 30` permanecem).
- Não alterar `chunkSize` (10.000), prompt de extração ou modelos.
- Chave do array pode vir como `exames` ou `exams` — ambas devem ser aceitas em todos os caminhos.
- Comentários e mensagens de log em português, seguindo o padrão do arquivo.

---

### Task 1: Função pura `salvageExamsFromTruncatedJson`

**Files:**
- Create: `worker/jsonSalvage.ts`
- Test: `worker/jsonSalvage.test.mjs`

**Interfaces:**
- Produces: `export function salvageExamsFromTruncatedJson(text: string): any[]` — recebe o texto bruto da resposta da IA (possivelmente truncado) e retorna os objetos de exame que fecharam corretamente. Task 2 importa essa função em `worker/index.ts`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `worker/jsonSalvage.test.mjs`:

```js
import assert from 'node:assert/strict';
import { salvageExamsFromTruncatedJson } from './jsonSalvage.ts';

// 1. JSON completo e válido — retorna todos os objetos
{
  const text = '{"exames": [{"nomeExame": "TSH", "resultado": "2,5"}, {"nomeExame": "T4", "resultado": "1,1"}]}';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 2);
  assert.equal(out[0].nomeExame, 'TSH');
  assert.equal(out[1].nomeExame, 'T4');
}

// 2. Truncado no meio do segundo objeto — resgata só o primeiro
{
  const text = '{"exames": [{"nomeExame": "TSH", "resultado": "2,5"}, {"nomeExame": "T4", "resu';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'TSH');
}

// 3. Truncado dentro de uma string com escapes — não quebra
{
  const text = '{"exames": [{"nomeExame": "Anti-HBs", "interpretacao": "linha1\\n\\"aspas\\""}, {"nomeExame": "cortado \\" no esc';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'Anti-HBs');
}

// 4. Chave "exams" (inglês) também funciona
{
  const text = '{"exams": [{"nomeExame": "Glicose"}], "outro": 1';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
}

// 5. Sem array de exames — retorna vazio
{
  assert.deepEqual(salvageExamsFromTruncatedJson('texto sem json nenhum'), []);
  assert.deepEqual(salvageExamsFromTruncatedJson('{"resposta": "ok"}'), []);
}

// 6. Objetos com aninhamento interno (objeto e array dentro do exame)
{
  const text = '{"exames": [{"nomeExame": "Hemograma", "detalhes": {"serie": [1, 2]}}, {"nomeExame": "incompleto", "detalhes": {"serie": [1,';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].detalhes.serie.length, 2);
}

// 7. Chaves/colchetes dentro de strings não confundem o rastreio de profundidade
{
  const text = '{"exames": [{"nomeExame": "PCR", "observacao": "valor { entre } chaves [x]"}, {"nomeExame": "co';
  const out = salvageExamsFromTruncatedJson(text);
  assert.equal(out.length, 1);
  assert.equal(out[0].nomeExame, 'PCR');
}

console.log('jsonSalvage: todos os testes passaram');
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare" && node worker/jsonSalvage.test.mjs`
Expected: FAIL — `Cannot find module ... jsonSalvage.ts`

- [ ] **Step 3: Implementar `worker/jsonSalvage.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare" && node worker/jsonSalvage.test.mjs`
Expected: `jsonSalvage: todos os testes passaram`

- [ ] **Step 5: Typecheck e commit**

```bash
cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare"
npx tsc -b
git add worker/jsonSalvage.ts worker/jsonSalvage.test.mjs
git commit -m "feat: salvage de objetos completos em JSON truncado da IA"
```

---

### Task 2: Integrar salvage + divisão em metades no consumer da fila

**Files:**
- Modify: `worker/index.ts` (consumer `queue()`, bloco do loop de chunks — atualmente ~linhas 1091–1153; e adicionar import no topo)

**Interfaces:**
- Consumes: `salvageExamsFromTruncatedJson(text: string): any[]` de `worker/jsonSalvage.ts` (Task 1).
- Produces: comportamento — nenhum símbolo novo exportado. Helpers internos do módulo: `buildExtractionMessages(fileName, chunkText, partLabel)` e `runExtractionAi(env, messages)`.

**Contexto para quem nunca viu o arquivo:** `worker/index.ts` exporta `{ fetch, queue }`. O consumer `queue()` baixa o PDF do R2, extrai o texto com `unpdf`, tenta extração estruturada (`extractStructuredLabExams`) e, se insuficiente, itera o texto em chunks de 10k chamando o Workers AI com um prompt longo que exige JSON `{ exames: [...] }`. Hoje, se o parse do JSON falha, o chunk é perdido (marca `hasError`). Variáveis existentes no escopo do loop: `pdfTextStr`, `fileName`, `pdfStoragePath`, `allExams`, `hasError`, `lastError`, `chunkSize`, `env`.

- [ ] **Step 1: Adicionar import no topo de `worker/index.ts`** (junto aos demais imports)

```ts
import { salvageExamsFromTruncatedJson } from './jsonSalvage';
```

- [ ] **Step 2: Adicionar helpers no escopo de módulo** (logo acima do `export default`)

O conteúdo do prompt do usuário é o texto EXATO que hoje está inline no consumer (as 9 "ATENÇÃO" + formato obrigatório) — mover, não reescrever:

```ts
const buildExtractionMessages = (fileName: string, chunkText: string, partLabel: string) => [
  { role: 'system', content: 'Você é um assistente médico especializado na leitura de laudos e exames. Retorne APENAS um JSON estruturado, sem blocos de markdown e sem texto adicional.' },
  { role: 'user', content: `Extraia as informações do exame abaixo e retorne APENAS um JSON válido contendo um array 'exames'. Não use outros arrays como 'avaliacoes'.
[... manter aqui, verbatim, as linhas ATENÇÃO 1 a ATENÇÃO 9 e o "Formato OBRIGATÓRIO do array exames: [...]" do prompt atual ...]\n\nArquivo Origem Nome: ${fileName}\nParte do Texto do PDF (${partLabel}):\n${chunkText}` }
];

// Chama o modelo de extração com fallback. Retorna o campo `response` bruto
// (pode ser string OU objeto JSON, dependendo do modelo). Lança se ambos falharem.
async function runExtractionAi(env: Bindings, messages: any[]): Promise<unknown> {
  let aiResponse: any;
  try {
    aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 8192 }, {
      gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
    });
  } catch (e) {
    console.warn("LLaMA 70b failed for chunk, trying 3b fallback", e);
    aiResponse = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', { messages, max_tokens: 4096 }, {
      gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
    });
  }
  return aiResponse?.response;
}

// Interpreta a resposta da IA. ok=false indica JSON truncado/malformado
// (exams contém o que foi possível resgatar do texto truncado).
const parseExamsFromAiResponse = (raw: unknown): { exams: any[]; ok: boolean } => {
  let parsedJson: any = null;
  if (raw && typeof raw === 'object') {
    parsedJson = raw;
  } else {
    const responseText = String(raw ?? '');
    try {
      const match = responseText.match(/\{[\s\S]*\}/);
      parsedJson = JSON.parse(match ? match[0] : responseText);
    } catch (e) {
      console.error("Failed to parse JSON for chunk:", e);
      return { exams: salvageExamsFromTruncatedJson(responseText), ok: false };
    }
  }
  const arr = parsedJson?.exams ?? parsedJson?.exames;
  return { exams: Array.isArray(arr) ? arr : [], ok: true };
};
```

- [ ] **Step 3: Substituir o corpo do loop de chunks no consumer**

Remover do loop atual: a montagem inline de `messages`, o try/catch duplo de `env.AI.run`, e o bloco `rawAiResponse`/parse (incluindo o tratamento de objeto adicionado em 09/07 — ele foi absorvido por `parseExamsFromAiResponse`). O loop fica:

```ts
for (let i = 0; i < pdfTextStr.length; i += chunkSize) {
  const chunkText = pdfTextStr.substring(i, i + chunkSize);
  const chunkLabel = String(Math.floor(i / chunkSize) + 1);

  let rawResponse: unknown;
  try {
    rawResponse = await runExtractionAi(env, buildExtractionMessages(fileName, chunkText, chunkLabel));
  } catch (e2: any) {
    console.error("3b fallback also failed for chunk", e2);
    hasError = true;
    lastError = e2.message;
    continue;
  }

  const parsed = parseExamsFromAiResponse(rawResponse);
  allExams = allExams.concat(parsed.exams.map((ex: any) => ({ ...ex, pdfStoragePath })));

  if (!parsed.ok) {
    // Resposta truncada: o que era recuperável já foi salvo acima.
    // Reprocessa o chunk em duas metades (prompt diferente escapa do cache do gateway).
    console.warn(`Resposta truncada no chunk ${chunkLabel}: ${parsed.exams.length} exame(s) recuperado(s); reprocessando em metades`);
    let chunkTotal = parsed.exams.length;
    const half = Math.ceil(chunkText.length / 2);
    const parts = [chunkText.substring(0, half), chunkText.substring(half)];
    for (let p = 0; p < parts.length; p++) {
      try {
        const partRaw = await runExtractionAi(env, buildExtractionMessages(fileName, parts[p], `${chunkLabel}.${p + 1}`));
        const partParsed = parseExamsFromAiResponse(partRaw);
        allExams = allExams.concat(partParsed.exams.map((ex: any) => ({ ...ex, pdfStoragePath })));
        chunkTotal += partParsed.exams.length;
      } catch (e: any) {
        console.error(`Falha ao reprocessar metade ${p + 1} do chunk ${chunkLabel}`, e);
      }
    }
    if (chunkTotal === 0) {
      hasError = true;
      lastError = 'Resposta da IA truncada e nenhum exame pôde ser recuperado';
    }
  }
}
```

O `allExams = dedupeExtractedExams(allExams);` logo após o loop permanece — é ele que elimina duplicatas entre o material salvo e as metades reprocessadas.

- [ ] **Step 4: Typecheck**

Run: `cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare" && npx tsc -b`
Expected: sem erros

- [ ] **Step 5: Teste dirigido do parse com salvage (sem tocar produção)**

Criar `scratch/test_parse_truncated.mjs` simulando resposta truncada (não commitado — `scratch/` é área de rascunho):

```js
import { salvageExamsFromTruncatedJson } from '../worker/jsonSalvage.ts';
const truncated = '{"exames": [' +
  Array.from({ length: 30 }, (_, i) => `{"nomeExame": "Exame ${i}", "resultado": "${i}"}`).join(', ') +
  ', {"nomeExame": "Cortado", "resu';
const out = salvageExamsFromTruncatedJson(truncated);
if (out.length !== 30) throw new Error(`esperava 30, veio ${out.length}`);
console.log('salvage em resposta longa truncada: OK (30/30 completos resgatados)');
```

Run: `cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare" && node scratch/test_parse_truncated.mjs`
Expected: `salvage em resposta longa truncada: OK (30/30 completos resgatados)`

- [ ] **Step 6: Commit**

```bash
cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare"
git add worker/index.ts
git commit -m "feat: recuperacao de respostas de IA truncadas (salvage + divisao em metades, max_tokens 8192)"
```

Nota: `worker/index.ts` tem alterações não commitadas pré-existentes (endpoint `/api/chat-global` etc.). Se o `git add` for incluí-las, confirmar com o usuário antes do commit ou commitar apenas os hunks desta task com `git add -p`.

---

### Task 3: Deploy e validação em produção

**Files:** nenhum (operacional)

**Interfaces:**
- Consumes: comportamento completo das Tasks 1–2 já commitado.

- [ ] **Step 1: Deploy**

Run: `cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare" && npm run deploy`
Expected: `Deployed gestao-saude-cloudflare` com novo Version ID.

- [ ] **Step 2: Upload de um laudo grande em produção**

Escolher o maior PDF de laboratório disponível (candidato a truncar a resposta):

```bash
cd "/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare"
find EXAMES -name '*.pdf' -size +200k | head -5   # escolher um laboratorial grande
curl -s -X POST "https://gestao-saude-cloudflare.rafalegollas.workers.dev/api/parse-pdf" -F "file=@<ARQUIVO_ESCOLHIDO>"
```

Guardar o `taskId` retornado.

- [ ] **Step 3: Aguardar conclusão e verificar resultado**

```bash
until curl -s "https://gestao-saude-cloudflare.rafalegollas.workers.dev/api/task-status/<TASKID>" | grep -qE '"status":"(completed|error)"'; do sleep 5; done
curl -s "https://gestao-saude-cloudflare.rafalegollas.workers.dev/api/task-status/<TASKID>"
```

Expected: `"status":"completed"` com `result` não vazio. (Rodar em background — `sleep` em foreground é bloqueado no harness.)

- [ ] **Step 4: Verificar logs de observabilidade**

Consultar os logs do worker (origem `queue`, últimos 30 min) e confirmar:
- Nenhum `Failed to parse JSON for chunk: SyntaxError` sem a linha subsequente `Resposta truncada no chunk ...` de recuperação.
- Se aparecer `Resposta truncada no chunk N: X exame(s) recuperado(s)`, o job correspondente ainda deve terminar `completed` com exames.

- [ ] **Step 5: Regressão dos laudos de imagem**

Reenviar `EXAMES/exames de imagem/RESSONANCIA MAGNETICA DA COLUNA LOMBAR (Laudo).pdf` pelo mesmo fluxo curl e confirmar `completed` com 1 exame (garante que a refatoração não quebrou o caminho feliz corrigido em 09/07).

---

## Self-Review (executado na escrita do plano)

- **Cobertura da spec:** prevenção (`max_tokens` 8192) → Task 2 Step 2; reparo (`salvageExamsFromTruncatedJson`) → Task 1; divisão em metades sem recursão → Task 2 Step 3; dedupe reaproveitado → Task 2 Step 3 (nota final); validação unit + produção → Tasks 1 e 3. Limite do 3b: mantido em 4096 (decisão conservadora registrada nos Global Constraints).
- **Placeholders:** o único trecho não literal é o corpo do prompt em `buildExtractionMessages` (instrução explícita de mover verbatim o texto existente — repetir as ~15 linhas do prompt no plano criaria risco de divergência com o arquivo real).
- **Consistência de tipos:** `salvageExamsFromTruncatedJson(text: string): any[]` idêntica na Task 1 (produces) e Task 2 (consumes); `parseExamsFromAiResponse` retorna `{ exams, ok }` e é usado com esses nomes no loop.
