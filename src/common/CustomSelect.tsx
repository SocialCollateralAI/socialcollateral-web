import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface Option {
  id: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options?: Option[]; // Ditandai optional agar aman
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const CustomSelect = ({ value, options = [], onChange, placeholder, disabled }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Safe check untuk find
  const selectedLabel = (options || []).find((opt) => opt.id === value)?.label || placeholder;

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
          {(options || []).filter(opt => opt.id !== '').map((opt) => (
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

export default CustomSelect;
