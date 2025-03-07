/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { language, code, problemStatement } = await request.json();

    if (!language || !code || !problemStatement) {
      return NextResponse.json(
        { error: "Missing required fields (language, code, problemStatement)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY2;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Gemini API key" },
        { status: 500 }
      );
    }

    const model = "gemini-2.0-flash"; // Ensure this model is correct

    // Prepare the prompt for Gemini
    const prompt = `
      You are a code analysis engine. Analyze the following ${language} code and provide a single, subtle hint to help the user proceed further in solving the problem. The hint should be based on the current state of the code and should encourage the user to think critically about the next logical step.

The problem statement is:
${problemStatement}

Code:
${code}

Provide the hint in JSON format with the following structure:
{
  "hints": [
    "hint"
  ]
}

Guidelines for the hint:
1. The hint should be concise and relevant to the current state of the code.
2. It should not directly solve the problem but instead guide the user toward the next step.
3. Consider the amount of code written and the problem statement to provide a meaningful hint.
4. The hint should encourage the user to think about potential improvements, missing logic, or alternative approaches.
    `;
    console.log("Prompt sent to Gemini:", prompt);

    // Fetch with retry logic
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

    // Send the request to Gemini
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API Response:", data); // Debugging

    // Extract the response text
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error("Invalid response structure from Gemini:", data);
      return NextResponse.json(
        { error: "Invalid response structure from Gemini", details: data },
        { status: 500 }
      );
    }

    // Remove triple backticks and parse the response text as JSON
    let hints;
    try {
      const cleanedResponseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResponse = JSON.parse(cleanedResponseText);
      hints = Array.isArray(parsedResponse.hints) ? parsedResponse.hints : [];
    } catch (error) {
      console.error("Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse Gemini response", details: responseText },
        { status: 500 }
      );
    }

    // Return the hints
    return NextResponse.json({ success: true, hints });
  } catch (error) {
    console.error("Error analyzing code:", error);
    console.log(error);
    return NextResponse.json(
      {
        error: "Error analyzing code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}