import React from 'react';
import { Activity, HeartPulse, Calculator, PieChart, Settings, BookOpen, Sparkles, FileText } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'flowsheet', label: 'Flowsheet', icon: Activity },
    { id: 'patients', label: 'Patient Info', icon: HeartPulse },
    { id: 'calculator', label: 'Dose Calc', icon: Calculator },
    { id: 'prognosis', label: 'Prognosis', icon: PieChart },
    { id: 'schedule', label: 'Settings', icon: Settings },
    { id: 'aso', label: 'ASO Kit', icon: Sparkles },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-slate-800 z-50 px-2 py-1.5 border border-outline-variant">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-center transition-all ${
                isActive ? 'text-blue-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
