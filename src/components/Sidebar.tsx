import { useState, useEffect, useRef } from 'react';
import { Activity, Filter, Wallet, User, ChevronDown, Check, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  selectedKabupaten: string;
  onKabupatenChange: (val: string) => void;
  selectedDesa: string;
  onDesaChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  walletBalance: number;
}

// --- 1. Custom Select Component (Untuk Dropdown yang lebih smooth) ---
interface Option {
  id: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: Option[];
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomSelect = ({ value, options, onChange, placeholder, disabled }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.id === value)?.label || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 flex items-center justify-between bg-white border rounded-xl text-left transition-all duration-300 ease-out
          ${disabled
            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
            : 'hover:border-purple-300 hover:shadow-md border-gray-200 text-gray-700 cursor-pointer shadow-sm'
          }
          ${isOpen ? 'border-purple-500 ring-4 ring-purple-50/50 shadow-md' : ''}
        `}
      >
        <span className="font-medium truncate text-sm">{selectedLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180 text-purple-600' : 'text-gray-400'}`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <div
        className={`absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-top
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
          {options.filter(opt => opt.id !== '').map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors duration-150 group
                ${value === opt.id ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className={`text-sm ${value === opt.id ? 'font-semibold' : 'font-medium'}`}>{opt.label}</span>
              {value === opt.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 2. Main Sidebar Component ---
const Sidebar = ({
  selectedKabupaten,
  onKabupatenChange,
  selectedDesa,
  onDesaChange,
  selectedStatus,
  onStatusChange,
  walletBalance
}: SidebarProps) => {

  const kabupatenOptions = [
    { id: 'bogor', label: 'Kabupaten Bogor' },
    { id: 'bekasi', label: 'Kabupaten Bekasi' },
    { id: 'karawang', label: 'Kabupaten Karawang' },
  ];

  const desaOptions = [
    { id: 'sukamaju', label: 'Desa Sukamaju' },
    { id: 'makmur', label: 'Desa Makmur' },
    { id: 'sejahtera', label: 'Desa Sejahtera' },
    { id: 'ciherang', label: 'Desa Ciherang' },
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'healthy', label: 'Healthy Group' },
    { id: 'medium', label: 'Medium Risk' },
    { id: 'high', label: 'High Risk' }
  ];

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('Rp', 'Rp ');
  };

  const isDesaDisabled = !selectedKabupaten;
  const isStatusDisabled = !selectedDesa;

  return (
    <aside className="w-80 min-h-screen bg-white text-gray-800 flex flex-col border-r border-gray-100 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0 z-20">

      {/* Brand Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">SocialColateral AI</h2>
          </div>
          <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-100 tracking-wide">
            DEMO
          </span>
        </div>
      </div>

      <hr className="border-gray-100 my-2 mx-6" />

      <div className="px-6 flex-1 flex flex-col space-y-9 pt-4">

        {/* --- Location Filtering Section --- */}
        <div className="space-y-4 animate-in slide-in-from-left duration-500">
          <div className="flex items-center space-x-2 text-purple-600">
            <Filter className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600">Location Filtering</h3>
          </div>

          <div className="space-y-3">
            {/* Custom Dropdown Kabupaten */}
            <CustomSelect
              value={selectedKabupaten}
              options={kabupatenOptions}
              onChange={onKabupatenChange}
              placeholder="Pilih Kabupaten"
            />

            {/* Custom Dropdown Desa */}
            <CustomSelect
              value={selectedDesa}
              options={desaOptions}
              onChange={onDesaChange}
              placeholder="Pilih Desa"
              disabled={isDesaDisabled}
            />
          </div>
        </div>

        {/* --- Status Filtering Section --- */}
        <div className="space-y-4 animate-in slide-in-from-left duration-500 delay-75">
          <div className={`flex items-center space-x-2 transition-colors duration-300 ${isStatusDisabled ? 'text-gray-300' : 'text-purple-600'}`}>
            <Activity className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Status Filtering</h3>
          </div>

          <div className="space-y-3 pl-1">
            {statusOptions.map((status) => (
              <label
                key={status.id}
                className={`flex items-center space-x-3 group relative p-1 rounded-lg transition-all duration-200
                  ${isStatusDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'}
                `}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.id}
                    checked={selectedStatus === status.id}
                    onChange={(e) => onStatusChange(e.target.value)}
                    disabled={isStatusDisabled}
                    className="peer sr-only"
                  />

                  {/* Custom Radio Circle - Outer */}
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ease-out
                    ${isStatusDisabled
                      ? 'border-gray-200 bg-gray-50'
                      : selectedStatus === status.id
                        ? 'border-purple-600 bg-white shadow-[0_0_0_4px_rgba(147,51,234,0.1)]'
                        : 'border-gray-300 bg-white group-hover:border-purple-300'
                    }`}>
                  </div>

                  {/* Custom Radio Circle - Inner Dot */}
                  <div className={`absolute w-2.5 h-2.5 rounded-full bg-purple-600 transition-all duration-300 ease-out transform
                    ${selectedStatus === status.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                  `}></div>
                </div>

                <span className={`text-sm font-medium transition-colors duration-200
                  ${isStatusDisabled
                    ? 'text-gray-400'
                    : selectedStatus === status.id ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                  {status.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="px-6 pb-6 pt-4">
        <div className="relative w-full bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_25px_rgba(147,51,234,0.08)] hover:border-purple-100 hover:-translate-y-1">
          <div className="p-5 pb-6 relative z-10">
            <div className="flex items-center space-x-2 text-purple-600 mb-3">
              <div className="p-1.5 bg-purple-50 rounded-md">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Amartha Wallet</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatRupiah(walletBalance)}
            </div>
          </div>

          {/* Decorative Wave BG */}
          <div className="absolute bottom-0 left-0 right-0 w-full h-16 z-0 opacity-100">
             <svg viewBox="0 0 1440 320" className="w-full h-full text-purple-200 fill-current">
                <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </svg>
          </div>
          <div className="absolute bottom-0 left-0 right-0 w-full h-16 z-0 opacity-40">
             <svg viewBox="0 0 1440 320" className="w-full h-full text-purple-400 fill-current" style={{ transform: 'scaleX(-1)' }}>
                <path d="M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,170.7C672,160,768,192,864,208C960,224,1056,224,1152,208C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
             </svg>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4 mt-2 border-t border-gray-50">
          <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
             <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Admin Firyan</h4>
            <p className="text-[10px] uppercase font-bold text-purple-600 tracking-wide">Head of Risk</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
