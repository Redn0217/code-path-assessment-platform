
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { getIconComponent } from '@/components/admin/moduleManager/moduleData';

const PracticeHub = () => {
  const navigate = useNavigate();

  // Fetch domains (modules)
  const { data: domains = [], isLoading } = useQuery({
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading domains...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Practice Domains</h3>
        <p className="text-gray-600">Choose a domain to practice and improve your skills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => {
          const IconComponent = getIconComponent(domain.icon);
          return (
            <Card key={domain.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${domain.color || 'bg-blue-500'}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                <div>
                  <CardTitle className="text-lg">{domain.name}</CardTitle>
                  <Badge variant="secondary">Practice</Badge>
                </div>
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
          );
        })}
      </div>

      {domains.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No practice domains available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticeHub;
