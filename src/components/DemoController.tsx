import React, { useState } from 'react';
import {
  Sparkles,
  FastForward,
  Activity,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  HeartCrack,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

export const DemoController: React.FC = () => {
  const { fastForwardTime, simulateDemoAlert, resetAllData, currentTimeDisplay } =
    useHospital();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/80 overflow-hidden w-80 sm:w-96 transition-all">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-gradient-to-r from-sky-900 to-slate-900 flex items-center justify-between hover:from-sky-800 hover:to-slate-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold tracking-wide uppercase">
              Hackathon Demo Controls
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-sky-300">
            <span className="text-[11px] font-mono">{currentTimeDisplay}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Collapsible Controls Content */}
        {isOpen && (
          <div className="p-4 bg-slate-950/95 space-y-3.5 text-xs border-t border-slate-800 animate-in fade-in duration-150">
            <p className="text-[11px] text-slate-400">
              Interactive triggers for judges to demonstrate automated alarms, overdue detection,
              and abnormal vitals.
            </p>

            {/* Time Fast-Forward Section */}
            <div>
              <span className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <FastForward className="w-3.5 h-3.5 text-sky-400" />
                Simulate Shift Time Progression:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => fastForwardTime(30)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-[11px] transition-colors"
                >
                  +30 Minutes
                </button>
                <button
                  onClick={() => fastForwardTime(60)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-900/60 hover:bg-sky-800/80 border border-sky-700 text-sky-200 font-bold text-[11px] transition-colors"
                >
                  +1 Hour (Overdue)
                </button>
                <button
                  onClick={() => fastForwardTime(180)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-[11px] transition-colors"
                >
                  +3 Hours
                </button>
              </div>
            </div>

            {/* Abnormal Vitals Simulation */}
            <div>
              <span className="font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                Trigger Vital Emergencies (Live Alarm):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => simulateDemoAlert('p-102', 'hypoxia')}
                  className="px-2.5 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-200 font-semibold text-[11px] text-left transition-colors flex items-center gap-1.5"
                >
                  <HeartCrack className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Bed 102 SpO₂ Drop (87%)</span>
                </button>
                <button
                  onClick={() => simulateDemoAlert('p-104', 'tachycardia')}
                  className="px-2.5 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800 text-amber-200 font-semibold text-[11px] text-left transition-colors flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bed 104 HR Spike (142 bpm)</span>
                </button>
              </div>
            </div>

            {/* Reset State */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Instant test reset</span>
              <button
                onClick={resetAllData}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
