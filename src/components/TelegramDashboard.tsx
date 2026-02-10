"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle, Loader2, Link2Off } from "lucide-react";

interface TelegramDashboardProps {
    initialConnection: {
        telegramUsername: string | null;
        connectedAt: string;
    } | null;
    botUsername: string;
}

export default function TelegramDashboard({ initialConnection, botUsername }: TelegramDashboardProps) {
    const [connection, setConnection] = useState(initialConnection);
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/telegram/token", { method: "POST" });
            const { token } = await res.json();
            if (token) {
                window.open(`https://t.me/${botUsername}?start=${token}`, "_blank");
            }
        } catch (error) {
            console.error("Connect error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect Telegram?")) return;
        setLoading(true);
        try {
            const res = await fetch("/api/telegram/disconnect", { method: "POST" });
            if (res.ok) {
                setConnection(null);
            }
        } catch (error) {
            console.error("Disconnect error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    {connection ? (
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircle2 size={24} />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500">
                            <XCircle size={24} />
                        </div>
                    )}
                    <div>
                        <div className="font-bold text-lg dark:text-white">
                            Status: {connection ? "Connected ✅" : "Not connected ❌"}
                        </div>
                        {connection && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Connected as @{connection.telegramUsername || "User"}
                            </div>
                        )}
                    </div>
                </div>

                {connection ? (
                    <button
                        onClick={handleDisconnect}
                        disabled={loading}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        <Link2Off size={18} />
                        Disconnect
                    </button>
                ) : (
                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                        Connect Telegram
                    </button>
                )}
            </div>

            {!connection && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> After clicking "Connect Telegram", your browser will open the Telegram app. Tap the <strong>"Start"</strong> button in our bot to complete the connection.
                    </p>
                </div>
            )}
        </div>
    );
}
