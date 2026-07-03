import { fetchWithRetry } from './utils/fetchWithRetry';

export async function getDriveFolder(token: string, name: string, parentId?: string): Promise<string | null> {
  let query = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  const res = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED_DRIVE_ACCESS');
  }
  if (!res.ok) return null;
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

export async function createDriveFolder(token: string, name: string, parentId?: string): Promise<string | null> {
  const metadata: any = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder'
  };
  if (parentId) {
    metadata.parents = [parentId];
  }
  const res = await fetchWithRetry('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED_DRIVE_ACCESS');
  }
  if (!res.ok) return null;
  const data = await res.json();
  return data.id;
}

export async function ensureDriveFolder(token: string, path: string[]): Promise<string | null> {
  let currentParentId: string | undefined = undefined;
  for (const folderName of path) {
    let folderId = await getDriveFolder(token, folderName, currentParentId);
    if (!folderId) {
      folderId = await createDriveFolder(token, folderName, currentParentId) || null;
    }
    if (!folderId) return null; // failed
    currentParentId = folderId;
  }
  return currentParentId || null;
}

export async function uploadFileToDrive(token: string, file: File, folderId?: string): Promise<any> {
  const metadata: any = {
    name: file.name,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = 'healthtracker_drive_upload_boundary';
  
  const metadataPart = 
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const closeDelim = `\r\n--${boundary}--`;

  const body = new Blob([
    metadataPart,
    file,
    closeDelim
  ]);
  
  const res = await fetchWithRetry('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: body
  });
  
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED_DRIVE_ACCESS');
  }
  if (!res.ok) {
    throw new Error('Failed to upload to Google Drive: ' + await res.text());
  }
  return res.json();
}

export async function listFilesInFolder(token: string, folderId: string): Promise<{ id: string; name: string; mimeType: string }[]> {
  const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/pdf' or mimeType = 'image/jpeg' or mimeType = 'image/png' or mimeType = 'image/webp')`;
  const res = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType)&pageSize=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED_DRIVE_ACCESS');
  }
  if (!res.ok) {
    throw new Error('Failed to list files in Google Drive: ' + await res.text());
  }
  const data = await res.json();
  return data.files || [];
}

export async function downloadDriveFile(token: string, fileId: string): Promise<Blob> {
  const res = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED_DRIVE_ACCESS');
  }
  if (!res.ok) {
    throw new Error('Failed to download file from Google Drive: ' + await res.text());
  }
  return res.blob();
}
