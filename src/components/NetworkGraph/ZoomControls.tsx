// src/components/NetworkGraph/ZoomControls.tsx
import React from 'react'
import { Plus, Minus, Maximize } from 'lucide-react'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden flex flex-col">
        <button onClick={onZoomIn} className="p-2.5 hover:bg-gray-50 text-slate-600 border-b active:bg-gray-100">
          <Plus size={18} />
        </button>
        <button onClick={onZoomOut} className="p-2.5 hover:bg-gray-50 text-slate-600 active:bg-gray-100">
          <Minus size={18} />
        </button>
      </div>

      <button
        onClick={onReset}
        className="p-2.5 bg-white hover:bg-indigo-50 text-indigo-600 rounded-lg shadow-lg border border-indigo-100 transition active:scale-95"
      >
        <Maximize size={18} />
      </button>
    </div>
  )
}

export default ZoomControls