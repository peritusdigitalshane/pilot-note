import { Link, useNavigate } from "react-router-dom";
import { Mic, Brain, Database, Settings, Sparkles, MessageSquare, LogIn, Shield, Store, Users, Chrome, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalNotes: 0,
    hoursRecorded: 0,
    modelsActive: 0
  });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsAuthenticated(!!session);
      
      // Check if user is super admin and load data
      if (session?.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "super_admin")
          .maybeSingle();
        
        setIsSuperAdmin(!!roles);
        await loadDashboardData(session.user.id);
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      // Check if user is super admin and load data
      if (session?.user) {
        setTimeout(async () => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "super_admin")
            .maybeSingle();
          
          setIsSuperAdmin(!!roles);
          await loadDashboardData(session.user.id);
        }, 0);
      } else {
        setIsSuperAdmin(false);
        setStats({ totalNotes: 0, hoursRecorded: 0, modelsActive: 0 });
        setRecentNotes([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadDashboardData = async (userId: string) => {
    // Load total documents count
    const { count: docsCount } = await supabase
      .from("knowledge_base_documents" as any)
      .select("*", { count: "exact", head: true });

    // Load user's installed models count
    const { count: modelsCount } = await supabase
      .from("user_models" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Load user's conversations count (as a proxy for hours)
    const { count: conversationsCount } = await supabase
      .from("chat_conversations" as any)
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setStats({
      totalNotes: docsCount || 0,
      hoursRecorded: conversationsCount || 0,
      modelsActive: modelsCount || 0
    });

    // Load recent notes
    const { data: notes } = await supabase
      .from("knowledge_base_documents" as any)
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (notes) {
      setRecentNotes(notes.map((note: any) => ({
        id: note.id,
        title: note.title,
        date: formatDate(note.created_at)
      })));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const statsDisplay = [
    { label: "Total Documents", value: stats.totalNotes.toString(), icon: Database },
    { label: "Conversations", value: stats.hoursRecorded.toString(), icon: Mic },
    { label: "Models Installed", value: stats.modelsActive.toString(), icon: Brain },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
            FullPilot
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Because you don't need a co when you can handle it all.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!loading && (
            isAuthenticated ? (
              <>
                {isSuperAdmin && (
                  <Link to="/users">
                    <Button variant="ghost" size="icon" className="glass-card">
                      <Shield className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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

          {/* Stats - Only show when authenticated */}
      {isAuthenticated && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statsDisplay.map((stat, i) => (
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
          {recentNotes.length > 0 && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recent Documents</h2>
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Chrome Extension Highlight */}
          <Card className="glass-card p-6 hover:scale-105 transition-transform border-2 border-purple-500/20 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <span className="text-xs font-semibold bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30">
                New!
              </span>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl" />
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Chrome className="w-12 h-12 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-2">Chrome Extension</h3>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Access your prompt packs anywhere on the web! Use your prompts with ChatGPT, Claude, or any AI tool. Record voice notes on the go.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => window.open('https://github.com/yourusername/prompt-marketplace-extension/archive/main.zip', '_blank')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-transform"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Extension
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const instructions = `Chrome Extension Installation:

1. Download extension files using "Download Extension" button
2. Extract the ZIP file
3. Open Chrome → chrome://extensions/
4. Enable "Developer mode" (top-right toggle)
5. Click "Load unpacked"
6. Select the "chrome-extension" folder
7. Extension icon appears in toolbar!

Features:
✓ Login with your account
✓ View installed prompt packs
✓ Record & transcribe voice notes
✓ Search and copy prompts
✓ Works on any website

Note: Create placeholder icon files (icon16.png, icon48.png, icon128.png) - see README for details.`;
                    
                    navigator.clipboard.writeText(instructions);
                    alert('Installation instructions copied to clipboard!');
                  }}
                  className="hover:scale-105 transition-transform"
                >
                  📋 Copy Instructions
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
            <Link to="/notes">
              <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-teal-500" />
                <p className="font-medium">Voice Notes</p>
              </Card>
            </Link>
            <Link to="/organizations">
              <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
                <Users className="w-8 h-8 mx-auto text-indigo-500" />
                <p className="font-medium">Organisations</p>
              </Card>
            </Link>
            <Link to="/prompt-marketplace">
              <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
                <Store className="w-8 h-8 mx-auto text-rose-500" />
                <p className="font-medium">Prompt Marketplace</p>
              </Card>
            </Link>
            <Link to="/capture">
              <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
                <Mic className="w-8 h-8 mx-auto text-primary" />
                <p className="font-medium">Record</p>
              </Card>
            </Link>
            {isSuperAdmin && (
              <Link to="/settings">
                <Card className="glass-card p-6 hover:scale-105 transition-transform text-center space-y-2">
                  <Settings className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="font-medium">Settings</p>
                </Card>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
