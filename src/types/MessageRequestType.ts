export type MessageRequestType = {
  conversationId?: string;
  receiver?: string;
  hasFile: boolean;
  hasText: boolean;
  content?: string;
  file?: string;
  parentMessage?: string;
};
