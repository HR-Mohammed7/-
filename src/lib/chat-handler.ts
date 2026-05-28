import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export async function handleChatMessage(reqBody: any, envApiKey?: string) {
  const { message, history, customApiKey, attachment, attachmentType } = reqBody;
  const apiKey = customApiKey || envApiKey;

  if (!apiKey) {
    throw new Error('لم يتم العثور على مفتاح API. يرجى إضافته في إعدادات البيئة (GEMINI_API_KEY) أو عبر واجهة التطبيق.');
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
    // Note: On Vercel, files are sometimes in different relative paths. 
    // We try to find context-context.md in the root.
    const contextPath = path.join(process.cwd(), 'contract-context.md');
    if (fs.existsSync(contextPath)) {
      contractContext = fs.readFileSync(contextPath, 'utf-8');
    }
  } catch (err) {
    console.warn('Contract context file not found.');
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
  if (attachment && attachmentType) {
    currentParts.push({
      inlineData: {
        data: attachment,
        mimeType: attachmentType
      }
    });
  }

  const contents = [
    ...formattedHistory,
    { role: 'user', parts: currentParts }
  ];

  const modelName = 'gemini-3.5-flash';

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text;
}
