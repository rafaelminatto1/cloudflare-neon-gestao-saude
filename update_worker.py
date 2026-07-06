import re

with open("worker/index.ts", "r") as f:
    content = f.read()

# 1. Update Bindings
content = content.replace(
    "HYPERDRIVE: Hyperdrive;\n};",
    "HYPERDRIVE: Hyperdrive;\n  PDF_PROCESS_QUEUE: any;\n};"
)

# 2. Update /api/parse-pdf
old_parse_pdf_pattern = re.compile(r"app\.post\('/api/parse-pdf', async \(c\) => \{.*?\n\}\);\n", re.DOTALL)

new_parse_pdf = """app.post('/api/parse-pdf', async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'] as File;
    const userId = getScopedUserId(c, body['userId'] as string | undefined);
    
    if (!file || !userId) return c.json({ error: 'Arquivo ou userId não fornecido' }, 400);

    const fileId = generateId();
    const pdfStoragePath = `exams/${userId}/${fileId}.pdf`;
    
    const arrayBuffer = await file.arrayBuffer();
    
    await c.env.R2_BUCKET.put(pdfStoragePath, arrayBuffer, {
      httpMetadata: { contentType: 'application/pdf' },
      customMetadata: { userId }
    });

    await c.env.PDF_PROCESS_QUEUE.send({
      userId,
      fileId,
      pdfStoragePath,
      fileName: file.name
    });

    await c.env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'processing' }));

    return c.json({ success: true, jobId: fileId, status: 'processing' });
  } catch (err: any) {
    console.error("Error parsing PDF:", err);
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/job-status/:jobId', async (c) => {
  const jobId = c.req.param('jobId');
  const jobData = await c.env.GESTAO_SAUDE_KV.get(`job:${jobId}`);
  if (!jobData) return c.json({ status: 'unknown' });
  return c.json(JSON.parse(jobData));
});
"""

content = old_parse_pdf_pattern.sub(new_parse_pdf, content, count=1)

# 3. Update export and add queue handler
old_export = "export default app;"

new_export = """export default {
  fetch: app.fetch,
  async queue(batch: any, env: Bindings) {
    for (let message of batch.messages) {
      const { userId, fileId, pdfStoragePath, fileName } = message.body;
      
      try {
        const object = await env.R2_BUCKET.get(pdfStoragePath);
        if (!object) throw new Error("File not found in R2");
        const arrayBuffer = await object.arrayBuffer();
        
        const pdfData = new Uint8Array(arrayBuffer);
        const { extractText } = await import('unpdf');
        const textData = await extractText(pdfData);
        const pdfTextStr = Array.isArray(textData.text) ? textData.text.join('\\n') : String(textData.text);
        const truncatedText = pdfTextStr.substring(0, 5000);

        try {
          const embeddingResponse = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [truncatedText] });
          const vector = embeddingResponse.data[0];
          
          await env.VECTOR_INDEX.upsert([
            {
              id: fileId,
              values: vector,
              metadata: { userId, path: pdfStoragePath, type: 'exam_pdf' }
            }
          ]);
          await env.GESTAO_SAUDE_KV.put(`doc:${fileId}`, truncatedText);
        } catch (vectorErr) {
          console.error("Vectorize insertion error:", vectorErr);
        }

        const messages = [
          { role: 'system', content: 'Você é um assistente médico especializado na leitura de laudos e exames. Retorne APENAS um JSON estruturado, sem blocos de markdown e sem texto adicional.' },
          { role: 'user', content: `Extraia as informações do exame abaixo e retorne APENAS um JSON válido contendo um array 'exames' (se for sangue/urina/fezes/imagem) ou 'avaliacoes' (se for laudo/parecer). Formato do array exames: [{ dataExame: string, categoria: string (USE APENAS: Autoimunidade, Coração, Eletrólitos, Exames de Imagem, Fígado, Gastroenterologia, Hormônios, Infectologia, Marcadores Celulares Integrados, Metabolismo, Nutrientes, Pâncreas, Rins, Sangue, Saúde Feminina, Saúde Masculina, Tireoide, Toxicologia), nomeExame: string, resultado: string, unidade: string, valorReferencia: string, interpretacao: string, medicoSolicitante: string, arquivoOrigem: string, especialidadeMedica: string, grupoSistemico: string, tags: string, impactoAutoimune: string }]. Se laudo: [{ date: string, type: string, text: string }].\\n\\nArquivo Origem Nome: ${fileName}\\nTexto do PDF:\\n${truncatedText}` }
        ];

        const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 }, {
          gateway: {
            id: "gestao-saude-gateway"
          }
        });
        const rawAiResponse = (aiResponse as { response: string }).response;
        
        let parsedJson: any = { exams: [] };
        try {
          const match = rawAiResponse.match(/\\{[\\s\\S]*\\}/);
          if (match) {
            parsedJson = JSON.parse(match[0]);
          } else {
            parsedJson = JSON.parse(rawAiResponse);
          }
          if (parsedJson.exames && !parsedJson.exams) parsedJson.exams = parsedJson.exames;
          if (parsedJson.avaliacoes && !parsedJson.exams) parsedJson.exams = parsedJson.avaliacoes;
        } catch (e) {
           await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'error', error: 'Falha na extração de dados JSON' }));
           continue;
        }
        
        if (parsedJson.exams) {
          parsedJson.exams = parsedJson.exams.map((ex: any) => ({ ...ex, pdfStoragePath }));
        }

        await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'done', data: parsedJson }));
        
      } catch (err: any) {
         await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'error', error: err.message }));
      }
    }
  }
};
"""

content = content.replace(old_export, new_export)

with open("worker/index.ts", "w") as f:
    f.write(content)

print("worker/index.ts updated!")
