
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vymlknawpbghthzdzthf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bWxrbmF3cGJnaHRoemR6dGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTcxODAsImV4cCI6MjA1OTE3MzE4MH0.dIYYBRD7VLaz2j13RsKObQAru2DDG2zf64W5JVqAAzA";

// Workaround for TypeScript to recognize additional tables
type ExtendedDatabase = Database & {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string;
          type: string;
          article_id?: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id: string;
          type: string;
          article_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string;
          type?: string;
          article_id?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
      followers: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      saved_articles: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          sector: string | null;
          bio: string | null;
          instagram_url: string | null;
          youtube_url: string | null;
          linkedin_url: string | null;
          facebook_url: string | null;
          created_at: string;
          banner_url: string | null;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          sector?: string | null;
          bio?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          created_at?: string;
          banner_url?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          sector?: string | null;
          bio?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          linkedin_url?: string | null;
          facebook_url?: string | null;
          created_at?: string;
          banner_url?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          article_id: string;
          author_id: string;
          content: string;
          created_at: string;
          likes: number;
        };
        Insert: {
          id?: string;
          article_id: string;
          author_id: string;
          content: string;
          created_at?: string;
          likes?: number;
        };
        Update: {
          id?: string;
          article_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
          likes?: number;
        };
      };
      comment_likes: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          comment_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_url: string | null;
          video_url: string | null;
          aspect_ratio: string | null;
          sector: string;
          created_at: string;
          updated_at: string;
          author_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          image_url?: string | null;
          video_url?: string | null;
          aspect_ratio?: string | null;
          sector: string;
          created_at?: string;
          updated_at?: string;
          author_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          video_url?: string | null;
          aspect_ratio?: string | null;
          sector?: string;
          created_at?: string;
          updated_at?: string;
          author_id?: string;
        };
      };
    } & Database['public']['Tables'];
  };
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Create storage buckets if they don't exist
const ensureStorageBuckets = async () => {
  try {
    // Check if profiles bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error checking storage buckets:", error.message);
      return;
    }
    
    const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
    const imagesBucketExists = buckets.some(bucket => bucket.name === 'images');
    const videosBucketExists = buckets.some(bucket => bucket.name === 'videos');
    
    if (!profilesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('profiles', { 
        public: true,
        fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
      });
      
      if (createError) {
        console.error("Error creating profiles bucket:", createError.message);
      } else {
        console.log("Created profiles storage bucket");
        
        // Set public policy for the bucket - remove this code that's causing TypeScript errors
        // The old code that's causing problems:
        // const { error: policyError } = await supabase.storage.from('profiles').createSignedUrl('dummy.txt', 1);
        // if (policyError && !policyError.message.includes('Object not found')) {
        //   console.error("Error setting bucket policy:", policyError.message);
        // }
      }
    }
    
    if (!imagesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('images', { 
        public: true,
        fileSizeLimit: 10 * 1024 * 1024 // 10MB limit
      });
      
      if (createError) {
        console.error("Error creating images bucket:", createError.message);
      } else {
        console.log("Created images storage bucket");
      }
    }
    
    if (!videosBucketExists) {
      const { error: createError } = await supabase.storage.createBucket('videos', { 
        public: true,
        fileSizeLimit: 100 * 1024 * 1024 // 100MB limit
      });
      
      if (createError) {
        console.error("Error creating videos bucket:", createError.message);
      } else {
        console.log("Created videos storage bucket");
      }
    }
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
  }
};

// Call this function when the client is first imported
ensureStorageBuckets();

// Function to ensure unique constraints on likes table
const ensureUniqueConstraints = async () => {
  try {
    // Check if likes table has unique constraint
    const { error } = await supabase.rpc('check_likes_constraint');
    
    // If error, constraint might not exist, try to create it
    if (error) {
      console.log("Creating unique constraint for likes table...");
      await supabase.rpc('create_likes_constraint');
    }
  } catch (e) {
    console.error("Error ensuring unique constraints:", e);
  }
};

// Call this function when the client is first imported
ensureUniqueConstraints();
