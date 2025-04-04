import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, n = 1, referenceImageUrl } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate variations by including reference to previous image
    // Since DALL-E 3 doesn't have a direct variation API, we use a descriptive prompt
    let enhancedPrompt = prompt;
    if (referenceImageUrl) {
      enhancedPrompt = `Create a variation of this image concept (${referenceImageUrl}), with these changes: ${prompt}. Maintain the same style and composition but with the requested modifications.`;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: Number(n),
      size: "1024x1024",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error generating variations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate variations" },
      { status: 500 }
    );
  }
} 