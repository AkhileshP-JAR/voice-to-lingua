import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Play, Square, Volume2 } from 'lucide-react';

interface TextToSpeechProps {
  hinglishText: string;
  targetText: string;
  targetLanguage: string;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
  hinglishText,
  targetText,
  targetLanguage
}) => {
  const [isPlayingHinglish, setIsPlayingHinglish] = useState(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  const speak = useCallback((text: string, lang: string, setPlaying: (playing: boolean) => void) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait a bit for the cancel to take effect
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log('Speech started');
          setPlaying(true);
        };
        utterance.onend = () => {
          console.log('Speech ended');
          setPlaying(false);
        };
        utterance.onerror = (error) => {
          console.error('Speech error:', error);
          setPlaying(false);
        };
        
        // Ensure voices are loaded before speaking
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            window.speechSynthesis.speak(utterance);
          }, { once: true });
        } else {
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
    } else {
      console.error('Speech synthesis not supported');
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlayingHinglish(false);
    setIsPlayingTarget(false);
  }, []);

  if (!hinglishText && !targetText) return null;

  return (
    <Card className="w-full max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Text to Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hinglishText && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Hinglish</p>
            <Button
              onClick={() => {
                if (isPlayingHinglish) {
                  stopSpeaking();
                } else {
                  speak(hinglishText, 'en-IN', setIsPlayingHinglish);
                }
              }}
              variant={isPlayingHinglish ? "recording" : "gradient"}
              className="w-full"
            >
              {isPlayingHinglish ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Hinglish
                </>
              )}
            </Button>
          </div>
        )}

        {targetText && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{targetLanguage}</p>
            <Button
              onClick={() => {
                if (isPlayingTarget) {
                  stopSpeaking();
                } else {
                  speak(targetText, 'en-US', setIsPlayingTarget);
                }
              }}
              variant={isPlayingTarget ? "recording" : "gradient"}
              className="w-full"
            >
              {isPlayingTarget ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play {targetLanguage}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};