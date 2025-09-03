import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { openRouterAI } from '@/lib/ai-client';

export function OpenRouterTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('Testing OpenRouter connection...');
      const result = await openRouterAI.testConnection();
      console.log('OpenRouter test result:', result);
      setTestResult(result);
    } catch (error) {
      console.error('OpenRouter test error:', error);
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!testResult) return null;
    return testResult.success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const hasApiKey = Boolean(import.meta.env.VITE_OPENROUTER_API_KEY);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          OpenRouter Connection Test
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Test the connection to OpenRouter AI service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">API Key Status:</span>
          <Badge variant={hasApiKey ? "default" : "destructive"}>
            {hasApiKey ? "Configured" : "Missing"}
          </Badge>
        </div>
        
        {!hasApiKey && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
            <div className="text-sm text-orange-700">
              OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY environment variable.
            </div>
          </div>
        )}

        <Button 
          onClick={testConnection} 
          disabled={isLoading || !hasApiKey}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>

        {testResult && (
          <div className={`p-3 rounded-md border ${
            testResult.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="text-sm font-medium">
              {testResult.success ? 'Connection Successful' : 'Connection Failed'}
            </div>
            <div className="text-xs mt-1 break-words">
              {testResult.message}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Check browser console for detailed logs.
        </div>
      </CardContent>
    </Card>
  );
}
