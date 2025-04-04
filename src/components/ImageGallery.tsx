import { useState, useEffect } from "react";
import { ImageDisplay } from "@/components/ImageDisplay";
import { deleteImage } from "@/lib/db";
import { toast } from "sonner";

// GeneratedImage 인터페이스 정의
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size?: "1024x1024" | "1024x1792" | "1792x1024";
  style?: "vivid" | "natural";
  enhancedPrompt?: string;
  createdAt: string;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
  onEdit?: (prompt: string, referenceImageUrl: string) => void;
  onDelete?: (id: string) => void;
}

export function ImageGallery({ images, onEdit, onDelete }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No images yet. Create your first image above!</p>
      </div>
    );
  }
  
  const handleEdit = (prompt: string, url: string) => {
    if (onEdit) {
      onEdit(prompt, url);
    }
  };
  
  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      // 기본 삭제 로직 - 외부에서 처리하지 않는 경우
      if (deleteImage(id)) {
        toast.success("Image deleted");
      }
    }
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
      {images.map((image) => (
        <ImageDisplay
          key={image.id}
          imageUrl={image.url}
          prompt={image.prompt}
          enhancedPrompt={image.enhancedPrompt}
          onEdit={(prompt) => handleEdit(prompt, image.url)}
          onDelete={() => handleDelete(image.id)}
        />
      ))}
    </div>
  );
} 