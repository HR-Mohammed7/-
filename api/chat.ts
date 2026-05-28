import { handleChatMessage } from '../src/lib/chat-handler';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const text = await handleChatMessage(req.body, process.env.GEMINI_API_KEY);
    res.status(200).json({ text });
  } catch (error: any) {
    console.error('In-function error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
