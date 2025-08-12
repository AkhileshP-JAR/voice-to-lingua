import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Mic, MicOff, Play, Square } from 'lucide-react';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscription, 
  isRecording, 
  setIsRecording 
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const setupSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          onTranscription(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscription]);

  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      if (isRecording) {
        updateAudioLevel();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      await setupAudioVisualization();
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [setupAudioVisualization, setIsRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setAudioLevel(0);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, [setIsRecording]);

  useEffect(() => {
    setupSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [setupSpeechRecognition]);

  return (
    <Card className="w-full max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="space-y-6">
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "recording" : "gradient"}
              size="lg"
              className={`rounded-full w-20 h-20 transition-all duration-300 ${
                isRecording ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{
                transform: isRecording ? `scale(${1.1 + audioLevel * 0.2})` : undefined,
              }}
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
            
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isRecording ? 'Recording...' : 'Start Recording'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRecording 
                ? 'Speak clearly for best results' 
                : 'Click to record your voice'
              }
            </p>
          </div>
          
          {isRecording && (
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full gradient-accent transition-all duration-150"
                style={{ width: `${Math.max(10, audioLevel * 100)}%` }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};