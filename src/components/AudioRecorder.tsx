import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Mic, Square } from 'lucide-react';

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
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const maxRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SILENCE_THRESHOLD = 0.03; // 0..1 normalized level below which we consider silence
  const SILENCE_DURATION_MS = 2000; // how long silence must persist to auto-stop
  const MAX_RECORDING_DURATION_MS = 30000; // Maximum 30 seconds recording time

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

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    setIsRecording(false);
    setAudioLevel(0);
    silenceStartRef.current = null;

    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }, [setIsRecording]);

  const setupAudioVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          // Use time domain data for better silence detection
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteTimeDomainData(dataArray);
          
          // Calculate RMS (Root Mean Square) for better audio level detection
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const sample = (dataArray[i] - 128) / 128; // Convert to -1 to 1 range
            sum += sample * sample;
          }
          const rms = Math.sqrt(sum / dataArray.length);
          const normalized = Math.min(rms * 2, 1); // Scale and clamp to 0-1
          
          setAudioLevel(normalized);

          // Debug logging
          console.log('Audio level (RMS):', normalized.toFixed(3), 'Silence start:', silenceStartRef.current);

          if (normalized < SILENCE_THRESHOLD) {
            const now = performance.now();
            if (silenceStartRef.current == null) {
              silenceStartRef.current = now;
              console.log('Silence started at:', now);
            } else if (now - silenceStartRef.current >= SILENCE_DURATION_MS) {
              console.log('Silence duration reached, stopping recording');
              stopRecording();
              return;
            }
          } else {
            if (silenceStartRef.current !== null) {
              console.log('Audio detected, resetting silence timer');
            }
            silenceStartRef.current = null;
          }
          
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      if (isRecording) {
        updateAudioLevel();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [isRecording, stopRecording]);

  const startRecording = useCallback(async () => {
    try {
      console.log('Starting recording...');
      setIsRecording(true);
      silenceStartRef.current = null;
      await setupAudioVisualization();
      
      // Set maximum recording time
      maxRecordingTimerRef.current = setTimeout(() => {
        console.log('Maximum recording time reached, stopping...');
        stopRecording();
      }, MAX_RECORDING_DURATION_MS);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [setupAudioVisualization, setIsRecording, stopRecording]);

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