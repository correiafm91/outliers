
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  sector: string | null;
  created_at: string;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  is_verified?: boolean;
  banner_url?: string | null;
  followers_count?: number;
  following_count?: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  video_url: string | null;
  sector: string | null;
  created_at: string;
  updated_at: string | null;
  published: boolean;
  author_id: string;
  aspect_ratio?: string; // Field to handle image aspect ratio
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article: Article;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower_profile?: Profile;
  following_profile?: Profile;
}
