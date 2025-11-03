import { Link, useNavigate } from "react-router-dom";
import { Mic, Brain, Database, Settings, Sparkles, MessageSquare, LogIn, Shield, Store, Users, Chrome, Download, FlaskConical, FileText } from "lucide-react";
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
    // Load user's documents count
    const { count: docsCount } = await supabase
      .from("knowledge_base_documents" as any)
      .select("*", { count: "exact", head: true })
      .eq("created_by", userId);

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

    // Load user's recent documents only
    const { data: notes } = await supabase
      .from("knowledge_base_documents" as any)
      .select("id, title, created_at")
      .eq("created_by", userId)
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
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      {/* Not authenticated message */}
      {!isAuthenticated && (
        <Card className="p-8 text-center max-w-2xl mx-auto border-2 border-dashed">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Welcome to FullPilot</h3>
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
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Documents</h2>
                <Link to="/knowledge">
                  <Button variant="ghost" size="sm">
                    View All →
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                {recentNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{note.title}</h3>
                        <p className="text-xs text-muted-foreground">{note.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Access Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <Link to="/chat">
                <Card className="p-6 hover:shadow-md transition-shadow text-center space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-primary" />
                  <p className="font-medium text-sm">Chat</p>
                </Card>
              </Link>
              <Link to="/capture">
                <Card className="p-6 hover:shadow-md transition-shadow text-center space-y-2">
                  <Mic className="w-8 h-8 mx-auto text-primary" />
                  <p className="font-medium text-sm">Record</p>
                </Card>
              </Link>
              <Link to="/knowledge">
                <Card className="p-6 hover:shadow-md transition-shadow text-center space-y-2">
                  <Database className="w-8 h-8 mx-auto text-primary" />
                  <p className="font-medium text-sm">Knowledge</p>
                </Card>
              </Link>
              <Link to="/models">
                <Card className="p-6 hover:shadow-md transition-shadow text-center space-y-2">
                  <Brain className="w-8 h-8 mx-auto text-primary" />
                  <p className="font-medium text-sm">Models</p>
                </Card>
              </Link>
              <Link to="/notes">
                <Card className="p-6 hover:shadow-md transition-shadow text-center space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-primary" />
                  <p className="font-medium text-sm">Notes</p>
                </Card>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
