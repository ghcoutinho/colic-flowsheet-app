import React, { useState } from 'react';
import { ReferenceRangeCategory } from '../types';
import { BookOpen, Search, Info, CheckCircle, Heart, Thermometer, Activity, ShieldCheck } from 'lucide-react';

interface ReferenceRangesViewProps {
  categories: ReferenceRangeCategory[];
}

export const ReferenceRangesView: React.FC<ReferenceRangesViewProps> = ({ categories }) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const currentCat = categories[activeCategoryIndex] || categories[0];

  const filteredItems = currentCat.items.filter(
    (item) =>
      item.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.range.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-20 md:pb-8">
      {/* Title Header */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high text-center">
        <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight flex items-center justify-center gap-2">
          Equine Reference Ranges 🐴
        </h1>
        <p className="text-xs text-outline-variant mt-1">
          Validated physiological & clinicopathological targets for adult equine ICUs
        </p>

        {/* Search Input */}
        <div className="mt-4 relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search parameters (e.g. PCV, Lactate, Heart Rate)..."
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-surface-container-highest rounded-xl text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-surface-container-lowest p-1.5 rounded-xl border border-surface-container-highest">
        {categories.map((cat, idx) => (
          <button
            key={cat.category}
            onClick={() => setActiveCategoryIndex(idx)}
            className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeCategoryIndex === idx
                ? 'bg-surface-container border border-surface-container-high text-primary border border-surface-container-high border border-surface-container-highest'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Items Cards List */}
      <div className="space-y-3">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-surface-container border border-surface-container-high rounded-2xl p-4 border border-surface-container-highest border border-surface-container-high flex items-center justify-between gap-4 hover:border-blue-200 transition-colors"
          >
            <div className="space-y-0.5">
              <div className="font-extrabold text-on-surface text-sm">{item.parameter}</div>
              {item.note && <div className="text-[11px] text-outline-variant">{item.note}</div>}
            </div>

            <div className="shrink-0 bg-emerald-500 text-on-surface font-extrabold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-xs">
              {item.range}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-400 italic">
        Values represent normal adult equine ranges. Clinical interpretation required.
      </p>
    </div>
  );
};
