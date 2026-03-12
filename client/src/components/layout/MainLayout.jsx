import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Store, Tractor, History, UserRound } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/marketplace', label: 'Market', icon: Store },
  { to: '/dashboard', label: 'Sell', icon: Tractor },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, switchRole } = useAuth();
  const isHomePage = location.pathname === '/';
  const [roleBusy, setRoleBusy] = useState(false);

  const nextRole = user?.role === 'buyer' ? 'seller' : 'buyer';
  const roleSwitchChecked = user?.role === 'seller';

  const onSwitchRole = async () => {
    if (!user || roleBusy) {
      return;
    }
    setRoleBusy(true);
    try {
      await switchRole(nextRole);
    } finally {
      setRoleBusy(false);
    }
  };

  const onLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="relative min-h-screen bg-bg text-text">
      {!isHomePage && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <div className="grain" />
        </div>
      )}

      {!isHomePage && (
        <header className="sticky top-0 z-20 border-b border-outline bg-[var(--surface)/0.9] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link to="/" className="text-xl font-black tracking-tight text-primary">
              AgriFlow
            </Link>
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <button
                  type="button"
                  onClick={onSwitchRole}
                  disabled={roleBusy}
                  className="flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-1.5 text-xs font-bold text-text"
                  aria-label={`Switch role to ${nextRole}`}
                >
                  <span className="capitalize">{user.role}</span>
                  <span
                    className={cn(
                      'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                      roleSwitchChecked ? 'bg-[#1ea26c]' : 'bg-[#9abcae]',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition',
                        roleSwitchChecked ? 'translate-x-4' : 'translate-x-1',
                      )}
                    />
                  </span>
                </button>
              ) : null}
              <ThemeToggle />
              {isAuthenticated ? (
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              ) : (
                <Link to="/login">
                  <Button size="sm">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={isHomePage ? 'w-full' : 'mx-auto w-full max-w-6xl px-4 pb-24 pt-6'}>
        <Outlet />
      </main>

      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 border-t border-(--outline) bg-[var(--surface)/0.95] p-2 backdrop-blur md:hidden',
          isHomePage && 'hidden',
        )}
      >
        <ul className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex min-w-15 flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold',
                    active ? 'bg-(--button) text-white' : 'text-(--text-muted)',
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
