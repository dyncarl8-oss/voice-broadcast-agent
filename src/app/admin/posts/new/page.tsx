"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, AudioLines, Send, Loader2, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [summary, setSummary] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [loading, setLoading] = useState({ summarize: false, tts: false, send: false });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    const handleSummarize = async () => {
        if (!content) return setError("Please enter content first");
        setLoading({ ...loading, summarize: true });
        setError("");
        try {
            const res = await fetch("/api/ai/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            if (res.ok) setSummary(data.summary);
            else setError(data.error);
        } catch (err) {
            setError("Failed to generate summary");
        } finally {
            setLoading({ ...loading, summarize: false });
        }
    };

    const handleTTS = async () => {
        if (!summary) return setError("Please generate a summary first");
        setLoading({ ...loading, tts: true });
        setError("");
        try {
            const res = await fetch("/api/ai/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: summary }),
            });
            const data = await res.json();
            if (res.ok) setAudioUrl(data.audioUrl);
            else setError(data.error);
        } catch (err) {
            setError("Failed to generate voice summary");
        } finally {
            setLoading({ ...loading, tts: false });
        }
    };

    const handleSend = async () => {
        if (!title || !summary) return setError("Missing title or summary");
        setLoading({ ...loading, send: true });
        setError("");
        try {
            const res = await fetch("/api/telegram/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, summary, audioUrl }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Broadcast sent successfully!");
                setTimeout(() => router.push("/admin"), 2000);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Failed to send broadcast");
        } finally {
            setLoading({ ...loading, send: false });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-bold dark:text-white">New Broadcast</h1>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-500 p-4 rounded-xl border border-green-100 dark:border-green-900/50 flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                <input
                                    className="input-field"
                                    placeholder="Broadcast Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raw Content</label>
                                <textarea
                                    className="input-field min-h-[200px]"
                                    placeholder="Paste your full content here..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSummarize}
                                disabled={loading.summarize || !content}
                                className="btn-secondary w-full flex items-center justify-center gap-2"
                            >
                                {loading.summarize ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                Generate AI Summary
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Summary (Telegram Friendly)</label>
                                <textarea
                                    className="input-field min-h-[150px]"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder="The generated summary will appear here..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleTTS}
                                    disabled={loading.tts || !summary}
                                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                                >
                                    {loading.tts ? <Loader2 size={18} className="animate-spin" /> : <AudioLines size={18} />}
                                    Generate Voice
                                </button>
                                {audioUrl && (
                                    <button
                                        onClick={() => new Audio(audioUrl).play()}
                                        className="p-2 border border-blue-200 dark:border-blue-900 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                    >
                                        <Play size={24} />
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <button
                                    onClick={handleSend}
                                    disabled={loading.send || !summary}
                                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                                >
                                    {loading.send ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                    Send to {loading.send ? "Telegram..." : "All Users"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
