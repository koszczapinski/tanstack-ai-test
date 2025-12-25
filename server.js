import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chat } from '@tanstack/ai';
import { createOpenaiChat } from '@tanstack/ai-openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const stream = chat({
      adapter: createOpenaiChat('gpt-4o', process.env.OPENAI_API_KEY),
      messages,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of stream) {
      res.write(JSON.stringify(chunk) + '\n');
    }
    
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    // If headers sent, we can't send status
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
        res.end();
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
