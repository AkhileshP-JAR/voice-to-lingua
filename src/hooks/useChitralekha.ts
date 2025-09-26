import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChitralekhaTransliterationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

interface ChitralekhaTransliterationResponse {
  transliteratedText: string;
  originalText: string;
  confidence: number;
}

interface ChitralekhaVoiceoverRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

interface ChitralekhaVoiceoverResponse {
  audioUrl: string;
  duration: number;
  text: string;
}

export const useChitralekha = () => {
  const [isTransliterating, setIsTransliterating] = useState(false);
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transliterate = useCallback(async ({
    text,
    sourceLanguage,
    targetLanguage
  }: ChitralekhaTransliterationRequest): Promise<ChitralekhaTransliterationResponse | null> => {
    if (!text.trim()) {
      setError('No text provided for transliteration');
      return null;
    }

    setIsTransliterating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'chitralekha-transliterate',
        {
          body: {
            text: text.trim(),
            sourceLanguage,
            targetLanguage,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Transliteration failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as ChitralekhaTransliterationResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      console.error('Chitralekha transliteration error:', err);
      return null;
    } finally {
      setIsTransliterating(false);
    }
  }, []);

  const generateVoiceover = useCallback(async ({
    text,
    language,
    voice = 'default',
    speed = 1.0,
    pitch = 1.0
  }: ChitralekhaVoiceoverRequest): Promise<ChitralekhaVoiceoverResponse | null> => {
    if (!text.trim()) {
      setError('No text provided for voice-over generation');
      return null;
    }

    setIsGeneratingVoiceover(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'chitralekha-voiceover',
        {
          body: {
            text: text.trim(),
            language,
            voice,
            speed,
            pitch,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Voice-over generation failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as ChitralekhaVoiceoverResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice-over generation failed';
      setError(errorMessage);
      console.error('Chitralekha voice-over error:', err);
      return null;
    } finally {
      setIsGeneratingVoiceover(false);
    }
  }, []);

  return {
    transliterate,
    generateVoiceover,
    isTransliterating,
    isGeneratingVoiceover,
    error,
  };
};