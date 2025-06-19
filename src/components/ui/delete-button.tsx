import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteButtonProps {
  onClick: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'ghost' | 'outline' | 'destructive';
  className?: string;
  disabled?: boolean;
}

/**
 * Consistent delete button component with proper red hover styling
 * 
 * @param variant - 'ghost' for subtle buttons, 'outline' for bordered buttons, 'destructive' for prominent red buttons
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  size = 'sm',
  variant = 'ghost',
  className,
  disabled = false,
}) => {
  const getHoverClasses = () => {
    switch (variant) {
      case 'ghost':
        return 'hover:bg-red-50 hover:text-red-600';
      case 'outline':
        return 'hover:bg-red-50 hover:text-red-600 hover:border-red-300';
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white'; // Already red, just darker on hover
      default:
        return 'hover:bg-red-50 hover:text-red-600';
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(getHoverClasses(), className)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};
