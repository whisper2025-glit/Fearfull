import React from 'react';
import { MessageFormatter } from './MessageFormatter';
import { Card } from '@/components/ui/card';

/**
 * Example component demonstrating asterisk formatting in messages
 * Used for testing and documentation purposes
 */
export const MessageFormatterExample: React.FC = () => {
  const exampleMessages = [
    "Hello there! *waves enthusiastically* How are you doing today?",
    "*looks around nervously* I think we're being watched... *whispers* Follow me.",
    "The sun was setting as *she gently touched his hand* and smiled warmly.",
    "*adjusts glasses and clears throat* Let me explain this complex topic to you.",
    "Normal text here. *This should be italicized and darker* Back to normal text.",
    "*dramatic gasp* I can't believe you said that! *covers mouth in shock*"
  ];

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-bold mb-4">Asterisk Formatting Examples</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Text between asterisks (*action*) will be displayed in italics and darker for actions/descriptions.
      </p>
      
      {exampleMessages.map((message, index) => (
        <Card key={index} className="p-4 bg-card/20 backdrop-blur-sm">
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Raw text:</span>
            <code className="block text-xs bg-muted/50 p-2 rounded mt-1 font-mono">
              {message}
            </code>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Formatted result:</span>
            <div className="mt-1">
              <MessageFormatter content={message} className="chat-text" />
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-4 bg-primary/10 border-primary/20">
        <h3 className="font-semibold mb-2">✨ How it works:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Text between single asterisks (*text*) becomes italicized action text</li>
          <li>• Action text is darker and uses a medium font weight</li>
          <li>• Perfect for roleplay actions, descriptions, and character emotions</li>
          <li>• Regular text remains unchanged</li>
        </ul>
      </Card>
    </div>
  );
};

export default MessageFormatterExample;
