export type Section = 'dashboard' | 'contract' | 'obligations' | 'financials' | 'chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachment?: string; // Base64 or Data URL of the attached file
  attachmentType?: string; // mimeType of the attachment
}
