"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Brain, Calendar, Clock, Flame, 
  Plus, CheckCircle2, ChevronRight, BarChart3, ArrowUpRight
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [ingestUrl, setIngestUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock dashboard analytical data
  const stats = {
    articlesRead: 14,
    readingTime: 185, // in minutes
    streak: 6,
    vocabularyCount: 38,
    conceptsCount: 12
  };

  const categories = [
    { name: "Frontend Development", count: 6, percentage: "42%", color: "bg-violet-500" },
    { name: "System Design & Architecture", count: 4, percentage: "28%", color: "bg-cyan-500" },
    { name: "DevOps & Cloud Systems", count: 3, percentage: "21%", color: "bg-emerald-500" },
    { name: "AI & Vector Pipelines", count: 1, percentage: "9%", color: "bg-amber-500" }
  ];

  const recentArticles = [
    {
      id: "mock-article-uuid",
      title: "React 19 Server Components Explained",
      sourceDomain: "nextjs.org",
      category: "Frontend Dev",
      progress: 85,
      readTime: 5,
      date: "Today"
    },
    {
      id: "redis-caching-uuid",
      title: "Building High-Throughput Job Queues with Redis and BullMQ",
      sourceDomain: "dev.to",
      category: "System Design",
      progress: 100,
      readTime: 12,
      date: "Yesterday"
    },
    {
      id: "docker-multistage-uuid",
      title: "Optimizing Docker Images for Next.js Deployments",
      sourceDomain: "medium.engineering",
      category: "DevOps",
      progress: 30,
      readTime: 8,
      date: "3 days ago"
    }
  ];

  // Helper for generating reading contribution grid (mocking the last 15 weeks)
  const contributionWeeks = Array.from({ length: 22 }, () => {
    return Array.from({ length: 7 }, (_, dIndex) => {
      // Create random reading intensity: 0 (none), 1 (light), 2 (medium), 3 (heavy)
      const val = Math.floor(Math.random() * 4);
      return {
        level: val === 3 && Math.random() > 0.4 ? 2 : val,
        day: dIndex
      };
    });
  });

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestUrl.trim()) return;
    setIsSubmitting(true);
    
    // Simulate ingestion trigger, then route
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/articles/mock-article-uuid");
    }, 1500);
  };

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
            S
          </div>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        
        {/* Top welcome & ingestion */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-extrabold text-3xl text-white">Hi, Sora!</h1>
            <p className="text-slate-400 text-sm mt-1">Ready to sync more knowledge into your developer second brain today?</p>
          </div>
          
          <form onSubmit={handleIngest} className="flex gap-2 max-w-md w-full">
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
                        {article.date}
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
          </div>

          {/* Top Technologies breakdown */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-pink-400" />
              <h2 className="font-outfit font-bold text-lg text-white">Taxonomy Breakdown</h2>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-4">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Top Categories Read</h3>
              <div className="flex flex-col gap-4">
                {categories.map((cat, idx) => (
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
