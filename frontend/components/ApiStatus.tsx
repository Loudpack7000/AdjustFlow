'use client';

import { useEffect, useState } from 'react';
import { healthCheck } from '@/lib/api';

interface ApiStatusProps {
  className?: string;
}

export default function ApiStatus({ className = '' }: ApiStatusProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await healthCheck();
        if (result.success) {
          setStatus('healthy');
          setError('');
        } else {
          setStatus('error');
          setError(result.error || 'Unknown error');
        }
      } catch (err) {
        setStatus('error');
        setError('Failed to connect to API');
      }
    };

    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'checking':
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'healthy':
        return 'API Online';
      case 'error':
        return 'API Offline';
      case 'checking':
      default:
        return 'Checking...';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
      <span className="text-gray-700">{getStatusText()}</span>
      {status === 'error' && error && (
        <span className="text-red-600 text-xs">({error})</span>
      )}
    </div>
  );
}
