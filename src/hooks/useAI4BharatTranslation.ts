import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranslationRequest {
  text: string;
}

interface TranslationResponse {
  originalText: string;
  hinglishText: string;
  englishText: string;
}

export const useAI4BharatTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateHindiToEnglish = async ({
    text
  }: TranslationRequest): Promise<TranslationResponse | null> => {
    if (!text.trim()) {
      setError('No text provided');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'ai4bharat-translate',
        {
          body: {
            text: text.trim(),
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Translation failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as TranslationResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('AI4Bharat translation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    translateHindiToEnglish,
    isLoading,
    error,
  };
};