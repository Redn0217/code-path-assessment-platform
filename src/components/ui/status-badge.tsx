import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isActive: boolean;
  className?: string;
  activeText?: string;
  inactiveText?: string;
}

/**
 * Consistent status badge component for Active/Inactive states
 * 
 * Uses consistent styling:
 * - Active: secondary variant (gray background)
 * - Inactive: destructive variant (red background)
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  className,
  activeText = 'Active',
  inactiveText = 'Inactive',
}) => {
  return (
    <Badge 
      variant={isActive ? "secondary" : "destructive"} 
      className={cn(className)}
    >
      {isActive ? activeText : inactiveText}
    </Badge>
  );
};
