'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, UserCheck, Wrench, Receipt, AlertCircle, CheckCircle, Calendar, Clock, Users, Building2, Shield, Home } from 'lucide-react';
import { noticesAPI, visitorsAPI, complaintsAPI, billingAPI, eventsAPI, societyAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    notices: 0,
    activeVisitors: 0,
    pendingComplaints: 0,
    unpaidBills: 0,
    totalResidents: 0,
    totalFlats: 0,
    occupiedFlats: 0,
  });
  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [noticesRes, visitorsRes, complaintsRes, billsRes, eventsRes] = await Promise.all([
        noticesAPI.getNotices({ page_size: 5 }),
        visitorsAPI.getActive(),
        complaintsAPI.getStats(),
        billingAPI.getStats(),
        eventsAPI.getUpcomingEvents(30),
      ]);

      setRecentNotices(noticesRes.data.results || noticesRes.data);
      setUpcomingEvents((eventsRes.data || []).slice(0, 5));
      
      setStats({
        notices: noticesRes.data.count || (noticesRes.data.results || noticesRes.data).length,
        activeVisitors: visitorsRes.data.length,
        pendingComplaints: complaintsRes.data.open + complaintsRes.data.in_progress,
        unpaidBills: billsRes.data.unpaid + billsRes.data.overdue,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resident stat cards - Personal focused (using apartments dashboard colors)
  const residentStatCards = [
    {
      title: 'Recent Notices',
      label: 'Notices',
      value: stats.notices,
      icon: Bell,
      iconColor: 'text-blue-400',
      valueColor: 'text-foreground',
      circleBg: 'bg-blue-500/10',
      circleHover: 'group-hover:bg-blue-500/20',
      href: '/dashboard/notices',
    },
    {
      title: 'Active Visitors',
      label: 'Visitors',
      value: stats.activeVisitors,
      icon: UserCheck,
      iconColor: 'text-emerald-400',
      valueColor: 'text-foreground',
      circleBg: 'bg-emerald-500/10',
      circleHover: 'group-hover:bg-emerald-500/20',
      href: '/dashboard/visitors',
    },
    {
      title: 'My Complaints',
      label: 'Complaints',
      value: stats.pendingComplaints,
      icon: Wrench,
      iconColor: 'text-orange-400',
      valueColor: 'text-foreground',
      circleBg: 'bg-orange-500/10',
      circleHover: 'group-hover:bg-orange-500/20',
      href: '/dashboard/complaints',
    },
    {
      title: 'My Bills',
      label: 'Bills',
      value: stats.unpaidBills,
      icon: Receipt,
      iconColor: 'text-rose-400',
      valueColor: 'text-rose-400',
      circleBg: 'bg-rose-500/10',
      circleHover: 'group-hover:bg-rose-500/20',
      href: '/dashboard/billing',
    },
  ];

  const statCards = residentStatCards;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-500/90 to-emerald-500/90 text-white rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Home className="h-7 w-7 md:h-8 md:w-8" />
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome Back!
              </h2>
            </div>
            <p className="text-white/90 text-sm md:text-base mt-1">
              Here's what's happening in your society today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm p-6 border border-border/30 shadow-xl hover:border-border/60 transition-all duration-300 group cursor-pointer">
                <div className={`absolute top-0 right-0 w-20 h-20 ${stat.circleBg} rounded-full -mr-10 -mt-10 ${stat.circleHover} transition-all duration-500`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                  </div>
                  <p className={`text-3xl font-bold ${stat.valueColor}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Notices and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Notices */}
        <Card className="border-2 border-blue-500/20 dark:border-blue-500/30 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground font-semibold">
                Recent Notices
              </CardTitle>
              <Link href="/dashboard/notices">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No notices available</p>
            ) : (
              <div className="space-y-4">
                {recentNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      notice.priority === 'URGENT' ? 'bg-red-50 dark:bg-red-950/50' :
                      notice.priority === 'HIGH' ? 'bg-orange-50 dark:bg-orange-950/50' :
                      'bg-blue-50 dark:bg-blue-950/50'
                    }`}>
                      {notice.priority === 'URGENT' || notice.priority === 'HIGH' ? (
                        <AlertCircle className={`h-5 w-5 ${
                          notice.priority === 'URGENT' ? 'text-red-600' : 'text-orange-600'
                        }`} />
                      ) : (
                        <Bell className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{notice.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notice.content}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{notice.category.toLowerCase()}</span>
                        <span>•</span>
                        <span>{formatDate(notice.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border-2 border-purple-500/20 dark:border-purple-500/30 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 dark:from-purple-500/20 dark:to-emerald-500/20 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground font-semibold">
                Upcoming Events
              </CardTitle>
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming events</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                    <div className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>📍 {event.location}</span>
                          </div>
                        )}
                        {event.attendees_count > 0 && (
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>👥 {event.attendees_count} attending</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-primary/20 dark:border-primary/30 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-b">
          <CardTitle className="text-foreground font-semibold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link href="/dashboard/visitors">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors" variant="default">
                <UserCheck className="h-4 w-4 mr-2" />
                Register Visitor
              </Button>
            </Link>
            <Link href="/dashboard/complaints">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transition-colors" variant="default">
                <Wrench className="h-4 w-4 mr-2" />
                File Complaint
              </Button>
            </Link>
            <Link href="/dashboard/billing" className="sm:col-span-2 md:col-span-1">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors" variant="default">
                <Receipt className="h-4 w-4 mr-2" />
                View Bills
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

