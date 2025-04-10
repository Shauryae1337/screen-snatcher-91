
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UrlInput from "@/components/UrlInput";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { Screenshot, captureScreenshot } from "@/models/Screenshot";
import { loadScreenshots, saveScreenshots } from "@/utils/screenshotStorage";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load screenshots from localStorage on initial render
  useEffect(() => {
    const storedScreenshots = loadScreenshots();
    setScreenshots(storedScreenshots);
  }, []);

  // Update localStorage whenever screenshots change
  useEffect(() => {
    saveScreenshots(screenshots);
  }, [screenshots]);

  const handleCaptureScreenshots = async (urls: string[]) => {
    setIsLoading(true);
    try {
      toast.info(`Capturing ${urls.length} screenshot${urls.length > 1 ? 's' : ''}...`);
      
      const capturedScreenshots: Screenshot[] = [];
      
      // Process URLs sequentially to avoid overwhelming the system
      for (const url of urls) {
        try {
          const screenshot = await captureScreenshot(url);
          capturedScreenshots.push(screenshot);
          
          // Notification for each successful capture
          toast.success(`Captured: ${screenshot.domain}`);
        } catch (error) {
          toast.error(`Failed to capture: ${url}`);
        }
      }
      
      // Update screenshots state
      setScreenshots((prev) => [...capturedScreenshots, ...prev]);
      
      // Success message
      if (capturedScreenshots.length > 0) {
        toast.success(`Successfully captured ${capturedScreenshots.length} screenshot${capturedScreenshots.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error("An error occurred while capturing screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((screenshot) => screenshot.id !== id));
    toast.success("Screenshot deleted");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <section className="mb-12">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-4xl font-bold mb-3 text-highlight">
                Capture Website Screenshots
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter a URL or a list of URLs to capture screenshots.
                View, edit, and download them from your personal gallery.
              </p>
            </div>
            
            <UrlInput 
              onCapture={handleCaptureScreenshots}
              isLoading={isLoading}
            />
          </section>
          
          <section>
            <ScreenshotGallery 
              screenshots={screenshots}
              onDelete={handleDeleteScreenshot}
            />
          </section>
        </div>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} screensht.io. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
