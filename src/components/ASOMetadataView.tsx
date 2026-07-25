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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-on-surface rounded-2xl p-6 shadow-xl border border-slate-700/60 space-y-3">
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
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-4">
        <h2 className="text-base font-extrabold text-on-surface border-b pb-2 flex items-center justify-between">
          <span>1. App Store Details</span>
          <button
            onClick={() => handleCopy('details', `${ASO_REPORT.appName}\nSubtitle: ${ASO_REPORT.subtitle}\nCategory: ${ASO_REPORT.category}`)}
            className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1"
          >
            {copiedKey === 'details' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'details' ? 'Copied!' : 'Copy'}
          </button>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">App Name</span>
            <span className="text-on-surface font-extrabold text-sm">{ASO_REPORT.appName}</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Subtitle</span>
            <span className="text-on-surface font-extrabold text-sm">{ASO_REPORT.subtitle}</span>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Category</span>
            <span className="text-on-surface font-extrabold text-sm">{ASO_REPORT.category}</span>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-4">
        <h2 className="text-base font-extrabold text-on-surface border-b pb-2 flex items-center justify-between">
          <span>2. Store Descriptions</span>
          <button
            onClick={() => handleCopy('desc', ASO_REPORT.longDescription)}
            className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1"
          >
            {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'desc' ? 'Copied!' : 'Copy Long Desc'}
          </button>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-extrabold text-on-surface-variant block mb-1">Short Description (80 chars):</span>
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest font-mono text-on-surface">
              {ASO_REPORT.shortDescription}
            </div>
          </div>

          <div>
            <span className="font-extrabold text-on-surface-variant block mb-1">Full Description:</span>
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest text-on-surface whitespace-pre-line leading-relaxed font-sans">
              {ASO_REPORT.longDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Keywords & What's New */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high space-y-4">
        <h2 className="text-base font-extrabold text-on-surface border-b pb-2">3. Keywords & Release Notes</h2>

        <div className="space-y-3 text-xs">
          <div>
            <span className="font-extrabold text-on-surface-variant block mb-1">App Store Keywords (100 chars max):</span>
            <div className="p-3 bg-primary-container text-on-primary-container text-blue-900 rounded-xl border border-blue-200 font-mono text-xs font-bold">
              {ASO_REPORT.keywords}
            </div>
          </div>

          <div>
            <span className="font-extrabold text-on-surface-variant block mb-1">What's New (v1.0 Release Notes):</span>
            <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-highest text-on-surface">
              {ASO_REPORT.whatsNew}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
