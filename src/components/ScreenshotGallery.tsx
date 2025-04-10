
import { useState } from "react";
import { Link } from "react-router-dom";
import { Screenshot } from "@/models/Screenshot";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Pencil, Trash } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  onDelete: (id: string) => void;
}

const ScreenshotGallery = ({ screenshots, onDelete }: ScreenshotGalleryProps) => {
  if (screenshots.length === 0) {
    return (
      <div className="w-full text-center p-8 glass-card animate-fade-in">
        <h3 className="text-xl font-medium mb-2">No Screenshots Yet</h3>
        <p className="text-muted-foreground">
          Enter a URL above to capture your first screenshot
        </p>
      </div>
    );
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 300 && statusCode < 400) return "bg-yellow-500";
    if (statusCode >= 400) return "bg-red-500";
    return "bg-gray-500";
  };

  const handleDownload = (screenshot: Screenshot) => {
    // In a real app, this would download the actual image
    const link = document.createElement("a");
    link.href = screenshot.fullImage;
    link.download = `${screenshot.domain}-${screenshot.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Screenshot downloaded");
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Screenshots ({screenshots.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screenshots.map((screenshot) => (
          <Card 
            key={screenshot.id} 
            className="glass-card overflow-hidden animate-slide-in hover:border-highlight/50 transition-all"
          >
            <div className="relative aspect-video overflow-hidden group">
              <img
                src={screenshot.thumbnail}
                alt={screenshot.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2">
                <Badge 
                  className={`${getStatusColor(screenshot.statusCode)} text-white`}
                >
                  {screenshot.statusCode}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-medium truncate" title={screenshot.title}>
                {screenshot.title || "Untitled"}
              </h3>
              <a 
                href={screenshot.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground flex items-center gap-1 mt-1 hover:text-highlight transition-colors"
              >
                <span className="truncate">{screenshot.domain}</span>
                <ExternalLink size={12} />
              </a>
            </CardContent>
            
            <CardFooter className="p-4 pt-0 flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 backdrop-blur-sm"
                onClick={() => handleDownload(screenshot)}
              >
                <Download size={16} className="mr-1" />
                <span>Download</span>
              </Button>
              
              <Link 
                to={`/editor/${screenshot.id}`} 
                className="flex-1"
              >
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-highlight hover:bg-highlight/80"
                >
                  <Pencil size={16} className="mr-1" />
                  <span>Edit</span>
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-transparent">
                    <Trash size={16} className="text-red-500" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Screenshot</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this screenshot? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-secondary/80 text-foreground backdrop-blur-sm">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => onDelete(screenshot.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotGallery;
