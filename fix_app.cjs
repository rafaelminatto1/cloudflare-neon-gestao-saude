const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove firebase imports
content = content.replace(/import \{.*?\} from 'firebase\/.*?';/g, '');
content = content.replace(/import \{ initAuth, logoutAuth, getAccessToken, requestSmsCode, confirmSmsCode, getAllowedSmsPhoneNumber, getSmsSessionDurationHours, googleSignIn \} from '\.\/authHelper';/g, '');
content = content.replace(/uploadToFirebaseFolder,/g, '');
content = content.replace(/handleFirestoreError,/g, '');
content = content.replace(/import \{ db, auth \} from '\.\/firebase';/g, 'const auth: any = {};');

// 2. Inject stubs
const stubs = `
// Mocks for removed firebase and auth dependencies
const db: any = {};
const query: any = (...args: any[]) => {};
const collection: any = (...args: any[]) => {};
const onSnapshot: any = (...args: any[]) => () => {};
const doc: any = (...args: any[]) => {};
const setDoc: any = (...args: any[]) => {};
const getDoc: any = (...args: any[]) => {};
const serverTimestamp: any = () => {};
const orderBy: any = (...args: any[]) => {};
const handleFirestoreError: any = (...args: any[]) => {};
const getAllowedSmsPhoneNumber: any = () => '+5511999999999';
const getAccessToken: any = async () => '';
const getSmsSessionDurationHours: any = () => 24;
const requestSmsCode: any = async (...args: any[]) => {};
const confirmSmsCode: any = async (...args: any[]) => {};
const googleSignIn: any = async () => {};
const initAuth: any = (cb: any) => { cb({ uid: 'mock-user', id: 'mock-user' }, 'mock-token'); return () => {}; };
const uploadToFirebaseFolder: any = async (...args: any[]) => '';
const signInWithEmailAndPassword: any = async (...args: any[]) => {};
const signUpWithEmailAndPassword: any = async (...args: any[]) => {};
const logoutAuth: any = async (...args: any[]) => {};
type FirebaseUser = any;
`;

// ensure stubs is not injected twice if script ran twice, but we are copying from original anyway so no worries
content = content.replace(/import Markdown from 'react-markdown';/, stubs + '\nimport Markdown from \'react-markdown\';');

// 3. Fix TS typing errors
content = content.replace(/if \(latestExamDate && latestExamDate < anchorDate\) \{/g, 'if (latestExamDate && latestExamDate.getTime() < anchorDate.getTime()) {');
content = content.replace(/let latestExamDate = null;/g, 'let latestExamDate: any = null;');
content = content.replace(/let latestApptDate = null;/g, 'let latestApptDate: any = null;');

content = content.replace(/const range = \[\];/g, 'const range: any[] = [];');
content = content.replace(/pdf\.save\(\`\$\{selectedSource\.replace/g, 'pdf.save(`${selectedSource!.replace');
content = content.replace(/markDocumentForRetry\(queueId,/g, 'markDocumentForRetry(queueId!,');
content = content.replace(/updateDocumentStatus\(queueId,/g, 'updateDocumentStatus(queueId!,');

content = content.replace(/\(snapshot\) =>/g, '(snapshot: any) =>');
content = content.replace(/\(doc\) =>/g, '(doc: any) =>');
content = content.replace(/\(error\) =>/g, '(error: any) =>');
content = content.replace(/\(u, token\) =>/g, '(u: any, token: any) =>');

// 4. Remove Google Drive UI Block specifically (using indexOf and slice for absolute safety)
const driveBlockStart = '{/* Google Drive Automation Integration Block */}';
const driveBlockEnd = ' {/* Gráfico de Barras de Eficiência de Processamento de Arquivos */}';

const startIndex = content.indexOf(driveBlockStart);
const endIndex = content.indexOf(driveBlockEnd);
if (startIndex !== -1 && endIndex !== -1) {
    const divStart = content.lastIndexOf('<div', startIndex);
    content = content.slice(0, divStart) + content.slice(endIndex);
}

// 5. Remove Google Drive file upload in uploadFileAndParse
const driveUploadStartStr = "try {\n              const driveToken = await getAccessToken();";
const driveUploadStart = content.indexOf(driveUploadStartStr);
if (driveUploadStart !== -1) {
    const driveUploadEndStr = "addDriveLog('Backup em nuvem não configurado/autorizado.');\n              }";
    const driveUploadEnd = content.indexOf(driveUploadEndStr, driveUploadStart) + driveUploadEndStr.length;
    if (driveUploadEnd > driveUploadStart) {
        content = content.slice(0, driveUploadStart) + content.slice(driveUploadEnd);
    }
}

// 6. Fix Cloudflare worker PDF upload
content = content.replace(
  /let pdfStoragePath = await uploadPDF\(file, user\.id\);\s*addToast\('Processando documento com Inteligência Artificial.*?', 'info'\);/,
  "addToast('Processando documento com Inteligência Artificial...', 'info');"
);
content = content.replace(
  /const newExams = data\.exams\.map\(\(ex: any\) => \(\{\s*\.\.\.ex,/g,
  "const newExams = data.exams.map((ex: any) => ({\n              ...ex,\n              pdfStoragePath: data.pdfStoragePath,"
);

fs.writeFileSync('src/App.tsx', content);
