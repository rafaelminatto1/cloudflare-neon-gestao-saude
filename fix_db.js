import fs from 'fs';

let content = fs.readFileSync('src/db.ts', 'utf-8');

// Add import
content = "import { authClient } from './authHelper';\n" + content;

// Create apiFetch
const apiFetchCode = `
export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = await authClient.getJWTToken?.();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  return fetch(url, { ...options, headers });
}
`;
content = content.replace(/export async function uploadPDF/, apiFetchCode + '\nexport async function uploadPDF');

// Replace all fetch(...) with apiFetch(...)
content = content.replace(/await fetch\(/g, 'await apiFetch(');

fs.writeFileSync('src/db.ts', content);
console.log('src/db.ts updated');
