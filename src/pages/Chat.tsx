import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
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
      setSelectedModelId(models[0].id);
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="container max-w-4xl mx-auto space-y-4">
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
          <div className="container max-w-4xl mx-auto p-6">
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
    </div>
  );
};

export default Chat;