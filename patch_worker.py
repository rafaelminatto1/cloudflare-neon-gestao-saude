import re

with open("worker/index.ts", "r") as f:
    content = f.read()

content = content.replace(
    "return c.json({ success: true, jobId: fileId, status: 'processing' });",
    "return c.json({ success: true, taskId: fileId, status: 'processing' });"
)

content = content.replace(
    "app.get('/api/job-status/:jobId', async (c) => {",
    "app.get('/api/task-status/:taskId', async (c) => {"
)

content = content.replace(
    "const jobId = c.req.param('jobId');",
    "const jobId = c.req.param('taskId');"
)

# And make sure the status returned is compatible. The frontend checks:
# if (statusData.status === "completed") { data = { exams: statusData.result }; break; }
# Let's fix the queue consumer to write { status: 'completed', result: parsedJson.exams }

content = content.replace(
    "await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'done', data: parsedJson }));",
    "await env.GESTAO_SAUDE_KV.put(`job:${fileId}`, JSON.stringify({ status: 'completed', result: parsedJson.exams }));"
)

with open("worker/index.ts", "w") as f:
    f.write(content)

print("worker patched for taskId and completed status")
