import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Voice Broadcast <span className="text-blue-600">Agent</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          The minimal MVP for broadcasting AI-summarized voice updates to your Telegram community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {session ? (
            <Link
              href={session.role === "ADMIN" ? "/admin" : "/dashboard"}
              className="btn-primary px-8 py-3 text-lg"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-primary px-8 py-3 text-lg">
                Sign In
              </Link>
              <Link href="/register" className="btn-secondary px-8 py-3 text-lg">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
