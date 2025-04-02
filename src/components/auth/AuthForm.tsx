
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [sector, setSector] = useState<string>("other");
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent, mode: "login" | "register") => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error("Nome de usuário é obrigatório");
        }
        await signUp(email, password, { username, sector });
      }
      navigate("/");
    } catch (error) {
      console.error("Erro de autenticação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sectors = [
    { value: "technology", label: "Tecnologia" },
    { value: "marketing", label: "Marketing" },
    { value: "gastronomy", label: "Gastronomia" },
    { value: "education", label: "Educação" },
    { value: "finance", label: "Finanças" },
    { value: "health", label: "Saúde" },
    { value: "sports", label: "Esportes" },
    { value: "entertainment", label: "Entretenimento" },
    { value: "other", label: "Outro" }
  ];

  return (
    <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-lg animate-fade-in">
      <Tabs defaultValue="login">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <img 
              src="https://i.postimg.cc/yd1dNnBH/High-resolution-stock-photo-A-professional-commercial-image-showcasing-a-grey-letter-O-logo-agains.jpg" 
              alt="Outliers Logo" 
              className="h-12 w-12 object-contain mx-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Outliers</CardTitle>
          <CardDescription className="text-center">
            Onde insights de negócios encontram o excepcional
          </CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Cadastro</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="space-y-4">
          <TabsContent value="login">
            <form onSubmit={(e) => handleSubmit(e, "login")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={(e) => handleSubmit(e, "register")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de usuário</Label>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="Seu nome de usuário" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Setor</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade do Outliers.
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
}
