'use client';

import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { alertsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function EmergencyAlertBanner() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadActiveAlerts = useCallback(async () => {
    try {
      const response = await alertsAPI.getActiveAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading active alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveAlerts();
    // Refresh every 30 seconds
    const interval = setInterval(loadActiveAlerts, 30000);
    return () => clearInterval(interval);
  }, [loadActiveAlerts]);

  const handleAcknowledge = useCallback(async (id: number) => {
    try {
      // Optimistically remove the alert from the UI
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      
      await alertsAPI.acknowledgeAlert(id);
      toast({
        title: 'Success',
        description: 'Alert acknowledged',
      });
      // Reload to ensure consistency
      loadActiveAlerts();
    } catch (error) {
      // If error, reload to restore the alert
      loadActiveAlerts();
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert',
        variant: 'destructive',
      });
    }
  }, [loadActiveAlerts, toast]);

  if (loading || alerts.length === 0) {
    return null;
  }

  // Sort by severity (CRITICAL first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (severityOrder[a.severity as keyof typeof severityOrder] || 99) - 
           (severityOrder[b.severity as keyof typeof severityOrder] || 99);
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-700';
      case 'HIGH':
        return 'bg-orange-600 text-white border-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-600 text-white border-yellow-700';
      case 'LOW':
        return 'bg-blue-600 text-white border-blue-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  return (
    <div className="sticky top-0 z-40 space-y-2">
      {sortedAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getSeverityStyles(alert.severity)} border-l-4 p-4 shadow-lg`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm">{alert.title}</h3>
                {sortedAlerts.length > 1 && (
                  <span className="text-xs opacity-90">
                    ({sortedAlerts.indexOf(alert) + 1} of {sortedAlerts.length})
                  </span>
                )}
              </div>
              <p className="text-sm opacity-95 whitespace-pre-wrap">{alert.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAcknowledge(alert.id)}
              className="text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

