import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // First user becomes ADMIN
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "ADMIN" : "USER";

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });

        await login({ userId: user.id, email: user.email, role: user.role });

        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
