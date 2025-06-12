
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DomainForm from '@/components/DomainForm';
import { useToast } from '@/hooks/use-toast';

const PracticeHub = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is admin
  const { data: adminStatus } = useQuery({
    queryKey: ['admin-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) return false;
      setIsAdmin(true);
      return true;
    },
  });

  // Fetch domains (modules)
  const { data: domains = [], isLoading, refetch } = useQuery({
    queryKey: ['practice-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleDomainClick = (domain: any) => {
    navigate(`/assessment/${domain.domain}`);
  };

  const handleEdit = (domain: any) => {
    setEditingDomain(domain);
    setIsFormOpen(true);
  };

  const handleDelete = async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading domains...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Practice Domains</h3>
          <p className="text-gray-600">Choose a domain to practice and improve your skills</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Domain</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <Card key={domain.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${domain.color || 'bg-blue-500'}`}>
                    <div className="h-6 w-6 bg-white rounded"></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                    <Badge variant="secondary">Practice</Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(domain)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {domain.description || 'No description available'}
              </p>
              <Button 
                className="w-full" 
                onClick={() => handleDomainClick(domain)}
              >
                Start Practice
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {domains.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No practice domains available.</p>
            {isAdmin && (
              <p className="text-sm text-gray-400 mt-2">Add some domains to get started.</p>
            )}
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

export default PracticeHub;
