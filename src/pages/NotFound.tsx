
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mb-6 text-manufacturing-blue">
          <Boxes size={64} className="mx-auto" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-muted-foreground mb-8">
          The page at <code className="bg-muted px-1 py-0.5 rounded">{location.pathname}</code>{" "}
          doesn't exist or may have been moved.
        </p>
        <Button asChild size="lg">
          <Link to="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
