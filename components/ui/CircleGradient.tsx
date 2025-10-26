import { cn } from '@/lib/utils';

interface CircleGradientProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

export function CircleGradient({
  size = 'md',
  position = 'top-right',
  opacity = 0.3,
  blur = 'xl',
  animate = false,
  className,
}: CircleGradientProps) {
  const sizes = {
    sm: 'w-[200px] h-[200px]',
    md: 'w-[400px] h-[400px]',
    lg: 'w-[600px] h-[600px]',
    xl: 'w-[800px] h-[800px]',
  };

  const positions = {
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const blurs = {
    sm: 'blur-md',
    md: 'blur-2xl',
    lg: 'blur-3xl',
    xl: 'blur-[100px]',
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        sizes[size],
        positions[position],
        blurs[blur],
        animate && 'animate-pulse',
        className
      )}
      style={{ opacity }}
    >
      <div
        className="w-full h-full rounded-full"
        style={{ background: 'var(--gradient-primary)' }}
      />
    </div>
  );
}
