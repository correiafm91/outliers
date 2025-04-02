
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="text-8xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          We couldn't find the page you're looking for.
        </p>
        <img 
          src="https://i.postimg.cc/yd1dNnBH/High-resolution-stock-photo-A-professional-commercial-image-showcasing-a-grey-letter-O-logo-agains.jpg" 
          alt="Outliers Logo" 
          className="h-24 w-24 object-contain mx-auto mb-8"
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/blogs">Browse Articles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
