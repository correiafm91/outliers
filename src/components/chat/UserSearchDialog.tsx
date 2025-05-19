
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/profile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, UserPlus } from 'lucide-react';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: Profile) => void;
}

export function UserSearchDialog({ open, onOpenChange, onSelectUser }: UserSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && searchQuery) {
      searchUsers();
    }
  }, [searchQuery, open]);

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user?.id || '')
        .limit(10);

      if (error) throw error;

      setUsers(data as Profile[]);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (selectedUser: Profile) => {
    onSelectUser(selectedUser);
    onOpenChange(false);
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar usuários..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-1 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className="w-full justify-start px-2 py-6"
                onClick={() => handleSelectUser(user)}
              >
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage src={user.avatar_url || ''} alt={user.username} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.username}</span>
                <UserPlus className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            ))
          ) : searchQuery ? (
            <p className="text-center text-muted-foreground p-4">
              Nenhum usuário encontrado
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
