
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

// Mock API function to simulate capturing a screenshot
export const captureScreenshot = async (url: string): Promise<Screenshot> => {
  // In a real application, this would call a backend API
  // For demo purposes, we're simulating a delay and returning mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      const urlObj = new URL(url);
      
      // Generate a random success or error status code
      const statusCodes = [200, 200, 200, 200, 200, 404, 500, 301, 302];
      const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
      
      // Generate a random title
      const titles = [
        `${urlObj.hostname} - Home Page`,
        `Welcome to ${urlObj.hostname}`,
        `${urlObj.hostname.charAt(0).toUpperCase() + urlObj.hostname.slice(1)} - Official Website`,
        `${urlObj.hostname} - Dashboard`,
        `${urlObj.hostname} - Not Found`,
      ];
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      // For demo, use placeholder images
      // In a real app, these would be actual screenshots
      const placeholderImage = `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/1280/800`;
      
      resolve({
        id: Math.random().toString(36).substring(2, 15),
        url: url,
        domain: urlObj.hostname,
        title: title,
        statusCode: statusCode,
        thumbnail: placeholderImage,
        fullImage: placeholderImage,
        capturedAt: new Date(),
      });
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
  });
};
