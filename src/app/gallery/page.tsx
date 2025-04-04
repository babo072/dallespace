"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ImageGallery, GeneratedImage } from "@/components/ImageGallery";
import { saveImage, clearAllImages, getAllImages } from "@/lib/db";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function GalleryPage() {
  const [refreshGallery, setRefreshGallery] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  
  // 이미지 목록 로드
  useEffect(() => {
    const loadImages = () => {
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
        console.error("Error loading images:", error);
        toast.error("Failed to load images");
      }
    };

    loadImages();
  }, [refreshGallery]);
  
  const handleEditImage = async (prompt: string, referenceImageUrl: string) => {
    try {
      setIsGenerating(true);
      
      const response = await fetch("/api/image-variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          referenceImageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create image variation");
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const imageUrl = data.data[0].url;
        
        // Save to local storage
        saveImage({
          url: imageUrl,
          prompt,
        });
        
        toast.success("Image variation created successfully!");
        setRefreshGallery(prev => prev + 1);
      } else {
        throw new Error("No image data returned");
      }
    } catch (error) {
      console.error("Error creating image variation:", error);
      toast.error("Failed to create image variation");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDeleteImage = (id: string) => {
    if (deleteImage(id)) {
      toast.success("Image deleted");
      setRefreshGallery(prev => prev + 1);
    }
  };
  
  const handleClearGallery = () => {
    if (window.confirm("Are you sure you want to clear all saved images? This action cannot be undone.")) {
      clearAllImages();
      setRefreshGallery(prev => prev + 1);
      toast.success("Gallery cleared");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Gallery</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearGallery}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Gallery
          </Button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <ImageGallery 
            images={images}
            onEdit={handleEditImage}
            onDelete={handleDeleteImage}
          />
        </div>
      </main>
      
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} DALLEspace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 