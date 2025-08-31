import React from 'react';
import { MessageFormatter } from '@/components/MessageFormatter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AsteriskTestPage = () => {
  const navigate = useNavigate();
  
  const testCases = [
    {
      title: "User's Example (No Spaces)",
      input: "Hello!*he walked to her and kisses her on the forehead*did you miss me",
      description: "Text without spaces around asterisks"
    },
    {
      title: "Multiple Actions",
      input: "She looked at him*smiling softly*then*walked closer*and whispered*quietly*hello there",
      description: "Multiple asterisk sections in one message"
    },
    {
      title: "Mixed Spacing",
      input: "Hello *waves* how are you*looks concerned*today?",
      description: "Mix of spaced and non-spaced asterisks"
    },
    {
      title: "Start/End with Actions",
      input: "*enters the room quietly*Hello everyone*leaves quickly*",
      description: "Starting and ending with action text"
    },
    {
      title: "NSFW Example",
      input: "She moaned softly*pressing closer against him*as their lips met*passionately*",
      description: "Adult content with action formatting"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Asterisk Formatting Test</h1>
        </div>

        <div className="space-y-6">
          {testCases.map((testCase, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{testCase.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{testCase.description}</p>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Raw Input:</span>
                  <code className="block bg-muted/50 p-3 rounded mt-1 text-sm font-mono">
                    {testCase.input}
                  </code>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Formatted Output:</span>
                  <div className="bg-card/50 p-4 rounded mt-1 border">
                    <MessageFormatter 
                      content={testCase.input} 
                      className="chat-text text-base leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-3">✨ Expected Behavior</h3>
            <div className="space-y-2 text-sm">
              <p>• Text between asterisks (*action*) should appear in <span className="action-text">italic, darker styling</span></p>
              <p>• Regular text should remain unchanged</p>
              <p>• Works with or without spaces around asterisks</p>
              <p>• Multiple actions in one message are supported</p>
              <p>• Perfect for roleplay scenarios including NSFW content</p>
            </div>
          </Card>
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

export default AsteriskTestPage;
