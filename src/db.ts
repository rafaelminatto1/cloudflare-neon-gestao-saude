import { authClient } from './authHelper';
import localforage from 'localforage';
import { MedicalRecord, MedicalAppointment, UserPathology, ContinuousMedication, Doctor, ExamOrder } from './data';



export const dataEventTarget = new EventTarget();
function triggerRefresh() {
  dataEventTarget.dispatchEvent(new Event('refresh'));
}


export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = null;
  try {
    token = await (authClient as any).getJWTToken?.();
  } catch (err) {
    console.warn("Neon Auth token fetch failed:", err);
  }
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, { ...options, headers });
}

export async function uploadPDF(file: File, userId: string): Promise<string> {
  const filePath = `local_users/${userId}/exams/${Date.now()}_${file.name}`;
  try {
    const arrayBuffer = await file.arrayBuffer();
    await localforage.setItem(filePath, { data: arrayBuffer, type: file.type });
  } catch (err) {
    console.error('LocalForage upload error:', err);
  }
  return filePath;
}

export async function getPDFUrl(filePath: string): Promise<string> {
  if (!filePath) return '';
  
  try {
    const response = await apiFetch(`/api/file/${filePath}`);
    if (response.ok) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.error('Failed to get PDF from R2 API:', err);
  }
  return '';
}

export async function saveExamsBatch(
  exams: Partial<MedicalRecord>[], 
  userId: string,
  onProgress?: (completed: number, total: number) => void
) {
  try {
    const response = await apiFetch("/api/save-exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams, userId }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error || `Erro do servidor: ${response.status}`);
    }

    triggerRefresh();
    if (onProgress) {
      onProgress(exams.length, exams.length);
    }
  } catch (err) {
    throw err;
  }
}

export async function deleteExam(examId: string, pdfStoragePath: string | undefined, userId: string) {
  await apiFetch(`/api/exams/${examId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function renameSourceInExams(newSourceName: string, examIds: string[], userId: string) {
  await apiFetch("/api/rename-source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newSourceName, examIds }),
  });
  triggerRefresh();
}

export async function deleteExamsBatch(examIds: string[], pdfStoragePaths: (string | undefined)[], userId: string) {
  await apiFetch("/api/delete-exams-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examIds }),
  });
  triggerRefresh();
}

export async function updateExam(examId: string, updates: Partial<MedicalRecord>, userId: string) {
  await apiFetch(`/api/exams/${examId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  triggerRefresh();
}

export async function saveAppointment(appointment: Partial<MedicalAppointment>, userId: string) {
  await apiFetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appointment, userId }),
  });
  triggerRefresh();
}

export async function deleteAppointment(appointmentId: string, userId: string) {
  await apiFetch(`/api/appointments/${appointmentId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function createUserProfile() {
  // Not strictly needed in this quick neon setup if we just use Neon Auth and let records tie to UID
}

export async function savePathology(pathology: Partial<UserPathology>, userId: string) {
  await apiFetch("/api/pathologies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathology, userId }),
  });
  triggerRefresh();
}

export async function deletePathology(pathologyId: string, userId: string) {
  await apiFetch(`/api/pathologies/${pathologyId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function saveMedication(medication: Partial<ContinuousMedication>, userId: string) {
  await apiFetch("/api/medications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ medication, userId }),
  });
  triggerRefresh();
}

export async function deleteMedication(medicationId: string, userId: string) {
  await apiFetch(`/api/medications/${medicationId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function saveDoctor(doctor: Partial<Doctor>, userId: string) {
  await apiFetch("/api/doctors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctor, userId }),
  });
  triggerRefresh();
}

export async function deleteDoctor(doctorId: string, userId: string) {
  await apiFetch(`/api/doctors/${doctorId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function saveExamOrder(examOrder: Partial<ExamOrder>, userId: string) {
  await apiFetch("/api/exam-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examOrder, userId }),
  });
  triggerRefresh();
}

export async function deleteExamOrder(orderId: string, pdfStoragePath: string | undefined, userId: string) {
  await apiFetch(`/api/exam-orders/${orderId}`, { method: "DELETE" });
  triggerRefresh();
}

export interface CustomTimelineEvent {
  id: string;
  userId: string;
  title: string;
  date: string;
  category: 'MEDICINE' | 'SURGERY' | 'DIAGNOSIS' | 'SYMPTOM' | 'EXAM' | 'OTHER';
  description: string;
  createdAt?: any;
}

export async function saveCustomTimelineEvent(event: Partial<CustomTimelineEvent>, userId: string) {
  await apiFetch("/api/timeline-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, userId }),
  });
  triggerRefresh();
}

export async function deleteCustomTimelineEvent(eventId: string, userId: string) {
  await apiFetch(`/api/timeline-events/${eventId}`, { method: "DELETE" });
  triggerRefresh();
}

export async function fetchAllUserData(userId: string) {
  const res = await apiFetch(`/api/all-data/${userId}`);
  if (!res.ok) throw new Error("Erro ao buscar dados do servidor");
  return res.json();
}

// Mocks for compilation
export const handleFirestoreError = (...args: any[]) => {};
export const uploadToFirebaseFolder = async (...args: any[]) => '';
