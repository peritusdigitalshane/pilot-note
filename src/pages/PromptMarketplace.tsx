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
  provider_id: string;
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

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const PromptMarketplace = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [shareEmail, setShareEmail] = useState("");
  const [activeTab, setActiveTab] = useState<'browse' | 'myshared'>('browse');

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    system_prompt: "",
    model_name: "",
    provider_id: "",
    visibility: "private" as 'public' | 'private' | 'organization',
    organization_id: "",
    category_id: "",
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
      const [itemsRes, orgsRes, providersRes, categoriesRes, installsRes] = await Promise.all([
        supabase.from("marketplace_items" as any).select("*").order("install_count", { ascending: false }),
        supabase.from("organizations" as any).select("id, name"),
        supabase.from("llm_providers" as any).select("id, name"),
        supabase.from("categories" as any).select("id, name, description"),
        supabase.from("marketplace_installs" as any).select("item_id").eq("user_id", userId),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (orgsRes.error) throw orgsRes.error;
      if (providersRes.error) throw providersRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const installedIds = new Set(installsRes.data?.map((i: any) => i.item_id) || []);
      const itemsWithInstallStatus = (itemsRes.data || []).map((item: any) => ({
        ...item,
        is_installed: installedIds.has(item.id),
      }));

      setItems(itemsWithInstallStatus);
      setOrganizations(orgsRes.data as any || []);
      setProviders(providersRes.data as any || []);
      setCategories(categoriesRes.data as any || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load marketplace data");
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

      const itemData = {
        ...formData,
        created_by: user.id,
        organization_id: formData.visibility === 'organization' ? formData.organization_id : null,
      };

      const { error } = await supabase
        .from("marketplace_items" as any)
        .insert(itemData);

      if (error) throw error;

      toast.success("Item created successfully");
      setDialogOpen(false);
      resetForm();
      loadData(user.id);
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    }
  };

  const handleInstall = async (itemId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("marketplace_installs" as any)
        .insert({ item_id: itemId, user_id: user.id });

      if (error) throw error;

      toast.success("Installed successfully!");
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
        .from("marketplace_installs" as any)
        .delete()
        .eq("item_id", itemId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Uninstalled");
      loadData(user.id);
    } catch (error) {
      console.error("Error uninstalling:", error);
      toast.error("Failed to uninstall");
    }
  };

  const handleRate = async (itemId: string, rating: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("marketplace_ratings" as any)
        .upsert({
          item_id: itemId,
          user_id: user.id,
          rating,
        });

      if (error) throw error;

      toast.success("Rating submitted!");
      loadData(user.id);
    } catch (error) {
      console.error("Error rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const handleShare = async () => {
    if (!selectedItem || !shareEmail) {
      toast.error("Please enter an email");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user by email
      const { data: targetUser, error: userError } = await supabase
        .from("profiles" as any)
        .select("user_id")
        .eq("email", shareEmail)
        .single();

      if (userError || !targetUser) {
        toast.error("User not found");
        return;
      }

      const { error } = await supabase
        .from("marketplace_shares" as any)
        .insert({
          item_id: selectedItem.id,
          shared_with_user_id: (targetUser as any).user_id,
          shared_by: user.id,
        });

      if (error) throw error;

      toast.success("Shared successfully!");
      setShareDialogOpen(false);
      setShareEmail("");
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      system_prompt: "",
      model_name: "",
      provider_id: "",
      visibility: "private",
      organization_id: "",
      category_id: "",
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
    // Show items created by me or shared with me in the "My Shared" tab
    return activeTab === 'myshared';
  });

  const browseItems = items.filter(item => {
    if (activeTab !== 'browse') return false;
    if (selectedCategory === 'all') return true;
    return item.category_id === selectedCategory;
  });

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
                Share New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share a Prompt/Model</DialogTitle>
                <DialogDescription>
                  Create and share your AI prompt with others
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
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Select value={formData.provider_id} onValueChange={(value) => setFormData({ ...formData, provider_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility *</Label>
                  <Select value={formData.visibility} onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select organisation" />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                    placeholder="You are a helpful assistant..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

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
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>

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
                      <span className="text-muted-foreground">Model:</span>
                      <span className="font-medium">{item.model_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Installs:</span>
                      <span className="font-medium">{item.install_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 cursor-pointer ${
                            star <= (item.average_rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                          }`}
                          onClick={() => item.is_installed && handleRate(item.id, star)}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({item.average_rating?.toFixed(1) || '0.0'})
                      </span>
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
                    {item.visibility === 'private' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setShareDialogOpen(true);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
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
            {items.filter(i => i.created_by === localStorage.getItem('userId')).map((item) => (
              <Card key={item.id} className="glass-card p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant="outline" className="mt-2">
                      {getVisibilityIcon(item.visibility)}
                      <span className="ml-2 capitalize">{item.visibility}</span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Installs:</span>
                    <span className="font-medium">{item.install_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{item.average_rating?.toFixed(1) || '0.0'} ⭐</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with User</DialogTitle>
            <DialogDescription>
              Enter the email of the user you want to share this item with
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">User Email</Label>
              <Input
                id="share-email"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShareDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleShare} className="flex-1">
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptMarketplace;
