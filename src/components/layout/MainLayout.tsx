import { Outlet, useLocation } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';

export default function MainLayout() {
  const location = useLocation();
  const isPortada = location.pathname === '/';

  return (
    <div
      className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden shadow-xl"
      style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}
    >
      {!isPortada && <TopNavigation />}

      <main className={isPortada ? 'h-[100dvh] w-full overflow-hidden' : 'flex-1 overflow-y-auto pb-20'}>
        <Outlet />
      </main>

      {!isPortada && <BottomNavigation />}
    </div>
  );
}
