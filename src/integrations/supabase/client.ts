
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
    
    // Store buckets creation promises
    const createBucketsPromises = [];
    
    if (!profilesBucketExists) {
      createBucketsPromises.push(createBucket('profiles', 5));
    }
    
    if (!imagesBucketExists) {
      createBucketsPromises.push(createBucket('images', 10));
    }
    
    if (!videosBucketExists) {
      createBucketsPromises.push(createBucket('videos', 30));
    }
    
    // Execute all bucket creation operations
    if (createBucketsPromises.length > 0) {
      await Promise.allSettled(createBucketsPromises);
    }
  } catch (error) {
    console.error("Error setting up storage buckets:", error);
  }
};

// Helper function to create a bucket with the specified size limit in MB
const createBucket = async (name: string, sizeLimit: number) => {
  try {
    const { error } = await supabase.storage.createBucket(name, { 
      public: true,
      fileSizeLimit: sizeLimit * 1024 * 1024 // Convert MB to bytes
    });
    
    if (error) {
      console.error(`Error creating ${name} bucket:`, error.message);
      return false;
    }
    
    console.log(`Created ${name} storage bucket`);
    return true;
  } catch (error) {
    console.error(`Error creating ${name} bucket:`, error);
    return false;
  }
};

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

// Function to check if a bucket exists and is accessible
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error(`Error checking if bucket ${bucketName} exists:`, error.message);
      return false;
    }
    
    return buckets.some(bucket => bucket.name === bucketName);
  } catch (error) {
    console.error(`Error checking if bucket ${bucketName} exists:`, error);
    return false;
  }
};

// Call this function when the client is first imported
ensureStorageBuckets();

// Call this function when the client is first imported
ensureUniqueConstraints();
