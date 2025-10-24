import { Wifi, Battery } from 'lucide-react';

interface StatusBarProps {
  variant?: 'light' | 'dark';
}

export function StatusBar({ variant = 'dark' }: StatusBarProps) {
  const textColor = variant === 'dark' ? 'text-gray-900' : 'text-white';
  
  // Aktuelle Zeit
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  return (
    <div className={`w-full h-11 flex items-center justify-between px-6 ${textColor}`}>
      {/* Zeit */}
      <div className="flex-1">
        <span className="text-sm">{hours}:{minutes}</span>
      </div>

      {/* Dynamic Island Spacer */}
      <div style={{ width: '126px' }} />

      {/* Status Icons */}
      <div className="flex-1 flex items-center justify-end gap-1">
        {/* Signal */}
        <div className="flex items-center gap-0.5">
          <div className={`w-0.5 h-2 rounded-full ${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />
          <div className={`w-0.5 h-2.5 rounded-full ${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />
          <div className={`w-0.5 h-3 rounded-full ${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />
          <div className={`w-0.5 h-3.5 rounded-full ${variant === 'dark' ? 'bg-gray-900' : 'bg-white'}`} />
        </div>

        {/* WiFi */}
        <Wifi className="w-4 h-4 ml-1" strokeWidth={1.5} />

        {/* Batterie */}
        <div className="ml-1 flex items-center gap-0.5">
          <Battery className="w-6 h-4" strokeWidth={1.5} fill="currentColor" />
        </div>
      </div>
    </div>
  );
}