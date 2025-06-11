
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ModuleCard from './moduleManager/ModuleCard';
import ModuleForm from './moduleManager/ModuleForm';
import DomainFilter from './moduleManager/DomainFilter';
import { useModuleMutations } from './moduleManager/useModuleMutations';

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

const ModuleManager = () => {
  const [selectedDomain, setSelectedDomain] = useState('python');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: 'python',
    icon: 'card',
    color: 'bg-blue-500',
    is_active: true,
    order_index: 0
  });

  const { createModule, updateModule, deleteModule } = useModuleMutations();

  // Fetch modules
  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['modules', selectedDomain],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('domain', selectedDomain)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      domain: selectedDomain,
      icon: 'card',
      color: 'bg-blue-500',
      is_active: true,
      order_index: modules.length
    });
    setEditingModule(null);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description || '',
      domain: module.domain,
      icon: module.icon,
      color: module.color,
      is_active: module.is_active,
      order_index: module.order_index
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingModule) {
      updateModule.mutate({ id: editingModule.id, ...formData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createModule.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this module?')) {
      deleteModule.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading modules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Module Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingModule ? 'Edit Module' : 'Create New Module'}
                </DialogTitle>
                <DialogDescription>
                  {editingModule ? 'Update the module details.' : 'Add a new module to the selected domain.'}
                </DialogDescription>
              </DialogHeader>
              
              <ModuleForm formData={formData} setFormData={setFormData} />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
                  {editingModule ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <DomainFilter selectedDomain={selectedDomain} onDomainChange={setSelectedDomain} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {modules.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No modules found for {selectedDomain}.</p>
              <p className="text-sm text-gray-400 mt-2">Create your first module to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModuleManager;
