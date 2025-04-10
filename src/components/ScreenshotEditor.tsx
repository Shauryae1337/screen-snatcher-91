
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Screenshot } from "@/models/Screenshot";
import { toast } from "sonner";
import {
  Download,
  Circle,
  Square,
  Type,
  Highlighter,
  Pencil,
  Eraser,
  ArrowLeft,
  Undo,
  Redo,
} from "lucide-react";

interface ScreenshotEditorProps {
  screenshot: Screenshot;
  onSave: (editedImage: string) => void;
  onBack: () => void;
}

type DrawingTool = "pencil" | "highlighter" | "rectangle" | "circle" | "text" | "eraser";

interface TextInput {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  isEditing: boolean;
}

const ScreenshotEditor = ({ screenshot, onSave, onBack }: ScreenshotEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("pencil");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [color, setColor] = useState("#ff3300");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [textInput, setTextInput] = useState<TextInput | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Store the loaded image to avoid reloading
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  useEffect(() => {
    loadImage();
  }, [screenshot.fullImage]);
  
  const loadImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    setIsImageLoaded(false);
    
    // Create and load the image
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = screenshot.fullImage;
    
    image.onload = () => {
      console.log("Image loaded successfully:", image.width, "x", image.height);
      
      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      
      // Store the initial state in history
      const initialState = canvas.toDataURL("image/png");
      setHistory([initialState]);
      setHistoryIndex(0);
      
      // Save the loaded image for later use
      imageRef.current = image;
      setIsImageLoaded(true);
    };
    
    image.onerror = (e) => {
      console.error("Error loading image:", e);
      toast.error("Failed to load the image. Please try again.");
    };
  };
  
  // Handle drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageLoaded) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    setStartPos({ x, y });
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (activeTool === "pencil" || activeTool === "highlighter") {
      ctx.globalAlpha = activeTool === "highlighter" ? 0.5 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === "text") {
      // Position the text input where the user clicked
      setTextInput({
        x,
        y,
        text: "",
        color,
        fontSize: strokeWidth * 5, // Scale fontSize based on strokeWidth
        isEditing: true
      });
      
      // Focus the text input on the next render
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 10);
      
      setIsDrawing(false);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isImageLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    if (activeTool === "pencil" || activeTool === "highlighter") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === "eraser") {
      const eraserSize = strokeWidth * 2;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, eraserSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (activeTool === "rectangle" || activeTool === "circle") {
      // For rectangle and circle, we'll preview them during drawing
      // First, restore the previous state
      const img = new Image();
      img.src = history[historyIndex];
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Then draw the shape
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      
      if (activeTool === "rectangle") {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (activeTool === "circle") {
        const radius = Math.sqrt(
          Math.pow(x - startPos.x, 2) + 
          Math.pow(y - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };
  
  const stopDrawing = () => {
    if (!isDrawing || !isImageLoaded) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Save to history if using a tool that modifies the canvas
    if (activeTool === "pencil" || activeTool === "highlighter" || 
        activeTool === "rectangle" || activeTool === "circle" || 
        activeTool === "eraser") {
      
      // Save the current state to history
      const newState = canvas.toDataURL("image/png");
      const newHistory = [...history.slice(0, historyIndex + 1), newState];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
  };
  
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (textInput) {
      setTextInput({...textInput, text: e.target.value});
    }
  };
  
  const handleTextInputBlur = () => {
    if (!textInput || !textInput.text.trim() || !isImageLoaded) {
      setTextInput(null);
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    // Draw the text on the canvas
    ctx.font = `${textInput.fontSize}px Arial`;
    ctx.fillStyle = textInput.color;
    ctx.fillText(textInput.text, textInput.x, textInput.y);
    
    // Save to history
    const newState = canvas.toDataURL("image/png");
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Clear the text input
    setTextInput(null);
  };
  
  const handleTextInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextInputBlur();
    }
  };
  
  const undo = () => {
    if (historyIndex > 0 && isImageLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      const img = new Image();
      img.src = history[newIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1 && isImageLoaded) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      const img = new Image();
      img.src = history[newIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageLoaded) return;
    
    const editedImage = canvas.toDataURL("image/png");
    onSave(editedImage);
    toast.success("Edit saved");
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !isImageLoaded) return;
    
    const editedImage = canvas.toDataURL("image/png");
    
    const link = document.createElement("a");
    link.href = editedImage;
    link.download = `${screenshot.domain}-edited-${screenshot.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded");
  };
  
  const colorOptions = [
    "#ff3300",
    "#ff9900",
    "#ffff00",
    "#33cc33",
    "#3399ff",
    "#9933ff",
    "#ffffff",
    "#000000",
  ];
  
  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1 backdrop-blur-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Gallery</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={undo}
            disabled={historyIndex <= 0 || !isImageLoaded}
            className="backdrop-blur-sm"
          >
            <Undo size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={redo}
            disabled={historyIndex >= history.length - 1 || !isImageLoaded}
            className="backdrop-blur-sm"
          >
            <Redo size={16} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
            disabled={!isImageLoaded}
            className="backdrop-blur-sm"
          >
            <Download size={16} />
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="bg-highlight hover:bg-highlight/80"
            onClick={handleSave}
            disabled={!isImageLoaded}
          >
            Save Edit
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-auto glass-card p-4 flex md:flex-col gap-4 justify-between">
          <div className="flex md:flex-col gap-2">
            <Button
              variant={activeTool === "pencil" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("pencil")}
              className={activeTool === "pencil" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Pencil size={16} />
            </Button>
            <Button
              variant={activeTool === "highlighter" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("highlighter")}
              className={activeTool === "highlighter" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Highlighter size={16} />
            </Button>
            <Button
              variant={activeTool === "rectangle" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("rectangle")}
              className={activeTool === "rectangle" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Square size={16} />
            </Button>
            <Button
              variant={activeTool === "circle" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("circle")}
              className={activeTool === "circle" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Circle size={16} />
            </Button>
            <Button
              variant={activeTool === "text" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("text")}
              className={activeTool === "text" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Type size={16} />
            </Button>
            <Button
              variant={activeTool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() => setActiveTool("eraser")}
              className={activeTool === "eraser" ? "bg-highlight hover:bg-highlight/80" : "backdrop-blur-sm"}
            >
              <Eraser size={16} />
            </Button>
          </div>
          
          <div className="space-y-4 w-full md:w-auto">
            <div className="space-y-2">
              <label className="text-xs block">Brush Size</label>
              <Slider
                value={[strokeWidth]}
                min={1}
                max={20}
                step={1}
                onValueChange={(values) => setStrokeWidth(values[0])}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs block">Color</label>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    className={`w-6 h-6 rounded-full ${
                      color === c ? "ring-2 ring-white" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-lg overflow-hidden max-w-full bg-black/20 relative">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin h-8 w-8 border-4 border-highlight border-t-transparent rounded-full" />
            </div>
          )}
          <div className="overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="max-w-full"
            />
            
            {textInput && textInput.isEditing && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${(textInput.x / (canvasRef.current?.width || 1)) * 100}%`,
                  top: `${(textInput.y / (canvasRef.current?.height || 1)) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  className="glass-card border border-highlight rounded px-2 py-1"
                  value={textInput.text}
                  onChange={handleTextInputChange}
                  onBlur={handleTextInputBlur}
                  onKeyDown={handleTextInputKeyDown}
                  style={{ color: textInput.color }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotEditor;
