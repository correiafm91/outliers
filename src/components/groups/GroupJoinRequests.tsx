
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { JoinRequest } from '@/types/group';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';

interface GroupJoinRequestsProps {
  groupId: string;
  onRequestProcessed: () => void;
}

export function GroupJoinRequests({ 
  groupId,
  onRequestProcessed
}: GroupJoinRequestsProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [groupId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          profile:profiles!user_id(id, username, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setRequests(data as unknown as JoinRequest[]);
      }
    } catch (error) {
      console.error('Error fetching join requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, approve: boolean) => {
    try {
      setProcessingId(requestId);
      
      const request = requests.find(r => r.id === requestId);
      if (!request) return;
      
      if (approve) {
        // Add user as a member
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: request.user_id,
            role: 'member'
          });
          
        if (memberError) throw memberError;
        
        // Update request status
        const { error: updateError } = await supabase
          .from('group_join_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);
          
        if (updateError) throw updateError;
        
        toast.success('Solicitação aprovada');
      } else {
        // Reject request
        const { error } = await supabase
          .from('group_join_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
          
        if (error) throw error;
        
        toast.success('Solicitação rejeitada');
      }
      
      // Refresh requests
      fetchRequests();
      
      // Update parent component
      onRequestProcessed();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <UserPlus className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Não há solicitações pendentes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div 
          key={request.id} 
          className="flex items-center justify-between p-3 rounded-md border"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.profile?.avatar_url || ''} alt={request.profile?.username || ''} />
              <AvatarFallback>
                {request.profile?.username?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">
                {request.profile?.username || 'Usuário desconhecido'}
              </div>
              <p className="text-xs text-muted-foreground">
                Solicitado em {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRequestAction(request.id, true)}
              disabled={processingId === request.id}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Aprovar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRequestAction(request.id, false)}
              disabled={processingId === request.id}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
