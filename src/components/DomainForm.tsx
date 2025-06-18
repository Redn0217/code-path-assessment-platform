
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { icons } from '@/components/admin/moduleManager/moduleData';

const domains = [
  'python', 'devops', 'cloud', 'linux', 'networking', 
  'storage', 'virtualization', 'object-storage', 'ai-ml', 
  'data-security', 'data-science'
];

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-sky-500', 'bg-orange-500',
  'bg-purple-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500',
  'bg-red-500', 'bg-emerald-500', 'bg-violet-500'
];

interface DomainFormProps {
  domain?: any;
  onClose: () => void;
}

const DomainForm: React.FC<DomainFormProps> = ({ domain, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    domain: '',
    color: 'bg-blue-500',
    icon: 'card',
    is_active: true,
    order_index: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (domain) {
      setFormData({
        name: domain.name || '',
        description: domain.description || '',
        domain: domain.domain || '',
        color: domain.color || 'bg-blue-500',
        icon: domain.icon || 'card',
        is_active: domain.is_active ?? true,
        order_index: domain.order_index || 0
      });
    }
  }, [domain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const dataToSubmit = {
        ...formData,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (domain) {
        // Update existing domain
        const { error } = await supabase
          .from('modules')
          .update(dataToSubmit)
          .eq('id', domain.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Domain updated successfully",
        });
      } else {
        // Create new domain
        const { error } = await supabase
          .from('modules')
          .insert(dataToSubmit);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Domain created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving domain:', error);
      toast({
        title: "Error",
        description: "Failed to save domain",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{domain ? 'Edit Domain' : 'Add Domain'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="domain">Domain ID</Label>
            <Select value={formData.domain} onValueChange={(value) => setFormData({ ...formData, domain: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domainId) => (
                  <SelectItem key={domainId} value={domainId}>
                    {domainId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map((icon) => {
                    const IconComponent = icon.component;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{icon.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded ${color}`}></div>
                        <span>{color}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="order_index">Order</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (domain ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DomainForm;
