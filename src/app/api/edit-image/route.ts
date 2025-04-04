import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { imageUrl, prompt } = await req.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: "Image URL and prompt are required" },
        { status: 400 }
      );
    }

    // Use DALL-E 3 to generate a new image based on the prompt
    // (since DALL-E 3 doesn't directly support image edits/variations)
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Based on this image concept (${imageUrl}), ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error editing image:", error);
    return NextResponse.json(
      { error: error.message || "Failed to edit image" },
      { status: 500 }
    );
  }
} 