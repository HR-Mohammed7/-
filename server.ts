import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, history, customApiKey, attachment, attachmentType, image } = req.body;
      const apiKey = customApiKey || process.env.GEMINI_API_KEY;
      
      // Handle legacy "image" payload if any, but prefer attachment
      const activeAttachment = attachment || (image ? image.data : null);
      const activeMimeType = attachmentType || (image ? image.mimeType : null);

      if (!apiKey) {
        return res.status(500).json({ error: 'لم يتم العثور على مفتاح API. يرجى إضافته في إعدادات البيئة (GEMINI_API_KEY) أو عبر واجهة التطبيق.' });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      let contractContext = '';
      try {
        contractContext = fs.readFileSync(path.join(process.cwd(), 'contract-context.md'), 'utf-8');
      } catch (err) {
        console.warn('Contract context file not found, using empty context.');
      }

      const systemInstruction = `أنت مساعد ذكي ونظام خبير بعقد "التحول الذكي بالشبكة الكهربائية" في محافظة واسط لتوزيع الكهرباء.
لديك دراية كاملة وشاملة بجميع بنود العقد وتفاصيله المرفقة أدناه، بالإضافة إلى قدرتك على تحليل المستندات المرفقة (مثل PDF أو الصور) ومطابقتها مع روح العقد.

--- بداية تفاصيل العقد المرجعي ---
${contractContext}
--- نهاية تفاصيل العقد المرجعي ---

تعليمات هامة للاستجابة:
1. أجب على أسئلة المستخدم المختصة بهذا العقد بدقة، وبناءً على المعلومات المرفقة أعلاه والمستندات التي يرفعها المستخدم (إن وجدت).
2. عند قيام المستخدم برفع ملف PDF أو صورة لمستند، قم بقراءته بدقة وربطه ببنود العقد المرجعي لتوضيح أي تعارض أو توافق أو شرح للفقرات.
3. إذا سألك المستخدم عن معلومات دقيقة (مثل أرقام نسب، غرامات، أو ساعات العمل)، قم بذكرها بالتفصيل. 
4. في حال كان السؤال متعلقاً ببنود متعددة أو يحتاج توضيحاً طويلاً، اعرض الإجابة على شكل نقاط (Bullet points) بشكل مهني ومرتب وواضح.
5. إجاباتك يجب أن تكون باللغة العربية، واحرص على استخدام أسلوب رسمي ومفيد للموظفين أو المستثمرين.
6. لا تقم بالاجتهاد من خارج نطاق العقد المرجعي والمستندات المرفقة؛ إذا كان السؤال خارج نطاق العقد المرجعي ولم يتوفر في المرفقات، أبلغه بذلك.
7. اذكر مرجع البند أو الملحق إذا كان ذلك مناسباً لتعزيز الثقة في الإجابة.`;

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
        }
      });

      res.json({ text: response.text });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
