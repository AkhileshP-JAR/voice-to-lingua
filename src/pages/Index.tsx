import React, { useState } from 'react';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptionDisplay } from '@/components/TranscriptionDisplay';
import { TextToSpeech } from '@/components/TextToSpeech';
import { hindiToHinglish, englishToHinglish, translateToEnglish } from '@/utils/transliteration';
import { Languages, Mic } from 'lucide-react';

const Index = () => {
  const [originalText, setOriginalText] = useState('');
  const [hinglishText, setHinglishText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleTranscription = (text: string) => {
    setOriginalText(text);
    
    // Generate Hinglish version
    const hinglish = text.includes('अ') || text.includes('आ') || text.includes('इ') || text.includes('ई') 
      ? hindiToHinglish(text) 
      : englishToHinglish(text);
    setHinglishText(hinglish);
    
    // Generate English translation
    const english = translateToEnglish(hinglish);
    setTargetText(english);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-full gradient-primary">
                  <Languages className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  VoiceScript
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Transform your voice into multiple languages with AI-powered transliteration. 
                Speak naturally and get instant Hinglish and English conversions.
              </p>
            </div>
            
            <div className="float-animation">
              <AudioRecorder 
                onTranscription={handleTranscription}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Results */}
      {originalText && (
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-8">
            <TranscriptionDisplay
              originalText={originalText}
              hinglishText={hinglishText}
              targetText={targetText}
              targetLanguage="English"
            />
            
            <div className="flex justify-center">
              <TextToSpeech
                hinglishText={hinglishText}
                targetText={targetText}
                targetLanguage="English"
              />
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Record</h3>
              <p className="text-muted-foreground">
                Click the microphone and speak in Hindi, English, or any supported language
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full gradient-secondary flex items-center justify-center">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Transform</h3>
              <p className="text-muted-foreground">
                AI instantly converts your speech to Hinglish and target language
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full gradient-accent flex items-center justify-center">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold">Listen</h3>
              <p className="text-muted-foreground">
                Play back the converted text in natural-sounding voices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;