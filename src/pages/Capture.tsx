import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Save, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Capture = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");

  const startRecording = () => {
    setIsRecording(true);
    setDuration(0);
    setTranscript("");
    // Simulate recording duration
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    // Simulate transcript streaming
    setTimeout(() => {
      setTranscript("Hello, this is a test recording...");
    }, 2000);
    setTimeout(() => {
      setTranscript("Hello, this is a test recording... We're discussing the new product features and timeline.");
    }, 4000);
    return () => clearInterval(interval);
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast.success("Recording stopped", {
      description: "Your voice note has been captured",
    });
  };

  const saveNote = () => {
    toast.success("Note saved!", {
      description: "Added to your knowledge base with AI-generated summary",
    });
    navigate("/knowledge");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Voice Capture</h1>
          <p className="text-sm text-muted-foreground">Record your thoughts, meetings, and ideas</p>
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
                {isRecording ? "Recording in progress..." : "Tap to start recording"}
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
          <div className="flex gap-3">
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
              <X className="w-5 h-5 mr-2" />
              Discard
            </Button>
            <Button
              className="flex-1 bg-gradient-to-br from-primary to-secondary hover:shadow-xl"
              size="lg"
              onClick={saveNote}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Capture;
