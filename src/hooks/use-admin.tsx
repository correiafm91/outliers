
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user } = useAuth();
  
  // For simplicity, we'll consider all authenticated users as admins for now
  // In a production app, you'd check against a specific list of admin user IDs or roles
  const isAdmin = Boolean(user);
  
  return { isAdmin };
}
