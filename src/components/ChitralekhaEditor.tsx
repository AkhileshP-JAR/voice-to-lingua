import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { useChitralekha } from '@/hooks/useChitralekha';
import { Languages, Volume2, Edit3, Play, Pause, Download } from 'lucide-react';

interface ChitralekhaEditorProps {
  initialText?: string;
  sourceLanguage?: string;
  onTextChange?: (text: string) => void;
  onTransliterationChange?: (transliterated: string) => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', script: 'Devanagari' },
  { code: 'hi_Latn', name: 'Hindi (Roman)', script: 'Latin' },
  { code: 'en', name: 'English', script: 'Latin' },
  { code: 'bn', name: 'Bengali', script: 'Bengali' },
  { code: 'ta', name: 'Tamil', script: 'Tamil' },
  { code: 'te', name: 'Telugu', script: 'Telugu' },
  { code: 'ml', name: 'Malayalam', script: 'Malayalam' },
  { code: 'kn', name: 'Kannada', script: 'Kannada' },
  { code: 'gu', name: 'Gujarati', script: 'Gujarati' },
  { code: 'pa', name: 'Punjabi', script: 'Gurmukhi' },
  { code: 'or', name: 'Odia', script: 'Odia' },
  { code: 'as', name: 'Assamese', script: 'Assamese' },
];

export const ChitralekhaEditor: React.FC<ChitralekhaEditorProps> = ({
  initialText = '',
  sourceLanguage = 'hi',
  onTextChange,
  onTransliterationChange,
}) => {
  const [sourceText, setSourceText] = useState(initialText);
  const [transliteratedText, setTransliteratedText] = useState('');
  const [selectedSourceLang, setSelectedSourceLang] = useState(sourceLanguage);
  const [selectedTargetLang, setSelectedTargetLang] = useState('hi_Latn');
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const {
    transliterate,
    generateVoiceover,
    isTransliterating,
    isGeneratingVoiceover,
    error,
  } = useChitralekha();

  const handleSourceTextChange = useCallback((text: string) => {
    setSourceText(text);
    onTextChange?.(text);
  }, [onTextChange]);

  const handleTransliterate = useCallback(async () => {
    if (!sourceText.trim()) return;

    const result = await transliterate({
      text: sourceText,
      sourceLanguage: selectedSourceLang,
      targetLanguage: selectedTargetLang,
    });

    if (result) {
      setTransliteratedText(result.transliteratedText);
      onTransliterationChange?.(result.transliteratedText);
    }
  }, [sourceText, selectedSourceLang, selectedTargetLang, transliterate, onTransliterationChange]);

  const handleGenerateVoiceover = useCallback(async (text: string, language: string) => {
    if (!text.trim()) return;

    const result = await generateVoiceover({
      text,
      language,
      voice: 'default',
      speed: 1.0,
      pitch: 1.0,
    });

    if (result) {
      setVoiceoverUrl(result.audioUrl);
    }
  }, [generateVoiceover]);

  const handlePlayPause = useCallback(() => {
    if (!voiceoverUrl) return;

    if (isPlaying && audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      if (audioElement) {
        audioElement.play();
      } else {
        const audio = new Audio(voiceoverUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplay = () => setIsPlaying(true);
        setAudioElement(audio);
        audio.play();
      }
      setIsPlaying(true);
    }
  }, [voiceoverUrl, isPlaying, audioElement]);

  const handleDownloadAudio = useCallback(() => {
    if (!voiceoverUrl) return;
    
    const link = document.createElement('a');
    link.href = voiceoverUrl;
    link.download = 'voiceover.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [voiceoverUrl]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Chitralekha Editor
          <Badge variant="secondary">AI4Bharat</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transliteration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transliteration" className="flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Transliteration
            </TabsTrigger>
            <TabsTrigger value="voiceover" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Voice-over
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transliteration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Language</label>
                <Select value={selectedSourceLang} onValueChange={setSelectedSourceLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.script})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Language</label>
                <Select value={selectedTargetLang} onValueChange={setSelectedTargetLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.script})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Text</label>
                <Textarea
                  value={sourceText}
                  onChange={(e) => handleSourceTextChange(e.target.value)}
                  placeholder="Enter text to transliterate..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={handleTransliterate}
                disabled={isTransliterating || !sourceText.trim()}
                className="w-full"
                variant="gradient"
              >
                {isTransliterating ? 'Transliterating...' : 'Transliterate'}
              </Button>

              {transliteratedText && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transliterated Text</label>
                  <Textarea
                    value={transliteratedText}
                    onChange={(e) => setTransliteratedText(e.target.value)}
                    className="min-h-[120px] resize-none bg-secondary/50"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="voiceover" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text for Voice-over</label>
                <Textarea
                  value={transliteratedText || sourceText}
                  onChange={(e) => {
                    if (transliteratedText) {
                      setTransliteratedText(e.target.value);
                    } else {
                      handleSourceTextChange(e.target.value);
                    }
                  }}
                  placeholder="Enter text for voice-over generation..."
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleGenerateVoiceover(
                    transliteratedText || sourceText,
                    transliteratedText ? selectedTargetLang : selectedSourceLang
                  )}
                  disabled={isGeneratingVoiceover || !(transliteratedText || sourceText).trim()}
                  variant="gradient"
                  className="flex-1"
                >
                  {isGeneratingVoiceover ? 'Generating...' : 'Generate Voice-over'}
                </Button>
              </div>

              {voiceoverUrl && (
                <Card className="p-4 bg-secondary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handlePlayPause}
                        variant="outline"
                        size="sm"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <span className="text-sm text-muted-foreground">Voice-over ready</span>
                    </div>
                    <Button
                      onClick={handleDownloadAudio}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};