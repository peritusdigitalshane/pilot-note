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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Star, Download, Share2, Users, Eye, EyeOff, Building } from "lucide-react";
import { toast } from "sonner";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  model_name: string;
  provider_id: string | null;
  visibility: 'public' | 'private' | 'organization';
  organization_id: string | null;
  category_id: string | null;
  install_count: number;
  average_rating: number;
  created_by: string;
  is_installed?: boolean;
  user_rating?: number;
}

interface Organization {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
}

const PromptMarketplace = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'myshared'>('browse');

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private" as 'public' | 'private' | 'organization',
    organization_id: "",
  });
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
    loadData(user.id);
  };

  const loadData = async (userId: string) => {
    try {
      const [packsRes, orgsRes, providersRes, installsRes] = await Promise.all([
        supabase.from("prompt_packs" as any).select("*").order("install_count", { ascending: false }),
        supabase.from("organizations" as any).select("id, name"),
        supabase.from("llm_providers" as any).select("id, name"),
        supabase.from("user_installed_packs" as any).select("pack_id").eq("user_id", userId),
      ]);

      if (packsRes.error) throw packsRes.error;
      if (orgsRes.error) throw orgsRes.error;
      if (providersRes.error) throw providersRes.error;

      const installedIds = new Set(installsRes.data?.map((i: any) => i.pack_id) || []);
      
      const packsWithInstallStatus = ((packsRes.data as any[]) || []).map((pack: any) => ({
        ...pack,
        is_installed: installedIds.has(pack.id),
      }));

      setItems(packsWithInstallStatus);
      setOrganizations(orgsRes.data as any || []);
      setProviders(providersRes.data as any || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const packData = {
        name: formData.name,
        description: formData.description,
        visibility: formData.visibility,
        organization_id: formData.visibility === 'organization' ? formData.organization_id : null,
        created_by: user.id,
        is_active: true,
      };

      const { error } = await supabase
        .from("prompt_packs" as any)
        .insert(packData);

      if (error) throw error;

      toast.success("Prompt pack created successfully");
      setDialogOpen(false);
      resetForm();
      loadData(user.id);
    } catch (error) {
      console.error("Error creating pack:", error);
      toast.error("Failed to create pack");
    }
  };

  const handleInstall = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_installed_packs" as any)
        .insert({ pack_id: itemId, user_id: user.id });

      if (error) throw error;

      toast.success("Prompt pack installed successfully!");
      loadData(user.id);
    } catch (error) {
      console.error("Error installing:", error);
      toast.error("Failed to install");
    }
  };

  const handleUninstall = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_installed_packs" as any)
        .delete()
        .eq("pack_id", itemId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Prompt pack uninstalled");
      loadData(user.id);
    } catch (error) {
      console.error("Error uninstalling:", error);
      toast.error("Failed to uninstall");
    }
  };

  const handleUpdateVisibility = async (packId: string, newVisibility: 'public' | 'private' | 'organization', orgId?: string) => {
    try {
      const { error } = await supabase
        .from("prompt_packs" as any)
        .update({
          visibility: newVisibility,
          organization_id: newVisibility === 'organization' ? orgId : null,
        })
        .eq("id", packId);

      if (error) throw error;

      toast.success("Visibility updated successfully");
      const { data: { user } } = await supabase.auth.getUser();
      if (user) loadData(user.id);
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      visibility: "private",
      organization_id: "",
    });
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="w-4 h-4" />;
      case 'organization': return <Building className="w-4 h-4" />;
      default: return <EyeOff className="w-4 h-4" />;
    }
  };

  const myItems = items.filter(item => {
    if (activeTab !== 'myshared') return false;
    return item.created_by === currentUserId;
  });

  const browseItems = items.filter(item => {
    if (activeTab !== 'browse') return false;
    // Debug: log to see what we're filtering
    console.log('Filtering item:', item.name, 'visibility:', item.visibility, 'created_by:', item.created_by, 'currentUserId:', currentUserId);
    return item.visibility === 'public' || item.created_by === currentUserId;
  });

  console.log('Browse tab showing', browseItems.length, 'items out of', items.length, 'total');

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Prompt Marketplace</h1>
            <p className="text-sm text-muted-foreground">Share and discover AI prompts and models</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/organizations")}>
            <Users className="w-4 h-4 mr-2" />
            Organisations
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Prompt Pack
          </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a Prompt Pack</DialogTitle>
                <DialogDescription>
                  Create a collection of prompts to share with others
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Code Review Assistant"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this prompt pack"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select value={formData.visibility} onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="private">Private (only you)</SelectItem>
                      <SelectItem value="organization">Organisation</SelectItem>
                      <SelectItem value="public">Public (everyone)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.visibility === 'organization' && (
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organisation *</Label>
                    <Select value={formData.organization_id} onValueChange={(value) => setFormData({ ...formData, organization_id: value })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select organisation" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}


                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Create & Share
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="myshared">My Items</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <Card className="glass-card p-6">
                <p className="text-muted-foreground">Loading...</p>
              </Card>
            ) : browseItems.length === 0 ? (
              <Card className="glass-card p-12 text-center col-span-full">
                <p className="text-muted-foreground">No items available yet</p>
              </Card>
            ) : (
              browseItems.map((item) => (
                <Card key={item.id} className="glass-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {getVisibilityIcon(item.visibility)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Installs:</span>
                      <span className="font-medium">{item.install_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {item.is_installed ? (
                      <Button variant="outline" size="sm" onClick={() => handleUninstall(item.id)} className="flex-1">
                        Uninstall
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleInstall(item.id)} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Install
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="myshared" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myItems.length === 0 ? (
              <Card className="glass-card p-12 text-center col-span-full">
                <p className="text-muted-foreground">You haven't created any items yet</p>
              </Card>
            ) : (
              myItems.map((item) => (
                <Card key={item.id} className="glass-card p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Visibility:</Label>
                      <Select 
                        value={item.visibility} 
                        onValueChange={(value: any) => handleUpdateVisibility(item.id, value, item.organization_id)}
                      >
                        <SelectTrigger className="w-40 h-8">
                          <div className="flex items-center gap-2">
                            {getVisibilityIcon(item.visibility)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="organization">Organisation</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {item.visibility === 'organization' && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Organisation:</Label>
                        <Select 
                          value={item.organization_id || ""} 
                          onValueChange={(value) => handleUpdateVisibility(item.id, 'organization', value)}
                        >
                          <SelectTrigger className="w-40 h-8">
                            <SelectValue placeholder="Select org" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {organizations.map((org) => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Installs:</span>
                      <span className="font-medium">{item.install_count}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptMarketplace;
