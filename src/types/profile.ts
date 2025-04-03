
// Define tipos para serem usados em ProfilePage e outros componentes
export type SectorType = 
  | "technology" 
  | "marketing" 
  | "gastronomy" 
  | "education" 
  | "finance" 
  | "health" 
  | "sports" 
  | "entertainment" 
  | "other";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  sector: SectorType | string;
  bio?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  sector: SectorType | string;
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
  type: 'like' | 'comment' | 'follow';
  article_id?: string | null;
  read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article?: Article;
}
