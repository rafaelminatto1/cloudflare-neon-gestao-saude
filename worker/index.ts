import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { extractText } from 'unpdf';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';

type Bindings = {
  DATABASE_URL: string;
  NEON_AUTH_BASE_URL: string;
  R2_BUCKET: R2Bucket;
  AI: any;
  VECTOR_INDEX: VectorizeIndex;
  GESTAO_SAUDE_KV: KVNamespace;
  HYPERDRIVE: Hyperdrive;
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


// --- CRUD Endpoints ---
const getDb = (c: any) => {
  const sql = postgres(c.env.HYPERDRIVE.connectionString);
  return drizzle(sql, { schema });
};

app.post('/api/save-exams', async (c) => {
  try {
    const { exams, userId } = await c.req.json();
    if (!userId || !exams || !Array.isArray(exams)) return c.json({ error: 'Invalid payload' }, 400);
    if (exams.length === 0) return c.json({ success: true, count: 0 });

    const db = getDb(c);
    const values = exams.map((exam: any) => ({
      id: exam.id || generateId(),
      userId,
      dataExame: exam.dataExame,
      categoria: exam.categoria,
      nomeExame: exam.nomeExame,
      resultado: exam.resultado,
      unidade: exam.unidade,
      valorReferencia: exam.valorReferencia,
      interpretacao: exam.interpretacao,
      medicoSolicitante: exam.medicoSolicitante,
      arquivoOrigem: exam.arquivoOrigem,
      pdfStoragePath: exam.pdfStoragePath,
      observacoes: exam.observacoes,
      especialidadeMedica: exam.especialidadeMedica,
      grupoSistemico: exam.grupoSistemico,
      tags: exam.tags,
      impactoAutoimune: exam.impactoAutoimune,
      isManualCategory: exam.isManualCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.insert(schema.medicalRecords).values(values);
    return c.json({ success: true, count: values.length });
  } catch (err: any) {
    console.error('Error saving exams:', err);
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/exams/:id', async (c) => {
  try {
    const db = getDb(c);
    await db.delete(schema.medicalRecords).where(eq(schema.medicalRecords.id, c.req.param('id')));
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.put('/api/exams/:id', async (c) => {
  try {
    const updates = await c.req.json();
    const db = getDb(c);
    await db.update(schema.medicalRecords).set({ ...updates, updatedAt: new Date() }).where(eq(schema.medicalRecords.id, c.req.param('id')));
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/delete-exams-batch', async (c) => {
  try {
    const { examIds } = await c.req.json();
    if (!examIds || !examIds.length) return c.json({ success: true });
    const db = getDb(c);
    await db.delete(schema.medicalRecords).where(inArray(schema.medicalRecords.id, examIds));
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/rename-source', async (c) => {
  try {
    const { newSourceName, examIds } = await c.req.json();
    if (!examIds || !examIds.length) return c.json({ success: true });
    const db = getDb(c);
    await db.update(schema.medicalRecords).set({ arquivoOrigem: newSourceName }).where(inArray(schema.medicalRecords.id, examIds));
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/doctors', async (c) => {
  try {
    const { doctor, userId } = await c.req.json();
    if (!userId || !doctor) return c.json({ error: 'Invalid payload' }, 400);
    const db = getDb(c);
    const values = {
      id: doctor.id || generateId(),
      userId,
      name: doctor.name,
      crm: doctor.crm,
      uf: doctor.uf,
      specialty: doctor.specialty,
      createdAt: new Date(),
    };
    await db.insert(schema.doctors).values(values);
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.delete('/api/doctors/:id', async (c) => {
  try {
    const db = getDb(c);
    await db.delete(schema.doctors).where(eq(schema.doctors.id, c.req.param('id')));
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/lookup-crm', async (c) => {
  try {
    const { crm, uf, doctorName } = await c.req.json();
    if (!crm && !doctorName) return c.json({ error: "Você deve fornecer o CRM ou o nome do médico para busca." }, 400);

    const prompt = `Faça uma busca ou análise lógica para validar/encontrar o CRM, Estado e Especialidade Médica do seguinte profissional de saúde no Brasil:
- CRM Informado: "${crm || 'Não especificado'}"
- UF Informada: "${uf || 'Não especificada'}"
- Nome Informado: "${doctorName || 'Não especificado'}"

Retorne APENAS um JSON estrito no formato: {"name": "Nome Oficial", "crm": "12345", "uf": "SP", "specialty": "Especialidade"}. 
Seja extremamente preciso. Caso não encontre, infira a provável especialidade. Sem markdown, apenas o JSON.`;

    const messages = [{ role: 'user', content: prompt }];
    const aiResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 500 });
    const rawAiResponse = (aiResponse as { response: string }).response;

    let parsed = { name: doctorName, crm: crm, uf: uf, specialty: 'Clínico Geral' };
    try {
      const match = rawAiResponse.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else parsed = JSON.parse(rawAiResponse);
    } catch (e) {
      console.error("AI JSON parse error on CRM lookup:", rawAiResponse);
    }

    return c.json({ success: true, data: parsed });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/appointments', async (c) => {
  try {
    const { appointment, userId } = await c.req.json();
    const db = getDb(c);
    await db.insert(schema.medicalAppointments).values({ ...appointment, id: appointment.id || generateId(), userId, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/appointments/:id', async (c) => {
  try { const db = getDb(c); await db.delete(schema.medicalAppointments).where(eq(schema.medicalAppointments.id, c.req.param('id'))); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/pathologies', async (c) => {
  try {
    const { pathology, userId } = await c.req.json();
    const db = getDb(c);
    await db.insert(schema.userPathologies).values({ ...pathology, id: pathology.id || generateId(), userId, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/pathologies/:id', async (c) => {
  try { const db = getDb(c); await db.delete(schema.userPathologies).where(eq(schema.userPathologies.id, c.req.param('id'))); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/medications', async (c) => {
  try {
    const { medication, userId } = await c.req.json();
    const db = getDb(c);
    await db.insert(schema.continuousMedications).values({ ...medication, id: medication.id || generateId(), userId, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/medications/:id', async (c) => {
  try { const db = getDb(c); await db.delete(schema.continuousMedications).where(eq(schema.continuousMedications.id, c.req.param('id'))); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/exam-orders', async (c) => {
  try {
    const { examOrder, userId } = await c.req.json();
    const db = getDb(c);
    await db.insert(schema.examOrders).values({ ...examOrder, id: examOrder.id || generateId(), userId, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/exam-orders/:id', async (c) => {
  try { const db = getDb(c); await db.delete(schema.examOrders).where(eq(schema.examOrders.id, c.req.param('id'))); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.post('/api/timeline-events', async (c) => {
  try {
    const { event, userId } = await c.req.json();
    const db = getDb(c);
    await db.insert(schema.customTimelineEvents).values({ ...event, id: event.id || generateId(), userId, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});
app.delete('/api/timeline-events/:id', async (c) => {
  try { const db = getDb(c); await db.delete(schema.customTimelineEvents).where(eq(schema.customTimelineEvents.id, c.req.param('id'))); return c.json({ success: true }); } catch (err: any) { return c.json({ error: err.message }, 500); }
});

app.get('/api/all-data/:userId', async (c) => {
  try {
    const db = getDb(c);
    const userId = c.req.param('userId');
    const [
      records, appointments, pathologies, medications, orders, events, docs
    ] = await Promise.all([
      db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.userId, userId)),
      db.select().from(schema.medicalAppointments).where(eq(schema.medicalAppointments.userId, userId)),
      db.select().from(schema.userPathologies).where(eq(schema.userPathologies.userId, userId)),
      db.select().from(schema.continuousMedications).where(eq(schema.continuousMedications.userId, userId)),
      db.select().from(schema.examOrders).where(eq(schema.examOrders.userId, userId)),
      db.select().from(schema.customTimelineEvents).where(eq(schema.customTimelineEvents.userId, userId)),
      db.select().from(schema.doctors).where(eq(schema.doctors.userId, userId)),
    ]);
    return c.json({
      exams: records,
      appointments,
      pathologies,
      medications,
      examOrders: orders,
      timelineEvents: events,
      doctors: docs
    });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});

export default app;