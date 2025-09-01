import React from 'react';
import { MessageFormatter } from './MessageFormatter';
import { Card } from '@/components/ui/card';

/**
 * Example component demonstrating asterisk formatting in messages
 * Used for testing and documentation purposes
 */
export const MessageFormatterExample: React.FC = () => {
  const exampleMessages = [
    "Hello!*he walked to her and kisses her on the forehead*did you miss me",
    "Hello there! *waves enthusiastically* How are you doing today?",
    "*looks around nervously* I think we're being watched... *whispers* Follow me.",
    "The sun was setting as*she gently touched his hand*and smiled warmly.",
    "*adjusts glasses and clears throat* Let me explain this complex topic to you.",
    "Normal text here.*This should be italicized and darker*Back to normal text.",
    "*dramatic gasp* I can't believe you said that! *covers mouth in shock*"
  ];

  const imageExamples = [
    "Look at this beautiful sunset! ![Sunset over mountains](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center) *points toward the horizon with wonder*",
    "I found this cozy coffee shop downtown. ![Coffee shop interior](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop&crop=center) *takes a sip of coffee* The atmosphere is perfect for reading.",
    "*pulls out phone excitedly* Check out this adorable cat I saw today! ![Cute cat](https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop&crop=center)",
    "The architecture here is stunning. ![Modern building](https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=500&h=300&fit=crop&crop=center) *looks up in awe* I could stare at this all day."
  ];

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Message Formatting Examples</h2>
        <p className="text-sm text-muted-foreground mb-6">
          The MessageFormatter component supports both asterisk actions and markdown images for rich roleplay experiences.
        </p>
      </div>

      {/* Asterisk Formatting Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Asterisk Action Formatting</h3>
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
      </div>

      {/* Markdown Image Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Markdown Image Support</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use markdown syntax ![alt text](image_url) to embed images in your messages.
        </p>

        {imageExamples.map((message, index) => (
          <Card key={`image-${index}`} className="p-4 bg-card/20 backdrop-blur-sm">
            <div className="mb-2">
              <span className="text-xs text-muted-foreground">Raw text:</span>
              <code className="block text-xs bg-muted/50 p-2 rounded mt-1 font-mono overflow-x-auto">
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
      </div>

      {/* How it works section */}
      <Card className="p-4 bg-primary/10 border-primary/20">
        <h3 className="font-semibold mb-2">✨ How it works:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Asterisk Actions:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Text between single asterisks (*text*) becomes action text</li>
              <li>• Action text is italicized and uses a darker color</li>
              <li>• Perfect for roleplay actions and emotions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Markdown Images:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use ![alt text](image_url) syntax</li>
              <li>• Images are automatically resized and styled</li>
              <li>• Graceful fallback for broken images</li>
              <li>• Hover effects and smooth loading</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageFormatterExample;
