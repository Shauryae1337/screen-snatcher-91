import { Screenshot } from "@/models/Screenshot";

// Free screenshot API service
const SCREENSHOT_API_BASE = "https://api.screenshotmachine.com";
const API_KEY = "e74979"; // Updated API key as provided by the user

// Function to capture a real screenshot using Screenshot Machine API
export const captureScreenshot = async (url: string): Promise<Screenshot> => {
  try {
    // Format the URL if it doesn't include protocol
    if (!url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }
    
    // Create a URL object to extract the domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Generate a unique ID
    const id = Math.random().toString(36).substring(2, 15);
    
    // Create the screenshot URL with API parameters
    const screenshotUrl = `${SCREENSHOT_API_BASE}?key=${API_KEY}&url=${encodeURIComponent(url)}&dimension=1280x800&format=png&cacheLimit=0&delay=2000`;
    const thumbnailUrl = `${SCREENSHOT_API_BASE}?key=${API_KEY}&url=${encodeURIComponent(url)}&dimension=640x400&format=png&cacheLimit=0&delay=2000`;
    
    // Simulate a title fetch
    const response = await fetch(url, { method: 'HEAD' }).catch(() => ({ ok: false, status: 404 }));
    const statusCode = response.status || 200;
    
    // Create a best-effort title based on the domain
    const title = `${domain.charAt(0).toUpperCase() + domain.slice(1)} - Website`;
    
    return {
      id,
      url,
      domain,
      title,
      statusCode,
      thumbnail: thumbnailUrl,
      fullImage: screenshotUrl,
      capturedAt: new Date(),
    };
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    throw new Error("Failed to capture screenshot");
  }
};
