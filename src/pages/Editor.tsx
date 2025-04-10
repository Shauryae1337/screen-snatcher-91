
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ScreenshotEditor from "@/components/ScreenshotEditor";
import { Screenshot } from "@/models/Screenshot";
import { toast } from "sonner";
import { getScreenshotById, updateScreenshot } from "@/utils/screenshotStorage";

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no ID is provided, redirect to gallery
    if (!id) {
      navigate("/gallery");
      return;
    }

    setIsLoading(true);
    
    // Try to get the screenshot from localStorage
    const foundScreenshot = getScreenshotById(id);
    
    if (foundScreenshot) {
      setScreenshot(foundScreenshot);
    } else {
      toast.error("Screenshot not found");
      navigate("/gallery");
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
    
    // Update the screenshot in storage
    updateScreenshot(updatedScreenshot);
    toast.success("Edit saved successfully");
  };

  const handleBack = () => {
    navigate("/gallery");
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
              onClick={() => navigate("/gallery")}
              className="text-highlight hover:underline"
            >
              Return to Gallery
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Editor;
