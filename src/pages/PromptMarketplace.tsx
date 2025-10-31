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
import { ArrowLeft, Plus, Star, Download, Share2, Users, Eye, EyeOff, Building, Edit, Trash2, List, Search, X } from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface PromptPackItem {
  id: string;
  title: string;
  prompt_text: string;
  order_index: number;
  pack_id: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'myshared'>('browse');
  const [managePromptsDialogOpen, setManagePromptsDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<MarketplaceItem | null>(null);
  const [packPrompts, setPackPrompts] = useState<PromptPackItem[]>([]);
  const [promptFormData, setPromptFormData] = useState({
    title: "",
    prompt_text: "",
  });
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "private" as 'public' | 'private' | 'organization',
    organization_id: "",
    category_id: "",
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
      const [packsRes, orgsRes, providersRes, installsRes, categoriesRes] = await Promise.all([
        supabase.from("prompt_packs" as any).select("*").order("install_count", { ascending: false }),
        supabase.from("organizations" as any).select("id, name"),
        supabase.from("llm_providers" as any).select("id, name"),
        supabase.from("user_installed_packs" as any).select("pack_id").eq("user_id", userId),
        supabase.from("categories" as any).select("*").order("name", { ascending: true }),
      ]);

      if (packsRes.error) throw packsRes.error;
      if (orgsRes.error) throw orgsRes.error;
      if (providersRes.error) throw providersRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      const installedIds = new Set(installsRes.data?.map((i: any) => i.pack_id) || []);
      
      const packsWithInstallStatus = ((packsRes.data as any[]) || []).map((pack: any) => ({
        ...pack,
        is_installed: installedIds.has(pack.id),
      }));

      setItems(packsWithInstallStatus);
      setCategories(categoriesRes.data as any || []);
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
        category_id: formData.category_id || null,
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

  const loadPackPrompts = async (packId: string) => {
    try {
      const { data, error } = await supabase
        .from("prompt_pack_items" as any)
        .select("*")
        .eq("pack_id", packId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setPackPrompts((data as any) || []);
    } catch (error) {
      console.error("Error loading prompts:", error);
      toast.error("Failed to load prompts");
    }
  };

  const handleManagePrompts = async (pack: MarketplaceItem) => {
    setSelectedPack(pack);
    await loadPackPrompts(pack.id);
    setManagePromptsDialogOpen(true);
  };

  const handleSavePrompt = async () => {
    if (!selectedPack || !promptFormData.title || !promptFormData.prompt_text) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingPromptId) {
        // Update existing prompt
        const { error } = await supabase
          .from("prompt_pack_items" as any)
          .update({
            title: promptFormData.title,
            prompt_text: promptFormData.prompt_text,
          })
          .eq("id", editingPromptId);

        if (error) throw error;
        toast.success("Prompt updated successfully");
      } else {
        // Create new prompt
        const maxOrder = packPrompts.length > 0 
          ? Math.max(...packPrompts.map(p => p.order_index))
          : -1;

        const { error } = await supabase
          .from("prompt_pack_items" as any)
          .insert({
            pack_id: selectedPack.id,
            title: promptFormData.title,
            prompt_text: promptFormData.prompt_text,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
        toast.success("Prompt added successfully");
      }

      setPromptFormData({ title: "", prompt_text: "" });
      setEditingPromptId(null);
      await loadPackPrompts(selectedPack.id);
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save prompt");
    }
  };

  const handleEditPrompt = (prompt: PromptPackItem) => {
    setPromptFormData({
      title: prompt.title,
      prompt_text: prompt.prompt_text,
    });
    setEditingPromptId(prompt.id);
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const { error } = await supabase
        .from("prompt_pack_items" as any)
        .delete()
        .eq("id", promptId);

      if (error) throw error;

      toast.success("Prompt deleted");
      if (selectedPack) await loadPackPrompts(selectedPack.id);
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Failed to delete prompt");
    }
  };

  const handleCancelEdit = () => {
    setPromptFormData({ title: "", prompt_text: "" });
    setEditingPromptId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
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

  const filterItems = (itemsList: MarketplaceItem[]) => {
    let filtered = itemsList;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const myItems = filterItems(items.filter(item => {
    if (activeTab !== 'myshared') return false;
    return item.created_by === currentUserId;
  }));

  const browseItems = filterItems(items.filter(item => {
    if (activeTab !== 'browse') return false;
    return item.visibility === 'public' || item.created_by === currentUserId;
  }));

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
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        {/* Search and Category Filters */}
        <div className="space-y-4 mt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search prompt packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setSelectedCategory("all")}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                      </div>
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

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleManagePrompts(item)}
                    className="w-full"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Manage Prompts
                  </Button>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Manage Prompts Dialog */}
      <Dialog open={managePromptsDialogOpen} onOpenChange={setManagePromptsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Prompts - {selectedPack?.name}</DialogTitle>
            <DialogDescription>
              Add, edit, or remove prompts from this pack
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add/Edit Prompt Form */}
            <Card className="p-4 bg-muted/50">
              <div className="space-y-4">
                <h3 className="font-semibold">{editingPromptId ? "Edit Prompt" : "Add New Prompt"}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt-title">Title *</Label>
                  <Input
                    id="prompt-title"
                    value={promptFormData.title}
                    onChange={(e) => setPromptFormData({ ...promptFormData, title: e.target.value })}
                    placeholder="e.g., Generate Email Response"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt-text">Prompt Text *</Label>
                  <Textarea
                    id="prompt-text"
                    value={promptFormData.prompt_text}
                    onChange={(e) => setPromptFormData({ ...promptFormData, prompt_text: e.target.value })}
                    placeholder="Enter your prompt text here..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  {editingPromptId && (
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                  <Button onClick={handleSavePrompt}>
                    {editingPromptId ? "Update Prompt" : "Add Prompt"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Existing Prompts List */}
            <div className="space-y-3">
              <h3 className="font-semibold">Prompts in this Pack ({packPrompts.length})</h3>
              
              {packPrompts.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  No prompts added yet. Add your first prompt above!
                </Card>
              ) : (
                <div className="space-y-2">
                  {packPrompts.map((prompt, index) => (
                    <Card key={prompt.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <h4 className="font-semibold">{prompt.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 font-mono">
                            {prompt.prompt_text}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPrompt(prompt)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(prompt.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptMarketplace;
