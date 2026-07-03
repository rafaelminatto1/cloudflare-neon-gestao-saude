import fs from 'fs';
import path from 'path';

async function test() {
  const email = 'rafael.minatto@yahoo.com.br';
  const password = 'Yukari30@';
  const authUrl = 'https://ep-wandering-bonus-acj4zwvo.neonauth.sa-east-1.aws.neon.tech/neondb/auth';
  const baseUrl = 'https://gestao-saude-cloudflare.rafalegollas.workers.dev';

  console.log('Logging in to Neon Auth...');
  const loginRes = await fetch(`${authUrl}/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      'Origin': baseUrl },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const userId = loginData.user.id;
  
  // Extract better-auth.session_token from set-cookie
  const setCookieHeader = loginRes.headers.get('set-cookie');
  console.log('Logged in successfully. User ID:', userId);
  console.log('Cookies:', setCookieHeader);

  const filePath = '/home/rafael/Documentos/gestao saude/Gest-o-saude/EXAMES/(01) 02-07-2021 Dra Sandra Uzuba.pdf';
  console.log('Uploading file:', filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
  
  const formData = new FormData();
  formData.append('file', fileBlob, path.basename(filePath));
  formData.append('userId', userId);

  console.log('Calling /api/parse-pdf on Cloudflare...');
  const uploadRes = await fetch(`${baseUrl}/api/parse-pdf`, {
    method: 'POST',
    headers: {
      'Cookie': setCookieHeader || ''
    },
    body: formData
  });

  if (!uploadRes.ok) {
    console.error('Upload failed:', uploadRes.status, await uploadRes.text());
    return;
  }

  const result = await uploadRes.json();
  console.log('AI Extraction successful!');
  console.log('Extracted exams:', JSON.stringify(result.exams, null, 2));
  
  console.log('Now saving exams to DB...');
  const saveRes = await fetch(`${baseUrl}/api/save-exams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': baseUrl,
      'Cookie': setCookieHeader || ''
    },
    body: JSON.stringify({
      userId,
      exams: result.exams.map((e) => ({
        ...e,
        sourceFile: path.basename(filePath),
        date: new Date().toISOString()
      }))
    })
  });
  
  if (!saveRes.ok) {
    console.error('Save failed:', saveRes.status, await saveRes.text());
    return;
  }
  
  console.log('Save result:', await saveRes.text());
  console.log('Done!');
}

test().catch(console.error);
