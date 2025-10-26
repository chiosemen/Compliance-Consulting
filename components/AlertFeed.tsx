'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Alert } from '@/types/alerts';

interface AlertFeedProps {
  organizationId?: string;
  unreadOnly?: boolean;
}

export default function AlertFeed({ organizationId, unreadOnly = false }: AlertFeedProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial alerts
  useEffect(() => {
    fetchAlerts();
  }, [organizationId, unreadOnly]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: organizationId ? `organization_id=eq.${organizationId}` : undefined,
        },
        (payload) => {
          handleRealtimeEvent(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (organizationId) params.append('organization_id', organizationId);
      if (unreadOnly) params.append('unread_only', 'true');
      params.append('limit', '50');

      const response = await fetch(`/api/alerts?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch alerts: ${response.statusText}`);
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeEvent = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // Add new alert to the beginning of the list
        setAlerts((prev) => [newRecord as Alert, ...prev]);
        break;
      case 'UPDATE':
        // Update existing alert
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === newRecord.id ? (newRecord as Alert) : alert
          )
        );
        break;
      case 'DELETE':
        // Remove deleted alert
        setAlerts((prev) => prev.filter((alert) => alert.id !== oldRecord.id));
        break;
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, is_read: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark alert as read');
      }

      // Optimistically update UI
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'daf_ratio_increase':
        return '📈';
      case 'top_donor_concentration':
        return '👤';
      case 'missing_990':
        return '📄';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading alerts</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchAlerts}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg">No alerts found</p>
        <p className="text-sm mt-2">
          {unreadOnly ? 'All alerts have been read' : 'There are no alerts at this time'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Compliance Alerts
        </h2>
        <span className="text-sm text-gray-600">
          {alerts.filter((a) => !a.is_read).length} unread
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 rounded-lg p-4 transition-all ${
              getSeverityColor(alert.severity)
            } ${alert.is_read ? 'opacity-60' : 'shadow-md'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getAlertIcon(alert.alert_type)}</span>
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <span className="text-xs uppercase font-bold px-2 py-1 rounded">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm mb-2">{alert.description}</p>
                {alert.organization && (
                  <p className="text-xs text-gray-600">
                    Organization: <span className="font-medium">{alert.organization.name}</span> (EIN: {alert.organization.ein})
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
              {!alert.is_read && (
                <button
                  onClick={() => markAsRead(alert.id)}
                  className="ml-4 text-xs bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1 transition-colors"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
