import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  try {
    const { message, history, customApiKey, attachment, attachmentType } = req.body;
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set.' });
    }

    let contractContext = '';
    try {
      const paths = [
        path.join(process.cwd(), 'contract-context.md'),
        path.join(__dirname, '..', 'contract-context.md'),
        path.join('/var/task', 'contract-context.md')
      ];
      
      for (const p of paths) {
        if (fs.existsSync(p)) {
          contractContext = fs.readFileSync(p, 'utf-8');
          break;
        }
      }
    } catch (err) {}

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `أنت مساعد ذكي ونظام خبير بعقد "التحول الذكي بالشبكة الكهربائية" في محافظة واسط لتوزيع الكهرباء.
لديك دراية كاملة وشاملة بجميع بنود العقد وتفاصيله المرفقة أدناه.

${contractContext}

تعليمات:
1. أجب بدقة وباللغة العربية.
2. استخدم النقاط للتوضيح.`;

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [{ text: message || "حلل المستند" }];
    if (attachment && attachmentType) {
      currentParts.push({
        inlineData: {
          data: attachment,
          mimeType: attachmentType
        }
      });
    }

    const result = await ai.models.generateContentStream({
      model: 'gemini-flash-latest',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction,
      }
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    for await (const chunk of result) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();
  } catch (error: any) {
    console.error('AI Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Error communicating with AI' });
    } else {
      res.end();
    }
  }
}
