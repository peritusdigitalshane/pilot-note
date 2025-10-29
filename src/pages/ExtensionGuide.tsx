import { ArrowLeft, Download, Chrome, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import JSZip from "jszip";
import { toast } from "sonner";

const ExtensionGuide = () => {
  const extensionFiles = [
    { name: "manifest.json", path: "/extension/manifest.json", description: "Extension configuration" },
    { name: "popup.html", path: "/extension/popup.html", description: "Extension popup interface" },
    { name: "popup.js", path: "/extension/popup.js", description: "Extension functionality" },
    { name: "popup.css", path: "/extension/popup.css", description: "Extension styles" },
    { name: "supabase.js", path: "/extension/supabase.js", description: "Database connection" },
    { name: "icon16.png", path: "/extension/icon16.png", description: "Extension icon (16x16)" },
    { name: "icon48.png", path: "/extension/icon48.png", description: "Extension icon (48x48)" },
    { name: "icon128.png", path: "/extension/icon128.png", description: "Extension icon (128x128)" },
    { name: "README.md", path: "/extension/README.md", description: "Documentation" },
  ];

  const downloadAllFiles = async () => {
    try {
      toast.info("Preparing download...");
      
      const zip = new JSZip();
      
      // Fetch all files and add them to the zip
      for (const file of extensionFiles) {
        const response = await fetch(file.path);
        const blob = await response.blob();
        zip.file(file.name, blob);
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = "fullpilot-extension.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success("Extension downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download extension. Please try downloading files individually.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"></div>
            <Chrome className="w-10 h-10 text-white relative z-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            FullPilot Prompt Market Place
          </h1>
          <p className="text-muted-foreground text-lg">
            Access your prompts from anywhere on the web
          </p>
        </div>

        {/* Download Section */}
        <Card className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-6 h-6" style={{ color: 'hsl(186 100% 50%)' }} />
            Step 1: Download Extension ZIP File
          </h2>
          <p className="text-muted-foreground mb-6">
            Download the extension as a ZIP file. You'll extract it to a folder on your computer in the next step.
          </p>
          
          <Button 
            onClick={downloadAllFiles}
            size="lg"
            className="w-full mb-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Extension ZIP
          </Button>

          <div className="space-y-2">
            <p className="text-sm font-medium mb-3">Individual files:</p>
            {extensionFiles.map((file) => (
              <a
                key={file.name}
                href={file.path}
                download={file.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div>
                  <p className="font-mono text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.description}</p>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </a>
            ))}
          </div>
        </Card>

        {/* Installation Steps */}
        <Card className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Chrome className="w-6 h-6" style={{ color: 'hsl(186 100% 50%)' }} />
            Step 2: Extract the ZIP File
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Locate the downloaded ZIP file</h3>
                <p className="text-muted-foreground text-sm">
                  Find the <code className="text-xs bg-muted px-2 py-1 rounded">fullpilot-extension.zip</code> file in your Downloads folder.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Extract the ZIP file</h3>
                <p className="text-muted-foreground text-sm">
                  Right-click the ZIP file and select "Extract All" (Windows) or double-click (Mac). Choose a location you'll remember, like your Desktop or Documents folder.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Load in Chrome */}
        <Card className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" style={{ color: 'hsl(186 100% 50%)' }} />
            Step 3: Load Extension in Chrome
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Open Chrome Extensions</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  In Chrome, go to:
                </p>
                <code className="block text-sm bg-muted px-4 py-2 rounded">chrome://extensions/</code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Enable Developer Mode</h3>
                <p className="text-muted-foreground text-sm">
                  Toggle the "Developer mode" switch in the top-right corner.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Load Unpacked Extension</h3>
                <p className="text-muted-foreground text-sm">
                  Click "Load unpacked" button and select the extracted <code className="text-xs bg-muted px-2 py-1 rounded">fullpilot-extension</code> folder.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold" style={{ backgroundColor: 'hsl(186 100% 50% / 0.2)', color: 'hsl(186 100% 50%)' }}>
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">Done!</h3>
                <p className="text-muted-foreground text-sm">
                  The FullPilot Prompt Market Place extension will appear in your Chrome toolbar. Click it to log in and start using your prompts!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card className="glass-card p-8">
          <h2 className="text-2xl font-semibold mb-6">✨ Extension Features</h2>
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Access Your Prompts Anywhere</h3>
                <p className="text-sm text-muted-foreground">Use your installed prompt packs on any website</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Voice Notes</h3>
                <p className="text-sm text-muted-foreground">Record and transcribe voice notes directly from the extension</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Quick Copy</h3>
                <p className="text-sm text-muted-foreground">Search and copy prompts to clipboard instantly</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium">Synced with Your Account</h3>
                <p className="text-sm text-muted-foreground">Always up to date with your installed packs</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExtensionGuide;
