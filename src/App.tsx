import React, { useState, useEffect } from "react";
import { Message } from "./types";
import AboutPanel from "./components/AboutPanel";
import ChatPanel from "./components/ChatPanel";
import TokenMinigameModal from "./components/TokenMinigameModal";
import TechStatsModal from "./components/TechStatsModal";
import { AlertCircle, Bot, Network, ShieldCheck, DollarSign, RefreshCw, ChevronDown, ChevronUp, FileText, Coins } from "lucide-react";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-message",
      role: "assistant",
      text: "Hi, you are interested about this person.\n\nPlease select one of the inquiry modes below to formulate a guided track, or type any specific questions about Amirul in the input below:",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isIntro: true,
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom states for dynamic limits and paying bills prompt outcome
  const [maxQuestions, setMaxQuestions] = useState<number>(() => {
    const saved = localStorage.getItem("amirul_max_questions");
    return saved ? parseInt(saved, 10) : 10;
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [pendingBillQuestion, setPendingBillQuestion] = useState("");
  const [isResumeExpanded, setIsResumeExpanded] = useState(false);

  // Synchronize dynamic limit changes automatically to persistent localStorage
  useEffect(() => {
    localStorage.setItem("amirul_max_questions", maxQuestions.toString());
  }, [maxQuestions]);

  // Handler to add free sandbox tokens (allows more than 10 tokens to be collected)
  function handleAddTokens(amount: number) {
    setMaxQuestions((prev) => prev + amount);
  }

  const remaining = Math.max(0, maxQuestions - questionCount);
  const isLastQuestion = remaining === 1; // Exactly 1 question left within the contextual limit
  const isLimitReached = remaining === 0;

  // Handles clicking suggested questions from the AboutPanel
  function handleSuggestQuestion(question: string) {
    if (isLoading || isLimitReached) return;
    setInputValue(question);
  }

  // Helper to dynamically update properties on a message
  function handleUpdateMessage(msgId: string, updatedFields: Partial<Message>) {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, ...updatedFields } : msg))
    );
  }

  // Handles quick option clicks from the intro message
  async function handleSelectIntroOption(option: "EMPLOYER" | "BUSINESS_RELATIONS" | "ROMANTIC") {
    if (isLoading || isLimitReached) return;

    if (option === "ROMANTIC") {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        text: "Are you interested in romantic relations?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Interactive Relationship Calibration Survey has been initialized. Please complete the following alignment assessment:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRomanticSurvey: true,
        romanticSurveyStep: 1,
        romanticSurveyAnswers: {
          straight: "",
          female: "",
          bdsm: "",
          iceCream: "",
        },
        romanticSurveyCompleted: false,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      return;
    }

    let questionText = "";
    if (option === "EMPLOYER") {
      questionText = "What is Amirul's professional background and achievements from an Employer's perspective?";
    } else {
      questionText = "I want to explore business relations. What skills, freelance offerings, or solutions can Amirul construct for our company?";
    }

    setIsLoading(true);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextQuestionCount = questionCount + 1;
    setQuestionCount(nextQuestionCount);
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: questionText,
          questionCount: questionCount,
          maxQuestions: maxQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failure communicating with the server-side assistant module.");
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "I apologize, but I encountered issues accessing Amirul's career data. Please attempt again in a brief moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  // Intercept bill paying prompts to offer dynamic outcome flow
  function handleBillChoice(isYes: boolean) {
    setIsPopupOpen(false);

    const nextQuestionCount = questionCount + 1;
    setQuestionCount(nextQuestionCount);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: pendingBillQuestion || "Is Amirul interested in paying my bills?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyText = "";
    if (isYes) {
      setMaxQuestions(15);
      replyText = "YES! How incredibly generous of you. Amirul's cloud hosting invoices, server database storages, and coffee supply lines are now sponsored by your goodwill! Your sandbox limit is dynamically upgraded to 15 questions. Thank you for supporting career engineering.";
    } else {
      setMaxQuestions(9);
      replyText = "No. The requested bill coverage has been declined. As a precaution, your sandbox session quota is permanently reduced to 9 questions as penalty.";
    }

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setPendingBillQuestion("");
  }

  // Handle submit form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const lowerInput = inputValue.toLowerCase().trim();
    // Match queries discussing paying Amirul's or user's bills
    if (
      lowerInput.includes("bill") ||
      lowerInput.includes("paying bills") ||
      lowerInput.includes("pay bills") ||
      lowerInput.includes("amiruls bills") ||
      lowerInput.includes("amirul's bills") ||
      lowerInput.includes("paying amiruls bills") ||
      lowerInput.includes("paying amirul's bills") ||
      lowerInput.includes("pay my bills") ||
      lowerInput.includes("paying my bills")
    ) {
      setPendingBillQuestion(inputValue);
      setInputValue("");
      setIsPopupOpen(true);
      return;
    }

    // Check if current question count exceeds limits
    if (questionCount >= maxQuestions) {
      const staticResponse: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `No. The question limit of ${maxQuestions} for this session has been fully reached. Thank you for using AMIRU-LLM. For more information, please visit amirul.cloud or contact Amirul directly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          text: inputValue,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        staticResponse,
      ]);
      setInputValue("");
      return;
    }

    const currentQuestionText = inputValue;
    setInputValue("");
    setIsLoading(true);

    // 1. Add User Message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: currentQuestionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextQuestionCount = questionCount + 1;
    setQuestionCount(nextQuestionCount);
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Trigger API post request conveying the specific limit state
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentQuestionText,
          questionCount: questionCount,
          maxQuestions: maxQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failure communicating with the server-side assistant module.");
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "I apologize, but I encountered issues accessing Amirul's career data. Please attempt again in a brief moment or review details on amirul.cloud.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      id="app-root-container"
      className={`min-h-screen relative flex flex-col font-sans transition-all duration-750 ease-in-out select-none bg-[#050505] text-[#d4d4d8] ${
        isLastQuestion
          ? "border-t-4 border-rose-500 shadow-[inset_0_0_80px_rgba(239,68,68,0.1)]"
          : "border-t-4 border-emerald-550/40 animate-neon-pulse"
      }`}
    >
      {/* Decorative cybernetic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-10">
        <div
          className={`absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full filter blur-[120px] transition-colors duration-1000 ${
            isLastQuestion ? "bg-rose-600/20" : "bg-emerald-600/10"
          }`}
        />
        <div
          className={`absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full filter blur-[150px] transition-colors duration-1000 ${
            isLastQuestion ? "bg-red-700/15" : "bg-cyan-600/10"
          }`}
        />
      </div>

      {/* Sophisticated Dark Header Navbar */}
      <header
        id="app-navbar"
        className={`relative z-10 px-8 py-5 border-b transition-colors duration-500 flex items-center justify-between ${
          isLastQuestion
            ? "border-rose-950 bg-rose-950/20"
            : "border-[#141414] bg-[#080808]"
        } backdrop-blur-md`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-md transition-all ${
              isLastQuestion
                ? "bg-rose-950/60 border-rose-800 text-rose-450 scale-105"
                : "bg-[#090909] border-[#161616] text-emerald-400"
            }`}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider text-white uppercase font-sans flex items-center gap-1.5">
              AMIRU-LLM
              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isLastQuestion
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                    : "bg-[#0d0d0d] border-[#1a1a1a] text-zinc-400"
                }`}
              >
                {isLastQuestion ? "FINAL TOKEN MODE" : "COSMIC v1.1"}
              </span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase mt-0.5">
              Refined Representative Unit
            </p>
          </div>
        </div>

        {/* Global Action items */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsStatsModalOpen(true)}
            style={{ contentVisibility: "auto" }}
            className={`px-4.5 py-2.5 text-[10px] uppercase tracking-widest font-mono font-bold rounded-full border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              isLastQuestion
                ? "bg-rose-950/80 hover:bg-rose-900 text-rose-350 border-rose-800"
                : "bg-cyan-950/25 hover:bg-cyan-900/30 text-cyan-400 border-cyan-950 hover:border-cyan-500/40"
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            System Metrics
          </button>

          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-zinc-650">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <Network className="w-3.5 h-3.5 text-emerald-500" />
              PORTAL SECURE
            </span>
          </div>
          <a
            href="https://amirul.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-5 py-2.5 text-[10px] uppercase tracking-widest font-mono font-medium rounded-full border transition-all ${
              isLastQuestion
                ? "bg-rose-950 hover:bg-rose-900 text-rose-300 border-rose-950 hover:border-rose-900 shadow-lg shadow-rose-950/20"
                : "bg-[#080808] hover:bg-[#121212] text-zinc-300 border-[#1a1a1a] hover:border-zinc-700/80"
            }`}
          >
            amirul.cloud
          </a>
        </div>
      </header>

      {/* Elegant Top Countdown Row representing renovated theme coloring */}
      <div className={`relative z-10 px-8 py-3.5 border-b transition-colors duration-500 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 ${
        isLastQuestion
          ? "bg-rose-950/10 border-rose-950/80 text-rose-300"
          : "bg-[#070707] border-[#141414] text-zinc-400"
      }`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-mono tracking-widest text-[#52525b] uppercase">SANDBOX TOKENS:</span>
          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-zinc-850 px-3 py-1 rounded-lg">
            <span className={`text-xs font-mono font-bold ${
              isLastQuestion ? "text-rose-400 animate-pulse" : isLimitReached ? "text-zinc-600" : "text-emerald-400"
            }`}>
              {remaining.toString().padStart(2, "0")} / {maxQuestions.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-zinc-550 font-mono">AVAILABLE</span>
          </div>

          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 border border-emerald-900/40 hover:border-emerald-500 rounded-lg transition-all animate-pulse duration-1000 active:scale-95 cursor-pointer ml-1.5"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            + Add More Tokens
          </button>
        </div>

        {/* Dynamic Progress indicator representing neon lights revamped theme */}
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <div className="flex justify-between items-center mb-1 text-[9px] font-mono text-zinc-500 uppercase">
            <span>Quota Usage</span>
            <span>{Math.round((remaining / maxQuestions) * 100)}% Remaining</span>
          </div>
          <div className="h-1.5 w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isLastQuestion ? "bg-rose-500 animate-pulse" : "bg-gradient-to-r from-emerald-500 to-cyan-400 animate-rgb-bar"
              }`}
              style={{ width: `${(remaining / maxQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono select-none">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isLastQuestion ? "bg-rose-500 animate-ping" : "bg-emerald-500"}`} />
            <span className="text-zinc-300 font-semibold">{isLastQuestion ? "CRITICAL OUTCOME WARNING" : "THEME MORPH SECURE"}</span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">Career Guard v1.1 Active</span>
        </div>
      </div>

      {/* Main Grid Panels Container */}
      <main id="app-main-layout" className="relative z-10 flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Chat Assistant Panel (On Top) */}
        <div className="flex flex-col h-[520px] min-h-[450px]">
          <ChatPanel
            messages={messages}
            inputValue={inputValue}
            onChangeInput={setInputValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            questionCount={questionCount}
            maxQuestions={maxQuestions}
            onSelectIntroOption={handleSelectIntroOption}
            onUpdateMessage={handleUpdateMessage}
          />
        </div>

        {/* Collapsible Resume Panel (At Bottom) */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
          <button
            onClick={() => setIsResumeExpanded(!isResumeExpanded)}
            className="w-full flex items-center justify-between p-5 text-left bg-[#0c0c0c] hover:bg-[#121212] transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222] flex items-center justify-center text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Interactive Resume & Portfolio Database
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  {isResumeExpanded ? "Click to collapse and hide database info" : "Click to view Amirul's academic background, skills, and scientific publications"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#141414] px-2.5 py-1 rounded border border-[#222] text-zinc-400">
                {isResumeExpanded ? "Collapse" : "Expand"}
              </span>
              {isResumeExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400 animate-bounce" style={{ animationDuration: '3s' }} />
              )}
            </div>
          </button>

          {isResumeExpanded && (
            <div className="p-6 border-t border-[#1a1a1a] bg-[#050505] animate-fadeIn max-h-[600px] overflow-y-auto">
              <AboutPanel onSuggestQuestion={handleSuggestQuestion} />
            </div>
          )}
        </div>
      </main>

      {/* Last Question Warning overlay banner */}
      {isLastQuestion && (
        <div id="alarm-banner" className="fixed bottom-0 left-0 right-0 z-40 py-2 bg-rose-600/95 text-white font-mono text-[11px] font-semibold text-center uppercase tracking-widest pointer-events-none select-none flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> WARNING: CURRENTLY TYPING THE LAST INTERACTIVE QUESTION. VIEW COLOR MORPH ACTIVE.
        </div>
      )}

      {/* Custom CSS Popup Overlay for Paying Amirul's Bills */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020202]/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden text-center">
            {/* Emerald neon light breathing bar inside the popup */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-cyan-500/20 animate-rgb-bar" />
            
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-950/40 border border-emerald-555/20 text-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 font-normal" />
              </div>
              <h3 className="text-lg font-serif italic text-white leading-tight mt-1">
                AMIRU-LLM Funding Authorization
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Verification Required
              </p>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed px-2">
              An automated recruitment delegate is technically unauthorized to cover personal living costs under baseline terms.
              <br/>
              <span className="text-emerald-500 font-semibold block mt-3">
                Are you interested in paying Amirul's bills?
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                id="bill-btn-yes"
                onClick={() => handleBillChoice(true)}
                className="w-full py-3.5 bg-emerald-955/65 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-450 text-[11px] font-mono font-bold uppercase rounded-xl tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95"
              >
                Yes, Absolutely
              </button>
              <button
                id="bill-btn-no"
                onClick={() => handleBillChoice(false)}
                className="w-full py-3.5 bg-[#0e0a0b] hover:bg-[#1a0f12] border border-rose-950 text-rose-450 hover:text-rose-400 text-[11px] font-mono font-bold uppercase rounded-xl tracking-wider transition-all duration-300 active:scale-95"
              >
                No, Decline
              </button>
            </div>

            <span className="text-[9px] font-mono text-zinc-650 hover:text-zinc-500 mt-1 cursor-default transition-colors select-none">
              YES upgrades to 15 questions. NO penalizes to 9.
            </span>
          </div>
        </div>
      )}

      {/* Persistent Token Minigame Overlay (Whack-a-Mole + Core Tapper) */}
      <TokenMinigameModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onAddTokens={handleAddTokens}
        currentMaxTokens={maxQuestions}
      />

      {/* Persistent System Resource Metrics & Telemetry Modal */}
      <TechStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        questionCount={questionCount}
      />
    </div>
  );
}
