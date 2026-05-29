import { useState, useEffect } from "react";
import { AmirulFullData } from "../types";
import { AMIRUL_DEFAULT_DATA } from "../constants";
import { Briefcase, Code, FileText, Globe, Loader2, Mail, MapPin, Github, Award } from "lucide-react";

interface AboutPanelProps {
  onSuggestQuestion: (q: string) => void;
}

export default function AboutPanel({ onSuggestQuestion }: AboutPanelProps) {
  const [data, setData] = useState<AmirulFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"about" | "experience" | "skills" | "publications">("about");

  useEffect(() => {
    fetch("/api/amirul-data")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok, using internal backup constants.");
        }
        return res.json();
      })
      .then((dataRes) => {
        if (dataRes && dataRes.profile) {
          setData(dataRes);
        } else {
          setData(AMIRUL_DEFAULT_DATA);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Error loading dynamic portfolio data, falling back to cached profile:", err);
        setData(AMIRUL_DEFAULT_DATA);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div id="about-panel-loading" className="flex flex-col items-center justify-center p-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl min-h-[400px]">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mb-3" />
        <p className="text-xs font-mono text-zinc-400">Loading Amirul's Portfolio Database...</p>
      </div>
    );
  }

  const profileData = data || AMIRUL_DEFAULT_DATA;
  const { profile, experience = [], skills = [], publications = [] } = profileData;

  const suggestChips = [
    "What is Amirul's deep computer vision background?",
    "Tell me about his hybrid CNN-RF Forest Sound Detection paper",
    "Where did Amirul study, and what is his academic background?",
    "Is Amirul interested in paying my bills?"
  ];

  // Group skills by category for rich categorized styling
  const skillCategories: Record<string, typeof skills> = {};
  skills.forEach((sk) => {
    const cat = sk.category || "General";
    if (!skillCategories[cat]) {
      skillCategories[cat] = [];
    }
    skillCategories[cat].push(sk);
  });

  return (
    <div id="about-panel" className="flex flex-col gap-6 h-full text-[#d4d4d8]">
      {/* Header Info with Sophisticated Dark styling */}
      <div className="p-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl flex flex-col gap-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold block mb-2">
            AI & Computer Vision Engineer
          </span>
          <h2 className="text-3xl font-serif italic text-white leading-tight">
            {profile.name}
          </h2>
          <p className="text-xs font-mono text-emerald-500 mt-2.5 tracking-wider uppercase">
            {profile.title}
          </p>
          <span className="text-[10px] text-zinc-400 block mt-1 font-sans">
            {profile.currentRole}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-sans border-t border-[#1a1a1a] pt-4 whitespace-pre-line">
          {profile.aboutBrief}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono text-zinc-500 pt-2 border-t border-[#1a1a1a]">
          <span className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
            {profile.location}
          </span>
          <span className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors">
            <Mail className="w-3.5 h-3.5 text-zinc-600" />
            {profile.email}
          </span>
          {profile.githubUrl && (
            <a 
              href={profile.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-zinc-600" />
              github.com/aiamirul
            </a>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="p-1 bg-[#050505] border border-[#1a1a1a] rounded-xl flex gap-1 shadow-inner">
        {(["about", "experience", "skills", "publications"] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-btn-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-mono font-medium rounded-lg capitalize transition-all ${
              activeTab === tab
                ? "bg-[#111] text-white border border-[#1a1a1a] shadow-md"
                : "text-[#52525b] hover:text-zinc-300 hover:bg-[#070707]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interactive Tabs content */}
      <div className="flex-1 min-h-[300px] overflow-y-auto bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 transition-all shadow-md">
        {activeTab === "about" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mb-1">Professional Overview</h3>
            <p className="text-xs leading-relaxed text-[#a1a1aa] font-sans whitespace-pre-line">{profile.aboutLong}</p>
            <div className="p-4 bg-[#050505] border border-dashed border-[#222] rounded-xl mt-4">
              <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-widest">AUTHORIZED REPRESENTATIVE:</span>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                This AI platform reads Amirul's research papers, publications, design structures, database histories, and models. All chat items sent conform to validated engineering truths.
              </p>
            </div>
          </div>
        )}

        {activeTab === "experience" && (
          <div className="flex flex-col gap-5">
            <h3 className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-zinc-600" /> Professional Experience
            </h3>
            <div className="flex flex-col gap-6 pl-2 border-l border-[#1a1a1a]">
              {experience?.map((exp, idx) => (
                <div key={idx} className="relative flex flex-col gap-2">
                  <span className="absolute -left-[13px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <div>
                    <h4 className="text-xs font-semibold text-white tracking-wide">{exp.role}</h4>
                    <p className="text-[10px] font-mono text-zinc-500">{exp.company} &bull; {exp.startDate} to {exp.endDate}</p>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {exp.description}
                  </p>
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc pl-4 text-[11px] text-zinc-400 leading-relaxed flex flex-col gap-1.5 mt-1">
                      {exp.achievements.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {exp.techUsed && exp.techUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.techUsed.map((tech, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-mono bg-[#111] px-1.5 py-0.5 rounded border border-[#222] text-zinc-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
              <Code className="w-4 h-4 text-zinc-500" /> Core Skill set
            </h3>
            <div className="flex flex-col gap-4 mt-2">
              {Object.entries(skillCategories).map(([key, list]) => {
                return (
                  <div key={key} className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
                      {key}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((sk) => (
                        <span
                          key={sk.id}
                          className="px-2.5 py-1 text-xs font-sans text-zinc-400 bg-[#050505] border border-[#1a1a1a] rounded-lg hover:border-zinc-700 hover:text-white transition flex items-center justify-between gap-2"
                        >
                          <span>{sk.name}</span>
                          <span className="text-[9px] font-mono text-zinc-650 font-bold">{sk.proficiency}%</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "publications" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-zinc-500" /> Research & Publications
            </h3>
            <div className="flex flex-col gap-4 animate-fadeIn">
              {publications?.map((pub) => (
                <div key={pub.id} className="p-4 bg-[#050505] border border-[#1a1a1a] hover:border-zinc-805 rounded-xl flex flex-col gap-2 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-[#111] text-zinc-500 rounded border border-[#1a1a1a]">
                      {pub.journal}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">{pub.year}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-tight">{pub.title}</h4>
                  <p className="text-[10px] text-zinc-500 italic">Authors: {pub.authors}</p>
                  <p className="text-[11px] text-[#71717a] leading-relaxed line-clamp-3 hover:line-clamp-none transition-all duration-300">
                    {pub.description}
                  </p>
                  {pub.pdfUrl && (
                    <a 
                      href={pub.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-emerald-500 hover:underline mt-1 block"
                    >
                      View Resource: {pub.pdfFileName || "Download PDF"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested Chats helper */}
      <div className="flex flex-col gap-2 mt-1">
        <span className="text-[10px] font-mono font-bold text-[#52525b] tracking-[0.15em] uppercase">
          SUGGESTED DISCOVERY QUERIES:
        </span>
        <div className="flex flex-col gap-1.5">
          {suggestChips.map((chip, idx) => (
            <button
              key={idx}
              id={`suggest-chip-${idx}`}
              onClick={() => onSuggestQuestion(chip)}
              className="w-full text-left px-4 py-2.5 text-xs font-sans text-zinc-400 hover:text-white bg-[#0a0a0a] hover:bg-[#111] border border-[#1a1a1a] hover:border-zinc-700 rounded-lg transition overflow-ellipsis whitespace-nowrap overflow-hidden"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
