import { useState, useRef } from 'react';
import {
  Activity,
  Volume2,
  VolumeX,
  Clock,
  UserPlus,
  FileSpreadsheet,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Volume1,
} from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface HeaderProps {
  onOpenAddPatient: () => void;
  onOpenShiftReport: () => void;
  onOpenQRUnlock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddPatient,
  onOpenShiftReport,
  onOpenQRUnlock,
}) => {
  const {
    currentTimeDisplay,
    selectedDate,
    setSelectedDate,
    goToNextDay,
    goToPrevDay,
    goToToday,
    audioEnabled,
    toggleAudio,
    testAudio,
    isAlarmRinging,
    silenceActiveAlarm,
  } = useHospital();

  // Long press detector on logo
  const [pressProgress, setPressProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startLongPress = () => {
    setPressProgress(0);
    const startTime = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / 1500) * 100));
      setPressProgress(progress);
    }, 50);

    timerRef.current = window.setTimeout(() => {
      cancelLongPress();
      onOpenQRUnlock();
    }, 1500);
  };

  const cancelLongPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPressProgress(0);
  };

  const isToday = new Date().toISOString().split('T')[0] === selectedDate;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Long-Pressable Logo for Admin */}
          <div className="flex items-center space-x-3 shrink-0">
            <div
              onMouseDown={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={startLongPress}
              onTouchEnd={cancelLongPress}
              title="Hold logo for 1.5s to open Admin QR Panel"
              className="relative w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-200 cursor-pointer active:scale-95 transition-all overflow-hidden"
            >
              {/* Circular Progress Overlay */}
              {pressProgress > 0 && (
                <div
                  className="absolute inset-0 bg-sky-800 opacity-60 transition-all"
                  style={{ height: `${pressProgress}%` }}
                />
              )}
              <Activity className="w-6 h-6 stroke-[2.2] relative z-10" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Nurse<span className="text-sky-600">Pulse</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                  MedTech Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Building2 className="w-3 h-3 text-slate-400" />
                Apex Memorial Hospital
              </p>
            </div>
          </div>

          {/* Date Selector & 24-Hour Cycle Control */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={goToPrevDay}
              title="Previous Day"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
              {isToday ? (
                <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">
                  Today
                </span>
              ) : (
                <button
                  onClick={goToToday}
                  className="text-[10px] font-semibold text-sky-600 hover:underline"
                >
                  Go to Today
                </button>
              )}
            </div>

            <button
              onClick={goToNextDay}
              title="Next Day (New 24h Schedule)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ward Clock */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 shadow-2xs">
            <Clock className="w-4 h-4 text-sky-600" />
            <div className="text-xs">
              <span className="text-slate-400 font-normal">Ward Time: </span>
              <span className="font-semibold text-slate-800">{currentTimeDisplay}</span>
            </div>
          </div>

          {/* Audio Controls & Silence Button */}
          <div className="flex items-center space-x-2">
            {/* If alarm is currently ringing, show urgent Silence button */}
            {isAlarmRinging && (
              <button
                onClick={silenceActiveAlarm}
                className="animate-bounce bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-300 transition-all cursor-pointer"
              >
                <BellRing className="w-4 h-4 animate-spin" />
                <span>Silence Alarm</span>
              </button>
            )}

            {/* Test Audio Output button */}
            <button
              onClick={testAudio}
              title="Test speaker output"
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              <Volume1 className="w-3.5 h-3.5 text-sky-600" />
              <span>Test Audio</span>
            </button>

            {/* Audio Alert Toggle */}
            <button
              onClick={toggleAudio}
              title={audioEnabled ? 'Mute Audio Alerts' : 'Unmute Audio Alerts'}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
                audioEnabled
                  ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              {audioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-sky-600" />
                  <span className="hidden xl:inline text-xs font-medium">Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs font-medium">Muted</span>
                </>
              )}
            </button>

            {/* Shift Handover Report */}
            <button
              onClick={onOpenShiftReport}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>Shift Handover</span>
            </button>

            {/* Add Patient Button */}
            <button
              onClick={onOpenAddPatient}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-xs shadow-sky-200 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Admit Patient</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
