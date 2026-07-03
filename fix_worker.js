import fs from 'fs';

let content = fs.readFileSync('worker/index.ts', 'utf-8');

// Replace all `const { ..., userId } = await c.req.json();`
// with checking against c.get('userId')
content = content.replace(/const { (.+?), userId } = await c.req.json\(\);/g, "const { $1, userId } = await c.req.json();\n    if (userId !== c.get('userId')) return c.json({ error: 'Forbidden' }, 403);");

content = content.replace(/const userId = c.req.param\('userId'\);/g, "const userId = c.req.param('userId');\n    if (userId !== c.get('userId')) return c.json({ error: 'Forbidden' }, 403);");

fs.writeFileSync('worker/index.ts', content);
console.log('worker/index.ts updated');
