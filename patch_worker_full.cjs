const fs = require('fs');
let content = fs.readFileSync('worker/index.ts', 'utf-8');

// Replace the entire auth block with a complete bypass
const authStart = "const authHeader = c.req.header('Authorization');";
const authEnd = "} catch (err: any) {\n    console.error('JWT Verification Error:', err);\n    return c.json({ error: 'Unauthorized', details: err.message }, 401);\n  }";

const startIndex = content.indexOf(authStart);
const endIndex = content.indexOf(authEnd) + authEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + "c.set('userId', 'mock-user');\n  await next();" + content.slice(endIndex);
  fs.writeFileSync('worker/index.ts', content);
  console.log("Full auth bypass applied");
} else {
  console.log("Could not find auth block");
}
