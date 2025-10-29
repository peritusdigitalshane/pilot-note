import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Plus, MessageSquare, Mic, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VoiceInterface } from "@/components/VoiceInterface";

type InstalledModel = {
  id: string;
  name: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    loadInstalledModels(user.id);
    loadConversations(user.id);
  };

  const loadConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_conversations" as any)
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading conversations:", error);
    } else if (data) {
      setConversations(data as any);
    }
  };

  const loadInstalledModels = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_models" as any)
      .select(`
        model_id,
        fullpilot_models!inner (
          id,
          name
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error loading models:", error);
    } else if (data && data.length > 0) {
      const models = data.map((item: any) => ({
        id: item.fullpilot_models.id,
        name: item.fullpilot_models.name,
      })) as unknown as InstalledModel[];
      setInstalledModels(models);
      if (models.length > 0) {
        setSelectedModelId(models[0].id);
        setSelectedModel(models[0]);
      }
    }
  };

  const loadConversation = async (convId: string) => {
    setConversationId(convId);
    setMessages([]);

    const { data, error } = await supabase
      .from("chat_messages" as any)
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      toast({ title: "Error", description: "Failed to load conversation", variant: "destructive" });
    } else if (data) {
      setMessages(data as any);
    }
  };

  const startNewConversation = async () => {
    if (!selectedModelId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_conversations" as any)
      .insert({
        user_id: user.id,
        model_id: selectedModelId,
        title: "New Conversation",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return;
    }

    if (data) {
      setConversationId((data as any).id);
      setMessages([]);
      loadConversations(user.id);
    }
  };

  const handleVoiceTranscript = async (text: string, isUser: boolean) => {
    if (!conversationId) {
      await startNewConversation();
    }

    const message: Message = {
      id: `voice-${Date.now()}-${isUser ? 'user' : 'ai'}`,
      role: isUser ? 'user' : 'assistant',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, message]);

    if (conversationId) {
      await supabase.from("chat_messages" as any).insert({
        conversation_id: conversationId,
        role: message.role,
        content: text,
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedModelId || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    // Create conversation if it doesn't exist
    let currentConvId = conversationId;
    if (!currentConvId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conv } = await supabase
        .from("chat_conversations" as any)
        .insert({
          user_id: user.id,
          model_id: selectedModelId,
          title: userMessage.slice(0, 50),
        })
        .select()
        .single();

      if (conv) {
        currentConvId = (conv as any).id;
        setConversationId((conv as any).id);
      }
    }

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Save user message to database
    if (currentConvId) {
      await supabase.from("chat_messages" as any).insert({
        conversation_id: currentConvId,
        role: 'user',
        content: userMessage,
      });
    }

    try {
      // Call chat edge function
      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          modelId: selectedModelId,
          messages: [...messages, tempUserMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `temp-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      if (currentConvId) {
        await supabase.from("chat_messages" as any).insert({
          conversation_id: currentConvId,
          role: 'assistant',
          content: data.message,
        });

        // Reload conversations to update the list
        const { data: { user } } = await supabase.auth.getUser();
        if (user) loadConversations(user.id);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from("chat_conversations" as any)
        .delete()
        .eq("id", convId);

      if (error) throw error;

      // Clear current conversation if it's the one being deleted
      if (conversationId === convId) {
        setConversationId(null);
        setMessages([]);
      }

      // Reload conversations
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadConversations(user.id);

      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-xl font-bold">Chat</h1>
            {installedModels.length > 0 && (
              <Select value={selectedModelId} onValueChange={(value) => {
                setSelectedModelId(value);
                const model = installedModels.find(m => m.id === value);
                setSelectedModel(model || null);
                setMessages([]);
                setConversationId(null);
              }}>
                <SelectTrigger className="w-[250px] glass-card">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {installedModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <Button onClick={startNewConversation} variant="outline" className="glass-card">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat History */}
        <div className="w-80 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-sm text-muted-foreground">Recent Chats</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group relative"
                >
                  <Button
                    variant={conversationId === conv.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto py-3 px-3 pr-12"
                    onClick={() => loadConversation(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => deleteConversation(conv.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No conversations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'voice')} className="flex-1 flex flex-col">
            <div className="border-b border-border/50 px-6 pt-4">
              <TabsList className="glass-card">
                <TabsTrigger value="text">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Text Chat
                </TabsTrigger>
                <TabsTrigger value="voice">
                  <Mic className="w-4 h-4 mr-2" />
                  Voice Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="text" className="flex-1 flex flex-col overflow-hidden m-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
          {installedModels.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No models installed. Install a model to start chatting.
              </p>
              <Button onClick={() => navigate("/models")}>
                Browse Models
              </Button>
            </Card>
          ) : messages.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground">
                Start a conversation with your AI model
              </p>
            </Card>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'glass-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </Card>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <Card className="glass-card p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </Card>
            </div>
          )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          {installedModels.length > 0 && (
            <div className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="max-w-4xl mx-auto p-6">
                <div className="flex gap-4 items-end">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="glass-card resize-none min-h-[60px] max-h-[200px]"
                    rows={1}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    size="icon"
                    className="h-[60px] w-[60px] flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="voice" className="flex-1 flex flex-col overflow-hidden m-0">
          <div className="flex-1 flex items-center justify-center p-6">
            {installedModels.length > 0 ? (
              <div className="max-w-2xl w-full space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Voice Conversation</h2>
                  <p className="text-muted-foreground">
                    Have a natural voice conversation with {selectedModel?.name || 'your AI model'}
                  </p>
                </div>
                <VoiceInterface 
                  systemPrompt="You are a helpful AI assistant. Be conversational and friendly."
                  voice="alloy"
                  onTranscript={handleVoiceTranscript}
                />
                {messages.length > 0 && (
                  <Card className="glass-card p-4 max-h-[300px] overflow-y-auto">
                    <h3 className="font-semibold mb-3">Conversation History</h3>
                    <div className="space-y-2">
                      {messages.slice(-5).map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary/10'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {message.role === 'user' ? 'You' : 'AI'}
                          </p>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="glass-card p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No models installed. Install a model to start voice conversations.
                </p>
                <Button onClick={() => navigate("/models")}>
                  Browse Models
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Chat;