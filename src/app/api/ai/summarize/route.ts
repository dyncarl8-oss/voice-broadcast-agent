import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const prompt = `
      You are a broadcast assistant. Summarize the following content into a short, clear, and actionable broadcast message for Telegram.
      Requirements:
      - Use a professional yet engaging tone.
      - Keep it brief (under 1000 characters).
      - Use emoji for visual clarity (but don't overdo it).
      - Focus on the key takeaway or action item.
      
      Content:
      ${content}
      
      Summary:
    `;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        return NextResponse.json({ summary: summary.trim() });
    } catch (error) {
        console.error("Summarization error:", error);
        return NextResponse.json(
            { error: "Failed to generate summary" },
            { status: 500 }
        );
    }
}
