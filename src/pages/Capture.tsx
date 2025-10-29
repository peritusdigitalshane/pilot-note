import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Save, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Capture = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      setTranscript("");
      
      // Start duration timer
      intervalRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      
      toast.success("Recording started", {
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording", {
        description: error instanceof Error ? error.message : "Please check microphone permissions",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = async () => {
        // Stop the timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Stop all tracks
        const stream = mediaRecorderRef.current?.stream;
        stream?.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setIsProcessing(true);
        
        toast.success("Recording stopped", {
          description: "Processing your audio...",
        });
        
        // Process the audio
        await transcribeAudio();
      };
    }
  };
  
  const transcribeAudio = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        
        // Call edge function for transcription
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Data }
        });
        
        if (error) throw error;
        
        if (data?.text) {
          setTranscript(data.text);
          toast.success("Transcription complete!");
        }
        
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        toast.error("Failed to process audio");
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error("Transcription failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        const stream = mediaRecorderRef.current.stream;
        stream?.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const saveNote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save notes");
        return;
      }

      // Generate a title from the first 50 characters of transcript
      const title = transcript.slice(0, 50) + (transcript.length > 50 ? "..." : "");

      const { error } = await supabase
        .from("notes" as any)
        .insert({
          user_id: user.id,
          title: title || "Untitled Note",
          content: transcript,
          duration: duration,
        });

      if (error) throw error;

      toast.success("Note saved!", {
        description: "Your voice note has been saved",
      });
      navigate("/notes");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Voice Capture</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Record your thoughts, meetings, and ideas</p>
        </div>
      </header>

      {/* Recording Interface */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Waveform Card */}
        <Card className="glass-card p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              {isRecording && (
                <div className="absolute inset-0 bg-destructive/20 rounded-full blur-2xl animate-glow-pulse" />
              )}
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative rounded-full w-24 h-24 transition-all ${
                  isRecording
                    ? "bg-destructive hover:bg-destructive/90 shadow-2xl shadow-destructive/50"
                    : "bg-gradient-to-br from-primary to-secondary hover:shadow-2xl hover:shadow-primary/50"
                }`}
              >
                {isRecording ? (
                  <Square className="w-10 h-10" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-5xl font-mono font-bold">{formatTime(duration)}</p>
              <p className="text-muted-foreground">
                {isProcessing 
                  ? "Processing audio..." 
                  : isRecording 
                  ? "Recording in progress..." 
                  : "Tap to start recording"}
              </p>
            </div>
          </div>

          {/* Waveform Visualization */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 h-20">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-glow-pulse"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Transcript Card */}
        {transcript && (
          <Card className="glass-card p-6 space-y-4 animate-slide-in">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-glow-pulse" />
              Live Transcript
            </h3>
            <p className="text-foreground/90 leading-relaxed">{transcript}</p>
          </Card>
        )}

        {/* Actions */}
        {!isRecording && duration > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 glass-card"
              variant="outline"
              size="lg"
              onClick={() => {
                setDuration(0);
                setTranscript("");
                toast("Recording discarded");
              }}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              Discard
            </Button>
            <Button
              className="flex-1 bg-gradient-to-br from-primary to-secondary hover:shadow-xl"
              size="lg"
              onClick={saveNote}
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              Save Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capture;
