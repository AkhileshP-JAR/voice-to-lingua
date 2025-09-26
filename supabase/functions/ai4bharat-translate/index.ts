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

    // Use IndicTrans2 for both translations to avoid the failing transliterate endpoint
    const apiKey = Deno.env.get('AI4BHARAT_API_KEY') || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
    };

    const endpoint = 'https://indictrans2-api.ai4bharat.org/translate';

    const bodyHiToEn = {
      input: [text],
      source_language: 'hi',
      target_language: 'en',
      domain: 'general',
    };

    const bodyHiToLatin = {
      input: [text],
      source_language: 'hi',
      target_language: 'hi_Latn',
      domain: 'general',
    };

    const safeExtract = (obj: any): string | null => {
      try {
        if (!obj) return null;
        const tryKeys = (o: any): string | null => {
          const keys = ['output', 'target', 'translated_text', 'translation', 'text'];
          for (const k of keys) {
            const v = o?.[k];
            if (typeof v === 'string') return v;
            if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
            if (Array.isArray(v) && v[0] && typeof v[0] === 'object') {
              for (const kk of ['target', 'translated_text', 'translation', 'text']) {
                if (typeof v[0][kk] === 'string') return v[0][kk];
              }
            }
          }
          return null;
        };
        if (typeof obj === 'string') return obj;
        const direct = tryKeys(obj);
        if (direct) return direct;
        if (obj && typeof obj === 'object') {
          for (const key of Object.keys(obj)) {
            const candidate = tryKeys(obj[key]);
            if (candidate) return candidate;
          }
        }
      } catch (_e) {}
      return null;
    };

    // Perform both translations in parallel for speed
    const [enRes, latnRes] = await Promise.all([
      fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(bodyHiToEn) }),
      fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(bodyHiToLatin) }),
    ]);

    let englishText = '';
    let hinglishText = '';

    if (!enRes.ok) {
      const errText = await enRes.text();
      console.error('IndicTrans2 hi->en API error:', enRes.status, errText);
    } else {
      const enJson = await enRes.json();
      console.log('IndicTrans2 hi->en response:', enJson);
      englishText = safeExtract(enJson) || '';
    }

    if (!latnRes.ok) {
      const errText = await latnRes.text();
      console.error('IndicTrans2 hi->hi_Latn API error:', latnRes.status, errText);
    } else {
      const latnJson = await latnRes.json();
      console.log('IndicTrans2 hi->hi_Latn response:', latnJson);
      hinglishText = safeExtract(latnJson) || '';
    }

    if (!englishText && !hinglishText) {
      throw new Error('Translation failed: no outputs returned');
    }

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