
import { useState } from "react";
import { Link } from "react-router-dom";
import { Screenshot } from "@/models/Screenshot";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Pencil, Trash, ZoomIn, X, Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [zoomImageLoading, setZoomImageLoading] = useState(false);

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

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const handleZoomImage = (imageUrl: string) => {
    setZoomImageLoading(true);
    setZoomedImage(imageUrl);
  };

  const handleZoomedImageLoad = () => {
    setZoomImageLoading(false);
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
            <div 
              className="relative aspect-video overflow-hidden group cursor-pointer"
              onClick={() => handleZoomImage(screenshot.fullImage)}
            >
              {!loadedImages[screenshot.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
                  <div className="animate-spin h-6 w-6 border-2 border-highlight border-t-transparent rounded-full" />
                </div>
              )}
              <img
                src={screenshot.thumbnail}
                alt={screenshot.title}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${loadedImages[screenshot.id] ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => handleImageLoad(screenshot.id)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white h-8 w-8" />
              </div>
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
                <AlertDialogContent className="glass-card border-border fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-auto">
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

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] overflow-auto glass-card animate-scale-in">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Loading spinner while image loads */}
            {zoomImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader className="h-10 w-10 text-highlight animate-spin" />
              </div>
            )}
            
            <img 
              src={zoomedImage} 
              alt="Zoomed screenshot" 
              className="max-w-full max-h-[90vh] object-contain"
              onLoad={handleZoomedImageLoad}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGallery;
