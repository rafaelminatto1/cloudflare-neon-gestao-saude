import re

with open("worker/index.ts", "r") as f:
    content = f.read()

# 1. Add AI Gateway semantic caching options to AI.run calls
content = content.replace(
    """        const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 }, {
          gateway: {
            id: "gestao-saude-gateway"
          }
        });""",
    """        let aiResponse;
        try {
          aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096 }, {
            gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
          });
        } catch (e) {
          console.warn("LLaMA 70b failed, trying 8b fallback", e);
          aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 4096 }, {
            gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
          });
        }"""
)

content = content.replace(
    """       const aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { 
         messages, 
         max_tokens: 4096, 
         stream: true 
       }, {
         gateway: {
           id: "gestao-saude-gateway"
         }
       }) as AsyncGenerator<any>;""",
    """       let aiResponse;
       try {
         aiResponse = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', { messages, max_tokens: 4096, stream: true }, {
           gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
         }) as AsyncGenerator<any>;
       } catch (e) {
         console.warn("LLaMA 70b failed for chat, trying 8b fallback", e);
         aiResponse = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 4096, stream: true }, {
           gateway: { id: "gestao-saude-gateway", skipCache: false, cacheTtl: 86400 * 30 }
         }) as AsyncGenerator<any>;
       }"""
)


# 2. Add KV Edge Caching for all-data
old_all_data = """app.get('/api/all-data/:userId', async (c) => {
  try {
    const db = getDb(c);
    const requestedUserId = c.req.param('userId');
    const userId = getScopedUserId(c, requestedUserId);
    const [
      records, appointments, pathologies, medications, orders, events, docs
    ] = await Promise.all([
      db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.userId, userId)),
      db.select().from(schema.medicalAppointments).where(eq(schema.medicalAppointments.userId, userId)),
      db.select().from(schema.userPathologies).where(eq(schema.userPathologies.userId, userId)),
      db.select().from(schema.continuousMedications).where(eq(schema.continuousMedications.userId, userId)),
      db.select().from(schema.examOrders).where(eq(schema.examOrders.userId, userId)),
      db.select().from(schema.customTimelineEvents).where(eq(schema.customTimelineEvents.userId, userId)),
      db.select().from(schema.doctors).where(eq(schema.doctors.userId, userId)),
    ]);
    return c.json({
      exams: records,
      appointments,
      pathologies,
      medications,
      examOrders: orders,
      timelineEvents: events,
      doctors: docs
    });
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});"""

new_all_data = """app.get('/api/all-data/:userId', async (c) => {
  try {
    const requestedUserId = c.req.param('userId');
    const userId = getScopedUserId(c, requestedUserId);
    
    // Check KV Cache First
    const cachedData = await c.env.GESTAO_SAUDE_KV.get(`cache:alldata:${userId}`);
    if (cachedData) {
      return c.json(JSON.parse(cachedData));
    }

    const db = getDb(c);
    const [
      records, appointments, pathologies, medications, orders, events, docs
    ] = await Promise.all([
      db.select().from(schema.medicalRecords).where(eq(schema.medicalRecords.userId, userId)),
      db.select().from(schema.medicalAppointments).where(eq(schema.medicalAppointments.userId, userId)),
      db.select().from(schema.userPathologies).where(eq(schema.userPathologies.userId, userId)),
      db.select().from(schema.continuousMedications).where(eq(schema.continuousMedications.userId, userId)),
      db.select().from(schema.examOrders).where(eq(schema.examOrders.userId, userId)),
      db.select().from(schema.customTimelineEvents).where(eq(schema.customTimelineEvents.userId, userId)),
      db.select().from(schema.doctors).where(eq(schema.doctors.userId, userId)),
    ]);
    
    const responseData = {
      exams: records,
      appointments,
      pathologies,
      medications,
      examOrders: orders,
      timelineEvents: events,
      doctors: docs
    };

    // Save to KV Cache (expires in 1 hour if not invalidated manually)
    await c.env.GESTAO_SAUDE_KV.put(`cache:alldata:${userId}`, JSON.stringify(responseData), { expirationTtl: 3600 });

    return c.json(responseData);
  } catch (err: any) { return c.json({ error: err.message }, 500); }
});"""

content = content.replace(old_all_data, new_all_data)


# 3. Add Cache Invalidation function
cache_invalidation_fn = """
const invalidateCache = async (c: any, userId: string) => {
  try {
    await c.env.GESTAO_SAUDE_KV.delete(`cache:alldata:${userId}`);
  } catch(e) { console.error("Cache invalidation failed", e); }
};
"""
content = content.replace("const getScopedUserId = (c: any, requestedUserId?: string) => {", cache_invalidation_fn + "\nconst getScopedUserId = (c: any, requestedUserId?: string) => {")

# 4. Inject cache invalidation into all mutating endpoints
endpoints = [
  "app.post('/api/save-exams'",
  "app.delete('/api/exams/:id'",
  "app.put('/api/exams/:id'",
  "app.post('/api/delete-exams-batch'",
  "app.post('/api/rename-source'",
  "app.post('/api/doctors'",
  "app.delete('/api/doctors/:id'",
  "app.post('/api/appointments'",
  "app.delete('/api/appointments/:id'",
  "app.post('/api/pathologies'",
  "app.delete('/api/pathologies/:id'",
  "app.post('/api/medications'",
  "app.delete('/api/medications/:id'",
  "app.post('/api/exam-orders'",
  "app.delete('/api/exam-orders/:id'",
  "app.post('/api/timeline-events'",
  "app.delete('/api/timeline-events/:id'"
]

for endpoint in endpoints:
    # Use regex to find `return c.json({ success: true... });` and insert `await invalidateCache(c, userId);` before it
    # We must ensure `userId` is available in scope. All these routes define `userId`.
    pattern = re.compile(re.escape(endpoint) + r".*?(return c\.json\(\{ success: true.*?\}\);)", re.DOTALL)
    match = pattern.search(content)
    if match:
        original_return = match.group(1)
        new_return = "await invalidateCache(c, userId);\n    " + original_return
        content = content.replace(match.group(0), match.group(0).replace(original_return, new_return))

with open("worker/index.ts", "w") as f:
    f.write(content)

print("worker patched for KV cache, invalidation, AI fallbacks and gateway semantics.")
