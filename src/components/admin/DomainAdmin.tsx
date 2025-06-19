import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Layout, ArrowLeft } from 'lucide-react';
import DomainForm from '@/components/DomainForm';
import ModuleManager from '@/components/admin/ModuleManager';
import { useToast } from '@/hooks/use-toast';
import { getIconComponent } from '@/components/admin/moduleManager/moduleData';
import { DeleteButton } from '@/components/ui/delete-button';
import { StatusBadge } from '@/components/ui/status-badge';

interface DomainAdminProps {
  onModuleSelect?: (module: any) => void;
}

const DomainAdmin: React.FC<DomainAdminProps> = ({ onModuleSelect }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [selectedDomainForModules, setSelectedDomainForModules] = useState(null);
  const { toast } = useToast();

  // Fetch domains from the domains table
  const { data: domains = [], isLoading, refetch, error: queryError } = useQuery({
    queryKey: ['admin-domains'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('domains')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching domains:', error);
          // If domains table doesn't exist, return empty array
          if (error.code === '42P01') {
            console.warn('Domains table does not exist. Please run the migration.');
            return [];
          }
          throw error;
        }
        console.log('Fetched domains:', data);
        return data || [];
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
  });

  const handleEdit = (domain: any) => {
    setEditingDomain(domain);
    setIsFormOpen(true);
  };

  const handleDelete = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain? This will also delete all its modules and cannot be undone.')) {
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Domain and all related modules deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain",
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
    // Ensure domain has required properties
    if (domain && domain.id && domain.name) {
      setSelectedDomainForModules(domain);
    } else {
      toast({
        title: "Error",
        description: "Invalid domain data. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading domains...</div>;
  }

  if (queryError) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading domains</p>
          <p className="text-sm text-gray-500 mb-4">
            {queryError.message || 'Please ensure the database migration has been applied.'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
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
          selectedDomain={selectedDomainForModules}
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
          <h3 className="text-2xl font-bold text-gray-900">Domain Management</h3>
          <p className="text-gray-600">Manage parent domains for the platform</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Domain</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain: any) => {
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
                      <StatusBadge isActive={domain.is_active} />
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
                    <DeleteButton
                      variant="ghost"
                      onClick={() => handleDelete(domain.id)}
                    />
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
                  Manage Modules
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {domains.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No domains available.</p>
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

export default DomainAdmin;
