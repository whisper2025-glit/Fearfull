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
      title: "Multi-Action Sequence (CORRECT)",
      input: "*he held her up letting her down slowly then kisses her passionately*",
      description: "Multiple sequential actions within one asterisk block (REQUIRED FORMAT)"
    },
    {
      title: "Romantic Multi-Action",
      input: "*she moves closer to him then wraps her arms around his waist while looking into his eyes*",
      description: "Sequential actions connected with transition words (CORRECT)"
    },
    {
      title: "Simple Actions (WILL BE ENHANCED)",
      input: "Hello *waves* how are you *smiles* today *nods*",
      description: "Simple single-word actions that get converted to multi-action sequences"
    },
    {
      title: "Intimate Multi-Action",
      input: "*takes her hand gently then brings it to his lips before placing a soft kiss on her palm*",
      description: "Romantic sequence with connecting words (CORRECT FORMAT)"
    },
    {
      title: "Emotional Multi-Action",
      input: "*leans against the wall then slides down slowly while tears stream down her cheeks*",
      description: "Emotional sequence showing multiple connected actions (CORRECT)"
    },
    {
      title: "Complex Scene Sequence",
      input: "*pulls her close against his chest then whispers softly in her ear while stroking her hair*",
      description: "Intimate multi-action sequence (CORRECT FORMAT)"
    },
    {
      title: "Action with Dialogue",
      input: "I love you *caresses her face gently then leans in closer while maintaining eye contact* more than anything",
      description: "Multi-action sequence embedded in dialogue (CORRECT)"
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
          {/* Interactive Validation Test */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Interactive Asterisk Validation Test</h2>
            <AsteriskValidationTest />
          </div>

          {/* Asterisk Formatting Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold border-b border-border pb-2">Asterisk Action Formatting Examples</h2>
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
              <h3 className="font-semibold text-lg mb-3">✨ Multi-Action Sequence Requirements</h3>
              <div className="space-y-2 text-sm">
                <p>• <strong>MULTI-ACTION FORMAT:</strong> Text between asterisks (*action*) must contain multiple sequential actions</p>
                <p>• <span className="text-red-400">❌ FORBIDDEN:</span> Single actions like <span className="line-through">*waves* *smiles* *nods* *laughs*</span></p>
                <p>• <span className="text-green-400">✅ REQUIRED:</span> <span className="action-text">*he held her up letting her down slowly then kisses her passionately*</span></p>
                <p>• <span className="text-green-400">✅ REQUIRED:</span> <span className="action-text">*moves closer to him then wraps her arms around his waist while looking into his eyes*</span></p>
                <p>• Use connecting words: "then", "while", "before", "after", "as" to link actions</p>
                <p>• Minimum 5 words per asterisk block with 2-4 related actions</p>
                <p>• System automatically converts simple actions into multi-action sequences</p>
                <p>• Perfect for romantic, intimate, and detailed roleplay scenarios</p>
                <p>• Each asterisk block tells a mini-story of connected movements</p>
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
            <h3 className="font-semibold text-lg mb-3 text-red-400">🚫 Forbidden Single Actions</h3>
            <div className="text-sm space-y-1 text-red-300">
              <p>These single-word actions will be converted to multi-action sequences:</p>
              <div className="bg-red-950/50 p-3 rounded mt-2 font-mono text-xs">
                *waves* *smiles* *nods* *shrugs* *laughs* *sighs* *winks*<br/>
                *looks* *sits* *stands* *walks* *blushes* *giggles* *grins*<br/>
                *happy* *sad* *angry* *surprised* *confused* *excited*
              </div>
              <p className="mt-2">↓ <strong>These become:</strong> ↓</p>
              <div className="bg-green-950/50 p-3 rounded mt-2 font-mono text-xs">
                *raises her hand gracefully then moves it in a gentle wave while maintaining eye contact*<br/>
                *feels her lips curve upward then lets the warmth spread across her entire face*<br/>
                *tilts her head down slowly then brings it back up while maintaining steady eye contact*
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
