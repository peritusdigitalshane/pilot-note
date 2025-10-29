import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Tag, Clock, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Knowledge = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const notes = [
    {
      id: 1,
      title: "Product Strategy Meeting",
      summary: "Discussed Q1 roadmap, prioritized user authentication features, and set sprint goals.",
      tags: ["product", "strategy", "roadmap"],
      date: "2024-01-15",
      duration: "12:34",
    },
    {
      id: 2,
      title: "Customer Interview - Sarah Chen",
      summary: "Pain points around data export functionality. Wants CSV and API access. High priority.",
      tags: ["customer", "interview", "feature-request"],
      date: "2024-01-15",
      duration: "8:21",
    },
    {
      id: 3,
      title: "Weekly Team Sync",
      summary: "Sprint retrospective, velocity review, and next sprint planning. Team morale high.",
      tags: ["team", "sprint", "retrospective"],
      date: "2024-01-14",
      duration: "15:42",
    },
    {
      id: 4,
      title: "Design Review - New Dashboard",
      summary: "Reviewed mockups for analytics dashboard. Feedback: simplify navigation, add dark mode.",
      tags: ["design", "ui", "dashboard"],
      date: "2024-01-14",
      duration: "9:17",
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-sm text-muted-foreground">
              Your personal AI-powered second brain
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search notes semantically or by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 glass-card border-primary/30 focus:border-primary"
          />
        </div>
      </header>

      {/* Stats Bar */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">{notes.length} notes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-muted-foreground">12 tags</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-muted-foreground">42.5 hours</span>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="glass-card p-6 space-y-4 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{note.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {note.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {note.duration}
                </span>
                <span>{note.date}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">
                <Brain className="w-3 h-3 mr-1" />
                Ask AI
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Knowledge;
