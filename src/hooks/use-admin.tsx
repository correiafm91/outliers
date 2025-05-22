
import { useAuth } from "@/contexts/AuthContext";

export function useAdmin() {
  const { user, profile } = useAuth();
  
  // Only consider the Outliers Ofc official profile as admin
  const isAdmin = Boolean(user && profile?.username === "Outliers Ofc");
  
  return { isAdmin };
}
