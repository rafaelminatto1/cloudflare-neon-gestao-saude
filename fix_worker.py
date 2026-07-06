import re

with open("worker/index.ts", "r") as f:
    content = f.read()

# Fix the early returns that were broken
content = content.replace(
    "if (!examIds || !examIds.length) await invalidateCache(c, userId);\n    return c.json({ success: true });",
    "if (!examIds || !examIds.length) return c.json({ success: true });"
)

# And now inject invalidateCache right before the final success returns for each route
# Actually, the original replacement just matched `return c.json({ success: true...`
# Which caught the first one it found.
# Let's revert all `await invalidateCache(c, userId);\n    return c.json({` to `return c.json({` and inject them properly.

content = content.replace("await invalidateCache(c, userId);\n    return c.json({", "return c.json({")
content = content.replace("await invalidateCache(c, userId);\n      return c.json({", "return c.json({")
content = content.replace("await invalidateCache(c, userId);\n return c.json({", "return c.json({")

# Now inject them properly using regex that looks for `await db.insert(...)` or `await db.update(...)` or `await db.delete(...)` followed by the return statement

patterns = [
    r"(await db\.(?:insert|update|delete)\([^\)]+\)\.?(?:values|where|set)?\(.*?\);)\n(\s*return c\.json\(\{ success: true)",
]

for p in patterns:
    content = re.sub(p, r"\1\n    await invalidateCache(c, userId);\n\2", content)

with open("worker/index.ts", "w") as f:
    f.write(content)

print("worker fixed!")
