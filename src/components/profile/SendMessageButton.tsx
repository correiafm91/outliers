
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SendMessageButtonProps {
  userId: string;
  className?: string;
}

export function SendMessageButton({ userId, className }: SendMessageButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/chat/${userId}`);
  };

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
