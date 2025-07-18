import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sliders } from 'lucide-react';

interface ThresholdPanelProps {
  onApplyThresholds: (thresholds: Record<string, number>) => void;
  isVisible: boolean;
  isLoading?: boolean;
}

const thresholdClasses = [
  { key: 'bedroom', label: 'Bedroom', color: 'text-neon-blue' },
  { key: 'dining_room', label: 'Dining Room', color: 'text-neon-green' },
  { key: 'kitchen', label: 'Kitchen', color: 'text-neon-pink' },
  { key: 'living_room', label: 'Living Room', color: 'text-neon-purple' },
  { key: 'toilet', label: 'Toilet', color: 'text-neon-cyan' },
  { key: 'bed', label: 'Bed', color: 'text-neon-blue' },
  { key: 'sofa', label: 'Sofa', color: 'text-neon-green' },
  { key: 'wardrobe', label: 'Wardrobe', color: 'text-neon-pink' },
  { key: 'commode', label: 'Commode', color: 'text-neon-purple' },
  { key: 'door', label: 'Door', color: 'text-neon-cyan' },
  { key: 'wall', label: 'Wall', color: 'text-neon-blue' },
];

export function ThresholdPanel({ onApplyThresholds, isVisible, isLoading }: ThresholdPanelProps) {
  const [thresholds, setThresholds] = useState<Record<string, number>>(
    thresholdClasses.reduce((acc, cls) => ({ ...acc, [cls.key]: 0.5 }), {})
  );

  const updateThreshold = (key: string, value: number) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyThresholds(thresholds);
  };

  if (!isVisible) return null;

  return (
    <Card className="cyber-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sliders className="w-6 h-6 text-neon-purple neon-glow" />
        <h2 className="text-xl font-bold neon-text">Threshold Adjustment</h2>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
          {thresholdClasses.map((cls) => (
            <div key={cls.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`font-medium ${cls.color}`}>
                  {cls.label}
                </label>
                <span className="text-sm bg-muted/50 px-2 py-1 rounded neon-border">
                  {thresholds[cls.key].toFixed(2)}
                </span>
              </div>
              
              <div className="relative">
                <Slider
                  value={[thresholds[cls.key]]}
                  onValueChange={(value) => updateThreshold(cls.key, value[0])}
                  max={1}
                  min={0}
                  step={0.01}
                  className="neon-slider"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="h-full bg-primary/20 rounded-full"
                    style={{ width: `${thresholds[cls.key] * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleApply}
          disabled={isLoading}
          className="w-full bg-primary/40 hover:bg-primary/60 text-primary-foreground neon-border pulse-glow font-bold"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Applying Thresholds...
            </>
          ) : (
            'Apply Thresholds'
          )}
        </Button>
      </div>
    </Card>
  );
}