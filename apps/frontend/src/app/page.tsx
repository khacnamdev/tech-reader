"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, Globe, Search, Sparkles, BookOpenText } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "crawling" | "analyzing" | "embedding" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("crawling");
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
      const response = await fetch("http://localhost:3001/api/v1/articles/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please configure a valid JWT token in localStorage as 'auth_token'.");
        }
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      setStatus("completed");
      router.push(`/articles/${data.id}`);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setStatus("idle");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px]" />

      {/* Header */}
      <header className="border-b border-slate-900 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AI Tech Reader
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/library" className="hover:text-white transition-colors">My Library</a>
          <a href="/library?tab=vocabulary" className="hover:text-white transition-colors">Glossary</a>
        </nav>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-sm font-medium text-slate-200"
        >
          Enter Dashboard
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 max-w-6xl mx-auto z-10 w-full">
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/30 text-xs font-semibold text-violet-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Second Brain for Software Engineers</span>
          </div>
          <h1 className="font-outfit font-extrabold text-4xl sm:text-6xl tracking-tight text-white mb-6 leading-tight">
            Read complex tech blogs in <span className="gradient-text">Half the Time</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Paste any technical article URL. AI will extract clean markdown, translate the prose while preserving code/terminology, and compile flashcards automatically.
          </p>
        </div>

        {/* Input Ingestion Form */}
        <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl mb-16">
          {status === "idle" ? (
            <div className="flex flex-col gap-3">
              <form onSubmit={handleIngest} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  placeholder="Paste engineering article URL (e.g. Next.js, Redis, Docker)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition-all text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-700/20 active:scale-95"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              {error && (
                <div className="text-xs text-red-500 font-medium px-1 mt-1 text-center">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              {/* Spinner animation */}
              <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
              
              {/* Steps Progress */}
              <div className="w-full max-w-md bg-slate-950 border border-slate-900 rounded-lg p-4 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400">Process Pipeline Status</span>
                  <span className="font-mono text-cyan-400 font-bold uppercase animate-pulse">
                    {status}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-500" 
                    style={{
                      width: 
                        status === "crawling" ? "25%" : 
                        status === "analyzing" ? "55%" : 
                        status === "embedding" ? "85%" : "100%"
                    }}
                  />
                </div>
                <ul className="space-y-2 text-slate-500">
                  <li className={`flex items-center gap-2 ${status !== "crawling" ? "text-slate-300" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status !== "crawling" ? "bg-cyan-400" : "bg-slate-700 animate-ping"}`} />
                    Crawling HTML & converting DOM to Markdown...
                  </li>
                  <li className={`flex items-center gap-2 ${status === "analyzing" || status === "embedding" || status === "completed" ? "text-slate-300" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === "analyzing" ? "bg-cyan-400 animate-ping" : status === "embedding" || status === "completed" ? "bg-cyan-400" : "bg-slate-700"}`} />
                    Translating prose & preserving technical terminology...
                  </li>
                  <li className={`flex items-center gap-2 ${status === "embedding" || status === "completed" ? "text-slate-300" : ""}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === "embedding" ? "bg-cyan-400 animate-ping" : status === "completed" ? "bg-cyan-400" : "bg-slate-700"}`} />
                    Chunking paragraphs & indexing embeddings in pgvector...
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Quick recommendations */}
          <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-slate-500">
            <span>Try these examples:</span>
            <button 
              type="button"
              onClick={() => setUrl("https://nextjs.org/blog/next-15")}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              Next.js 15 Release Notes
            </button>
            <button 
              type="button"
              onClick={() => setUrl("https://dev.to/react-compiler-optimized")}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              React Compiler Under The Hood
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-xl border border-slate-900 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-950/50 border border-violet-800/30 flex items-center justify-center text-violet-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white">Terminology Conservation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Maintains crucial coding phrases like <code className="text-violet-300">Hydration</code>, <code className="text-violet-300">AST</code>, and <code className="text-violet-300">Suspense</code> in English with inline cards, avoiding literal translation errors.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-900 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center text-cyan-400">
              <BookOpenText className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white">Vocabulary Cards</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Extracts challenging English words along with IPA pronunciation, translations, definitions, example usages, and mastery indicators.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-slate-900 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/50 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-outfit font-bold text-lg text-white">Semantic Second Brain</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ask follow-up questions across your entire library using RAG. Chat history combines with your vector index to remember what you learn.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-950 py-8 text-center text-xs text-slate-600">
        <p>© 2026 AI Tech Reader. Developed by Antigravity team. Actively storing technical insights.</p>
      </footer>
    </div>
  );
}
