import { Wallet } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

interface WalletCardProps {
  balance: number;
}

const WalletCard = ({ balance }: WalletCardProps) => {

  return (
    <div className="relative w-full bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_25px_rgba(147,51,234,0.08)] hover:border-purple-100 hover:-translate-y-1">
      <div className="p-5 pb-6 relative z-10">
        <div className="flex items-center space-x-2 text-purple-600 mb-3">
          <div className="p-1.5 bg-purple-50 rounded-md">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Amartha Wallet</span>
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight">
          {formatCurrency(balance)}
        </div>
      </div>

      {/* Decorative Background */}
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
  );
};

export default WalletCard;
