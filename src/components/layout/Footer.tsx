
import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/yd1dNnBH/High-resolution-stock-photo-A-professional-commercial-image-showcasing-a-grey-letter-O-logo-agains.jpg" 
                alt="Outliers Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-bold">Outliers</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Onde os insights de negócios encontram o excepcional. Mantenha-se à frente com análises de ponta e perspectivas do setor.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Navegação</h3>
            <nav className="mt-4 flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Início</Link>
              <Link to="/blogs" className="text-sm text-muted-foreground hover:text-foreground">Artigos</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">Sobre</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Redes Sociais</h3>
            <div className="mt-4 flex space-x-4">
              <a 
                href="https://www.instagram.com/outliersbrs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://x.com/Outliersofc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Outliers. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
