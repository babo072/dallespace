import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Image as ImageIcon, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Form validation schema
const promptSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1000),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]),
  style: z.enum(["vivid", "natural"]),
});

type PromptFormValues = z.infer<typeof promptSchema>;

interface PromptFormProps {
  onSubmit: (values: PromptFormValues & { enhancedPrompt?: string }) => void;
  isLoading: boolean;
}

export function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [language, setLanguage] = useState<"en" | "ko">("en");

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: "",
      size: "1024x1024",
      style: "vivid",
    },
  });

  const handleEnhancePrompt = async () => {
    const promptValue = form.getValues("prompt");
    
    if (!promptValue || promptValue.length < 3) {
      toast.error("Please enter a prompt with at least 3 characters");
      return;
    }
    
    setIsEnhancing(true);
    
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: promptValue,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }
      
      const data = await response.json();
      
      if (data.enhancedPrompt) {
        form.setValue("prompt", data.enhancedPrompt);
        toast.success("Prompt enhanced!");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error("Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (values: PromptFormValues) => {
    onSubmit(values);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ko" : "en");
    toast(language === "en" ? "한국어 모드로 전환됨" : "Switched to English mode");
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
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
            
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder={language === "en" 
                        ? "Describe the image you want to create..."
                        : "만들고 싶은 이미지를 설명해주세요..."
                      }
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
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
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivid">Vivid</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
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
      </Form>
    </Card>
  );
} 