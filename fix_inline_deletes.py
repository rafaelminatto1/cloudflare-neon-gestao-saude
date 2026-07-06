import re

with open("worker/index.ts", "r") as f:
    content = f.read()

pattern = re.compile(r"(await db\.delete\((schema\.\w+)\)\.where\(and\(eq\(\2\.id, c\.req\.param\('id'\)\), eq\(\2\.userId, userId\)\)\);) (return c\.json\(\{ success: true \}\);)")

# Use a replacement function to log which ones get replaced (optional, but re.sub is fine)
new_content = pattern.sub(r"\1 await invalidateCache(c, userId); \3", content)

with open("worker/index.ts", "w") as f:
    f.write(new_content)

print("Inline deletes fixed!")
