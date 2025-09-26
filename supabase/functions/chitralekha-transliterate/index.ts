const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    if (!sourceLanguage || !targetLanguage) {
      throw new Error('Source and target languages are required');
    }

    console.log('Chitralekha transliteration request:', { text, sourceLanguage, targetLanguage });

    // Use AI4Bharat IndicXlit API for transliteration
    const response = await fetch('https://api.ai4bharat.org/indicxlit/transliterate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AI4BHARAT_API_KEY') || ''}`,
      },
      body: JSON.stringify({
        input: text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        context: "generic",
        topk: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chitralekha API error:', errorText);
      
      // Fallback to simple character mapping for common cases
      let fallbackText = text;
      if (sourceLanguage === 'hi' && targetLanguage === 'hi_Latn') {
        // Simple Hindi to Roman transliteration fallback
        const hindiToRoman: Record<string, string> = {
          'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
          'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
          'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
          'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
          'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
          'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
          'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
          'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
          'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
          '्': '', 'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
          'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h',
        };
        
        fallbackText = text.split('').map(char => hindiToRoman[char] || char).join('');
      }
      
      return new Response(
        JSON.stringify({
          transliteratedText: fallbackText,
          originalText: text,
          confidence: 0.5, // Lower confidence for fallback
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    console.log('Chitralekha response:', result);

    // Extract transliterated text from response
    const transliteratedText = result.output?.[0] || result.transliterated_text || text;
    const confidence = result.confidence || 0.9;

    return new Response(
      JSON.stringify({
        transliteratedText,
        originalText: text,
        confidence,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chitralekha-transliterate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        transliteratedText: '',
        originalText: '',
        confidence: 0,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});