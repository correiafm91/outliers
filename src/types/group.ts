
import { Profile } from "@/types/profile";

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  owner_id: string;
  type: 'public' | 'private';
  member_count: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  role?: MemberRole;
  has_pending_request?: boolean;
  owner?: Profile;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile: Profile;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  article_id: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender: Profile;
  shared_article?: any;
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  sender?: Profile;
  receiver?: Profile;
}

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profile: Profile;
}

export interface ChatConversation {
  profile: Profile;
  last_message: DirectMessage | null;
  unread_count: number;
}
