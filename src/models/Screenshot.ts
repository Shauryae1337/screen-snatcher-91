
// Screenshot interface definition
export interface Screenshot {
  id: string;
  url: string;
  domain: string;
  title: string;
  statusCode: number;
  thumbnail: string;
  fullImage: string;
  editedImage?: string;
  capturedAt: Date;
}

// Free screenshot API service
const SCREENSHOT_API_BASE = "https://api.screenshotmachine.com";
const API_KEY = "e74979"; // API key as provided by the user

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
    
    // Improved status code detection with proper error handling
    let statusCode = 200;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      clearTimeout(timeoutId);
      statusCode = response.status;
    } catch (error) {
      console.error("Error fetching status code:", error);
      // Only set 404 if it's a network error, not a timeout or CORS issue
      if (error instanceof TypeError && error.message.includes("networkerror")) {
        statusCode = 404;
      }
    }
    
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
