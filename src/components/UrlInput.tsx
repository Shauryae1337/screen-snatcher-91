
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { LinkIcon, ListIcon, Camera } from "lucide-react";

interface UrlInputProps {
  onCapture: (urls: string[]) => void;
  isLoading: boolean;
}

const UrlInput = ({ onCapture, isLoading }: UrlInputProps) => {
  const [singleUrl, setSingleUrl] = useState("");
  const [multipleUrls, setMultipleUrls] = useState("");

  const handleSingleCapture = () => {
    if (!singleUrl) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      const url = formatUrl(singleUrl);
      onCapture([url]);
    } catch (error) {
      toast.error("Invalid URL format");
    }
  };

  const handleMultipleCapture = () => {
    if (!multipleUrls) {
      toast.error("Please enter URLs");
      return;
    }

    try {
      const urls = multipleUrls
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(formatUrl);

      if (urls.length === 0) {
        toast.error("No valid URLs found");
        return;
      }

      onCapture(urls);
    } catch (error) {
      toast.error("Invalid URL format");
    }
  };

  const formatUrl = (url: string): string => {
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="dark-card p-6 w-full max-w-3xl animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Capture Screenshots</h2>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <LinkIcon size={16} />
            <span>Single URL</span>
          </TabsTrigger>
          <TabsTrigger value="multiple" className="flex items-center gap-2">
            <ListIcon size={16} />
            <span>Multiple URLs</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="single-url" className="text-sm text-muted-foreground">
              Enter Website URL
            </label>
            <Input
              id="single-url"
              placeholder="https://example.com"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="bg-secondary/50"
            />
          </div>
          
          <Button 
            onClick={handleSingleCapture} 
            disabled={isLoading || !singleUrl}
            className="w-full bg-highlight hover:bg-highlight/80 text-primary-foreground"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Capturing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera size={16} />
                <span>Capture Screenshot</span>
              </div>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="multiple" className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="multiple-urls" className="text-sm text-muted-foreground">
              Enter URLs (one per line)
            </label>
            <Textarea
              id="multiple-urls"
              placeholder="https://example.com&#10;https://example.org&#10;example.net"
              value={multipleUrls}
              onChange={(e) => setMultipleUrls(e.target.value)}
              rows={5}
              className="min-h-32 bg-secondary/50"
            />
          </div>
          
          <Button 
            onClick={handleMultipleCapture} 
            disabled={isLoading || !multipleUrls}
            className="w-full bg-highlight hover:bg-highlight/80 text-primary-foreground"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Capturing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera size={16} />
                <span>Capture Screenshots</span>
              </div>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UrlInput;
