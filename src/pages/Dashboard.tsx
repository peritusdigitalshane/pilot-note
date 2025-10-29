import { Link } from "react-router-dom";
import { Mic, Brain, Database, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const recentNotes = [
    { id: 1, title: "Product Strategy Meeting", date: "2 hours ago", duration: "12:34" },
    { id: 2, title: "Customer Interview Notes", date: "5 hours ago", duration: "8:21" },
    { id: 3, title: "Weekly Team Sync", date: "Yesterday", duration: "15:42" },
  ];

  const stats = [
    { label: "Total Notes", value: "127", icon: Database },
    { label: "Hours Captured", value: "42.5", icon: Mic },
    { label: "Models Active", value: "3", icon: Brain },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            FullPilot
          </h1>
          <p className="text-muted-foreground mt-2">
            Because you don't need a co when you can handle it all.
          </p>
        </div>
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="glass-card">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>
      </header>

      {/* Quick Capture */}
      <div className="flex justify-center">
        <Link to="/capture" className="group">
          <div className="glass-card p-8 hover:scale-105 transition-transform">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-glow-pulse" />
                <Button 
                  size="lg"
                  className="relative rounded-full w-20 h-20 bg-gradient-to-br from-primary to-secondary hover:shadow-2xl hover:shadow-primary/50 transition-all"
                >
                  <Mic className="w-8 h-8" />
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Start Recording</h3>
                <p className="text-sm text-muted-foreground">Tap to capture voice notes</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Notes */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Notes</h2>
          <Link to="/knowledge">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All →
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <Card key={note.id} className="p-4 bg-card/50 hover:bg-card/70 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-muted-foreground">{note.date}</p>
                </div>
                <span className="text-sm text-primary font-mono">{note.duration}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/knowledge">
          <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
            <Database className="w-8 h-8 mx-auto text-primary" />
            <p className="font-medium">Knowledge Base</p>
          </Card>
        </Link>
        <Link to="/models">
          <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
            <Brain className="w-8 h-8 mx-auto text-secondary" />
            <p className="font-medium">Models</p>
          </Card>
        </Link>
        <Link to="/capture">
          <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
            <Mic className="w-8 h-8 mx-auto text-primary" />
            <p className="font-medium">Record</p>
          </Card>
        </Link>
        <Link to="/settings">
          <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
            <Settings className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-medium">Settings</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
