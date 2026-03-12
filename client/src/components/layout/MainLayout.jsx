import { useState, useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store, Tractor, History, UserRound, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const buyerNavItems = [
  { to: '/marketplace', label: 'Market', icon: Store },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const sellerNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Tractor },
  { to: '/create-listing', label: 'Create', icon: Plus },
  { to: '/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, switchRole } = useAuth();
  const isHomePage = location.pathname === '/';
  const [roleBusy, setRoleBusy] = useState(false);

  const navItems = useMemo(() => {
    if (!isAuthenticated || !user) return buyerNavItems;
    return user.role === 'seller' ? sellerNavItems : buyerNavItems;
  }, [user, isAuthenticated]);
  const logoTarget = !isAuthenticated || !user ? '/' : user.role === 'seller' ? '/dashboard' : '/marketplace';

  const nextRole = user?.role === 'buyer' ? 'seller' : 'buyer';
  const roleSwitchChecked = user?.role === 'seller';

  const onSwitchRole = async () => {
    if (!user || roleBusy) {
      return;
    }
    setRoleBusy(true);
    try {
      await switchRole(nextRole);
      navigate(nextRole === 'seller' ? '/dashboard' : '/marketplace');
    } finally {
      setRoleBusy(false);
    }
  };

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className={cn('relative min-h-screen', !isHomePage && 'bg-bg text-text')}>
      {!isHomePage && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="blob blob-one" />
          <div className="blob blob-two" />
          <div className="grain" />
        </div>
      )}

      {(!isHomePage || isAuthenticated) && (
        <header className="sticky top-0 z-20 border-b border-outline bg-[var(--surface)/0.9] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link to={logoTarget} className="text-2xl font-black tracking-tight">
              <span className="text-[#1f9f6a]">Agri</span>
              <span className="text-[#1f1f1f]">Flow</span>
            </Link>
            {isAuthenticated ? (
              <nav className="hidden md:block">
                <ul className="flex items-center gap-2">
                  {navItems.map((item) => {
                    const active =
                      location.pathname === item.to ||
                      location.pathname.startsWith(`${item.to}/`);

                    return (
                      <li key={`desktop-${item.to}`}>
                        <NavLink
                          to={item.to}
                          className={cn(
                            'rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200',
                            active
                              ? 'bg-button text-white shadow-sm'
                              : 'nav-item text-text-muted hover:bg-surface hover:shadow-sm',
                          )}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : (
              <div className="hidden flex-1 md:block" />
            )}

            <div className="ml-auto flex items-center gap-2">
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
          'fixed bottom-0 left-0 right-0 z-30 border-t border-outline bg-[var(--surface)/0.95] p-2 backdrop-blur md:hidden',
          isHomePage && !isAuthenticated && 'hidden',
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
                    'flex min-w-15 flex-col items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold transition-all duration-200',
                    active ? 'bg-button text-white shadow-sm' : 'nav-item text-text-muted hover:bg-surface',
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
