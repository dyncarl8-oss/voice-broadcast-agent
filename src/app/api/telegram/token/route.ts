import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = crypto.randomBytes(16).toString("hex");
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        try {
            await prisma.user.update({
                where: { id: session.userId },
                data: {
                    connectionToken: token,
                    connectionTokenExpires: expires,
                },
            });
        } catch (error: any) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: "Session invalid. Please log out and log back in to refresh your account." },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({ token });
    } catch (error: any) {
        console.error("Token generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
