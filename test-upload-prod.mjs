import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navegando para producao...");
  await page.goto('https://gestao-saude-cloudflare.rafalegollas.workers.dev');

  // Wait for login or dashboard
  await page.waitForTimeout(2000);
  
  // Check if we need to login
  const emailInput = await page.locator('input[type="email"]').count();
  if (emailInput > 0) {
     console.log("Realizando login...");
     await page.fill('input[type="email"]', 'rafael.minatto@yahoo.com.br');
     await page.fill('input[type="password"]', 'Yukari30@');
     await page.click('button:has-text("Entrar")');
     await page.waitForTimeout(5000);
  } else {
     console.log("Ja logado.");
  }

  await page.screenshot({ path: 'prod_upload_test_1.png' });

  // Navigate to Exames
  console.log("Navegando para Exames...");
  const examesBtn = page.locator('button:has-text("Exames"), a:has-text("Exames"), div:has-text("Exames")').first();
  if (await examesBtn.count() > 0) {
      await examesBtn.click();
  } else {
      console.log("Não encontrou o botão de Exames.");
  }
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'prod_upload_test_2.png' });

  // Find file input
  console.log("Buscando input de arquivo...");
  const fileInput = await page.locator('input[type="file"]');
  if (await fileInput.count() > 0) {
      console.log("Fazendo upload do PDF...");
      await fileInput.setInputFiles('/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare/EXAMES/(02) 04-09-2021 Felipe Aragao da Silva.pdf');
  } else {
      console.log("Nao encontrou input de arquivo. Talvez tenha que clicar em Upload primeiro?");
      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Adicionar"), button:has-text("Novo Exame")').first();
      if (await uploadBtn.count() > 0) {
          await uploadBtn.click();
          await page.waitForTimeout(1000);
          await page.locator('input[type="file"]').setInputFiles('/home/rafael/Documentos/gestao saude/gestao-saude-cloudflare/EXAMES/(02) 04-09-2021 Felipe Aragao da Silva.pdf');
      }
  }

  // Wait for AI processing
  console.log("Aguardando IA processar...");
  await page.waitForTimeout(180000); // 180s to allow Cloudflare AI to respond and Postgres to save
  await page.screenshot({ path: 'prod_upload_test_4.png' });

  console.log("Teste finalizado. Verifique as screenshots prod_upload_test_*.png");
  await browser.close();
})();
