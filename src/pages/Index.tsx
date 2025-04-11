
import { NavbarWithChat } from "@/components/layout/NavbarWithChat";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Network, Layers, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarWithChat transparent />
      
      <main className="flex-1">
        {/* Hero section */}
        <section className="relative bg-gradient-to-b from-blue-50 via-blue-100 to-white dark:from-gray-900 dark:via-gray-800 dark:to-background py-20 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Conectando profissionais e ideias
              </h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Uma plataforma de networking onde profissionais compartilham conhecimento, criam conexões e encontram oportunidades.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link to="/blogs">Explorar conteúdo</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to="/auth?register=true">Criar conta</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Features section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Feito para profissionais como você
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Descubra as ferramentas que vão impulsionar sua carreira e seus negócios
              </p>
            </div>
            
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="bg-card rounded-lg p-8 shadow-sm border flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Network className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">Networking Eficiente</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Conecte-se com profissionais do seu setor e expanda sua rede de contatos de forma significativa.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-8 shadow-sm border flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">Compartilhe Conhecimento</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Publique artigos, dicas e insights do seu setor para estabelecer sua autoridade profissional.
                </p>
              </div>
              
              <div className="bg-card rounded-lg p-8 shadow-sm border flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-3">Ambiente Profissional</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Um espaço dedicado exclusivamente para assuntos profissionais e empresariais.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Comece sua jornada hoje</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Junte-se a milhares de profissionais que já estão conectados e expandindo seus negócios.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/auth?register=true">
                Criar uma conta <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © 2025 Networking Brasil. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <Link to="/blogs" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                Explorar
              </Link>
              <Link to="/auth" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                Entrar
              </Link>
              <Link to="/auth?register=true" className="text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
