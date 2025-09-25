import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('AI4Bharat transliteration request:', { text });

    // AI4Bharat IndicTransliterate API call
    const response = await fetch('https://api.ai4bharat.org/transliterate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AI4BHARAT_API_KEY')}`,
      },
      body: JSON.stringify({
        input: text,
        source_language: "hi",
        target_language: "hi_Latn",
        context: "generic",
        topk: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI4Bharat API error:', errorText);
      throw new Error(`AI4Bharat API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('AI4Bharat response:', result);

    // Extract transliterated text from response
    const transliteratedText = result.output || result.transliterated_text || text;

    return new Response(
      JSON.stringify({ 
        transliteratedText,
        originalText: text
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai4bharat-transliterate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        transliteratedText: '' // Fallback to empty string
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});