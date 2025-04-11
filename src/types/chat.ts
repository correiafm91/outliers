
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    id: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  likes_count?: number;
  is_liked_by_me?: boolean;
  sender?: {
    username: string;
    avatar_url: string | null;
    id: string;
  };
}

export interface MessageLike {
  id: string;
  message_id: string;
  user_id: string;
  created_at: string;
}
