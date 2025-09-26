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
    const { text, language, voice = 'default', speed = 1.0, pitch = 1.0 } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    if (!language) {
      throw new Error('Language is required');
    }

    console.log('Chitralekha voice-over request:', { text, language, voice, speed, pitch });

    // Use AI4Bharat TTS API for voice-over generation
    const response = await fetch('https://api.ai4bharat.org/tts/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('AI4BHARAT_API_KEY') || ''}`,
      },
      body: JSON.stringify({
        text: text,
        language: language,
        voice: voice,
        speed: speed,
        pitch: pitch,
        format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Chitralekha TTS API error:', errorText);
      
      // Fallback to browser's built-in speech synthesis
      return new Response(
        JSON.stringify({
          audioUrl: null,
          duration: 0,
          text: text,
          fallback: true,
          message: 'Using browser speech synthesis as fallback',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    console.log('Chitralekha TTS response:', result);

    // Extract audio URL and duration from response
    const audioUrl = result.audio_url || result.url;
    const duration = result.duration || 0;

    if (!audioUrl) {
      throw new Error('No audio URL returned from TTS service');
    }

    return new Response(
      JSON.stringify({
        audioUrl,
        duration,
        text,
        fallback: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chitralekha-voiceover function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        audioUrl: null,
        duration: 0,
        text: '',
        fallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});