"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, BookOpen, MessageSquare, Send, AlertTriangle, Play, Globe
} from "lucide-react";

interface Vocabulary {
  word: string;
  definition: string;
  meaning: string;
  pronunciation: string;
  exampleSentence: string;
  whenToUse: string;
  difficulty: string;
  isMastered: boolean;
}

interface TechTerm {
  term: string;
  definition: string;
  whyItExists: string;
  howItWorks: string;
  architectureDesc: string;
  advantages: string[];
  disadvantages: string[];
  realWorldExamples: string[];
  relatedTech: string[];
  bestPractices: string[];
  commonMistakes: string[];
}

interface ArticleData {
  id: string;
  title: string;
  author: string;
  sourceDomain: string;
  sourceUrl: string;
  summary: string;
  difficulty: string;
  estimatedReadingTime: number;
  cleanMarkdown: string;
  translationMarkdown: string;
  keyPoints: string[];
  vocabularies: Vocabulary[];
  technicalTerms: TechTerm[];
  notes?: string;
}

export default function ArticleReader() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "translation" | "vocab" | "concepts" | "notes">("translation");
  const [notesText, setNotesText] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi! I am your Antigravity Assistant. Ask me anything about this article, or let me explain architecture details!" }
  ]);
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch(`http://localhost:3001/api/v1/articles/${articleId}`, {
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
        const data = await res.json();
        setArticle(data);
        setNotesText(data.notes || "");
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSaveNotes = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
      const res = await fetch(`http://localhost:3001/api/v1/articles/${articleId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ content: notesText })
      });
      if (!res.ok) {
        throw new Error(`Failed to save notes: ${res.statusText}`);
      }
      alert("Notes saved successfully!");
    } catch (err) {
      alert(`Error saving notes: ${(err as Error).message}`);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : "";
      let sessionId = activeChatSessionId;

      if (!sessionId) {
        const sessionRes = await fetch("http://localhost:3001/api/v1/chat/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({ title: `Discussion on ${article?.title || "Article"}` })
        });

        if (!sessionRes.ok) {
          throw new Error(`Failed to initialize chat session: ${sessionRes.statusText}`);
        }

        const sessionData = await sessionRes.json();
        sessionId = sessionData.id;
        setActiveChatSessionId(sessionId);
      }

      const res = await fetch(`http://localhost:3001/api/v1/chat/sessions/${sessionId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ message: userMsg, articleId })
      });

      if (!res.ok) throw new Error(`Chat API error: ${res.statusText}`);
      
      setIsTyping(false);
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";
      
      setChatMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const chunk = await reader?.read();
        if (chunk?.done) break;
        const text = decoder.decode(chunk?.value);
        const lines = text.split("\n").filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                aiResponseText += parsed.token;
                setChatMessages(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1].content = aiResponseText;
                  return copy;
                });
              }
            } catch (err) {
              /* ignore chunk error */
            }
          }
        }
      }
    } catch (err) {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error: ${(err as Error).message}` }]);
    }
  };

  const playPronunciation = (word: string) => {
    if (typeof window !== "undefined") {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      synth.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <span>Synchronizing technical knowledge...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center bg-slate-950 text-slate-400 px-4">
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

  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <p className="text-sm">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Header */}
      <header className="border-b border-slate-900 glass-panel px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div>
            <h1 className="font-outfit font-bold text-sm truncate max-w-[400px]">
              {article.title}
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Source: <a href={article.sourceUrl} target="_blank" className="hover:text-cyan-400 underline">{article.sourceDomain}</a> • By {article.author}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
            {article.difficulty}
          </span>
          <span className="text-xs text-slate-500">
            {article.estimatedReadingTime} min read
          </span>
        </div>
      </header>

      {/* Main Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: Reader & Knowledge (65% width) */}
        <div className="w-[65%] flex flex-col h-full border-r border-slate-900">
          
          {/* Navigation tab menu */}
          <div className="flex bg-slate-950 border-b border-slate-900 px-4 py-1.5 flex-shrink-0 gap-2 overflow-x-auto">
            {["overview", "translation", "vocab", "concepts", "notes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "overview" | "translation" | "vocab" | "concepts" | "notes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? "bg-violet-600 text-white" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {tab === "vocab" ? "Vocabulary" : tab === "concepts" ? "Tech Concepts" : tab}
              </button>
            ))}
          </div>

          {/* Scrolling viewer pane */}
          <div className="flex-grow overflow-y-auto p-6 bg-slate-950/40">
            
            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <div>
                  <h2 className="font-outfit font-extrabold text-2xl text-white mb-2">Executive Summary</h2>
                  <p className="text-slate-400 text-sm leading-relaxed bg-slate-900/40 border border-slate-900 p-4 rounded-xl">
                    {article.summary}
                  </p>
                </div>

                <div>
                  <h3 className="font-outfit font-bold text-lg text-white mb-3">Key Takeaways</h3>
                  <ul className="space-y-3">
                    {article.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-300 items-start">
                        <div className="w-5 h-5 rounded-full bg-violet-950/60 border border-violet-800/30 flex items-center justify-center text-[10px] font-bold text-violet-400 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Translation tab */}
            {activeTab === "translation" && (
              <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
                
                {/* English original */}
                <div className="flex flex-col gap-4 border-r border-slate-900 pr-6">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>English Original</span>
                  </div>
                  <div className="space-y-4 text-slate-300 font-serif leading-relaxed text-base">
                    {article.cleanMarkdown.split("\n\n").map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Translation Target */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 uppercase tracking-wider border-b border-slate-900 pb-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Vietnamese Translation</span>
                  </div>
                  <div className="space-y-4 text-slate-300 font-serif leading-relaxed text-base">
                    {article.translationMarkdown.split("\n\n").map((p, idx) => {
                      // Simple implementation demonstrating terminology conservation highlights
                      return (
                        <p key={idx}>
                          {p.split(/(Hydration|use client|React Server Components|JavaScript)/g).map((word, wIdx) => {
                            if (word === "Hydration" || word === "use client" || word === "React Server Components") {
                              return (
                                <span key={wIdx} className="tech-term-highlight" title="Click glossary tab for details">
                                  {word}
                                </span>
                              );
                            }
                            return word;
                          })}
                        </p>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Vocabulary tab */}
            {activeTab === "vocab" && (
              <div className="max-w-2xl mx-auto flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-outfit font-bold text-lg text-white">Linguistic Glossary</h3>
                  <span className="text-xs text-slate-500">{article.vocabularies.length} Words Identified</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {article.vocabularies.map((v, idx) => (
                    <div key={idx} className="glass-panel p-5 rounded-xl border border-slate-900 flex flex-col gap-3 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-outfit font-extrabold text-base text-white">{v.word}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{v.pronunciation}</span>
                          </div>
                          <span className="text-xs text-violet-400 font-semibold">{v.meaning}</span>
                        </div>
                        <button 
                          onClick={() => playPronunciation(v.word)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white"
                          title="Speak Pronunciation"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-900/60 pt-2 flex flex-col gap-1.5">
                        <div>
                          <span className="text-slate-500 font-semibold">Meaning:</span> {v.definition}
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold">Example:</span> <i className="text-slate-300">"{v.exampleSentence}"</i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concepts tab */}
            {activeTab === "concepts" && (
              <div className="max-w-3xl mx-auto flex flex-col gap-6">
                <h3 className="font-outfit font-bold text-lg text-white mb-2">Architectural Glossary</h3>

                {article.technicalTerms.map((term, idx) => (
                  <div key={idx} className="glass-panel p-6 rounded-xl border border-slate-900 flex flex-col gap-5">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Saved Tech Concept</span>
                      <h4 className="font-outfit font-extrabold text-xl text-white mt-1">{term.term}</h4>
                      <p className="text-slate-300 text-sm mt-2 leading-relaxed bg-slate-900/40 border border-slate-900/60 p-3 rounded-lg">
                        {term.definition}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">Why it exists</span>
                        <span className="text-slate-300 leading-relaxed">{term.whyItExists}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider">How it works</span>
                        <span className="text-slate-300 leading-relaxed">{term.howItWorks}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-slate-900/80 pt-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-emerald-400 font-semibold uppercase tracking-wider">Advantages</span>
                        <ul className="space-y-1">
                          {term.advantages.map((a, i) => <li key={i} className="flex gap-1.5 items-center text-slate-300">✓ {a}</li>)}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-rose-400 font-semibold uppercase tracking-wider">Disadvantages</span>
                        <ul className="space-y-1">
                          {term.disadvantages.map((d, i) => <li key={i} className="flex gap-1.5 items-center text-slate-300">✗ {d}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="text-xs border-t border-slate-900/80 pt-4 flex flex-col gap-1">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Common Mistakes</span>
                      <ul className="space-y-1">
                        {term.commonMistakes.map((m, i) => (
                          <li key={i} className="flex gap-1.5 items-start text-slate-400">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Notes tab */}
            {activeTab === "notes" && (
              <div className="max-w-2xl mx-auto flex flex-col gap-4 h-full">
                <div className="flex justify-between items-center">
                  <h3 className="font-outfit font-bold text-lg text-white">Study Notes</h3>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Take persistent markdown notes on design rules or compiler optimizations here..."
                  className="flex-grow min-h-[350px] w-full p-4 rounded-xl bg-slate-950 border border-slate-900 text-sm font-sans focus:outline-none focus:border-violet-600 resize-none text-slate-300 leading-relaxed"
                />
              </div>
            )}

          </div>
        </div>

        {/* Right Pane: AI Assistant Chat (35% width) */}
        <div className="w-[35%] flex flex-col h-full bg-slate-950/40">
          <div className="px-4 py-3 border-b border-slate-900 flex items-center justify-between bg-slate-950 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="font-outfit font-bold text-xs uppercase tracking-wider">Ask AI Assistant</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              RAG Active
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
            {chatMessages.map((msg, index) => (
              <div 
                key={index}
                className={`max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-violet-600 text-white self-end" 
                    : "bg-slate-900 border border-slate-900 text-slate-300 self-start"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="bg-slate-900 border border-slate-900 text-slate-300 max-w-[80%] rounded-xl px-3 py-2.5 self-start text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-950 flex-shrink-0 flex gap-2">
            <input
              type="text"
              required
              placeholder="Ask about hydration or server actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-600 transition-all"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
