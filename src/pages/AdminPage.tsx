import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, FileEdit, Settings, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { toast } from "sonner";

export default function AdminPage() {
  const { user, profile } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      toast.error("Você precisa estar logado para acessar o painel de administração");
      navigate("/auth");
      return;
    }
    
    if (!isAdmin) {
      toast.error("Você não tem permissão para acessar o painel de administração");
      navigate("/");
      return;
    }
  }, [user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="mb-8">
          <h1 className="heading-lg mb-2">Painel de Administração</h1>
          <p className="text-muted-foreground">Gerencie o conteúdo e configurações do blog</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5" />
                Novo Artigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Criar um novo artigo para o blog</p>
              <Button asChild>
                <Link to="/admin/new-article">Criar Artigo</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileEdit className="h-5 w-5" />
                Gerenciar Artigos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Editar ou excluir artigos existentes</p>
              <Button asChild variant="outline">
                <Link to="/blog">Ver Todos os Artigos</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gerenciamento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Gerenciar contas de usuários</p>
              <Button asChild variant="outline" disabled>
                <Link to="#">Em Breve</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Blog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Configurar o blog</p>
              <Button asChild variant="outline" disabled>
                <Link to="#">Em Breve</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
