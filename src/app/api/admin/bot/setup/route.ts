import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setWebhook } from "@/lib/telegram";

export async function POST() {
    try {
        const session = await getSession();
        if (!session || session.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!baseUrl) {
            return NextResponse.json({ error: "NEXT_PUBLIC_BASE_URL not configured" }, { status: 500 });
        }

        const webhookUrl = `${baseUrl}/api/telegram/webhook`;
        console.log("Setting Telegram webhook to:", webhookUrl);

        const response = await setWebhook(webhookUrl);

        if (response.data && response.data.ok) {
            return NextResponse.json({ success: true, message: response.data.description });
        } else {
            return NextResponse.json({
                error: "Telegram API error",
                details: response.data
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Bot setup error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Failed to setup bot webhook", details: error.message },
            { status: 500 }
        );
    }
}
