
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import UrlInput from "@/components/UrlInput";
import ScreenshotGallery from "@/components/ScreenshotGallery";
import { Screenshot, captureScreenshot } from "@/models/Screenshot";
import { loadScreenshots, saveScreenshots } from "@/utils/screenshotStorage";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const navigate = useNavigate();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [captureProgress, setCaptureProgress] = useState(0);

  // Load screenshots from localStorage on initial render with a slight delay to show loading state
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const storedScreenshots = loadScreenshots();
      setScreenshots(storedScreenshots);
      setIsInitialLoading(false);
    };
    loadData();
  }, []);

  // Update localStorage whenever screenshots change
  useEffect(() => {
    saveScreenshots(screenshots);
  }, [screenshots]);

  const handleCaptureScreenshots = async (urls: string[]) => {
    setIsLoading(true);
    setCaptureProgress(0);
    
    try {
      toast.info(`Capturing ${urls.length} screenshot${urls.length > 1 ? 's' : ''}...`);
      
      const capturedScreenshots: Screenshot[] = [];
      const totalUrls = urls.length;
      
      // Process URLs sequentially to avoid overwhelming the system
      for (let i = 0; i < totalUrls; i++) {
        const url = urls[i];
        try {
          // Update progress
          setCaptureProgress(Math.round((i / totalUrls) * 100));
          
          const screenshot = await captureScreenshot(url);
          capturedScreenshots.push(screenshot);
          
          // Notification for each successful capture
          toast.success(`Captured: ${screenshot.domain}`);
          
          // Update progress again after successful capture
          setCaptureProgress(Math.round(((i + 1) / totalUrls) * 100));
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
      setCaptureProgress(100);
      // Reset progress after a short delay
      setTimeout(() => setCaptureProgress(0), 1000);
    }
  };

  const handleDeleteScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((screenshot) => screenshot.id !== id));
    toast.success("Screenshot deleted");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background backdrop-blur-sm">
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
            
            {isLoading && captureProgress > 0 && (
              <div className="mt-6 glass-card p-4 animate-fade-in">
                <p className="text-sm text-muted-foreground mb-2">Capturing screenshots: {captureProgress}%</p>
                <Progress value={captureProgress} className="h-2" />
              </div>
            )}
          </section>
          
          <section>
            {isInitialLoading ? (
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

export default Index;
