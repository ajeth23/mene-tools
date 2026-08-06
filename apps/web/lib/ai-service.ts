import { getAIUsage, incrementAIUsage } from "./ai-limit";

// Use environment variable for the deployed Cloudflare Worker URL, fallback to local wrangler worker
const GATEWAY_URL = process.env.NEXT_PUBLIC_AI_GATEWAY_URL || "http://127.0.0.1:8787";

export async function callAIGateway(prompt: string, systemInstruction?: string): Promise<string> {
  const currentUsage = getAIUsage();
  if (currentUsage.remaining <= 0) {
    throw new Error("You have reached your limit of 3 free generations for today. Please try again tomorrow!");
  }

  try {
    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
      }),
    });

    let data: any = {};
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      if (!response.ok) {
        console.error(`AI Gateway connection failed (${response.status}) at: ${GATEWAY_URL}`);
        throw new Error("The AI service is temporarily unavailable. Please try again later.");
      }
      throw new Error("Received an invalid response format from the server.");
    }

    // Handle errors sent inside the JSON from the gateway
    if (!response.ok || data.success === false || data.error) {
      throw new Error(data.error || "Generation failed. Please try again.");
    }

    incrementAIUsage();
    return data.result;
  } catch (err: any) {
    // Log the actual technical details for debugging in the browser console
    console.error("Technical AI Gateway Error Details:", err);
    
    // Throw clean, user-friendly errors to the UI
    if (err.message && (err.message.includes("limit") || err.message.includes("generation"))) {
      throw err; // Keep user-friendly rate limit errors
    }
    throw new Error("Failed to connect to the AI service. Please check your internet connection and try again.");
  }
}
