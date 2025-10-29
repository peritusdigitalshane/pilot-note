import { ArrowLeft, Download, Chrome, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ExtensionGuide = () => {
  const extensionFiles = [
    { name: "manifest.json", path: "/extension/manifest.json", description: "Extension configuration" },
    { name: "popup.html", path: "/extension/popup.html", description: "Extension popup interface" },
    { name: "popup.js", path: "/extension/popup.js", description: "Extension functionality" },
    { name: "popup.css", path: "/extension/popup.css", description: "Extension styles" },
    { name: "supabase.js", path: "/extension/supabase.js", description: "Database connection" },
    { name: "README.md", path: "/extension/README.md", description: "Documentation" },
  ];

  const downloadAllFiles = () => {
    extensionFiles.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.path;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chrome Extension Installation Guide
          </h1>
          <p className="text-muted-foreground text-lg">
            Access your prompts from anywhere on the web
          </p>
        </div>

        {/* Download Section */}
        <Card className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-6 h-6 text-purple-500" />
            Step 1: Download Extension Files
          </h2>
          <p className="text-muted-foreground mb-6">
            Download all the required files for the Chrome extension. You'll need to create a folder on your computer to store these files.
          </p>
          
          <Button 
            onClick={downloadAllFiles}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 mb-6"
          >
            <Download className="w-5 h-5 mr-2" />
            Download All Files
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
            <Chrome className="w-6 h-6 text-purple-500" />
            Step 2: Prepare Extension Folder
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Create a new folder</h3>
                <p className="text-muted-foreground text-sm">
                  Create a folder on your computer named "fullpilot-extension" or similar.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Move downloaded files</h3>
                <p className="text-muted-foreground text-sm">
                  Move all the downloaded files into this folder.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Create placeholder icons</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Create three simple icon images (or use any PNG images) with these names:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• <code className="text-xs bg-muted px-2 py-1 rounded">icon16.png</code> (16x16 pixels)</li>
                  <li>• <code className="text-xs bg-muted px-2 py-1 rounded">icon48.png</code> (48x48 pixels)</li>
                  <li>• <code className="text-xs bg-muted px-2 py-1 rounded">icon128.png</code> (128x128 pixels)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: You can use any simple image/logo for these icons. They just need to exist.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Load in Chrome */}
        <Card className="glass-card p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-purple-500" />
            Step 3: Load Extension in Chrome
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Load Unpacked Extension</h3>
                <p className="text-muted-foreground text-sm">
                  Click "Load unpacked" button and select your extension folder.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-2">Done!</h3>
                <p className="text-muted-foreground text-sm">
                  The extension will appear in your Chrome toolbar. Click it to log in and start using your prompts!
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
