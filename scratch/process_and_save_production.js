import fs from 'fs';
import path from 'path';

const baseUrl = 'https://gestao-saude-cloudflare.rafalegollas.workers.dev';
const filePath = './EXAMES/(02) 04-09-2021 Felipe Aragao da Silva.pdf';
const fileName = path.basename(filePath);

async function run() {
  try {
    console.log(`Reading file ${filePath}...`);
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('file', fileBlob, fileName);
    formData.append('userId', 'mock-user');

    console.log(`Uploading ${fileName} to ${baseUrl}/api/parse-pdf...`);
    const uploadRes = await fetch(`${baseUrl}/api/parse-pdf`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
    }

    const uploadData = await uploadRes.json();
    console.log('Upload response:', uploadData);

    const taskId = uploadData.taskId;
    if (!taskId) {
      throw new Error('No taskId returned');
    }

    console.log(`Polling task status for task ${taskId}...`);
    let completed = false;
    let resultExams = null;

    for (let i = 0; i < 60; i++) { // Poll for up to 5 minutes
      await new Promise(r => setTimeout(r, 5000));
      
      const statusRes = await fetch(`${baseUrl}/api/task-status/${taskId}`);
      if (!statusRes.ok) {
        console.warn(`Failed to fetch status: ${statusRes.status}`);
        continue;
      }

      const statusData = await statusRes.json();
      console.log(`Poll ${i+1}: status = ${statusData.status}`);

      if (statusData.status === 'completed') {
        completed = true;
        resultExams = statusData.result;
        break;
      } else if (statusData.status === 'error') {
        throw new Error(`AI processing failed: ${statusData.error}`);
      }
    }

    if (!completed) {
      throw new Error('Polling timed out');
    }

    console.log(`AI Extraction successful! Extracted ${resultExams.length} exams.`);
    console.log('Exams snippet:', JSON.stringify(resultExams.slice(0, 2), null, 2));

    // Save exams to DB
    console.log('Saving exams to DB...');
    const saveRes = await fetch(`${baseUrl}/api/save-exams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseUrl
      },
      body: JSON.stringify({
        userId: 'mock-user',
        exams: resultExams.map(e => ({
          ...e,
          arquivoOrigem: fileName,
          dataExame: e.dataExame || '04/09/2021'
        }))
      })
    });

    if (!saveRes.ok) {
      throw new Error(`Save failed: ${saveRes.status} ${await saveRes.text()}`);
    }

    console.log('Save result:', await saveRes.json());
    console.log('Success! Both PDFs should now be indexed!');
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
