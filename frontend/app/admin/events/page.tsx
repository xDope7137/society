'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, Plus, Search, MapPin, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';

const PAGE_KEY = 'events';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSearchTerm, setSearchTerm: saveSearchTerm, getFilter, setFilter: saveFilter } = useSettings();
  const [searchTerm, setSearchTerm] = useState(() => getSearchTerm(PAGE_KEY) || '');
  const [filter, setFilter] = useState(() => getFilter(PAGE_KEY, 'event_type') || 'all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [filter]);

  // Save filter when it changes
  useEffect(() => {
    saveFilter(PAGE_KEY, 'event_type', filter === 'all' ? null : filter);
  }, [filter, saveFilter]);

  // Save search term when it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveSearchTerm(PAGE_KEY, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, saveSearchTerm]);

  const loadEvents = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.event_type = filter;
      }
      
      const response = await eventsAPI.getEvents(params);
      const eventsData = response.data.results || response.data || [];
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = (events || []).filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const eventTypeColors = {
    MEETING: 'bg-blue-500/10 text-blue-500',
    FESTIVAL: 'bg-purple-500/10 text-purple-500',
    MAINTENANCE: 'bg-orange-500/10 text-orange-500',
    SOCIAL: 'bg-emerald-500/10 text-emerald-500',
    SPORTS: 'bg-red-500/10 text-red-500',
    OTHER: 'bg-muted text-muted-foreground',
  };

  const canCreateEvent = user && (user.role === 'ADMIN' || user.role === 'COMMITTEE');

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
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground">Community events and meetings</p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
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
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'MEETING', 'FESTIVAL', 'MAINTENANCE', 'SOCIAL', 'SPORTS', 'OTHER'].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className="capitalize"
                >
                  {type.toLowerCase().replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="grid gap-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventTypeColors[event.event_type as keyof typeof eventTypeColors]}`}>
                        {event.event_type.replace('_', ' ')}
                      </span>
                      {event.is_attending && (
                        <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                          Attending
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(event.start_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees_count || 0} attending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Created by {event.created_by_name || 'Management'}
                  </span>
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Event Dialog */}
      {canCreateEvent && (
        <CreateEventDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            loadEvents();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

function CreateEventDialog({ open, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'MEETING',
    start_date: '',
    end_date: '',
    location: '',
    is_recurring: false,
    recurrence_pattern: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };
      
      await eventsAPI.createEvent(submitData);
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      onSuccess();
      setFormData({
        title: '',
        description: '',
        event_type: 'MEETING',
        start_date: '',
        end_date: '',
        location: '',
        is_recurring: false,
        recurrence_pattern: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
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
          <Dialog.Title className="text-xl font-bold mb-4">Create Event</Dialog.Title>
          
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
              <Label htmlFor="event_type">Event Type</Label>
              <select
                id="event_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              >
                <option value="MEETING">Meeting</option>
                <option value="FESTIVAL">Festival</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SOCIAL">Social Event</option>
                <option value="SPORTS">Sports Event</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date & Time</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date & Time (Optional)</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Event'}
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

