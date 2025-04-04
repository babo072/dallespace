import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, language = "en" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // System message based on language
    const systemMessage = language === "ko" 
      ? "당신은 사용자의 짧은 이미지 설명을 받아 DALL-E 3에 적합한 상세하고 명확한 프롬프트로 변환하는 전문가입니다. 원래 아이디어를 유지하면서 다음을 추가하세요: 1) 더 자세한 시각적 세부 사항, 2) 스타일, 분위기, 조명에 대한 설명, 3) 색상 팔레트, 4) 적절한 경우 구도와 시점. 단, 내용을 지나치게 변경하거나 사용자가 언급하지 않은 주요 요소를 추가하지 마세요. 영어로 출력하세요."
      : "You are an expert at turning brief image descriptions into detailed, effective prompts for DALL-E 3. Enhance the user's prompt while maintaining their original idea by adding: 1) more visual details, 2) style, mood, and lighting descriptions, 3) color palette, and 4) composition and perspective when appropriate. Don't drastically change the content or add major elements not mentioned by the user.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return NextResponse.json({
      enhancedPrompt: response.choices[0].message.content
    });
  } catch (error: any) {
    console.error("Error enhancing prompt:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance prompt" },
      { status: 500 }
    );
  }
} 