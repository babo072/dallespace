import { useState, useEffect } from "react";
import { Loader2, Sparkles, Image as ImageIcon, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface PromptFormProps {
  onSubmit: (values: { 
    prompt: string;
    size: "1024x1024" | "1024x1792" | "1792x1024";
    style: "vivid" | "natural";
    enhancedPrompt?: string;
    originalPrompt?: string;
  }) => void;
  isLoading: boolean;
  onSizeChange?: (size: "1024x1024" | "1024x1792" | "1792x1024") => void;
  initialPrompt?: string;
  initialSize?: "1024x1024" | "1024x1792" | "1792x1024";
  initialStyle?: "vivid" | "natural";
  initialOriginalPrompt?: string;
  initialEnhancedPrompt?: string | null;
  onPromptChange?: (prompt: string) => void;
  onEnhancedPromptChange?: (original: string, enhanced: string | null) => void;
}

export function PromptForm({ 
  onSubmit, 
  isLoading, 
  onSizeChange,
  initialPrompt = "",
  initialSize = "1024x1024",
  initialStyle = "vivid",
  initialOriginalPrompt = "",
  initialEnhancedPrompt = null,
  onPromptChange,
  onEnhancedPromptChange
}: PromptFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko">("ko");
  const [originalPrompt, setOriginalPrompt] = useState(initialOriginalPrompt);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(initialEnhancedPrompt);
  const [size, setSize] = useState<"1024x1024" | "1024x1792" | "1792x1024">(initialSize);
  const [style, setStyle] = useState<"vivid" | "natural">(initialStyle);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialSize) setSize(initialSize);
    if (initialStyle) setStyle(initialStyle);
    if (initialOriginalPrompt) setOriginalPrompt(initialOriginalPrompt);
    if (initialEnhancedPrompt) setEnhancedPrompt(initialEnhancedPrompt);
  }, [initialPrompt, initialSize, initialStyle, initialOriginalPrompt, initialEnhancedPrompt]);

  const handleEnhancePrompt = async () => {
    if (!prompt || prompt.length < 3) {
      toast.error("Please enter a prompt with at least 3 characters");
      return;
    }
    
    setIsEnhancing(true);
    setOriginalPrompt(prompt);
    
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }
      
      const data = await response.json();
      
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        setPrompt(data.enhancedPrompt);
        
        if (onEnhancedPromptChange) {
          onEnhancedPromptChange(prompt, data.enhancedPrompt);
        }
        
        toast.success("Prompt enhanced!");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error("Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt || prompt.length < 3) {
      toast.error("Please enter a prompt with at least 3 characters");
      return;
    }
    
    onSubmit({
      prompt,
      size,
      style,
      enhancedPrompt: enhancedPrompt || undefined,
      originalPrompt: originalPrompt || undefined
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ko" : "en");
    toast(language === "en" ? "한국어 모드로 전환됨" : "Switched to English mode");
    setEnhancedPrompt(null);
    
    if (onEnhancedPromptChange) {
      onEnhancedPromptChange("", null);
    }
  };

  const handleSizeChange = (newSize: "1024x1024" | "1024x1792" | "1792x1024") => {
    setSize(newSize);
    if (onSizeChange) {
      onSizeChange(newSize);
    }
  };

  const handlePromptInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    setEnhancedPrompt(null);
    
    if (onPromptChange) {
      onPromptChange(newPrompt);
    }
    
    if (onEnhancedPromptChange) {
      onEnhancedPromptChange("", null);
    }
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Create an Image</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={language === "en" ? "Switch to Korean" : "Switch to English"}
            >
              <Languages className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Textarea
              value={prompt}
              onChange={handlePromptInputChange}
              placeholder={language === "en" 
                ? "Describe the image you want to create..."
                : "만들고 싶은 이미지를 설명해주세요..."
              }
              className="min-h-[100px] resize-none"
              required
              minLength={3}
            />
            {prompt.length > 0 && prompt.length < 3 && (
              <p className="text-sm text-red-500">Prompt must be at least 3 characters</p>
            )}
          </div>
          
          {originalPrompt && enhancedPrompt && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">한글 프롬프트 (Original)</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-900 rounded border">
                {originalPrompt}
              </p>
              
              <Separator className="my-2" />
              
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">영문 프롬프트 (Enhanced)</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-white dark:bg-gray-900 rounded border">
                {enhancedPrompt}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select 
                value={size}
                onValueChange={handleSizeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square (1:1)</SelectItem>
                  <SelectItem value="1024x1792">Portrait (9:16)</SelectItem>
                  <SelectItem value="1792x1024">Landscape (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={style}
                onValueChange={(value: "vivid" | "natural") => setStyle(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivid">Vivid</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing || isLoading}
          >
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Enhance Prompt
              </>
            )}
          </Button>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 