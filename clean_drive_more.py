import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove connectDrive
content = re.sub(r'const connectDrive = .*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const disconnectDrive = .*?};\n', '', content, flags=re.DOTALL)

# Remove Nav Item Google Drive indicator
nav_item_pattern = re.compile(r'<div className="mt-4 mb-4 mx-3 p-3 bg-gradient-to-br.*?</div>\s*</div>', re.DOTALL)
content = nav_item_pattern.sub('', content)

# Change tab name
content = content.replace('🗂️ Documentos & Google Drive', '🗂️ Documentos')

# Remove drive copy logic inside uploadFileAndParse
drive_copy_pattern = re.compile(r'try \{\s*const driveToken = null;.*?catch \(driveErr: any\) \{.*?\}\s*\}', re.DOTALL)
content = drive_copy_pattern.sub('', content)

# Remove ensureDriveFolder, uploadFileToDrive, getDriveFiles imports or definitions if any
content = re.sub(r'import \{.*?drive.*?\} from .*?;\n', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

