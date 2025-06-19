
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useModuleMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create module mutation
  const createModule = useMutation({
    mutationFn: async (moduleData: any) => {
      console.log('Creating module with data:', moduleData);

      // Validate required fields
      if (!moduleData.domain_id) {
        throw new Error('domain_id is required');
      }
      if (!moduleData.name) {
        throw new Error('name is required');
      }

      // Ensure we don't send the old 'domain' field
      const { domain, ...cleanData } = moduleData;
      console.log('Clean module data:', cleanData);

      const { error } = await (supabase as any)
        .from('modules')
        .insert([cleanData]);

      if (error) {
        console.error('Module creation error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({ title: 'Module created successfully!' });
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
      console.log('Updating module with data:', { id, ...moduleData });

      // Ensure we don't send the old 'domain' field
      const { domain, ...cleanData } = moduleData;
      console.log('Clean update data:', cleanData);

      const { error } = await (supabase as any)
        .from('modules')
        .update(cleanData)
        .eq('id', id);

      if (error) {
        console.error('Module update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast({ title: 'Module updated successfully!' });
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
      console.error('Module deletion error:', error);

      let errorMessage = error.message;
      let errorDescription = '';

      // Handle specific foreign key constraint errors
      if (error.message?.includes('foreign key constraint') || error.code === '23503') {
        errorMessage = 'Cannot delete module';
        errorDescription = 'This module has associated data (questions, assessments, or configurations) that must be deleted first, or the database constraints need to be updated to allow cascade deletion.';
      } else if (error.message?.includes('assessment_configs_module_id_fkey')) {
        errorMessage = 'Cannot delete module';
        errorDescription = 'This module has an assessment configuration. The database needs to be updated to allow automatic deletion of related data.';
      }

      toast({
        title: errorMessage,
        description: errorDescription || error.message,
        variant: 'destructive'
      });
    },
  });

  return { createModule, updateModule, deleteModule };
};
