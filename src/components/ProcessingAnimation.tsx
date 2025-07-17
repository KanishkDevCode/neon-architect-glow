import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Scan, 
  Scissors, 
  Zap, 
  Box,
  CheckCircle,
  Loader
} from 'lucide-react';

interface ProcessingAnimationProps {
  isProcessing: boolean;
  currentStep: number;
}

const steps = [
  { id: 1, label: 'Analyzing Image', icon: Scan, color: 'text-neon-blue' },
  { id: 2, label: 'Segmenting Floorplan', icon: Scissors, color: 'text-neon-green' },
  { id: 3, label: 'Vectorizing Layout', icon: Zap, color: 'text-neon-pink' },
  { id: 4, label: 'Generating 3D Model', icon: Box, color: 'text-neon-purple' },
];

export function ProcessingAnimation({ isProcessing, currentStep }: ProcessingAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      setProgress((currentStep / steps.length) * 100);
    } else {
      setProgress(0);
    }
  }, [currentStep, isProcessing]);

  if (!isProcessing) return null;

  return (
    <Card className="cyber-card p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold neon-text mb-2">Processing Floorplan</h3>
          <Progress value={progress} className="w-full h-2" />
        </div>

        <div className="grid gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-4 p-4 rounded-lg transition-all duration-500
                  ${isActive 
                    ? 'bg-primary/10 neon-border border-primary/50 pulse-glow' 
                    : isCompleted
                    ? 'bg-neon-green/10 border border-neon-green/30'
                    : 'bg-muted/30 border border-border/30'
                  }
                `}
              >
                <div className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  ${isActive 
                    ? 'bg-primary/20 border border-primary animate-spin-glow' 
                    : isCompleted
                    ? 'bg-neon-green/20 border border-neon-green'
                    : 'bg-muted/50 border border-border'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-neon-green" />
                  ) : isActive ? (
                    <Loader className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <Icon className={`w-6 h-6 ${step.color}`} />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={`
                    font-medium transition-colors
                    ${isActive 
                      ? 'text-primary neon-text' 
                      : isCompleted
                      ? 'text-neon-green'
                      : 'text-muted-foreground'
                    }
                  `}>
                    {step.label}
                  </p>
                  {isActive && (
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}