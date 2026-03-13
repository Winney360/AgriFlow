import { useState, useMemo } from 'react';
import { Menu } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Store, Tractor, History, UserRound, Plus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Footer from './Footer';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="mx-auto flex items-center justify-between max-w-7xl px-2 sm:px-4 py-2 sm:py-3">
            <Link to={logoTarget} className="text-2xl font-black tracking-tight">
              <span className="text-[#1f9f6a]">Agri</span>
              <span className="text-[#1f1f1f]">Flow</span>
            </Link>
            {isAuthenticated && user && (
              <button
                type="button"
                onClick={onSwitchRole}
                disabled={roleBusy}
                className="hidden xs:flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-1.5 text-xs font-bold text-text ml-2"
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
            )}
            {/* Hamburger menu for mobile */}
            <div className="flex items-center gap-2 ml-auto">
              {isAuthenticated && user && (
                <button
                  type="button"
                  onClick={onSwitchRole}
                  disabled={roleBusy}
                  className="xs:hidden flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-1.5 text-xs font-bold text-text"
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
              )}
              <button
                type="button"
                className="flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f9f6a] md:hidden"
                aria-label="Open menu"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                <Menu size={24} />
              </button>
            </div>
            {/* Desktop nav */}
            {isAuthenticated && (
              <nav className="hidden md:block ml-4">
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
            )}
          </div>
          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute right-2 top-14 w-48 rounded-lg border border-outline bg-(--surface) shadow-lg z-50 animate-fade-in">
              <ul className="flex flex-col py-2">
                {isAuthenticated && navItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2 px-4 py-2 text-sm font-semibold',
                          isActive ? 'bg-button text-white' : 'text-text-muted hover:bg-surface',
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
                <li className="border-t border-outline my-1" />
                <li>
                  <ThemeToggle />
                  <span className="ml-2 text-sm">Theme</span>
                </li>
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </header>
      )}

      <main className={isHomePage ? 'w-full' : 'mx-auto w-full max-w-7xl px-2 sm:px-4 pb-24 pt-6'}>
        <Outlet />
      </main>

      {/* No bottom nav on mobile, all nav is in the top-right menu */}
      <Footer />
    </div>
  );
};
