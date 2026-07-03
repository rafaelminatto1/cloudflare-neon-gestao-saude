import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove Google Drive UI block
# Search for: {/* Google Drive Automation Integration Block */}
# And the closing </div>
block_start = content.find('{/* Google Drive Automation Integration Block */}')
if block_start != -1:
    # Find the previous <div> that wraps it
    prev_div = content.rfind('<div', 0, block_start)
    # Find the closing </div> of that div
    # It's a bit tricky with nested divs, let's just use regex for the whole block
    
    # Alternatively, just remove the specific block by strings
    # We know it starts at "          {/* Google Drive Automation Integration Block */}"
    # and ends at some point. Let's find exactly what to remove.
    pass

# Actually, I can use regex to replace specific functions and strings.
# Remove `let pdfStoragePath = await uploadPDF(file, user.id);`
content = re.sub(r'let pdfStoragePath = await uploadPDF\(file, user\.id\);\s*addToast\(\'Processando documento com Inteligência Artificial.*?\', \'info\'\);', r"addToast('Processando documento com Inteligência Artificial, isso pode levar alguns segundos...', 'info');", content, flags=re.DOTALL)

# In the response handling, data.pdfStoragePath comes from /api/parse-pdf
# So when adding exams, we need to pass data.pdfStoragePath.
# Let's find where exams are processed.
content = re.sub(r'const newExams = data\.exams\.map\(\(ex: any\) => \(\{\n\s*\.\.\.ex,', r'const newExams = data.exams.map((ex: any) => ({\n              ...ex,\n              pdfStoragePath: data.pdfStoragePath,', content)

# Let's remove the "Cloudflare copy" and "Google Drive (Não Categorizados)" block
# from `if (data.exams.length === 0)`
empty_exams_block = re.search(r'// Cloudflare copy.*?await loadQueue\(\);', content, re.DOTALL)
if empty_exams_block:
    content = content.replace(empty_exams_block.group(0), 'await removeDocumentFromQueue(queueId);\n            await loadQueue();')

# Remove the copy block at the end of success processing
success_copy_block = re.search(r'// Make a physical copy.*?loadQueue\(\);', content, re.DOTALL)
if success_copy_block:
    content = content.replace(success_copy_block.group(0), 'await removeDocumentFromQueue(queueId);\n            await loadQueue();')

with open('src/App.tsx', 'w') as f:
    f.write(content)

