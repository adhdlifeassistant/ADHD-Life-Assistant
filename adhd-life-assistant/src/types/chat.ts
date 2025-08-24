import { MoodType } from './mood';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mood?: MoodType;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
  mood: MoodType;
}

export interface ChatState {
  currentConversation: ChatConversation | null;
  conversations: ChatConversation[];
  isLoading: boolean;
  error: string | null;
}

export interface SendMessageRequest {
  message: string;
  mood: MoodType;
  conversationId?: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversationId: string;
}