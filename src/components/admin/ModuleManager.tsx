
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const domains = [
  { id: 'python', name: 'Python' },
  { id: 'devops', name: 'DevOps' },
  { id: 'cloud', name: 'Cloud Computing' },
  { id: 'linux', name: 'Linux' },
  { id: 'networking', name: 'Networking' },
  { id: 'storage', name: 'Storage' },
  { id: 'virtualization', name: 'Virtualization' },
  { id: 'object-storage', name: 'Object Storage' },
  { id: 'ai-ml', name: 'AI & ML' },
  { id: 'data-security', name: 'Data Security' },
  { id: 'data-science', name: 'Data Science' }
];

const icons = [
  { value: 'card', label: 'Card' },
  { value: 'layout-grid', label: 'Grid' },
  { value: 'layout-list', label: 'List' },
  { value: 'edit', label: 'Edit' },
  { value: 'code', label: 'Code' },
  { value: 'database', label: 'Database' },
  { value: 'server', label: 'Server' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'shield', label: 'Shield' },
  { value: 'bar-chart', label: 'Chart' }
];

const colors = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-orange-500', label: 'Orange' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-pink-500', label: 'Pink' },
  { value: 'bg-indigo-500', label: 'Indigo' },
  { value: 'bg-emerald-500', label: 'Emerald' },
  { value: 'bg-violet-500', label: 'Violet' }
];

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  // Create module mutation
  const createModule = useMutation({
    mutationFn: async (moduleData: any) => {
      const { error } = await supabase
        .from('modules')
        .insert([moduleData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({ title: 'Module created successfully!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating module',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Update module mutation
  const updateModule = useMutation({
    mutationFn: async ({ id, ...moduleData }: any) => {
      const { error } = await supabase
        .from('modules')
        .update(moduleData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({ title: 'Module updated successfully!' });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating module',
        description: error.message,
        variant: 'destructive'
      });
    },
  });

  // Delete module mutation
  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({ title: 'Module deleted successfully!' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting module',
        description: error.message,
        variant: 'destructive'
      });
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
      updateModule.mutate({ id: editingModule.id, ...formData });
    } else {
      createModule.mutate(formData);
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
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Module name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Module description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Select
                    value={formData.domain}
                    onValueChange={(value) => setFormData({ ...formData, domain: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(value) => setFormData({ ...formData, icon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {icons.map((icon) => (
                          <SelectItem key={icon.value} value={icon.value}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) => setFormData({ ...formData, color: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

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
        <div className="flex items-center space-x-4">
          <Label>Filter by Domain:</Label>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
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
                      onClick={() => handleEdit(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(module.id)}
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
