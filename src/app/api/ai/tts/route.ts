import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import axios from "axios";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const apiKey = process.env.FISH_AUDIO_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Fish Audio API key missing" }, { status: 500 });
        }

        // Fish Audio TTS Request
        const response = await axios.post(
            "https://api.fish.audio/v1/tts",
            {
                text: text,
                format: "mp3",
                reference_id: "ed034792a388487a8aacd213ff1cf51d",
                latency: "normal",
                normalize: true,
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "model": "s1",
                },
                responseType: "arraybuffer",
            }
        );

        const fileName = `${uuidv4()}.mp3`;
        const publicDir = join(process.cwd(), "public", "temp");

        // Ensure temp directory exists
        await mkdir(publicDir, { recursive: true });

        const filePath = join(publicDir, fileName);
        await writeFile(filePath, Buffer.from(response.data));

        const audioUrl = `/temp/${fileName}`;

        return NextResponse.json({ audioUrl });
    } catch (error: any) {
        console.error("TTS error:", error.response?.data?.toString() || error.message);
        return NextResponse.json(
            { error: "Failed to generate voice summary" },
            { status: 500 }
        );
    }
}
