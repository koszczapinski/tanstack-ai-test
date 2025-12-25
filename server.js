import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { stream } from 'hono/streaming'
import dotenv from 'dotenv'
import { chat } from '@tanstack/ai'
import { createOpenaiChat } from '@tanstack/ai-openai'

dotenv.config()

const app = new Hono()

app.use('/*', cors())

app.post('/api/chat', async (c) => {
  try {
    const { messages } = await c.req.json()

    if (!messages) {
      return c.json({ error: 'Messages are required' }, 400)
    }

    const model = c.req.query('model') || 'gpt-4o'

    const chatStream = chat({
      adapter: createOpenaiChat(model, process.env.OPENAI_API_KEY),
      messages,
    })

    return stream(c, async (stream) => {
      // Set the content type explicitly to match what the client likely expects for a stream
      c.header('Content-Type', 'application/json')

      for await (const chunk of chatStream) {
        await stream.write(JSON.stringify(chunk) + '\n')
      }
    })
  } catch (error) {
    console.error('Chat error:', error)
    return c.json({ error: error.message }, 500)
  }
})

const port = 3000
console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
