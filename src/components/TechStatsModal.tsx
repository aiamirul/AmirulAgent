import React, { useState, useEffect } from "react";
import { X, Activity, Cpu, BatteryCharging, DollarSign, Database, Leaf, Shield, Zap, Sparkles } from "lucide-react";

interface TechStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionCount: number;
}

export default function TechStatsModal({ isOpen, onClose, questionCount }: TechStatsModalProps) {
  // Track page-load active session stopwatch (elapsed running time)
  const [sessionSecs, setSessionSecs] = useState(0);
  const [isEcoMode, setIsEcoMode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSessionSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Format runtime stopwatch
  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const s = (totalSecs % 60).toString().padStart(2, "0");
    return `${m}m ${s}s`;
  };

  // Processing Time: Each interaction takes some core processing cycles
  const processingSecs = parseFloat(((questionCount * 1.42) + 2.15).toFixed(2));

  // Realistic random tokens per interaction
  // Input: 10,000 to 35,000 tokens
  const activeInput = Math.floor(10000 + 25000 * Math.abs(Math.sin(questionCount + 1.1)));
  // Output: 10,000 to 30,000 tokens  
  const activeOutput = Math.floor(10000 + 20000 * Math.abs(Math.cos(questionCount + 2.3)));
  // Context: 10,000,000 to 15,000,000 tokens (10M - 15M)
  const contextTokens = Math.floor(10000000 + 5000000 * Math.abs(Math.sin(questionCount + 3.7)));

  // Accumulate over multiple question turns if applicable
  const inputTokens = activeInput + (questionCount > 1 ? (questionCount - 1) * 18500 : 0);
  const outputTokens = activeOutput + (questionCount > 1 ? (questionCount - 1) * 15200 : 0);
  const totalTokens = inputTokens + outputTokens + contextTokens;

  // Energy Calculation: 0.1 kWh per 100k tokens processed
  const ecoPowerDampener = isEcoMode ? 0.06 : 1.0;
  const rawKilowattsPerSec = parseFloat((((totalTokens / 100000) * 0.1) * ecoPowerDampener).toFixed(3));

  // Cost conversion at USD 0.10 per kilowatt-hour/rate equivalent
  const energyCostUsd = parseFloat((rawKilowattsPerSec * 0.10).toFixed(4));

  // Plot history points. We show a historical run of the LLM pipeline
  const basePoints = [
    { t: "12:10", label: "Grid Check", input: 12500, output: 11200, power: 10.2, cost: 1.02 },
    { t: "12:15", label: "Model Warmup", input: 18400, output: 14500, power: 11.8, cost: 1.18 },
    { t: "12:20", label: "Semantic Search", input: 24600, output: 19800, power: 13.5, cost: 1.35 },
    { t: "12:25", label: "Context Pack", input: 31200, output: 25900, power: 14.9, cost: 1.49 },
  ];

  // Dynamic point for the current active inquiry run
  const activePoint = {
    t: "Active",
    label: `Run #${questionCount}`,
    input: activeInput,
    output: activeOutput,
    power: rawKilowattsPerSec,
    cost: energyCostUsd,
  };

  const chartPoints = [...basePoints, activePoint];

  // Map coordinates in an SVG space (W=320, H=140)
  const maxVal = Math.max(...chartPoints.map(p => p.input + p.output)) || 1;
  const padding = 20;
  const chartHeight = 120;
  const chartWidth = 320;

  const pointsString = chartPoints
    .map((p, idx) => {
      const x = padding + (idx * (chartWidth - padding * 2)) / (chartPoints.length - 1);
      const y = chartHeight - padding - ((p.input + p.output) / maxVal) * (chartHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      id="tech-stats-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#010101]/90 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="tech-stats-container"
        className="w-full max-w-xl bg-[#090909] border border-cyan-500/20 rounded-2xl p-6 md:p-8 flex flex-col gap-5 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden"
      >
        {/* Futuristic Grid Mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141414_1px,transparent_1px),linear-gradient(to_bottom,#141414_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-20" />

        {/* Laser glow bar at top of modal */}
        <div className={`absolute top-0 left-0 w-full h-[3px] transition-all duration-700 ${
          isEcoMode 
            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" 
            : "bg-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#181818] pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              isEcoMode 
                ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
                : "bg-cyan-950/40 border-cyan-500/20 text-cyan-400"
            }`}>
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-white uppercase font-sans flex items-center gap-2">
                COSMIC METRICS & TELEMETRY
              </h2>
              <div className="flex flex-col gap-0.5">
                <p className="text-[9.5px] text-zinc-550 font-mono uppercase tracking-wide">
                  Server-Side Energy Conversion Matrix
                </p>
                <p className="text-[9.5px] text-cyan-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Core Engine: GPT 5.6 Amirul Edition
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#0e0e0e] border border-[#1a1a1a] hover:border-zinc-750 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Energy & Core Calculations Panel (The requested specs) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Time & Power Card */}
          <div className="bg-[#040404] border border-[#141414] p-4 rounded-xl flex flex-col justify-between gap-3 text-left">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-zinc-450" /> System Run Duration
                </span>
                <span className="text-[8px] font-mono text-cyan-500 font-bold bg-cyan-950/30 border border-cyan-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                  Live Feed
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-light font-mono text-zinc-100 tracking-tight">
                  {formatTime(sessionSecs)}
                </span>
                <span className="text-[9px] font-mono text-zinc-650">PORTAL ALIVE</span>
              </div>
            </div>

            <div className="border-t border-[#121212] pt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-yellow-500" /> Power Dissipation
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500">
                  {isEcoMode ? "Eco Modulated" : "Standard Draw"}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-mono font-bold tracking-tight ${isEcoMode ? "text-emerald-400" : "text-cyan-400 animate-pulse"}`}>
                  {rawKilowattsPerSec}
                </span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Kilowatt-Hours (kWh)</span>
              </div>
              <p className="text-[8.5px] font-mono text-zinc-650 leading-tight mt-1">
                Formula: (Total Tokens / 100,000) × 0.1 kWh {isEcoMode && "× 6% throttle"}
              </p>
            </div>
          </div>

          {/* Core Latency Cost Conversion at $0.10/kW */}
          <div className="bg-[#040404] border border-[#141414] p-4 rounded-xl flex flex-col justify-between gap-3 text-left">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Energetic Surcharge
                </span>
                <span className="text-[8px] font-mono text-emerald-500 font-bold bg-emerald-950/20 border border-emerald-900/40 px-1.5 py-0.5 rounded-full">
                  $0.10 per kWh
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-black text-emerald-400 tracking-tight">
                  ${energyCostUsd.toFixed(4)}
                </span>
                <span className="text-[8.5px] font-mono text-zinc-500 uppercase">USD Cumulative</span>
              </div>
              <p className="text-[8px] font-mono text-zinc-650 leading-snug mt-1.5">
                Total energetic liability converting active kWh equivalent at local industrial server rate.
              </p>
            </div>

            <div className="border-t border-[#121212] pt-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#555] flex items-center gap-1 mb-1">
                <Database className="w-3.5 h-3.5 text-purple-500" /> Live Token Accumulators
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-[#0a0a0a] border border-[#141414] p-1.5 rounded">
                  <span className="text-[7.5px] font-mono text-zinc-600 block uppercase">Input</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-300">{inputTokens.toLocaleString()}</span>
                </div>
                <div className="bg-[#0a0a0a] border border-[#141414] p-1.5 rounded">
                  <span className="text-[7.5px] font-mono text-zinc-600 block uppercase">Output</span>
                  <span className="text-[10px] font-mono font-bold text-zinc-300">{outputTokens.toLocaleString()}</span>
                </div>
                <div className="bg-[#0a0a0a] border border-[#141414] p-1.5 rounded">
                  <span className="text-[7.5px] font-mono text-zinc-600 block uppercase">Context</span>
                  <span className="text-[9px] font-mono font-bold text-zinc-400">{(contextTokens / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dummy Eco Mode Switch - Funny element requested */}
        <div className={`p-3.5 rounded-xl border transition-all duration-500 text-left relative z-10 ${
          isEcoMode 
            ? "bg-emerald-950/10 border-emerald-800/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
            : "bg-[#060606] border-[#161616]"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                isEcoMode ? "bg-emerald-905/30 text-emerald-400" : "bg-neutral-900 text-zinc-600"
              }`}>
                <Leaf className={`w-4 h-4 ${isEcoMode ? "animate-bounce" : ""}`} />
              </div>
              <div>
                <h4 className="text-[11px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  ECO-GREEN CONSTRAIN MODULE
                  {isEcoMode && (
                    <span className="text-[7px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black font-sans uppercase animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-[9px] font-sans text-zinc-500 leading-normal mt-0.5">
                  {isEcoMode
                    ? "Hamsters given filtered mineral water. Cooling fans silenced. Emojis limited to carbon-neutral standard."
                    : "Full high-density GPU matrix drawing unconstrained network capacity."}
                </p>
              </div>
            </div>

            {/* Simulated Toggle Switch container */}
            <button
              onClick={() => setIsEcoMode(!isEcoMode)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer outline-none relative flex items-center ${
                isEcoMode ? "bg-emerald-500" : "bg-[#18181b]"
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isEcoMode ? "translate-x-4.5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Interactive SVG Plotting Line Grid representing usage */}
        <div className="bg-[#050505] border border-[#141414] p-4 rounded-xl text-left relative z-10">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-550 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Cumulative System Tokens Allocation Map
            </span>
            <span className="text-[8px] font-mono text-zinc-500">
              Total: <strong className="text-zinc-300">{totalTokens.toLocaleString()} tokens</strong>
            </span>
          </div>

          {/* Clean Custom SVG Line Chart */}
          <div className="relative w-full aspect-[5/2] bg-[#030303] border border-[#121212]/80 rounded-lg p-2.5 overflow-hidden">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              {/* Horizontal dotted grid lines */}
              <line x1={padding} y1="20" x2={chartWidth - padding} y2="20" stroke="#1d1d1d" strokeDasharray="3,3" />
              <line x1={padding} y1="60" x2={chartWidth - padding} y2="60" stroke="#1d1d1d" strokeDasharray="3,3" />
              <line x1={padding} y1="100" x2={chartWidth - padding} y2="100" stroke="#1d1d1d" strokeDasharray="3,3" />

              {/* Glowing Ambient Gradient behind the system line */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isEcoMode ? "#10b981" : "#06b6d4"} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={isEcoMode ? "#10b981" : "#06b6d4"} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              {/* Area filled polygon */}
              <polygon
                points={`${padding},${chartHeight - padding} ${pointsString} ${chartWidth - padding},${chartHeight - padding}`}
                fill="url(#chartGradient)"
              />

              {/* Main styled line trace */}
              <polyline
                fill="none"
                stroke={isEcoMode ? "#10b981" : "#06b6d4"}
                strokeWidth="2.2"
                points={pointsString}
                className="transition-all duration-500"
              />

              {/* Point plots */}
              {chartPoints.map((p, idx) => {
                const x = padding + (idx * (chartWidth - padding * 2)) / (chartPoints.length - 1);
                const y = chartHeight - padding - ((p.input + p.output) / maxVal) * (chartHeight - padding * 2);
                return (
                  <g key={idx} className="group cursor-help">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill={idx === chartPoints.length - 1 ? "#fff" : (isEcoMode ? "#10b981" : "#06b6d4")}
                      stroke={isEcoMode ? "#047857" : "#0891b2"}
                      strokeWidth="1.5"
                    />
                    {/* Hover text indicator inside the SVG */}
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill="#888"
                      fontSize="6.5"
                      fontFamily="monospace"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black font-bold"
                    >
                      {p.t}: {p.input + p.output}t
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between px-4 mt-1 font-mono text-[7px] text-zinc-650 uppercase">
              {chartPoints.map((p, idx) => (
                <span key={idx}>{p.t}</span>
              ))}
            </div>
          </div>
          <p className="text-[7.5px] font-mono text-zinc-650 tracking-tight mt-1 px-1 text-center">
            *Telemetry nodes scale dynamically based on total context values. Hover points to observe token pack distribution.
          </p>
        </div>

        {/* Action button */}
        <div className="text-center relative z-10 pt-1">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#0e0e0e] hover:bg-zinc-900 border border-[#222] hover:border-zinc-700 text-zinc-350 hover:text-white font-mono text-[9.5px] font-bold uppercase tracking-widest rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            Acknowledge Logs
          </button>
        </div>
      </div>
    </div>
  );
}
