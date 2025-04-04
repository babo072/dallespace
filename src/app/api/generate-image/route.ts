import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 재시도 함수 추가
async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxRetries = 3, 
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // RateLimit 오류인 경우 더 오래 대기
      const isRateLimit = error instanceof Error && 
        (error.message.includes('rate limit') || error.message.includes('429'));
      
      const waitTime = isRateLimit ? delayMs * 3 : delayMs;
      console.log(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
      
      // 지정된 시간만큼 대기
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // 모든 재시도가 실패하면 마지막 오류 발생
  throw lastError;
}

export async function POST(req: Request) {
  try {
    const { prompt, n = 1, size = "1024x1024", style = "vivid" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 재시도 메커니즘으로 API 호출
    const response = await retryOperation(
      async () => openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: Number(n),
        size: size as "1024x1024" | "1024x1792" | "1792x1024",
        style: style as "vivid" | "natural",
      }),
      3, // 최대 3번 재시도
      2000 // 2초 간격으로 재시도
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error generating image:", error);
    
    // 더 자세한 오류 메시지 제공
    let errorMessage = "Failed to generate image";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // OpenAI API 특정 오류 처리
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        errorMessage = "Rate limit exceeded. Please try again later.";
        statusCode = 429;
      } else if (errorMessage.includes('content policy')) {
        errorMessage = "Your prompt may violate content policy. Please modify your request.";
        statusCode = 400;
      } else if (errorMessage.includes('invalid_api_key')) {
        errorMessage = "API key issue. Please contact administrator.";
        statusCode = 401;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 