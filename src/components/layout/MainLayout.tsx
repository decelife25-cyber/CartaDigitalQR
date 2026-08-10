import { Outlet, useLocation } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';

export default function MainLayout() {
  const location = useLocation();
  const isPortada = location.pathname === '/';

  return (
    <div
      className={
        isPortada
          ? 'min-h-[100dvh] w-full relative overflow-hidden bg-black'
          : 'min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative shadow-xl overflow-hidden'
      }
    >
      {!isPortada && <TopNavigation />}

      <main className={isPortada ? 'h-[100dvh] w-full overflow-hidden' : 'flex-1 overflow-y-auto pb-20'}>
        <Outlet />
      </main>

      {!isPortada && <BottomNavigation />}
    </div>
  );
}
