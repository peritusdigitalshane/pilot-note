import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Database, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AvailableModel = {
  id: string;
  name: string;
  model_name: string;
  system_prompt: string;
  knowledge_base_id: string | null;
  is_active: boolean;
  knowledge_bases: {
    name: string;
    description: string;
  } | null;
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [installedModelIds, setInstalledModelIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/");
      return;
    }
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAvailableModels(), loadInstalledModelIds()]);
    setLoading(false);
  };

  const loadAvailableModels = async () => {
    const { data, error } = await supabase
      .from("fullpilot_models" as any)
      .select(`
        id,
        name,
        model_name,
        system_prompt,
        knowledge_base_id,
        is_active,
        knowledge_bases:knowledge_base_id (
          name,
          description
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading models:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setAvailableModels(data as unknown as AvailableModel[]);
    }
  };

  const loadInstalledModelIds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_models" as any)
      .select("model_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading installed models:", error);
    } else if (data) {
      setInstalledModelIds(new Set(data.map((d: any) => d.model_id)));
    }
  };

  const installModel = async (modelId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_models" as any)
      .insert({
        user_id: user.id,
        model_id: modelId,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Model installed successfully" });
    loadInstalledModelIds();
  };

  if (loading) {
    return <div className="min-h-screen p-6 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/models")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Model Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Browse and install models created by super admins
            </p>
          </div>
        </div>
      </header>

      {availableModels.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Database className="w-16 h-16 text-primary/50" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Models Available</h3>
              <p className="text-muted-foreground">
                Super admins haven't created any models yet
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableModels.map((model) => {
            const isInstalled = installedModelIds.has(model.id);
            return (
              <Card key={model.id} className="glass-card hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  <CardDescription className="text-xs">{model.model_name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">System Prompt</p>
                    <p className="text-sm line-clamp-4">{model.system_prompt}</p>
                  </div>
                  {model.knowledge_bases && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Knowledge Base</p>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Database className="w-4 h-4 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {model.knowledge_bases.name}
                          </p>
                          {model.knowledge_bases.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {model.knowledge_bases.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => installModel(model.id)}
                    disabled={isInstalled}
                    className="w-full"
                    variant={isInstalled ? "outline" : "default"}
                  >
                    {isInstalled ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Installed
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Install Model
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;