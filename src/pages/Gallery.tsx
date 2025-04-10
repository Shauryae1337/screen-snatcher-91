
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { Screenshot } from "@/models/Screenshot";
import { loadScreenshots, deleteScreenshot } from "@/utils/screenshotStorage";
import { toast } from "sonner";

const Gallery = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load screenshots from storage
    setIsLoading(true);
    const storedScreenshots = loadScreenshots();
    setScreenshots(storedScreenshots);
    setIsLoading(false);
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
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-highlight border-t-transparent rounded-full" />
              </div>
            ) : (
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
