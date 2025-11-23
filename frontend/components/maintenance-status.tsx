'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

interface MaintenanceStatusProps {
  status: 'paid' | 'overdue';
  className?: string;
}

export function MaintenanceStatus({ status, className = '' }: MaintenanceStatusProps) {
  if (status === 'paid') {
    return (
      <div className={`flex items-center space-x-1 ${className}`} title="Maintenance Paid">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-600 font-medium">Paid</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`} title="Maintenance Overdue">
      <XCircle className="h-4 w-4 text-red-600" />
      <span className="text-xs text-red-600 font-medium">Overdue</span>
    </div>
  );
}

