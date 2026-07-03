import { get, set, keys, del } from 'idb-keyval';

export interface QueuedDocument {
  id: string;
  name: string;
  fileBlob: Blob;
  dateAdded: number;
  status: 'pending' | 'processing' | 'failed';
  errorMessage?: string;
  retryCount?: number;
  nextRetryTime?: number;
}

export async function addDocumentToQueue(file: File) {
  // Convert to ArrayBuffer then Blob to avoid DataCloneError in Safari/some browsers
  const arrayBuffer = await file.arrayBuffer();
  const pureBlob = new Blob([arrayBuffer], { type: file.type });
  
  const doc: QueuedDocument = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    name: file.name,
    fileBlob: pureBlob, 
    dateAdded: Date.now(),
    status: 'pending',
    retryCount: 0
  };
  await set(`docq_${doc.id}`, doc);
  return doc;
}

export async function getQueuedDocuments(): Promise<QueuedDocument[]> {
  const allKeys = await keys();
  const docKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith('docq_'));
  const docs: QueuedDocument[] = [];
  
  for (const k of docKeys) {
    const val = await get(k);
    if (val) {
      docs.push(val as QueuedDocument);
    }
  }
  
  docs.sort((a, b) => b.dateAdded - a.dateAdded);
  return docs;
}

export async function updateDocumentStatus(id: string, status: QueuedDocument['status'], errorMessage?: string, retryCount?: number, nextRetryTime?: number) {
  const doc = await get(`docq_${id}`) as QueuedDocument;
  if (doc) {
    doc.status = status;
    doc.errorMessage = errorMessage;
    if (retryCount !== undefined) doc.retryCount = retryCount;
    if (nextRetryTime !== undefined) doc.nextRetryTime = nextRetryTime;
    await set(`docq_${id}`, doc);
  }
}

export async function markDocumentForRetry(id: string, errorMessage: string) {
  const doc = await get(`docq_${id}`) as QueuedDocument;
  if (doc) {
    const currentRetries = doc.retryCount || 0;
    const maxRetries = 5;
    
    if (currentRetries < maxRetries) {
      // Exponential backoff: 30s, 60s, 120s, 240s, 480s
      const delayMs = Math.pow(2, currentRetries) * 30 * 1000;
      doc.status = 'failed';
      doc.errorMessage = errorMessage;
      doc.retryCount = currentRetries + 1;
      doc.nextRetryTime = Date.now() + delayMs;
    } else {
      doc.status = 'failed';
      doc.errorMessage = errorMessage + ' (Limite de tentativas excedido)';
      doc.nextRetryTime = undefined;
    }
    await set(`docq_${id}`, doc);
    return doc;
  }
  return null;
}

export async function removeDocumentFromQueue(id: string) {
  await del(`docq_${id}`);
}
