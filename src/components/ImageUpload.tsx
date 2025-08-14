import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, selectedImage, disabled }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => 
      file.type === 'image/jpeg' || file.type === 'image/png'
    );
    
    if (imageFile) {
      onImageSelect(imageFile);
    }
  }, [onImageSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <Card className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon className="w-6 h-6 text-neon-pink neon-glow" />
        <h2 className="text-xl font-bold neon-text">Image Upload</h2>
      </div>

      {!selectedImage ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
            ${dragOver 
              ? 'border-primary bg-primary/10 pulse-glow' 
              : 'border-border hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Drag & Drop your floorplan image here
          </p>
          <p className="text-muted-foreground mb-4">
            or click to select a file
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPEG and PNG formats
          </p>
          
          {dragOver && (
            <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
              <p className="text-lg font-bold text-primary">Drop image here!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative group">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected floorplan"
              className="w-full h-48 object-cover rounded-lg neon-border"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onImageSelect(null as any)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">{selectedImage.name}</p>
            <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      )}
    </Card>
  );
}