"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Save JWT token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }

      // Redirect to the dashboard page
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-950 items-center justify-center px-4">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-900 shadow-2xl z-10 flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center mb-2 shadow-lg shadow-violet-500/20">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-outfit font-extrabold text-2xl text-white">AI Tech Reader</h1>
          <p className="text-slate-400 text-xs mt-1">Onboard into your software engineering second brain</p>
        </div>

        {/* Auth status info */}
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-950/20 border border-violet-800/20 text-[10px] text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Passwordless JWT generation. Sign in registers new developers automatically.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. sora@engineering.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-600 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Sora"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {error && (
          <div className="text-xs text-red-500 font-medium text-center bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
