
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface SendMessageButtonProps {
  userId: string;
  username?: string;
  className?: string;
}

export function SendMessageButton({ userId, username, className }: SendMessageButtonProps) {
  const handleClick = () => {
    // Don't allow messaging any users
    toast.info("Não é possível enviar mensagens para outros usuários");
  };

  // Don't show button for Outliers profile or any other profile
  return null;
}
