-- Create transcriptions table
CREATE TABLE public.transcriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL,
  is_user BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transcriptions
CREATE POLICY "Users can view own transcriptions"
  ON public.transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own transcriptions
CREATE POLICY "Users can create own transcriptions"
  ON public.transcriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own transcriptions
CREATE POLICY "Users can delete own transcriptions"
  ON public.transcriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_transcriptions_user_id ON public.transcriptions(user_id);
CREATE INDEX idx_transcriptions_conversation_id ON public.transcriptions(conversation_id);
CREATE INDEX idx_transcriptions_created_at ON public.transcriptions(created_at DESC);