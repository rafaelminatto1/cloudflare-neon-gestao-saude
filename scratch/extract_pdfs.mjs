import fs from 'fs';
import path from 'path';
import { extractText } from 'unpdf';

const examesDir = '/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare/EXAMES/exames de imagem';
const files = fs.readdirSync(examesDir).filter(f => f.endsWith('.pdf'));

async function run() {
  for (const file of files) {
    const pdfPath = path.join(examesDir, file);
    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    try {
      const textData = await extractText(pdfData);
      const pdfTextStr = Array.isArray(textData.text) ? textData.text.join('\n') : String(textData.text);
      
      console.log(`\n=================== FILE: ${file} ===================\n`);
      // Print first 1000 characters and look for specific patterns
      console.log(pdfTextStr.substring(0, 1500));
      
      // Let's also look for common things that might trip the AI up:
      const lines = pdfTextStr.split('\n');
      const tablePatterns = lines.filter(l => 
        l.match(/inferior|superior|reagente|inconclusivo|ausência|presença|referência|limite|risco|desejável|ótimo/i)
      );
      if (tablePatterns.length > 0) {
        console.log(`\n--- Potential Table/Reference Patterns in ${file} ---`);
        tablePatterns.slice(0, 5).forEach(l => console.log('   ' + l.trim()));
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
  }
}

run();
