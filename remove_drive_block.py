import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove the block starting with {/* Google Drive Automation Integration Block */}
# until the end of its div.
# We will use regex to find this entire block.
pattern = re.compile(r'\s*\{/\* Google Drive Automation Integration Block \*/\}.*?(?=\n\s*\{/\* Filter Tags \*/\}|\n\s*<div className="grid)', re.DOTALL)
content = pattern.sub('', content)

# Remove any state or functions related to drive
content = re.sub(r'const \[hasDriveAccess, setHasDriveAccess\] = useState.*?;\n', '', content)
content = re.sub(r'const connectDrive = \(\) => \{.*?\};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const disconnectDrive = \(\) => \{.*?\};\n', '', content, flags=re.DOTALL)
content = re.sub(r'const \[isSyncingDrive, setIsSyncingDrive\] = useState.*?;\n', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

