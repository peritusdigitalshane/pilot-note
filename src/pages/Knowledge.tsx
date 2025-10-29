import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

type Document = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

const Knowledge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // KB form
  const [kbName, setKbName] = useState("");
  const [kbDescription, setKbDescription] = useState("");
  const [kbDialogOpen, setKbDialogOpen] = useState(false);

  // Document form
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [docDialogOpen, setDocDialogOpen] = useState(false);

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
        description: "You must be a super admin to access knowledge bases.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsSuperAdmin(true);
    loadKnowledgeBases();
  };

  const loadKnowledgeBases = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("knowledge_bases" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading knowledge bases:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setKnowledgeBases(data as unknown as KnowledgeBase[]);
      if (data.length > 0 && !selectedKB) {
        selectKnowledgeBase(data[0] as unknown as KnowledgeBase);
      }
    }
    setLoading(false);
  };

  const selectKnowledgeBase = async (kb: KnowledgeBase) => {
    setSelectedKB(kb);
    const { data, error } = await supabase
      .from("knowledge_base_documents" as any)
      .select("*")
      .eq("knowledge_base_id", kb.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading documents:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setDocuments(data as unknown as Document[]);
    }
  };

  const createKnowledgeBase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("knowledge_bases" as any).insert({
      name: kbName,
      description: kbDescription,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Knowledge base created" });
    setKbName("");
    setKbDescription("");
    setKbDialogOpen(false);
    loadKnowledgeBases();
  };

  const deleteKnowledgeBase = async (id: string) => {
    const { error } = await supabase.from("knowledge_bases" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Knowledge base deleted" });
    setSelectedKB(null);
    setDocuments([]);
    loadKnowledgeBases();
  };

  const addDocument = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedKB) return;

    const { error } = await supabase.from("knowledge_base_documents" as any).insert({
      knowledge_base_id: selectedKB.id,
      title: docTitle,
      content: docContent,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Document added" });
    setDocTitle("");
    setDocContent("");
    setDocDialogOpen(false);
    selectKnowledgeBase(selectedKB);
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase.from("knowledge_base_documents" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Document deleted" });
    if (selectedKB) selectKnowledgeBase(selectedKB);
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Knowledge Bases</h1>
            <p className="text-sm text-muted-foreground">
              Manage documentation and information for AI models
            </p>
          </div>
          <Dialog open={kbDialogOpen} onOpenChange={setKbDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glass-card">
                <Plus className="w-4 h-4 mr-2" />
                New Knowledge Base
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Create Knowledge Base</DialogTitle>
                <DialogDescription>
                  Create a new knowledge base to store documents and information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kbName">Name</Label>
                  <Input
                    id="kbName"
                    value={kbName}
                    onChange={(e) => setKbName(e.target.value)}
                    placeholder="Network Architecture Docs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kbDescription">Description</Label>
                  <Textarea
                    id="kbDescription"
                    value={kbDescription}
                    onChange={(e) => setKbDescription(e.target.value)}
                    placeholder="Documentation about network architecture patterns..."
                    rows={3}
                  />
                </div>
                <Button onClick={createKnowledgeBase} className="w-full" disabled={!kbName}>
                  Create Knowledge Base
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Knowledge Base List */}
        <div className="col-span-12 md:col-span-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Knowledge Bases</CardTitle>
              <CardDescription>Select a knowledge base to manage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {knowledgeBases.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No knowledge bases yet
                </p>
              ) : (
                knowledgeBases.map((kb) => (
                  <div
                    key={kb.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedKB?.id === kb.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => selectKnowledgeBase(kb)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Database className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="font-medium truncate">{kb.name}</p>
                        </div>
                        {kb.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {kb.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteKnowledgeBase(kb.id);
                        }}
                        className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <div className="col-span-12 md:col-span-8">
          {selectedKB ? (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedKB.name}</CardTitle>
                    <CardDescription>{selectedKB.description}</CardDescription>
                  </div>
                  <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Document</DialogTitle>
                        <DialogDescription>
                          Add documentation to {selectedKB.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="docTitle">Title</Label>
                          <Input
                            id="docTitle"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="VPN Configuration Guide"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="docContent">Content</Label>
                          <Textarea
                            id="docContent"
                            value={docContent}
                            onChange={(e) => setDocContent(e.target.value)}
                            placeholder="Enter the document content..."
                            rows={12}
                          />
                        </div>
                        <Button onClick={addDocument} className="w-full" disabled={!docTitle || !docContent}>
                          Add Document
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No documents in this knowledge base</p>
                    <Button onClick={() => setDocDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Document
                    </Button>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <Card key={doc.id} className="border-border/50 hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocument(doc.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{doc.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Database className="w-16 h-16 text-primary/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a knowledge base to view and manage documents
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;