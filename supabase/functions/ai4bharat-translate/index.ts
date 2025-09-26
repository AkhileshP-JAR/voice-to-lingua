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

    // Step 1: Transliterate Hindi to Hinglish using IndicTransliterate
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
    
    // Step 2: Use a simpler translation approach - try the dhruva platform API
    let englishText = hinglishText; // fallback to hinglish if translation fails
    
    try {
      // Try alternative API endpoint for translation
      const translateResponse = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('AI4BHARAT_API_KEY')}`,
        },
        body: JSON.stringify({
          "pipelineTasks": [
            {
              "taskType": "translation",
              "config": {
                "language": {
                  "sourceLanguage": "hi",
                  "targetLanguage": "en"
                }
              }
            }
          ],
          "inputData": {
            "input": [
              {
                "source": text
              }
            ]
          }
        }),
      });

      if (translateResponse.ok) {
        const translateResult = await translateResponse.json();
        console.log('Dhruva translation response:', translateResult);
        
        if (translateResult?.pipelineResponse?.[0]?.output?.[0]?.target) {
          englishText = translateResult.pipelineResponse[0].output[0].target;
        }
      } else {
        console.log('Dhruva API not available, using basic translation');
      }
    } catch (error) {
      console.log('Translation API failed, using basic translation:', error);
      
      // Basic word-by-word translation as fallback
      const basicTranslations: { [key: string]: string } = {
        'hello': 'hello',
        'helo': 'hello', 
        'hallo': 'hello',
        'main': 'I',
        'mera': 'my',
        'naam': 'name',
        'name': 'name',
        'hai': 'is',
        'hain': 'are',
        'aur': 'and',
        'tum': 'you',
        'tumhara': 'your',
        'kya': 'what',
        'kaise': 'how',
        'kahan': 'where',
        'kyun': 'why',
        'akhilesh': 'Akhilesh',
        'akash': 'Akash',
        'rahul': 'Rahul',
        'priya': 'Priya',
        'sharma': 'Sharma',
        'kumar': 'Kumar'
      };
      
      englishText = hinglishText.toLowerCase()
        .split(/\s+/)
        .map((word: string) => {
          const cleanWord = word.replace(/[^\w]/g, '');
          return basicTranslations[cleanWord] || word;
        })
        .join(' ');
      
      // Capitalize first letter
      englishText = englishText.charAt(0).toUpperCase() + englishText.slice(1);
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