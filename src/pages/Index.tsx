import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ProcessingAnimation } from '@/components/ProcessingAnimation';
import { ThresholdPanel } from '@/components/ThresholdPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Zap } from 'lucide-react';

// PASTE YOUR NGROK URL HERE (without /process - it will be added automatically)
const BACKEND_URL = 'https://your-ngrok-url.ngrok.io';

interface ProcessingResult {
  wallImage?: string;
  roomImage?: string;
  objectImage?: string;
  overlayImage?: string;
  geojsonUrl?: string;
  ifcUrl?: string;
  zipUrl?: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [isApplyingThresholds, setIsApplyingThresholds] = useState(false);
  const { toast } = useToast();

  const simulateProcessing = async () => {
    const steps = ['Analyzing', 'Segmenting', 'Vectorizing', 'Generating'];
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const handleImageUpload = async (file: File) => {
    setSelectedImage(file);
    setIsProcessing(true);
    setCurrentStep(0);
    setResults(null);

    try {
      // Simulate processing steps
      await simulateProcessing();

      // Real API call to your backend
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Backend processing failed');
      }

      const results = await response.json();
      setResults(results);
      
      toast({
        title: "Processing Complete",
        description: "Floorplan analysis finished successfully",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred during processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep(0);
    }
  };

  const handleApplyThresholds = async (thresholds: Record<string, number>) => {
    if (!selectedImage) return;

    setIsApplyingThresholds(true);

    try {
      // Real API call with thresholds
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      Object.entries(thresholds).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Backend threshold processing failed');
      }

      const results = await response.json();
      setResults(results);

      toast({
        title: "Thresholds Applied",
        description: "Results updated with new threshold values",
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

  return (
    <div className="min-h-screen matrix-lines">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cpu className="w-12 h-12 text-primary neon-glow animate-pulse" />
            <h1 className="text-4xl font-bold neon-text">
              Structify AI
            </h1>
            <Zap className="w-8 h-8 text-neon-green neon-glow animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground">
            Advanced Floorplan Analysis & 3D Model Generation
          </p>
          <div className="h-1 w-24 mx-auto mt-4 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
        </div>

        {/* Main Grid */}
        <div className={`grid gap-6 ${results ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 place-items-center'}`}>
          {/* Left Column */}
          <div className={`space-y-6 ${!results ? 'max-w-md w-full' : ''}`}>
            <ImageUpload
              onImageSelect={handleImageUpload}
              selectedImage={selectedImage}
              disabled={isProcessing}
            />

            {isProcessing && (
              <ProcessingAnimation
                isProcessing={isProcessing}
                currentStep={currentStep}
              />
            )}
          </div>

          {/* Right Column - Only show when there are results */}
          {results && (
            <div className="space-y-6">
              <ThresholdPanel
                onApplyThresholds={handleApplyThresholds}
                isVisible={!!results && !isProcessing}
                isLoading={isApplyingThresholds}
              />

              <ResultsPanel
                results={results}
                isVisible={!!results && !isProcessing}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
