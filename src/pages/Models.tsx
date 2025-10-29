import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type FullPilotModel = {
  id: string;
  name: string;
  model_name: string;
  system_prompt: string;
  knowledge_base_id: string | null;
  is_active: boolean;
  provider: {
    name: string;
    provider_type: string;
  };
  knowledge_base?: {
    name: string;
    description: string;
  };
};

type InstalledModel = FullPilotModel & {
  installed_at: string;
};

const Models = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [availableModels, setAvailableModels] = useState<FullPilotModel[]>([]);
  const [installedModels, setInstalledModels] = useState<InstalledModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    setUser(user);
    loadModels(user.id);
  };

  const loadModels = async (userId: string) => {
    setLoading(true);
    await Promise.all([loadAvailableModels(userId), loadInstalledModels(userId)]);
    setLoading(false);
  };

  const loadAvailableModels = async (userId: string) => {
    // Get all active models
    const { data: allModels } = await supabase
      .from("fullpilot_models" as any)
      .select(`
        id,
        name,
        model_name,
        system_prompt,
        knowledge_base_id,
        is_active,
        llm_providers!inner (
          name,
          provider_type
        ),
        knowledge_bases (
          name,
          description
        )
      `)
      .eq("is_active", true);

    // Get user's installed models
    const { data: userModels } = await supabase
      .from("user_models" as any)
      .select("model_id")
      .eq("user_id", userId);

    const installedIds = new Set(userModels?.map((um: any) => um.model_id) || []);

    // Filter out already installed models
    const available = (allModels || [])
      .filter((model: any) => !installedIds.has(model.id))
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        model_name: model.model_name,
        system_prompt: model.system_prompt,
        knowledge_base_id: model.knowledge_base_id,
        is_active: model.is_active,
        provider: {
          name: model.llm_providers.name,
          provider_type: model.llm_providers.provider_type,
        },
        knowledge_base: model.knowledge_bases ? {
          name: model.knowledge_bases.name,
          description: model.knowledge_bases.description,
        } : undefined,
      }));

    setAvailableModels(available as unknown as FullPilotModel[]);
  };

  const loadInstalledModels = async (userId: string) => {
    const { data } = await supabase
      .from("user_models" as any)
      .select(`
        installed_at,
        fullpilot_models!inner (
          id,
          name,
          model_name,
          system_prompt,
          knowledge_base_id,
          is_active,
          llm_providers!inner (
            name,
            provider_type
          ),
          knowledge_bases (
            name,
            description
          )
        )
      `)
      .eq("user_id", userId);

    const installed = (data || []).map((item: any) => ({
      id: item.fullpilot_models.id,
      name: item.fullpilot_models.name,
      model_name: item.fullpilot_models.model_name,
      system_prompt: item.fullpilot_models.system_prompt,
      knowledge_base_id: item.fullpilot_models.knowledge_base_id,
      is_active: item.fullpilot_models.is_active,
      installed_at: item.installed_at,
      provider: {
        name: item.fullpilot_models.llm_providers.name,
        provider_type: item.fullpilot_models.llm_providers.provider_type,
      },
      knowledge_base: item.fullpilot_models.knowledge_bases ? {
        name: item.fullpilot_models.knowledge_bases.name,
        description: item.fullpilot_models.knowledge_bases.description,
      } : undefined,
    }));

    setInstalledModels(installed as unknown as InstalledModel[]);
  };

  const installModel = async (modelId: string) => {
    if (!user) return;

    const { error } = await supabase.from("user_models" as any).insert({
      user_id: user.id,
      model_id: modelId,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Model installed successfully" });
    loadModels(user.id);
  };

  const uninstallModel = async (modelId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_models" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("model_id", modelId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Model uninstalled" });
    loadModels(user.id);
  };

  if (loading) {
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
            <h1 className="text-3xl font-bold">AI Models</h1>
            <p className="text-sm text-muted-foreground">
              Browse and manage your installed models
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="installed" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="installed">My Models ({installedModels.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableModels.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="installed" className="space-y-4 mt-6">
          {installedModels.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No models installed yet</p>
                <Button onClick={() => document.querySelector('[value="available"]')?.dispatchEvent(new MouseEvent('click'))}>
                  Browse Available Models
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {installedModels.map((model) => (
                <Card key={model.id} className="glass-card hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{model.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {model.provider.name} • {model.model_name}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => uninstallModel(model.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {model.system_prompt}
                    </p>
                    {model.knowledge_base && (
                      <Badge variant="secondary" className="gap-1">
                        <BookOpen className="w-3 h-3" />
                        {model.knowledge_base.name}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4 mt-6">
          {availableModels.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No new models available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableModels.map((model) => (
                <Card key={model.id} className="glass-card hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {model.provider.name} • {model.model_name}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {model.system_prompt}
                    </p>
                    {model.knowledge_base && (
                      <Badge variant="secondary" className="gap-1">
                        <BookOpen className="w-3 h-3" />
                        {model.knowledge_base.name}
                      </Badge>
                    )}
                    <Button onClick={() => installModel(model.id)} className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Install Model
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Models;