
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { Screenshot } from "@/models/Screenshot";
import { loadScreenshots, deleteScreenshot } from "@/utils/screenshotStorage";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const GallerySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, i) => (
      <div key={i} className="glass-card overflow-hidden animate-pulse">
        <Skeleton className="w-full aspect-video bg-white/5" />
        <div className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2 bg-white/5" />
          <Skeleton className="h-4 w-1/2 bg-white/5" />
        </div>
        <div className="p-4 pt-0 flex gap-2">
          <Skeleton className="h-9 flex-1 bg-white/5" />
          <Skeleton className="h-9 flex-1 bg-white/5" />
          <Skeleton className="h-9 w-9 bg-white/5 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const Gallery = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for better user experience with loaders
    const loadData = async () => {
      setIsLoading(true);
      // Small timeout to show loading state
      await new Promise(resolve => setTimeout(resolve, 800));
      const storedScreenshots = loadScreenshots();
      setScreenshots(storedScreenshots);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const handleDeleteScreenshot = (id: string) => {
    deleteScreenshot(id);
    setScreenshots((prev) => prev.filter((screenshot) => screenshot.id !== id));
    toast.success("Screenshot deleted");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background backdrop-blur-sm">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <section>
            <h1 className="text-4xl font-bold mb-6 text-highlight">Screenshot Gallery</h1>
            {isLoading ? <GallerySkeleton /> : (
              <ScreenshotGallery 
                screenshots={screenshots}
                onDelete={handleDeleteScreenshot}
              />
            )}
          </section>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border/30 backdrop-blur-md">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} screensht.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Gallery;
