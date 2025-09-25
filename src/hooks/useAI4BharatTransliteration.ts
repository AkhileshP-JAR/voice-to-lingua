import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TransliterationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

interface TransliterationResponse {
  transliteratedText: string;
  originalText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export const useAI4BharatTransliteration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transliterate = async ({
    text,
    sourceLanguage = 'hi',
    targetLanguage = 'en'
  }: TransliterationRequest): Promise<TransliterationResponse | null> => {
    if (!text.trim()) {
      setError('No text provided');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'ai4bharat-transliterate',
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

      return data as TransliterationResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transliteration failed';
      setError(errorMessage);
      console.error('AI4Bharat transliteration error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transliterate,
    isLoading,
    error,
  };
};