import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Wifi } from 'lucide-react';
import { openRouterAI } from '@/lib/ai-client';

export const ConnectionStatus = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      const result = await openRouterAI.testConnection();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-cyan-400" />
        <h3 className="font-medium text-white">AI Service Connection</h3>
      </div>
      
      <Button
        onClick={testConnection}
        disabled={isTestingConnection}
        variant="outline"
        size="sm"
        className="w-full bg-transparent border-cyan-600 text-cyan-400 hover:bg-cyan-900/20"
      >
        {isTestingConnection ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Testing...
          </>
        ) : (
          'Test Connection'
        )}
      </Button>

      {connectionResult && (
        <Alert variant={connectionResult.success ? "default" : "destructive"}>
          <div className="flex items-center gap-2">
            {connectionResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              {connectionResult.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {!import.meta.env.VITE_OPENROUTER_API_KEY && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            OpenRouter API key is not configured. Add VITE_OPENROUTER_API_KEY to your environment variables.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
