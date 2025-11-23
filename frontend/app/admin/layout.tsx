'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, Bell, Users, UserCheck, Wrench, Receipt, 
  LogOut, Menu, X, Building2, Settings, Calendar, AlertCircle, Layers, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyAlertBanner } from '@/components/emergency-alert-banner';
import { useSettings } from '@/contexts/SettingsContext';

const adminMenuItems = [
  { icon: Shield, label: 'Admin Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Blocks', href: '/admin/blocks' },
  { icon: Users, label: 'Directory', href: '/admin/directory' },
  { icon: Layers, label: 'Apartments', href: '/admin/apartments' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: Bell, label: 'Notices', href: '/admin/notices' },
  { icon: Calendar, label: 'Events', href: '/admin/events' },
  { icon: AlertCircle, label: 'Alerts', href: '/admin/alerts' },
  { icon: UserCheck, label: 'Visitors', href: '/admin/visitors' },
  { icon: Wrench, label: 'Complaints', href: '/admin/complaints' },
  { icon: Receipt, label: 'Billing', href: '/admin/billing' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings, updateSetting } = useSettings();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  const sidebarOpen = settings.sidebarOpen;
  const setSidebarOpen = (open: boolean) => {
    updateSetting('sidebarOpen', open);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (!storedUser || !token) {
      router.push('/login');
    } else {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'ADMIN') {
        router.push('/dashboard');
      } else {
        setUser(userData);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-primary">Admin</span>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 border border-primary/50 rounded-full flex items-center justify-center text-primary font-semibold">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-primary capitalize">Administrator</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full text-xs hover:bg-accent">
                  <Home className="h-3 w-3 mr-1" />
                  Resident
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 hover:bg-accent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">
              {adminMenuItems.find(item => item.href === pathname)?.label || 'Admin Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              {/* Add notifications icon or other actions here */}
            </div>
          </div>
        </header>

        {/* Emergency Alert Banner */}
        <EmergencyAlertBanner />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

