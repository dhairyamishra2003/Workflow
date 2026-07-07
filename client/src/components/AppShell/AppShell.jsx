import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import NotificationDrawer from '../NotificationDrawer/NotificationDrawer';
import {
  Zap,
  LayoutDashboard,
  Wand2,
  Play,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workflows/builder', label: 'Builder', icon: Wand2 },
  { href: '/executions', label: 'Executions', icon: Play },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/workflows/builder': 'Workflow Builder',
  '/executions': 'Executions',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
};

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { fetchNotifications, subscribeNotifications, unsubscribeNotifications, unreadCount } = useNotificationStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Subscribe to user notifications on login
  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeNotifications(user._id);
      return () => {
        unsubscribeNotifications(user._id);
      };
    }
  }, [user]);

  // Pages that should NOT have the shell
  const noShellPages = ['/', '/login', '/register'];
  const isNoShell = noShellPages.includes(router.pathname);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  if (isNoShell) {
    return <>{children}</>;
  }

  const pageTitle =
    PAGE_TITLES[router.pathname] ||
    router.pathname
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'AgentFlow';

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-dark-800/80 backdrop-blur-xl border-r border-white/5
          flex flex-col transition-all duration-300 ease-in-out
        `}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-6 py-5 border-b border-white/5 ${collapsed ? 'justify-center px-4' : ''}`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white tracking-tight">
              AgentFlow
            </span>
          )}
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = router.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${collapsed ? 'justify-center' : ''}
                  ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                )}
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`}
                />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-dark-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {user && (
          <div
            className={`border-t border-white/5 p-4 ${collapsed ? 'px-3' : ''}`}
          >
            <div
              className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-500/20 text-primary-400 uppercase tracking-wider">
                    {user.role || 'user'}
                  </span>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-gray-500 hover:text-danger-400 hover:bg-danger-400/10 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center py-3 border-t border-white/5 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-white/5 bg-dark-800/50 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[9px] font-bold text-white ring-2 ring-dark-800">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User avatar (top bar) */}
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm text-gray-300 font-medium">
                  {user.name}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
