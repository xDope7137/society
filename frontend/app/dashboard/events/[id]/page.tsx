'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { eventsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Edit, Trash2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = parseInt(params.id as string);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await eventsAPI.getEvent(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      toast({
        title: 'Error',
        description: 'Failed to load event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      await eventsAPI.rsvpEvent(eventId);
      toast({
        title: 'Success',
        description: event?.is_attending ? 'RSVP removed' : 'RSVP added',
      });
      loadEvent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update RSVP',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await eventsAPI.deleteEvent(eventId);
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      router.push('/dashboard/events');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const canEdit = user && (user.role === 'ADMIN' || user.role === 'COMMITTEE' || user.id === event?.created_by?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Event not found</p>
        <Link href="/dashboard/events">
          <Button variant="outline" className="mt-4">
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const eventTypeColors = {
    MEETING: 'bg-blue-500/10 text-blue-500',
    FESTIVAL: 'bg-purple-500/10 text-purple-500',
    MAINTENANCE: 'bg-orange-500/10 text-orange-500',
    SOCIAL: 'bg-emerald-500/10 text-emerald-500',
    SPORTS: 'bg-red-500/10 text-red-500',
    OTHER: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <Card>
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
              <CardTitle className="text-3xl mb-4">{event.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start</p>
                <p className="font-medium">{formatDate(event.start_date)}</p>
              </div>
            </div>
            {event.end_date && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">End</p>
                  <p className="font-medium">{formatDate(event.end_date)}</p>
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="font-medium">{event.attendees_count || 0} people</p>
              </div>
            </div>
          </div>

          {event.attendees && event.attendees.length > 0 && (user?.role === 'ADMIN' || user?.role === 'COMMITTEE') && (
            <div>
              <h3 className="font-semibold mb-2">Attendees</h3>
              <div className="flex flex-wrap gap-2">
                {event.attendees.map((attendee: any) => (
                  <div key={attendee.id} className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm">{attendee.first_name} {attendee.last_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button onClick={handleRSVP} className="w-full md:w-auto">
              {event.is_attending ? 'Remove RSVP' : 'RSVP to Event'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditEventDialog
          event={event}
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            loadEvent();
            setShowEditDialog(false);
          }}
        />
      )}

      {/* Delete Dialog */}
      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border text-foreground rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-bold mb-4">Delete Event</Dialog.Title>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Delete
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function EditEventDialog({ event, open, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    event_type: event.event_type,
    start_date: new Date(event.start_date).toISOString().slice(0, 16),
    end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    location: event.location || '',
    is_recurring: event.is_recurring,
    recurrence_pattern: event.recurrence_pattern || '',
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
      
      await eventsAPI.updateEvent(event.id, submitData);
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event',
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
          <Dialog.Title className="text-xl font-bold mb-4">Edit Event</Dialog.Title>
          
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
                {loading ? 'Updating...' : 'Update Event'}
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

