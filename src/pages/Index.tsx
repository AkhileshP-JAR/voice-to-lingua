import React, { useState } from 'react';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { TextToSpeech } from '@/components/TextToSpeech';
import { ChitralekhaEditor } from '@/components/ChitralekhaEditor';
import { useAI4BharatTranslation } from '@/hooks/useAI4BharatTranslation';
import { 
  Camera, 
  MessageCircle, 
  Radio, 
  FileText, 
  Monitor, 
  Captions,
  Settings,
  ArrowLeftRight,
  Mic,
  Play,
  X,
  ChevronLeft
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [originalText, setOriginalText] = useState('');
  const [hinglishText, setHinglishText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const { translateHindiToEnglish, isLoading: isTranslating } = useAI4BharatTranslation();

  const handleTranscription = async (text: string) => {
    console.log('Received transcription:', text);
    setOriginalText(text);
    
    // Use AI4Bharat chained API: Hindi → Hinglish → English
    const translationResult = await translateHindiToEnglish({ text });
    
    let hinglishResult = '';
    let englishResult = '';
    
    if (translationResult) {
      hinglishResult = translationResult.hinglishText;
      englishResult = translationResult.englishText;
    } else {
      // If API fails, do not substitute with original Hindi (avoids TTS issues)
      console.error('AI4Bharat translation failed');
      hinglishResult = '';
      englishResult = '';
    }
    
    setHinglishText(hinglishResult);
    setTargetText(englishResult);
    setShowTranslation(true);
  };

  const handleShowEditor = () => {
    setShowEditor(true);
  };

  const featureCards = [
    { icon: Camera, title: "Camera", color: "from-blue-500 to-blue-600" },
    { icon: MessageCircle, title: "Conversation", color: "from-green-500 to-green-600" },
    { icon: Radio, title: "Live", color: "from-purple-500 to-purple-600" },
    { icon: FileText, title: "Document", color: "from-cyan-500 to-cyan-600" },
  ];

  if (showEditor) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowEditor(false)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Chitralekha Editor</h1>
          <div className="w-10" />
        </div>

        {/* Chitralekha Editor */}
        <div className="p-4">
          <ChitralekhaEditor
            initialText={originalText}
            sourceLanguage="hi"
            onTextChange={(text) => setOriginalText(text)}
            onTransliterationChange={(transliterated) => setHinglishText(transliterated)}
          />
        </div>
      </div>
    );
  }

  if (showTranslation && originalText) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowTranslation(false)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Text</h1>
          <div className="w-10" />
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 p-6">
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <span className="text-sm font-medium">English</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <span className="text-sm font-medium">Hindi</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Translation Cards */}
        <div className="p-4 space-y-4">
          <Card className="p-6 border-2 border-primary/20">
            <div className="flex items-start justify-between mb-4">
              <p className="text-lg leading-relaxed flex-1">{originalText}</p>
              <Button variant="ghost" size="icon" className="ml-2">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary/20">
                <Play className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Mic className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-lg leading-relaxed text-primary mb-4">
                {targetText || hinglishText || 'Translation unavailable.'}
              </p>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary/20">
                  <Play className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShowEditor}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4a1 1 0 011-1h4m0 0V1m0 2h2m-6 4v12a1 1 0 001 1h12a1 1 0 001-1V8H4z" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Text to Speech Component */}
        <div className="p-4">
          <TextToSpeech
            hinglishText={hinglishText}
            targetText={targetText}
            targetLanguage="English"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Translate</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-6 w-6" />
        </Button>
      </div>

      {/* Subtitle */}
      <div className="px-4 pb-6">
        <p className="text-muted-foreground">Communication across languages</p>
      </div>

      {/* Main Translation Input */}
      <div className="p-4">
        <Card className="border-2 border-primary/20 min-h-[200px]">
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1">
                  <span className="text-sm font-medium">EN</span>
                  <ArrowLeftRight className="h-3 w-3" />
                  <span className="text-sm font-medium">HI</span>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20">
                  <Mic className="h-6 w-6" />
                </Button>
              </div>
              
              {!originalText ? (
                <div className="min-h-[120px] flex items-center">
                  <p className="text-muted-foreground text-lg">Enter text to translate</p>
                </div>
              ) : (
                <div className="min-h-[120px]">
                  <TranscriptionDisplay
                    originalText={originalText}
                    hinglishText={hinglishText}
                    targetText={targetText}
                    targetLanguage="English"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recording Component */}
      <div className="p-4">
        <AudioRecorder 
          onTranscription={handleTranscription}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      </div>

      {/* Feature Cards */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {featureCards.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${feature.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium">{feature.title}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Screen</h3>
              <p className="text-sm text-muted-foreground">Browse pages in your native language as screen content is translated in real time.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600">
              <Captions className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium">Live captions</h3>
              <p className="text-sm text-muted-foreground">Attend meetings and watch videos with real-time bilingual captions.</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={handleShowEditor}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Chitralekha Editor</h3>
              <p className="text-sm text-muted-foreground">Advanced transliteration and voice-over editing with AI4Bharat Chitralekha.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;