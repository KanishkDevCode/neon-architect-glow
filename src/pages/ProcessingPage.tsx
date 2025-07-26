import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProcessingAnimation } from '@/components/ProcessingAnimation';
import { useToast } from '@/hooks/use-toast';
import { Cpu, Zap } from 'lucide-react';

// PASTE YOUR NGROK URL HERE (without /process - it will be added automatically)
const BACKEND_URL = 'https://5f0f3145b5f2.ngrok-free.app';

export default function ProcessingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const simulateProcessing = async () => {
    const steps = ['Analyzing', 'Segmenting', 'Vectorizing', 'Generating 3D Model'];
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i + 1);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const processImage = async () => {
    try {
      // Get image data from localStorage
      const imageData = localStorage.getItem('selectedImage');
      const imageUrl = localStorage.getItem('selectedImageUrl');
      
      if (!imageData || !imageUrl) {
        navigate('/');
        return;
      }

      // Start the processing animation
      await simulateProcessing();

      // Fetch the actual image blob from the URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], JSON.parse(imageData).name, { type: JSON.parse(imageData).type });

      const formData = new FormData();
      formData.append('image', file);

      // POST to backend, will include floorplan_scene_final.glb in zip output
      const backendResponse = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) {
        throw new Error('Backend processing failed');
      }

      // Get ZIP blob and store it
      const zipBlob = await backendResponse.blob();
      const zipUrl = URL.createObjectURL(zipBlob);
      localStorage.setItem('resultsZipUrl', zipUrl);

      // Navigate to results page
      navigate('/results');

      toast({
        title: "Processing Complete",
        description: "Floorplan analysis finished successfully.",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "An error occurred during processing",
        variant: "destructive",
      });
      
      // Navigate back to upload page on error
      setTimeout(() => navigate('/'), 2000);
    }
  };

  useEffect(() => {
    // Check if we have an image to process
    const imageData = localStorage.getItem('selectedImage');
    if (!imageData) {
      navigate('/');
      return;
    }

    // Start processing
    processImage();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen matrix-lines">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cpu className="w-12 h-12 text-primary neon-glow animate-pulse" />
            <h1 className="text-4xl font-bold neon-text">
              Processing Your Floorplan
            </h1>
            <Zap className="w-8 h-8 text-neon-green neon-glow animate-bounce" />
          </div>
          <p className="text-xl text-muted-foreground">
            Please wait while we analyze your image...
          </p>
        </div>

        {/* Processing Animation */}
        <div className="max-w-md mx-auto">
          <ProcessingAnimation
            isProcessing={true}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
