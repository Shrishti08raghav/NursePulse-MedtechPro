import { useState } from 'react';
import { X, ShieldCheck, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface QRUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRUnlockModal: React.FC<QRUnlockModalProps> = ({ isOpen, onClose }) => {
  const { setIsAdminMode } = useHospital();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleUnlock = () => {
    setIsAdminMode(true);
    onClose();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === 'admin' || pin === '0000') {
      handleUnlock();
    } else {
      setError(true);
    }
  };

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      handleUnlock();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide uppercase">Admin Security Portal</h3>
              <p className="text-[11px] text-slate-400">Restricted Hospital Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Master QR Token Identified</span>
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan the secure administrative QR code with a hospital device or click below to authenticate.
          </p>

          {/* SVG QR Code */}
          <div className="relative mx-auto w-48 h-48 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md flex items-center justify-center">
            {scanning ? (
              <div className="flex flex-col items-center justify-center space-y-2 text-sky-600">
                <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">Verifying Token...</span>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Clean Vector QR Code Pattern */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-slate-900"
                  fill="currentColor"
                >
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="12" width="14" height="14" rx="2" />
                  <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="74" y="12" width="14" height="14" rx="2" />
                  <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="12" y="74" width="14" height="14" rx="2" />
                  {/* Data blocks */}
                  <rect x="42" y="8" width="6" height="6" />
                  <rect x="52" y="8" width="6" height="14" />
                  <rect x="42" y="22" width="12" height="6" />
                  <rect x="8" y="42" width="14" height="6" />
                  <rect x="8" y="54" width="6" height="6" />
                  <rect x="22" y="48" width="8" height="12" />
                  <rect x="40" y="40" width="20" height="20" rx="3" fill="#0284c7" />
                  <rect x="68" y="42" width="14" height="8" />
                  <rect x="78" y="56" width="12" height="6" />
                  <rect x="68" y="68" width="8" height="16" />
                  <rect x="44" y="68" width="16" height="6" />
                  <rect x="42" y="80" width="8" height="12" />
                  <rect x="84" y="80" width="10" height="12" />
                </svg>
                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-sky-600" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] font-mono text-slate-400">
            TOKEN: APEX-HOSP-ADM-9941
          </p>

          {/* Quick Simulation Button for Hackathon Judges */}
          <div>
            <button
              onClick={handleSimulateScan}
              disabled={scanning}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-sm shadow-sky-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Scan QR & Unlock Admin Dashboard</span>
            </button>
          </div>

          {/* Alternative PIN code */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 block mb-2">Or enter Admin Passcode (Default: 1234):</span>
            <form onSubmit={handlePinSubmit} className="flex gap-2">
              <input
                type="password"
                placeholder="Passcode..."
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                className={`flex-1 px-3 py-1.5 text-xs text-center border rounded-lg focus:outline-none ${
                  error ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'
                }`}
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
              >
                Unlock
              </button>
            </form>
            {error && (
              <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                Invalid Passcode! Try 1234 or click the button above.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </div>
  );
};
