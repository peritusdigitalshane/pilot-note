import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Database, Bell, Palette, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      title: "Privacy & Security",
      icon: Shield,
      settings: [
        { id: "encryption", label: "Encrypt data at rest", enabled: true },
        { id: "telemetry", label: "Anonymous usage analytics", enabled: false },
        { id: "cloud", label: "Enable cloud sync (opt-in)", enabled: false },
      ],
    },
    {
      title: "Storage",
      icon: HardDrive,
      settings: [
        { id: "auto-delete", label: "Auto-delete old transcripts", enabled: false },
        { id: "compress", label: "Compress audio files", enabled: true },
      ],
    },
    {
      title: "Models",
      icon: Database,
      settings: [
        { id: "gpu", label: "Prefer GPU acceleration", enabled: true },
        { id: "auto-update", label: "Auto-update models", enabled: false },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      settings: [
        { id: "transcription", label: "Transcription complete", enabled: true },
        { id: "insights", label: "AI insights generated", enabled: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="glass-card">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure FullPilot to your preferences
            </p>
          </div>
        </div>
      </header>

      {/* Privacy First Banner */}
      <Card className="glass-card p-6 border-primary/30">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Privacy First</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FullPilot runs entirely on your device by default. Your voice notes, transcripts,
              and knowledge base never leave your machine unless you explicitly opt-in to cloud
              features. We believe your data is yours.
            </p>
          </div>
        </div>
      </Card>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <Card key={section.title} className="glass-card p-6 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <section.icon className="w-5 h-5 text-primary" />
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <Label htmlFor={setting.id} className="cursor-pointer">
                    {setting.label}
                  </Label>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Storage Info */}
      <Card className="glass-card p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          Storage Usage
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Audio Files</p>
            <p className="text-2xl font-bold">2.4 GB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Models</p>
            <p className="text-2xl font-bold">8.1 GB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Database</p>
            <p className="text-2xl font-bold">124 MB</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">10.6 GB</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
