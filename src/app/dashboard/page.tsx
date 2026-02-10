import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TelegramDashboard from "@/components/TelegramDashboard";
import { logout } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const connection = await prisma.telegramConnection.findUnique({
        where: { userId: session.userId },
    });

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <nav className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
                        <form action={async () => {
                            "use server";
                            await logout();
                            redirect("/login");
                        }}>
                            <button className="text-sm text-red-500 hover:underline">Logout</button>
                        </form>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto p-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold dark:text-white">Telegram Integration</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Connect your Telegram account to receive AI-summarized voice broadcasts.
                        </p>
                    </div>

                    <TelegramDashboard
                        initialConnection={connection?.isActive ? {
                            telegramUsername: connection.telegramUsername,
                            connectedAt: connection.connectedAt.toISOString()
                        } : null}
                        botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YourBotUsername"}
                    />
                </div>
            </main>
        </div>
    );
}
