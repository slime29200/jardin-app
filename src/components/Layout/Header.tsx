import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Search, Flower2, LayoutGrid } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/calendar', label: 'Calendrier', icon: Calendar },
  { path: '/plants', label: 'Banque de plantes', icon: Search },
  { path: '/my-garden', label: 'Mon Jardin', icon: Flower2 },
  { path: '/beds', label: 'Mes Bacs', icon: LayoutGrid },
];

export default function Header() {
  const location = useLocation();

  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:block bg-white/70 backdrop-blur-md border-b border-rose-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-3xl">🌸</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-peach-400 bg-clip-text text-transparent">
              Mon Jardin
            </h1>
          </Link>
          <nav className="flex gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium no-underline transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-rose-400 to-peach-300 text-white shadow-md'
                      : 'text-earth hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-rose-200 z-50 px-2 py-1">
        <div className="flex justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs no-underline transition-all ${
                  isActive
                    ? 'text-rose-500 font-semibold'
                    : 'text-earth-muted'
                }`}
              >
                <Icon size={20} />
                <span className="truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
