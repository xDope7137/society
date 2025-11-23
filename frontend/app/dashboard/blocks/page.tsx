'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { blocksAPI, societyAPI } from '@/lib/api';
import { Building2, Plus, Trash2, Edit, Home } from 'lucide-react';

interface Block {
  id: number;
  name: string;
  society: number;
  society_name: string;
  floors: number;
  units_per_floor: number;
  created_at: string;
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [societies, setSocieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [formData, setFormData] = useState({
    society: '',
    name: '',
    floors: '',
    units_per_floor: '',
    bhk: '2BHK',
  });
  const { toast } = useToast();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [blocksResponse, societiesResponse] = await Promise.all([
        blocksAPI.getBlocks(),
        societyAPI.getSocieties(),
      ]);
      setBlocks(blocksResponse.data.results || blocksResponse.data || []);
      setSocieties(societiesResponse.data.results || societiesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blocks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.society || !formData.name || !formData.floors || !formData.units_per_floor) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingBlock) {
        // Check if floors or units_per_floor changed
        const floorsChanged = parseInt(formData.floors) !== editingBlock.floors;
        const unitsChanged = parseInt(formData.units_per_floor) !== editingBlock.units_per_floor;
        
        // Update existing block
        await blocksAPI.updateBlock(editingBlock.id, {
          society: parseInt(formData.society),
          name: formData.name,
          floors: parseInt(formData.floors),
          units_per_floor: parseInt(formData.units_per_floor),
        });
        
        // If floors or units changed, regenerate flats
        if (floorsChanged || unitsChanged) {
          await blocksAPI.regenerateFlats(editingBlock.id);
          
          // Dispatch event to refresh apartments page if it's open
          window.dispatchEvent(new CustomEvent('blocksUpdated'));
          
          toast({
            title: 'Success',
            description: `Block ${formData.name} updated and flats regenerated successfully`,
          });
        } else {
          toast({
            title: 'Success',
            description: `Block ${formData.name} updated successfully`,
          });
        }
      } else {
        // Create new block
        await blocksAPI.createBlockWithFlats({
          society: parseInt(formData.society),
          name: formData.name,
          floors: parseInt(formData.floors),
          units_per_floor: parseInt(formData.units_per_floor),
          bhk: formData.bhk,
        });
        
        toast({
          title: 'Success',
          description: `Block ${formData.name} created with ${parseInt(formData.floors) * parseInt(formData.units_per_floor)} flats`,
        });
      }
      
      setFormData({
        society: '',
        name: '',
        floors: '',
        units_per_floor: '',
        bhk: '2BHK',
      });
      setShowForm(false);
      setEditingBlock(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving block:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || `Failed to ${editingBlock ? 'update' : 'create'} block`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      society: block.society.toString(),
      name: block.name,
      floors: block.floors.toString(),
      units_per_floor: block.units_per_floor.toString(),
      bhk: '2BHK', // Default since it's not in the block interface
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBlock(null);
    setFormData({
      society: '',
      name: '',
      floors: '',
      units_per_floor: '',
      bhk: '2BHK',
    });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will also delete all associated flats.`)) {
      return;
    }

    try {
      await blocksAPI.deleteBlock(id);
      toast({
        title: 'Success',
        description: `Block ${name} deleted`,
      });
      loadData();
    } catch (error: any) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete block',
        variant: 'destructive',
      });
    }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Building2 className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground">Only administrators can manage blocks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blocks Management</h2>
          <p className="text-muted-foreground">Create and manage apartment blocks</p>
        </div>
        <Button onClick={() => {
          if (showForm) {
            handleCancel();
          } else {
            setShowForm(true);
            setEditingBlock(null);
          }
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Block'}
        </Button>
      </div>

      {/* Create/Edit Block Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBlock ? 'Edit Block' : 'Create New Block'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="society">Society *</Label>
                <select
                  id="society"
                  value={formData.society}
                  onChange={(e) => setFormData({ ...formData, society: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    value={formData.floors}
                    onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
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
                    value={formData.units_per_floor}
                    onChange={(e) => setFormData({ ...formData, units_per_floor: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bhk">BHK Type</Label>
                <Input
                  id="bhk"
                  placeholder="e.g., 2BHK, 3BHK"
                  value={formData.bhk}
                  onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                />
              </div>

              {!editingBlock && (
                <div className="bg-blue-500/10 p-4 rounded-md">
                  <p className="text-sm text-blue-500">
                    <strong>Note:</strong> This will automatically create{' '}
                    {formData.floors && formData.units_per_floor
                      ? parseInt(formData.floors) * parseInt(formData.units_per_floor)
                      : 'N/A'}{' '}
                    flats with numbering format: {formData.name ? `${formData.name}-` : 'Block-'}404 (Block-Floor-Unit)
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBlock ? 'Update Block' : 'Create Block & Generate Flats'}
                </Button>
                {editingBlock && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Blocks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No blocks found. Create your first block to get started.</p>
            </CardContent>
          </Card>
        ) : (
          blocks.map((block) => (
            <Card key={block.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>{block.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(block)}
                      className="text-primary hover:text-primary/90"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(block.id, block.name)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p>{block.society_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Floors</p>
                    <p className="font-semibold">{block.floors}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Units/Floor</p>
                    <p className="font-semibold">{block.units_per_floor}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Total Flats: <span className="font-semibold">{block.floors * block.units_per_floor}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

