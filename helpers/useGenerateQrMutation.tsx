import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QR_QUERY_KEY } from './useQrCodeQuery';
import { toast } from 'sonner';

export const useGenerateQrMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate a new mock QR code
      const newCode = `fiesta-piamontesa-user1-${Math.random().toString(36).substring(2, 15)}`;
      const expiresAt = new Date(Date.now() + 60 * 1000).toISOString(); // 60 seconds from now
      
      return {
        code: newCode,
        expiresAt: new Date(expiresAt), // Convert ISO string to Date object
      };
    },
    onSuccess: (data) => {
      // Update the query cache with the new QR code data
      queryClient.setQueryData(QR_QUERY_KEY, data);
      toast.success('Nuevo código QR generado');
    },
    onError: (error) => {
      console.error('Error generating new QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo generar un nuevo código QR.';
      toast.error(errorMessage);
    },
  });
};