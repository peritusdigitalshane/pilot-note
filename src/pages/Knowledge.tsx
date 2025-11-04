import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, FileText, Database, Upload, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  file_url?: string;
  embedding?: any;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

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

    setIsSuperAdmin(!!roles);
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
      .select("id, title, content, created_at, file_url, embedding")
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

    setIsProcessing(true);

    try {
      let fileUrl = null;
      let extractedContent = docContent;
      let finalTitle = docTitle;

      // Handle file upload
      if (uploadMode === "file" && uploadedFile) {
        // Upload file to storage
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${selectedKB.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('knowledge-documents')
          .upload(fileName, uploadedFile);

        if (uploadError) {
          toast({ title: "Upload Error", description: uploadError.message, variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        fileUrl = fileName;

        // Use filename as title if not provided
        if (!finalTitle) {
          finalTitle = uploadedFile.name.replace(/\.[^/.]+$/, "");
        }
        
        extractedContent = `[File uploaded: ${uploadedFile.name}]\n\nThis document has been uploaded and will be processed for text extraction.`;
      }

      // Validate we have required fields
      if (!finalTitle || !extractedContent) {
        toast({ 
          title: "Error", 
          description: "Title and content are required", 
          variant: "destructive" 
        });
        setIsProcessing(false);
        return;
      }

      // Insert and get the document ID immediately
      const { data: newDoc, error } = await supabase
        .from("knowledge_base_documents" as any)
        .insert({
          knowledge_base_id: selectedKB.id,
          title: finalTitle,
          content: extractedContent,
          file_url: fileUrl,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (error || !newDoc) {
        toast({ title: "Error", description: error?.message || "Failed to add document", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      // Generate embeddings immediately with the document ID
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: { documentId: (newDoc as any).id }
      });

      if (embeddingError) {
        console.error('Failed to generate embeddings:', embeddingError);
        toast({ 
          title: "Embedding Generation Failed", 
          description: (embeddingData as any)?.error || embeddingError.message || "Please check your OpenAI API key has access to text-embedding-3-small model",
          variant: "destructive"
        });
      }

      toast({ 
        title: "Success", 
        description: uploadMode === "file" 
          ? "Document uploaded and being processed for RAG" 
          : "Document added and being processed for RAG" 
      });
      setDocTitle("");
      setDocContent("");
      setUploadedFile(null);
      setUploadMode("text");
      setDocDialogOpen(false);
      selectKnowledgeBase(selectedKB);
    } catch (error) {
      console.error("Error adding document:", error);
      toast({ 
        title: "Error", 
        description: "Failed to add document", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
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

  const batchGenerateEmbeddings = async () => {
    if (!selectedKB) return;

    setIsBatchProcessing(true);
    toast({ title: "Processing", description: "Generating embeddings for all documents..." });

    try {
      const { data, error } = await supabase.functions.invoke('batch-generate-embeddings', {
        body: { knowledgeBaseId: selectedKB.id }
      });

      if (error) {
        throw error;
      }

      const result = data as any;
      toast({ 
        title: "Complete", 
        description: result.message || `Processed ${result.processed} documents`,
      });

      // Refresh documents to show updated embedding status
      selectKnowledgeBase(selectedKB);
    } catch (error) {
      console.error('Batch embedding error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate embeddings", 
        variant: "destructive" 
      });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const regenerateEmbedding = async (documentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { documentId }
      });

      if (error) {
        console.error('Regenerate embedding error:', error);
        toast({ 
          title: "Embedding Generation Failed", 
          description: (data as any)?.error || error.message || "Check your OpenAI API key has access to text-embedding-3-small",
          variant: "destructive" 
        });
        return;
      }

      toast({ title: "Success", description: "Embedding regenerated" });
      if (selectedKB) selectKnowledgeBase(selectedKB);
    } catch (error) {
      console.error('Regenerate embedding error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to regenerate embedding", 
        variant: "destructive" 
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen p-6 flex items-center justify-centre">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      <header className="space-y-4">
        <div className="flex items-centre gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Knowledge Bases</h1>
            <p className="text-sm text-muted-foreground">
              {isSuperAdmin 
                ? "Manage documentation and information for AI models" 
                : "Create and manage your own knowledge bases for chat"}
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={batchGenerateEmbeddings} 
                      disabled={isBatchProcessing || documents.length === 0}
                    >
                      {isBatchProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Embeddings
                        </>
                      )}
                    </Button>
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
                      <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "text" | "file")}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="text">Text Input</TabsTrigger>
                          <TabsTrigger value="file">File Upload</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="text" className="space-y-4">
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
                          <Button onClick={addDocument} className="w-full" disabled={!docTitle || !docContent || isProcessing}>
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              "Add Document"
                            )}
                          </Button>
                        </TabsContent>
                        
                        <TabsContent value="file" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="docTitleFile">Title (Optional)</Label>
                            <Input
                              id="docTitleFile"
                              value={docTitle}
                              onChange={(e) => setDocTitle(e.target.value)}
                              placeholder="Auto-generated from filename"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fileUpload">Upload Document</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                              <Input
                                id="fileUpload"
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.md"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setUploadedFile(file);
                                    if (!docTitle) {
                                      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
                                    }
                                  }
                                }}
                                className="hidden"
                              />
                              <label htmlFor="fileUpload" className="cursor-pointer">
                                <Upload className="w-12 h-12 text-primary/50 mx-auto mb-2" />
                                <p className="text-sm font-medium">
                                  {uploadedFile ? uploadedFile.name : "Click to upload or drag and drop"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, DOC, DOCX, TXT, MD up to 20MB
                                </p>
                              </label>
                            </div>
                          </div>
                          <Button onClick={addDocument} className="w-full" disabled={!uploadedFile || isProcessing}>
                            {isProcessing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload & Add Document
                              </>
                            )}
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  </div>
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                              {doc.embedding ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                                  <Sparkles className="w-3 h-3" />
                                  Embedded
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                                  No Embedding
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {!doc.embedding && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => regenerateEmbedding(doc.id)}
                                className="h-8 w-8"
                                title="Generate embedding"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDocument(doc.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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