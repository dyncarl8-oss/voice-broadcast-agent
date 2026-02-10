"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function BotSetupButton() {
    const [status, setStatus] = useState<{ loading: boolean; message: string; error: boolean }>({
        loading: false,
        message: "",
        error: false,
    });

    const handleBotSetup = async () => {
        setStatus({ loading: true, message: "", error: false });
        try {
            const res = await fetch("/api/admin/bot/setup", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setStatus({ loading: false, message: "Webhook configured! ✅", error: false });
            } else {
                setStatus({ loading: false, message: data.error || "Setup failed", error: true });
            }
        } catch (err) {
            setStatus({ loading: false, message: "Network error", error: true });
        }
    };

    return (
        <>
            {status.message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.error
                        ? "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/40 dark:border-red-900/60"
                        : "bg-green-50 border-green-100 text-green-600 dark:bg-green-900/40 dark:border-green-900/60"
                    }`}>
                    {status.error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <span className="font-medium">{status.message}</span>
                    <button onClick={() => setStatus({ ...status, message: "" })} className="text-sm opacity-50 hover:opacity-100 px-2 font-bold">×</button>
                </div>
            )}

            <button
                onClick={handleBotSetup}
                disabled={status.loading}
                className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-gray-700 dark:text-white font-medium"
            >
                {status.loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                Setup Bot Webhook
            </button>
        </>
    );
}
