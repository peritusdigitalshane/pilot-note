import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, BookOpen, Settings, TrendingUp, Database, Mic } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    providers: 0,
    models: 0,
    knowledgeBases: 0,
    conversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    loadStats(user.id);
  };

  const loadStats = async (userId: string) => {
    try {
      const [providers, models, knowledgeBases, conversations] = await Promise.all([
        supabase.from("llm_providers" as any).select("id", { count: "exact" }),
        supabase.from("installed_models" as any).select("id", { count: "exact" }).eq("user_id", userId),
        supabase.from("knowledge_bases" as any).select("id", { count: "exact" }).eq("created_by", userId),
        supabase.from("chat_conversations" as any).select("id", { count: "exact" }).eq("user_id", userId),
      ]);

      setStats({
        providers: providers.count || 0,
        models: models.count || 0,
        knowledgeBases: knowledgeBases.count || 0,
        conversations: conversations.count || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Start Chat",
      description: "Begin a conversation with your AI models",
      icon: MessageSquare,
      action: () => navigate("/chat"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Voice Capture",
      description: "Record and transcribe voice notes",
      icon: Mic,
      action: () => navigate("/capture"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Browse Models",
      description: "Explore and install AI models",
      icon: Bot,
      action: () => navigate("/models"),
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Knowledge Base",
      description: "Manage your documents and data",
      icon: BookOpen,
      action: () => navigate("/knowledge"),
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const statCards = [
    { label: "LLM Providers", value: stats.providers, icon: Database, color: "text-blue-500" },
    { label: "Installed Models", value: stats.models, icon: Bot, color: "text-green-500" },
    { label: "Knowledge Bases", value: stats.knowledgeBases, icon: BookOpen, color: "text-orange-500" },
    { label: "Conversations", value: stats.conversations, icon: MessageSquare, color: "text-purple-500" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Your LLM Hub
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your AI models, conversations, and knowledge base in one place
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass-card p-6 hover-scale">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="glass-card p-6 cursor-pointer hover-scale group"
              onClick={action.action}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient}`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Settings Card */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg mb-1">System Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Manage your LLM providers, user settings, and preferences
            </p>
          </div>
          <Button onClick={() => navigate("/settings")} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
