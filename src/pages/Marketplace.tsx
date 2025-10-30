import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Package, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  install_count: number;
  is_active: boolean;
  required_plan: string;
  prompt_pack_items: PromptPackItem[];
};

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promptPacks, setPromptPacks] = useState<PromptPack[]>([]);
  const [installedPackIds, setInstalledPackIds] = useState<Set<string>>(new Set());
  const [expandedPacks, setExpandedPacks] = useState<Set<string>>(new Set());
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
    await Promise.all([loadPromptPacks(), loadInstalledPackIds()]);
    setLoading(false);
  };

  const loadPromptPacks = async () => {
  const { data, error } = await supabase
      .from("prompt_packs" as any)
      .select(`
        id,
        name,
        description,
        install_count,
        is_active,
        required_plan,
        prompt_pack_items:prompt_pack_items(
          id,
          title,
          prompt_text,
          order_index
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading prompt packs:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      // Sort items within each pack by order_index
      const packsWithSortedItems = (data as any[]).map((pack: any) => ({
        ...pack,
        prompt_pack_items: (pack.prompt_pack_items || []).sort((a: any, b: any) => 
          a.order_index - b.order_index
        )
      }));
      setPromptPacks(packsWithSortedItems as PromptPack[]);
    }
  };

  const loadInstalledPackIds = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_installed_packs" as any)
      .select("pack_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading installed packs:", error);
    } else if (data) {
      setInstalledPackIds(new Set(data.map((d: any) => d.pack_id)));
    }
  };

  const installPack = async (packId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_installed_packs" as any)
      .insert({
        user_id: user.id,
        pack_id: packId,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Already Installed", description: "You've already installed this pack", variant: "default" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }

    toast({ title: "Success", description: "Prompt pack installed successfully" });
    loadInstalledPackIds();
  };

  const uninstallPack = async (packId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_installed_packs" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("pack_id", packId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Prompt pack uninstalled" });
    loadInstalledPackIds();
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
            <h1 className="text-3xl font-bold">Prompt Pack Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Browse and install prompt packs created by super admins
            </p>
          </div>
        </div>
      </header>

      {promptPacks.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Package className="w-16 h-16 text-primary/50" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Prompt Packs Available</h3>
              <p className="text-muted-foreground">
                Super admins haven't created any prompt packs yet
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {promptPacks.map((pack) => {
            const isInstalled = installedPackIds.has(pack.id);
            const isExpanded = expandedPacks.has(pack.id);
            
            return (
              <Card key={pack.id} className="glass-card hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl">{pack.name}</CardTitle>
                        {pack.required_plan === 'pro' && (
                          <Badge variant="secondary" className="text-xs">PRO</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {pack.description}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{pack.prompt_pack_items.length} prompts</span>
                        <span>•</span>
                        <span>{pack.install_count} installations</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isInstalled && (
                        <Button
                          onClick={() => uninstallPack(pack.id)}
                          variant="outline"
                          size="sm"
                        >
                          Uninstall
                        </Button>
                      )}
                      <Button
                        onClick={() => isInstalled ? togglePackExpansion(pack.id) : installPack(pack.id)}
                        variant={isInstalled ? "outline" : "default"}
                        size="sm"
                      >
                        {isInstalled ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Installed
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Install Pack
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <Collapsible open={isExpanded} onOpenChange={() => togglePackExpansion(pack.id)}>
                  <CardContent className="space-y-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {isExpanded ? "Hide" : "Show"} {pack.prompt_pack_items.length} prompts
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-3">
                      {pack.prompt_pack_items.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-muted-foreground mt-1">
                              {index + 1}.
                            </span>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-semibold">{item.title}</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {item.prompt_text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </CardContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Marketplace;