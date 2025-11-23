'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { societyAPI, billingAPI } from '@/lib/api';
import { Building2, Search, Building, Home, CheckCircle2, AlertCircle } from 'lucide-react';

interface Flat {
  id: number;
  flat_number: string;
  floor: number;
  bhk: string;
  occupancy_status: string;
  maintenance_status: 'paid' | 'overdue';
  block_name: string;
  current_bill_id?: number;
  current_bill_status?: string;
  current_resident: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  } | null;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
}

interface Floor {
  floor: number;
  flats: Flat[];
}

interface Block {
  name: string;
  floors: Floor[];
}

export default function ApartmentsPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Get user role
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    // Redirect non-admin users away from apartments page
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadDashboard();
    
    // Listen for blocks updated event to refresh apartments
    const handleBlocksUpdated = () => {
      loadDashboard();
    };
    
    window.addEventListener('blocksUpdated', handleBlocksUpdated);
    
    return () => {
      window.removeEventListener('blocksUpdated', handleBlocksUpdated);
    };
  }, [isAdmin, router]);

  const loadDashboard = async () => {
    try {
      const response = await societyAPI.getDashboard();
      setBlocks(response.data.blocks || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load apartments dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFlats = (flats: Flat[]) => {
    if (!searchTerm) return flats;
    const searchLower = searchTerm.toLowerCase();
    return flats.filter(flat =>
      flat.flat_number.toLowerCase().includes(searchLower) ||
      flat.block_name.toLowerCase().includes(searchLower) ||
      (flat.current_resident &&
        (flat.current_resident.first_name.toLowerCase().includes(searchLower) ||
          flat.current_resident.last_name.toLowerCase().includes(searchLower)))
    );
  };

  const handleMarkUtilityPaid = async (flat: Flat) => {
    if (!flat.current_bill_id) {
      toast({
        title: 'Error',
        description: 'No utility bill found for this flat',
        variant: 'destructive',
      });
      return;
    }

    setMarkingPaid(flat.id);
    try {
      await billingAPI.markPaid(flat.current_bill_id);
      toast({
        title: 'Success',
        description: `Utility marked as paid for ${flat.flat_number}`,
      });
      // Reload dashboard
      loadDashboard();
    } catch (error: any) {
      console.error('Error marking utility as paid:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to mark utility as paid',
        variant: 'destructive',
      });
    } finally {
      setMarkingPaid(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate summary stats based on actual bill status
  const totalFlats = blocks.reduce((sum, block) => sum + block.floors.reduce((s, f) => s + f.flats.length, 0), 0);
  const paidFlats = blocks.reduce(
    (sum, block) =>
      sum +
      block.floors.reduce(
        (s, f) => s + f.flats.filter((flat) => flat.current_bill_status === 'PAID').length,
        0
      ),
    0
  );
  const overdueFlats = blocks.reduce(
    (sum, block) =>
      sum +
      block.floors.reduce(
        (s, f) => s + f.flats.filter((flat) => flat.current_bill_status && flat.current_bill_status !== 'PAID').length,
        0
      ),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Apartments Dashboard</h2>
        <p className="text-muted-foreground">View all apartments organized by floors with maintenance status</p>
      </div>

      {/* Summary - Dark Theme */}
      {blocks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Blocks Card */}
          <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm p-6 border border-border/30 shadow-xl hover:border-border/60 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Building className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blocks</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{blocks.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Buildings</p>
            </div>
          </div>

          {/* Total Flats Card */}
          <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm p-6 border border-border/30 shadow-xl hover:border-border/60 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Home className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Flats</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{totalFlats}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Units</p>
            </div>
          </div>

          {/* Paid Card */}
          <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm p-6 border border-border/30 shadow-xl hover:border-border/60 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paid</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{paidFlats}</p>
              <p className="text-xs text-muted-foreground mt-1">{totalFlats > 0 ? Math.round((paidFlats / totalFlats) * 100) : 0}% Complete</p>
            </div>
          </div>

          {/* Overdue Card */}
          <div className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm p-6 border border-border/30 shadow-xl hover:border-border/60 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-rose-400" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overdue</span>
              </div>
              <p className="text-3xl font-bold text-rose-400">{overdueFlats}</p>
              <p className="text-xs text-muted-foreground mt-1">Requires Attention</p>
            </div>
          </div>
        </div>
      )}

      {/* Search - Dark Theme */}
      <div className="relative">
        <div className="relative bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl shadow-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by flat number, block, or resident name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Blocks and Floors - Building Layout - Horizontal */}
      {blocks.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No apartments found. Create blocks to get started.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-12 justify-center items-start px-4">
          {blocks.map((block) => {
            // Check if this block has any floors with flats after filtering
            const hasFilteredFlats = block.floors.some(floor => filterFlats(floor.flats).length > 0);
            
            // Sort floors from highest to lowest (like a building)
            const sortedFloors = [...block.floors].sort((a, b) => b.floor - a.floor);
            
            if (!hasFilteredFlats && block.floors.length === 0) {
              return (
                <div key={block.name} className="flex flex-col items-center">
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="h-5 w-5 text-blue-400" />
                    <h3 className="text-xl font-semibold text-foreground">{block.name}</h3>
                  </div>
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No flats in this block yet.</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={block.name} className="flex flex-col items-center">
                {/* Block Header */}
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/80 to-indigo-600/80 shadow-lg border border-blue-400/30">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Block {block.name}
                    </h3>
                  </div>
                </div>

                {/* Building Structure */}
                <div className="relative flex items-start">
                  {/* Floor labels column - matches building structure exactly */}
                  <div className="flex flex-col-reverse mr-3">
                    {/* Spacer for terrace/roof at top - matches building roof height (h-3) */}
                    {sortedFloors.length > 0 && (
                      <div className="h-3"></div>
                    )}
                    {sortedFloors.map((floor, floorIndex) => {
                      const filteredFlats = filterFlats(floor.flats);
                      if (filteredFlats.length === 0) return null;
                      const isTopFloor = floorIndex === sortedFloors.length - 1;
                      return (
                        <div key={`label-${floor.floor}`} className="flex flex-col">
                          {/* Floor label - matches floor height exactly (4.5rem = 72px) */}
                          <div className="h-[72px] flex items-center justify-end pr-2">
                            <div className="text-xs font-bold text-muted-foreground bg-card/80 px-2.5 py-1.5 rounded-md border border-border whitespace-nowrap shadow-lg">
                              F{floor.floor}
                            </div>
                          </div>
                          {/* Terrace spacer for non-top floors - matches building terrace height (h-2 = 8px) */}
                          {!isTopFloor && (
                            <div className="h-2"></div>
                          )}
                        </div>
                      );
                    })}
                    {/* Ground spacer - matches building ground height (h-4 = 16px) */}
                    <div className="h-4"></div>
                  </div>

                  {/* Building Container with Walls - Dark Theme */}
                  <div className="border-2 border-border rounded-t-lg bg-gradient-to-b from-card to-background shadow-2xl overflow-hidden min-w-[220px]">
                    {/* Terrace/Roof at the top */}
                    {sortedFloors.length > 0 && (
                      <div className="bg-gradient-to-b from-secondary to-card h-3 border-b-2 border-border relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
                      </div>
                    )}

                    {/* Floors - Building Facade */}
                    <div className="flex flex-col-reverse">
                      {sortedFloors.map((floor, floorIndex) => {
                        const filteredFlats = filterFlats(floor.flats);
                        if (filteredFlats.length === 0) return null;

                        const isTopFloor = floorIndex === sortedFloors.length - 1;

                        return (
                          <div
                            key={`${block.name}-${floor.floor}`}
                            className="relative"
                          >
                            {/* Floor with walls - exact height to match labels - Dark Theme */}
                            <div className="border-b-2 border-border bg-gradient-to-b from-card to-background px-3 py-3 h-[72px] flex items-center">
                              {/* Flats as windows/doors */}
                              <div className="flex flex-wrap justify-center gap-2 w-full">
                                {filteredFlats.map((flat) => (
                                  <div
                                    key={flat.id}
                                    className="group relative"
                                    title={`${flat.flat_number} - ${flat.maintenance_status === 'paid' ? 'Paid' : 'Overdue'}`}
                                  >
                                    {/* Window/Door representation - Dark Theme */}
                                    <div
                                      className={`
                                        relative
                                        w-10 h-12
                                        rounded-sm
                                        border-2
                                        shadow-inner
                                        transition-all duration-200
                                        hover:scale-110 hover:z-10 hover:shadow-xl
                                        cursor-pointer
                                        ${
                                          flat.current_bill_status === 'PAID'
                                            ? 'bg-emerald-900/40 border-emerald-600/60 shadow-emerald-500/20'
                                            : 'bg-rose-900/40 border-rose-600/60 shadow-rose-500/20'
                                        }
                                      `}
                                    >
                                      {/* Window frame effect */}
                                      <div className="absolute inset-0.5 border border-muted/30 rounded-sm"></div>
                                      
                                      {/* Flat number */}
                                      <div className="absolute top-0.5 left-0 right-0 text-center">
                                        <span className="text-[8px] font-bold text-card-foreground leading-none">
                                          {flat.flat_number.split('-')[1] || flat.flat_number}
                                        </span>
                                      </div>
                                      
                                      {/* Status indicator (door handle or window light) - Clickable for admins */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isAdmin && flat.current_bill_id && flat.current_bill_status !== 'PAID') {
                                            handleMarkUtilityPaid(flat);
                                          }
                                        }}
                                        disabled={!isAdmin || !flat.current_bill_id || flat.current_bill_status === 'PAID' || markingPaid === flat.id}
                                        className={`
                                          absolute bottom-1.5 left-1/2 transform -translate-x-1/2
                                          w-3 h-3 rounded-full
                                          transition-all duration-200
                                          border-2
                                          ${
                                            flat.current_bill_status === 'PAID'
                                              ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50'
                                              : 'bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/50'
                                          }
                                          ${isAdmin && flat.current_bill_id && flat.current_bill_status !== 'PAID' 
                                            ? 'hover:scale-150 hover:ring-2 hover:ring-muted cursor-pointer' 
                                            : 'cursor-default'
                                          }
                                          ${markingPaid === flat.id ? 'animate-pulse' : ''}
                                        `}
                                        title={
                                          isAdmin && flat.current_bill_id && flat.current_bill_status !== 'PAID'
                                            ? 'Click to mark utility as paid'
                                            : flat.current_bill_status === 'PAID'
                                            ? 'Utility Paid'
                                            : 'Utility Unpaid'
                                        }
                                      />
                                      
                                      {/* Hover effect - glow */}
                                      <div className={`absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                                        flat.current_bill_status === 'PAID' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                      }`}></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Terrace/Roof above each floor (except top floor) - Dark Theme */}
                            {!isTopFloor && (
                              <div className="bg-gradient-to-b from-secondary to-card h-2 border-b border-border relative box-border">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                {/* Terrace railing effect */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Ground/Base - Dark Theme */}
                    <div className="bg-gradient-to-b from-secondary to-card h-4 border-t-2 border-border relative box-border">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                      {/* Ground texture */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30"></div>
                    </div>
                  </div>
                  
                  {/* Ground spacer for labels column */}
                  <div className="h-4 box-border"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

