
import { Profile } from "./profile";

export type GroupType = 'public' | 'private';
export type MemberRole = 'member' | 'admin' | 'owner';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  type: GroupType;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  member_count: number;
  owner?: Profile;
  is_member?: boolean;
  role?: MemberRole;
  has_pending_request?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile?: Profile;
}

export interface JoinRequest {
  id: string;
  group_id: string;
  user_id: string;
  status: JoinRequestStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
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
  sender?: Profile;
  reactions?: GroupMessageReaction[];
  shared_article?: {
    id: string;
    title: string;
    image_url: string | null;
  };
}

export interface GroupMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  type: string;
  created_at: string;
  profile?: Profile;
}
