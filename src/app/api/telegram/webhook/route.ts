import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Telegram Webhook Received:", JSON.stringify(body, null, 2));

        const message = body.message;
        if (!message) {
            console.log("Webhook received but no message found (likely setup/update notification)");
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id.toString();
        const text = message.text || "";

        // Handle /start <token>
        if (text.startsWith("/start ")) {
            const token = text.split(" ")[1];
            if (!token) return NextResponse.json({ ok: true });

            const user = await prisma.user.findFirst({
                where: {
                    connectionToken: token,
                    connectionTokenExpires: {
                        gt: new Date(),
                    },
                },
            });

            if (!user) {
                await sendMessage(chatId, "❌ Invalid or expired connection token. Please try again from the dashboard.");
                return NextResponse.json({ ok: true });
            }

            // Create or update connection
            await prisma.telegramConnection.upsert({
                where: { userId: user.id },
                update: {
                    telegramUserId: chatId,
                    telegramUsername: message.from.username || null,
                    isActive: true,
                    connectedAt: new Date(),
                },
                create: {
                    userId: user.id,
                    telegramUserId: chatId,
                    telegramUsername: message.from.username || null,
                },
            });

            // Clear token after use
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    connectionToken: null,
                    connectionTokenExpires: null,
                },
            });

            await sendMessage(chatId, "✅ Telegram connected successfully. You’ll now receive updates.");
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ ok: true }); // Always return OK to Telegram
    }
}
