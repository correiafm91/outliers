
// Define types to be used in ProfilePage and other components
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  sector: string;
  bio?: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  sector: string;
  author_id: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  article_id?: string;
  read: boolean;
  created_at: string;
  actor?: Profile;
}
