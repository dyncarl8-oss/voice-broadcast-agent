import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
) {
    try {
        // Simple auth check to prevent random access
        const session = await getSession();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const filename = request.nextUrl.pathname.split('/').pop();
        if (!filename || !filename.endsWith('.mp3')) {
            return new NextResponse("Invalid filename", { status: 400 });
        }

        const filePath = join(process.cwd(), "public", "temp", filename);

        try {
            const fileBuffer = await readFile(filePath);
            return new NextResponse(fileBuffer, {
                headers: {
                    "Content-Type": "audio/mpeg",
                },
            });
        } catch (err) {
            console.error("File read error:", err);
            return new NextResponse("File not found", { status: 404 });
        }
    } catch (error) {
        console.error("Serve error:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
