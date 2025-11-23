'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { societyAPI, billingAPI, blocksAPI, authAPI } from '@/lib/api';
import { FlatEditDialog } from '@/components/flat-edit-dialog';
import { 
  Building2, Search, Building, Home, CheckCircle2, AlertCircle, 
  Plus, Edit, Trash2, Filter, X, ChevronDown, ChevronUp, Settings
} from 'lucide-react';

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

interface BlockData {
  id: number;
  name: string;
  society: number;
  society_name: string;
  floors: number;
  units_per_floor: number;
  created_at: string;
}

export default function ApartmentsPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [showBlockManagement, setShowBlockManagement] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockData | null>(null);
  const [blockFormData, setBlockFormData] = useState({
    society: '',
    name: '',
    floors: '',
    units_per_floor: '',
    bhk: '2BHK',
  });
  
  // Filters
  const [filterBlock, setFilterBlock] = useState<string>('');
  const [filterFloor, setFilterFloor] = useState<string>('');
  const [filterOccupancy, setFilterOccupancy] = useState<string>('');
  const [filterMaintenance, setFilterMaintenance] = useState<string>('');
  
  const { toast } = useToast();
  
  // Get user role
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    loadDashboard();
    loadBlockData();
    loadSocieties();
    
    // Listen for blocks updated event to refresh apartments
    const handleBlocksUpdated = () => {
      loadDashboard();
      loadBlockData();
    };
    
    window.addEventListener('blocksUpdated', handleBlocksUpdated);
    
    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingFlat(null);
        setShowBlockForm(false);
      }
      if (e.key === 'c' && e.ctrlKey) {
        e.preventDefault();
        setShowBlockForm(true);
        setEditingBlock(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('blocksUpdated', handleBlocksUpdated);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

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

  const loadBlockData = async () => {
    try {
      const response = await blocksAPI.getBlocks();
      setBlockData(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  };

  const loadSocieties = async () => {
    try {
      const response = await societyAPI.getSocieties();
      setSocieties(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading societies:', error);
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blockFormData.society || !blockFormData.name || !blockFormData.floors || !blockFormData.units_per_floor) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingBlock) {
        await blocksAPI.updateBlock(editingBlock.id, {
          society: parseInt(blockFormData.society),
          name: blockFormData.name,
          floors: parseInt(blockFormData.floors),
          units_per_floor: parseInt(blockFormData.units_per_floor),
        });
        
        // Always regenerate flats when block is updated to ensure consistency
        try {
          await blocksAPI.regenerateFlats(editingBlock.id);
          toast({
            title: 'Success',
            description: `Block ${blockFormData.name} updated and flats regenerated successfully`,
          });
        } catch (regenerateError: any) {
          // If regeneration fails, still show success for the update
          console.warn('Failed to regenerate flats:', regenerateError);
          toast({
            title: 'Success',
            description: `Block ${blockFormData.name} updated successfully. Note: Flat regeneration may have failed.`,
          });
        }
      } else {
        await blocksAPI.createBlockWithFlats({
          society: parseInt(blockFormData.society),
          name: blockFormData.name,
          floors: parseInt(blockFormData.floors),
          units_per_floor: parseInt(blockFormData.units_per_floor),
          bhk: blockFormData.bhk,
        });
        
        toast({
          title: 'Success',
          description: `Block ${blockFormData.name} created with ${parseInt(blockFormData.floors) * parseInt(blockFormData.units_per_floor)} flats`,
        });
      }
      
      setBlockFormData({
        society: '',
        name: '',
        floors: '',
        units_per_floor: '',
        bhk: '2BHK',
      });
      setShowBlockForm(false);
      setEditingBlock(null);
      
      // Reload data after a short delay to ensure backend has finished processing
      // This ensures the apartments dashboard reflects the regenerated flats
      setTimeout(() => {
        loadDashboard();
        loadBlockData();
        window.dispatchEvent(new CustomEvent('blocksUpdated'));
      }, 1000);
    } catch (error: any) {
      console.error('Error saving block:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${editingBlock ? 'update' : 'create'} block`,
        variant: 'destructive',
      });
    }
  };

  const handleBlockEdit = (block: BlockData) => {
    setEditingBlock(block);
    setBlockFormData({
      society: block.society.toString(),
      name: block.name,
      floors: block.floors.toString(),
      units_per_floor: block.units_per_floor.toString(),
      bhk: '2BHK',
    });
    setShowBlockForm(true);
  };

  const handleBlockDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all associated flats.`)) {
      return;
    }

    try {
      await blocksAPI.deleteBlock(id);
      toast({
        title: 'Success',
        description: `Block ${name} deleted`,
      });
      loadDashboard();
      loadBlockData();
    } catch (error: any) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete block',
        variant: 'destructive',
      });
    }
  };

  const filterFlats = useCallback((flats: Flat[]) => {
    let filtered = flats;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(flat =>
        flat.flat_number.toLowerCase().includes(searchLower) ||
        flat.block_name.toLowerCase().includes(searchLower) ||
        (flat.current_resident &&
          (flat.current_resident.first_name.toLowerCase().includes(searchLower) ||
            flat.current_resident.last_name.toLowerCase().includes(searchLower)))
      );
    }

    // Block filter
    if (filterBlock) {
      filtered = filtered.filter(flat => flat.block_name === filterBlock);
    }

    // Floor filter
    if (filterFloor) {
      filtered = filtered.filter(flat => flat.floor.toString() === filterFloor);
    }

    // Occupancy filter
    if (filterOccupancy) {
      filtered = filtered.filter(flat => flat.occupancy_status === filterOccupancy);
    }

    // Maintenance filter
    if (filterMaintenance) {
      if (filterMaintenance === 'PAID') {
        filtered = filtered.filter(flat => flat.current_bill_status === 'PAID');
      } else if (filterMaintenance === 'OVERDUE') {
        filtered = filtered.filter(flat => flat.current_bill_status && flat.current_bill_status !== 'PAID');
      }
    }

    return filtered;
  }, [searchTerm, filterBlock, filterFloor, filterOccupancy, filterMaintenance]);

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

  const handleFlatClick = (flat: Flat) => {
    if (isAdmin) {
      setEditingFlat(flat);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBlock('');
    setFilterFloor('');
    setFilterOccupancy('');
    setFilterMaintenance('');
  };

  const activeFilterCount = [searchTerm, filterBlock, filterFloor, filterOccupancy, filterMaintenance].filter(Boolean).length;

  // Get unique values for filters
  const uniqueBlocks = Array.from(new Set(blocks.map(b => b.name))).sort();
  const uniqueFloors = Array.from(new Set(blocks.flatMap(b => b.floors.map(f => f.floor)))).sort((a, b) => b - a);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate summary stats
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Apartments Dashboard</h2>
          <p className="text-muted-foreground">Manage blocks and apartments with interactive building view</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBlockManagement(!showBlockManagement)}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {showBlockManagement ? 'Hide' : 'Manage'} Blocks
          </Button>
          {isAdmin && (
            <Button onClick={() => {
              setShowBlockForm(true);
              setEditingBlock(null);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Block
            </Button>
          )}
        </div>
      </div>

      {/* Block Management Section */}
      {showBlockManagement && (
        <Card>
          <CardHeader>
            <CardTitle>Block Management</CardTitle>
          </CardHeader>
          <CardContent>
            {blockData.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No blocks found. Create your first block to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockData.map((block) => (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{block.name}</h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBlockEdit(block)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBlockDelete(block.id, block.name)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Floors</p>
                          <p className="font-semibold">{block.floors}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Units/Floor</p>
                          <p className="font-semibold">{block.units_per_floor}</p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          Total: <span className="font-semibold">{block.floors * block.units_per_floor}</span> flats
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Block Form */}
      {showBlockForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBlock ? 'Edit Block' : 'Create New Block'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <Label htmlFor="society">Society *</Label>
                <select
                  id="society"
                  value={blockFormData.society}
                  onChange={(e) => setBlockFormData({ ...blockFormData, society: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a society</option>
                  {societies.map((society) => (
                    <option key={society.id} value={society.id}>
                      {society.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="name">Block Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Block A, Block B"
                  value={blockFormData.name}
                  onChange={(e) => setBlockFormData({ ...blockFormData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="floors">Number of Floors *</Label>
                  <Input
                    id="floors"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={blockFormData.floors}
                    onChange={(e) => setBlockFormData({ ...blockFormData, floors: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="units_per_floor">Units per Floor *</Label>
                  <Input
                    id="units_per_floor"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={blockFormData.units_per_floor}
                    onChange={(e) => setBlockFormData({ ...blockFormData, units_per_floor: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bhk">BHK Type</Label>
                <Input
                  id="bhk"
                  placeholder="e.g., 2BHK, 3BHK"
                  value={blockFormData.bhk}
                  onChange={(e) => setBlockFormData({ ...blockFormData, bhk: e.target.value })}
                />
              </div>

              {!editingBlock && (
                <div className="bg-blue-500/10 p-4 rounded-md">
                  <p className="text-sm text-blue-500">
                    <strong>Note:</strong> This will automatically create{' '}
                    {blockFormData.floors && blockFormData.units_per_floor
                      ? parseInt(blockFormData.floors) * parseInt(blockFormData.units_per_floor)
                      : 'N/A'}{' '}
                    flats with numbering format: {blockFormData.name ? `${blockFormData.name}-` : 'Block-'}404
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBlock ? 'Update Block' : 'Create Block & Generate Flats'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowBlockForm(false);
                  setEditingBlock(null);
                  setBlockFormData({
                    society: '',
                    name: '',
                    floors: '',
                    units_per_floor: '',
                    bhk: '2BHK',
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {blocks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Flat number, block, or resident..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Block Filter */}
              <div>
                <Label htmlFor="filter-block">Block</Label>
                <select
                  id="filter-block"
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Blocks</option>
                  {uniqueBlocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor Filter */}
              <div>
                <Label htmlFor="filter-floor">Floor</Label>
                <select
                  id="filter-floor"
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Floors</option>
                  {uniqueFloors.map((floor) => (
                    <option key={floor} value={floor.toString()}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occupancy Filter */}
              <div>
                <Label htmlFor="filter-occupancy">Occupancy</Label>
                <select
                  id="filter-occupancy"
                  value={filterOccupancy}
                  onChange={(e) => setFilterOccupancy(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All</option>
                  <option value="OWNER">Owner</option>
                  <option value="TENANT">Tenant</option>
                  <option value="VACANT">Vacant</option>
                </select>
              </div>

              {/* Maintenance Filter */}
              <div>
                <Label htmlFor="filter-maintenance">Maintenance</Label>
                <select
                  id="filter-maintenance"
                  value={filterMaintenance}
                  onChange={(e) => setFilterMaintenance(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Visualization */}
      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No apartments found. Create blocks to get started.</p>
            {isAdmin && (
              <Button onClick={() => setShowBlockForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Block
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap gap-12 justify-center items-start px-4">
          {blocks.map((block) => {
            const hasFilteredFlats = block.floors.some(floor => filterFlats(floor.flats).length > 0);
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
                <div className="mb-4 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/80 to-indigo-600/80 shadow-lg border border-blue-400/30">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Block {block.name}</h3>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex flex-col-reverse mr-3">
                    {sortedFloors.length > 0 && <div className="h-3"></div>}
                    {sortedFloors.map((floor, floorIndex) => {
                      const filteredFlats = filterFlats(floor.flats);
                      if (filteredFlats.length === 0) return null;
                      const isTopFloor = floorIndex === sortedFloors.length - 1;
                      return (
                        <div key={`label-${floor.floor}`} className="flex flex-col">
                          <div className="h-[72px] flex items-center justify-end pr-2">
                            <div className="text-xs font-bold text-muted-foreground bg-card/80 px-2.5 py-1.5 rounded-md border border-border whitespace-nowrap shadow-lg">
                              F{floor.floor}
                            </div>
                          </div>
                          {!isTopFloor && <div className="h-2"></div>}
                        </div>
                      );
                    })}
                    <div className="h-4"></div>
                  </div>

                  <div className="border-2 border-border rounded-t-lg bg-gradient-to-b from-card to-background shadow-2xl overflow-hidden min-w-[220px]">
                    {sortedFloors.length > 0 && (
                      <div className="bg-gradient-to-b from-secondary to-card h-3 border-b-2 border-border relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
                      </div>
                    )}

                    <div className="flex flex-col-reverse">
                      {sortedFloors.map((floor, floorIndex) => {
                        const filteredFlats = filterFlats(floor.flats);
                        if (filteredFlats.length === 0) return null;
                        const isTopFloor = floorIndex === sortedFloors.length - 1;

                        return (
                          <div key={`${block.name}-${floor.floor}`} className="relative">
                            <div className="border-b-2 border-border bg-gradient-to-b from-card to-background px-3 py-3 h-[72px] flex items-center">
                              <div className="flex flex-wrap justify-center gap-2 w-full">
                                {filteredFlats.map((flat) => {
                                  const isVacant = flat.occupancy_status === 'VACANT';
                                  const tooltipText = `${flat.flat_number}\n${flat.bhk}\n${flat.owner ? `Owner: ${flat.owner.first_name} ${flat.owner.last_name}` : 'No Owner'}\n${flat.current_resident ? `Resident: ${flat.current_resident.first_name} ${flat.current_resident.last_name}` : 'No Resident'}\nStatus: ${flat.current_bill_status === 'PAID' ? 'Paid' : 'Overdue'}`;
                                  
                                  return (
                                    <div
                                      key={flat.id}
                                      className="group relative"
                                      title={tooltipText}
                                    >
                                      <div
                                        onClick={() => handleFlatClick(flat)}
                                        className={`
                                          relative
                                          w-10 h-12
                                          rounded-sm
                                          border-2
                                          shadow-inner
                                          transition-all duration-200
                                          hover:scale-110 hover:z-10 hover:shadow-xl
                                          ${isAdmin ? 'cursor-pointer' : 'cursor-default'}
                                          ${
                                            flat.current_bill_status === 'PAID'
                                              ? 'bg-emerald-900/40 border-emerald-600/60 shadow-emerald-500/20'
                                              : 'bg-rose-900/40 border-rose-600/60 shadow-rose-500/20'
                                          }
                                          ${isVacant ? 'border-dashed opacity-75' : ''}
                                        `}
                                      >
                                        <div className="absolute inset-0.5 border border-muted/30 rounded-sm"></div>
                                        
                                        <div className="absolute top-0.5 left-0 right-0 text-center">
                                          <span className="text-[8px] font-bold text-card-foreground leading-none">
                                            {flat.flat_number.split('-')[1] || flat.flat_number}
                                          </span>
                                        </div>
                                        
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
                                        
                                        <div className={`absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                                          flat.current_bill_status === 'PAID' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                        }`}></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {!isTopFloor && (
                              <div className="bg-gradient-to-b from-secondary to-card h-2 border-b border-border relative box-border">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gradient-to-b from-secondary to-card h-4 border-t-2 border-border relative box-border">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30"></div>
                    </div>
                  </div>
                  
                  <div className="h-4 box-border"></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flat Edit Dialog */}
      {editingFlat && (
        <FlatEditDialog
          flat={editingFlat}
          open={!!editingFlat}
          onClose={() => setEditingFlat(null)}
          onSuccess={() => {
            loadDashboard();
            setEditingFlat(null);
          }}
        />
      )}
    </div>
  );
}
