import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, BookOpen, Settings, TrendingUp, Database, Mic, Users, Chrome, Download } from "lucide-react";

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
      title: "Voice Notes",
      description: "View your recorded voice transcriptions",
      icon: BookOpen,
      action: () => navigate("/notes"),
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      title: "Voice Capture",
      description: "Record and transcribe voice notes",
      icon: Mic,
      action: () => navigate("/capture"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Prompt Marketplace",
      description: "Share and discover AI prompts with your team",
      icon: Bot,
      action: () => navigate("/prompt-marketplace"),
      gradient: "from-rose-500 to-pink-500",
    },
    {
      title: "My Custom Models",
      description: "Create AI models with your own prompts",
      icon: Bot,
      action: () => navigate("/custom-models"),
      gradient: "from-indigo-500 to-violet-500",
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
    {
      title: "Organisations",
      description: "Create and manage teams for sharing",
      icon: Users,
      action: () => navigate("/organizations"),
      gradient: "from-indigo-500 to-purple-500",
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Chrome Extension Card */}
      <Card className="glass-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Chrome className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              Get the Chrome Extension
              <span className="text-xs font-normal bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                New!
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access your prompt packs anywhere on the web! Use your prompts with ChatGPT, Claude, or any AI tool directly from your browser.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open('https://github.com/yourusername/prompt-marketplace-extension/archive/main.zip', '_blank')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Extension
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const instructions = `
Chrome Extension Installation Instructions:

1. Download the extension files using the "Download Extension" button
2. Extract the ZIP file to a folder on your computer
3. Open Chrome and go to: chrome://extensions/
4. Enable "Developer mode" (toggle in top-right corner)
5. Click "Load unpacked"
6. Select the extracted "chrome-extension" folder
7. The extension icon will appear in your toolbar!

Features:
✓ Login with your existing account
✓ View all installed prompt packs  
✓ Search and copy prompts instantly
✓ Works on any website

Note: For the extension to work properly, you'll need placeholder icon files. Check the README in the chrome-extension folder for details.
                  `.trim();
                  
                  navigator.clipboard.writeText(instructions);
                  alert('Installation instructions copied to clipboard!');
                }}
              >
                📋 Copy Instructions
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
