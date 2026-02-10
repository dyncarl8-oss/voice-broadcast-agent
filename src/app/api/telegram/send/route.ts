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
                    // Note: In a real app, this URL needs to be publicly accessible by Telegram
                    // Since we are running locally, we might need a tunnel like ngrok
                    // For MVP, we'll try to send it if possible, or skip if local
                    const fullAudioUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${audioUrl}`;
                    await sendVoice(conn.telegramUserId, fullAudioUrl, "🎧 Voice summary");
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
