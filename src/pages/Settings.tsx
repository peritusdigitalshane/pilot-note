import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, RefreshCw, Pencil, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Provider = {
  id: string;
  name: string;
  api_url: string;
  provider_type: string;
  api_key?: string;
  created_at: string;
};

type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
};

type FullPilotModel = {
  id: string;
  name: string;
  provider_id: string;
  model_name: string;
  system_prompt: string;
  knowledge_base_id: string | null;
  is_active: boolean;
};

type AvailableModel = {
  id: string;
  name: string;
};

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [fullpilotModels, setFullpilotModels] = useState<FullPilotModel[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transcriptionProviderId, setTranscriptionProviderId] = useState<string>("");
  const [transcriptionModelName, setTranscriptionModelName] = useState<string>("");
  const [transcriptionModels, setTranscriptionModels] = useState<AvailableModel[]>([]);
  const [fetchingTranscriptionModels, setFetchingTranscriptionModels] = useState(false);

  // Edit states
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editingModel, setEditingModel] = useState<FullPilotModel | null>(null);
  const [editProviderDialogOpen, setEditProviderDialogOpen] = useState(false);
  const [editModelDialogOpen, setEditModelDialogOpen] = useState(false);

  // Provider form
  const [providerName, setProviderName] = useState("");
  const [apiUrl, setApiUrl] = useState("https://api.openai.com/v1");
  const [apiKey, setApiKey] = useState("");
  const [providerType, setProviderType] = useState("openai");

  // Model form
  const [modelName, setModelName] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedKB, setSelectedKB] = useState("none");
  const [fetchingModels, setFetchingModels] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You must be a super admin to access this page.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsSuperAdmin(true);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadProviders(), 
      loadKnowledgeBases(), 
      loadFullpilotModels(),
      loadTranscriptionSetting()
    ]);
    setLoading(false);
  };

  const loadTranscriptionSetting = async () => {
    const { data: providerData } = await supabase
      .from("app_settings" as any)
      .select("value")
      .eq("key", "transcription_provider_id")
      .maybeSingle();
    
    if (providerData && (providerData as any).value) {
      setTranscriptionProviderId((providerData as any).value);
    }

    const { data: modelData } = await supabase
      .from("app_settings" as any)
      .select("value")
      .eq("key", "transcription_model_name")
      .maybeSingle();
    
    if (modelData && (modelData as any).value) {
      setTranscriptionModelName((modelData as any).value);
    }
  };

  const updateTranscriptionProvider = async (providerId: string) => {
    const { error } = await supabase
      .from("app_settings" as any)
      .upsert({ 
        key: "transcription_provider_id",
        value: providerId || null 
      }, {
        onConflict: "key"
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setTranscriptionProviderId(providerId);
    setTranscriptionModels([]);
    setTranscriptionModelName("");
    toast({ title: "Success", description: "Transcription provider updated" });
  };

  const updateTranscriptionModel = async (modelName: string) => {
    const { error } = await supabase
      .from("app_settings" as any)
      .upsert({ 
        key: "transcription_model_name",
        value: modelName || null 
      }, {
        onConflict: "key"
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setTranscriptionModelName(modelName);
    toast({ title: "Success", description: "Transcription model updated" });
  };

  const fetchTranscriptionModels = async () => {
    const provider = providers.find(p => p.id === transcriptionProviderId);
    if (!provider || !provider.api_key) return;

    setFetchingTranscriptionModels(true);
    const { data, error } = await supabase.functions.invoke("fetch-models", {
      body: {
        apiUrl: provider.api_url,
        apiKey: provider.api_key,
        providerType: provider.provider_type,
      },
    });

    setFetchingTranscriptionModels(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setTranscriptionModels(data.models);
    toast({ title: "Success", description: `Found ${data.models.length} models` });
  };

  const loadProviders = async () => {
    const { data } = await supabase.from("llm_providers" as any).select("*").order("created_at", { ascending: false });
    if (data) setProviders(data as unknown as Provider[]);
  };

  const loadKnowledgeBases = async () => {
    const { data } = await supabase.from("knowledge_bases" as any).select("*").order("created_at", { ascending: false });
    if (data) setKnowledgeBases(data as unknown as KnowledgeBase[]);
  };

  const loadFullpilotModels = async () => {
    const { data } = await supabase.from("fullpilot_models" as any).select("*").order("created_at", { ascending: false });
    if (data) setFullpilotModels(data as unknown as FullPilotModel[]);
  };

  const addProvider = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!providerName || !apiUrl || !apiKey) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("llm_providers" as any).insert({
      name: providerName,
      api_url: apiUrl,
      api_key: apiKey,
      provider_type: providerType,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Provider added successfully" });
    setProviderName("");
    setApiUrl(providerType === "openai" ? "https://api.openai.com/v1" : "https://api.anthropic.com/v1");
    setApiKey("");
    loadProviders();
  };

  const deleteProvider = async (id: string) => {
    const { error } = await supabase.from("llm_providers" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Provider deleted" });
    loadProviders();
  };

  const openEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setEditProviderDialogOpen(true);
  };

  const updateProvider = async () => {
    if (!editingProvider) return;

    const { error } = await supabase
      .from("llm_providers" as any)
      .update({
        name: editingProvider.name,
        api_url: editingProvider.api_url,
        api_key: editingProvider.api_key,
        provider_type: editingProvider.provider_type,
      })
      .eq("id", editingProvider.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Provider updated successfully" });
    setEditProviderDialogOpen(false);
    setEditingProvider(null);
    loadProviders();
  };

  const fetchModels = async () => {
    const provider = providers.find(p => p.id === selectedProvider);
    if (!provider || !provider.api_key) return;

    setFetchingModels(true);
    const { data, error } = await supabase.functions.invoke("fetch-models", {
      body: {
        apiUrl: provider.api_url,
        apiKey: provider.api_key,
        providerType: provider.provider_type,
      },
    });

    setFetchingModels(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setAvailableModels(data.models);
    toast({ title: "Success", description: `Found ${data.models.length} models` });
  };

  const addFullPilotModel = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("fullpilot_models" as any).insert({
      name: modelName,
      provider_id: selectedProvider,
      model_name: selectedModel,
      system_prompt: systemPrompt,
      knowledge_base_id: selectedKB && selectedKB !== "none" ? selectedKB : null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "FullPilot model created" });
    setModelName("");
    setSelectedModel("");
    setSystemPrompt("");
    setSelectedKB("none");
    setAvailableModels([]);
    loadFullpilotModels();
  };

  const deleteFullPilotModel = async (id: string) => {
    const { error } = await supabase.from("fullpilot_models" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Model deleted" });
    loadFullpilotModels();
  };

  const openEditModel = (model: FullPilotModel) => {
    setEditingModel(model);
    setEditModelDialogOpen(true);
  };

  const updateFullPilotModel = async () => {
    if (!editingModel) return;

    const { error } = await supabase
      .from("fullpilot_models" as any)
      .update({
        name: editingModel.name,
        model_name: editingModel.model_name,
        system_prompt: editingModel.system_prompt,
        knowledge_base_id: editingModel.knowledge_base_id || null,
      })
      .eq("id", editingModel.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Model updated successfully" });
    setEditModelDialogOpen(false);
    setEditingModel(null);
    loadFullpilotModels();
  };

  if (loading || !isSuperAdmin) {
    return <div className="min-h-screen p-6 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Super Admin Settings</h1>
            <p className="text-sm text-muted-foreground">Manage LLM providers and FullPilot models</p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="providers">LLM Providers</TabsTrigger>
          <TabsTrigger value="models">FullPilot Models</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Bases</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="prompt-packs">Prompt Packs</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Add LLM Provider</CardTitle>
              <CardDescription>Connect to OpenAI, Anthropic, or custom API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="providerName">Provider Name</Label>
                  <Input
                    id="providerName"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="My OpenAI"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerType">Provider Type</Label>
                  <Select value={providerType} onValueChange={(value) => {
                    setProviderType(value);
                    // Auto-fill API URL based on provider type
                    if (value === "openai") {
                      setApiUrl("https://api.openai.com/v1");
                    } else if (value === "anthropic") {
                      setApiUrl("https://api.anthropic.com/v1");
                    } else {
                      setApiUrl("");
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API URL</Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <Button onClick={addProvider} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {providers.map((provider) => (
              <Card key={provider.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription>{provider.provider_type} • {provider.api_url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditProvider(provider)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => deleteProvider(provider.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Create FullPilot Model</CardTitle>
              <CardDescription>Combine a provider model with custom prompt and knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">FullPilot Model Name</Label>
                <Input
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="My Custom Assistant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Select Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProvider && (
                <Button onClick={fetchModels} disabled={fetchingModels} className="w-full" variant="outline">
                  <RefreshCw className={`w-4 h-4 mr-2 ${fetchingModels ? 'animate-spin' : ''}`} />
                  {fetchingModels ? 'Fetching...' : 'Fetch Available Models'}
                </Button>
              )}
              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="model">Select Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kb">Knowledge Base (Optional)</Label>
                <Select value={selectedKB} onValueChange={setSelectedKB}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addFullPilotModel} className="w-full" disabled={!selectedModel || !systemPrompt}>
                <Plus className="w-4 h-4 mr-2" />
                Create FullPilot Model
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {fullpilotModels.map((model) => (
              <Card key={model.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription>{model.model_name} • {model.system_prompt.slice(0, 100)}...</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditModel(model)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => deleteFullPilotModel(model.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transcription">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Voice Transcription Settings</CardTitle>
              <CardDescription>Select which provider to use for voice-to-text transcription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transcriptionProvider">Transcription Provider</Label>
                <Select 
                  value={transcriptionProviderId} 
                  onValueChange={updateTranscriptionProvider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider for transcription" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Transcription disabled)</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.provider_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select which LLM provider to use for voice-to-text transcription
                </p>
              </div>
              
              {transcriptionProviderId && transcriptionProviderId !== "none" && (
                <>
                  <Button 
                    onClick={fetchTranscriptionModels} 
                    disabled={fetchingTranscriptionModels} 
                    className="w-full" 
                    variant="outline"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${fetchingTranscriptionModels ? 'animate-spin' : ''}`} />
                    {fetchingTranscriptionModels ? 'Fetching...' : 'Fetch Available Models'}
                  </Button>

                  {transcriptionModels.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="transcriptionModel">Transcription Model</Label>
                      <Select value={transcriptionModelName} onValueChange={updateTranscriptionModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a model for transcription" />
                        </SelectTrigger>
                        <SelectContent>
                          {transcriptionModels.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Select the specific model to use for transcription
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Knowledge Bases</CardTitle>
              <CardDescription>Knowledge bases are managed on the Knowledge page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {knowledgeBases.map((kb) => (
                  <div key={kb.id} className="p-3 rounded-lg border border-border">
                    <div className="font-medium">{kb.name}</div>
                    {kb.description && (
                      <div className="text-sm text-muted-foreground mt-1">{kb.description}</div>
                    )}
                  </div>
                ))}
                {knowledgeBases.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No knowledge bases yet. Visit the Knowledge page to create one.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Prompt Categories</CardTitle>
              <CardDescription>Categories are used to organise marketplace items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/categories")}>
                Manage Categories
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Create and edit categories for the prompt marketplace to help users find relevant prompts.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt-packs">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Prompt Packs Management</CardTitle>
              <CardDescription>Manage global prompt packs available to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/admin/prompt-packs")}>
                <Package className="w-4 h-4 mr-2" />
                Manage Prompt Packs
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Create, edit, and organize prompt packs that users can install from the Prompt Marketplace.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/users")}>
                Manage Users
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Assign roles (User, Admin, Super Admin) to users and manage their permissions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Provider Dialog */}
      <Dialog open={editProviderDialogOpen} onOpenChange={setEditProviderDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit LLM Provider</DialogTitle>
            <DialogDescription>Update the provider details</DialogDescription>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input
                  value={editingProvider.name}
                  onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Provider Type</Label>
                <Select
                  value={editingProvider.provider_type}
                  onValueChange={(value) => setEditingProvider({ ...editingProvider, provider_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>API URL</Label>
                <Input
                  value={editingProvider.api_url}
                  onChange={(e) => setEditingProvider({ ...editingProvider, api_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={editingProvider.api_key || ""}
                  onChange={(e) => setEditingProvider({ ...editingProvider, api_key: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProviderDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateProvider}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={editModelDialogOpen} onOpenChange={setEditModelDialogOpen}>
        <DialogContent className="glass-card max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FullPilot Model</DialogTitle>
            <DialogDescription>Update the model configuration</DialogDescription>
          </DialogHeader>
          {editingModel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model Name</Label>
                <Input
                  value={editingModel.name}
                  onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Model ID</Label>
                <Input
                  value={editingModel.model_name}
                  onChange={(e) => setEditingModel({ ...editingModel, model_name: e.target.value })}
                  placeholder="e.g., gpt-4o, claude-3-opus"
                />
              </div>
              <div className="space-y-2">
                <Label>System Prompt</Label>
                <Textarea
                  value={editingModel.system_prompt}
                  onChange={(e) => setEditingModel({ ...editingModel, system_prompt: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Knowledge Base (Optional)</Label>
                <Select
                  value={editingModel.knowledge_base_id || "none"}
                  onValueChange={(value) => setEditingModel({ ...editingModel, knowledge_base_id: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModelDialogOpen(false)}>Cancel</Button>
            <Button onClick={updateFullPilotModel}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;