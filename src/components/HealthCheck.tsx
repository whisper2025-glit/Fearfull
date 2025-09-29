import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HealthStatus {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const HealthCheck = () => {
  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show health check in development or when there's an issue
    const isDev = import.meta.env.DEV;
    const hasUrlParam = new URLSearchParams(window.location.search).has('health-check');
    
    if (isDev || hasUrlParam) {
      setIsVisible(true);
      performHealthChecks();
    }
  }, []);

  const performHealthChecks = () => {
    const checks: HealthStatus[] = [];

    // Authentication and database have been removed in this build

    // Check OpenRouter
    const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    checks.push({
      name: 'OpenRouter AI',
      status: openRouterKey && openRouterKey.trim().length > 0 ? 'success' : 'warning',
      message: openRouterKey ? 'Configured ✓' : 'Missing VITE_OPENROUTER_API_KEY'
    });

    // Check build environment
    checks.push({
      name: 'Build Environment',
      status: 'success',
      message: `Mode: ${import.meta.env.MODE} | Dev: ${import.meta.env.DEV ? 'Yes' : 'No'}`
    });

    setHealthChecks(checks);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          Environment Health Check
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {healthChecks.map((check, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(check.status)}
              <span className="text-sm font-medium">{check.name}</span>
            </div>
            <Badge className={`text-xs ${getStatusColor(check.status)}`}>
              {check.status}
            </Badge>
          </div>
        ))}
        <div className="pt-2 text-xs text-gray-500">
          Add ?health-check to URL to show this in production
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthCheck;
