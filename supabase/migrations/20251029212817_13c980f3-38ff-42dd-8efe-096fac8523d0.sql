-- Allow users to create their own prompt packs
CREATE POLICY "Users can create own prompt packs"
ON prompt_packs
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own prompt packs
CREATE POLICY "Users can update own prompt packs"
ON prompt_packs
FOR UPDATE
USING (auth.uid() = created_by);

-- Allow users to delete their own prompt packs
CREATE POLICY "Users can delete own prompt packs"
ON prompt_packs
FOR DELETE
USING (auth.uid() = created_by);

-- Allow users to create items in their own prompt packs
CREATE POLICY "Users can create items in own packs"
ON prompt_pack_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM prompt_packs
  WHERE prompt_packs.id = prompt_pack_items.pack_id
  AND prompt_packs.created_by = auth.uid()
));

-- Allow users to update items in their own prompt packs
CREATE POLICY "Users can update items in own packs"
ON prompt_pack_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM prompt_packs
  WHERE prompt_packs.id = prompt_pack_items.pack_id
  AND prompt_packs.created_by = auth.uid()
));

-- Allow users to delete items in their own prompt packs
CREATE POLICY "Users can delete items in own packs"
ON prompt_pack_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM prompt_packs
  WHERE prompt_packs.id = prompt_pack_items.pack_id
  AND prompt_packs.created_by = auth.uid()
));