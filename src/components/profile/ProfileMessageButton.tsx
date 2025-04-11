
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ChatDrawer from "@/components/chat/ChatDrawer";
import MessageButton from "@/components/chat/MessageButton";

interface ProfileMessageButtonProps {
  userId: string;
}

export default function ProfileMessageButton({ userId }: ProfileMessageButtonProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  
  // Don't show message button on own profile
  if (!user || user.id === userId) {
    return null;
  }
  
  return (
    <>
      <MessageButton 
        userId={userId} 
        setDrawerOpen={setDrawerOpen} 
      />
      <ChatDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </>
  );
}
