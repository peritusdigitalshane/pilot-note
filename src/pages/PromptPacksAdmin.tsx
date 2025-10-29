import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Package, Home, Settings, Users, LayoutDashboard } from "lucide-react";

interface PromptPackItem {
  id: string;
  title: string;
  prompt_text: string;
  order_index: number;
}

interface PromptPack {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  install_count: number;
  created_at: string;
  prompt_pack_items?: PromptPackItem[];
}

const PromptPacksAdmin = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<PromptPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPack, setEditingPack] = useState<PromptPack | null>(null);
  const [editingItem, setEditingItem] = useState<PromptPackItem | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [packDialogOpen, setPackDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isSuperAdmin = roles?.some((r: any) => r.role === "super_admin");
      if (!isSuperAdmin) {
        toast.error("Access denied. Super admin only.");
        navigate("/");
        return;
      }

      await loadPacks();
    } catch (error) {
      console.error("Error checking auth:", error);
      navigate("/auth");
    }
  };

  const loadPacks = async () => {
    try {
      const { data, error } = await supabase
        .from("prompt_packs")
        .select(`
          id,
          name,
          description,
          is_active,
          install_count,
          created_at,
          prompt_pack_items:prompt_pack_items(
            id,
            title,
            prompt_text,
            order_index
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const packsWithSortedItems = ((data as any[]) || []).map((pack: any) => ({
        ...pack,
        prompt_pack_items: (pack.prompt_pack_items || []).sort(
          (a: any, b: any) => a.order_index - b.order_index
        ),
      }));

      setPacks(packsWithSortedItems);
    } catch (error) {
      console.error("Error loading packs:", error);
      toast.error("Failed to load prompt packs");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const is_active = formData.get("is_active") === "on";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingPack) {
        const { error } = await supabase
          .from("prompt_packs")
          .update({ name, description, is_active })
          .eq("id", editingPack.id);

        if (error) throw error;
        toast.success("Prompt pack updated");
      } else {
        const { error } = await supabase
          .from("prompt_packs")
          .insert({ name, description, is_active, created_by: user.id });

        if (error) throw error;
        toast.success("Prompt pack created");
      }

      setPackDialogOpen(false);
      setEditingPack(null);
      loadPacks();
    } catch (error) {
      console.error("Error saving pack:", error);
      toast.error("Failed to save prompt pack");
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm("Delete this prompt pack and all its prompts?")) return;

    try {
      const { error } = await supabase
        .from("prompt_packs")
        .delete()
        .eq("id", packId);

      if (error) throw error;
      toast.success("Prompt pack deleted");
      loadPacks();
    } catch (error) {
      console.error("Error deleting pack:", error);
      toast.error("Failed to delete prompt pack");
    }
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPackId) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const prompt_text = formData.get("prompt_text") as string;

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("prompt_pack_items")
          .update({ title, prompt_text })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Prompt updated");
      } else {
        const pack = packs.find((p) => p.id === selectedPackId);
        const maxOrder = Math.max(
          ...(pack?.prompt_pack_items?.map((i) => i.order_index) || [0]),
          -1
        );

        const { error } = await supabase
          .from("prompt_pack_items")
          .insert({
            pack_id: selectedPackId,
            title,
            prompt_text,
            order_index: maxOrder + 1,
          });

        if (error) throw error;
        toast.success("Prompt added");
      }

      setItemDialogOpen(false);
      setEditingItem(null);
      loadPacks();
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Failed to save prompt");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this prompt?")) return;

    try {
      const { error } = await supabase
        .from("prompt_pack_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Prompt deleted");
      loadPacks();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete prompt");
    }
  };

  const handleMoveItem = async (item: PromptPackItem, direction: "up" | "down") => {
    const pack = packs.find((p) => p.prompt_pack_items?.some((i) => i.id === item.id));
    if (!pack?.prompt_pack_items) return;

    const items = [...pack.prompt_pack_items];
    const index = items.findIndex((i) => i.id === item.id);
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= items.length) return;

    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    try {
      const updates = items.map((item, idx) => ({
        id: item.id,
        order_index: idx,
      }));

      for (const update of updates) {
        await supabase
          .from("prompt_pack_items")
          .update({ order_index: update.order_index })
          .eq("id", update.id);
      }

      toast.success("Order updated");
      loadPacks();
    } catch (error) {
      console.error("Error reordering:", error);
      toast.error("Failed to reorder prompts");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center gap-4 px-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <Home className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Prompt Pack Management</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" onClick={() => navigate("/users")}>
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
          </nav>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-muted-foreground">Manage global prompt packs for all users</p>
          </div>
          <Dialog open={packDialogOpen} onOpenChange={setPackDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingPack(null)}>
                <Plus className="mr-2 h-4 w-4" />
                New Pack
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingPack ? "Edit" : "Create"} Prompt Pack</DialogTitle>
                <DialogDescription>
                  {editingPack ? "Update" : "Create a new"} prompt pack
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSavePack} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingPack?.name}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingPack?.description}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={editingPack?.is_active ?? true}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6">
          {packs.map((pack) => (
            <Card key={pack.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {pack.name}
                      {!pack.is_active && (
                        <span className="text-sm font-normal text-muted-foreground">(Inactive)</span>
                      )}
                    </CardTitle>
                    <CardDescription>{pack.description}</CardDescription>
                    <div className="text-sm text-muted-foreground mt-2">
                      {pack.install_count} installs
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPack(pack);
                        setPackDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePack(pack.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Prompts ({pack.prompt_pack_items?.length || 0})</h3>
                  <Dialog open={itemDialogOpen && selectedPackId === pack.id} onOpenChange={(open) => {
                    setItemDialogOpen(open);
                    if (open) setSelectedPackId(pack.id);
                    else { setSelectedPackId(null); setEditingItem(null); }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Prompt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit" : "Add"} Prompt</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSaveItem} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            name="title"
                            defaultValue={editingItem?.title}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="prompt_text">Prompt Text</Label>
                          <Textarea
                            id="prompt_text"
                            name="prompt_text"
                            defaultValue={editingItem?.prompt_text}
                            rows={8}
                            required
                          />
                        </div>
                        <Button type="submit">Save</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  {pack.prompt_pack_items?.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveItem(item, "up")}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveItem(item, "down")}
                          disabled={idx === (pack.prompt_pack_items?.length || 0) - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.prompt_text}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setSelectedPackId(pack.id);
                            setItemDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!pack.prompt_pack_items || pack.prompt_pack_items.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No prompts yet. Add your first prompt above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptPacksAdmin;
