
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Settings } from 'lucide-react';
import { getIconComponent } from './moduleData';
import { Module } from '@/types/module';
import { DeleteButton } from '@/components/ui/delete-button';
import { StatusBadge } from '@/components/ui/status-badge';

interface ModuleCardProps {
  module: Module;
  onEdit: (module: Module) => void;
  onDelete: (id: string) => void;
  onModuleClick?: (module: Module) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onEdit, onDelete, onModuleClick }) => {
  const IconComponent = getIconComponent(module.icon);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${module.color}`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <StatusBadge isActive={module.is_active} className="mt-1" />
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(module)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <DeleteButton
              variant="ghost"
              onClick={() => onDelete(module.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">
          {module.description || 'No description'}
        </p>
        {onModuleClick && (
          <Button 
            onClick={() => onModuleClick(module)}
            className="w-full"
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Questions
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
