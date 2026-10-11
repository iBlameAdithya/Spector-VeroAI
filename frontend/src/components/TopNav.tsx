import { Shield, Wifi, WifiOff } from 'lucide-react';

export type NavTab = 'investigation' | 'fund-flow' | 'intelligence' | 'evidence' | 'reports';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isBackendConnected: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  isBackendConnected,
}) => {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'investigation', label: 'Investigation' },
    { id: 'fund-flow', label: 'Money Flow' },
    { id: 'intelligence', label: 'Why Flagged' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'reports', label: 'Report' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <div className="w-7 h-7 bg-blue-600 rounded text-white flex items-center justify-center font-bold tracking-wider text-xs shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-wider font-mono">SPECTER</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Mode</span>
          </div>
        </div>

        {/* Center Tabs */}
        <nav className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 h-9 text-xs font-medium rounded-t border-b-2 transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">BACKEND:</span>
            {isBackendConnected ? (
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                <Wifi className="w-3 h-3 text-emerald-600" />
                <span>CONNECTED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold">
                <WifiOff className="w-3 h-3 text-red-600" />
                <span>DISCONNECTED</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
