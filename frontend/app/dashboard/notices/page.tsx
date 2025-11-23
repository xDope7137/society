'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { noticesAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Bell, AlertCircle, Plus, Search, Calendar, User } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSettings } from '@/contexts/SettingsContext';

const PAGE_KEY = 'notices';

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSearchTerm, setSearchTerm: saveSearchTerm, getFilter, setFilter: saveFilter } = useSettings();
  const [searchTerm, setSearchTerm] = useState(() => getSearchTerm(PAGE_KEY) || '');
  const [filter, setFilter] = useState(() => getFilter(PAGE_KEY, 'category') || 'all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Load user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [filter]);

  // Save filter when it changes
  useEffect(() => {
    saveFilter(PAGE_KEY, 'category', filter === 'all' ? null : filter);
  }, [filter, saveFilter]);

  // Save search term when it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSearchTerm(PAGE_KEY, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, saveSearchTerm]);

  const loadNotices = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.category = filter;
      }
      
      const response = await noticesAPI.getNotices(params);
      setNotices(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading notices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(notice =>
    notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityColors = {
    URGENT: 'bg-destructive/10 border-destructive/20',
    HIGH: 'bg-orange-500/10 border-orange-500/20',
    MEDIUM: 'bg-yellow-500/10 border-yellow-500/20',
    LOW: 'bg-blue-500/10 border-blue-500/20',
  };

  const priorityBadges = {
    URGENT: 'bg-destructive/20 text-destructive',
    HIGH: 'bg-orange-500/20 text-orange-500',
    MEDIUM: 'bg-yellow-500/20 text-yellow-500',
    LOW: 'bg-blue-500/20 text-blue-500',
  };

  const canCreateNotice = user && (user.role === 'ADMIN' || user.role === 'COMMITTEE');

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
          <h2 className="text-2xl font-bold">Notices</h2>
          <p className="text-muted-foreground">Stay updated with society announcements</p>
        </div>
        {canCreateNotice && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Notice
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'GENERAL', 'MAINTENANCE', 'MEETING', 'EVENT', 'EMERGENCY'].map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className="capitalize"
                >
                  {cat.toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      <div className="grid gap-4">
        {filteredNotices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notices found</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotices.map((notice) => (
            <Card key={notice.id} className={`${priorityColors[notice.priority as keyof typeof priorityColors]} border-l-4`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadges[notice.priority as keyof typeof priorityBadges]}`}>
                        {notice.priority}
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium capitalize">
                        {notice.category.toLowerCase()}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{notice.title}</CardTitle>
                  </div>
                  {notice.priority === 'URGENT' && (
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{notice.content}</p>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{notice.created_by_name || 'Management'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(notice.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Notice Dialog */}
      {canCreateNotice && (
        <CreateNoticeDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            loadNotices();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

function CreateNoticeDialog({ open, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await noticesAPI.createNotice(formData);
      toast({
        title: 'Success',
        description: 'Notice created successfully',
      });
      onSuccess();
      setFormData({ title: '', content: '', category: 'GENERAL', priority: 'MEDIUM' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create notice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border text-foreground rounded-lg p-6 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold mb-4">Create Notice</Dialog.Title>
          
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
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                <option value="GENERAL">General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="MEETING">Meeting</option>
                <option value="EVENT">Event</option>
                <option value="BILLING">Billing</option>
                <option value="SECURITY">Security</option>
                <option value="EMERGENCY">Emergency</option>
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
                {loading ? 'Creating...' : 'Create Notice'}
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

