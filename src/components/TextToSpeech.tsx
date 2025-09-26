import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useChitralekha } from '@/hooks/useChitralekha';
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
  const { generateVoiceover, isGeneratingVoiceover } = useChitralekha();

  const speak = useCallback((text: string, lang: string, setPlaying: (playing: boolean) => void) => {
    if (!text?.trim()) return;
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const getBestVoice = (l: string): SpeechSynthesisVoice | null => {
        const voices = window.speechSynthesis.getVoices();
        const exact = voices.find(v => v.lang?.toLowerCase() === l.toLowerCase());
        if (exact) return exact;
        // Prefer Indian English for Hinglish, then general English
        if (l.startsWith('en')) {
          return (
            voices.find(v => v.lang?.startsWith('en-IN')) ||
            voices.find(v => v.lang?.startsWith('en-GB')) ||
            voices.find(v => v.lang?.startsWith('en-US')) ||
            voices.find(v => v.lang?.startsWith('en')) ||
            null
          );
        }
        return voices.find(v => v.lang?.startsWith(l.split('-')[0])) || null;
      };

      // Wait a bit for the cancel to take effect
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = lang.startsWith('en-IN') ? 0.9 : 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        const assignVoiceAndSpeak = () => {
          const voice = getBestVoice(lang);
          if (voice) utterance.voice = voice;
          window.speechSynthesis.speak(utterance);
        };

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
            assignVoiceAndSpeak();
          }, { once: true });
        } else {
          assignVoiceAndSpeak();
        }
      }, 100);
    } else {
      console.error('Speech synthesis not supported');
    }
  }, []);

  const speakWithChitralekha = useCallback(async (text: string, lang: string, setPlaying: (playing: boolean) => void) => {
    if (!text?.trim()) return;
    
    setPlaying(true);
    
    try {
      const result = await generateVoiceover({
        text,
        language: lang,
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
      });

      if (result && result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {
          console.warn('Chitralekha audio failed, falling back to browser TTS');
          speak(text, lang, setPlaying);
        };
        await audio.play();
      } else {
        // Fallback to browser TTS
        speak(text, lang, setPlaying);
      }
    } catch (error) {
      console.warn('Chitralekha TTS failed, falling back to browser TTS:', error);
      speak(text, lang, setPlaying);
    }
  }, [generateVoiceover, speak]);

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
                  speakWithChitralekha(hinglishText, 'hi_Latn', setIsPlayingHinglish);
                }
              }}
              variant={isPlayingHinglish || isGeneratingVoiceover ? "recording" : "gradient"}
              disabled={isGeneratingVoiceover}
              className="w-full"
            >
              {isGeneratingVoiceover ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Generating...
                </>
              ) : isPlayingHinglish ? (
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
                  speakWithChitralekha(targetText, 'en', setIsPlayingTarget);
                }
              }}
              variant={isPlayingTarget || isGeneratingVoiceover ? "recording" : "gradient"}
              disabled={isGeneratingVoiceover}
              className="w-full"
            >
              {isGeneratingVoiceover ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Generating...
                </>
              ) : isPlayingTarget ? (
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