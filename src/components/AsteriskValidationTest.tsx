import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageFormatter } from '@/components/MessageFormatter';
import { openRouterAI } from '@/lib/ai-client';

const AsteriskValidationTest = () => {
  const [testInput, setTestInput] = useState("Hello *waves* how are you *smiles* today?");
  const [enhancedOutput, setEnhancedOutput] = useState("");

  const handleTest = () => {
    const enhanced = openRouterAI.validateUserAsterisks(testInput);
    setEnhancedOutput(enhanced);
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Asterisk Validation Test</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Test Input:</label>
        <Textarea
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Enter text with asterisk actions to test..."
          className="min-h-[80px]"
        />
      </div>

      <Button onClick={handleTest} className="w-full">
        Test Asterisk Enhancement
      </Button>

      {enhancedOutput && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Enhanced Output:</label>
          <div className="bg-card/50 p-4 rounded border">
            <MessageFormatter 
              content={enhancedOutput} 
              className="chat-text"
            />
          </div>
          
          {enhancedOutput !== testInput && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Message was enhanced for better asterisk compliance
            </div>
          )}
          
          {enhancedOutput === testInput && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              ℹ️ Message already meets asterisk requirements
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Test Examples:</strong></p>
        <p>• "*waves*" → "*raises her hand gracefully then moves it in a gentle wave while maintaining eye contact*"</p>
        <p>• "*smiles*" → "*feels her lips curve upward then lets the warmth spread across her entire face*"</p>
        <p>• "*he held her up letting her down slowly then kisses her passionately*" → Already correct format</p>
      </div>
    </Card>
  );
};

export default AsteriskValidationTest;
