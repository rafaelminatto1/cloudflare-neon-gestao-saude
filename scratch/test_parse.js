import fs from 'fs';
import { extractText } from 'unpdf';

async function run() {
  try {
    const pdfPath = './EXAMES/(02) 04-09-2021 Felipe Aragao da Silva.pdf';
    console.log(`Reading ${pdfPath}...`);
    const buffer = fs.readFileSync(pdfPath);
    const pdfData = new Uint8Array(buffer);
    
    console.log("Extracting text using unpdf...");
    const textData = await extractText(pdfData);
    const pdfTextStr = Array.isArray(textData.text) ? textData.text.join('\n') : String(textData.text);
    
    console.log(`Extracted ${pdfTextStr.length} characters of text:`);
    console.log(pdfTextStr.substring(0, 1000));
    console.log("...");
    console.log(pdfTextStr.substring(pdfTextStr.length - 1000));
  } catch (err) {
    console.error(err);
  }
}

run();
