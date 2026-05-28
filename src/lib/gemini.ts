import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export async function handleChat(payload: any) {
  const { message, history, customApiKey, attachment, attachmentType, image } = payload;
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  
  const activeAttachment = attachment || (image ? image.data : null);
  const activeMimeType = attachmentType || (image ? image.mimeType : null);

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // In Vercel, the file might be in a different relative location
  const findContractContext = () => {
    const paths = [
      path.join(process.cwd(), 'contract-context.md'),
      path.join(process.cwd(), '..', 'contract-context.md'),
      path.join(__dirname, '..', '..', 'contract-context.md')
    ];
    for (const p of paths) {
      if (fs.existsSync(p)) return fs.readFileSync(p, 'utf-8');
    }
    return 'لم يتم العثور على سياق العقد المرجعي.';
  };

  const contractContext = findContractContext();

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

  return response.text;
}
