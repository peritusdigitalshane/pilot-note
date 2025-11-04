import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { promptPacksData } from "@/data/promptPacksData";

const PopulatePrompts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const populatePrompts = async () => {
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const packData of promptPacksData) {
        // Find the pack by name
        const { data: pack, error: packError } = await supabase
          .from("prompt_packs")
          .select("id")
          .eq("name", packData.packName)
          .maybeSingle();

        if (packError || !pack) {
          console.error(`Pack not found: ${packData.packName}`, packError);
          errorCount++;
          continue;
        }

        // Check if prompts already exist
        const { data: existing } = await supabase
          .from("prompt_pack_items")
          .select("id")
          .eq("pack_id", pack.id);

        if (existing && existing.length >= 5) {
          console.log(`Pack ${packData.packName} already has enough prompts`);
          continue;
        }

        // Insert prompts
        for (let i = 0; i < packData.prompts.length; i++) {
          const prompt = packData.prompts[i];
          const { error: insertError } = await supabase
            .from("prompt_pack_items")
            .insert({
              pack_id: pack.id,
              title: prompt.title,
              prompt_text: prompt.text,
              order_index: i + 1
            });

          if (insertError) {
            console.error(`Error inserting prompt: ${prompt.title}`, insertError);
            errorCount++;
          } else {
            successCount++;
          }
        }
      }

      toast({
        title: "Prompts populated",
        description: `Successfully added ${successCount} prompts${errorCount > 0 ? `. ${errorCount} errors occurred.` : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Populate Prompt Packs</CardTitle>
          <CardDescription>
            This utility will add detailed specialized prompts to packs that are missing them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={populatePrompts} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Populating..." : "Populate Prompts"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulatePrompts;
