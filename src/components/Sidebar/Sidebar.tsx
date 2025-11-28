import { useMemo } from 'react';
import { Activity, Filter, User } from 'lucide-react';
import networkData from '../../data/networkData.json';
import CustomSelect from '../../common/CustomSelect';
import WalletCard from './WalletCard';
import { SidebarProps } from './types';

const Sidebar = ({
  selectedKabupaten,
  onKabupatenChange,
  selectedDesa,
  onDesaChange,
  selectedStatus,
  onStatusChange,
  walletBalance
}: SidebarProps) => {

  const groupsArray = useMemo(() => Object.values((networkData as any).groups || {}), [] as any[]);

  const kabupatenOptions = useMemo(() => {
    const cities = Array.from(new Set(groupsArray.map((g: any) => g.header?.location_city).filter(Boolean)));
    return cities.map((c: string) => ({ id: c, label: c }));
  }, [groupsArray]);

  const desaOptions = useMemo(() => {
    if (!selectedKabupaten) return [];
    const villages = Array.from(new Set(groupsArray
      .filter((g: any) => g.header?.location_city === selectedKabupaten)
      .map((g: any) => g.header?.location_village)
      .filter(Boolean)));
    return villages.map((v: string) => ({ id: v, label: v }));
  }, [groupsArray, selectedKabupaten]);

  const statusOptions = useMemo(() => {
    const opts: { id: string; label: string }[] = [{ id: 'all', label: 'All Status' }];
    const hasHealthy = groupsArray.some((g: any) => (g.header?.trust_score ?? 0) > 80);
    const hasMedium = groupsArray.some((g: any) => (g.header?.trust_score ?? 0) >= 25 && (g.header?.trust_score ?? 0) <= 80);
    const hasHigh = groupsArray.some((g: any) => (g.header?.trust_score ?? 0) < 25);

    if (hasHealthy) opts.push({ id: 'healthy', label: 'Healthy Group' });
    if (hasMedium) opts.push({ id: 'medium', label: 'Medium Risk' });
    if (hasHigh) opts.push({ id: 'high', label: 'High Risk' });

    return opts;
  }, [groupsArray]);

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
            <CustomSelect
              value={selectedKabupaten}
              options={kabupatenOptions}
              onChange={onKabupatenChange}
              placeholder="Pilih Kabupaten"
            />

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

                  {/* Custom Radio Circle */}
                  <div className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ease-out
                    ${isStatusDisabled
                      ? 'border-gray-200 bg-gray-50'
                      : selectedStatus === status.id
                        ? 'border-purple-600 bg-white shadow-[0_0_0_4px_rgba(147,51,234,0.1)]'
                        : 'border-gray-300 bg-white group-hover:border-purple-300'
                    }`}>
                  </div>
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
        <WalletCard balance={walletBalance} />

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
