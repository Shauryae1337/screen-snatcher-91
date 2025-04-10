
import { Screenshot } from "@/models/Screenshot";

// Key for localStorage
const STORAGE_KEY = "screensht_io_screenshots";

// Load screenshots from localStorage
export const loadScreenshots = (): Screenshot[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    
    // Convert date strings back to Date objects
    return parsedData.map((screenshot: any) => ({
      ...screenshot,
      capturedAt: new Date(screenshot.capturedAt),
    }));
  } catch (error) {
    console.error("Error loading screenshots:", error);
    return [];
  }
};

// Save screenshots to localStorage
export const saveScreenshots = (screenshots: Screenshot[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(screenshots));
  } catch (error) {
    console.error("Error saving screenshots:", error);
  }
};

// Add a single screenshot
export const addScreenshot = (screenshot: Screenshot): void => {
  const screenshots = loadScreenshots();
  saveScreenshots([screenshot, ...screenshots]);
};

// Delete a screenshot by ID
export const deleteScreenshot = (id: string): void => {
  const screenshots = loadScreenshots();
  const updatedScreenshots = screenshots.filter((s) => s.id !== id);
  saveScreenshots(updatedScreenshots);
};

// Update a screenshot
export const updateScreenshot = (updatedScreenshot: Screenshot): void => {
  const screenshots = loadScreenshots();
  const updatedScreenshots = screenshots.map((s) => 
    s.id === updatedScreenshot.id ? updatedScreenshot : s
  );
  saveScreenshots(updatedScreenshots);
};

// Get a screenshot by ID
export const getScreenshotById = (id: string): Screenshot | null => {
  const screenshots = loadScreenshots();
  return screenshots.find((s) => s.id === id) || null;
};
