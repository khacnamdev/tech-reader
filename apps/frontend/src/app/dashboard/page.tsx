"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Brain, Calendar, Clock, Flame, 
  Plus, CheckCircle2, ChevronRight, BarChart3, ArrowUpRight
} from "lucide-react";

interface DashboardData {
  userName: string;
  stats: {
    articlesRead: number;
    readingTime: number;
    streak: number;
    vocabularyCount: number;
    conceptsCount: number;
  };
  categories: Array<{ name: string; count: number }>;
  recentArticles: Array<{
    id: string;
    title: string;
    sourceDomain: string;
    category: string;
    progress: number;
    readTime: number;
    date: string;
  }>;
  articlesAddedDates: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const [ingestUrl, setIngestUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch("http://localhost:3001/api/v1/articles/dashboard/stats", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Server returned status: ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestUrl.trim()) return;
    setIsSubmitting(true);
    setIngestError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
      const res = await fetch("http://localhost:3001/api/v1/articles/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ url: ingestUrl })
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized. Please configure 'auth_token' in localStorage.");
        }
        throw new Error(`Ingest failed: ${res.statusText}`);
      }

      const article = await res.json();
      router.push(`/articles/${article.id}`);
    } catch (err) {
      console.error(err);
      setIngestError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContributionGrid = (dates: string[]) => {
    const grid: Array<Array<{ level: number; day: number }>> = [];
    const dateMap = new Map<string, number>();

    dates.forEach(d => {
      const formatted = new Date(d).toISOString().split("T")[0];
      dateMap.set(formatted, (dateMap.get(formatted) ?? 0) + 1);
    });

    const now = new Date();
    const startOffset = now.getDay(); // days since Sunday
    const totalDays = 22 * 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - totalDays + 1 - startOffset);

    for (let w = 0; w < 22; w++) {
      const week: Array<{ level: number; day: number }> = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + d);
        const key = currentDate.toISOString().split("T")[0];
        
        const count = dateMap.get(key) ?? 0;
        const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
        
        week.push({ level, day: d });
      }
      grid.push(week);
    }
    return grid;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading dashboard insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400 px-4">
        <div className="glass-panel p-6 rounded-xl border border-red-900/50 max-w-md w-full text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const colors = ["bg-violet-500", "bg-cyan-500", "bg-emerald-500", "bg-amber-500", "bg-pink-500"];
  const totalArticles = data?.categories.reduce((acc, c) => acc + c.count, 0) || 1;
  const categoriesList = data?.categories.map((cat, idx) => ({
    name: cat.name,
    count: cat.count,
    percentage: `${Math.round((cat.count / totalArticles) * 100)}%`,
    color: colors[idx % colors.length]
  })) ?? [];

  const contributionWeeks = data ? getContributionGrid(data.articlesAddedDates) : [];
  const stats = data?.stats ?? { articlesRead: 0, readingTime: 0, streak: 0, vocabularyCount: 0, conceptsCount: 0 };
  const recentArticles = data?.recentArticles ?? [];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-900 glass-panel px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-outfit font-bold text-lg tracking-tight">AI Tech Reader</span>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="text-white border-b-2 border-violet-500 pb-1">Dashboard</span>
          <a href="/library" className="hover:text-white transition-colors">Library</a>
          <a href="/library?tab=vocabulary" className="hover:text-white transition-colors">Vocabulary</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-violet-400">
            {data?.userName.substring(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        
        {/* Top welcome & ingestion */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-extrabold text-3xl text-white">Hi, {data?.userName}!</h1>
            <p className="text-slate-400 text-sm mt-1">Ready to sync more knowledge into your developer second brain today?</p>
          </div>
          
          <div className="flex flex-col gap-1 max-w-md w-full">
            <form onSubmit={handleIngest} className="flex gap-2 w-full">
              <input
                type="url"
                required
                placeholder="Paste article URL to analyze..."
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-600 transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-sm font-medium flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? "Ingesting..." : "Ingest"}</span>
              </button>
            </form>
            {ingestError && (
              <span className="text-xs text-red-500 font-medium px-1 mt-1">{ingestError}</span>
            )}
          </div>
        </div>

        {/* Analytics Card Grid */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-2 relative overflow-hidden">
            <BookOpen className="w-4 h-4 text-violet-400 absolute right-4 top-4" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Articles Read</span>
            <span className="text-3xl font-bold font-outfit text-white">{stats.articlesRead}</span>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-2 relative overflow-hidden">
            <Clock className="w-4 h-4 text-cyan-400 absolute right-4 top-4" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reading Minutes</span>
            <span className="text-3xl font-bold font-outfit text-white">{stats.readingTime}</span>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-2 relative overflow-hidden">
            <Flame className="w-4 h-4 text-amber-500 absolute right-4 top-4" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Streak Days</span>
            <span className="text-3xl font-bold font-outfit text-white">{stats.streak} <span className="text-xs text-amber-500 font-normal">days</span></span>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-2 relative overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-4 top-4" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Words Saved</span>
            <span className="text-3xl font-bold font-outfit text-white">{stats.vocabularyCount}</span>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-2 relative overflow-hidden">
            <Brain className="w-4 h-4 text-pink-400 absolute right-4 top-4" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Concepts Map</span>
            <span className="text-3xl font-bold font-outfit text-white">{stats.conceptsCount}</span>
          </div>
        </section>

        {/* Streak contribution graph */}
        <section className="glass-panel p-6 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-violet-400" />
            <h2 className="font-outfit font-bold text-base text-white">Daily Reading Consistency</h2>
          </div>
          
          <div className="flex overflow-x-auto pb-2 gap-1 items-end min-h-[90px]">
            {contributionWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1 flex-shrink-0">
                {week.map((day, dIdx) => (
                  <div 
                    key={dIdx}
                    className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                      day.level === 0 ? "bg-slate-900 border border-slate-950" : 
                      day.level === 1 ? "bg-violet-950/40 border border-violet-900/20" : 
                      day.level === 2 ? "bg-violet-750" : "bg-violet-500"
                    }`}
                    title={`Day: Level ${day.level}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 text-xs text-slate-500 mt-3 items-center">
            <span>Less</span>
            <div className="w-3.5 h-3.5 rounded-sm bg-slate-900 border border-slate-950" />
            <div className="w-3.5 h-3.5 rounded-sm bg-violet-950/40" />
            <div className="w-3.5 h-3.5 rounded-sm bg-violet-750" />
            <div className="w-3.5 h-3.5 rounded-sm bg-violet-500" />
            <span>More</span>
          </div>
        </section>

        {/* Lower split column panel */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Recent Ingestion lists */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="font-outfit font-bold text-lg text-white">Recently Analyzed Articles</h2>
              </div>
              <a href="/library" className="text-xs text-slate-400 hover:text-violet-400 flex items-center transition-all">
                <span>View Library</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            {recentArticles.length === 0 ? (
              <div className="glass-panel p-8 rounded-xl border border-slate-900 text-center text-sm text-slate-500">
                No articles analyzed yet. Paste a URL above to start!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentArticles.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => router.push(`/articles/${article.id}`)}
                    className="glass-panel p-4 rounded-xl border border-slate-900 hover:border-slate-800 transition-all cursor-pointer flex justify-between items-center group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {article.sourceDomain}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(article.date)}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-violet-400 transition-colors truncate">
                        {article.title}
                      </h3>
                      
                      {/* Read progress bar */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-1 bg-slate-900 rounded-full flex-1 max-w-[120px] overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500" 
                            style={{ width: `${article.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {article.progress === 100 ? "Read" : `${article.progress}%`}
                        </span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">
                          {article.readTime} min read
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-violet-500 group-hover:bg-violet-950/20 flex items-center justify-center transition-all">
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-violet-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Technologies breakdown */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-pink-400" />
              <h2 className="font-outfit font-bold text-lg text-white">Taxonomy Breakdown</h2>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-4">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Top Categories Read</h3>
              {categoriesList.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">No data available</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {categoriesList.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300 truncate">{cat.name}</span>
                        <span className="text-slate-400 font-mono">{cat.count} art.</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${cat.color}`} 
                          style={{ width: cat.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>

      </main>

      <footer className="border-t border-slate-950 py-6 text-center text-xs text-slate-600 mt-12">
        <p>© 2026 AI Tech Reader. Developed by Antigravity team. Actively storing technical insights.</p>
      </footer>
    </div>
  );
}
