import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Plus, MessageSquare, Mic, Trash2, BookOpen, ChevronDown, Search, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
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

type PromptPackItem = {
  id: string;
  title: string;
  prompt_text: string;
  order_index: number;
};

type PromptPack = {
  id: string;
  name: string;
  description: string;
  prompt_pack_items: PromptPackItem[];
};

type ChatDocument = {
  id: string;
  title: string;
  file_type: string;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [promptPacks, setPromptPacks] = useState<PromptPack[]>([]);
  const [expandedPacks, setExpandedPacks] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [promptSearch, setPromptSearch] = useState("");
  const [chatDocuments, setChatDocuments] = useState<ChatDocument[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    loadPromptPacks(user.id);
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

  const loadPromptPacks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_installed_packs" as any)
        .select(`
          pack_id,
          prompt_packs!inner (
            id,
            name,
            description,
            prompt_pack_items:prompt_pack_items(
              id,
              title,
              prompt_text,
              order_index
            )
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

      const packs = ((data as any[]) || []).map((item: any) => ({
        ...item.prompt_packs,
        prompt_pack_items: (item.prompt_packs.prompt_pack_items || []).sort(
          (a: any, b: any) => a.order_index - b.order_index
        ),
      }));

      setPromptPacks(packs);
    } catch (error) {
      console.error("Error loading prompt packs:", error);
    }
  };

  const loadInstalledModels = async (userId: string) => {
    try {
      // Load both admin-installed models, user custom models, and marketplace installed items
      const [adminModelsRes, customModelsRes, marketplaceRes] = await Promise.all([
        supabase
          .from("user_models" as any)
          .select(`
            model_id,
            fullpilot_models!inner (
              id,
              name
            )
          `)
          .eq("user_id", userId),
        supabase
          .from("user_custom_models" as any)
          .select("id, name, is_active")
          .eq("user_id", userId)
          .eq("is_active", true),
        supabase
          .from("marketplace_installs" as any)
          .select(`
            marketplace_items!inner (
              id,
              name
            )
          `)
          .eq("user_id", userId)
      ]);

      const models: InstalledModel[] = [];

      // Add admin models
      if (adminModelsRes.data && adminModelsRes.data.length > 0) {
        const adminModels = adminModelsRes.data.map((item: any) => ({
          id: item.fullpilot_models.id,
          name: item.fullpilot_models.name,
        }));
        models.push(...adminModels);
      }

      // Add custom models
      if (customModelsRes.data && customModelsRes.data.length > 0) {
        const customModels = customModelsRes.data.map((item: any) => ({
          id: `custom-${item.id}`,
          name: `${item.name} (Custom)`,
          customModelId: item.id,
        }));
        models.push(...customModels);
      }

      // Add marketplace installed items
      if (marketplaceRes.data && marketplaceRes.data.length > 0) {
        const marketplaceModels = marketplaceRes.data.map((item: any) => ({
          id: `marketplace-${item.marketplace_items.id}`,
          name: `${item.marketplace_items.name} (Marketplace)`,
          marketplaceItemId: item.marketplace_items.id,
        }));
        models.push(...marketplaceModels);
      }

      setInstalledModels(models);
      if (models.length > 0) {
        setSelectedModelId(models[0].id);
        setSelectedModel(models[0]);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const loadConversation = async (convId: string) => {
    setConversationId(convId);
    setMessages([]);
    setChatDocuments([]);

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

    // Load documents for this conversation
    loadChatDocuments(convId);
  };

  const loadChatDocuments = async (convId: string) => {
    const { data, error } = await supabase
      .from("chat_documents" as any)
      .select("id, title, file_type, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading chat documents:", error);
    } else if (data) {
      setChatDocuments(data as any);
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
      setChatDocuments([]);
      loadConversations(user.id);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
          title: file.name,
        })
        .select()
        .single();

      if (conv) {
        currentConvId = (conv as any).id;
        setConversationId((conv as any).id);
      }
    }

    if (!currentConvId) return;

    setUploadingFile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-documents')
        .getPublicUrl(filePath);

      // Create document record
      const { data: doc, error: docError } = await supabase
        .from("chat_documents" as any)
        .insert({
          conversation_id: currentConvId,
          user_id: user.id,
          title: file.name,
          file_url: publicUrl,
          file_type: file.type,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Parse document
      const { error: parseError } = await supabase.functions.invoke('parse-document', {
        body: {
          fileUrl: filePath,  // Use path within bucket, not public URL
          documentId: (doc as any).id,
          isChat: true,
        },
      });

      if (parseError) {
        console.error('Parse error:', parseError);
        toast({ title: "Warning", description: "File uploaded but parsing failed", variant: "destructive" });
      }

      // Generate embeddings
      const { error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: {
          documentId: (doc as any).id,
          isChat: true,
        },
      });

      if (embeddingError) {
        console.error('Embedding error:', embeddingError);
        toast({ title: "Warning", description: "File uploaded but embedding generation failed", variant: "destructive" });
      }

      loadChatDocuments(currentConvId);
      toast({ title: "Success", description: "Document uploaded and processed" });

    } catch (error) {
      console.error("Error uploading file:", error);
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteChatDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from("chat_documents" as any)
        .delete()
        .eq("id", docId);

      if (error) throw error;

      setChatDocuments(prev => prev.filter(d => d.id !== docId));
      toast({ title: "Success", description: "Document removed" });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({ title: "Error", description: "Failed to delete document", variant: "destructive" });
    }
  };

  const handleVoiceTranscript = async (text: string, isUser: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      // Save to chat messages
      await supabase.from("chat_messages" as any).insert({
        conversation_id: conversationId,
        role: message.role,
        content: text,
      });

      // Save to transcriptions
      await supabase.from("transcriptions" as any).insert({
        user_id: user.id,
        conversation_id: conversationId,
        transcript_text: text,
        is_user: isUser,
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

    // Add empty assistant message that we'll stream into
    const assistantMessageId = `temp-${Date.now()}-assistant`;
    const emptyAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, emptyAssistantMessage]);

    try {
      // Stream response from edge function
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://krdwypftyokqsffxoobk.supabase.co/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            modelId: selectedModelId,
            conversationId: currentConvId,
            messages: [...messages, tempUserMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                let content = '';

                // Handle OpenAI format
                if (parsed.choices?.[0]?.delta?.content) {
                  content = parsed.choices[0].delta.content;
                }
                // Handle Anthropic format
                else if (parsed.delta?.text) {
                  content = parsed.delta.text;
                }

                if (content) {
                  accumulatedContent += content;
                  // Update the assistant message with accumulated content
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }

      // Save complete assistant message to database
      if (currentConvId && accumulatedContent) {
        await supabase.from("chat_messages" as any).insert({
          conversation_id: currentConvId,
          role: 'assistant',
          content: accumulatedContent,
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

  const insertPrompt = (promptText: string) => {
    setInput(promptText);
    toast({
      title: "Prompt inserted",
      description: "You can edit it before sending",
    });
  };

  const togglePackExpansion = (packId: string) => {
    setExpandedPacks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(packId)) {
        newSet.delete(packId);
      } else {
        newSet.add(packId);
      }
      return newSet;
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
        <div className="container flex h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="glass-card flex-shrink-0 md:hidden"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold hidden sm:block">Chat</h1>
            {installedModels.length > 0 && (
              <Select value={selectedModelId} onValueChange={(value) => {
                setSelectedModelId(value);
                const model = installedModels.find(m => m.id === value);
                setSelectedModel(model || null);
                setMessages([]);
                setConversationId(null);
              }}>
                <SelectTrigger className="w-full sm:w-[200px] md:w-[250px] glass-card">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {installedModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            <Button onClick={() => navigate("/notes")} variant="outline" size="sm" className="glass-card hidden lg:flex">
              <MessageSquare className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">Notes</span>
            </Button>
            <Button onClick={() => navigate("/transcriptions")} variant="outline" size="sm" className="glass-card hidden sm:flex">
              <BookOpen className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">Transcriptions</span>
            </Button>
            <Button onClick={startNewConversation} variant="outline" size="sm" className="glass-card">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Chat History */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 absolute md:relative inset-y-0 left-0 z-40 w-80 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden flex flex-col transition-transform duration-300`}>
          <Tabs defaultValue="chats" className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between mb-2 md:hidden">
                <h2 className="font-semibold">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <TabsList className="w-full glass-card">
                <TabsTrigger value="chats" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chats
                </TabsTrigger>
                <TabsTrigger value="prompts" className="flex-1">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Prompts
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="chats" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
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
            </TabsContent>

            <TabsContent value="prompts" className="flex-1 m-0 overflow-hidden flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search prompts and packs..."
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {promptPacks
                    .filter(pack => {
                      if (!promptSearch) return true;
                      const searchLower = promptSearch.toLowerCase();
                      return pack.name.toLowerCase().includes(searchLower) ||
                        pack.description.toLowerCase().includes(searchLower) ||
                        pack.prompt_pack_items.some(item => 
                          item.title.toLowerCase().includes(searchLower) ||
                          item.prompt_text.toLowerCase().includes(searchLower)
                        );
                    })
                    .map((pack) => {
                      const filteredItems = promptSearch
                        ? pack.prompt_pack_items.filter(item =>
                            item.title.toLowerCase().includes(promptSearch.toLowerCase()) ||
                            item.prompt_text.toLowerCase().includes(promptSearch.toLowerCase())
                          )
                        : pack.prompt_pack_items;

                      return (
                        <Collapsible
                          key={pack.id}
                          open={expandedPacks.has(pack.id)}
                          onOpenChange={() => togglePackExpansion(pack.id)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-muted/50 transition-colors group"
                            >
                              <ChevronDown 
                                className={`w-4 h-4 mr-2 flex-shrink-0 transition-transform duration-200 ${
                                  expandedPacks.has(pack.id) ? 'transform rotate-0' : 'transform -rotate-90'
                                }`}
                              />
                              <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
                              <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-sm truncate">{pack.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {filteredItems.length} {filteredItems.length === 1 ? 'prompt' : 'prompts'}
                                </p>
                              </div>
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-10 space-y-1 mt-1 pb-2">
                            {filteredItems.map((item) => (
                              <Button
                                key={item.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-left h-auto py-2.5 px-3 hover:bg-accent transition-colors rounded-md"
                                onClick={() => insertPrompt(item.prompt_text)}
                              >
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-xs font-semibold truncate mb-1">{item.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {item.prompt_text}
                                  </p>
                                </div>
                              </Button>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  {promptPacks.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-3 font-medium">No prompt packs installed</p>
                      <p className="text-xs mb-4">Browse the marketplace to install prompt packs</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/prompt-marketplace")}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Browse Marketplace
                      </Button>
                    </div>
                  )}
                  {promptPacks.length > 0 && promptPacks.filter(pack => {
                    if (!promptSearch) return true;
                    const searchLower = promptSearch.toLowerCase();
                    return pack.name.toLowerCase().includes(searchLower) ||
                      pack.description.toLowerCase().includes(searchLower) ||
                      pack.prompt_pack_items.some(item => 
                        item.title.toLowerCase().includes(searchLower) ||
                        item.prompt_text.toLowerCase().includes(searchLower)
                      );
                  }).length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="mb-2 font-medium">No results found</p>
                      <p className="text-xs">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'voice')} className="flex flex-col h-full">
            <div className="border-b border-border/50 px-4 sm:px-6 pt-4 flex-shrink-0">
              <TabsList className="glass-card w-full sm:w-auto">
                <TabsTrigger value="text" className="flex-1 sm:flex-none">
                  <MessageSquare className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Text Chat</span>
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex-1 sm:flex-none">
                  <Mic className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Voice Chat</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="text" className="flex flex-col m-0 h-full overflow-hidden">
              {/* Messages - Scrollable Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6">
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
                    className={`max-w-[80%] p-4 animate-fade-in ${
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
              </div>

              {/* Input - Fixed at Bottom */}
              {installedModels.length > 0 && (
                <div className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
                  <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-3">
                    {/* Uploaded Documents */}
                    {chatDocuments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {chatDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card text-sm group"
                          >
                            {doc.file_type?.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">{doc.title}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteChatDocument(doc.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="flex gap-2 sm:gap-4 items-end">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="h-[60px] w-[60px] flex-shrink-0 glass-card"
                        title="Upload document or image"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Paperclip className="w-5 h-5" />
                        )}
                      </Button>
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="glass-card resize-none min-h-[60px] max-h-[200px]"
                        rows={1}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        size="icon"
                        className="h-[60px] w-[60px] sm:h-[60px] sm:w-[60px] flex-shrink-0"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

        <TabsContent value="voice" className="flex-1 flex flex-col overflow-hidden m-0">
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
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
                    <h3 className="font-semibold mb-3">Recent Messages (Saved)</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Last 5 messages from this conversation
                    </p>
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