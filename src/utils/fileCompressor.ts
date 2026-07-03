import jsPDF from 'jspdf';

let pdfjsPromise: Promise<any> | null = null;

function getPdfJs(): Promise<any> {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Apenas ambiente de navegador é suportado'));
      return;
    }

    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjs);
      } else {
        reject(new Error('Não foi possível carregar pdfjsLib a partir do CDN'));
      }
    };
    script.onerror = (e) => {
      pdfjsPromise = null; // permite tentar novamente
      reject(new Error('Falha no carregamento do script PDF.js: ' + String(e)));
    };
    document.head.appendChild(script);
  });

  return pdfjsPromise;
}

/**
 * Comprime uma imagem reduzindo sua resolução para uma dimensão máxima e diminuindo a qualidade JPEG.
 */
export async function compressImage(file: File, maxDimension: number = 1800, quality: number = 0.7): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob && blob.size < file.size) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // se a compactação ficar maior, usa o original
        }
      }, 'image/jpeg', quality);
    };
    img.onerror = () => {
      resolve(file); // fallback se der erro
    };
  });
}

/**
 * Comprime um arquivo PDF extraindo suas páginas, renderizando em Canvas otimizados
 * e salvando novamente em formato PDF com compressão de imagem JPEG.
 */
export async function compressPDF(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<File> {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;

    if (numPages === 0) return file;

    const pdfWriter = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdfWriter.internal.pageSize.getWidth();
    const pdfHeight = pdfWriter.internal.pageSize.getHeight();

    for (let i = 1; i <= numPages; i++) {
      if (onProgress) onProgress(i, numPages);

      const page = await pdfDoc.getPage(i);
      // Fator de escala 1.5 é ótimo para manter a leitura dos caracteres da IA viva (150 DPI)
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      if (!context) {
        continue;
      }

      await page.render({ canvasContext: context, viewport }).promise;

      // Qualidade de imagem 0.65 gera alta redução de espaço com preservação excelente de textos e contrastes
      const imgData = canvas.toDataURL('image/jpeg', 0.65);

      if (i > 1) {
        pdfWriter.addPage();
      }

      pdfWriter.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // Limpeza de memória do Canvas
      canvas.width = 0;
      canvas.height = 0;
    }

    const outputBlob = pdfWriter.output('blob');
    
    if (outputBlob.size < file.size) {
      return new File([outputBlob], file.name, {
        type: 'application/pdf',
        lastModified: Date.now()
      });
    }

    return file;
  } catch (err) {
    console.error('Erro na compressão do PDF:', err);
    return file; // retorno seguro do arquivo original em caso de qualquer exceção
  }
}
