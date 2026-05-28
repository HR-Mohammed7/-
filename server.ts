import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

const contractContext = fs.readFileSync(path.join(process.cwd(), 'contract-context.md'), 'utf-8');

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, customApiKey, attachment, attachmentType, image } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      
      // Handle legacy "image" payload if any, but prefer attachment
      const activeAttachment = attachment || (image ? image.data : null);
      const activeMimeType = attachmentType || (image ? image.mimeType : null);

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set in environment variables.' });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `أنت مساعد ذكي ونظام خبير بعقد "التحول الذكي بالشبكة الكهربائية" في محافظة واسط لتوزيع الكهرباء.
لديك دراية كاملة وشاملة بجميع بنود العقد وتفاصيله المرفقة أدناه، بالإضافة إلى قدرتك على تحليل المستندات المرفقة (مثل PDF أو الصور) ومطابقتها مع روح العقد.

--- بداية تفاصيل العقد المرجعي ---
${contractContext}
--- نهاية تفاصيل العقد المرجعي ---

تعليمات هامة للاستجابة:
1. ابدأ الإجابة مباشرة وباللغة العربية لتجنب انقطاع الحل بسبب قيود وقت الخادم.
2. أجب بدقة بناءً على العقد المرفق أعلاه والمستندات المرفقة فقط.
3. استخدم النقاط (Bullet points) لعرض البنود الطويلة بشكل مهني ومختصر.
4. اذكر المعلومات الدقيقة (نسب، غرامات) بوضوح تام.
5. لا تقم بالاجتهاد من خارج نطاق العقد المرفق.
6. اذكر رقم البند إذا كان ذلك مساعداً.`;

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const currentParts: any[] = [{ text: message || "قم بتحليل هذا المستند المرفق في سياق العقد." }];
      if (activeAttachment && activeMimeType) {
        currentParts.push({
          inlineData: {
            data: activeAttachment,
            mimeType: activeMimeType
          }
        });
      }

      const contents = [
        ...formattedHistory,
        { role: 'user', parts: currentParts }
      ];

      // Use streaming to prevent timeouts on systems like Vercel
      const result = await ai.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction,
        }
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      for await (const chunk of result) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      
      res.end();
    } catch (error: any) {
      console.error('Chat API Error:', error.message || error);
      let errMsg = error.message || 'عذراً، حدث خطأ أثناء الاتصال بالخادم.';
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed.error && parsed.error.message) {
           errMsg = parsed.error.message;
        }
      } catch (e) {}
      
      if (!res.headersSent) {
        res.status(500).json({ error: errMsg });
      } else {
        res.write(`\n[ERROR]: ${errMsg}`);
        res.end();
      }
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
