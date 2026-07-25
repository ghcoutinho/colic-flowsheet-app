import React, { useState } from 'react';
import { StandingOrder } from '../types';
import { FileText, CheckCircle2, ChevronDown, ChevronUp, Droplets, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface StandingOrdersViewProps {
  orders: StandingOrder[];
}

export const StandingOrdersView: React.FC<StandingOrdersViewProps> = ({ orders }) => {
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'surgeon'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('so_fluids');

  const filteredOrders = orders.filter((o) => {
    if (selectedType === 'all') return true;
    return o.type === selectedType;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20 md:pb-8">
      {/* Title Header */}
      <div className="bg-surface-container border border-surface-container-high rounded-2xl p-5 border border-surface-container-highest border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            Standing Orders Library
          </h1>
          <p className="text-xs text-outline-variant mt-1">
            Standardized ICU treatment protocols & equine emergency guidelines
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="bg-surface-container-lowest p-1 rounded-xl border border-surface-container-highest flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'all' ? 'bg-surface-container border border-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            All Protocols
          </button>
          <button
            onClick={() => setSelectedType('hospital')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'hospital' ? 'bg-surface-container border border-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            Hospital Standard
          </button>
          <button
            onClick={() => setSelectedType('surgeon')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'surgeon' ? 'bg-surface-container border border-surface-container-high text-on-surface shadow-xs' : 'text-outline hover:text-on-surface'
            }`}
          >
            Surgeon Preferences
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const isExpanded = expandedId === order.id;

          return (
            <div
              key={order.id}
              className="bg-surface-container border border-surface-container-high rounded-2xl border border-surface-container-highest border border-surface-container-high overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">{order.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.type === 'hospital' ? 'bg-surface-container-lowest text-on-surface-variant' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.type === 'hospital' ? 'Hospital Standard' : 'Surgeon Preferred'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-on-surface">{order.title}</h3>
                  <p className="text-xs text-outline-variant line-clamp-1">{order.description}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="p-4 sm:p-5 bg-surface-container-low border-t border-surface-container-highest space-y-3">
                  <p className="text-xs text-on-surface-variant font-medium">{order.description}</p>

                  <div className="bg-surface-container border border-surface-container-high rounded-xl p-3.5 border border-surface-container-highest space-y-2">
                    <div className="text-xs font-bold text-on-surface uppercase tracking-wider">Protocol Details:</div>
                    <ul className="space-y-1.5 text-xs text-on-surface-variant">
                      {order.protocolDetails.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
