import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { Plus, MessageSquare, History } from "lucide-react";
import BotSetupButton from "@/components/BotSetupButton";

export default async function AdminDashboardPage() {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") redirect("/login");

    const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    const connectionCount = await prisma.telegramConnection.count({
        where: { isActive: true },
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            <nav className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold dark:text-white">Admin Console</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md font-medium">ADMIN</span>
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

            <main className="max-w-6xl mx-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
                            <div className="text-2xl font-bold dark:text-white">{posts.length}</div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Plus size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Connected Users</div>
                            <div className="text-2xl font-bold dark:text-white">{connectionCount}</div>
                        </div>
                    </div>

                    <BotSetupButton />

                    <Link
                        href="/admin/posts/new"
                        className="bg-black dark:bg-white p-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-white dark:text-black hover:opacity-90 transition-all font-bold text-lg"
                    >
                        <Plus size={24} />
                        New Broadcast
                    </Link>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                        <History size={20} className="text-gray-500" />
                        <h2 className="text-xl font-bold dark:text-white">Recent Broadcasts</h2>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800 text-white">
                        {posts.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No broadcasts sent yet.
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{post.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{post.content}</p>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
