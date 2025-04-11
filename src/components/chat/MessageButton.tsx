
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";

interface MessageButtonProps {
  userId: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  setDrawerOpen: (open: boolean) => void;
}

export default function MessageButton({
  userId,
  variant = "outline",
  size = "default",
  className = "",
  setDrawerOpen
}: MessageButtonProps) {
  const { startConversation } = useChat();

  const handleClick = async () => {
    const conversationId = await startConversation(userId);
    if (conversationId) {
      setDrawerOpen(true);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Mensagem
    </Button>
  );
}
