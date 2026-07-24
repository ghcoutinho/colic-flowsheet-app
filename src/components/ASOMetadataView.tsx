import React, { useState } from 'react';
import { ASO_REPORT } from '../data/mockData';
import { Sparkles, Copy, Check, Download, Image as ImageIcon, FileText, Smartphone, ExternalLink, ShieldCheck } from 'lucide-react';

export const ASOMetadataView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">App Store Optimization (ASO) Metadata & Media Kit</h1>
        </div>
        <p className="text-xs text-slate-300">
          Production-ready App Store & Google Play metadata report, marketing screenshots showcase, and GitHub assets.
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            Category: {ASO_REPORT.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            ASO Status: Verified 100%
          </span>
        </div>
      </div>

      {/* App Details Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span>1. App Store Details</span>
          <button
            onClick={() => handleCopy('details', `${ASO_REPORT.appName}\nSubtitle: ${ASO_REPORT.subtitle}\nCategory: ${ASO_REPORT.category}`)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {copiedKey === 'details' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'details' ? 'Copied!' : 'Copy'}
          </button>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">App Name</span>
            <span className="text-slate-900 font-extrabold text-sm">{ASO_REPORT.appName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Subtitle</span>
            <span className="text-slate-900 font-extrabold text-sm">{ASO_REPORT.subtitle}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Category</span>
            <span className="text-slate-900 font-extrabold text-sm">{ASO_REPORT.category}</span>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span>2. Store Descriptions</span>
          <button
            onClick={() => handleCopy('desc', ASO_REPORT.longDescription)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'desc' ? 'Copied!' : 'Copy Long Desc'}
          </button>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-extrabold text-slate-700 block mb-1">Short Description (80 chars):</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800">
              {ASO_REPORT.shortDescription}
            </div>
          </div>

          <div>
            <span className="font-extrabold text-slate-700 block mb-1">Full Description:</span>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {ASO_REPORT.longDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Keywords & What's New */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 border-b pb-2">3. Keywords & Release Notes</h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-extrabold text-slate-700 block mb-1">App Store Keywords (100 chars max):</span>
            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 font-mono text-xs font-bold">
              {ASO_REPORT.keywords}
            </div>
          </div>

          <div>
            <span className="font-extrabold text-slate-700 block mb-1">What's New (v1.0 Release Notes):</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
              {ASO_REPORT.whatsNew}
            </div>
          </div>
        </div>
      </div>

      {/* App Icon & Marketing Screenshots Package Deliverables */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 border-b pb-2 flex items-center justify-between">
          <span>4. Marketing Assets & Deliverables</span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            5 Assets Package Ready
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* App Icon Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center gap-4 border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 p-2.5 flex items-center justify-center shrink-0 border border-blue-400/40 shadow-lg">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-none stroke-current stroke-[7] stroke-linecap-round stroke-linejoin-round">
                <path d="M 15 50 H 30 L 38 25 L 48 75 L 58 40 L 65 50 H 85" />
                <path d="M 45 20 C 50 10, 65 10, 75 25 C 80 35, 75 48, 65 55 C 60 58, 55 68, 52 85" />
              </svg>
            </div>
            <div>
              <div className="font-black text-sm text-white">Premium App Icon</div>
              <div className="text-[11px] text-slate-400 mt-0.5">1024x1024 Brand Mark • Minimalist Equine-Pulse Symbol on Deep Navy Gradient</div>
            </div>
          </div>

          {/* Deliverables List */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-extrabold text-slate-900 mb-1">Deliverables Breakdown:</div>
            {ASO_REPORT.deliverables.map((item, idx) => (
              <div key={idx} className="text-slate-700 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
