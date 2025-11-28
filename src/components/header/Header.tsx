import { useState } from 'react';
import { MapPin, Users, Layers, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface HeaderProps {
  activeLocation: string;
  totalGroups: number;
  totalMembers: number;
}

const Header = ({ activeLocation, totalGroups, totalMembers }: HeaderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLocationDisplay = (location: string) => {
    if (!location || location === 'all' || location === '') {
      return 'Semua Lokasi';
    }
    return location; // return nama desa (ex: "Desa Ciseeng")
  };

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  return (
    <div className="absolute p-4 z-30">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-100 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-white
          ${isExpanded ? 'min-w-[280px]' : 'min-w-[200px]'}
        `}
      >
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
               <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                {getLocationDisplay(activeLocation)}
              </h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mt-0.5">
                Live Monitoring
              </p>
            </div>
          </div>

          <div className="text-gray-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {/* --- DETAILS SECTION --- */}
        <div
          className={`grid transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-100'
              : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0 border-transparent'
          }`}
        >
          <div className="min-h-0">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Kelompok</span>
                 </div>
                 <div className="text-xl font-bold text-gray-900 leading-none">
                   {formatNumber(totalGroups)}
                 </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Anggota</span>
                 </div>
                 <div className="text-xl font-bold text-gray-900 leading-none">
                   {formatNumber(totalMembers)}
                 </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-500 font-medium">
                Updated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Header;
