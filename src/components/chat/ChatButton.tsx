
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

interface ChatButtonProps {
  onClick: () => void;
}

export default function ChatButton({ onClick }: ChatButtonProps) {
  const { unreadCount } = useChat();
  const [isAnimating, setIsAnimating] = useState(false);

  // Add animation effect when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [unreadCount]);
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="relative"
    >
      <MessageSquare className={`h-5 w-5 ${isAnimating ? 'animate-bounce' : ''}`} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 ${isAnimating ? 'opacity-75' : 'opacity-0'}`}></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 items-center justify-center text-[10px] text-white font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </Button>
  );
}
