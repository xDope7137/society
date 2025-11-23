'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, UserCheck, Wrench, Receipt, AlertCircle, CheckCircle, Calendar, Clock, Users, Building2, Shield, Home, X, RefreshCw } from 'lucide-react';
import { noticesAPI, visitorsAPI, complaintsAPI, billingAPI, eventsAPI, societyAPI, blocksAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import * as Dialog from '@radix-ui/react-dialog';

export default function AdminDashboardPage() {
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
  const [blockMismatches, setBlockMismatches] = useState<any[]>([]);
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    checkBlockMismatches();
  }, []);

  const checkBlockMismatches = async () => {
    try {
      const [blocksResponse, dashboardResponse] = await Promise.all([
        blocksAPI.getBlocks(),
        societyAPI.getDashboard(),
      ]);

      const blocks = blocksResponse.data.results || blocksResponse.data || [];
      const dashboardBlocks = dashboardResponse.data.blocks || [];

      // Create a map of block name to actual flat count from dashboard
      const flatCountMap = new Map<string, number>();
      dashboardBlocks.forEach((dbBlock: any) => {
        const totalFlats = dbBlock.floors.reduce((sum: number, floor: any) => sum + floor.flats.length, 0);
        flatCountMap.set(dbBlock.name, totalFlats);
      });

      // Check each block for mismatches
      const mismatches: any[] = [];
      blocks.forEach((block: any) => {
        const expectedFlats = block.floors * block.units_per_floor;
        const actualFlats = flatCountMap.get(block.name) || 0;
        
        if (expectedFlats !== actualFlats) {
          mismatches.push({
            block: block,
            expected: expectedFlats,
            actual: actualFlats,
          });
        }
      });

      if (mismatches.length > 0) {
        setBlockMismatches(mismatches);
        setShowMismatchDialog(true);
      } else {
        setBlockMismatches([]);
        setShowMismatchDialog(false);
      }
    } catch (error) {
      console.error('Error checking block mismatches:', error);
    }
  };

  const handleRefreshApartments = async () => {
    setRefreshing(true);
    try {
      // Get all blocks first
      const blocksResponse = await blocksAPI.getBlocks();
      const blocks = blocksResponse.data.results || blocksResponse.data || [];
      
      if (blocks.length === 0) {
        toast({
          title: 'Info',
          description: 'No blocks found to refresh.',
        });
        setRefreshing(false);
        return;
      }
      
      // Regenerate flats for each block
      let successCount = 0;
      let errorCount = 0;
      
      for (const block of blocks) {
        try {
          await blocksAPI.regenerateFlats(block.id);
          successCount++;
        } catch (error) {
          console.error(`Error regenerating flats for block ${block.name}:`, error);
          errorCount++;
        }
      }
      
      // Reload dashboard data (which includes apartment data)
      await loadDashboardData();
      // Re-check for mismatches
      await checkBlockMismatches();
      
      if (errorCount === 0) {
        toast({
          title: 'Success',
          description: `Successfully regenerated flats for all ${successCount} block(s).`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Regenerated flats for ${successCount} block(s). ${errorCount} block(s) failed.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error refreshing apartments:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh apartment data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

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
      
      let adminStats = {
        totalResidents: 0,
        totalFlats: 0,
        occupiedFlats: 0,
      };
      try {
        const directoryRes = await societyAPI.getDirectory();
        const residents = directoryRes.data || [];
        adminStats = {
          totalResidents: residents.filter((r: any) => r.current_resident).length,
          totalFlats: residents.length,
          occupiedFlats: residents.filter((r: any) => r.current_resident).length,
        };
      } catch (error) {
        console.error('Error loading admin stats:', error);
      }

      setStats({
        notices: noticesRes.data.count || (noticesRes.data.results || noticesRes.data).length,
        activeVisitors: visitorsRes.data.length,
        pendingComplaints: complaintsRes.data.open + complaintsRes.data.in_progress,
        unpaidBills: billsRes.data.unpaid + billsRes.data.overdue,
        ...adminStats,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Admin stat cards - Management focused
  const adminStatCards = [
    {
      title: 'Total Residents',
      label: 'Residents',
      value: stats.totalResidents,
      icon: Users,
      iconColor: 'text-blue-500',
      valueColor: 'text-foreground',
      circleBg: 'bg-blue-500/10',
      circleHover: 'group-hover:bg-blue-500/20',
      href: '/admin/directory',
    },
    {
      title: 'Total Flats',
      label: 'Flats',
      value: stats.totalFlats,
      icon: Building2,
      iconColor: 'text-purple-500',
      valueColor: 'text-foreground',
      circleBg: 'bg-purple-500/10',
      circleHover: 'group-hover:bg-purple-500/20',
      href: '/admin/apartments',
      subtitle: `${stats.occupiedFlats} occupied`,
    },
    {
      title: 'Pending Complaints',
      label: 'Complaints',
      value: stats.pendingComplaints,
      icon: Wrench,
      iconColor: 'text-orange-500',
      valueColor: 'text-foreground',
      circleBg: 'bg-orange-500/10',
      circleHover: 'group-hover:bg-orange-500/20',
      href: '/admin/complaints',
    },
    {
      title: 'Unpaid Bills',
      label: 'Bills',
      value: stats.unpaidBills,
      icon: Receipt,
      iconColor: 'text-destructive',
      valueColor: 'text-destructive',
      circleBg: 'bg-destructive/10',
      circleHover: 'group-hover:bg-destructive/20',
      href: '/admin/billing',
    },
  ];

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
      <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 text-white rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="h-7 w-7 md:h-8 md:w-8" />
              <h2 className="text-2xl md:text-3xl font-bold">
                Admin Dashboard
              </h2>
            </div>
            <p className="text-white/90 text-sm md:text-base mt-1">
              Manage your society efficiently with comprehensive oversight tools.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 self-start md:self-auto">
            <Shield className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-semibold text-sm md:text-base">Administrator</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {adminStatCards.map((stat) => {
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
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle || stat.title}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Notices and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Notices */}
        <Card className="border-2 border-blue-500/20 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground font-semibold">
                Latest Notices
              </CardTitle>
              <Link href="/admin/notices">
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
                    className="flex items-start space-x-4 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      notice.priority === 'URGENT' ? 'bg-destructive/10' :
                      notice.priority === 'HIGH' ? 'bg-orange-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      {notice.priority === 'URGENT' || notice.priority === 'HIGH' ? (
                        <AlertCircle className={`h-5 w-5 ${
                          notice.priority === 'URGENT' ? 'text-destructive' : 'text-orange-500'
                        }`} />
                      ) : (
                        <Bell className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{notice.title}</h4>
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
        <Card className="border-2 border-purple-500/20 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border-b border-border/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground font-semibold">
                Society Events
              </CardTitle>
              <Link href="/admin/events">
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
                  <Link key={event.id} href={`/admin/events/${event.id}`}>
                    <div className="flex items-start space-x-4 p-4 border border-border/50 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{event.title}</h4>
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
      <Card className="border-2 border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-border/30">
          <CardTitle className="text-foreground font-semibold">
            Management Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <Link href="/admin/blocks">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors" variant="default">
                <Building2 className="h-4 w-4 mr-2" />
                Manage Blocks
              </Button>
            </Link>
            <Link href="/admin/directory">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white transition-colors" variant="default">
                <Users className="h-4 w-4 mr-2" />
                View Directory
              </Button>
            </Link>
            <Link href="/admin/apartments" className="sm:col-span-2 md:col-span-1">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors" variant="default">
                <Home className="h-4 w-4 mr-2" />
                Apartments
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Block Mismatch Dialog */}
      {showMismatchDialog && blockMismatches.length > 0 && (
        <Dialog.Root open={showMismatchDialog} onOpenChange={setShowMismatchDialog}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  Block Configuration Mismatch Detected
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-muted-foreground">
                  The following blocks have a mismatch between their configuration and the actual number of flats in the database:
                </p>

                <div className="space-y-3">
                  {blockMismatches.map((mismatch) => (
                    <div key={mismatch.block.id} className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">Block {mismatch.block.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          {mismatch.block.floors} floors × {mismatch.block.units_per_floor} units
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Expected:</span>
                          <span className="ml-2 font-semibold text-foreground">{mismatch.expected} flats</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <span className="ml-2 font-semibold text-orange-500">{mismatch.actual} flats</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Difference: {Math.abs(mismatch.expected - mismatch.actual)} flats
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-500">
                    <strong>Solution:</strong> Go to the Apartments page and edit each block. The flats will be automatically regenerated to match the block configuration.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleRefreshApartments}
                  disabled={refreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Apartments'}
                </Button>
                <Link href="/admin/apartments" className="flex-1">
                  <Button className="w-full" onClick={() => setShowMismatchDialog(false)}>
                    Go to Apartments Page
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setShowMismatchDialog(false)}>
                  Dismiss
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}

