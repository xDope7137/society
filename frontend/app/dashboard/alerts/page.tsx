'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { alertsAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { AlertCircle, Plus, Search, CheckCircle, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        if (filter === 'active') {
          params.active_only = 'true';
        } else {
          params.alert_type = filter;
        }
      }
      
      const response = await alertsAPI.getAlerts(params);
      setAlerts(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load alerts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await alertsAPI.acknowledgeAlert(id);
      toast({
        title: 'Success',
        description: 'Alert acknowledged',
      });
      loadAlerts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert',
        variant: 'destructive',
      });
    }
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const alertTypeColors = {
    WATER_CUT: 'bg-blue-500/10 text-blue-500',
    POWER_OUTAGE: 'bg-yellow-500/10 text-yellow-500',
    SECURITY: 'bg-destructive/10 text-destructive',
    MAINTENANCE: 'bg-orange-500/10 text-orange-500',
    EMERGENCY: 'bg-destructive/10 text-destructive',
    OTHER: 'bg-muted text-muted-foreground',
  };

  const severityColors = {
    CRITICAL: 'bg-destructive text-destructive-foreground',
    HIGH: 'bg-orange-500 text-white',
    MEDIUM: 'bg-yellow-500 text-white',
    LOW: 'bg-blue-500 text-white',
  };

  const canCreateAlert = user && (user.role === 'ADMIN' || user.role === 'COMMITTEE');

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
          <h2 className="text-2xl font-bold">Emergency Alerts</h2>
          <p className="text-muted-foreground">Important announcements and alerts</p>
        </div>
        {canCreateAlert && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
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
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'active', 'WATER_CUT', 'POWER_OUTAGE', 'SECURITY', 'MAINTENANCE', 'EMERGENCY', 'OTHER'].map((type) => (
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

      {/* Alerts List */}
      <div className="grid gap-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No alerts found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`hover:shadow-md transition-shadow ${
                alert.is_active ? 'border-l-4' : ''
              } ${
                alert.severity === 'CRITICAL' ? 'border-l-red-600' :
                alert.severity === 'HIGH' ? 'border-l-orange-600' :
                alert.severity === 'MEDIUM' ? 'border-l-yellow-600' :
                'border-l-blue-600'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${alertTypeColors[alert.alert_type as keyof typeof alertTypeColors]}`}>
                        {alert.alert_type.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[alert.severity as keyof typeof severityColors]}`}>
                        {alert.severity}
                      </span>
                      {alert.is_active && (
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-medium">
                          Active
                        </span>
                      )}
                      {alert.is_acknowledged && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2">{alert.title}</CardTitle>
                    <p className="text-muted-foreground whitespace-pre-wrap">{alert.message}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(alert.created_at)}</span>
                    </div>
                    {alert.expires_at && (
                      <div className="flex items-center gap-1">
                        <span>Expires: {formatDate(alert.expires_at)}</span>
                      </div>
                    )}
                  </div>
                  {alert.is_active && !alert.is_acknowledged && (
                    <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Alert Dialog */}
      {canCreateAlert && (
        <CreateAlertDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={() => {
            loadAlerts();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}

function CreateAlertDialog({ open, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    alert_type: 'OTHER',
    severity: 'MEDIUM',
    expires_at: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        title: formData.title,
        message: formData.message,
        alert_type: formData.alert_type,
        severity: formData.severity,
        is_active: formData.is_active,
      };
      
      if (formData.expires_at) {
        submitData.expires_at = new Date(formData.expires_at).toISOString();
      }
      
      await alertsAPI.createAlert(submitData);
      toast({
        title: 'Success',
        description: 'Alert created successfully',
      });
      onSuccess();
      setFormData({
        title: '',
        message: '',
        alert_type: 'OTHER',
        severity: 'MEDIUM',
        expires_at: '',
        is_active: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert',
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
          <Dialog.Title className="text-xl font-bold mb-4">Create Emergency Alert</Dialog.Title>
          
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
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="alert_type">Alert Type</Label>
              <select
                id="alert_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.alert_type}
                onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
              >
                <option value="WATER_CUT">Water Cut</option>
                <option value="POWER_OUTAGE">Power Outage</option>
                <option value="SECURITY">Security Alert</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <Label htmlFor="expires_at">Expires At (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Alert'}
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

