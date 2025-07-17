import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Wifi, WifiOff } from 'lucide-react';

interface BackendConnectionProps {
  onConnect: (url: string) => void;
  isConnected: boolean;
  backendUrl: string;
}

export function BackendConnection({ onConnect, isConnected, backendUrl }: BackendConnectionProps) {
  const [url, setUrl] = useState('');

  const handleConnect = () => {
    if (url.trim()) {
      onConnect(url.trim());
    }
  };

  return (
    <Card className="cyber-card p-6 matrix-lines">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-neon-blue neon-glow" />
        <h2 className="text-xl font-bold neon-text">Backend Connection</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Paste your Structify Backend URL (NGROK):
          </label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-ngrok-url.ngrok.io"
              className="neon-border bg-background/50"
              disabled={isConnected}
            />
            <Button 
              onClick={handleConnect}
              disabled={!url.trim() || isConnected}
              className="bg-primary/20 hover:bg-primary/30 neon-border"
            >
              Connect Backend
            </Button>
          </div>
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-green/10 neon-border border-neon-green/30">
            <Wifi className="w-4 h-4 text-neon-green" />
            <Badge variant="secondary" className="bg-neon-green/20 text-neon-green">
              Connected: {backendUrl}/process
            </Badge>
          </div>
        )}

        {!isConnected && url && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <WifiOff className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Not connected</span>
          </div>
        )}
      </div>
    </Card>
  );
}