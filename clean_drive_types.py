import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Context properties
content = re.sub(r'\s*hasDriveAccess: boolean;.*?\s*executeDriveSync: \(\) => Promise<void>;', '', content, flags=re.DOTALL)
content = re.sub(r'import \{ ensureDriveFolder.*?\} from \'./driveHelper\';\n', '', content)
content = re.sub(r'const \[hasDriveAccess.*?\n', '', content)
content = re.sub(r'const \[lastDriveSyncTime.*?\n', '', content)
content = re.sub(r'const \[isDriveAutoSyncEnabled.*?\n', '', content)
content = re.sub(r'const \[driveSyncLogs.*?\n', '', content)
content = re.sub(r'const addDriveLog.*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const executeDriveSync = async \(\) => \{.*?\};\n', '', content, flags=re.DOTALL)
content = re.sub(r'useEffect\(\(\) => \{\n\s*if \(!user \|\| !hasDriveAccess.*?\}\),\n\s*15 \* 60 \* 1000\n\s*\);\n\s*return \(\) => clearInterval\(interval\);\n\s*\}, \[user, hasDriveAccess, isDriveAutoSyncEnabled\]\);\n', '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

