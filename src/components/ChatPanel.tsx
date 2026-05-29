import React, { useRef, useEffect, useState } from "react";
import { Message } from "../types";
import { Send, Loader2, Bot, User, HelpCircle, Heart, Sparkles, HeartCrack } from "lucide-react";

interface ChatPanelProps {
  messages: Message[];
  inputValue: string;
  onChangeInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  questionCount: number;
  maxQuestions?: number;
  onSelectIntroOption?: (option: "EMPLOYER" | "BUSINESS_RELATIONS" | "ROMANTIC") => void;
  onUpdateMessage?: (msgId: string, updatedFields: Partial<Message>) => void;
}

export default function ChatPanel({
  messages,
  inputValue,
  onChangeInput,
  onSubmit,
  isLoading,
  questionCount,
  maxQuestions = 10,
  onSelectIntroOption,
  onUpdateMessage,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [iceCreamText, setIceCreamText] = useState("");

  // Auto Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div id="chat-panel" className="flex flex-col h-full bg-[#050505] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Sophisticated Dark Header Status */}
      <div className="h-20 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span className="text-xs font-medium tracking-widest uppercase text-zinc-400">
            AMIRU-LLM v1.0 • Connected
          </span>
        </div>
        <div className="text-[11px] text-[#52525b] italic hidden md:block">
          Personal Portfolio Agent
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050505]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto gap-4 py-12">
            <div className="p-4 bg-[#0a0a0a] rounded-full border border-[#1a1a1a] text-zinc-400">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-base font-serif italic text-white">Ask AMIRU-LLM</h3>
            <p className="text-xs text-[#71717a] leading-relaxed">
              Explore professional insights about Amirul's software solutions engineering career, accessibility strategies, and cloud infrastructure achievements.
            </p>
            <div className="mt-2 text-[10px] font-mono p-3 bg-[#0a0a0a] rounded-lg border border-dashed border-[#222] text-[#52525b] flex items-center gap-1.5 leading-snug">
              <HelpCircle className="w-4 h-4 text-zinc-650 flex-shrink-0" />
              <span>Session standard restriction holds a hard quota of exactly {maxQuestions} questions.</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.role === "assistant";
            return (
              <div
                key={msg.id}
                id={`chat-message-${msg.id}`}
                className={`flex flex-col ${
                  isBot ? "items-start" : "items-end"
                } space-y-1.5`}
              >
                {/* Speaker Label */}
                <div className="flex items-center space-x-2">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#52525b] font-mono">
                    {isBot ? "AMIRU-LLM" : "Inquirer"}
                  </span>
                  <span className="text-[9px] text-zinc-650 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Msg Content Styled accurately according to design theme */}
                <div
                  className={`px-5 py-3.5 rounded-2xl max-w-[90%] text-sm transition-all border ${
                    isBot
                      ? "bg-[#0d0d0d] border-zinc-850 text-[#d4d4d8] rounded-tl-none font-sans leading-relaxed"
                      : "bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tr-none font-sans leading-relaxed"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Interactive Relationship Calibration Survey */}
                  {isBot && msg.isRomanticSurvey && (
                    <div className="mt-4 p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-zinc-200 space-y-3.5 animate-fadeIn">
                      {!msg.romanticSurveyCompleted ? (
                        <div>
                          <div className="flex items-center justify-between pb-2 border-b border-[#222]/40 text-[9.5px] font-mono text-zinc-500 mb-3">
                            <span className="uppercase text-rose-450 font-bold tracking-wider flex items-center gap-1">
                              ❤️ RELATIONSHIP CALIBRATION
                            </span>
                            <span>Step {msg.romanticSurveyStep || 1} / 4</span>
                          </div>

                          {(msg.romanticSurveyStep === 1 || !msg.romanticSurveyStep) && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-zinc-350">
                                Step 1: Are you straight?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 2,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          straight: "Yes"
                                        }
                                      });
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded-xl text-[10px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 2,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          straight: "No"
                                        }
                                      });
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded-xl text-[10px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.romanticSurveyStep === 2 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-zinc-350">
                                Step 2: Are you a female biologically?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 3,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          female: "Yes"
                                        }
                                      });
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded-xl text-[10px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 3,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          female: "No"
                                        }
                                      });
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded-xl text-[10px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.romanticSurveyStep === 3 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-zinc-350 leading-tight">
                                Step 3: Do you like BDSM (Business Development Sales and Marketing)?
                              </p>
                              <div className="flex flex-col gap-1.5 max-w-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 4,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          bdsm: "Yes"
                                        }
                                      });
                                    }
                                  }}
                                  className="text-left px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded text-[9.5px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  💼 Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 4,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          bdsm: "No"
                                        }
                                      });
                                    }
                                  }}
                                  className="text-left px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded text-[9.5px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer"
                                >
                                  📊 No
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyStep: 4,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          bdsm: "Obsessed with sales pipelines!"
                                        }
                                      });
                                    }
                                  }}
                                  className="text-left px-3 py-1.5 bg-[#0a0a0a] hover:bg-[#121212] border border-[#222] hover:border-rose-500/30 rounded text-[9.5px] font-mono text-rose-400 hover:text-white transition-all cursor-pointer font-bold"
                                >
                                  📈 Obsessed with sales pipelines!
                                </button>
                              </div>
                            </div>
                          )}

                          {msg.romanticSurveyStep === 4 && (
                            <div className="space-y-3">
                              <p className="text-xs font-semibold text-zinc-350">
                                Step 4: What is your favorite ice cream flavor?
                              </p>
                              <div className="flex gap-2 max-w-sm">
                                <input
                                  type="text"
                                  maxLength={30}
                                  value={iceCreamText}
                                  onChange={(e) => setIceCreamText(e.target.value)}
                                  className="flex-1 bg-[#050505] border border-zinc-800 focus:border-rose-500 px-3 py-1.5 text-xs font-mono text-white rounded-lg outline-none transition-colors"
                                  placeholder="e.g. Mint Chocolate Chip"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onUpdateMessage) {
                                      onUpdateMessage(msg.id, {
                                        romanticSurveyCompleted: true,
                                        romanticSurveyAnswers: {
                                          ...msg.romanticSurveyAnswers,
                                          iceCream: iceCreamText.trim() || "Vanilla Space"
                                        }
                                      });
                                      setIceCreamText(""); // Reset
                                    }
                                  }}
                                  className="bg-rose-500 hover:bg-rose-400 text-black font-mono text-[9px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg transition-colors active:scale-95 cursor-pointer"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Satirical Decision Board */
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex items-center justify-between pb-1.5 border-b border-[#222]/40 text-[9.5px] font-mono text-rose-400">
                            <span className="uppercase font-bold tracking-widest flex items-center gap-1 text-[10.5px]">
                              ⚖️ SATIRICAL DECISION BOARD
                            </span>
                            <span className="text-zinc-550 border border-zinc-850 px-2 py-0.5 rounded text-[8px] tracking-widest font-mono">CORE ALIGNMENT</span>
                          </div>

                          {/* Reviewed answers summary */}
                          <div className="p-3 bg-[#050505] border border-[#141414] rounded-lg text-left space-y-1.5 text-[10.5px] font-mono text-zinc-400 leading-normal">
                            <div className="text-[9.5px] uppercase text-zinc-550 tracking-wider font-bold mb-1">
                              Completed Bio-Alignment Questionnaire:
                            </div>
                            <div>• Straight: <span className="text-rose-400 font-bold">{msg.romanticSurveyAnswers?.straight}</span></div>
                            <div>• Biological Female: <span className="text-rose-400 font-bold">{msg.romanticSurveyAnswers?.female}</span></div>
                            <div>• BDSM (Sales/Marketing): <span className="text-rose-400 font-bold">{msg.romanticSurveyAnswers?.bdsm}</span></div>
                            <div>• Ice cream flavor: <span className="text-rose-400 font-light italic">"{msg.romanticSurveyAnswers?.iceCream}"</span></div>
                          </div>

                          {/* Evaluation log */}
                          <div className="text-[9.5px] text-zinc-650 font-mono text-left space-y-0.5 bg-[#030303] p-2.5 rounded border border-[#121212]/30 leading-snug">
                            <div>[SYSTEM] Parsing bio-demographical orientation matrices... Finished.</div>
                            <div>[SYSTEM] Scanning ice cream telemetry data... Checked.</div>
                            <div>[SYSTEM] Evaluating suitability of business pipeline interest... Failed.</div>
                          </div>

                          {/* Final Verdict */}
                          <div className="p-4 bg-rose-950/20 border border-rose-500/20 text-rose-300 rounded-xl text-center leading-relaxed shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                            <div className="flex justify-center mb-2 text-rose-450">
                              <HeartCrack className="w-5 h-5 animate-pulse" />
                            </div>
                            <p className="text-[11.5px] font-mono font-medium tracking-wide leading-relaxed">
                              "i have reviewed your answers and chose not to proceed. We can be friends <span className="text-rose-400 font-extrabold uppercase">[FRIENDZONNED!]</span>"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Choice controls for introduction */}
                  {isBot && msg.isIntro && onSelectIntroOption && (
                    <div id="intro-choices" className="mt-4 flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        id="intro-choice-employer"
                        onClick={() => onSelectIntroOption("EMPLOYER")}
                        className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0a0a0a] hover:bg-emerald-950/30 text-emerald-400 hover:text-emerald-350 border border-emerald-900/40 rounded-xl transition-all duration-300"
                      >
                        💼 Employer Mode
                      </button>
                      <button
                        type="button"
                        id="intro-choice-business"
                        onClick={() => onSelectIntroOption("BUSINESS_RELATIONS")}
                        className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0a0a0a] hover:bg-cyan-950/30 text-cyan-400 hover:text-cyan-350 border border-cyan-900/40 rounded-xl transition-all duration-300"
                      >
                        🤝 Business Relations
                      </button>
                      <button
                        type="button"
                        id="intro-choice-romantic"
                        onClick={() => onSelectIntroOption("ROMANTIC")}
                        className="px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0a0a0a] hover:bg-rose-955/20 text-rose-450 hover:text-rose-400 border border-rose-950/50 rounded-xl transition-all duration-300"
                      >
                        ❤️ Romantic Relations
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] uppercase tracking-wider font-bold text-[#52525b] font-mono">
                AMIRU-LLM
              </span>
              <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
            </div>
            <div className="px-5 py-3 bg-[#0d0d0d] border border-zinc-850 rounded-2xl rounded-tl-none text-xs text-zinc-400 italic">
              Retrieving resume portfolio segments...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area with Sophisticated Dark round inline design */}
      <div className="p-6 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <input
            type="text"
            id="chat-input-text"
            value={inputValue}
            onChange={(e) => onChangeInput(e.target.value)}
            placeholder={
              questionCount >= maxQuestions
                ? "Session question limit reached."
                : "Inquire about Amirul's experience..."
            }
            disabled={isLoading || questionCount >= maxQuestions}
            className="w-full bg-[#0d0d0d] border border-zinc-800 rounded-full py-3.5 pl-6 pr-24 text-sm focus:outline-none focus:border-zinc-600 transition-all text-white placeholder-zinc-700 disabled:opacity-55"
          />
          <button
            type="submit"
            id="chat-submit-btn"
            disabled={isLoading || !inputValue.trim() || questionCount >= maxQuestions}
            className="absolute right-2 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-600 text-[10px] font-bold uppercase tracking-widest px-5 py-2 rounded-full transition-colors font-mono disabled:opacity-50"
          >
            Ask
          </button>
        </form>
        <div className="flex justify-between items-center mt-3 px-3 text-[10px] font-mono text-[#52525b]">
          <span>Verified access • Strict Tone controls hold</span>
          <span>Quota: {questionCount} / {maxQuestions} used</span>
        </div>
      </div>
    </div>
  );
}
