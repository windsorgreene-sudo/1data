import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import PageTransition from "@/components/PageTransition";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-8xl font-bold bg-text-gradient bg-clip-text text-transparent mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">Oops! Page not found</p>
          <Button asChild className="bg-gradient-primary hover:shadow-glow">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
