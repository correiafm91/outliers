
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
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  sector: string | null;
  created_at: string;
  updated_at: string | null;
  published: boolean;
  author_id: string;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article: Article;
}
