import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SettingsModal } from './SettingsModal';

export function AppShell() {
  return (
    <div className="flex h-screen bg-surface-alt">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <SettingsModal />
    </div>
  );
}
