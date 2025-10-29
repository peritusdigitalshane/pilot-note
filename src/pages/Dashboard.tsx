import { Link, useNavigate } from "react-router-dom";
import { Mic, Brain, Database, Settings, Sparkles, MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

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
        <div className="flex items-center gap-2">
          {!loading && (
            isAuthenticated ? (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="glass-card">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleSignOut} className="glass-card">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="glass-card">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </header>

      {/* Quick Actions */}
      {isAuthenticated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link to="/chat" className="group">
            <div className="glass-card p-8 hover:scale-105 transition-transform h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-glow-pulse" />
                  <Button 
                    size="lg"
                    className="relative rounded-full w-20 h-20 bg-gradient-to-br from-primary to-secondary hover:shadow-2xl hover:shadow-primary/50 transition-all"
                  >
                    <MessageSquare className="w-8 h-8" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Chat with AI</h3>
                  <p className="text-sm text-muted-foreground">Start a conversation with your models</p>
                </div>
              </div>
            </div>
          </Link>
          
          <Link to="/capture" className="group">
            <div className="glass-card p-8 hover:scale-105 transition-transform h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-glow-pulse" />
                  <Button 
                    size="lg"
                    className="relative rounded-full w-20 h-20 bg-gradient-to-br from-secondary to-primary hover:shadow-2xl hover:shadow-secondary/50 transition-all"
                  >
                    <Mic className="w-8 h-8" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Record Voice</h3>
                  <p className="text-sm text-muted-foreground">Capture voice notes and transcribe</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <Card className="glass-card p-12 text-center max-w-2xl mx-auto">
          <MessageSquare className="w-16 h-16 text-primary/50 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Welcome to FullPilot</h3>
          <p className="text-muted-foreground mb-6">
            Sign in to start chatting with AI models, record voice notes, and manage your knowledge base
          </p>
          <Link to="/auth">
            <Button size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </Link>
        </Card>
      )}

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
