
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Layout, ArrowLeft } from 'lucide-react';
import DomainForm from '@/components/DomainForm';
import ModuleManager from '@/components/admin/ModuleManager';
import { useToast } from '@/hooks/use-toast';
import { getIconComponent } from '@/components/admin/moduleManager/moduleData';

// Define Domain type for this component
interface Domain {
  id: string;
  name: string;
  description?: string;
  domain_key: string;
  icon: string;
  color: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

interface PracticeHubAdminProps {
  onModuleSelect?: (module: any) => void;
}

const PracticeHubAdmin: React.FC<PracticeHubAdminProps> = ({ onModuleSelect }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [selectedDomainForModules, setSelectedDomainForModules] = useState(null);
  const { toast } = useToast();

  // Fetch domains from the domains table
  const { data: domains = [], isLoading, refetch } = useQuery<Domain[]>({
    queryKey: ['admin-practice-domains'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('domains')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as Domain[];
    },
  });

  const handleEdit = (domain: any) => {
    setEditingDomain(domain);
    setIsFormOpen(true);
  };

  const handleDelete = async (domainId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingDomain(null);
    refetch();
  };

  const handleViewModules = (domain: any) => {
    setSelectedDomainForModules(domain);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading domains...</div>;
  }

  // If viewing modules for a specific domain
  if (selectedDomainForModules) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedDomainForModules(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Domains
          </Button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Modules in {selectedDomainForModules.name}
            </h3>
            <p className="text-gray-600">Manage modules for this domain</p>
          </div>
        </div>
        
        <ModuleManager 
          selectedDomain={selectedDomainForModules.domain}
          onModuleSelect={onModuleSelect}
        />
      </div>
    );
  }

  // Default domain management view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Practice Domains Management</h3>
          <p className="text-gray-600">Manage practice domains for the platform</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Domain</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain: Domain) => {
          const IconComponent = getIconComponent(domain.icon);
          return (
            <Card key={domain.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${domain.color || 'bg-blue-500'}`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  <div>
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                    <Badge variant={domain.is_active ? "secondary" : "destructive"}>
                      {domain.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(domain)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(domain.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Domain Key:</strong> {domain.domain_key}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Order:</strong> {domain.order_index}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {domain.description || 'No description available'}
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleViewModules(domain)}
              >
                <Layout className="h-4 w-4 mr-2" />
                All Modules
              </Button>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {domains.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No practice domains available.</p>
            <p className="text-sm text-gray-400 mt-2">Add some domains to get started.</p>
          </CardContent>
        </Card>
      )}

      {isFormOpen && (
        <DomainForm
          domain={editingDomain}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default PracticeHubAdmin;
