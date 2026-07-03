import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { extractText } from 'unpdf';
import { createRemoteJWKSet, jwtVerify } from 'jose';

type Bindings = {
  NEON_AUTH_BASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: any;
  VECTOR_INDEX: VectorizeIndex;
  GESTAO_SAUDE_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings, Variables: { userId: string } }>();

// Simple UUID fallback if crypto.randomUUID doesn't work (it should on CF Workers)
const generateId = () => crypto.randomUUID();

// Auth Middleware
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/health') return next();
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development/mocking purposes when frontend is mocked
    c.set('userId', 'mock-user');
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const neonAuthUrl = c.env.NEON_AUTH_BASE_URL;
    if (!neonAuthUrl) {
      console.warn("NEON_AUTH_BASE_URL not set, falling back to mock user");
      c.set('userId', 'mock-user');
      return next();
    }
    const JWKS = createRemoteJWKSet(new URL(neonAuthUrl.replace(/\/$/, '') + '/.well-known/jwks.json'));
    const { payload } = await jwtVerify(token, JWKS);
    c.set('userId', (payload.sub || payload.id) as string);
    await next();
  } catch (err: any) {
    console.error("JWT Validation Error:", err);
    // Hard fallback to mock-user if Neon is not fully integrated yet, just for smooth RAG dev
    c.set('userId', 'mock-user');
    await next();
  }
});

app.get('/api/health', (c) => c.json({ status: 'ok', environment: 'cloudflare-worker' }));

// 1. PDF Parser and RAG Ingestion
app.post('/api/parse-pdf', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    const userId = body['userId'] as string || c.get('userId');
    
    if (!file || !userId) return c.json({ error: 'Arquivo ou userId não fornecido' }, 400);

    // Save to R2
    const fileId = generateId();
    const pdfStoragePath = `exams/${userId}/${fileId}.pdf`;
    
    // Convert to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 1. Upload to R2 Bucket
    await c.env.R2_BUCKET.put(pdfStoragePath, arrayBuffer, {
      httpMetadata: { contentType: 'application/pdf' },
      customMetadata: { userId }
    });

    // 2. Extract Text
    const pdfData = new Uint8Array(arrayBuffer);
    const textData = await extractText(pdfData);
    const pdfTextStr = Array.isArray(textData.text) ? textData.text.join('\n') : String(textData.text);
    const truncatedText = pdfTextStr.substring(0, 5000); // Llama context limit

    // 3. Generate Vector Embeddings (RAG)
    try {
      const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [truncatedText] });
      const vector = embeddingResponse.data[0];
      
      await c.env.VECTOR_INDEX.upsert([
        {
          id: fileId,
          values: vector,
          metadata: { userId, path: pdfStoragePath, type: 'exam_pdf' }
        }
      ]);
      await c.env.GESTAO_SAUDE_KV.put(`doc:${fileId}`, truncatedText);
    } catch (vectorErr) {
      console.error("Vectorize insertion error, continuing without RAG:", vectorErr);
    }

    // 4. Extract Structured JSON Data with LLaMA
    const messages = [
      { role: 'system', content: 'Você é um assistente médico especializado na leitura de laudos e exames. Retorne APENAS um JSON estruturado, sem blocos de markdown e sem texto adicional.' },
      { role: 'user', content: `Extraia as informações do exame abaixo e retorne APENAS um JSON válido contendo um array 'exames' (se for sangue/urina/fezes/imagem) ou 'avaliacoes' (se for laudo/parecer). Formato do array exames: [{ dataExame: string, categoria: string, nomeExame: string, resultado: string, unidade: string, valorReferencia: string, interpretacao: string, medicoSolicitante: string, arquivoOrigem: string, especialidadeMedica: string, grupoSistemico: string, tags: string, impactoAutoimune: string }]. Se laudo: [{ date: string, type: string, text: string }].\n\nArquivo Origem Nome: ${file.name}\nTexto do PDF:\n${truncatedText}` }
    ];

    const aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 });
    const rawAiResponse = (aiResponse as { response: string }).response;
    
    // Parse JSON
    let parsedJson: any = { exams: [] };
    try {
      const match = rawAiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        parsedJson = JSON.parse(match[0]);
      } else {
        parsedJson = JSON.parse(rawAiResponse);
      }
      
      // Handle the case where the AI returns "exames" instead of "exams"
      if (parsedJson.exames && !parsedJson.exams) {
         parsedJson.exams = parsedJson.exames;
         delete parsedJson.exames;
      }
      if (parsedJson.avaliacoes && !parsedJson.exams) {
         parsedJson.exams = parsedJson.avaliacoes;
      }
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", rawAiResponse);
      return c.json({ error: 'Falha na extração de dados JSON', raw: rawAiResponse }, 500);
    }
    
    // Inject storage path into each extracted item
    if (parsedJson.exams) {
      parsedJson.exams = parsedJson.exams.map((ex: any) => ({ ...ex, pdfStoragePath }));
    }
    
    return c.json(parsedJson);
  } catch (err: any) {
    console.error("Error parsing PDF:", err);
    return c.json({ error: err.message }, 500);
  }
});

// GET File from R2
app.get('/api/file/*', async (c) => {
  const path = c.req.path.replace('/api/file/', '');
  const userId = c.get('userId');
  
  // Basic ACL
  if (!path.includes(userId) && userId !== 'mock-user') {
     return c.json({ error: 'Forbidden' }, 403);
  }

  const object = await c.env.R2_BUCKET.get(path);
  if (!object) return c.json({ error: 'File not found' }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  return new Response(object.body, { headers });
});

// RAG Chat Endpoint
app.post('/api/rag-chat', async (c) => {
  try {
    const { question } = await c.req.json();
    // const userId = c.get('userId');

    // 1. Vectorize the question
    const embeddingResponse = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [question] });
    const vector = embeddingResponse.data[0];

    // 2. Query Vectorize
    const matches = await c.env.VECTOR_INDEX.query(vector, { topK: 3 });
    
    // Fetch text from KV
    let retrievedTexts: string[] = [];
    for (const match of matches.matches) {
       const text = await c.env.GESTAO_SAUDE_KV.get(`doc:${match.id}`);
       if (text) retrievedTexts.push(`[Documento: ${match.id}]\n${text}`);
    }
    
    let contextStr = retrievedTexts.length > 0 
       ? "Contextos de exames do paciente encontrados:\n\n" + retrievedTexts.join('\n\n')
       : "Nenhum histórico médico específico foi encontrado.";

    // 3. Answer Question
    const messages = [
      { role: 'system', content: 'Você é um assistente médico auxiliando um paciente a interpretar seus exames.' },
      { role: 'user', content: `Contexto do paciente:\n${contextStr}\n\nPergunta: ${question}` }
    ];

    // Return SSE Stream
    return streamSSE(c, async (stream) => {
       const aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { 
         messages, 
         max_tokens: 4096, 
         stream: true 
       }) as AsyncGenerator<any>;
       
       for await (const chunk of aiResponse) {
          if (chunk.response) {
             await stream.writeSSE({ data: JSON.stringify({ text: chunk.response }) });
          }
       }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;