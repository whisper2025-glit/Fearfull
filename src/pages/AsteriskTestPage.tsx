import React from 'react';
import { MessageFormatter } from '@/components/MessageFormatter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AsteriskValidationTest from '@/components/AsteriskValidationTest';

const AsteriskTestPage = () => {
  const navigate = useNavigate();

  const asteriskTestCases = [
    {
      title: "Complex Emotional Action",
      input: "*he held her hand as she passed away in his arms*",
      description: "Long, complex emotional action description (ALLOWED)"
    },
    {
      title: "Passionate/Intimate Action",
      input: "*he kisses her neck passionately trailing upwards to find her lips in a passionate kiss*",
      description: "Detailed passionate action with multiple movements (ALLOWED)"
    },
    {
      title: "Simple Actions (FILTERED OUT)",
      input: "Hello *waves* how are you *smiles* today *nods*",
      description: "Simple actions that get enhanced or removed by the system"
    },
    {
      title: "Enhanced Simple Actions",
      input: "She looked at him *smiles* then *laughs* at his joke",
      description: "Shows how simple actions get enhanced into complex ones"
    },
    {
      title: "Mixed Complex Actions",
      input: "She whispered his name*running her fingers through his hair as their eyes met in profound connection*then pulled him closer*their hearts beating as one in perfect synchronization*",
      description: "Multiple complex actions in sequence (ALLOWED)"
    },
    {
      title: "NSFW Detailed Scene",
      input: "She moaned softly*pressing her body closer against his as he caressed her curves with reverent touch*their passion growing*breathing heavily as they moved together in perfect harmony of desire*",
      description: "Adult content with detailed action formatting (ALLOWED)"
    },
    {
      title: "Emotional Complexity",
      input: "I'm sorry*tears streaming down her face as overwhelming guilt and regret crash over her like relentless waves*I never meant for this to happen*voice breaking with raw emotion and desperate vulnerability*",
      description: "Complex emotional expressions and physical reactions (ALLOWED)"
    }
  ];

  const imageTestCases = [
    {
      title: "Basic Image with Action",
      input: "Look at this beautiful sunset! ![Sunset over mountains](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&crop=center) *points toward the horizon with wonder in her eyes*",
      description: "Combines markdown image with complex action formatting"
    },
    {
      title: "Multiple Images in Conversation",
      input: "Found these amazing places today: ![Coffee shop](https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&h=200&fit=crop) *takes a sip of coffee* and ![Library](https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop) *runs fingers along the book spines lovingly*",
      description: "Multiple images with actions in a single message"
    },
    {
      title: "Image with Emotional Context",
      input: "*pulls out phone with trembling hands* This was the last photo we took together... ![Happy couple](https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=350&h=250&fit=crop) *tears welling up as precious memories flood back*",
      description: "Emotional storytelling combining images and complex actions"
    },
    {
      title: "Broken Image Test",
      input: "Here's what I was talking about: ![Broken image example](https://invalid-url-that-will-fail.com/image.jpg) *waits for your reaction*",
      description: "Tests graceful fallback for broken/invalid image URLs"
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
          <h1 className="text-2xl font-bold">Message Formatting Test</h1>
        </div>

        <div className="space-y-8">
          {/* Asterisk Formatting Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Asterisk Action Formatting</h2>
            {asteriskTestCases.map((testCase, index) => (
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
          </div>

          {/* Markdown Image Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Markdown Image Support</h2>
            {imageTestCases.map((testCase, index) => (
              <Card key={`image-${index}`} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{testCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{testCase.description}</p>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Raw Input:</span>
                    <code className="block bg-muted/50 p-3 rounded mt-1 text-sm font-mono overflow-x-auto">
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
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-lg mb-3">✨ Complex Action Requirements</h3>
              <div className="space-y-2 text-sm">
                <p>• <strong>ONLY COMPLEX ACTIONS ALLOWED:</strong> Text between asterisks (*action*) must be detailed and passionate</p>
                <p>• <span className="text-red-400">❌ FORBIDDEN:</span> Simple actions like <span className="line-through">*waves* *smiles* *nods* *laughs*</span></p>
                <p>• <span className="text-green-400">✅ REQUIRED:</span> <span className="action-text">*tears streaming down her face as overwhelming emotion crashes over her*</span></p>
                <p>• <span className="text-green-400">✅ REQUIRED:</span> <span className="action-text">*he kisses her neck passionately trailing upwards to find her lips*</span></p>
                <p>• Minimum 8 words per action with emotional depth or sensory details</p>
                <p>• System automatically enhances or removes simple actions</p>
                <p>• Perfect for passionate, intimate, and NSFW roleplay scenarios</p>
                <p>• Works in chat messages, suggestions modal, and all roleplay responses</p>
                <p>• AI models trained to generate only complex actions</p>
              </div>
            </Card>

            <Card className="p-6 bg-accent/5 border-accent/20">
              <h3 className="font-semibold text-lg mb-3">🖼️ Markdown Image Features</h3>
              <div className="space-y-2 text-sm">
                <p>• <strong>Syntax:</strong> <code className="bg-muted px-1 py-0.5 rounded text-xs">![alt text](image_url)</code></p>
                <p>• <span className="text-green-400">✅ FEATURES:</span> Auto-resize, hover effects, shadow styling</p>
                <p>• <span className="text-green-400">✅ FALLBACK:</span> Graceful handling of broken images</p>
                <p>• <span className="text-green-400">✅ RESPONSIVE:</span> Maximum 400px height, full width scaling</p>
                <p>• <span className="text-green-400">✅ ANIMATION:</span> Smooth loading with fade-in effect</p>
                <p>• <span className="text-green-400">✅ ACCESSIBLE:</span> Alt text support for screen readers</p>
                <p>• Works seamlessly with asterisk action formatting</p>
                <p>• Perfect for roleplay scenes, character references, locations</p>
                <p>• Compatible with all chat messages and responses</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-red-900/20 border-red-500/20">
            <h3 className="font-semibold text-lg mb-3 text-red-400">🚫 Forbidden Simple Actions</h3>
            <div className="text-sm space-y-1 text-red-300">
              <p>These actions are completely banned and will be enhanced or removed:</p>
              <div className="bg-red-950/50 p-3 rounded mt-2 font-mono text-xs">
                *waves* *smiles* *nods* *shrugs* *laughs* *sighs* *winks*<br/>
                *looks* *sits* *stands* *walks* *blushes* *giggles* *grins*<br/>
                *happy* *sad* *angry* *surprised* *confused* *excited*
              </div>
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
