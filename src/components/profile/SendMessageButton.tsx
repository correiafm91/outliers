
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SendMessageButtonProps {
  userId: string;
  username?: string;
  className?: string;
}

export function SendMessageButton({ userId, username, className }: SendMessageButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Don't allow messaging the Outliers profile
    if (username === "Outliers Ofc") {
      toast.info("Não é possível enviar mensagens para o perfil oficial Outliers");
      return;
    }
    
    navigate(`/chat/${userId}`);
  };

  // Don't show button for Outliers profile
  if (username === "Outliers Ofc") {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Enviar Mensagem
    </Button>
  );
}
