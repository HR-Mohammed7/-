import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import { handleChatMessage } from './src/lib/chat-handler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const text = await handleChatMessage(req.body, process.env.GEMINI_API_KEY);
      res.json({ text });
    } catch (error: any) {
      console.error('Chat API Error:', error.message || error);
      res.status(500).json({ error: error.message || 'عذراً، حدث خطأ أثناء الاتصال بالخادم.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
