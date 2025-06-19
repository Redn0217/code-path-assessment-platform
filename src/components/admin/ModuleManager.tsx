
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ModuleCard from './moduleManager/ModuleCard';
import ModuleForm from './moduleManager/ModuleForm';
import { useModuleMutations } from './moduleManager/useModuleMutations';
import { useToast } from '@/hooks/use-toast';
import { Module, Domain } from '@/types/module';

interface ModuleManagerProps {
  selectedDomain: any; // Now expects domain object instead of string
  onModuleSelect?: (module: any) => void;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ selectedDomain, onModuleSelect }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const { toast } = useToast();

  // Safety check for selectedDomain
  if (!selectedDomain || !selectedDomain.id) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">No domain selected</p>
          <p className="text-sm text-gray-500 mt-2">Please select a domain to manage its modules.</p>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain_id: selectedDomain?.id,
    icon: 'card',
    color: 'bg-blue-500',
    is_active: true,
    order_index: 0
  });

  const { createModule, updateModule, deleteModule } = useModuleMutations();

  // Fetch modules for the selected domain
  const { data: modules = [], isLoading, error } = useQuery({
    queryKey: ['modules', selectedDomain?.id],
    queryFn: async () => {
      if (!selectedDomain?.id) return [];

      const { data, error } = await (supabase as any)
        .from('modules')
        .select(`
          *,
          domains!inner(
            id,
            name,
            domain_key
          )
        `)
        .eq('domain_id', selectedDomain.id)
        .order('order_index', { ascending: true });

      if (error) throw error;

      // Transform the data to include domain name directly on the module object
      const transformedData = data?.map(module => ({
        ...module,
        domain: module.domains?.domain_key || module.domains?.name
      })) || [];

      return transformedData;
    },
    enabled: !!selectedDomain?.id,
  });

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <p className="text-red-600">Error loading modules: {error.message}</p>
          <p className="text-sm text-gray-500 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      domain_id: selectedDomain?.id,
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
      domain_id: module.domain_id || selectedDomain?.id,
      icon: module.icon,
      color: module.color,
      is_active: module.is_active,
      order_index: module.order_index
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submission - formData:', formData);
    console.log('Selected domain:', selectedDomain);

    // Validate required fields
    if (!formData.domain_id) {
      toast({
        title: "Error",
        description: "Domain ID is required. Please select a domain.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name?.trim()) {
      toast({
        title: "Error",
        description: "Module name is required.",
        variant: "destructive",
      });
      return;
    }

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

  const handleModuleClick = (module: Module) => {
    if (onModuleSelect) {
      onModuleSelect(module);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module: Module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onModuleClick={handleModuleClick}
          />
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No modules found for {selectedDomain?.name || 'this domain'}.</p>
            <p className="text-sm text-gray-400 mt-2">Create your first module to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModuleManager;
