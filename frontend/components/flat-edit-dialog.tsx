'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { societyAPI, authAPI } from '@/lib/api';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';

interface Flat {
  id: number;
  flat_number: string;
  floor: number;
  bhk: string;
  area_sqft?: string | number | null;
  occupancy_status: string;
  parking_slots?: number;
  parking_numbers?: string;
  block_name: string;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  current_resident: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  } | null;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

interface FlatEditDialogProps {
  flat: Flat | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FlatEditDialog({ flat, open, onClose, onSuccess }: FlatEditDialogProps) {
  const [formData, setFormData] = useState({
    bhk: '',
    area_sqft: '',
    occupancy_status: 'VACANT',
    owner: '',
    current_resident: '',
    parking_slots: '0',
    parking_numbers: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadUsers();
      if (flat) {
        setFormData({
          bhk: flat.bhk || '',
          area_sqft: flat.area_sqft?.toString() || '',
          occupancy_status: flat.occupancy_status || 'VACANT',
          owner: flat.owner?.id.toString() || '',
          current_resident: flat.current_resident?.id.toString() || '',
          parking_slots: flat.parking_slots?.toString() || '0',
          parking_numbers: flat.parking_numbers || '',
        });
      }
    }
  }, [open, flat]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await authAPI.getUsers();
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flat) return;

    setLoading(true);
    try {
      const submitData: any = {
        bhk: formData.bhk,
        occupancy_status: formData.occupancy_status,
        parking_slots: parseInt(formData.parking_slots) || 0,
        parking_numbers: formData.parking_numbers,
      };

      if (formData.area_sqft) {
        submitData.area_sqft = parseFloat(formData.area_sqft);
      }

      if (formData.owner) {
        submitData.owner = parseInt(formData.owner);
      } else {
        submitData.owner = null;
      }

      if (formData.current_resident) {
        submitData.current_resident = parseInt(formData.current_resident);
      } else {
        submitData.current_resident = null;
      }

      await societyAPI.updateFlat(flat.id, submitData);
      toast({
        title: 'Success',
        description: `Flat ${flat.flat_number} updated successfully`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating flat:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update flat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!flat) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl p-6 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-foreground">
              Edit Flat: {flat.flat_number}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only Basic Info */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border">
              <div>
                <Label className="text-muted-foreground">Flat Number</Label>
                <Input value={flat.flat_number} disabled className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-muted-foreground">Floor</Label>
                <Input value={flat.floor} disabled className="mt-1 bg-secondary/50" />
              </div>
              <div>
                <Label className="text-muted-foreground">Block</Label>
                <Input value={flat.block_name} disabled className="mt-1 bg-secondary/50" />
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Property Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bhk">BHK Type *</Label>
                  <Input
                    id="bhk"
                    placeholder="e.g., 2BHK, 3BHK"
                    value={formData.bhk}
                    onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="area_sqft">Area (sqft)</Label>
                  <Input
                    id="area_sqft"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 1200"
                    value={formData.area_sqft}
                    onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parking_slots">Parking Slots</Label>
                  <Input
                    id="parking_slots"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.parking_slots}
                    onChange={(e) => setFormData({ ...formData, parking_slots: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="parking_numbers">Parking Numbers</Label>
                  <Input
                    id="parking_numbers"
                    placeholder="e.g., P1, P2"
                    value={formData.parking_numbers}
                    onChange={(e) => setFormData({ ...formData, parking_numbers: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Occupancy Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Occupancy Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="occupancy_status">Occupancy Status *</Label>
                  <select
                    id="occupancy_status"
                    value={formData.occupancy_status}
                    onChange={(e) => setFormData({ ...formData, occupancy_status: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="OWNER">Owner Occupied</option>
                    <option value="TENANT">Tenant Occupied</option>
                    <option value="VACANT">Vacant</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="owner">Owner</Label>
                  {loadingUsers ? (
                    <div className="mt-1 flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <select
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">None</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <Label htmlFor="current_resident">Current Resident</Label>
                  {loadingUsers ? (
                    <div className="mt-1 flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <select
                      id="current_resident"
                      value={formData.current_resident}
                      onChange={(e) => setFormData({ ...formData, current_resident: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">None</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

