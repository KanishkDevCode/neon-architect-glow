// ResultsPage.tsx
// npm install jszip

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
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
const BACKEND_URL = 'https://5f0f3145b5f2.ngrok-free.app';

// Util: sanitize filename for mapping
const stripExt = (filename: string) =>
  filename.replace(/\.jpg$|\.geojson$|\.glb$/, '');

export default function ResultsPage() {
  const [segmentationImages, setSegmentationImages] = useState<Record<string, string>>({});
  const [vectorizationFiles, setVectorizationFiles] = useState<Record<string, string>>({});
  const [modelFiles, setModelFiles] = useState<Record<string, string>>({});
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [isApplyingThresholds, setIsApplyingThresholds] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const zipUrl = localStorage.getItem('resultsZipUrl');
    if (!zipUrl) {
      navigate('/');
      return;
    }
    setZipBlobUrl(zipUrl);

    const fetchAndExtractZip = async () => {
      setLoading(true);
      try {
        const res = await fetch(zipUrl);
        const zipBlob = await res.blob();
        const zip = await JSZip.loadAsync(zipBlob);

        const segImages: Record<string, string> = {};
        for (const key of [
          'wall_detection_annotated.jpg',
          'room_detection_annotated.jpg',
          'object_detection_annotated.jpg',
          'composite_overlay.jpg'
        ]) {
          if (zip.files[key]) {
            const fileBlob = await zip.files[key].async('blob');
            segImages[stripExt(key)] = URL.createObjectURL(fileBlob);
          }
        }
        setSegmentationImages(segImages);

        const vecFiles: Record<string, string> = {};
        for (const key of ['polygons_output.geojson']) {
          if (zip.files[key]) {
            const fileBlob = await zip.files[key].async('blob');
            vecFiles[stripExt(key)] = URL.createObjectURL(fileBlob);
          }
        }
        setVectorizationFiles(vecFiles);

        const modFiles: Record<string, string> = {};
        for (const key of ['floorplan_scene_final.glb']) {
          if (zip.files[key]) {
            const fileBlob = await zip.files[key].async('blob');
            modFiles[stripExt(key)] = URL.createObjectURL(fileBlob);
          }
        }
        setModelFiles(modFiles);

        setError(null);
      } catch (e) {
        setError('Failed to load results: ' + (e instanceof Error ? e.message : e));
      } finally {
        setLoading(false);
      }
    };
    fetchAndExtractZip();

    return () => {
      Object.values(segmentationImages).forEach(URL.revokeObjectURL);
      Object.values(vectorizationFiles).forEach(URL.revokeObjectURL);
      Object.values(modelFiles).forEach(URL.revokeObjectURL);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setZipBlobUrl(newZipUrl);
      localStorage.setItem('resultsZipUrl', newZipUrl);
      toast({
        title: "Thresholds Applied",
        description: "Results updated with new threshold values.",
      });

      // Re-extract and update all outputs from new ZIP
      const zip = await JSZip.loadAsync(zipBlob);

      const segImages: Record<string, string> = {};
      for (const key of [
        'wall_detection_annotated.jpg',
        'room_detection_annotated.jpg',
        'object_detection_annotated.jpg',
        'composite_overlay.jpg'
      ]) {
        if (zip.files[key]) {
          const fileBlob = await zip.files[key].async('blob');
          segImages[stripExt(key)] = URL.createObjectURL(fileBlob);
        }
      }
      setSegmentationImages(segImages);

      const vecFiles: Record<string, string> = {};
      for (const key of ['polygons_output.geojson']) {
        if (zip.files[key]) {
          const fileBlob = await zip.files[key].async('blob');
          vecFiles[stripExt(key)] = URL.createObjectURL(fileBlob);
        }
      }
      setVectorizationFiles(vecFiles);

      const modFiles: Record<string, string> = {};
      for (const key of ['floorplan_scene_final.glb']) {
        if (zip.files[key]) {
          const fileBlob = await zip.files[key].async('blob');
          modFiles[stripExt(key)] = URL.createObjectURL(fileBlob);
        }
      }
      setModelFiles(modFiles);
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
    localStorage.removeItem('selectedImage');
    localStorage.removeItem('selectedImageUrl');
    localStorage.removeItem('resultsZipUrl');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen matrix-lines flex items-center justify-center">
        <div className="text-center text-neon-blue animate-pulse">Loading results...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen matrix-lines flex items-center justify-center">
        <div className="text-center text-destructive">{error}</div>
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
        <div className="flex gap-4 justify-center mb-8">
          <Button onClick={handleNewAnalysis} variant="outline" className="neon-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <ThresholdPanel
              onApplyThresholds={handleApplyThresholds}
              isVisible={true}
              isLoading={isApplyingThresholds}
            />
          </div>
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
                        src={segmentationImages[item.key] || ''}
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
                        onClick={() => {
                          const filename = item.key + ".jpg";
                          if (segmentationImages[item.key]) {
                            downloadFile(segmentationImages[item.key], filename);
                          }
                        }}
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
                  onClick={() => {
                    if (vectorizationFiles['polygons_output']) {
                      downloadFile(vectorizationFiles['polygons_output'], 'polygons_output.geojson');
                    }
                  }}
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
                    <p className="font-medium">floorplan_scene_final.glb</p>
                    <p className="text-sm text-muted-foreground">3D floorplan model (GLB)</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (modelFiles['floorplan_scene_final']) {
                      downloadFile(modelFiles['floorplan_scene_final'], 'floorplan_scene_final.glb');
                    }
                  }}
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
                  onClick={() => {
                    if (zipBlobUrl) downloadFile(zipBlobUrl, 'structify_output.zip');
                  }}
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
