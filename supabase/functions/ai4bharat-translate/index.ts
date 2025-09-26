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
    const { text } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    console.log('AI4Bharat translation request:', { text });

    // Step 1: Translate Hindi to English using IndicTrans2
    const translateResponse = await fetch('https://indictrans2-api.ai4bharat.org/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AI4BHARAT_API_KEY')}`,
      },
      body: JSON.stringify({
        input: [text],
        source_language: "hi",
        target_language: "en",
        domain: "general"
      }),
    });

    if (!translateResponse.ok) {
      const errorText = await translateResponse.text();
      console.error('IndicTrans2 API error:', errorText);
      throw new Error(`IndicTrans2 API error: ${translateResponse.status} - ${errorText}`);
    }

    const translateResult = await translateResponse.json();
    console.log('IndicTrans2 response:', translateResult);

    // Extract translated text
    const englishText = Array.isArray(translateResult.output) 
      ? translateResult.output[0] 
      : translateResult.output || text;
    
    // Step 2: Transliterate Hindi to Hinglish using IndicTransliterate
    const transliterateResponse = await fetch('https://api.ai4bharat.org/transliterate', {
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

    if (!transliterateResponse.ok) {
      const errorText = await transliterateResponse.text();
      console.error('IndicTransliterate API error:', errorText);
      throw new Error(`IndicTransliterate API error: ${transliterateResponse.status} - ${errorText}`);
    }

    const transliterateResult = await transliterateResponse.json();
    console.log('IndicTransliterate response:', transliterateResult);

    // Extract transliterated text
    const hinglishText = transliterateResult.output || transliterateResult.transliterated_text || text;

    return new Response(
      JSON.stringify({ 
        originalText: text,
        hinglishText,
        englishText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai4bharat-translate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        originalText: '',
        hinglishText: '',
        englishText: ''
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});