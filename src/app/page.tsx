"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PromptForm } from "@/components/PromptForm";
import { ImageGallery, GeneratedImage } from "@/components/ImageGallery";
import { ImageDisplay } from "@/components/ImageDisplay";
import { saveImage, deleteImage, getAllImages } from "@/lib/db";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  
  // 상태 보존을 위한 변수들
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [currentSize, setCurrentSize] = useState<"1024x1024" | "1024x1792" | "1792x1024">("1024x1024");
  const [currentStyle, setCurrentStyle] = useState<"vivid" | "natural">("vivid");
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // 로컬 스토리지에서 이미지 불러오기
        const storedImages = getAllImages();
        
        // GeneratedImage 형식으로 변환
        const formattedImages: GeneratedImage[] = storedImages.map(img => ({
          id: img.id,
          url: img.url,
          prompt: img.prompt,
          enhancedPrompt: img.enhancedPrompt,
          createdAt: new Date(img.timestamp).toISOString(),
          size: "1024x1024", // 기본값 설정
          style: "vivid", // 기본값 설정
        }));
        
        setImages(formattedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      }
    };

    fetchImages();
  }, []);

  const handleTabChange = (tab: "create" | "gallery") => {
    setActiveTab(tab);
  };

  const handlePromptSubmit = async (values: { 
    prompt: string; 
    size: "1024x1024" | "1024x1792" | "1792x1024"; 
    style: "vivid" | "natural";
    enhancedPrompt?: string;
    originalPrompt?: string;
  }) => {
    setIsLoading(true);
    setCurrentImageUrl(null); // 새 이미지 생성 시 이전 이미지 지우기
    
    // 현재 입력값 상태 저장
    setCurrentPrompt(values.prompt);
    setCurrentSize(values.size);
    setCurrentStyle(values.style);
    
    // 향상된 프롬프트가 있는 경우 저장
    if (values.enhancedPrompt) {
      setEnhancedPrompt(values.enhancedPrompt);
    }
    if (values.originalPrompt) {
      setOriginalPrompt(values.originalPrompt);
    }

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: values.prompt,
          size: values.size,
          style: values.style
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const url = data.data[0].url;
        setCurrentImageUrl(url);
        
        // 로컬 스토리지에 저장
        saveImage({
          url: url,
          prompt: values.prompt,
          enhancedPrompt: values.enhancedPrompt,
        });
        
        // Add new image to gallery
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: url,
          prompt: values.prompt,
          size: values.size,
          style: values.style,
          createdAt: new Date().toISOString(),
        };
        
        setImages(prev => [newImage, ...prev]);
        toast.success("Image created!");
      } else {
        throw new Error("No image data returned");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const getImageContainerStyle = (size: string) => {
    switch (size) {
      case "1024x1024":
        return "aspect-square";
      case "1024x1792":
        return "aspect-[9/16]";
      case "1792x1024":
        return "aspect-[16/9]";
      default:
        return "aspect-square";
    }
  };

  const handlePromptChange = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  const handleEnhancedPromptChange = (original: string, enhanced: string | null) => {
    setOriginalPrompt(original);
    setEnhancedPrompt(enhanced);
  };

  const handleEditImage = (prompt: string, url: string) => {
    // 편집 모드로 전환
    setActiveTab("create");
    setCurrentPrompt(prompt);
    setCurrentImageUrl(url);
  };

  const handleDeleteImage = (id: string) => {
    // 이미지 배열에서 이미지 삭제
    setImages(prev => prev.filter(img => img.id !== id));
    
    // 삭제된 이미지가 현재 표시 중인 이미지인 경우 이미지 지우기
    const deletedImage = images.find(img => img.id === id);
    if (deletedImage && deletedImage.url === currentImageUrl) {
      setCurrentImageUrl(null);
    }
    
    // 서버 또는 로컬 스토리지에서 이미지 삭제
    deleteImage(id);
    toast.success("Image deleted");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="flex border-b mb-4 justify-center">
          <button
            onClick={() => handleTabChange("create")}
            className={`py-2 px-8 font-medium ${
              activeTab === "create"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Create
          </button>
          <button
            onClick={() => handleTabChange("gallery")}
            className={`py-2 px-8 font-medium ${
              activeTab === "gallery"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Gallery
          </button>
        </div>

        {activeTab === "create" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div>
              <PromptForm 
                onSubmit={handlePromptSubmit}
                isLoading={isLoading}
                onSizeChange={setCurrentSize}
                initialPrompt={currentPrompt}
                initialSize={currentSize}
                initialStyle={currentStyle}
                initialOriginalPrompt={originalPrompt}
                initialEnhancedPrompt={enhancedPrompt}
                onPromptChange={handlePromptChange}
                onEnhancedPromptChange={handleEnhancedPromptChange}
              />
            </div>
            
            <div>
              <div className={`${getImageContainerStyle(currentSize)} w-full bg-secondary/20 rounded-md flex items-center justify-center`}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p className="text-sm text-muted-foreground">Generating image...</p>
                  </div>
                ) : currentImageUrl ? (
                  <ImageDisplay imageUrl={currentImageUrl} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Your image will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <ImageGallery 
              images={images} 
              onEdit={handleEditImage}
              onDelete={handleDeleteImage}
            />
          </div>
        )}
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} DALLEspace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 