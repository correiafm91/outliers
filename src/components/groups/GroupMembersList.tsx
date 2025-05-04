
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, MoreHorizontal, Shield, Crown, UserMinus } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Group, GroupMember } from '@/types/group';
import { toast } from 'sonner';

interface GroupMembersListProps {
  members: GroupMember[];
  group: Group;
  onMemberUpdated: () => void;
  currentUserId: string;
}

export function GroupMembersList({ 
  members, 
  group, 
  onMemberUpdated,
  currentUserId 
}: GroupMembersListProps) {
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null);
  
  const isAdmin = group.role === 'admin' || group.role === 'owner';
  const isOwner = group.role === 'owner';
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="ml-2 bg-yellow-500"><Crown className="mr-1 h-3 w-3" /> Dono</Badge>;
      case 'admin':
        return <Badge className="ml-2 bg-blue-500"><Shield className="mr-1 h-3 w-3" /> Admin</Badge>;
      default:
        return null;
    }
  };
  
  const handlePromoteToAdmin = async (memberId: string) => {
    try {
      setProcessingMemberId(memberId);
      
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast.success('Membro promovido a administrador');
      onMemberUpdated();
    } catch (error) {
      console.error('Error promoting member:', error);
      toast.error('Erro ao promover membro');
    } finally {
      setProcessingMemberId(null);
    }
  };
  
  const handleDemoteToMember = async (memberId: string) => {
    try {
      setProcessingMemberId(memberId);
      
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'member' })
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast.success('Administrador rebaixado para membro');
      onMemberUpdated();
    } catch (error) {
      console.error('Error demoting admin:', error);
      toast.error('Erro ao rebaixar administrador');
    } finally {
      setProcessingMemberId(null);
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    // Confirm removal
    if (!window.confirm('Tem certeza que deseja remover este membro?')) {
      return;
    }
    
    try {
      setProcessingMemberId(memberId);
      
      const memberToRemove = members.find(m => m.id === memberId);
      if (!memberToRemove) return;
      
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      
      toast.success('Membro removido do grupo');
      onMemberUpdated();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Erro ao remover membro');
    } finally {
      setProcessingMemberId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Membros</h2>
      
      {members.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Nenhum membro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-3 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url || ''} alt={member.profile?.username || ''} />
                  <AvatarFallback>
                    {member.profile?.username.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium flex items-center">
                    {member.profile?.username || 'Usuário desconhecido'}
                    {getRoleBadge(member.role)}
                    {member.profile?.id === currentUserId && (
                      <Badge variant="outline" className="ml-2">Você</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entrou em {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {isAdmin && member.profile?.id !== currentUserId && (
                member.role !== 'owner' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={!!processingMemberId}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isOwner && member.role !== 'admin' && (
                        <DropdownMenuItem onClick={() => handlePromoteToAdmin(member.id)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Promover a admin
                        </DropdownMenuItem>
                      )}
                      {isOwner && member.role === 'admin' && (
                        <DropdownMenuItem onClick={() => handleDemoteToMember(member.id)}>
                          <User className="mr-2 h-4 w-4" />
                          Rebaixar para membro
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remover do grupo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
