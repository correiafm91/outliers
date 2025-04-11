
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import ChatDrawer from "@/components/chat/ChatDrawer";
import ChatButton from "@/components/chat/ChatButton";
import { useAuth } from "@/contexts/AuthContext";

export function NavbarWithChat({ transparent = false }: { transparent?: boolean }) {
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Navbar 
        transparent={transparent} 
        chatButton={
          user && <ChatButton onClick={() => setChatDrawerOpen(true)} />
        }
      />
      
      {user && (
        <ChatDrawer 
          open={chatDrawerOpen} 
          onClose={() => setChatDrawerOpen(false)} 
        />
      )}
    </>
  );
}
