import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Context properties for Google Drive
content = re.sub(r'\s*hasDriveAccess: boolean;.*?executeDriveSync: \(\) => Promise<void>;', '', content, flags=re.DOTALL)
content = re.sub(r'hasDriveAccess: false,\s*connectDrive: async \(\) => \{\},\s*disconnectDrive: \(\) => \{\},\s*isSyncingDrive: false,\s*lastDriveSyncTime: null,\s*isDriveAutoSyncEnabled: false,\s*setIsDriveAutoSyncEnabled: \(\) => \{\},\s*driveSyncLogs: \[\],\s*executeDriveSync: async \(\) => \{\},', '', content, flags=re.DOTALL)

# 2. State hooks and functions
content = re.sub(r'\s*const \[hasDriveAccess, setHasDriveAccess\].*?;', '', content)
content = re.sub(r'\s*const connectDrive = \(\) => \{\s*alert.*?;\s*};\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\s*const disconnectDrive = \(\) => \{\s*.*?\s*};\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\s*const \[isSyncingDrive, setIsSyncingDrive\].*?;', '', content)
content = re.sub(r'\s*const \[lastDriveSyncTime, setLastDriveSyncTime\].*?;', '', content)
content = re.sub(r'\s*const \[isDriveAutoSyncEnabled, setIsDriveAutoSyncEnabled\].*?;', '', content)
content = re.sub(r'\s*const \[driveSyncLogs, setDriveSyncLogs\].*?;', '', content)
content = re.sub(r'\s*const addDriveLog.*?\}\s*;\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\s*const executeDriveSync = async \(\) => \{.*?\};\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\s*useEffect\(\(\) => \{\s*if \(!user \|\| !hasDriveAccess.*?\}\),\s*15 \* 60 \* 1000\s*\);\s*return \(\) => clearInterval\(interval\);\s*\}, \[user, hasDriveAccess, isDriveAutoSyncEnabled\]\);\s*', '', content, flags=re.DOTALL)

# 3. Provider values
content = re.sub(r'\s*hasDriveAccess,\s*connectDrive,\s*disconnectDrive,\s*isSyncingDrive,\s*lastDriveSyncTime,\s*isDriveAutoSyncEnabled,\s*setIsDriveAutoSyncEnabled,\s*driveSyncLogs,\s*executeDriveSync,', '', content, flags=re.DOTALL)

# 4. Remove UI block
content = re.sub(r'\s*\{/\* Google Drive Automation Integration Block \*/\}.*?(?=\s*\{/\* Gráfico de Barras)', '', content, flags=re.DOTALL)

# 5. Remove Nav Item Google Drive indicator
content = re.sub(r'\s*<div className="mt-4 mb-4 mx-3 p-3 bg-gradient-to-br.*?</div>\s*</div>', '', content, flags=re.DOTALL)

# 6. Change tab name
content = content.replace('🗂️ Documentos & Google Drive', '🗂️ Documentos')

# 7. Remove drive copy logic inside uploadFileAndParse
content = re.sub(r'\s*try \{\s*const driveToken = null;.*?catch \(driveErr: any\) \{.*?\}\s*\}\s*', '', content, flags=re.DOTALL)

# 8. Imports
content = re.sub(r'\s*import \{ ensureDriveFolder.*?\} from \'./driveHelper\';', '', content)

# 9. pdfStoragePath mapping
content = re.sub(r'let pdfStoragePath = await uploadPDF\(file, user\.id\);\s*addToast\(\'Processando documento com Inteligência Artificial.*?\', \'info\'\);', r"addToast('Processando documento com Inteligência Artificial, isso pode levar alguns segundos...', 'info');", content, flags=re.DOTALL)

content = re.sub(r'const newExams = data\.exams\.map\(\(ex: any\) => \(\{\s*\.\.\.ex,', r'const newExams = data.exams.map((ex: any) => ({\n              ...ex,\n              pdfStoragePath: data.pdfStoragePath,', content)

content = re.sub(r'\s*// Cloudflare copy\s*try \{.*?catch \(fbErr\) \{.*?\}\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\s*// Make a physical copy in Cloudflare Storage\s*try \{.*?catch \(fbErr\) \{.*?\}\s*', '', content, flags=re.DOTALL)


with open('src/App.tsx', 'w') as f:
    f.write(content)

