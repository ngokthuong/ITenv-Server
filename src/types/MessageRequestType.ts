export type MessageRequestType = {
  _id: string;
  conversationId?: string;
  receiver?: string;
  hasFile: boolean;
  hasText: boolean;
  content?: string;
  file?: string;
  fileUrl: string[];
  parentMessage?: string;
};
