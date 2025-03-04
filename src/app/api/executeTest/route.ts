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
      You are a code analysis engine. Analyze the following ${language} code and provide only one hint statement to proceed further on how to solve the problem statement from this point.
      The problem statement is:
      ${problemStatement}

      Code:
      ${code}

      Provide hints in JSON format with the following structure:
      {
        "hints": [
          "hint"
        ]
      }
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
    return NextResponse.json(
      {
        error: "Error analyzing code",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}