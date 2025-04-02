
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
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
              Where business insights meet the exceptional. Stay ahead with cutting-edge analysis and industry perspectives.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Navigation</h3>
            <nav className="mt-4 flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link to="/blogs" className="text-sm text-muted-foreground hover:text-foreground">Blogs</Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-foreground">Categories</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Legal</h3>
            <nav className="mt-4 flex flex-col space-y-2">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
              <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</Link>
            </nav>
          </div>
          <div>
            <h3 className="text-lg font-medium">Subscribe</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Stay updated with our latest insights and analysis.
            </p>
            <form className="mt-4 flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-l-md border border-border bg-secondary px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Outliers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
