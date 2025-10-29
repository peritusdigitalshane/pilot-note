import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Cpu, Database, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Models = () => {
  const navigate = useNavigate();

  const models = [
    {
      id: 1,
      name: "Whisper Large v3",
      type: "Speech-to-Text",
      status: "active",
      size: "2.9 GB",
      accuracy: "95%",
      device: "GPU",
      description: "OpenAI's latest transcription model with multilingual support",
    },
    {
      id: 2,
      name: "Llama 3.1 8B",
      type: "Language Model",
      status: "active",
      size: "4.7 GB",
      accuracy: "92%",
      device: "GPU",
      description: "Meta's efficient LLM for text generation and RAG",
    },
    {
      id: 3,
      name: "BAAI/bge-base-en-v1.5",
      type: "Embeddings",
      status: "active",
      size: "438 MB",
      accuracy: "88%",
      device: "CPU",
      description: "Semantic embeddings for knowledge base search",
    },
    {
      id: 4,
      name: "GPT-4o Mini",
      type: "Language Model",
      status: "available",
      size: "Cloud",
      accuracy: "97%",
      device: "API",
      description: "Cloud-based model for complex reasoning (opt-in)",
    },
  ];

  const systemInfo = {
    gpu: "NVIDIA RTX 4090",
    vram: "24 GB",
    ram: "64 GB",
    storage: "512 GB SSD",
  };

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Model Manager</h1>
            <p className="text-sm text-muted-foreground">
              Manage your local and cloud AI models
            </p>
          </div>
        </div>
      </header>

      {/* System Info */}
      <Card className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" />
          System Resources
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">GPU</p>
            <p className="font-semibold">{systemInfo.gpu}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">VRAM</p>
            <p className="font-semibold">{systemInfo.vram}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">RAM</p>
            <p className="font-semibold">{systemInfo.ram}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Storage</p>
            <p className="font-semibold">{systemInfo.storage}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">VRAM Usage</span>
            <span className="font-semibold">8.3 GB / 24 GB</span>
          </div>
          <Progress value={35} className="h-2" />
        </div>
      </Card>

      {/* Models List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Models</h2>
        <div className="grid gap-4">
          {models.map((model) => (
            <Card key={model.id} className="glass-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">{model.name}</h3>
                    {model.status === "active" ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                </div>
                {model.status === "available" && (
                  <Button size="sm" variant="outline" className="glass-card">
                    <Download className="w-4 h-4 mr-2" />
                    Install
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{model.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{model.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Device:</span>
                  <Badge variant="secondary" className="text-xs">
                    {model.device}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-medium text-primary">{model.accuracy}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Models;
