import React from 'react';
import { MessageFormatter } from './MessageFormatter';

/**
 * Simple test component to validate asterisk formatting
 * Shows the user's specific example and how it's rendered
 */
export const AsteriskTest: React.FC = () => {
  const testMessage = "Hello!*he walked to her and kisses her on the forehead*did you miss me";
  
  return (
    <div className="p-6 max-w-2xl mx-auto bg-card rounded-lg">
      <h2 className="text-xl font-bold mb-4">Asterisk Formatting Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Raw Input:</h3>
          <code className="block bg-muted p-3 rounded text-sm font-mono">
            {testMessage}
          </code>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Formatted Output:</h3>
          <div className="bg-muted/50 p-3 rounded">
            <MessageFormatter 
              content={testMessage} 
              className="chat-text text-base"
            />
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>✅ Expected result:</p>
          <ul className="ml-4 mt-1">
            <li>• "Hello!" should be normal text</li>
            <li>• "he walked to her and kisses her on the forehead" should be <em className="action-text">italic and darker</em></li>
            <li>• "did you miss me" should be normal text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AsteriskTest;
