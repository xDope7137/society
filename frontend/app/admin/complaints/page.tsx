'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { complaintsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Wrench, Plus, Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSettings } from '@/contexts/SettingsContext';

const PAGE_KEY = 'complaints';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { getFilter, setFilter: saveFilter } = useSettings();
  const [filter, setFilter] = useState(() => getFilter(PAGE_KEY, 'status') || 'all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, [filter]);

  // Save filter when it changes
  useEffect(() => {
    saveFilter(PAGE_KEY, 'status', filter === 'all' ? null : filter);
  }, [filter, saveFilter]);

  const loadComplaints = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await complaintsAPI.getComplaints(params);
      setComplaints(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await complaintsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statusColors = {
    OPEN: 'bg-destructive/10 text-destructive',
    IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500',
    RESOLVED: 'bg-emerald-500/10 text-emerald-500',
    CLOSED: 'bg-muted text-muted-foreground',
  };

  const priorityColors = {
    URGENT: 'bg-destructive/10 text-destructive',
    HIGH: 'bg-orange-500/10 text-orange-500',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500',
    LOW: 'bg-blue-500/10 text-blue-500',
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
          <h2 className="text-2xl font-bold">Complaints</h2>
          <p className="text-muted-foreground">Track and manage maintenance requests</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          File Complaint
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.open || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">{stats.in_progress || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-500">{stats.resolved || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status.toLowerCase().replace('_', ' ')}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="grid gap-4">
        {complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No complaints found</p>
            </CardContent>
          </Card>
        ) : (
          complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                        {complaint.priority}
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium capitalize">
                        {complaint.category.toLowerCase()}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap mb-4">{complaint.description}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span>Flat: {complaint.flat_number || 'Common Area'}</span>
                    <span>•</span>
                    <span>{formatDate(complaint.created_at)}</span>
                  </div>
                  {complaint.updates_count > 0 && (
                    <span className="text-blue-500">{complaint.updates_count} updates</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateComplaintDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          loadComplaints();
          loadStats();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
}

function CreateComplaintDialog({ open, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'PLUMBING',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await complaintsAPI.createComplaint(formData);
      toast({ title: 'Success', description: 'Complaint filed successfully' });
      onSuccess();
      setFormData({ title: '', description: '', category: 'PLUMBING', priority: 'MEDIUM' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to file complaint', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border text-foreground rounded-lg p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">File Complaint</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="CIVIL">Civil Work</option>
                <option value="CARPENTRY">Carpentry</option>
                <option value="CLEANING">Cleaning</option>
                <option value="SECURITY">Security</option>
                <option value="LIFT">Lift</option>
                <option value="GENERATOR">Generator</option>
                <option value="WATER">Water Supply</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Filing...' : 'File Complaint'}
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

