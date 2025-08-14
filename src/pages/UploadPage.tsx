import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, Play } from 'lucide-react';

export default function UploadPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleStartProcessing = () => {
    if (selectedImage) {
      // Store the image in localStorage or pass it through navigation state
      const imageData = {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type,
        lastModified: selectedImage.lastModified,
      };
      localStorage.setItem('selectedImage', JSON.stringify(imageData));
      
      // Create a URL for the image and store it
      const imageUrl = URL.createObjectURL(selectedImage);
      localStorage.setItem('selectedImageUrl', imageUrl);
      
      navigate('/processing');
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

        {/* Upload Section */}
        <div className="max-w-md mx-auto space-y-6">
          <ImageUpload
            onImageSelect={setSelectedImage}
            selectedImage={selectedImage}
          />
          
          {selectedImage && (
            <Button
              onClick={handleStartProcessing}
              className="w-full futuristic-btn h-12 text-lg font-bold text-primary-foreground"
            >
              <Play className="w-5 h-5 mr-2 floating-element" />
              Start Processing
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}