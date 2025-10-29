import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface VoiceInterfaceProps {
  systemPrompt?: string;
  voice?: string;
  onTranscript?: (text: string, isUser: boolean) => void;
}

export const VoiceInterface = ({ systemPrompt, voice = 'alloy', onTranscript }: VoiceInterfaceProps) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAITranscript] = useState('');
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Event received:', event.type);
    
    switch (event.type) {
      case 'session.updated':
        console.log('Session configuration updated');
        break;
      
      case 'input_audio_buffer.speech_started':
        console.log('User started speaking');
        setUserTranscript('');
        break;
      
      case 'input_audio_buffer.speech_stopped':
        console.log('User stopped speaking');
        break;
      
      case 'conversation.item.input_audio_transcription.completed':
        console.log('User transcript:', event.transcript);
        setUserTranscript(event.transcript);
        onTranscript?.(event.transcript, true);
        break;
      
      case 'response.audio_transcript.delta':
        setAITranscript(prev => prev + event.delta);
        break;
      
      case 'response.audio_transcript.done':
        console.log('AI transcript complete:', event.transcript);
        onTranscript?.(event.transcript, false);
        setAITranscript('');
        break;
      
      case 'response.audio.delta':
        setIsAISpeaking(true);
        break;
      
      case 'response.audio.done':
        setIsAISpeaking(false);
        break;
      
      case 'response.done':
        console.log('Response complete');
        setIsAISpeaking(false);
        break;
      
      case 'error':
        console.error('Realtime API error:', event.error);
        toast({
          title: "Error",
          description: event.error.message || 'An error occurred',
          variant: "destructive",
        });
        break;
    }
  };

  const handleError = (error: string) => {
    toast({
      title: "Connection Error",
      description: error,
      variant: "destructive",
    });
    setIsConnected(false);
  };

  const startConversation = async () => {
    try {
      toast({
        title: "Connecting...",
        description: "Setting up voice connection",
      });

      chatRef.current = new RealtimeChat(handleMessage, handleError);
      await chatRef.current.init(systemPrompt, voice);
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "Voice interface is ready. Start speaking!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to start conversation',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsAISpeaking(false);
    setUserTranscript('');
    setAITranscript('');
    
    toast({
      title: "Disconnected",
      description: "Voice session ended",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {!isConnected ? (
          <Button 
            onClick={startConversation}
            size="lg"
            className="rounded-full w-20 h-20"
          >
            <Mic className="w-8 h-8" />
          </Button>
        ) : (
          <Button 
            onClick={endConversation}
            variant="destructive"
            size="lg"
            className="rounded-full w-20 h-20"
          >
            <MicOff className="w-8 h-8" />
          </Button>
        )}
      </div>

      {isConnected && (
        <Card className="glass-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className={`w-4 h-4 ${isAISpeaking ? 'animate-pulse text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium">
              {isAISpeaking ? 'AI is speaking...' : 'Listening...'}
            </p>
          </div>
          
          {userTranscript && (
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-sm font-medium text-primary mb-1">You said:</p>
              <p className="text-sm">{userTranscript}</p>
            </div>
          )}
          
          {aiTranscript && (
            <div className="p-3 rounded-lg bg-secondary/10">
              <p className="text-sm font-medium text-secondary mb-1">AI:</p>
              <p className="text-sm">{aiTranscript}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
