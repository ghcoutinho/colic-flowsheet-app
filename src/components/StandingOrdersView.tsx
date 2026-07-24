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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Standing Orders Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized ICU treatment protocols & equine emergency guidelines
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Protocols
          </button>
          <button
            onClick={() => setSelectedType('hospital')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'hospital' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital Standard
          </button>
          <button
            onClick={() => setSelectedType('surgeon')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedType === 'surgeon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{order.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.type === 'hospital' ? 'bg-slate-100 text-slate-700' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.type === 'hospital' ? 'Hospital Standard' : 'Surgeon Preferred'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{order.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{order.description}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                  <p className="text-xs text-slate-700 font-medium">{order.description}</p>

                  <div className="bg-white rounded-xl p-3.5 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Protocol Details:</div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
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
