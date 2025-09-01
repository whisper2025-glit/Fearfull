import React from 'react';
import { MessageFormatter } from './MessageFormatter';
import { Card } from './ui/card';

export const MarkdownImageExample: React.FC = () => {
  const exampleContent = `Here's how to use markdown images in your messages:

![Beautiful landscape](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&crop=center)

You can also add descriptive text: *She gazed out at the stunning mountain vista, feeling a sense of peace wash over her.*

![Cozy coffee shop](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=250&fit=crop&crop=center)

The syntax is simple: ![alt text](image_url)

*He sipped his coffee thoughtfully, watching the rain through the window.*`;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/30 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          Markdown Image Support
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          You can now include images in your messages using markdown syntax: <code className="bg-muted px-1 py-0.5 rounded text-xs">![alt text](image_url)</code>
        </p>
        <div className="border border-border/30 rounded-lg p-4 bg-background/20">
          <MessageFormatter content={exampleContent} className="text-sm" />
        </div>
      </Card>
      
      <Card className="p-4 bg-card/20 backdrop-blur-sm">
        <h4 className="font-medium mb-2 text-foreground">Tips for using images:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use descriptive alt text for accessibility</li>
          <li>• Images are automatically resized and styled</li>
          <li>• Combine with action text using *asterisks* for rich storytelling</li>
          <li>• Images will show a fallback message if they fail to load</li>
        </ul>
      </Card>
    </div>
  );
};

export default MarkdownImageExample;
