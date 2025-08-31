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
      title: "Complex Emotional Action",
      input: "*he held her hand as she passed away in his arms*",
      description: "Long, complex emotional action description"
    },
    {
      title: "Passionate/Intimate Action",
      input: "*he kisses her neck passionately trailing upwards to find her lips in a passionate kiss*",
      description: "Detailed passionate action with multiple movements"
    },
    {
      title: "Mixed Complex Actions",
      input: "She whispered his name*running her fingers through his hair as their eyes met*then pulled him closer*their hearts beating as one*",
      description: "Multiple complex actions in sequence"
    },
    {
      title: "Simple vs Complex",
      input: "He smiled*waves excitedly*then*slowly approaches her, taking her hand gently and bringing it to his lips for a tender kiss*goodbye",
      description: "Comparison between simple and complex actions"
    },
    {
      title: "NSFW Detailed Scene",
      input: "She moaned softly*pressing her body closer against his as he caressed her curves*their passion growing*breathing heavily as they moved together in perfect harmony*",
      description: "Adult content with detailed action formatting"
    },
    {
      title: "Emotional Complexity",
      input: "I'm sorry*tears streaming down her face as she struggles to find the words*I never meant for this to happen*voice breaking with emotion*",
      description: "Complex emotional expressions and physical reactions"
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
              <p>• Works perfectly for simple actions: <span className="action-text">*waves excitedly*</span></p>
              <p>• Handles complex descriptions: <span className="action-text">*he held her hand as she passed away in his arms*</span></p>
              <p>• Supports passionate scenes: <span className="action-text">*he kisses her neck passionately trailing upwards*</span></p>
              <p>• Regular text should remain unchanged</p>
              <p>• Works with or without spaces around asterisks</p>
              <p>• Multiple actions in one message are supported</p>
              <p>• Perfect for roleplay scenarios including NSFW content</p>
              <p>• Now works in suggestions modal too!</p>
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
