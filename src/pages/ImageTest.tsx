import React, { useState } from 'react';
import { MessageFormatter } from '@/components/MessageFormatter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ImageTest = () => {
  const navigate = useNavigate();
  const [testInput, setTestInput] = useState('Here is a test image: ![Beautiful sunset](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center) *looks at the horizon with wonder*');

  const examples = [
    {
      title: "Basic Image",
      text: "![Sunset](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center)"
    },
    {
      title: "Image with Action",
      text: "Look at this! ![Coffee shop](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop) *takes a sip of coffee*"
    },
    {
      title: "Multiple Images",
      text: "![Cat](https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop) and ![Dog](https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop)"
    },
    {
      title: "Broken Image Test",
      text: "![Broken](https://invalid-url.com/image.jpg) This should show fallback text"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Markdown Image Test</h1>
        </div>

        {/* Interactive Test */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Interactive Test</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Enter markdown text with images:</label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="mt-2"
                rows={3}
                placeholder="Try: ![alt text](image_url) or combine with *actions*"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Formatted Output:</label>
              <div className="mt-2 p-4 border rounded-lg bg-card/50">
                <MessageFormatter content={testInput} className="chat-text" />
              </div>
            </div>
          </div>
        </Card>

        {/* Example Tests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Example Tests</h2>
          {examples.map((example, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold mb-2">{example.title}</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Input:</span>
                  <code className="block bg-muted/50 p-2 rounded mt-1 text-sm font-mono">
                    {example.text}
                  </code>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Output:</span>
                  <div className="bg-card/50 p-4 rounded mt-1 border">
                    <MessageFormatter content={example.text} className="chat-text" />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setTestInput(example.text)}
                className="mt-3"
              >
                Test This Example
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageTest;
