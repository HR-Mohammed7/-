import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { handleChat } from './src/lib/gemini';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const text = await handleChat(req.body);
      res.json({ text });
    } catch (error: any) {
      console.error('Chat API Error:', error.message || error);
      let errMsg = error.message || 'عذراً، حدث خطأ أثناء الاتصال بالخادم.';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
           errMsg = parsed.error.message;
        }
      } catch (e) {}
      res.status(500).json({ error: errMsg });
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

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  return app;
}

export const appPromise = startServer();
