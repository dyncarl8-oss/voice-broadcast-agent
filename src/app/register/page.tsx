"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.user.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push("/dashboard");
                }
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black p-4">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create account</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Join Voice Broadcast Agent
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 text-sm p-3 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-3"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-600 hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
