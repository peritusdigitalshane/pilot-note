import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2, Clock, Mic, Calendar } from "lucide-react";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string | null;
  content: string;
  duration: number;
  created_at: string;
  updated_at: string;
};

type GroupedNotes = {
  [key: string]: Note[];
};

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notes" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotes(data as any || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;

    try {
      const { error } = await supabase
        .from("notes" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Note deleted");
      loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const groupByDate = (notes: Note[]): GroupedNotes => {
    return notes.reduce((groups: GroupedNotes, note) => {
      const date = new Date(note.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {});
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const groupedNotes = groupByDate(notes);

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Voice Notes</h1>
            <p className="text-sm text-muted-foreground">Your recorded voice transcriptions</p>
          </div>
          <Button onClick={() => navigate("/capture")} className="glass-card">
            <Mic className="w-4 h-4 mr-2" />
            New Recording
          </Button>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto p-8">
        {notes.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mic className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                No notes yet. Record your first voice note to get started.
              </p>
              <Button onClick={() => navigate("/capture")}>
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotes).map(([date, dayNotes]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-muted-foreground">{date}</h2>
                </div>
                <div className="space-y-3">
                  {dayNotes.map((note) => (
                    <Card key={note.id} className="glass-card hover-scale">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold mb-1">
                              {note.title || "Untitled Note"}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(note.created_at).toLocaleTimeString()}
                              </span>
                              {note.duration > 0 && (
                                <span className="flex items-center gap-1">
                                  <Mic className="w-3 h-3" />
                                  {formatDuration(note.duration)}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                          {note.content}
                        </p>
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

export default Notes;
