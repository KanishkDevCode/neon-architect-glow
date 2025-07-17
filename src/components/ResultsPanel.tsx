import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Image as ImageIcon, FileText, Package } from 'lucide-react';

interface ProcessingResult {
  wallImage?: string;
  roomImage?: string;
  objectImage?: string;
  overlayImage?: string;
  geojsonUrl?: string;
  ifcUrl?: string;
  zipUrl?: string;
}

interface ResultsPanelProps {
  results: ProcessingResult | null;
  isVisible: boolean;
}

export function ResultsPanel({ results, isVisible }: ResultsPanelProps) {
  if (!isVisible || !results) return null;

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const imageResults = [
    { 
      src: results.wallImage, 
      title: 'Wall Annotations', 
      description: 'Detected wall structures',
      color: 'border-neon-blue/30'
    },
    { 
      src: results.roomImage, 
      title: 'Room Annotations', 
      description: 'Segmented room areas',
      color: 'border-neon-green/30'
    },
    { 
      src: results.objectImage, 
      title: 'Object Annotations', 
      description: 'Identified furniture and objects',
      color: 'border-neon-pink/30'
    },
    { 
      src: results.overlayImage, 
      title: 'Final Overlay', 
      description: 'Complete analysis overlay',
      color: 'border-neon-purple/30'
    },
  ].filter(item => item.src);

  return (
    <Card className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-6 h-6 text-neon-cyan neon-glow" />
        <h2 className="text-xl font-bold neon-text">Processing Results</h2>
      </div>

      <div className="space-y-6">
        {/* Image Results */}
        {imageResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              Generated Images
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imageResults.map((item, index) => (
                <div key={index} className={`neon-border ${item.color} rounded-lg overflow-hidden cyber-card`}>
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(item.src!, `${item.title.toLowerCase().replace(/\s+/g, '_')}.png`)}
                        className="neon-border"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Downloads */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Download Files
          </h3>
          <div className="grid gap-3">
            {results.geojsonUrl && (
              <div className="flex items-center justify-between p-4 neon-border rounded-lg cyber-card">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neon-green" />
                  <div>
                    <p className="font-medium">GeoJSON File</p>
                    <p className="text-sm text-muted-foreground">Vector data format</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadFile(results.geojsonUrl!, 'floorplan.geojson')}
                  className="bg-neon-green/20 hover:bg-neon-green/30 text-neon-green neon-border"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}

            {results.ifcUrl && (
              <div className="flex items-center justify-between p-4 neon-border rounded-lg cyber-card">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neon-pink" />
                  <div>
                    <p className="font-medium">IFC File</p>
                    <p className="text-sm text-muted-foreground">3D building model</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadFile(results.ifcUrl!, 'floorplan.ifc')}
                  className="bg-neon-pink/20 hover:bg-neon-pink/30 text-neon-pink neon-border"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            )}

            {results.zipUrl && (
              <div className="flex items-center justify-between p-4 neon-border rounded-lg cyber-card bg-primary/10">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Complete Package</p>
                    <p className="text-sm text-muted-foreground">All results in ZIP format</p>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    Recommended
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadFile(results.zipUrl!, 'floorplan_results.zip')}
                  className="bg-primary/20 hover:bg-primary/30 neon-border pulse-glow"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}