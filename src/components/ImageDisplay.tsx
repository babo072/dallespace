import { useState } from "react";
import { Download, Edit, Trash2, Copy, Undo2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ImageDisplayProps {
  imageUrl: string;
  prompt?: string;
  enhancedPrompt?: string;
  onEdit?: (prompt: string, imageUrl: string) => void;
  onDelete?: () => void;
}

export function ImageDisplay({ 
  imageUrl, 
  prompt = "", 
  enhancedPrompt,
  onEdit,
  onDelete
}: ImageDisplayProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const displayPrompt = enhancedPrompt || prompt;
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(displayPrompt);
    toast.success("Prompt copied to clipboard");
  };
  
  const handleDownload = async () => {
    try {
      // 웹사이트에서 직접 다운로드는 CORS 문제로 할 수 없으므로
      // 이미지를 새 탭에서 열어 사용자가 직접 저장하도록 안내
      window.open(imageUrl, '_blank');
      toast.success("Image opened in new tab. Right-click and select 'Save image as...' to download.");
    } catch (error) {
      console.error("Error opening image:", error);
      toast.error("Failed to open image");
    }
  };
  
  const handleEditClick = () => {
    setEditPrompt(displayPrompt);
    setIsDialogOpen(true);
  };
  
  const handleEditSubmit = () => {
    if (onEdit && editPrompt.trim()) {
      onEdit(editPrompt, imageUrl);
      setIsDialogOpen(false);
    }
  };
  
  const handleImageError = () => {
    console.error("Failed to load image:", imageUrl);
    setImgError(true);
  };
  
  return (
    <Card className="overflow-hidden w-full max-w-sm">
      <CardContent className="p-0 relative">
        <div className="relative aspect-square">
          {!imgError ? (
            <img
              src={imageUrl}
              alt={displayPrompt.substring(0, 50) + "..."}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">이미지를 불러올 수 없습니다</p>
              </div>
            </div>
          )}
        </div>
        
        {showPrompt && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm overflow-y-auto max-h-[40%]">
            <p>{displayPrompt}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between p-2">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowPrompt(!showPrompt)}
            title={showPrompt ? "Hide prompt" : "Show prompt"}
          >
            {showPrompt ? <Undo2 className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCopyPrompt}
            title="Copy prompt"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-1">
          {onEdit && !imgError && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleEditClick}
                  title="Edit with this image as reference"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <img
                      src={imageUrl}
                      alt={displayPrompt.substring(0, 50) + "..."}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </div>
                  <Separator />
                  <Textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe what you want to change..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleEditSubmit}>
                      Create Variation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {!imgError && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDownload}
              title="Download image"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onDelete}
              title="Delete image"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 