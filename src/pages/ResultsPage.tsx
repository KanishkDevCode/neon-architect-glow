import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThresholdPanel } from '@/components/ThresholdPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Cpu, 
  Zap, 
  Download, 
  Image as ImageIcon, 
  FileText, 
  Package,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

// PASTE YOUR NGROK URL HERE (without /process - it will be added automatically)
const BACKEND_URL = 'https://353f22ceeb2b.ngrok-free.app';

interface ProcessingResult {
  zipBlobUrl?: string;
  // Individual files that would be extracted from ZIP
  segmentationFiles?: {
    wall_detection_annotated?: string;
    room_detection_annotated?: string;
    object_detection_annotated?: string;
    composite_overlay?: string;
  };
  vectorizationFiles?: {
    polygons_output?: string;
  };
  modelFiles?: {
    floorplan_model?: string;
  };
}

export default function ResultsPage() {
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [isApplyingThresholds, setIsApplyingThresholds] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have results
    const zipUrl = localStorage.getItem('resultsZipUrl');
    if (!zipUrl) {
      navigate('/');
      return;
    }

    // Set initial results (in a real app, you'd extract the ZIP or get individual file URLs)
    setResults({
      zipBlobUrl: zipUrl,
      // For demo purposes, we'll use placeholder URLs
      // In a real implementation, these would come from extracting the ZIP
      segmentationFiles: {
        wall_detection_annotated: zipUrl, // Placeholder
        room_detection_annotated: zipUrl, // Placeholder
        object_detection_annotated: zipUrl, // Placeholder
        composite_overlay: zipUrl, // Placeholder
      },
      vectorizationFiles: {
        polygons_output: zipUrl, // Placeholder
      },
      modelFiles: {
        floorplan_model: zipUrl, // Placeholder
      },
    });
  }, [navigate]);

  const handleApplyThresholds = async (thresholds: Record<string, number>) => {
    const imageData = localStorage.getItem('selectedImage');
    const imageUrl = localStorage.getItem('selectedImageUrl');
    
    if (!imageData || !imageUrl) {
      toast({
        title: "Error",
        description: "Original image not found. Please start over.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsApplyingThresholds(true);

    try {
      // Fetch the original image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], JSON.parse(imageData).name, { type: JSON.parse(imageData).type });

      const formData = new FormData();
      formData.append('image', file);

      Object.entries(thresholds).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const backendResponse = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) {
        throw new Error('Backend threshold processing failed');
      }

      const zipBlob = await backendResponse.blob();
      const newZipUrl = URL.createObjectURL(zipBlob);
      
      // Update results with new ZIP
      setResults(prev => prev ? {
        ...prev,
        zipBlobUrl: newZipUrl,
      } : null);

      // Update localStorage
      localStorage.setItem('resultsZipUrl', newZipUrl);

      toast({
        title: "Thresholds Applied",
        description: "Results updated with new threshold values.",
      });
    } catch (error) {
      toast({
        title: "Threshold Update Failed",
        description: "Could not apply new thresholds",
        variant: "destructive",
      });
    } finally {
      setIsApplyingThresholds(false);
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleNewAnalysis = () => {
    // Clear stored data
    localStorage.removeItem('selectedImage');
    localStorage.removeItem('selectedImageUrl');
    localStorage.removeItem('resultsZipUrl');
    navigate('/');
  };

  if (!results) {
    return (
      <div className="min-h-screen matrix-lines flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen matrix-lines">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cpu className="w-12 h-12 text-primary neon-glow animate-pulse" />
            <h1 className="text-4xl font-bold neon-text">
              Analysis Results
            </h1>
            <Zap className="w-8 h-8 text-neon-green neon-glow animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground">
            Your floorplan has been successfully processed
          </p>
          <div className="h-1 w-24 mx-auto mt-4 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={handleNewAnalysis}
            variant="outline"
            className="neon-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Threshold Panel */}
          <div>
            <ThresholdPanel
              onApplyThresholds={handleApplyThresholds}
              isVisible={true}
              isLoading={isApplyingThresholds}
            />
          </div>

          {/* Results Sections */}
          <div className="space-y-6">
            {/* Image Segmentation Output */}
            <Card className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6 text-neon-blue neon-glow" />
                <h2 className="text-xl font-bold neon-text">Image Segmentation Output</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'wall_detection_annotated', label: 'Wall Detection', color: 'border-neon-blue/30' },
                  { key: 'room_detection_annotated', label: 'Room Detection', color: 'border-neon-green/30' },
                  { key: 'object_detection_annotated', label: 'Object Detection', color: 'border-neon-pink/30' },
                  { key: 'composite_overlay', label: 'Composite Overlay', color: 'border-neon-purple/30' },
                ].map((item) => (
                  <div key={item.key} className={`neon-border ${item.color} rounded-lg p-4 cyber-card`}>
                    <div className="aspect-square bg-muted/20 rounded mb-3 overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop&crop=center`}
                        alt={item.label}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center hidden">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">{item.label}</p>
                      <Button
                        size="sm"
                        onClick={() => downloadFile(results.zipBlobUrl!, `${item.key}.png`)}
                        className="w-full bg-primary/40 hover:bg-primary/60 text-primary-foreground neon-border text-xs font-medium"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Vectorization Output */}
            <Card className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-neon-green neon-glow" />
                <h2 className="text-xl font-bold neon-text">Vectorization Output</h2>
              </div>
              
              <div className="flex items-center justify-between p-4 neon-border rounded-lg cyber-card">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-neon-green" />
                  <div>
                    <p className="font-medium">polygons_output.geojson</p>
                    <p className="text-sm text-muted-foreground">Vector polygons data</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadFile(results.zipBlobUrl!, 'polygons_output.geojson')}
                  className="bg-neon-green/40 hover:bg-neon-green/60 text-card neon-border font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>

            {/* 3D Model */}
            <Card className="cyber-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-neon-pink neon-glow" />
                <h2 className="text-xl font-bold neon-text">3D Model</h2>
              </div>
              
              <div className="flex items-center justify-between p-4 neon-border rounded-lg cyber-card">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neon-pink" />
                  <div>
                    <p className="font-medium">floorplan_model.ifc</p>
                    <p className="text-sm text-muted-foreground">3D building information model</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => downloadFile(results.zipBlobUrl!, 'floorplan_model.ifc')}
                  className="bg-neon-pink/40 hover:bg-neon-pink/60 text-card neon-border font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </Card>

            {/* Download All */}
            <Card className="cyber-card p-6 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-medium text-lg">Complete Package</p>
                    <p className="text-sm text-muted-foreground">All results in ZIP format</p>
                  </div>
                </div>
                <Button
                  onClick={() => downloadFile(results.zipBlobUrl!, 'structify_output.zip')}
                  className="bg-primary/40 hover:bg-primary/60 text-primary-foreground neon-border pulse-glow font-bold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}