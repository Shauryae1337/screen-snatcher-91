
import { Github } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-highlight">
            screensht.io
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-highlight transition-colors">
            Home
          </Link>
          <Link to="/gallery" className="text-sm font-medium hover:text-highlight transition-colors">
            Gallery
          </Link>
          <Link to="/editor" className="text-sm font-medium hover:text-highlight transition-colors">
            Editor
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="GitHub Repository"
          >
            <Github size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
