import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trash2, User, Bot, Calendar } from "lucide-react";
import { toast } from "sonner";

type Transcription = {
  id: string;
  transcript_text: string;
  is_user: boolean;
  created_at: string;
  conversation_id: string | null;
};

type GroupedTranscriptions = {
  [key: string]: Transcription[];
};

const Transcriptions = () => {
  const navigate = useNavigate();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTranscriptions();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("transcriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTranscriptions(data as any || []);
    } catch (error) {
      console.error("Error loading transcriptions:", error);
      toast.error("Failed to load transcriptions");
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscription = async (id: string) => {
    if (!confirm("Delete this transcription?")) return;

    try {
      const { error } = await supabase
        .from("transcriptions" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Transcription deleted");
      loadTranscriptions();
    } catch (error) {
      console.error("Error deleting transcription:", error);
      toast.error("Failed to delete transcription");
    }
  };

  const groupByDate = (transcriptions: Transcription[]): GroupedTranscriptions => {
    return transcriptions.reduce((groups: GroupedTranscriptions, transcript) => {
      const date = new Date(transcript.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transcript);
      return groups;
    }, {});
  };

  const groupedTranscriptions = groupByDate(transcriptions);

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">Voice Transcriptions</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">View your conversation history</p>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto p-4 sm:p-8">
        {transcriptions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground text-center mb-4">
                No transcriptions yet. Start a voice conversation to see your transcriptions here.
              </p>
              <Button onClick={() => navigate("/chat")}>
                Go to Chat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTranscriptions).map(([date, dayTranscriptions]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
                </div>
                <div className="space-y-2">
                  {dayTranscriptions.map((transcript) => (
                    <Card key={transcript.id} className="glass-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {transcript.is_user ? (
                              <User className="w-4 h-4 text-primary" />
                            ) : (
                              <Bot className="w-4 h-4 text-secondary" />
                            )}
                            <CardTitle className="text-sm font-medium">
                              {transcript.is_user ? "You" : "AI Assistant"}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(transcript.created_at).toLocaleTimeString()}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTranscription(transcript.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{transcript.transcript_text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transcriptions;
