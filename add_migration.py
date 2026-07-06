import json

with open('wrangler.jsonc', 'r') as f:
    content = f.read()

# find the last closing brace and insert before it
# or just parse jsonc... Wait, it's jsonc, let's use regex.
import re
new_content = re.sub(r'}\s*$', ',\n\t"migrations": [\n\t\t{\n\t\t\t"tag": "v1",\n\t\t\t"deleted_classes": ["HealthApiContainer"]\n\t\t}\n\t]\n}', content)

with open('wrangler.jsonc', 'w') as f:
    f.write(new_content)

print("Migration added.")
