import { NextRequest, NextResponse } from "next/server";

interface Prompt {
  text: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { [key: string]: string | string[] } } // Correct type
) {
  const problemNumber = Array.isArray(params.problemNumber)
    ? params.problemNumber[0] // Use the first element if it's an array
    : params.problemNumber; // Otherwise, use it as is

  // Validate problemNumber
  if (!problemNumber || isNaN(Number(problemNumber))) {
    return NextResponse.json(
      { error: "Invalid problem number" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Gemini API key" },
      { status: 500 }
    );
  }

  const model = "gemini-2.0-flash"; // Ensure this model is correct

  const prompts: Prompt[] = Array.from({ length: 6 }, (_, i) => ({
    text: `Provide hint ${i + 1} for solving LeetCode problem number ${problemNumber}. Keep it simple and concise.`,
  }));

  async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    delay = 1000
  ): Promise<Response> {
    for (let attempt = 0; attempt < retries; attempt++) {
      const response = await fetch(url, options);
      if (response.ok) return response;
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1))); // Exponential backoff
    }
    throw new Error("Max retries reached. Failed to fetch from Gemini API.");
  }

  try {
    const responses: string[] = [];
    for (const prompt of prompts) {
      try {
        const response = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [prompt] }] }),
          }
        );

        const data = await response.json();
        responses.push(data?.candidates?.[0]?.content?.parts?.[0]?.text || "No hint available.");
      } catch (fetchError) {
        console.error("Fetch Error:", fetchError);
        responses.push("Error fetching hint.");
      }

      // Add a delay between requests (e.g., 1 second)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ hints: responses });
  } catch (error) {
    console.error("General Error:", error);
    return NextResponse.json(
      {
        error: "Error fetching hints",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}