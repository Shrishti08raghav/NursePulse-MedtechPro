import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({ isOpen, onClose }) => {
  const { addPatient } = useHospital();

  const [name, setName] = useState('');
  const [bedNumber, setBedNumber] = useState('Bed 107');
  const [age, setAge] = useState<number>(55);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [diagnosis, setDiagnosis] = useState('');
  const [ward, setWard] = useState('Cardiology Ward 3A');
  const [doctor, setDoctor] = useState('Dr. Robert Chen, MD');
  const [allergiesStr, setAllergiesStr] = useState('');

  // Initial baseline vitals
  const [hr, setHr] = useState<number>(76);
  const [spO2, setSpO2] = useState<number>(98);
  const [bpSys, setBpSys] = useState<number>(120);
  const [bpDia, setBpDia] = useState<number>(80);
  const [temp, setTemp] = useState<number>(98.6);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !diagnosis) return;

    const allergies = allergiesStr
      ? allergiesStr.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    addPatient({
      name,
      bedNumber,
      age: Number(age),
      gender,
      diagnosis,
      ward,
      doctor,
      admissionDate: new Date().toISOString().split('T')[0],
      allergies,
      triageStatus: 'stable',
      vitals: {
        heartRate: Number(hr),
        spO2: Number(spO2),
        bloodPressureSys: Number(bpSys),
        bloodPressureDia: Number(bpDia),
        temperature: Number(temp),
        respiratoryRate: 16,
        timestamp: 'Admitted',
      },
      medications: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Admit New Patient</h2>
              <p className="text-xs text-slate-500">Assign bed and register initial vitals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. David Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Number *</label>
              <input
                type="text"
                required
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ward</label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="Cardiology Ward 3A">Cardiology 3A</option>
                <option value="Surgical Ward 2B">Surgical 2B</option>
                <option value="Pulmonology / Step-Down">Pulmonology</option>
                <option value="Nephrology Ward 3C">Nephrology 3C</option>
                <option value="Orthopedics 1A">Orthopedics 1A</option>
                <option value="ICU">ICU</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Diagnosis *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unstable Angina, Post-Op Appendectomy, Pneumonia"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attending Physician
              </label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Allergies (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin, Latex, NSAIDs"
                value={allergiesStr}
                onChange={(e) => setAllergiesStr(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Baseline Vitals */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700 mb-2">
              Initial Baseline Vitals
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">HR (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">SpO₂ (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded-md"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Sys / Dia</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(Number(e.target.value))}
                    className="w-1/2 text-xs font-semibold px-1 py-1.5 border border-slate-200 rounded-md text-center"
                  />
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(Number(e.target.value))}
                    className="w-1/2 text-xs font-semibold px-1 py-1.5 border border-slate-200 rounded-md text-center"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Temp (°F)</label>
                <input
                  type="number"
                  step={0.1}
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-2 py-1.5 border border-slate-200 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
            >
              Admit Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
