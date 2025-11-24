'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { visitorsAPI, societyAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { UserCheck, Plus, Search, Clock, LogIn, LogOut, CheckCircle, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [activeVisitors, setActiveVisitors] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const [visitorsRes, activeRes, flatsRes] = await Promise.all([
        visitorsAPI.getVisitors(),
        visitorsAPI.getActive(),
        societyAPI.getFlats(),
      ]);

      setVisitors(visitorsRes.data.results || visitorsRes.data || []);
      setActiveVisitors(Array.isArray(activeRes.data) ? activeRes.data : []);
      setFlats(flatsRes.data.results || flatsRes.data || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load visitors data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (id: number) => {
    try {
      await visitorsAPI.checkIn(id);
      toast({ title: 'Success', description: 'Visitor checked in' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to check in visitor', variant: 'destructive' });
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await visitorsAPI.checkOut(id);
      toast({ title: 'Success', description: 'Visitor checked out' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to check out visitor', variant: 'destructive' });
    }
  };

  const statusColors = {
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    APPROVED: 'bg-emerald-500/10 text-emerald-500',
    IN_PREMISES: 'bg-blue-500/10 text-blue-500',
    EXITED: 'bg-muted text-muted-foreground',
    REJECTED: 'bg-destructive/10 text-destructive',
  };

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
          <h2 className="text-2xl font-bold">Visitor Management</h2>
          <p className="text-muted-foreground">Track and manage visitors</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Register Visitor
        </Button>
      </div>

      {/* Active Visitors Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            Active Visitors ({activeVisitors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeVisitors.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active visitors</p>
          ) : (
            <div className="space-y-4">
              {activeVisitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{visitor.name}</h4>
                    <p className="text-sm text-muted-foreground">Flat: {visitor.flat_number || visitor.flat?.flat_number || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Phone: {visitor.phone}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleCheckOut(visitor.id)}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Check Out
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No visitors found
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.flat_number || visitor.flat?.flat_number || 'N/A'}</TableCell>
                    <TableCell>{visitor.phone}</TableCell>
                    <TableCell className="capitalize">{visitor.purpose?.toLowerCase().replace('_', ' ') || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[visitor.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'}`}>
                        {visitor.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {visitor.entry_time ? formatDate(visitor.entry_time) : '-'}
                    </TableCell>
                    <TableCell>
                      {visitor.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => handleCheckIn(visitor.id)}>
                          <LogIn className="h-4 w-4 mr-1" />
                          Check In
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RegisterVisitorDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        flats={flats}
        onSuccess={() => {
          loadData();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}

function RegisterVisitorDialog({ open, onClose, flats, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    flat: '',
    purpose: 'PERSONAL',
    vehicle_number: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await visitorsAPI.createVisitor(formData);
      toast({ title: 'Success', description: 'Visitor registered successfully' });
      onSuccess();
      setFormData({ name: '', phone: '', flat: '', purpose: 'PERSONAL', vehicle_number: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to register visitor', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border text-foreground rounded-lg p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-xl font-bold mb-4">Register Visitor</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="flat">Visiting Flat</Label>
              <select
                id="flat"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.flat}
                onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                required
              >
                <option value="">Select Flat</option>
                {flats.map((flat: any) => (
                  <option key={flat.id} value={flat.id}>
                    {flat.flat_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <select
                id="purpose"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="PERSONAL">Personal Visit</option>
                <option value="DELIVERY">Delivery</option>
                <option value="SERVICE">Service/Repair</option>
                <option value="OFFICIAL">Official</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="vehicle_number">Vehicle Number (Optional)</Label>
              <Input
                id="vehicle_number"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Registering...' : 'Register'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

