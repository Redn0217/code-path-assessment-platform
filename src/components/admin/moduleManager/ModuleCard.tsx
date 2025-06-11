
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

interface ModuleCardProps {
  module: Module;
  onEdit: (module: Module) => void;
  onDelete: (id: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onEdit, onDelete }) => {
  return (
    <Card key={module.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${module.color}`}>
              <div className="h-4 w-4 bg-white rounded"></div>
            </div>
            <div>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <Badge variant={module.is_active ? "default" : "secondary"}>
                {module.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(module)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(module.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">
          {module.description || 'No description'}
        </p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Order: {module.order_index}</span>
          <span>Domain: {module.domain}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
