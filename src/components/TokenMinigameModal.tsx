import React, { useState, useEffect, useRef } from "react";
import { X, Coins, Target, Trophy, Zap, Plus, RotateCcw, Sparkles, Award } from "lucide-react";

interface TokenMinigameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTokens: (amount: number) => void;
  currentMaxTokens: number;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  cps: number;
  timestamp: string;
}

interface MoleLeaderboardEntry {
  id: string;
  username: string;
  score: number;
  timestamp: string;
}

export default function TokenMinigameModal({
  isOpen,
  onClose,
  onAddTokens,
  currentMaxTokens,
}: TokenMinigameModalProps) {
  const [activeTab, setActiveTab] = useState<"clicker" | "whackamole">("clicker");

  // State for Clicker game
  const [clicks, setClicks] = useState(0);
  const [clickerSuccess, setClickerSuccess] = useState(false);
  const [clickerStartTime, setClickerStartTime] = useState<number | null>(null);
  const [clickerEndTime, setClickerEndTime] = useState<number | null>(null);
  const [currentCps, setCurrentCps] = useState<number>(0);
  const [recordSaved, setRecordSaved] = useState(false);
  const [newRecordName, setNewRecordName] = useState("Sandbox Runner");

  // State for Romantic Relationship Quiz (CPS < 0.2 path)
  const [surveyStep, setSurveyStep] = useState<number>(1);
  const [straightAns, setStraightAns] = useState<string>("");
  const [biologicalAns, setBiologicalAns] = useState<string>("");
  const [bdsmAns, setBdsmAns] = useState<string>("");
  const [iceCreamAns, setIceCreamAns] = useState<string>("");

  // Leaderboard state & persistent storage
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem("clicker_leaderboard_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading clicker leaderboard:", e);
      }
    }
    return [
      { id: "1", username: "Amirul_Bot", cps: 8.74231, timestamp: "2026-05-28" },
      { id: "2", username: "Core_Overclocker", cps: 7.91523, timestamp: "2026-05-28" },
      { id: "3", username: "Sandbox_Pro", cps: 6.24180, timestamp: "2026-05-29" },
    ];
  });

  // Track and save updates to browser storage
  useEffect(() => {
    localStorage.setItem("clicker_leaderboard_v1", JSON.stringify(leaderboard));
  }, [leaderboard]);

  // State for Mole Whacker Leaderboard
  const [moleLeaderboard, setMoleLeaderboard] = useState<MoleLeaderboardEntry[]>(() => {
    const saved = localStorage.getItem("mole_leaderboard_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading mole leaderboard:", e);
      }
    }
    return [
      { id: "1", username: "Infiltrator_Prime", score: 14, timestamp: "2026-05-28" },
      { id: "2", username: "Grid_Ghost", score: 11, timestamp: "2026-05-29" },
      { id: "3", username: "Cortex_Hoverer", score: 8, timestamp: "2026-05-29" },
    ];
  });

  // Track and save updates to browser storage
  useEffect(() => {
    localStorage.setItem("mole_leaderboard_v1", JSON.stringify(moleLeaderboard));
  }, [moleLeaderboard]);

  const [moleRecordSaved, setMoleRecordSaved] = useState(false);
  const [newMoleRecordName, setNewMoleRecordName] = useState("Infiltration Agent");

  // State for Whack-A-Mole game
  const [isPlayingMole, setIsPlayingMole] = useState(false);
  const [moleScore, setMoleScore] = useState(0);
  const [moleTimeLeft, setMoleTimeLeft] = useState(15);
  const [activeMoleIndex, setActiveMoleIndex] = useState<number | null>(null);
  const [moleGameOutcome, setMoleGameOutcome] = useState<"won" | "lost" | null>(null);

  const moleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const moleCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effects or visual flashes
  const [lastHitIdx, setLastHitIdx] = useState<number | null>(null);
  const [floatingText, setFloatingText] = useState<{ id: string; x: number; y: number; text: string }[]>([]);

  // Cleanup on unmount or tab switch
  useEffect(() => {
    return () => {
      stopMoleGame();
    };
  }, []);

  useEffect(() => {
    stopMoleGame();
    resetMoleGame();
    // Reset clicker too
    setClicks(0);
    setClickerSuccess(false);
    setClickerStartTime(null);
    setClickerEndTime(null);
    setCurrentCps(0);
    setRecordSaved(false);
    setMoleRecordSaved(false);
    setSurveyStep(1);
    setStraightAns("");
    setBiologicalAns("");
    setBdsmAns("");
    setIceCreamAns("");
  }, [activeTab]);

  // Clicking Clicker core
  function handleClickerCore(e: React.MouseEvent<HTMLButtonElement>) {
    if (clickerSuccess) return;

    const now = Date.now();
    let startTime = clickerStartTime;

    if (clicks === 0) {
      startTime = now;
      setClickerStartTime(now);
    }

    const nextClicks = clicks + 1;
    let computedCps = 0;

    if (startTime) {
      const elapsed = (now - startTime) / 1000;
      if (elapsed > 0) {
        computedCps = nextClicks / elapsed;
        setCurrentCps(computedCps);
      }
    }

    // Trigger floating message
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = crypto.randomUUID();
    const speedText = computedCps > 0 ? `${computedCps.toFixed(2)} CPS` : "+1 Tap";

    setFloatingText((prev) => [...prev, { id: newId, x, y, text: speedText }]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== newId));
    }, 800);

    if (nextClicks >= 10) {
      setClicks(10);
      setClickerSuccess(true);
      setClickerEndTime(now);

      const finalStartTime = startTime || now;
      const totalTimeSec = Math.max(0.01, (now - finalStartTime) / 1000);
      const finalCps = 10 / totalTimeSec;
      setCurrentCps(finalCps);
      setRecordSaved(false);
      setNewRecordName(`Inquirer_${Math.floor(100 + Math.random() * 900)}`);
      
      // Award tokens based on custom CPS patience speed or speed tiers
      if (finalCps < 0.2) {
        onAddTokens(1000000);
      } else if (finalCps < 0.5) {
        onAddTokens(10);
      } else if (finalCps < 2) {
        onAddTokens(3);
      } else {
        onAddTokens(1);
      }
    } else {
      setClicks(nextClicks);
    }
  }

  function handleResetClicker() {
    setClicks(0);
    setClickerSuccess(false);
    setClickerStartTime(null);
    setClickerEndTime(null);
    setCurrentCps(0);
    setRecordSaved(false);
    setSurveyStep(1);
    setStraightAns("");
    setBiologicalAns("");
    setBdsmAns("");
    setIceCreamAns("");
  }

  function handleSaveLeaderboard() {
    if (recordSaved) return;

    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      username: newRecordName.trim() || "Anonymous",
      cps: currentCps,
      timestamp: new Date().toLocaleDateString(),
    };

    setLeaderboard((prev) => {
      const updated = [...prev, newEntry];
      updated.sort((a, b) => b.cps - a.cps);
      return updated.slice(0, 5); // Keep top 5 only
    });
    setRecordSaved(true);
  }

  function handleClearLeaderboard() {
    setLeaderboard([]);
  }

  // Whack A Mole actions
  function startMoleGame() {
    setIsPlayingMole(true);
    setMoleScore(0);
    setMoleTimeLeft(15);
    setMoleGameOutcome(null);
    spawnMole();

    // Mole movement interval
    moleIntervalRef.current = setInterval(() => {
      spawnMole();
    }, 750); // Fast response cycle for reactive feel

    // Time ticker interval
    moleCountdownRef.current = setInterval(() => {
      setMoleTimeLeft((prev) => {
        if (prev <= 1) {
          stopMoleGame();
          // Evaluate outcome
          setMoleTimeLeft(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function spawnMole() {
    setActiveMoleIndex((prevIdx) => {
      let nextIdx = Math.floor(Math.random() * 9);
      while (nextIdx === prevIdx) {
        nextIdx = Math.floor(Math.random() * 9);
      }
      return nextIdx;
    });
  }

  function stopMoleGame() {
    if (moleIntervalRef.current) clearInterval(moleIntervalRef.current);
    if (moleCountdownRef.current) clearInterval(moleCountdownRef.current);
    setIsPlayingMole(false);
    setActiveMoleIndex(null);
  }

  // When timer reaches 0, evaluate score
  useEffect(() => {
    if (moleTimeLeft === 0 && !isPlayingMole && moleGameOutcome === null && moleScore > 0) {
      if (moleScore >= 5) {
        setMoleGameOutcome("won");
        onAddTokens(3);
      } else {
        setMoleGameOutcome("lost");
      }
    }
  }, [moleTimeLeft, isPlayingMole, moleScore]);

  function resetMoleGame() {
    stopMoleGame();
    setMoleScore(0);
    setMoleTimeLeft(15);
    setMoleGameOutcome(null);
    setActiveMoleIndex(null);
    setMoleRecordSaved(false);
    setNewMoleRecordName(`Hacker_${Math.floor(100 + Math.random() * 900)}`);
  }

  function handleSaveMoleLeaderboard() {
    if (moleRecordSaved) return;

    const newEntry: MoleLeaderboardEntry = {
      id: crypto.randomUUID(),
      username: newMoleRecordName.trim() || "Anonymous",
      score: moleScore,
      timestamp: new Date().toLocaleDateString(),
    };

    setMoleLeaderboard((prev) => {
      const updated = [...prev, newEntry];
      updated.sort((a, b) => b.score - a.score);
      return updated.slice(0, 5); // Keep top 5 only
    });
    setMoleRecordSaved(true);
  }

  function handleClearMoleLeaderboard() {
    setMoleLeaderboard([]);
  }

  function handleWhackMole(idx: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (!isPlayingMole || activeMoleIndex !== idx) return;

    // Score point
    setMoleScore((prev) => prev + 1);
    setLastHitIdx(idx);
    setTimeout(() => setLastHitIdx(null), 150);

    // Dynamic prompt hit visual text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = crypto.randomUUID();
    setFloatingText((prev) => [...prev, { id: newId, x, y, text: "+1 HIT!" }]);
    setTimeout(() => {
      setFloatingText((prev) => prev.filter((item) => item.id !== newId));
    }, 800);

    // Immediately spawn new mole to maintain rapid kinetic feel
    spawnMole();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col relative overflow-hidden shadow-2xl">
        {/* Neon accent top border */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-[#141414] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center text-emerald-400 animate-pulse">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Core Token Generator
              </h3>
              <p className="text-[9px] text-zinc-500 font-mono">
                Current limit: <span className="text-emerald-400 font-bold">{currentMaxTokens} tokens</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#111] hover:bg-[#222] text-zinc-400 hover:text-white flex items-center justify-center transition-all focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs switcher */}
        <div className="mx-6 mt-4 p-1 bg-[#0e0e0e] border border-[#161616] rounded-xl grid grid-cols-2">
          <button
            onClick={() => setActiveTab("clicker")}
            className={`py-2 text-[10px] font-mono uppercase tracking-widest font-bold rounded-lg transition-all ${
              activeTab === "clicker"
                ? "bg-[#141414] text-emerald-400 border border-[#222] shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🖱️ Tap Clicker (+1 Cores)
          </button>
          <button
            onClick={() => setActiveTab("whackamole")}
            className={`py-2 text-[10px] font-mono uppercase tracking-widest font-bold rounded-lg transition-all ${
              activeTab === "whackamole"
                ? "bg-[#141414] text-cyan-400 border border-[#222] shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            🎯 Hover mole whacker (+3 Cores)
          </button>
        </div>

        {/* Info panel */}
        <div className="px-6 pt-4 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-sm mx-auto">
            {activeTab === "clicker"
              ? "Overclock the prompt synthesizer engine! Tap the core core 10 times to unlock +1 free sandbox token instantly."
              : "Infiltrate the network array node! Hover over at least 5 nodes within 15 seconds to receive +3 free sandbox tokens."}
          </p>
        </div>

        {/* Contents area */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[280px]">
          {activeTab === "clicker" ? (
            <div className="flex flex-col items-center gap-5 w-full max-w-sm relative">
              {/* Tap feedback container */}
              <div className="relative">
                {/* Floating tags */}
                {floatingText.map((item) => (
                  <span
                    key={item.id}
                    style={{ left: item.x - 20, top: item.y - 40 }}
                    className="absolute pointer-events-none text-emerald-400 font-mono text-[10px] uppercase font-bold animate-float-fade z-20"
                  >
                    {item.text}
                  </span>
                ))}

                <button
                  onClick={handleClickerCore}
                  disabled={clickerSuccess}
                  style={{ transform: !clickerSuccess ? `scale(${1 + clicks * 0.02})` : "none" }}
                  className={`w-32 h-32 rounded-full border flex flex-col items-center justify-center transition-all duration-200 relative select-none cursor-pointer group mx-auto ${
                    clickerSuccess
                      ? "bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : "bg-[#0b0b0b] hover:bg-emerald-950/10 border-[#1c1c1c] hover:border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <div className="absolute inset-2 border border-dashed border-emerald-900/30 rounded-full animate-spin" style={{ animationDuration: "12s" }} />
                  {clickerSuccess ? (
                    <Award className="w-10 h-10 text-emerald-400 animate-bounce" />
                  ) : (
                    <Zap className="w-10 h-10 text-emerald-400 animate-pulse" />
                  )}
                  <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-500 block mt-2 group-hover:text-emerald-400">
                    {clickerSuccess ? "OVERCLOCKED" : `TAP ${clicks}/10`}
                  </span>
                </button>
              </div>

              {/* Progress Slider track & CPS readout */}
              <div className="w-full flex justify-between items-center gap-4 bg-[#050505]/60 border border-[#121212] p-2.5 rounded-xl">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 text-[9px] font-mono uppercase text-zinc-500">
                    <span>Synthesizer State</span>
                    <span className="text-zinc-400 font-bold">{clicks * 10}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#0a0a0a] border border-[#161616] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${clicks * 10}%` }}
                    />
                  </div>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="text-[8px] font-mono uppercase text-zinc-550 block leading-none mb-0.5">EST SPEED</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 font-mono tracking-xs">
                    {currentCps > 0 ? currentCps.toFixed(5) : "0.00000"}<span className="text-[8px] text-zinc-600 block sm:inline ml-0.5 font-normal">CPS</span>
                  </span>
                </div>
              </div>

              {clickerSuccess ? (
                <div className="text-center animate-fadeIn w-full bg-[#070707] border border-[#151515] p-3.5 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-center">
                    <Sparkles className="w-3.5 h-3.5" /> Core Synthesizer Speed Peak Rate:
                  </p>
                  <p className="text-xl font-mono font-black text-emerald-300 mt-1 uppercase tracking-tight">
                    ⚡ {currentCps.toFixed(5)} CPS
                  </p>

                  {/* Satirical achievement badges based on speed rate */}
                  {currentCps > 9 ? (
                    <div className="mt-3 p-3 rounded-xl border border-dashed border-rose-500/30 bg-rose-950/10 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.1)] animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                        <span>🏆 SPEED DEMON UNLOCKED 🏆</span>
                      </div>
                      <p className="text-[10.5px] text-zinc-350 mt-1">
                        Carpal tunnel coming soon <span className="text-rose-400 font-semibold font-mono text-[9px] italic">(satire)</span>
                      </p>
                    </div>
                  ) : currentCps < 0.2 ? (
                    <div className="mt-3 p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/10 text-cyan-200 animate-fadeIn w-full">
                      {surveyStep <= 4 ? (
                        <div className="space-y-4 text-left">
                          <div className="flex items-center justify-between pb-1.5 border-b border-[#222]/30 text-[9px] font-mono text-zinc-400">
                            <span className="uppercase text-cyan-400 font-bold tracking-wider">👩‍❤️‍👨 Relationship Calibration</span>
                            <span>Step {surveyStep}/4</span>
                          </div>
                          
                          {surveyStep === 1 && (
                            <div className="space-y-3">
                              <p className="text-[11.5px] font-mono font-medium text-zinc-200 text-center">
                                Question 1: Are you straight?
                              </p>
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => { setStraightAns("Yes"); setSurveyStep(2); }}
                                  className="px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setStraightAns("No"); setSurveyStep(2); }}
                                  className="px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}

                          {surveyStep === 2 && (
                            <div className="space-y-3">
                              <p className="text-[11.5px] font-mono font-medium text-zinc-200 text-center">
                                Question 2: Are you a female biologically?
                              </p>
                              <div className="flex gap-2 justify-center">
                                <button
                                  type="button"
                                  onClick={() => { setBiologicalAns("Yes"); setSurveyStep(3); }}
                                  className="px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setBiologicalAns("No"); setSurveyStep(3); }}
                                  className="px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}

                          {surveyStep === 3 && (
                            <div className="space-y-3 text-center">
                              <p className="text-[11.5px] font-mono font-medium text-zinc-200 leading-normal px-2">
                                Question 3: Do you like BDSM <span className="text-zinc-400 text-[10px] block font-sans">(Business Development Sales and Marketing)</span>?
                              </p>
                              <div className="flex flex-col gap-1.5 max-w-xs mx-auto">
                                <button
                                  type="button"
                                  onClick={() => { setBdsmAns("Yes"); setSurveyStep(4); }}
                                  className="w-full text-left px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded text-[9.5px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  💼 Yes, absolutely
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setBdsmAns("No"); setSurveyStep(4); }}
                                  className="w-full text-left px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded text-[9.5px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer"
                                >
                                  📊 No, I prefer standard operations
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setBdsmAns("Obsessed"); setSurveyStep(4); }}
                                  className="w-full text-left px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#1c1c1c] border border-[#222] hover:border-cyan-500/50 rounded text-[9.5px] font-mono text-cyan-400 hover:text-white transition-all cursor-pointer font-bold"
                                >
                                  📈 I am obsessed with sales pipelines!
                                </button>
                              </div>
                            </div>
                          )}

                          {surveyStep === 4 && (
                            <div className="space-y-3">
                              <p className="text-[11.5px] font-mono font-medium text-zinc-200 text-center">
                                Question 4: What ice cream flavor?
                              </p>
                              <div className="flex flex-col gap-2 max-w-xs mx-auto">
                                <input
                                  type="text"
                                  maxLength={30}
                                  value={iceCreamAns}
                                  onChange={(e) => setIceCreamAns(e.target.value)}
                                  className="w-full bg-[#050505] border border-[#222] focus:border-cyan-500 px-2.5 py-1.5 text-xs font-mono text-white rounded outline-none text-center"
                                  placeholder="e.g. Mint Chocolate Chip"
                                />
                                <button
                                  type="button"
                                  onClick={() => { setSurveyStep(5); }}
                                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-[9px] font-bold uppercase tracking-wider py-1.5 rounded transition-colors active:scale-95 cursor-pointer"
                                >
                                  Submit Questionnaire
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3 animate-fadeIn text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-rose-450">
                            <span>❌ APPLICATION DECISION ❌</span>
                          </div>
                          
                          <p className="text-[11px] font-mono font-bold text-rose-300 italic bg-rose-950/25 border border-rose-900/30 px-3 py-2 rounded-lg leading-relaxed">
                            "i have reviewed your answers and chose not to proceed."
                          </p>

                          <div className="border-t border-cyan-500/20 my-2.5 pt-2.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                              <span>✨ CORE CODEX BREAKER UNLOCKED ✨</span>
                            </div>
                            <p className="text-[11px] text-zinc-100 px-0.5 leading-normal font-bold">
                              "I knew you would do this, if you reached this far. Your Hired, but im not an employer so maybe we can just be friends secret code FytheraXV88. message me anywhere , and herers also 1000000 tokens"
                            </p>
                            <p className="text-[8.5px] text-emerald-400 mt-2 text-center font-mono font-black uppercase animate-pulse">
                              ⭐ +1,000,000 Sandbox Tokens Granted! ⭐
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : currentCps < 0.5 ? (
                    <div className="mt-3 p-3 rounded-xl border border-emerald-500/30 border-dashed bg-emerald-950/10 text-emerald-300 animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                        <span>⚡ CRACKED SYSTEM ENGINE ⚡</span>
                      </div>
                      <p className="text-[11px] text-zinc-350 mt-1 leading-normal font-bold">
                        "Genius you cracked it, heres 10 Token. Dont go further enjoy life now... skadadle"
                      </p>
                    </div>
                  ) : currentCps < 2 ? (
                    <div className="mt-3 p-3 rounded-xl border border-[#10b981]/40 border-dashed bg-emerald-950/20 text-emerald-300 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.1)] animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                        <span>🎁 PATIENCE REWARD UNLOCKED 🎁</span>
                      </div>
                      <p className="text-[11px] text-zinc-205 mt-1 px-1 leading-normal font-medium">
                        "Congratulation this is a bonus for your hard work 3 tokens for being patient"
                      </p>
                    </div>
                  ) : currentCps < 4 ? (
                    <div className="mt-3 p-3 rounded-xl border border-cyan-500/30 border-dashed bg-[#0e161c] text-cyan-300 animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                        <span>🤫 QUIET CORES 🤫</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 px-1 font-bold">
                        "It quiet, ... too quiet"
                      </p>
                    </div>
                  ) : currentCps < 7 ? (
                    <div className="mt-3 p-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-950/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.1)] animate-fadeIn">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                        <span>🐌 SLOWPOKE CALIBRATION 🐌</span>
                      </div>
                      <p className="text-[11px] text-zinc-350 mt-1 font-bold">
                        "Slow is my name"
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-[#0e0e0e] border border-[#1a1a1a] rounded-lg text-zinc-400 text-[10px] font-mono uppercase">
                      ⚖️ Moderated speed node calibrated
                    </div>
                  )}

                  {/* Leaderboard record input selection */}
                  {!recordSaved ? (
                     <div className="mt-3 bg-[#0d0d0d] border border-[#1d1d1d] p-2.5 rounded-lg">
                       <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 block mb-1.5">Submit to elite Records board</span>
                       <div className="flex gap-2">
                         <input
                           type="text"
                           maxLength={16}
                           value={newRecordName}
                           onChange={(e) => setNewRecordName(e.target.value)}
                           className="flex-1 bg-[#050505] border border-[#222] focus:border-emerald-500 px-2.5 py-1 text-xs font-mono text-white rounded outline-none"
                           placeholder="Your Moniker"
                         />
                         <button
                           onClick={handleSaveLeaderboard}
                           className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors active:scale-95"
                         >
                           Save Record
                         </button>
                       </div>
                     </div>
                  ) : (
                    <div className="mt-2 text-[9.5px] font-mono text-emerald-500/80 bg-emerald-950/10 border border-emerald-900/30 py-1.5 rounded animate-fadeIn uppercase font-bold">
                       👤 Record locked under "{newRecordName}"
                    </div>
                  )}

                  <button
                    onClick={handleResetClicker}
                    className="mt-3.5 px-4 py-1.5 bg-[#0e0e0e] hover:bg-[#161616] border border-[#222] rounded-lg text-[9.5px] font-mono uppercase text-zinc-450 hover:text-white transition-all flex items-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3 h-3" /> Engage Again
                  </button>
                </div>
              ) : (
                <p className="text-[10px] font-mono text-zinc-650 uppercase">
                  Click the core above rapidly to receive 1 token
                </p>
              )}

              {/* Elite Leaderboard display pane */}
              <div className="w-full bg-[#050505] border border-[#131313] p-3 rounded-xl shadow-inner">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#141414]">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Elite CPS Records
                  </span>
                  {leaderboard.length > 0 && (
                    <button
                      onClick={handleClearLeaderboard}
                      className="text-[8.5px] font-mono uppercase text-rose-500 hover:text-rose-400/90 transition-colors cursor-pointer"
                    >
                      Clear database
                    </button>
                  )}
                </div>

                {leaderboard.length === 0 ? (
                  <p className="text-[9px] font-mono text-zinc-600 text-center py-2.5 uppercase">No records logged. Tap the core above.</p>
                ) : (
                  <div className="space-y-1.5">
                    {leaderboard.map((entry, idx) => {
                      const isRank1 = idx === 0;
                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[10px] font-mono transition-all ${
                            isRank1
                              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                              : "bg-[#0a0a0a] border-[#181818] text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[8.5px] ${
                              idx === 0 ? "bg-emerald-500 text-black text-[7.5px]" : "bg-[#141414] text-zinc-500"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold truncate max-w-[120px]">{entry.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isRank1 ? "text-emerald-400 animate-pulse" : "text-zinc-300"}`}>
                              {entry.cps.toFixed(5)} <span className="text-[7.5px] text-zinc-500 font-normal">CPS</span>
                            </span>
                            <span className="text-[7.5px] text-zinc-650 tracking-tight hidden sm:inline">{entry.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 w-full max-w-sm relative">
              {/* Score and Time telemetry */}
              <div className="w-full flex justify-between items-center font-mono text-[10px] uppercase text-zinc-500 px-1">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                  SCORE: <strong className="text-cyan-400">{moleScore} / 5</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                  LIMITS: <span className="text-zinc-300">WIN YIELDS +3</span>
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  moleTimeLeft <= 5 ? "bg-rose-950/40 border-rose-800 text-rose-400 animate-pulse" : "bg-[#0e0e0e] border-[#1c1c1c] text-cyan-400"
                }`}>
                  {moleTimeLeft} SEC
                </span>
              </div>

              {/* WHACK GRID */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] aspect-square relative bg-[#060606] border border-[#141414] p-3 rounded-2xl shadow-inner">
                {/* Float Hit texts */}
                {floatingText.map((item) => (
                  <span
                    key={item.id}
                    style={{ left: item.x, top: item.y }}
                    className="absolute pointer-events-none text-cyan-400 font-mono text-[11px] uppercase font-black animate-float-fade z-20"
                  >
                    {item.text}
                  </span>
                ))}

                {Array.from({ length: 9 }).map((_, idx) => {
                  const isMole = activeMoleIndex === idx;
                  const wasHit = lastHitIdx === idx;
                  return (
                    <button
                      key={idx}
                      onMouseEnter={(e) => handleWhackMole(idx, e)}
                      onClick={(e) => handleWhackMole(idx, e)}
                      disabled={!isPlayingMole}
                      className={`w-full aspect-square rounded-xl border flex items-center justify-center relative transition-all duration-200 outline-none select-none ${
                        isMole
                          ? "bg-cyan-950/30 border-cyan-400 hover:border-cyan-300 cursor-cell shadow-[0_0_15px_rgba(34,211,238,0.25)] scale-105"
                          : wasHit
                          ? "bg-[#0e0f12] border-[#222] cursor-not-allowed scale-95"
                          : "bg-[#0b0b0b] border-[#181818] cursor-not-allowed opacity-40"
                      }`}
                    >
                      {isMole && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
                          <div className="w-4 h-4 bg-cyan-400 rounded-full border border-white flex items-center justify-center shadow-lg">
                            <Target className="w-3.5 h-3.5 text-black" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mode Control actions */}
              <div className="w-full text-center mt-2">
                {!isPlayingMole && moleGameOutcome === null && (
                  <button
                    onClick={startMoleGame}
                    className="px-6 py-3 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-cyan-500/40 text-cyan-450 hover:text-white text-[10.5px] font-mono font-bold uppercase tracking-wider rounded-xl transition-all duration-305 flex items-center gap-2 mx-auto active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Start Infiltration Game
                  </button>
                )}

                {isPlayingMole && (
                  <p className="text-[9.5px] font-mono text-cyan-500 uppercase tracking-widest animate-pulse">
                    ⚡ HOVER OVER THE ACTIVE NEON BLUE TARGET VALUES RAPIDLY! ⚡
                  </p>
                )}

                {moleGameOutcome !== null && (
                  <div className="bg-[#0c0c0c] border border-[#1a1a1a] p-4 rounded-xl animate-fadeIn w-full">
                    {moleGameOutcome === "won" ? (
                      <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                        <span className="text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1">
                          <Trophy className="w-4 h-4" /> DATABASE SECURED!
                        </span>
                        <p className="text-[10px] text-zinc-400">
                          Score achieved: <strong className="text-emerald-400 font-bold">{moleScore} pts</strong> • High Quota +3 Sandbox Tokens persisted successfully!
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-rose-400">
                        <span className="text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1">
                          ⚠️ CONNECTION TIMEOUT
                        </span>
                        <p className="text-[10px] text-zinc-400">
                          You whacked {moleScore} targets, but need at least 5 to decrypt.
                        </p>
                      </div>
                    )}

                    {/* Elite Mole Leaderboard record input selection */}
                    {!moleRecordSaved ? (
                       <div className="mt-4 bg-[#0d0d0d] border border-[#1d1d1d] p-2.5 rounded-lg text-left">
                         <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 block mb-1.5 text-center">Submit score to terminal logs</span>
                         <div className="flex gap-2">
                           <input
                             type="text"
                             maxLength={16}
                             value={newMoleRecordName}
                             onChange={(e) => setNewMoleRecordName(e.target.value)}
                             className="flex-1 bg-[#050505] border border-[#222] focus:border-cyan-500 px-2.5 py-1 text-xs font-mono text-white rounded outline-none"
                             placeholder="Infiltrator Moniker"
                           />
                           <button
                             onClick={handleSaveMoleLeaderboard}
                             className="bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded transition-colors active:scale-95"
                           >
                             Log score
                           </button>
                         </div>
                       </div>
                    ) : (
                      <div className="mt-3 text-[9.5px] font-mono text-cyan-400 bg-cyan-950/10 border border-cyan-900/30 py-1.5 rounded animate-fadeIn uppercase font-bold text-center">
                         👤 Hacker profile saved under "{newMoleRecordName}"
                      </div>
                    )}

                    <button
                      onClick={resetMoleGame}
                      className="mt-3.5 px-5 py-2 bg-[#121212] hover:bg-[#202020] text-zinc-300 border border-[#262626] rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>

              {/* Mole Leaderboard display panel */}
              <div className="w-full bg-[#050505] border border-[#131313] p-3 rounded-xl shadow-inner mt-1">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-[#141414]">
                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#555] flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" /> Elite Hacking Records
                  </span>
                  {moleLeaderboard.length > 0 && (
                    <button
                      onClick={handleClearMoleLeaderboard}
                      className="text-[8.5px] font-mono uppercase text-rose-500 hover:text-rose-400/90 transition-colors cursor-pointer"
                    >
                      Clear database
                    </button>
                  )}
                </div>

                {moleLeaderboard.length === 0 ? (
                  <p className="text-[9px] font-mono text-zinc-650 text-center py-2.5 uppercase">No server profiles logged. Complete a run above.</p>
                ) : (
                  <div className="space-y-1.5 text-left w-full">
                    {moleLeaderboard.map((entry, idx) => {
                      const isRank1 = idx === 0;
                      return (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[10px] font-mono transition-all ${
                            isRank1
                              ? "bg-cyan-950/20 border-cyan-500/20 text-cyan-300"
                              : "bg-[#0a0a0a] border-[#181818] text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center font-bold text-[8.5px] ${
                              idx === 0 ? "bg-cyan-500 text-black text-[7.5px]" : "bg-[#141414] text-zinc-500"
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-bold truncate max-w-[120px]">{entry.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${isRank1 ? "text-cyan-400 animate-pulse" : "text-zinc-300"}`}>
                              {entry.score} <span className="text-[7.5px] text-zinc-500 font-normal">HITS</span>
                            </span>
                            <span className="text-[7.5px] text-zinc-650 tracking-tight hidden sm:inline">{entry.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#080808] border-t border-[#141414] text-center">
          <span className="text-[10px] text-zinc-600 font-mono flex items-center justify-center gap-1">
            💻 Core database token state is synchronized with persistent browser storage
          </span>
        </div>
      </div>
    </div>
  );
}
