import { NavLink } from 'react-router-dom';
import { UsageBadge } from '../common/UsageBadge';
import { useAppStore } from '../../stores/appStore';

const navItems = [
  { to: '/', label: 'New', icon: '+' },
  { to: '/history', label: 'History', icon: '~' },
  { to: '/brand-voice', label: 'Brand Voice', icon: '*' },
];

export function Sidebar() {
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);

  return (
    <aside className="flex h-screen w-60 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-5">
        <h1 className="text-lg font-bold tracking-tight">Content Engine</h1>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="mb-3">
          <UsageBadge />
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
