import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, Bot } from "lucide-react";
import { toast } from "sonner";

interface CustomModel {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  model_name: string;
  provider_id: string;
  knowledge_base_id: string | null;
  is_active: boolean;
}

interface Provider {
  id: string;
  name: string;
  provider_type: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
}

const CustomModels = () => {
  const navigate = useNavigate();
  const [customModels, setCustomModels] = useState<CustomModel[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<CustomModel | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    system_prompt: "",
    model_name: "",
    provider_id: "",
    knowledge_base_id: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      const [modelsRes, providersRes, kbRes] = await Promise.all([
        supabase.from("user_custom_models" as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("llm_providers" as any).select("id, name, provider_type"),
        supabase.from("knowledge_bases" as any).select("id, name").eq("created_by", userId),
      ]);

      if (modelsRes.error) throw modelsRes.error;
      if (providersRes.error) throw providersRes.error;
      if (kbRes.error) throw kbRes.error;

      if (modelsRes.data) setCustomModels(modelsRes.data as any);
      if (providersRes.data) setProviders(providersRes.data as any);
      if (kbRes.data) setKnowledgeBases(kbRes.data as any);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.system_prompt || !formData.model_name || !formData.provider_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const modelData = {
        ...formData,
        user_id: user.id,
        knowledge_base_id: formData.knowledge_base_id || null,
      };

      if (editingModel) {
        const { error } = await supabase
          .from("user_custom_models" as any)
          .update(modelData)
          .eq("id", editingModel.id);

        if (error) throw error;
        toast.success("Model updated successfully");
      } else {
        const { error } = await supabase
          .from("user_custom_models" as any)
          .insert(modelData);

        if (error) throw error;
        toast.success("Model created successfully");
      }

      setDialogOpen(false);
      resetForm();
      loadData(user.id);
    } catch (error) {
      console.error("Error saving model:", error);
      toast.error("Failed to save model");
    }
  };

  const handleEdit = (model: CustomModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description || "",
      system_prompt: model.system_prompt,
      model_name: model.model_name,
      provider_id: model.provider_id,
      knowledge_base_id: model.knowledge_base_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this model?")) return;

    try {
      const { error } = await supabase
        .from("user_custom_models" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Model deleted");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadData(user.id);
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("Failed to delete model");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_prompt: "",
      model_name: "",
      provider_id: "",
      knowledge_base_id: "",
    });
    setEditingModel(null);
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">My Custom Models</h1>
            <p className="text-sm text-muted-foreground">Create personalized AI models with your own prompts</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModel ? "Edit Model" : "Create Custom Model"}</DialogTitle>
              <DialogDescription>
                Define your custom AI model with a personalized system prompt
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Research Assistant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of what this model does"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select value={formData.provider_id} onValueChange={(value) => setFormData({ ...formData, provider_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name} ({provider.provider_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model_name">Model *</Label>
                <Input
                  id="model_name"
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  placeholder="e.g., gpt-4, claude-sonnet-4-5"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the model name from your provider (e.g., gpt-4, claude-sonnet-4-5)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="knowledge_base">Knowledge Base (Optional)</Label>
                <Select value={formData.knowledge_base_id} onValueChange={(value) => setFormData({ ...formData, knowledge_base_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {knowledgeBases.map((kb) => (
                      <SelectItem key={kb.id} value={kb.id}>
                        {kb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt *</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  placeholder="You are a helpful assistant specialized in..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Define how the AI should behave and what it specializes in
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingModel ? "Update Model" : "Create Model"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <Card className="glass-card p-6">
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        ) : customModels.length === 0 ? (
          <Card className="glass-card p-12 text-center col-span-full">
            <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No custom models yet. Create your first model to get started!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </Card>
        ) : (
          customModels.map((model) => (
            <Card key={model.id} className="glass-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{model.name}</h3>
                  {model.description && (
                    <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                  )}
                </div>
                <Bot className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Model:</span> {model.model_name}
                </p>
                <p className="text-muted-foreground line-clamp-3">
                  <span className="font-medium">Prompt:</span> {model.system_prompt}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(model)} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(model.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomModels;
