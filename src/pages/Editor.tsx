
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScreenshotEditor from "@/components/ScreenshotEditor";
import { Screenshot } from "@/models/Screenshot";
import { toast } from "sonner";

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API or local storage
    // Here we'll simulate loading and check localStorage
    setIsLoading(true);
    
    // Try to get the screenshot from localStorage
    const storedScreenshots = localStorage.getItem("screenshots");
    if (storedScreenshots) {
      try {
        const parsedScreenshots: Screenshot[] = JSON.parse(storedScreenshots);
        const foundScreenshot = parsedScreenshots.find((s) => s.id === id);
        
        if (foundScreenshot) {
          setScreenshot(foundScreenshot);
        } else {
          toast.error("Screenshot not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error parsing stored screenshots:", error);
        toast.error("Error loading screenshot");
      }
    } else {
      // For demo purposes, create a mock screenshot if none exists
      const mockScreenshot: Screenshot = {
        id: id || "demo",
        url: "https://example.com",
        domain: "example.com",
        title: "Example Website",
        statusCode: 200,
        thumbnail: "https://picsum.photos/seed/example/1280/800",
        fullImage: "https://picsum.photos/seed/example/1280/800",
        capturedAt: new Date(),
      };
      
      setScreenshot(mockScreenshot);
    }
    
    setIsLoading(false);
  }, [id, navigate]);

  const handleSaveEdit = (editedImage: string) => {
    if (!screenshot) return;
    
    // Update the screenshot with the edited image
    const updatedScreenshot = {
      ...screenshot,
      editedImage,
    };
    
    setScreenshot(updatedScreenshot);
    
    // In a real app, you would save this to the backend/localStorage
    // For demo, let's update localStorage if it exists
    const storedScreenshots = localStorage.getItem("screenshots");
    if (storedScreenshots) {
      try {
        const parsedScreenshots: Screenshot[] = JSON.parse(storedScreenshots);
        const updatedScreenshots = parsedScreenshots.map((s) =>
          s.id === id ? updatedScreenshot : s
        );
        
        localStorage.setItem("screenshots", JSON.stringify(updatedScreenshots));
      } catch (error) {
        console.error("Error updating stored screenshots:", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto pt-24 pb-12 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-highlight border-t-transparent rounded-full" />
          </div>
        ) : screenshot ? (
          <ScreenshotEditor
            screenshot={screenshot}
            onSave={handleSaveEdit}
            onBack={handleBack}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Screenshot Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The screenshot you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-highlight hover:underline"
            >
              Return to Home
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Editor;
