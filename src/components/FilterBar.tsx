import { Search, LayoutGrid, List, AlertTriangle } from 'lucide-react';
import { useHospital } from '../context/HospitalContext';

interface FilterBarProps {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ viewMode, setViewMode }) => {
  const { searchQuery, setSearchQuery, activeFilter, setActiveFilter, patients } = useHospital();

  // Extract unique wards
  const wards = Array.from(new Set(patients.map((p) => p.ward)));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient by name, bed, diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges & View Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Patients ({patients.length})
          </button>

          <button
            onClick={() => setActiveFilter('attention')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeFilter === 'attention'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Attention</span>
          </button>

          {/* Ward filter selector */}
          <div className="relative">
            <select
              value={wards.includes(activeFilter) ? activeFilter : ''}
              onChange={(e) => setActiveFilter(e.target.value || 'all')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">Filter by Ward...</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Compact Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
