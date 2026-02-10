import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessage, sendVoice } from "@/lib/telegram";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, summary, audioUrl } = await request.json();

        const post = await prisma.post.create({
            data: {
                title,
                content,
                summary,
                audioUrl,
                sentAt: new Date(),
            },
        });

        const connections = await prisma.telegramConnection.findMany({
            where: { isActive: true },
        });

        const sendPromises = connections.map(async (conn) => {
            try {
                // Send Text Summary
                await sendMessage(conn.telegramUserId, `<b>📢 ${title}</b>\n\n${summary}`);

                // Send Voice Summary if exists
                if (audioUrl) {
                    const filename = audioUrl.split('/').pop();
                    if (filename) {
                        const { readFile } = await import("fs/promises");
                        const { join } = await import("path");
                        const filePath = join(process.cwd(), "public", "temp", filename);
                        try {
                            const fileBuffer = await readFile(filePath);
                            await sendVoice(conn.telegramUserId, fileBuffer, "🎧 Voice summary");
                        } catch (err) {
                            console.error(`Failed to read audio file for user ${conn.userId}:`, err);
                        }
                    }
                }

                return { success: true, userId: conn.userId };
            } catch (err) {
                console.error(`Failed to send to user ${conn.userId}:`, err);
                return { success: false, userId: conn.userId };
            }
        });

        const results = await Promise.all(sendPromises);

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Send error:", error);
        return NextResponse.json(
            { error: "Failed to broadcast message" },
            { status: 500 }
        );
    }
}
