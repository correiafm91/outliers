
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Search, Plus, Filter, Loader2, Lock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Group } from "@/types/group";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { Badge } from "@/components/ui/badge";

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, [user, filter]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('groups').select(`
        *,
        owner:owner_id(id, username, avatar_url)
      `);
      
      if (filter === "my") {
        if (!user) {
          setGroups([]);
          setLoading(false);
          return;
        }
        
        // Fetch groups where user is a member
        const { data: memberGroups, error: memberError } = await supabase
          .from('group_members')
          .select('group_id, role')
          .eq('user_id', user.id);
          
        if (memberError) throw memberError;
        
        if (memberGroups && memberGroups.length > 0) {
          const groupIds = memberGroups.map(m => m.group_id);
          query = query.in('id', groupIds);
        } else {
          setGroups([]);
          setLoading(false);
          return;
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        let enhancedGroups = data as Group[];
        
        if (user) {
          // Check membership for each group
          const { data: memberships, error: membershipError } = await supabase
            .from('group_members')
            .select('group_id, role')
            .eq('user_id', user.id)
            .in('group_id', enhancedGroups.map(g => g.id));
            
          if (!membershipError && memberships) {
            const membershipMap = new Map(memberships.map(m => [m.group_id, m.role]));
            
            enhancedGroups = enhancedGroups.map(group => ({
              ...group,
              is_member: membershipMap.has(group.id),
              role: membershipMap.get(group.id) as any
            }));
          }
          
          // Check pending join requests
          const { data: requests, error: requestError } = await supabase
            .from('group_join_requests')
            .select('group_id')
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .in('group_id', enhancedGroups.map(g => g.id));
            
          if (!requestError && requests) {
            const requestsMap = new Set(requests.map(r => r.group_id));
            
            enhancedGroups = enhancedGroups.map(group => ({
              ...group,
              has_pending_request: requestsMap.has(group.id)
            }));
          }
        }
        
        setGroups(enhancedGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Falha ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (group: Group) => {
    if (!user) {
      toast.error('Faça login para entrar em um grupo');
      navigate('/auth');
      return;
    }
    
    try {
      if (group.type === 'public') {
        // Join public group directly
        const { error } = await supabase.from('group_members').insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member'
        });
        
        if (error) throw error;
        
        toast.success(`Você entrou no grupo ${group.name}`);
        fetchGroups();
      } else {
        // Create a join request for private group
        const { error } = await supabase.from('group_join_requests').insert({
          group_id: group.id,
          user_id: user.id
        });
        
        if (error) throw error;
        
        toast.success(`Solicitação enviada para ${group.name}`);
        fetchGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Falha ao entrar no grupo');
    }
  };

  // Filter groups based on search query
  const filteredGroups = groups.filter(group => {
    return group.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Grupos</h1>
            <p className="text-muted-foreground mt-2">
              Explore e participe de grupos para se conectar com outros usuários
            </p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setOpenCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Criar Grupo
          </Button>
        </div>
        
        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar grupos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select defaultValue="all" value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os grupos</SelectItem>
              <SelectItem value="my">Meus grupos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Groups list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl truncate">{group.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1.5">
                        {group.type === 'public' ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" /> 
                            Público
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" />
                            Privado
                          </Badge>
                        )}
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {group.member_count}
                        </Badge>
                      </div>
                    </div>
                    {group.image_url ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={group.image_url} alt={group.name} />
                        <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="line-clamp-3">
                    {group.description || "Sem descrição"}
                  </CardDescription>
                  {group.owner && (
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={group.owner.avatar_url || ''} alt={group.owner.username} />
                        <AvatarFallback>{group.owner.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        Criado por {group.owner.username}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {group.is_member ? (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      Entrar no Grupo
                    </Button>
                  ) : group.has_pending_request ? (
                    <Button variant="outline" disabled className="w-full">
                      Solicitação enviada
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleJoinGroup(group)}
                    >
                      {group.type === 'public' ? 'Entrar' : 'Solicitar Entrada'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground mt-2">
              {filter === "my" 
                ? "Você ainda não participa de nenhum grupo" 
                : "Não encontramos grupos com esses critérios"}
            </p>
            {filter === "my" && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFilter("all")}
              >
                Ver todos os grupos
              </Button>
            )}
          </div>
        )}
      </main>
      
      <CreateGroupDialog 
        open={openCreateDialog} 
        onOpenChange={setOpenCreateDialog}
        onGroupCreated={fetchGroups}
      />
      
      <Footer />
    </div>
  );
}
